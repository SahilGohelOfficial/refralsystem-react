import { cn } from '../../../lib/forms/cn'
import Field from './Field'
import { optionClassName, optionGridClassName } from './styles'

type CheckboxGroupProps = {
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

export default function CheckboxGroup({
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
}: CheckboxGroupProps) {
  const toggle = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option))
    } else {
      onChange([...value, option])
    }
  }

  const group = (
    <div className={cn(optionGridClassName, className)} onBlur={onBlur} role="group">
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
