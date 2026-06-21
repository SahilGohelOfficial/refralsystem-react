import { cn } from '../../../lib/forms/cn'
import Field from './Field'
import { optionClassName, optionGridClassName } from './styles'

type MultiSelectProps = {
  id: string
  label?: string
  placeholder?: string
  hint?: string
  error?: string
  required?: boolean
  options: string[]
  value: string[]
  onChange: (value: string[]) => void
  onBlur?: () => void
  className?: string
}

export default function MultiSelect({
  id,
  label,
  placeholder = 'Select one or more options',
  hint,
  error,
  required,
  options,
  value,
  onChange,
  onBlur,
  className,
}: MultiSelectProps) {
  const toggle = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option))
    } else {
      onChange([...value, option])
    }
  }

  const content = (
    <div className={cn(className)} onBlur={onBlur}>
      {options.length === 0 ? (
        <p className="text-xs text-text-secondary/70 py-2">No options configured</p>
      ) : (
        <>
          {placeholder && value.length === 0 && (
            <p className="mb-2 text-xs text-text-secondary/70">{placeholder}</p>
          )}
          <div className={optionGridClassName} role="group" aria-labelledby={`${id}-label`}>
            {options.map((option) => {
              const optionId = `${id}-${option}`
              const selected = value.includes(option)
              return (
                <label
                  key={option}
                  htmlFor={optionId}
                  className={cn(optionClassName, selected && 'border-primary/50 bg-primary/10')}
                >
                  <input
                    type="checkbox"
                    id={optionId}
                    checked={selected}
                    onChange={() => toggle(option)}
                    className="size-4 shrink-0 rounded border-border text-primary focus:ring-primary/20"
                  />
                  <span className="flex-1 break-words">{option}</span>
                </label>
              )
            })}
          </div>
          {value.length > 0 && (
            <p className="mt-2 text-xs text-text-secondary">
              {value.length} selected: {value.join(', ')}
            </p>
          )}
        </>
      )}
      {required && value.length === 0 && (
        <input
          tabIndex={-1}
          aria-hidden
          required
          value=""
          onChange={() => {}}
          className="sr-only"
        />
      )}
    </div>
  )

  if (!label && !hint && !error) {
    return content
  }

  return (
    <Field
      label={label}
      htmlFor={id}
      hint={hint}
      error={error}
      required={required}
    >
      {content}
    </Field>
  )
}
