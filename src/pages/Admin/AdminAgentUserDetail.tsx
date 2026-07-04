import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Eye, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Table, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Loader from '../../components/ui/Loader';
import PortalFormViewModal from '../../components/forms/portal/PortalFormViewModal';
import { useAgentUser, useAgentUserForms } from '../../hooks/queries';
import { useToastOnError } from '../../hooks/useToastOnError';
import { formatApiError } from '../../lib/api';
import type { ApiError, UserStatus } from '../../types/api';
import { formatUserName } from '../../types/api';
import { formatLocalDate, formatLocalDateTime } from '../../lib/dates';

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
  const [search, setSearch] = useState('');
  const [viewFormId, setViewFormId] = useState<string | null>(null);

  const { data: user, isLoading: loadingUser, error: userError } = useAgentUser(agentId, userId);
  const { data: forms = [], isLoading: loadingForms, error: formsError } = useAgentUserForms(
    agentId,
    userId,
  );
  useToastOnError(formsError);

  useEffect(() => {
    if (!userError) return;
    toast.error(formatApiError(userError as ApiError));
    navigate(`/admin/agents/${agentId}`);
  }, [userError, agentId, navigate]);

  const filteredForms = useMemo(() => {
    const query = search.toLowerCase();
    return forms.filter(
      (form) =>
        form.title.toLowerCase().includes(query) ||
        (form.description?.toLowerCase().includes(query) ?? false),
    );
  }, [forms, search]);

  const isLoading = loadingUser || loadingForms;

  if (isLoading) {
    return <Loader size="lg" className="min-h-[50vh]" />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="page-shell space-y-6">
      <Button variant="secondary" onClick={() => navigate(`/admin/agents/${agentId}`)}>
        <ArrowLeft size={16} />
        Back to Agent
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{formatUserName(user)}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 text-sm">
          <div>
            <span className="text-text-secondary">Email</span>
            <p className="font-medium text-text">{user.email}</p>
          </div>
          <div>
            <span className="text-text-secondary">Phone</span>
            <p className="font-medium text-text">{user.phoneNumber}</p>
          </div>
          <div>
            <span className="text-text-secondary">Status</span>
            <p>
              <Badge variant={statusVariant(user.status)} dot>
                {statusLabel(user.status)}
              </Badge>
            </p>
          </div>
          <div>
            <span className="text-text-secondary">Registered</span>
            <p className="font-medium text-text">{formatLocalDateTime(user.createdAt)}</p>
          </div>
        </CardContent>
      </Card>

      <Card padding="none" className="data-card">
        <div className="table-toolbar">
          <div className="w-full sm:max-w-md">
            <Input
              icon={Search}
              placeholder="Search forms..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {filteredForms.length === 0 ? (
          <div className="py-16 text-center text-sm text-text-secondary">
            {search ? 'No forms match your search.' : 'No forms assigned to this user.'}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Published</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <tbody>
              {filteredForms.map((form) => (
                <TableRow key={form.id}>
                  <TableCell>
                    <div className="font-medium text-text">{form.title}</div>
                    {form.description ? (
                      <div className="text-xs text-text-secondary truncate max-w-xs">
                        {form.description}
                      </div>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <Badge variant={form.isPublished ? 'success' : 'neutral'} dot>
                      {form.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                  </TableCell>
                  <TableCell>{form.submittedCount ?? 0}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="secondary" onClick={() => setViewFormId(form.id)}>
                      <Eye size={14} />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <PortalFormViewModal
        isOpen={!!viewFormId}
        formId={viewFormId}
        onClose={() => setViewFormId(null)}
        agentId={agentId}
        userId={userId}
      />
    </div>
  );
};

export default AdminAgentUserDetail;