import { forwardRef, type ChangeEvent, useRef } from 'react'
import { Upload } from 'lucide-react'
import { cn } from '../../../lib/forms/cn'
import Field from './Field'

type FileInputProps = {
  id: string
  label?: string
  hint?: string
  error?: string
  required?: boolean
  accept?: string[]
  maxSizeMB?: number
  value?: File | null
  onChange: (file: File | null) => void
  onBlur?: () => void
  className?: string
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
    className,
  },
  ref,
) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    onChange(file)
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
        accept={accept?.join(',')}
        aria-invalid={error ? true : undefined}
        onChange={handleChange}
        onBlur={onBlur}
        className="sr-only"
      />
      <label
        htmlFor={id}
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed',
          'px-4 py-6 sm:py-8 cursor-pointer transition-colors text-center',
          'hover:border-primary/50 hover:bg-primary/5',
          error
            ? 'border-error/50 bg-error/5'
            : value
              ? 'border-primary/40 bg-primary/5'
              : 'border-border bg-surface/40',
        )}
      >
        <div className={cn(
          'flex h-11 w-11 items-center justify-center rounded-full',
          value ? 'bg-primary/15 text-primary' : 'bg-surface text-text-secondary',
        )}>
          <Upload size={20} />
        </div>
        {value ? (
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
