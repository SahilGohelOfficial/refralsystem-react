import type { CreateFormPayload, Form, UpdateFormPayload } from '../../types/api'
import type { FormField, FormSchema } from '../../types/form'

export function toFormSchema(form: Form): FormSchema {
  return {
    formId: form.id,
    title: form.title,
    description: form.description ?? '',
    fields: form.fields as FormField[],
    createdAt: form.createdAt,
    updatedAt: form.updatedAt,
    isPublished: form.isPublished,
    submissionUserType: form.submissionUserType,
  }
}

export function toCreatePayload(schema: FormSchema): CreateFormPayload {
  return {
    title: schema.title.trim() || 'Untitled Form',
    description: schema.description?.trim() || undefined,
    fields: schema.fields,
    isPublished: schema.isPublished ?? true,
    submissionUserType: schema.submissionUserType ?? 'agent',
  }
}

export function toUpdatePayload(schema: FormSchema): UpdateFormPayload {
  return {
    title: schema.title.trim() || 'Untitled Form',
    description: schema.description?.trim() || undefined,
    fields: schema.fields,
    isPublished: schema.isPublished ?? true,
    submissionUserType: schema.submissionUserType ?? 'agent',
  }
}
