export type SubmissionUserType = 'agent' | 'user'

export type FieldType =
  | 'text'
  | 'textarea'
  | 'dropdown'
  | 'multi_dropdown'
  | 'radio'
  | 'multi_radio'
  | 'checkbox'
  | 'checkbox_group'
  | 'file'

export type FieldValidation = {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: string
  allowedFileTypes?: string[]
  maxFileSizeMB?: number
  errorMessage?: string
}

export type FormField = {
  id: string
  type: FieldType
  label: string
  placeholder?: string
  options?: string[]
  validation?: FieldValidation
}

export type FormSchema = {
  formId: string
  title: string
  description?: string
  fields: FormField[]
  createdAt?: string
  updatedAt?: string
  isPublished?: boolean
  submissionUserType?: SubmissionUserType
}

export type FormAnswerValue = string | string[] | boolean | File | null

export type FormAnswers = Record<string, FormAnswerValue>

export const FIELD_TYPES_WITH_OPTIONS: FieldType[] = [
  'dropdown',
  'multi_dropdown',
  'radio',
  'multi_radio',
  'checkbox_group',
]

export const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text: 'Text',
  textarea: 'Textarea',
  dropdown: 'Dropdown',
  multi_dropdown: 'Multi Dropdown',
  radio: 'Radio',
  multi_radio: 'Multi Radio',
  checkbox: 'Checkbox',
  checkbox_group: 'Multiple Checkbox',
  file: 'File',
}
