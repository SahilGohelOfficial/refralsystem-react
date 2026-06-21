import type { FormField, FieldValidation } from '../../../types/form'
import { FIELD_TYPES_WITH_OPTIONS, FIELD_TYPE_LABELS } from '../../../types/form'

type FieldPropertiesPanelProps = {
  field: FormField | null
  labelError?: string | null
  onUpdate: (patch: Partial<FormField>) => void
  onUpdateValidation: (patch: Partial<FieldValidation>) => void
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1 block text-xs font-medium text-text-secondary">
      {children}
    </label>
  )
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  error,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  error?: string | null
}) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        className={`w-full rounded-lg border bg-surface px-2.5 py-1.5 text-sm text-text outline-none focus:ring-1 ${
          error
            ? 'border-error focus:border-error focus:ring-error/20'
            : 'border-border focus:border-primary focus:ring-primary/20'
        }`}
      />
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  )
}

function NumberInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: number | undefined
  onChange: (value: number | undefined) => void
  placeholder?: string
}) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        type="number"
        value={value ?? ''}
        onChange={(e) =>
          onChange(e.target.value ? Number(e.target.value) : undefined)
        }
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-surface px-2.5 py-1.5 text-sm text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
      />
    </div>
  )
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-text">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 rounded border-border text-primary focus:ring-primary/20"
      />
      {label}
    </label>
  )
}

export default function FieldPropertiesPanel({
  field,
  labelError,
  onUpdate,
  onUpdateValidation,
}: FieldPropertiesPanelProps) {
  if (!field) {
    return (
      <p className="text-sm text-text-secondary">
        Select a field to edit its properties.
      </p>
    )
  }

  const validation = field.validation ?? {}
  const hasPlaceholder =
    field.type === 'text' ||
    field.type === 'textarea' ||
    field.type === 'dropdown' ||
    field.type === 'multi_dropdown'
  const hasTextValidation = field.type === 'text' || field.type === 'textarea'
  const hasFileValidation = field.type === 'file'
  const hasOptions = FIELD_TYPES_WITH_OPTIONS.includes(field.type)

  const updateOption = (index: number, value: string) => {
    const options = [...(field.options ?? [])]
    options[index] = value
    onUpdate({ options })
  }

  const addOption = () => {
    onUpdate({ options: [...(field.options ?? []), `Option ${(field.options?.length ?? 0) + 1}`] })
  }

  const removeOption = (index: number) => {
    const options = (field.options ?? []).filter((_, i) => i !== index)
    onUpdate({ options })
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
          Properties
        </p>
        <p className="mt-0.5 text-sm text-text-secondary/70">
          {FIELD_TYPE_LABELS[field.type]}
        </p>
      </div>

      <TextInput
        label="Label"
        value={field.label}
        onChange={(label) => onUpdate({ label })}
        error={labelError}
      />

      {hasPlaceholder && (
        <TextInput
          label="Placeholder"
          value={field.placeholder ?? ''}
          onChange={(placeholder) => onUpdate({ placeholder })}
        />
      )}

      {hasOptions && (
        <div>
          <Label>Options</Label>
          <div className="flex flex-col gap-2">
            {(field.options ?? []).map((opt, index) => (
              <div key={index} className="flex gap-1">
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => updateOption(index, e.target.value)}
                  className="flex-1 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-sm text-text"
                />
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  className="rounded px-2 text-text-secondary hover:text-error"
                  aria-label="Remove option"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addOption}
              className="text-left text-xs text-primary hover:underline"
            >
              + Add option
            </button>
          </div>
        </div>
      )}

      <div className="border-t border-border pt-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-text-secondary">
          Validation
        </p>
        <div className="flex flex-col gap-3">
          <Toggle
            label="Required"
            checked={validation.required ?? false}
            onChange={(required) => onUpdateValidation({ required })}
          />

          <TextInput
            label="Custom error message"
            value={validation.errorMessage ?? ''}
            onChange={(errorMessage) =>
              onUpdateValidation({ errorMessage: errorMessage || undefined })
            }
            placeholder="Optional"
          />

          {hasTextValidation && (
            <>
              <NumberInput
                label="Min length"
                value={validation.minLength}
                onChange={(minLength) => onUpdateValidation({ minLength })}
              />
              <NumberInput
                label="Max length"
                value={validation.maxLength}
                onChange={(maxLength) => onUpdateValidation({ maxLength })}
              />
              <TextInput
                label="Pattern (regex)"
                value={validation.pattern ?? ''}
                onChange={(pattern) =>
                  onUpdateValidation({ pattern: pattern || undefined })
                }
                placeholder="^EMP-\d{4}$"
              />
            </>
          )}

          {hasFileValidation && (
            <>
              <TextInput
                label="Allowed file types (comma-separated MIME)"
                value={validation.allowedFileTypes?.join(', ') ?? ''}
                onChange={(raw) =>
                  onUpdateValidation({
                    allowedFileTypes: raw
                      ? raw.split(',').map((s) => s.trim())
                      : undefined,
                  })
                }
                placeholder="image/jpeg, image/png, application/pdf"
              />
              <NumberInput
                label="Max file size (MB)"
                value={validation.maxFileSizeMB}
                onChange={(maxFileSizeMB) =>
                  onUpdateValidation({ maxFileSizeMB })
                }
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
