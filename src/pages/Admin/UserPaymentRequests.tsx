import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Loader from '../../components/ui/Loader';
import PageHeader from '../../components/ui/PageHeader';
import TabCount from '../../components/ui/TabCount';
import { usePaymentRequestCounts, usePaymentRequests } from '../../hooks/queries';
import { useToastOnError } from '../../hooks/useToastOnError';
import { paymentStatusBadgeVariant, paymentStatusLabel } from '../../lib/labels';
import type { PaymentStatus } from '../../types/api';
import { formatLocalDate } from '../../lib/dates';

type PaymentTab = PaymentStatus | 'all';

const EMPTY_COUNTS = { pending: 0, received: 0, notReceived: 0, all: 0 };

const formatName = (
  firstName: string | null | undefined,
  middleName: string | null | undefined,
  lastName: string | null | undefined,
) => [firstName, middleName, lastName].filter(Boolean).join(' ').trim();

const UserPaymentRequests = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<PaymentTab>('pending');
  const [search, setSearch] = useState('');
  const { data: counts = EMPTY_COUNTS, error: countsError } = usePaymentRequestCounts();
  const {
    data: requests = [],
    isLoading,
    error,
  } = usePaymentRequests(activeTab === 'all' ? undefined : activeTab);
  useToastOnError(error);
  useToastOnError(countsError);

  const query = search.toLowerCase();
  const filteredRequests = requests.filter((request) => {
    const userName = formatName(
      request.userFirstName,
      request.userMiddleName,
      request.userLastName,
    ).toLowerCase();
    const agentName = formatName(
      request.agentFirstName,
      request.agentMiddleName,
      request.agentLastName,
    ).toLowerCase();

    return (
      userName.includes(query) ||
      request.userPhoneNumber.includes(query) ||
      request.userEmail.toLowerCase().includes(query) ||
      agentName.includes(query) ||
      (request.agentLoginId?.toLowerCase().includes(query) ?? false)
    );
  });

  const tabs: { id: PaymentTab; label: string; count: number }[] = [
    { id: 'pending', label: t('admin.payment_requests.tab_pending', 'Pending'), count: counts.pending },
    { id: 'received', label: t('admin.payment_requests.tab_received', 'Received'), count: counts.received },
    {
      id: 'not_received',
      label: t('admin.payment_requests.tab_not_received', 'Not received'),
      count: counts.notReceived,
    },
    { id: 'all', label: t('admin.payment_requests.tab_all', 'All'), count: counts.all },
  ];

  const emptyMessage = search
    ? t('admin.payment_requests.no_results', 'No payment requests match your search.')
    : t(`admin.payment_requests.empty_${activeTab}`, 'No payment requests yet.');

  return (
    <div className="page-shell space-y-6">
      <PageHeader
        title={t('admin.payment_requests.title', 'User Payment Requests')}
        description={t(
          'admin.payment_requests.subtitle',
          'Review and manage payment requests submitted by agents for their users.',
        )}
      />

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
              placeholder={t(
                'admin.payment_requests.search',
                'Search by user, agent, phone, or email...',
              )}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <Loader text={t('common.loading', 'Loading...')} />
        ) : filteredRequests.length === 0 ? (
          <div className="py-16 text-center text-sm text-text-secondary">{emptyMessage}</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('admin.payment_requests.col_user', 'User')}</TableHead>
                <TableHead>{t('admin.payment_requests.col_agent', 'Agent')}</TableHead>
                <TableHead>{t('admin.payment_requests.col_phone', 'Phone')}</TableHead>
                <TableHead>{t('admin.payment_requests.col_status', 'Payment Status')}</TableHead>
                <TableHead>{t('admin.payment_requests.col_submitted', 'Submitted')}</TableHead>
              </TableRow>
            </TableHeader>
            <tbody>
              {filteredRequests.map((request) => (
                <TableRow
                  key={request.id}
                  className={request.agentId ? 'cursor-pointer' : undefined}
                  onClick={() => {
                    if (!request.agentId) return;
                    navigate(`/admin/agents/${request.agentId}/users/${request.userId}`);
                  }}
                >
                  <TableCell>
                    <div className="font-medium text-text">
                      {formatName(
                        request.userFirstName,
                        request.userMiddleName,
                        request.userLastName,
                      )}
                    </div>
                    <div className="text-xs text-text-secondary">{request.userEmail}</div>
                  </TableCell>
                  <TableCell>
                    {request.agentId ? (
                      <>
                        <div className="font-medium text-text">
                          {formatName(
                            request.agentFirstName,
                            request.agentMiddleName,
                            request.agentLastName,
                          )}
                        </div>
                        <div className="text-xs text-text-secondary font-mono">
                          {request.agentLoginId ?? '—'}
                        </div>
                      </>
                    ) : (
                      <span className="text-sm text-text-secondary">—</span>
                    )}
                  </TableCell>
                  <TableCell>{request.userPhoneNumber}</TableCell>
                  <TableCell>
                    <Badge variant={paymentStatusBadgeVariant(request.status)} dot>
                      {paymentStatusLabel(request.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatLocalDate(request.createdAt)}</TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
};

export default UserPaymentRequests;
