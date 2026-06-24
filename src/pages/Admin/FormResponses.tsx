import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
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
import { formatApiError } from '../../lib/api'
import {
  getForm,
  getFormResponseFileDownloadUrl,
  listFormResponses,
} from '../../services/forms.service'
import type { ApiError, Form, FormResponse, StoredFileMeta } from '../../types/api'

function formatDateTime(iso?: string): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return '—'
  }
}

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

function toTitleLabel(value: string): string {
  return value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase())
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

  const [form, setForm] = useState<Form | null>(null)
  const [responses, setResponses] = useState<FormResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [downloadingFields, setDownloadingFields] = useState<Set<string>>(new Set())

  const fetchData = useCallback(async () => {
    if (!formId) return
    setLoading(true)
    try {
      const [formData, responseData] = await Promise.all([
        getForm(formId),
        listFormResponses(formId),
      ])
      setForm(formData)
      setResponses(responseData)
    } catch (error) {
      toast.error(formatApiError(error as ApiError))
      navigate('/admin/forms', { replace: true })
    } finally {
      setLoading(false)
    }
  }, [formId, navigate])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  const rows = useMemo(
    () =>
      responses.map((response) => {
        const isExpanded = expandedIds.has(response.id)
        return { response, isExpanded }
      }),
    [expandedIds, responses],
  )

  const fieldLabelMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const field of form?.fields ?? []) {
      map.set(field.id, field.label)
    }
    return map
  }, [form])

  const toggleExpanded = (responseId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(responseId)) {
        next.delete(responseId)
      } else {
        next.add(responseId)
      }
      return next
    })
  }

  const handleDownloadFile = useCallback(
    async (responseId: string, fieldId: string) => {
      if (!formId) return

      const key = `${responseId}:${fieldId}`
      setDownloadingFields((prev) => {
        const next = new Set(prev)
        next.add(key)
        return next
      })

      try {
        const { downloadUrl } = await getFormResponseFileDownloadUrl(
          formId,
          responseId,
          fieldId,
        )
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
    },
    [formId],
  )

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">
            {t('forms.responses.title', 'Form Responses')}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {form
              ? t('forms.responses.subtitle_with_form', 'Responses for "{{title}}"', {
                  title: form.title,
                })
              : t('forms.responses.subtitle', 'Review submitted responses.')}
          </p>
        </div>
        <Button variant="secondary" onClick={() => navigate('/admin/forms')}>
          {t('forms.back_to_list', 'Back to forms list')}
        </Button>
      </div>

      <Card className="p-0">
        {rows.length === 0 ? (
          <div className="p-12 text-center text-text-secondary">
            {t('forms.responses.empty', 'No responses submitted yet.')}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('forms.responses.col_expand', 'Details')}</TableHead>
                <TableHead>{t('forms.responses.col_submitter_type', 'Type')}</TableHead>
                <TableHead>{t('forms.responses.col_submitter_name', 'Name')}</TableHead>
                <TableHead>{t('forms.responses.col_submitter_phone', 'Phone')}</TableHead>
                <TableHead>{t('forms.responses.col_submitted_at', 'Submitted At')}</TableHead>
              </TableRow>
            </TableHeader>
            <tbody>
              {rows.map(({ response, isExpanded }) => (
                <Fragment key={response.id}>
                  <TableRow>
                    <TableCell>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-primary hover:text-primary-hover"
                        onClick={() => toggleExpanded(response.id)}
                      >
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        {isExpanded
                          ? t('forms.responses.collapse', 'Collapse')
                          : t('forms.responses.expand', 'Expand')}
                      </button>
                    </TableCell>
                    <TableCell>
                      <Badge variant="neutral">
                        {response.submitter.type
                          ? t(`forms.submitter_${response.submitter.type}`, response.submitter.type)
                          : t('forms.responses.unknown', 'Unknown')}
                      </Badge>
                    </TableCell>
                    <TableCell>{response.submitter.name ?? '—'}</TableCell>
                    <TableCell>{response.submitter.phoneNumber ?? '—'}</TableCell>
                    <TableCell>{formatDateTime(response.submittedAt)}</TableCell>
                  </TableRow>
                  {isExpanded ? (
                    <TableRow className="bg-surface/30">
                      <TableCell colSpan={5}>
                        <div className="space-y-3 py-2">
                          <div className="text-xs text-text-secondary font-mono">
                            {t('forms.responses.response_id', 'Response ID')}: {response.id}
                          </div>
                          <div className="space-y-2">
                            {Object.keys(response.answers).length === 0 ? (
                              <p className="text-sm text-text-secondary">
                                {t('forms.responses.no_answers', 'No answers available.')}
                              </p>
                            ) : (
                              Object.entries(response.answers).map(([fieldId, value]) => (
                                <div key={`${response.id}-${fieldId}`} className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-2">
                                  <div className="text-xs text-text-secondary font-mono break-all">
                                    {fieldLabelMap.get(fieldId) ?? toTitleLabel(fieldId)}
                                  </div>
                                  {isStoredFileMeta(value) ? (
                                    <div className="text-sm text-text break-words space-y-1">
                                      <div>{`${value.name} (${value.type}, ${value.size} bytes)`}</div>
                                      <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => void handleDownloadFile(response.id, fieldId)}
                                        isLoading={downloadingFields.has(`${response.id}:${fieldId}`)}
                                      >
                                        {t('forms.responses.download', 'Download')}
                                      </Button>
                                    </div>
                                  ) : (
                                    <div className="text-sm text-text break-words">
                                      {formatAnswerValue(value)}
                                    </div>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : null}
                </Fragment>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  )
}
