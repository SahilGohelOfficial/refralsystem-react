import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { cn } from '../../../lib/forms/cn'
import Field from './Field'
import { inputClassName, inputErrorClassName } from './styles'

type TextareaProps = ComponentPropsWithoutRef<'textarea'> & {
  label?: string
  hint?: string
  error?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, required, id, className, ...props },
  ref,
) {
  const textarea = (
    <textarea
      ref={ref}
      id={id}
      required={required}
      aria-invalid={error ? true : undefined}
      className={cn(
        inputClassName,
        'min-h-24 resize-y',
        error && inputErrorClassName,
        className,
      )}
      {...props}
    />
  )

  if (!label && !hint && !error) {
    return textarea
  }

  return (
    <Field
      label={label}
      htmlFor={id}
      hint={hint}
      error={error}
      required={required}
    >
      {textarea}
    </Field>
  )
})

export default Textarea
