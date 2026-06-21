import type { FieldType, FormField, FormSchema } from '../../types/form'
import { FIELD_TYPES_WITH_OPTIONS } from '../../types/form'
import { assertUniqueFieldLabel, labelToFieldId } from './fieldId'

const DEFAULT_LABELS: Record<FieldType, string> = {
  text: 'Text Field',
  textarea: 'Textarea Field',
  dropdown: 'Dropdown Field',
  multi_dropdown: 'Multi Dropdown Field',
  radio: 'Radio Field',
  multi_radio: 'Multi Radio Field',
  checkbox: 'Checkbox Field',
  checkbox_group: 'Multiple Checkbox Field',
  file: 'File Upload Field',
}

export function createDefaultField(
  type: FieldType,
  existingFields: FormField[] = [],
): FormField {
  const label = DEFAULT_LABELS[type]
  assertUniqueFieldLabel(existingFields, label)

  const field: FormField = {
    id: labelToFieldId(label),
    type,
    label,
    validation: { required: false },
  }

  if (type === 'dropdown' || type === 'multi_dropdown') {
    field.placeholder = 'Select an option'
  }

  if (FIELD_TYPES_WITH_OPTIONS.includes(type)) {
    field.options = ['Option 1', 'Option 2']
  }

  return field
}

export function createEmptySchema(): FormSchema {
  return {
    formId: '',
    title: 'Untitled Form',
    description: '',
    fields: [],
    isPublished: true,
    submissionUserType: 'agent',
  }
}
