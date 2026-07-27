import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, Search } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Loader from '../../components/ui/Loader';
import Modal from '../../components/ui/Modal';
import FormResponsePreview from '../../components/forms/FormResponsePreview';
import { getFormResponseFileDownloadUrl } from '../../services/forms.service';
import { useForm, useFormResponses } from '../../hooks/queries';
import { useToastOnError } from '../../hooks/useToastOnError';
import type { FormResponse } from '../../types/api';
import { formatLocalDateTime } from '../../lib/dates';

export default function FormResponses() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { formId = '' } = useParams<{ formId: string }>();

  const { data: form, error: formError } = useForm(formId);
  const { data: responses = [], isLoading, error: responsesError } = useFormResponses(formId);
  useToastOnError(formError);
  useToastOnError(responsesError);

  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<FormResponse | null>(null);

  useEffect(() => {
    if (formError || responsesError) {
      navigate('/admin/forms', { replace: true });
    }
  }, [formError, responsesError, navigate]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return responses;
    return responses.filter((response) => {
      const name = response.submitter?.name?.toLowerCase() ?? '';
      const phone = response.submitter?.phoneNumber?.toLowerCase() ?? '';
      return name.includes(q) || phone.includes(q);
    });
  }, [responses, search]);

  const onDownloadFile = useCallback(
    async (fieldId: string, responseId: string) => {
      const res = await getFormResponseFileDownloadUrl(formId, responseId, fieldId);
      return res.downloadUrl;
    },
    [formId],
  );

  if (isLoading) {
    return <Loader text={t('common.loading', 'Loading...')} />;
  }

  return (
    <div className="page-shell space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">
            {form?.title ?? t('forms.responses_title', 'Form Responses')}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {t('forms.responses_subtitle', '{{count}} responses', {
              count: responses.length,
            })}
          </p>
        </div>
        <Button variant="secondary" onClick={() => navigate('/admin/forms')}>
          {t('forms.back_to_list', 'Back to forms list')}
        </Button>
      </div>

      <div className="w-full sm:max-w-xs sm:ml-auto">
        <Input
          icon={Search}
          placeholder={t(
            'forms.responses_search',
            'Search by name or phone…',
          )}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <Card className="p-12 text-center text-text-secondary">
          {responses.length === 0
            ? t('forms.no_responses', 'No responses yet.')
            : t('forms.responses_no_match', 'No submitters match your search.')}
        </Card>
      ) : (
        <Card padding="none" className="data-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('forms.response_submitter', 'Submitter')}</TableHead>
                <TableHead>{t('forms.response_type', 'Type')}</TableHead>
                <TableHead>{t('forms.response_phone', 'Phone')}</TableHead>
                <TableHead>{t('forms.response_submitted', 'Submitted')}</TableHead>
                <TableHead className="text-right">
                  {t('forms.response_actions', 'Actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <tbody>
              {filtered.map((response) => {
                const name =
                  response.submitter?.name?.trim() ||
                  t('forms.responses.unknown_submitter', 'Unknown submitter');
                const type = response.submitterType ?? response.submitter?.type;
                const phone = response.submitter?.phoneNumber ?? '—';

                return (
                  <TableRow key={response.id}>
                    <TableCell>
                      <div className="font-medium text-text">{name}</div>
                    </TableCell>
                    <TableCell>
                      {type ? (
                        <Badge variant={type === 'agent' ? 'primary' : 'neutral'} dot>
                          {type === 'agent'
                            ? t('forms.submitter_agent', 'Agent')
                            : t('forms.submitter_user', 'User')}
                        </Badge>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell className="text-text-secondary">{phone}</TableCell>
                    <TableCell className="text-text-secondary">
                      {formatLocalDateTime(response.submittedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="gap-1.5"
                        onClick={() => setSelected(response)}
                      >
                        <Eye size={14} />
                        {t('forms.view_response', 'View')}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </tbody>
          </Table>
        </Card>
      )}

      <Modal
        isOpen={selected !== null}
        onClose={() => setSelected(null)}
        title={form?.title ?? t('forms.portal.view_title', 'Submitted form')}
        maxWidth="2xl"
      >
        <div className="max-h-[70vh] overflow-y-auto -mx-1 px-1">
          <FormResponsePreview
            form={form ?? null}
            response={selected}
            showSubmitterMeta
            onDownloadFile={onDownloadFile}
          />
        </div>
      </Modal>
    </div>
  );
}
