import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '../../ui/Card';
import { Table, TableCell, TableHead, TableHeader, TableRow } from '../../ui/Table';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Badge from '../../ui/Badge';
import { formatApiError } from '../../../lib/api';
import { listForms } from '../../../services/forms.service';
import type { ApiError, FormSummary, SubmissionUserType } from '../../../types/api';

type PortalFormsListProps = {
  userType: SubmissionUserType;
  detailsPathPrefix: string;
};

function formatDate(iso?: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '—';
  }
}

export default function PortalFormsList({
  userType,
  detailsPathPrefix,
}: PortalFormsListProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [forms, setForms] = useState<FormSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchForms = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listForms(userType);
      setForms(data);
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
    } finally {
      setLoading(false);
    }
  }, [userType]);

  useEffect(() => {
    void fetchForms();
  }, [fetchForms]);

  const filteredForms = useMemo(() => {
    const query = search.toLowerCase();
    return forms.filter(
      (form) =>
        form.title.toLowerCase().includes(query) ||
        form.id.toLowerCase().includes(query),
    );
  }, [forms, search]);

  const title =
    userType === 'agent'
      ? t('agent.forms.title', 'Forms')
      : t('withdrawal.forms.title', 'Forms');
  const subtitle =
    userType === 'agent'
      ? t('agent.forms.subtitle', 'Fill forms assigned to agents.')
      : t('withdrawal.forms.subtitle', 'Fill forms assigned to users.');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">{title}</h1>
        <p className="text-sm text-text-secondary mt-1">{subtitle}</p>
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
              : t('forms.portal.empty', 'No forms available right now.')}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('forms.col_title', 'Title')}</TableHead>
                <TableHead>{t('forms.portal.col_submitted', 'Submitted')}</TableHead>
                <TableHead>{t('forms.col_updated', 'Last Updated')}</TableHead>
                <TableHead className="text-right">
                  {t('forms.portal.col_action', 'Action')}
                </TableHead>
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
                    {form.isSubmitted === true ? (
                      <Badge variant="success">
                        {t('forms.portal.submitted_yes', 'Submitted')}
                      </Badge>
                    ) : form.isSubmitted === false ? (
                      <Badge variant="warning">
                        {t('forms.portal.submitted_no', 'Not submitted')}
                      </Badge>
                    ) : (
                      <Badge variant="neutral">{t('forms.portal.submitted_na', 'N/A')}</Badge>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(form.updatedAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      onClick={() => navigate(`${detailsPathPrefix}/${form.id}`)}
                    >
                      {form.isSubmitted
                        ? t('forms.portal.edit', 'Edit')
                        : t('forms.portal.fill', 'Fill')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
