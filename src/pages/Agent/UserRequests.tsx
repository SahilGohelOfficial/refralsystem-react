import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Loader from '../../components/ui/Loader';
import TabCount from '../../components/ui/TabCount';
import { useMyUserRequestCounts, useMyUsers } from '../../hooks/queries';
import { useToastOnError } from '../../hooks/useToastOnError';
import { paymentStatusBadgeVariant, paymentStatusLabel } from '../../lib/labels';
import type { UserStatus } from '../../types/api';
import { formatUserName } from '../../types/api';
import { formatLocalDate } from '../../lib/dates';

type RequestTab = 'pending' | 'rejected';

const EMPTY_COUNTS = { pending: 0, rejected: 0 };

const statusVariant = (status: UserStatus | null) => {
  if (status === 'pending') return 'warning';
  if (status === 'rejected') return 'error';
  return 'success';
};

const UserRequests = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<RequestTab>('pending');
  const [search, setSearch] = useState('');
  const { data: counts = EMPTY_COUNTS, error: countsError } = useMyUserRequestCounts();
  const { data: users = [], isLoading, error } = useMyUsers(activeTab);
  useToastOnError(error);
  useToastOnError(countsError);

  const query = search.toLowerCase();
  const filteredUsers = users.filter((user) => {
    const fullName = formatUserName(user).toLowerCase();
    return (
      fullName.includes(query) ||
      user.phoneNumber.includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  });

  const tabs: { id: RequestTab; label: string; count: number }[] = [
    {
      id: 'pending',
      label: t('agent.user_requests.tab_pending', 'Pending'),
      count: counts.pending,
    },
    {
      id: 'rejected',
      label: t('agent.user_requests.tab_rejected', 'Rejected'),
      count: counts.rejected,
    },
  ];

  const emptyMessage = search
    ? t('agent.user_requests.no_results', 'No users match your search.')
    : activeTab === 'pending'
      ? t('agent.user_requests.empty_pending', 'No pending requests.')
      : t('agent.user_requests.empty_rejected', 'No rejected requests.');

  return (
    <div className="page-shell space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">
          {t('agent.user_requests.title', 'User Requests')}
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {t('agent.user_requests.subtitle', 'Review pending and rejected user registrations.')}
        </p>
      </div>

      <div className="flex gap-2 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text'
            }`}
          >
            {tab.label}
            <TabCount count={tab.count} active={activeTab === tab.id} />
          </button>
        ))}
      </div>

      <Card padding="none" className="data-card">
        <div className="table-toolbar">
          <div className="w-full sm:max-w-md">
            <Input
              icon={Search}
              placeholder={t('agent.user_requests.search', 'Search users...')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <Loader text={t('common.loading', 'Loading...')} />
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center text-sm text-text-secondary">{emptyMessage}</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('agent.user_requests.col_user', 'User')}</TableHead>
                <TableHead>{t('agent.user_requests.col_phone', 'Phone')}</TableHead>
                <TableHead>{t('agent.user_requests.col_status', 'Status')}</TableHead>
                <TableHead>{t('agent.user_requests.col_payment', 'Payment')}</TableHead>
                <TableHead>{t('agent.user_requests.col_registered', 'Registered')}</TableHead>
              </TableRow>
            </TableHeader>
            <tbody>
              {filteredUsers.map((user) => (
                <TableRow
                  key={user.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/agent/user-requests/${user.id}`)}
                >
                  <TableCell>
                    <div className="font-medium text-text">{formatUserName(user)}</div>
                    <div className="text-xs text-text-secondary">{user.email}</div>
                  </TableCell>
                  <TableCell>{user.phoneNumber}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(user.status)} dot>
                      {user.status ?? '—'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.payment ? (
                      <Badge variant={paymentStatusBadgeVariant(user.payment.status)} dot>
                        {paymentStatusLabel(user.payment.status)}
                      </Badge>
                    ) : (
                      <span className="text-sm text-text-secondary">—</span>
                    )}
                  </TableCell>
                  <TableCell>{formatLocalDate(user.createdAt)}</TableCell>
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
