import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, Plus, MoreVertical, Edit2, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { Card } from '../../components/ui/Card'
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import { Dropdown, DropdownItem } from '../../components/ui/Dropdown'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import PageHeader from '../../components/ui/PageHeader'
import { useConfirm } from '../../context/ConfirmContext'
import IconButton from '../../components/ui/IconButton'
import Loader from '../../components/ui/Loader'
import { useAuth } from '../../context/AuthContext'
import { formatApiError } from '../../lib/api'
import { deleteForm, listForms } from '../../services/forms.service'
import type { ApiError, FormSummary } from '../../types/api'
import { formatLocalDate } from '../../lib/dates'

const Forms = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const confirm = useConfirm()
  const { user } = useAuth()
  const isSuperAdmin = user?.role === 'superAdmin'

  const [forms, setForms] = useState<FormSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState(false)

  const fetchForms = useCallback(async () => {
    setLoading(true)
    try {
      const data = await listForms()
      setForms(data)
    } catch (error) {
      toast.error(formatApiError(error as ApiError))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchForms()
  }, [fetchForms])

  const filteredForms = useMemo(() => {
    const query = search.toLowerCase()
    return forms.filter(
      (form) =>
        form.title.toLowerCase().includes(query) ||
        (form.description?.toLowerCase().includes(query) ?? false),
    )
  }, [forms, search])

  const handleDelete = async (form: FormSummary) => {
    if (deleting) return

    const confirmed = await confirm({
      title: t('forms.delete_title', 'Delete Form'),
      message: t(
        'forms.delete_confirm',
        'Delete "{{title}}"? This cannot be undone.',
        { title: form.title },
      ),
      variant: 'danger',
      confirmLabel: t('forms.delete', 'Delete Form'),
    })
    if (!confirmed) return

    setDeleting(true)
    try {
      await deleteForm(form.id)
      toast.success(t('forms.deleted_success', 'Form deleted successfully'))
      await fetchForms()
    } catch (error) {
      toast.error(formatApiError(error as ApiError))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="page-shell">
      <PageHeader
        title={t('forms.title', 'Dynamic Forms')}
        description={t('forms.subtitle', 'Create and manage custom form schemas.')}
        actions={
          isSuperAdmin ? (
            <Button onClick={() => navigate('/admin/forms/new')}>
              <Plus size={16} />
              {t('forms.create', 'Create Form')}
            </Button>
          ) : undefined
        }
      />

      <Card padding="none" className="data-card">
        <div className="table-toolbar">
          <div className="w-full sm:max-w-md">
            <Input
              icon={Search}
              placeholder={t('forms.search_placeholder', 'Search by title...')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <Loader text={t('common.loading', 'Loading...')} />
        ) : filteredForms.length === 0 ? (
          <div className="py-16 text-center text-sm text-text-secondary">
            {search
              ? t('forms.no_results', 'No forms match your search.')
              : t('forms.empty', 'No forms yet. Create your first form.')}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('forms.col_title', 'Title')}</TableHead>
                <TableHead>{t('forms.col_published', 'Published')}</TableHead>
                <TableHead>{t('forms.col_submitter', 'Submitter')}</TableHead>
                <TableHead>{t('forms.col_submitted_count', 'Submitted Count')}</TableHead>
                <TableHead>{t('forms.col_updated', 'Last Updated')}</TableHead>
                <TableHead className="text-right">{t('forms.col_responses', 'Responses')}</TableHead>
                {isSuperAdmin && (
                  <TableHead className="text-right">{t('forms.col_actions', 'Actions')}</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <tbody>
              {filteredForms.map((form) => (
                <TableRow key={form.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-text">{form.title}</div>
                      {form.description ? (
                        <div className="text-xs text-text-secondary truncate max-w-[200px] sm:max-w-xs">
                          {form.description}
                        </div>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={form.isPublished ? 'success' : 'neutral'} dot>
                      {form.isPublished
                        ? t('forms.status_published', 'Published')
                        : t('forms.status_draft', 'Draft')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {form.submissionUserType === 'agent'
                      ? t('forms.submitter_agent', 'Agents')
                      : t('forms.submitter_user', 'Users')}
                  </TableCell>
                  <TableCell>{form.submittedCount ?? 0}</TableCell>
                  <TableCell>{formatLocalDate(form.updatedAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => navigate(`/admin/forms/${form.id}/responses`)}
                    >
                      {t('forms.view_responses', 'Responses')}
                    </Button>
                  </TableCell>
                  {isSuperAdmin && (
                    <TableCell className="text-right">
                      <Dropdown
                        align="right"
                        trigger={
                          <IconButton size="sm" aria-label={t('forms.col_actions', 'Actions')}>
                            <MoreVertical size={16} />
                          </IconButton>
                        }
                      >
                        <DropdownItem
                          onClick={() => navigate(`/admin/forms/${form.id}/edit`)}
                        >
                          <Edit2 size={14} /> {t('forms.edit', 'Edit Form')}
                        </DropdownItem>
                        <DropdownItem danger onClick={() => void handleDelete(form)}>
                          <Trash2 size={14} /> {t('forms.delete', 'Delete Form')}
                        </DropdownItem>
                      </Dropdown>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

    </div>
  )
}

export default Forms
