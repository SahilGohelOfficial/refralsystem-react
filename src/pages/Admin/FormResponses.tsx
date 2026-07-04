import { Fragment, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronDown, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { Card } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import Loader from '../../components/ui/Loader'
import { formatApiError } from '../../lib/api'
import { getFormResponseFileDownloadUrl } from '../../services/forms.service'
import { useForm, useFormResponses } from '../../hooks/queries'
import { useToastOnError } from '../../hooks/useToastOnError'
import type { ApiError, FormResponse, StoredFileMeta } from '../../types/api'
import { resolveFieldLabel } from '../../lib/labels'
import { formatLocalDateTime } from '../../lib/dates'

function isStoredFileMeta(value: unknown): value is StoredFileMeta {
  return (
    !!value &&
    typeof value === 'object' &&
    'kind' in value &&
    (value as { kind?: unknown }).kind === 'file' &&
    'key' in value &&
    typeof (value as { key?: unknown }).key === 'string'
  )
}

function formatAnswerValue(value: unknown): string {
  if (value === null) return 'null'
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) return value.join(', ')
  return JSON.stringify(value)
}

export default function FormResponses() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { formId = '' } = useParams<{ formId: string }>()

  const { data: form, error: formError } = useForm(formId)
  const { data: responses = [], isLoading, error: responsesError } = useFormResponses(formId)
  useToastOnError(formError)
  useToastOnError(responsesError)

  useEffect(() => {
    if (formError || responsesError) {
      navigate('/admin/forms', { replace: true })
    }
  }, [formError, responsesError, navigate])

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [downloadingFields, setDownloadingFields] = useState<Set<string>>(new Set())

  const rows = useMemo(
    () =>
      responses.map((response) => {
        const labelMap = new Map(
          (form?.fields ?? []).map((field) => [field.id, field.label]),
        )
        const answers = Object.entries(response.answers ?? {}).map(([fieldId, value]) => ({
          fieldId,
          label: resolveFieldLabel(fieldId, labelMap),
          value,
        }))
        return { response, answers }
      }),
    [responses, form?.fields],
  )

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleDownload = async (response: FormResponse, fieldId: string) => {
    const key = `${response.id}:${fieldId}`
    if (downloadingFields.has(key)) return
    setDownloadingFields((prev) => new Set(prev).add(key))
    try {
      const { downloadUrl } = await getFormResponseFileDownloadUrl(formId, response.id, fieldId)
      window.open(downloadUrl, '_blank', 'noopener,noreferrer')
    } catch (error) {
      toast.error(formatApiError(error as ApiError))
    } finally {
      setDownloadingFields((prev) => {
        const next = new Set(prev)
        next.delete(key)
        return next
      })
    }
  }

  if (isLoading) {
    return <Loader text={t('common.loading', 'Loading...')} />
  }

  return (
    <div className="page-shell space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">
            {form?.title ?? t('forms.responses_title', 'Form Responses')}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {t('forms.responses_subtitle', '{{count}} responses', { count: responses.length })}
          </p>
        </div>
        <Button variant="secondary" onClick={() => navigate('/admin/forms')}>
          {t('forms.back_to_list', 'Back to forms list')}
        </Button>
      </div>

      {rows.length === 0 ? (
        <Card className="p-12 text-center text-text-secondary">
          {t('forms.no_responses', 'No responses yet.')}
        </Card>
      ) : (
        <Card padding="none" className="data-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10" />
                <TableHead>{t('forms.response_submitted', 'Submitted')}</TableHead>
                <TableHead>{t('forms.response_submitter', 'Submitter')}</TableHead>
                <TableHead>{t('forms.response_answers', 'Answers')}</TableHead>
              </TableRow>
            </TableHeader>
            <tbody>
              {rows.map(({ response, answers }) => {
                const expanded = expandedIds.has(response.id)
                return (
                  <Fragment key={response.id}>
                    <TableRow>
                      <TableCell>
                        <button
                          type="button"
                          onClick={() => toggleExpanded(response.id)}
                          className="p-1 text-text-secondary hover:text-text"
                          aria-expanded={expanded}
                        >
                          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                      </TableCell>
                      <TableCell>{formatLocalDateTime(response.submittedAt)}</TableCell>
                      <TableCell>
                        <Badge variant="neutral">{response.submitterType}</Badge>
                      </TableCell>
                      <TableCell className="text-text-secondary">
                        {answers.length} {t('forms.fields', 'fields')}
                      </TableCell>
                    </TableRow>
                    {expanded && (
                      <TableRow>
                        <TableCell colSpan={4} className="bg-surface/50">
                          <div className="grid gap-3 py-2">
                            {answers.map(({ fieldId, label, value }) => (
                              <div key={fieldId} className="flex flex-col sm:flex-row sm:gap-4 text-sm">
                                <span className="font-medium text-text min-w-[140px]">{label}</span>
                                <span className="text-text-secondary flex-1">
                                  {isStoredFileMeta(value) ? (
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      isLoading={downloadingFields.has(`${response.id}:${fieldId}`)}
                                      onClick={() => void handleDownload(response, fieldId)}
                                    >
                                      {value.originalName ?? t('forms.download_file', 'Download file')}
                                    </Button>
                                  ) : (
                                    formatAnswerValue(value)
                                  )}
                                </span>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </Table>
        </Card>
      )}
    </div>
  )
}