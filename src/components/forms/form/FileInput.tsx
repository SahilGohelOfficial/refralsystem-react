import { forwardRef, type ChangeEvent, useEffect, useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { cn } from '../../../lib/forms/cn'
import {
  isImageFile,
  prepareImageForUpload,
  withHeicAccept,
} from '../../../lib/images/prepareImageForUpload'
import Field from './Field'
import type { StoredFileAnswer } from '../../../types/form'

type FileInputProps = {
  id: string
  label?: string
  hint?: string
  error?: string
  required?: boolean
  accept?: string[]
  maxSizeMB?: number
  value?: File | StoredFileAnswer | null
  onChange: (file: File | null) => void
  onBlur?: () => void
  onPreparingChange?: (preparing: boolean) => void
  className?: string
}

function ensureFile(file: File): File {
  if (file instanceof File) return file
  const blob = file as unknown as Blob
  const name =
    typeof (file as { name?: string }).name === 'string'
      ? (file as { name: string }).name
      : 'upload'
  const type = blob.type || 'application/octet-stream'
  return new File([blob], name, { type, lastModified: Date.now() })
}

const FileInput = forwardRef<HTMLInputElement, FileInputProps>(function FileInput(
  {
    id,
    label,
    hint,
    error,
    required,
    accept,
    maxSizeMB,
    value,
    onChange,
    onBlur,
    onPreparingChange,
    className,
  },
  ref,
) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [preparing, setPreparing] = useState(false)
  const resolvedAccept = withHeicAccept(accept)
  const prepareGenRef = useRef(0)

  useEffect(() => {
    onPreparingChange?.(preparing)
  }, [preparing, onPreparingChange])

  useEffect(() => {
    return () => {
      onPreparingChange?.(false)
    }
  }, [onPreparingChange])

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    if (!file) {
      prepareGenRef.current += 1
      setPreparing(false)
      onChange(null)
      return
    }

    // Set the original file immediately so required validation never sees empty mid-process.
    const original = ensureFile(file)
    onChange(original)

    if (!isImageFile(original)) {
      setPreparing(false)
      return
    }

    const gen = ++prepareGenRef.current
    setPreparing(true)
    try {
      const prepared = ensureFile(await prepareImageForUpload(original))
      // Ignore stale async results if the user picked another file.
      if (gen !== prepareGenRef.current) return
      onChange(prepared)
    } catch {
      if (gen !== prepareGenRef.current) return
      // Keep the original file so the field stays valid.
      onChange(original)
    } finally {
      if (gen === prepareGenRef.current) {
        setPreparing(false)
      }
    }
  }

  const setRefs = (node: HTMLInputElement | null) => {
    inputRef.current = node
    if (typeof ref === 'function') ref(node)
    else if (ref) ref.current = node
  }

  const input = (
    <div className={className}>
      <input
        ref={setRefs}
        type="file"
        id={id}
        required={required && !value}
        accept={resolvedAccept?.join(',')}
        aria-invalid={error ? true : undefined}
        onChange={(e) => void handleChange(e)}
        onBlur={onBlur}
        className="sr-only"
        disabled={preparing}
      />
      <label
        htmlFor={id}
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed',
          'px-4 py-6 sm:py-8 cursor-pointer transition-colors text-center',
          'hover:border-primary/50 hover:bg-primary/5',
          preparing && 'pointer-events-none opacity-70',
          error
            ? 'border-error/50 bg-error/5'
            : value
              ? 'border-primary/40 bg-primary/5'
              : 'border-border bg-surface/40',
        )}
      >
        <div className={cn(
          'flex h-11 w-11 items-center justify-center rounded-full',
          value || preparing ? 'bg-primary/15 text-primary' : 'bg-surface text-text-secondary',
        )}>
          {preparing ? (
            <div className="h-5 w-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          ) : (
            <Upload size={20} />
          )}
        </div>
        {preparing ? (
          <>
            <span className="text-sm font-medium text-text">Preparing image…</span>
            {value && 'name' in value ? (
              <span className="text-xs text-text-secondary break-all max-w-full px-2">
                {value.name}
              </span>
            ) : null}
          </>
        ) : value ? (
          <>
            <span className="text-sm font-medium text-text break-all max-w-full px-2">
              {value.name}
            </span>
            <span className="text-xs text-text-secondary">
              {(value.size / 1024).toFixed(1)} KB · Tap to replace
            </span>
          </>
        ) : (
          <>
            <span className="text-sm font-medium text-text">
              Tap to upload a file
            </span>
            <span className="text-xs text-text-secondary max-w-[220px]">
              {accept?.length
                ? `Accepted: ${accept.map((t) => t.split('/')[1] ?? t).join(', ')}`
                : 'Any file type'}
              {maxSizeMB !== undefined ? ` · Max ${maxSizeMB}MB` : ''}
            </span>
          </>
        )}
      </label>
    </div>
  )

  if (!label && !hint && !error) {
    return input
  }

  return (
    <Field
      label={label}
      htmlFor={id}
      hint={hint}
      error={error}
      required={required}
    >
      {input}
    </Field>
  )
})

export default FileInput
