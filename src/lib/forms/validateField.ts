import type { FormAnswerValue, FormAnswers, FormField } from '../../types/form'

function isEmpty(value: FormAnswerValue | undefined): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  if (typeof value === 'boolean') return value === false
  if (Array.isArray(value)) return value.length === 0
  if (value instanceof File) return false
  return true
}

function defaultMessage(field: FormField): string {
  switch (field.type) {
    case 'checkbox':
      return 'This field is required.'
    case 'checkbox_group':
    case 'multi_radio':
    case 'multi_dropdown':
      return 'Please select at least one option.'
    case 'file':
      return 'Please upload a file.'
    case 'dropdown':
    case 'radio':
      return 'Please make a selection.'
    default:
      return 'This field is required.'
  }
}

export function validateField(
  field: FormField,
  value: FormAnswerValue | undefined,
): string | undefined {
  const validation = field.validation
  const errorMessage = validation?.errorMessage

  if (validation?.required) {
    if (field.type === 'checkbox') {
      if (value !== true) {
        return errorMessage ?? defaultMessage(field)
      }
    } else if (field.type === 'checkbox_group' || field.type === 'multi_dropdown') {
      if (!Array.isArray(value) || value.length === 0) {
        return errorMessage ?? defaultMessage(field)
      }
    } else if (isEmpty(value)) {
      return errorMessage ?? defaultMessage(field)
    }
  }

  if (field.type === 'text' || field.type === 'textarea') {
    const str = typeof value === 'string' ? value : ''
    if (validation?.minLength !== undefined && str.length < validation.minLength) {
      return errorMessage ?? `Must be at least ${validation.minLength} characters.`
    }
    if (validation?.maxLength !== undefined && str.length > validation.maxLength) {
      return errorMessage ?? `Must be at most ${validation.maxLength} characters.`
    }
    if (validation?.pattern && str) {
      try {
        const regex = new RegExp(validation.pattern)
        if (!regex.test(str)) {
          return errorMessage ?? 'Invalid format.'
        }
      } catch {
        return 'Invalid validation pattern.'
      }
    }
  }

  if (field.type === 'file' && value instanceof File) {
    if (validation?.allowedFileTypes?.length) {
      if (!validation.allowedFileTypes.includes(value.type)) {
        return errorMessage ?? 'File type not allowed.'
      }
    }
    if (validation?.maxFileSizeMB !== undefined) {
      const maxBytes = validation.maxFileSizeMB * 1024 * 1024
      if (value.size > maxBytes) {
        return errorMessage ?? `File must be under ${validation.maxFileSizeMB}MB.`
      }
    }
  }

  return undefined
}

export function validateForm(
  fields: FormField[],
  answers: FormAnswers,
): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const field of fields) {
    const error = validateField(field, answers[field.id])
    if (error) {
      errors[field.id] = error
    }
  }
  return errors
}
