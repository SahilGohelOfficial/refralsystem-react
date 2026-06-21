import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { cn } from '../../../lib/forms/cn'
import Field from './Field'
import { optionClassName } from './styles'

type RadioGroupProps = {
  name: string
  label?: string
  hint?: string
  error?: string
  required?: boolean
  options: string[]
  value?: string
  defaultValue?: string
  onChange?: ComponentPropsWithoutRef<'input'>['onChange']
  onBlur?: ComponentPropsWithoutRef<'input'>['onBlur']
  className?: string
}

const Radio = forwardRef<HTMLInputElement, ComponentPropsWithoutRef<'input'>>(
  function Radio({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        type="radio"
        className={cn(
          'size-4 shrink-0 border-border text-primary focus:ring-2 focus:ring-primary/20',
          className,
        )}
        {...props}
      />
    )
  },
)

export function RadioGroup({
  name,
  label,
  hint,
  error,
  required,
  options,
  value,
  defaultValue,
  onChange,
  onBlur,
  className,
}: RadioGroupProps) {
  const group = (
    <div className="flex flex-col gap-2" role="radiogroup">
      {options.map((option) => {
        const optionId = `${name}-${option}`
        const checked = value !== undefined ? value === option : undefined
        return (
          <label
            key={option}
            htmlFor={optionId}
            className={cn(optionClassName, checked && 'border-primary/50 bg-primary/10')}
          >
            <Radio
              id={optionId}
              name={name}
              value={option}
              checked={checked}
              defaultChecked={
                defaultValue !== undefined ? defaultValue === option : undefined
              }
              required={required}
              onChange={onChange}
              onBlur={onBlur}
            />
            <span className="flex-1 break-words">{option}</span>
          </label>
        )
      })}
    </div>
  )

  if (!label && !hint && !error) {
    return <div className={className}>{group}</div>
  }

  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={className}
    >
      {group}
    </Field>
  )
}

export default Radio
