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
import Modal from '../../components/ui/Modal'
import { useAuth } from '../../context/AuthContext'
import { formatApiError } from '../../lib/api'
import { deleteForm, listForms } from '../../services/forms.service'
import type { ApiError, FormSummary } from '../../types/api'

function formatDate(iso?: string): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return '—'
  }
}

const Forms = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user } = useAuth()
  const isSuperAdmin = user?.role === 'superAdmin'

  const [forms, setForms] = useState<FormSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deletingForm, setDeletingForm] = useState<FormSummary | null>(null)
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
        form.id.toLowerCase().includes(query),
    )
  }, [forms, search])

  const handleDelete = async () => {
    if (!deletingForm) return
    setDeleting(true)
    try {
      await deleteForm(deletingForm.id)
      toast.success(t('forms.deleted_success', 'Form deleted successfully'))
      setDeletingForm(null)
      await fetchForms()
    } catch (error) {
      toast.error(formatApiError(error as ApiError))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">
            {t('forms.title', 'Dynamic Forms')}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {t('forms.subtitle', 'Create and manage custom form schemas.')}
          </p>
        </div>
        {isSuperAdmin && (
          <Button
            className="shrink-0 gap-2"
            onClick={() => navigate('/admin/forms/new')}
          >
            <Plus size={16} />
            {t('forms.create', 'Create Form')}
          </Button>
        )}
      </div>

      <Card className="p-0">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface/50 rounded-t-[20px]">
          <div className="w-full sm:w-96">
            <Input
              icon={Search}
              placeholder={t('forms.search_placeholder', 'Search by title or ID...')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : filteredForms.length === 0 ? (
          <div className="p-12 text-center text-text-secondary">
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
                <TableHead>{t('forms.col_updated', 'Last Updated')}</TableHead>
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
                      <div className="text-xs text-text-secondary font-mono truncate max-w-[200px] sm:max-w-xs">
                        {form.id}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={form.isPublished ? 'success' : 'neutral'}>
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
                  <TableCell>{formatDate(form.updatedAt)}</TableCell>
                  {isSuperAdmin && (
                    <TableCell className="text-right">
                      <Dropdown
                        align="right"
                        trigger={
                          <button className="p-1 text-text-secondary hover:text-text hover:bg-surface rounded-md transition-colors">
                            <MoreVertical size={16} />
                          </button>
                        }
                      >
                        <DropdownItem
                          onClick={() => navigate(`/admin/forms/${form.id}/edit`)}
                        >
                          <Edit2 size={14} /> {t('forms.edit', 'Edit Form')}
                        </DropdownItem>
                        <DropdownItem danger onClick={() => setDeletingForm(form)}>
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

      <Modal
        isOpen={!!deletingForm}
        onClose={() => !deleting && setDeletingForm(null)}
        title={t('forms.delete_title', 'Delete Form')}
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            {t(
              'forms.delete_confirm',
              'Delete "{{title}}"? This cannot be undone.',
              { title: deletingForm?.title ?? '' },
            )}
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              onClick={() => setDeletingForm(null)}
              disabled={deleting}
            >
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button variant="danger" onClick={handleDelete} isLoading={deleting}>
              {t('forms.delete', 'Delete Form')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Forms
