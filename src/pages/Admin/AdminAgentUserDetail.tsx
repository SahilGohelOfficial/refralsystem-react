import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Eye, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Table, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import PortalFormViewModal from '../../components/forms/portal/PortalFormViewModal';
import { formatApiError } from '../../lib/api';
import { getAgentUser, listAgentUserForms } from '../../services/agents.service';
import type { ApiError, FormSummary, ReferralUser, UserStatus } from '../../types/api';
import { formatUserName } from '../../types/api';

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

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const statusVariant = (status: UserStatus) => {
  if (status === 'pending') return 'warning';
  if (status === 'rejected') return 'error';
  return 'success';
};

const statusLabel = (status: UserStatus) => {
  if (status === 'pending') return 'Pending';
  if (status === 'rejected') return 'Rejected';
  return 'Accepted';
};

const AdminAgentUserDetail = () => {
  const { agentId = '', userId = '' } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<ReferralUser | null>(null);
  const [forms, setForms] = useState<FormSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewFormId, setViewFormId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!agentId || !userId) return;
    setLoading(true);
    try {
      const [userData, formsData] = await Promise.all([
        getAgentUser(agentId, userId),
        listAgentUserForms(agentId, userId),
      ]);
      setUser(userData);
      setForms(formsData);
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
      navigate(`/admin/agents/${agentId}`);
    } finally {
      setLoading(false);
    }
  }, [agentId, userId, navigate]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const filteredForms = useMemo(() => {
    const query = search.toLowerCase();
    return forms.filter(
      (form) =>
        form.title.toLowerCase().includes(query) ||
        (form.description?.toLowerCase().includes(query) ?? false),
    );
  }, [forms, search]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const filledCount = user.filledFormsCount ?? forms.filter((f) => f.isSubmitted === true).length;
  const totalCount = user.totalFormsCount ?? forms.length;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4 min-w-0">
        <Button
          type="button"
          variant="secondary"
          className="shrink-0 gap-2 mt-1"
          onClick={() => navigate(`/admin/agents/${agentId}`)}
        >
          <ArrowLeft size={16} />
          Back
        </Button>

        <div className="flex items-start gap-4 min-w-0">
          <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center text-primary text-xl font-bold shrink-0">
            {user.firstName.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-text truncate">{formatUserName(user)}</h1>
              <Badge variant={statusVariant(user.status)}>{statusLabel(user.status)}</Badge>
            </div>
            <p className="text-sm text-text-secondary mt-1">
              {user.phoneNumber} · {user.email}
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>User Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <dt className="text-xs text-text-secondary">First name</dt>
              <dd className="text-sm font-medium text-text mt-0.5">{user.firstName}</dd>
            </div>
            <div>
              <dt className="text-xs text-text-secondary">Middle name</dt>
              <dd className="text-sm font-medium text-text mt-0.5">{user.middleName ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-text-secondary">Last name</dt>
              <dd className="text-sm font-medium text-text mt-0.5">{user.lastName}</dd>
            </div>
            <div>
              <dt className="text-xs text-text-secondary">Phone</dt>
              <dd className="text-sm font-medium text-text mt-0.5">{user.phoneNumber}</dd>
            </div>
            <div>
              <dt className="text-xs text-text-secondary">Email</dt>
              <dd className="text-sm font-medium text-text break-all">{user.email}</dd>
            </div>
            <div>
              <dt className="text-xs text-text-secondary">Submitted</dt>
              <dd className="text-sm font-medium text-text mt-0.5">{formatDateTime(user.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-xs text-text-secondary">Referral by</dt>
              <dd className="text-sm font-medium text-text mt-0.5">{user.referredByName ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-text-secondary">Referral code</dt>
              <dd className="text-sm font-medium text-text mt-0.5 font-mono">
                {user.referralCode ?? '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-text-secondary">Forms</dt>
              <dd className="text-sm font-medium text-text mt-0.5">
                {filledCount}/{totalCount}{' '}
                <span className="text-text-secondary font-normal">completed</span>
              </dd>
            </div>
          </dl>

          {user.note ? (
            <div className="rounded-lg border border-error/30 bg-error/5 p-3">
              <p className="text-xs font-medium text-error mb-1">Rejection note</p>
              <p className="text-sm text-text">{user.note}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between bg-surface/50">
          <h2 className="text-lg font-semibold text-text">Forms</h2>
          <div className="w-full sm:w-72">
            <Input
              icon={Search}
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {filteredForms.length === 0 ? (
          <div className="p-12 text-center text-text-secondary">
            {search ? 'No forms match your search.' : 'No forms available right now.'}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Action</TableHead>
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
                    {form.isSubmitted === true ? (
                      <Badge variant="success">Submitted</Badge>
                    ) : form.isSubmitted === false ? (
                      <Badge variant="warning">Not submitted</Badge>
                    ) : (
                      <Badge variant="neutral">N/A</Badge>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(form.updatedAt)}</TableCell>
                  <TableCell className="text-right">
                    {form.isSubmitted === true ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        aria-label="View"
                        title="View"
                        onClick={() => setViewFormId(form.id)}
                      >
                        <Eye size={16} />
                      </Button>
                    ) : (
                      <span className="text-sm text-text-secondary">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <PortalFormViewModal
        isOpen={viewFormId !== null}
        onClose={() => setViewFormId(null)}
        formId={viewFormId}
        userId={userId}
        agentId={agentId}
      />
    </div>
  );
};

export default AdminAgentUserDetail;
