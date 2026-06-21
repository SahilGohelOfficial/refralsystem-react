import type { FormField, FormSchema } from '../../types/form'

export function labelToFieldId(label: string): string {
  const id = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
  return id || 'field'
}

export class DuplicateFieldLabelError extends Error {
  constructor(label: string, conflictingLabel: string) {
    super(`Duplicate field label: "${label}" conflicts with "${conflictingLabel}"`)
    this.name = 'DuplicateFieldLabelError'
  }
}

export function findDuplicateFieldLabel(
  fields: FormField[],
  label: string,
  excludeIndex?: number,
): FormField | null {
  const candidateId = labelToFieldId(label)
  for (let i = 0; i < fields.length; i++) {
    if (excludeIndex !== undefined && i === excludeIndex) continue
    if (labelToFieldId(fields[i].label) === candidateId) {
      return fields[i]
    }
  }
  return null
}

export function assertUniqueFieldLabel(
  fields: FormField[],
  label: string,
  excludeIndex?: number,
): void {
  const conflict = findDuplicateFieldLabel(fields, label, excludeIndex)
  if (conflict) {
    throw new DuplicateFieldLabelError(label, conflict.label)
  }
}

export function validateFormSchema(schema: FormSchema): void {
  const seen = new Map<string, FormField>()
  for (const field of schema.fields) {
    const slug = labelToFieldId(field.label)
    const existing = seen.get(slug)
    if (existing) {
      throw new DuplicateFieldLabelError(field.label, existing.label)
    }
    seen.set(slug, field)
  }
}

export function fieldWithLabelId(
  field: FormField,
  label: string,
  existingFields: FormField[],
  fieldIndex: number,
): FormField {
  assertUniqueFieldLabel(existingFields, label, fieldIndex)
  return { ...field, label, id: labelToFieldId(label) }
}
