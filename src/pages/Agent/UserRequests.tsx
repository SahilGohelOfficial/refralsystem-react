import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '../../components/ui/Card';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import { listMyUsers } from '../../services/agents.service';
import { formatApiError } from '../../lib/api';
import type { ApiError, ReferralUser, UserStatus } from '../../types/api';
import { formatUserName } from '../../types/api';

type RequestTab = 'pending' | 'rejected';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

const statusVariant = (status: UserStatus) => {
  if (status === 'pending') return 'warning';
  if (status === 'rejected') return 'error';
  return 'success';
};

const UserRequests = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<RequestTab>('pending');
  const [users, setUsers] = useState<ReferralUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = useCallback(async (tab: RequestTab) => {
    setLoading(true);
    try {
      const data = await listMyUsers(tab);
      setUsers(data);
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchUsers(activeTab);
  }, [activeTab, fetchUsers]);

  const filteredUsers = users.filter((user) => {
    const query = search.toLowerCase();
    const fullName = formatUserName(user).toLowerCase();
    return (
      fullName.includes(query) ||
      user.phoneNumber.includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  });

  const tabs: { id: RequestTab; label: string }[] = [
    { id: 'pending', label: t('agent.user_requests.tab_pending', 'Pending') },
    { id: 'rejected', label: t('agent.user_requests.tab_rejected', 'Rejected') },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">
          {t('agent.user_requests.title', 'User Requests')}
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {t('agent.user_requests.subtitle', 'Review and approve or reject user registration requests.')}
        </p>
      </div>

      <div className="flex gap-2 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setActiveTab(tab.id);
              setSearch('');
            }}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px
              ${activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Card className="p-0">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface/50 rounded-t-[20px]">
          <div className="w-full sm:w-96">
            <Input
              icon={Search}
              placeholder={t('agent.user_requests.search', 'Search by name, phone, or email...')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-text-secondary">
            {search
              ? t('agent.user_requests.no_results', 'No requests match your search.')
              : activeTab === 'pending'
                ? t('agent.user_requests.empty_pending', 'No pending requests.')
                : t('agent.user_requests.empty_rejected', 'No rejected requests.')}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('agent.user_requests.col_name', 'Name')}</TableHead>
                <TableHead>{t('agent.user_requests.col_phone', 'Phone')}</TableHead>
                <TableHead>{t('agent.user_requests.col_email', 'Email')}</TableHead>
                <TableHead>{t('agent.user_requests.col_status', 'Status')}</TableHead>
                <TableHead>{t('agent.user_requests.col_submitted', 'Submitted')}</TableHead>
                <TableHead>{t('agent.user_requests.col_forms', 'Forms')}</TableHead>
              </TableRow>
            </TableHeader>
            <tbody>
              {filteredUsers.map((user) => (
                <TableRow
                  key={user.id}
                  className="cursor-pointer hover:bg-surface/50"
                  onClick={() => navigate(`/agent/user-requests/${user.id}`)}
                >
                  <TableCell>
                    <div className="font-medium text-text">{formatUserName(user)}</div>
                  </TableCell>
                  <TableCell>{user.phoneNumber}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(user.status)}>
                      {user.status === 'pending'
                        ? t('agent.user_requests.status_pending', 'Pending')
                        : t('agent.user_requests.status_rejected', 'Rejected')}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell>
                    <span className="font-medium text-text">
                      {user.filledFormsCount ?? 0}/{user.totalFormsCount ?? 0}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
};

export default UserRequests;
