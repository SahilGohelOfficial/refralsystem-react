import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import FormBuilder from '../../components/forms/builder/FormBuilder'
import { createEmptySchema } from '../../lib/forms/createField'
import { DuplicateFieldLabelError, validateFormSchema } from '../../lib/forms/fieldId'
import {
  toCreatePayload,
  toFormSchema,
  toUpdatePayload,
} from '../../lib/forms/formMappers'
import { formatApiError } from '../../lib/api'
import {
  createForm,
  getForm,
  updateForm,
} from '../../services/forms.service'
import type { ApiError } from '../../types/api'
import type { FormSchema } from '../../types/form'

const FormBuilderPage = () => {
  const { formId } = useParams<{ formId: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [isSaving, setIsSaving] = useState(false)
  const [loading, setLoading] = useState(Boolean(formId))
  const [loadedSchema, setLoadedSchema] = useState<FormSchema | null>(null)
  const [notFound, setNotFound] = useState(false)

  const isEditMode = Boolean(formId)

  const emptySchema = useMemo(() => createEmptySchema(), [])

  useEffect(() => {
    if (!isEditMode || !formId) return

    let cancelled = false
    setLoading(true)
    setNotFound(false)

    getForm(formId)
      .then((form) => {
        if (!cancelled) setLoadedSchema(toFormSchema(form))
      })
      .catch((error) => {
        if (!cancelled) {
          const apiError = error as ApiError
          if (apiError.statusCode === 404) {
            setNotFound(true)
          } else {
            toast.error(formatApiError(apiError))
          }
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [formId, isEditMode])

  const handleSave = useCallback(
    async (schema: FormSchema) => {
      setIsSaving(true)
      try {
        validateFormSchema(schema)
        if (isEditMode && formId) {
          await updateForm(formId, toUpdatePayload(schema))
          toast.success(t('forms.updated_success', 'Form updated successfully'))
        } else {
          await createForm(toCreatePayload(schema))
          toast.success(t('forms.created_success', 'Form created successfully'))
        }
        navigate('/admin/forms')
      } catch (e) {
        if (e instanceof DuplicateFieldLabelError) {
          toast.error(e.message)
        } else {
          toast.error(formatApiError(e as ApiError))
        }
      } finally {
        setIsSaving(false)
      }
    },
    [isEditMode, formId, navigate, t],
  )

  const handleCancel = useCallback(() => {
    navigate('/admin/forms')
  }, [navigate])

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  if (isEditMode && notFound) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-text">
          {t('forms.not_found_title', 'Form Not Found')}
        </h1>
        <p className="text-text-secondary">
          {t('forms.not_found_desc', 'The form you are looking for does not exist.')}
        </p>
        <button
          type="button"
          onClick={() => navigate('/admin/forms')}
          className="text-primary hover:underline"
        >
          {t('forms.back_to_list', 'Back to forms list')}
        </button>
      </div>
    )
  }

  const initialSchema = isEditMode ? loadedSchema : emptySchema
  if (!initialSchema) return null

  return (
    <FormBuilder
      key={initialSchema.formId || 'new'}
      initialSchema={initialSchema}
      onSave={handleSave}
      onCancel={handleCancel}
      isSaving={isSaving}
    />
  )
}

export default FormBuilderPage
