import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { cn } from '../../../lib/forms/cn'
import Field from './Field'
import { inputClassName, inputErrorClassName } from './styles'

type InputProps = ComponentPropsWithoutRef<'input'> & {
  label?: string
  hint?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, required, id, className, ...props },
  ref,
) {
  const input = (
    <input
      ref={ref}
      id={id}
      required={required}
      aria-invalid={error ? true : undefined}
      aria-describedby={
        error ? `${id}-error` : hint ? `${id}-hint` : undefined
      }
      className={cn(inputClassName, error && inputErrorClassName, className)}
      {...props}
    />
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

export default Input
