import type { FormSchema } from '../../types/form'

/** @deprecated Use forms.service.ts API calls instead. */import { validateFormSchema } from './fieldId'

const STORAGE_KEY = 'admin:forms'

function readAll(): FormSchema[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as FormSchema[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeAll(forms: FormSchema[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(forms))
  } catch {
    // quota / private mode
  }
}

export function listForms(): FormSchema[] {
  return readAll().sort((a, b) => {
    const aTime = a.updatedAt ?? a.createdAt ?? ''
    const bTime = b.updatedAt ?? b.createdAt ?? ''
    return bTime.localeCompare(aTime)
  })
}

export function getForm(formId: string): FormSchema | null {
  return readAll().find((f) => f.formId === formId) ?? null
}

export function saveForm(schema: FormSchema): void {
  validateFormSchema(schema)
  const forms = readAll()
  const now = new Date().toISOString()
  const index = forms.findIndex((f) => f.formId === schema.formId)

  const toSave: FormSchema = {
    ...schema,
    createdAt: index >= 0 ? forms[index].createdAt ?? now : schema.createdAt ?? now,
    updatedAt: now,
  }

  if (index >= 0) {
    forms[index] = toSave
  } else {
    forms.push(toSave)
  }

  writeAll(forms)
}

export function deleteForm(formId: string): void {
  writeAll(readAll().filter((f) => f.formId !== formId))
}
