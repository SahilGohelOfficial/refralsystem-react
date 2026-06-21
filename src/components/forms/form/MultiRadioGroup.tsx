import { cn } from '../../../lib/forms/cn'
import Field from './Field'
import { optionClassName } from './styles'

type MultiRadioGroupProps = {
  id: string
  label?: string
  hint?: string
  error?: string
  required?: boolean
  options: string[]
  value: string[]
  onChange: (value: string[]) => void
  onBlur?: () => void
  className?: string
}

export default function MultiRadioGroup({
  id,
  label,
  hint,
  error,
  required,
  options,
  value,
  onChange,
  onBlur,
  className,
}: MultiRadioGroupProps) {
  const toggle = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option))
    } else {
      onChange([...value, option])
    }
  }

  const group = (
    <div className={cn('flex flex-col gap-2', className)} onBlur={onBlur} role="group">
      {options.map((option) => {
        const optionId = `${id}-${option}`
        const selected = value.includes(option)
        return (
          <label
            key={option}
            htmlFor={optionId}
            className={cn(optionClassName, selected && 'border-primary/50 bg-primary/10')}
          >
            <span className="relative flex size-5 shrink-0 items-center justify-center">
              <input
                type="checkbox"
                id={optionId}
                checked={selected}
                onChange={() => toggle(option)}
                className="peer sr-only"
              />
              <span
                className={cn(
                  'size-4 rounded-full border-2 transition-colors',
                  selected
                    ? 'border-primary bg-primary'
                    : 'border-border bg-surface',
                )}
              />
              {selected && (
                <span className="pointer-events-none absolute size-1.5 rounded-full bg-background" />
              )}
            </span>
            <span className="flex-1 break-words">{option}</span>
          </label>
        )
      })}
    </div>
  )

  if (!label && !hint && !error) {
    return group
  }

  return (
    <Field
      label={label}
      htmlFor={id}
      hint={hint}
      error={error}
      required={required}
    >
      {group}
    </Field>
  )
}
