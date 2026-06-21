import type { ReactNode } from 'react'
import { cn } from '../../../lib/forms/cn'
import { errorClassName, hintClassName, labelClassName } from './styles'

type FieldProps = {
  label?: string
  htmlFor?: string
  hint?: string
  error?: string
  required?: boolean
  className?: string
  children: ReactNode
}

export default function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  className,
  children,
}: FieldProps) {
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label htmlFor={htmlFor} className={labelClassName}>
          {label}
          {required && <span className="ml-0.5 text-error">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className={errorClassName} role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className={hintClassName}>{hint}</p>
      ) : null}
    </div>
  )
}
