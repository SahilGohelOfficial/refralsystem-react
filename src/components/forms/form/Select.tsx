import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { cn } from '../../../lib/forms/cn'
import Field from './Field'
import { inputClassName, inputErrorClassName } from './styles'

type SelectProps = ComponentPropsWithoutRef<'select'> & {
  label?: string
  hint?: string
  error?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, required, id, className, children, ...props },
  ref,
) {
  const select = (
    <select
      ref={ref}
      id={id}
      required={required}
      aria-invalid={error ? true : undefined}
      className={cn(inputClassName, error && inputErrorClassName, className)}
      {...props}
    >
      {children}
    </select>
  )

  if (!label && !hint && !error) {
    return select
  }

  return (
    <Field
      label={label}
      htmlFor={id}
      hint={hint}
      error={error}
      required={required}
    >
      {select}
    </Field>
  )
})

export default Select
