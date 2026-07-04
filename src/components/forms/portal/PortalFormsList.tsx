import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Search, Eye } from 'lucide-react';
import { Card } from '../../ui/Card';
import { Table, TableCell, TableHead, TableHeader, TableRow } from '../../ui/Table';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Badge from '../../ui/Badge';
import Loader from '../../ui/Loader';
import { useForms } from '../../../hooks/queries';
import { useToastOnError } from '../../../hooks/useToastOnError';
import PortalFormViewModal from './PortalFormViewModal';
import type { SubmissionUserType } from '../../../types/api';
import { formatLocalDate } from '../../../lib/dates';

type PortalFormsListProps = {
  userType: SubmissionUserType;
  detailsPathPrefix: string;
};

export default function PortalFormsList({
  userType,
  detailsPathPrefix,
}: PortalFormsListProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: forms = [], isLoading, error } = useForms(userType);
  useToastOnError(error);

  const [search, setSearch] = useState('');
  const [viewFormId, setViewFormId] = useState<string | null>(null);

  const filteredForms = useMemo(() => {
    const query = search.toLowerCase();
    return forms.filter(
      (form) =>
        form.title.toLowerCase().includes(query) ||
        (form.description?.toLowerCase().includes(query) ?? false),
    );
  }, [forms, search]);

  const title =
    userType === 'agent'
      ? t('agent.forms.title', 'Forms')
      : t('user_portal.forms.title', 'Forms');

  const subtitle =
    userType === 'agent'
      ? t('agent.forms.subtitle', 'View and submit assigned forms.')
      : t('user_portal.forms.subtitle', 'View and submit your assigned forms.');

  return (
    <div className="page-shell space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">{title}</h1>
        <p className="text-sm text-text-secondary mt-1">{subtitle}</p>
      </div>

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

        {isLoading ? (
          <Loader text={t('common.loading', 'Loading...')} />
        ) : filteredForms.length === 0 ? (
          <div className="py-16 text-center text-sm text-text-secondary">
            {search
              ? t('forms.no_results', 'No forms match your search.')
              : t('forms.empty', 'No forms available.')}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('forms.col_title', 'Title')}</TableHead>
                <TableHead>{t('forms.col_published', 'Published')}</TableHead>
                <TableHead>{t('forms.col_updated', 'Last Updated')}</TableHead>
                <TableHead className="text-right">{t('forms.col_actions', 'Actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <tbody>
              {filteredForms.map((form) => (
                <TableRow key={form.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-text">{form.title}</div>
                      {form.description ? (
                        <div className="text-xs text-text-secondary truncate max-w-xs">
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
                  <TableCell>{formatLocalDate(form.updatedAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="secondary" onClick={() => setViewFormId(form.id)}>
                        <Eye size={14} />
                        {t('forms.view', 'View')}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => navigate(`${detailsPathPrefix}/${form.id}`)}
                      >
                        {t('forms.submit', 'Submit')}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <PortalFormViewModal
        formId={viewFormId}
        onClose={() => setViewFormId(null)}
        userType={userType}
      />
    </div>
  );
}