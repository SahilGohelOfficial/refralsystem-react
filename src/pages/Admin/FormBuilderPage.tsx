import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import FormBuilder from '../../components/forms/builder/FormBuilder'
import Loader from '../../components/ui/Loader'
import { createEmptySchema } from '../../lib/forms/createField'
import { DuplicateFieldLabelError, validateFormSchema } from '../../lib/forms/fieldId'
import {
  toCreatePayload,
  toFormSchema,
  toUpdatePayload,
} from '../../lib/forms/formMappers'
import { useConfirm } from '../../stores/confirmStore'
import { formatApiError } from '../../lib/api'
import { useCreateForm, useForm, useUpdateForm } from '../../hooks/queries'
import { useToastOnError } from '../../hooks/useToastOnError'
import type { ApiError } from '../../types/api'
import type { FormSchema } from '../../types/form'

const FormBuilderPage = () => {
  const { formId } = useParams<{ formId: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const confirm = useConfirm()
  const isEditMode = Boolean(formId)
  const { data: form, isLoading, error } = useForm(formId ?? '', isEditMode)
  const createFormMutation = useCreateForm()
  const updateFormMutation = useUpdateForm()
  useToastOnError(error, isEditMode)

  const [notFound, setNotFound] = useState(false)

  const emptySchema = useMemo(() => createEmptySchema(), [])
  const loadedSchema = useMemo(
    () => (form ? toFormSchema(form) : null),
    [form],
  )

  useEffect(() => {
    if (!error || !isEditMode) return
    const apiError = error as ApiError
    if (apiError.statusCode === 404) setNotFound(true)
  }, [error, isEditMode])

  const handleSave = useCallback(
    async (schema: FormSchema) => {
      if (isEditMode && formId) {
        const confirmed = await confirm({
          title: t('forms.edit', 'Edit Form'),
          message: t('forms.update_confirm', 'Save changes to this form?'),
          confirmLabel: t('common.save', 'Save Changes'),
        })
        if (!confirmed) return
      }

      try {
        validateFormSchema(schema)
        if (isEditMode && formId) {
          await updateFormMutation.mutateAsync({ id: formId, payload: toUpdatePayload(schema) })
          toast.success(t('forms.updated_success', 'Form updated successfully'))
        } else {
          await createFormMutation.mutateAsync(toCreatePayload(schema))
          toast.success(t('forms.created_success', 'Form created successfully'))
        }
        navigate('/admin/forms')
      } catch (e) {
        if (e instanceof DuplicateFieldLabelError) {
          toast.error(e.message)
        } else {
          toast.error(formatApiError(e as ApiError))
        }
      }
    },
    [confirm, createFormMutation, formId, isEditMode, navigate, t, updateFormMutation],
  )

  const handleCancel = useCallback(() => {
    navigate('/admin/forms')
  }, [navigate])

  if (isEditMode && isLoading) {
    return <Loader size="lg" className="min-h-[50vh]" />
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

  const isSaving = createFormMutation.isPending || updateFormMutation.isPending

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