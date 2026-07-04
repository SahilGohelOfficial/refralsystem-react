import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Search } from 'lucide-react';
import AgentActionsMenu from '../../components/admin/AgentActionsMenu';
import ChainReferralBoard from '../../components/chains/ChainReferralBoard';
import toast from 'react-hot-toast';
import { Card } from '../../components/ui/Card';
import { Table, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { getAgent, getAgentChainReferrals, listAgentUsers } from '../../services/agents.service';
import { formatApiError } from '../../lib/api';
import type { Agent, ApiError, ChainWithUsers, ReferralUser, UserStatus } from '../../types/api';
import { formatAgentName, formatUserName } from '../../types/api';
import { formatLocation } from '../../lib/location';
import { formatLocalDate, formatLocalDateTime } from '../../lib/dates';

type UserTab = 'approved' | 'pending' | 'rejected';
type DetailTab = UserTab | 'chains';

const statusVariant = (status: UserStatus) => {
  if (status === 'pending') return 'warning';
  if (status === 'rejected') return 'error';
  return 'success';
};

const AgentDetail = () => {
  const { agentId = '' } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>('approved');
  const [users, setUsers] = useState<ReferralUser[]>([]);
  const [chains, setChains] = useState<ChainWithUsers[]>([]);
  const [loadingAgent, setLoadingAgent] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingChains, setLoadingChains] = useState(false);
  const [search, setSearch] = useState('');

  const fetchAgent = useCallback(async () => {
    if (!agentId) return;
    setLoadingAgent(true);
    try {
      setAgent(await getAgent(agentId));
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
      navigate('/admin/agents');
    } finally {
      setLoadingAgent(false);
    }
  }, [agentId, navigate]);

  const fetchUsers = useCallback(async (tab: UserTab) => {
    if (!agentId) return;
    setLoadingUsers(true);
    try {
      setUsers(await listAgentUsers(agentId, tab));
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
    } finally {
      setLoadingUsers(false);
    }
  }, [agentId]);

  useEffect(() => {
    void fetchAgent();
  }, [fetchAgent]);

  const fetchChains = useCallback(async () => {
    if (!agentId) return;
    setLoadingChains(true);
    try {
      const data = await getAgentChainReferrals(agentId);
      setChains(data.chains);
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
    } finally {
      setLoadingChains(false);
    }
  }, [agentId]);

  useEffect(() => {
    if (activeTab === 'chains') return;
    void fetchUsers(activeTab);
  }, [activeTab, fetchUsers]);

  useEffect(() => {
    if (activeTab !== 'chains') return;
    void fetchChains();
  }, [activeTab, fetchChains]);

  const filteredUsers = users.filter((user) => {
    const query = search.toLowerCase();
    const fullName = formatUserName(user).toLowerCase();
    return (
      fullName.includes(query) ||
      user.phoneNumber.includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  });

  const tabs: { id: DetailTab; label: string }[] = [
    { id: 'approved', label: 'Accepted Users' },
    { id: 'pending', label: 'Pending Users' },
    { id: 'rejected', label: 'Rejected Users' },
    {
      id: 'chains',
      label: t('admin.agent_detail.chain_view', 'Chain View'),
    },
  ];

  const emptyMessage = () => {
    if (search) return 'No users match your search.';
    if (activeTab === 'approved') return 'No accepted users yet.';
    if (activeTab === 'pending') return 'No pending users.';
    return 'No rejected users.';
  };

  if (loadingAgent) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!agent) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4 min-w-0">
          <Button
            type="button"
            variant="secondary"
            className="shrink-0 gap-2 mt-1"
            onClick={() => navigate('/admin/agents')}
          >
            <ArrowLeft size={16} />
            Back
          </Button>

          <div className="flex items-start gap-4 min-w-0">
            <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center text-primary text-xl font-bold shrink-0">
              {agent.firstName.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-text truncate">{formatAgentName(agent)}</h1>
                <Badge variant={agent.isActive ? 'success' : 'neutral'}>
                  {agent.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <p className="text-sm text-text-secondary font-mono mt-1">{agent.agentLoginId}</p>
            </div>
          </div>
        </div>

        <AgentActionsMenu
          agent={agent}
          onAgentChange={fetchAgent}
          onDeleted={() => navigate('/admin/agents')}
          trigger={
            <Button variant="secondary" className="gap-2 shrink-0">
              Actions
            </Button>
          }
        />
      </div>

      <Card>
        <div className="p-5 border-b border-border">
          <h2 className="text-lg font-semibold text-text">Agent Details</h2>
        </div>
        <div className="p-5">
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <dt className="text-xs text-text-secondary">First name</dt>
              <dd className="text-sm font-medium text-text mt-0.5">{agent.firstName}</dd>
            </div>
            <div>
              <dt className="text-xs text-text-secondary">Middle name</dt>
              <dd className="text-sm font-medium text-text mt-0.5">{agent.middleName ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-text-secondary">Last name</dt>
              <dd className="text-sm font-medium text-text mt-0.5">{agent.lastName}</dd>
            </div>
            <div>
              <dt className="text-xs text-text-secondary">Login ID</dt>
              <dd className="text-sm font-medium text-text mt-0.5 font-mono">{agent.agentLoginId}</dd>
            </div>
            <div>
              <dt className="text-xs text-text-secondary">Email</dt>
              <dd className="text-sm font-medium text-text break-all mt-0.5">{agent.email ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-text-secondary">Phone</dt>
              <dd className="text-sm font-medium text-text mt-0.5">{agent.phoneNumber ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-text-secondary">Location</dt>
              <dd className="text-sm font-medium text-text mt-0.5">{formatLocation(agent.state, agent.city)}</dd>
            </div>
            <div>
              <dt className="text-xs text-text-secondary">Last login</dt>
              <dd className="text-sm font-medium text-text mt-0.5">
                {formatLocalDateTime(agent.lastLogin)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-text-secondary">Created</dt>
              <dd className="text-sm font-medium text-text mt-0.5">
                {formatLocalDateTime(agent.createdAt)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-text-secondary">Updated</dt>
              <dd className="text-sm font-medium text-text mt-0.5">
                {formatLocalDateTime(agent.updatedAt)}
              </dd>
            </div>
          </dl>

          {agent.bankDetails ? (
            <>
              <div className="pt-4 mt-2 border-t border-border">
                <h3 className="text-sm font-semibold text-text">Bank Details</h3>
              </div>
              <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-3">
                <div>
                  <dt className="text-xs text-text-secondary">Account holder name</dt>
                  <dd className="text-sm font-medium text-text mt-0.5">
                    {agent.bankDetails.accountHolderName}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-text-secondary">Account number</dt>
                  <dd className="text-sm font-medium text-text mt-0.5 font-mono">
                    {agent.bankDetails.accountNumber}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-text-secondary">IFSC code</dt>
                  <dd className="text-sm font-medium text-text mt-0.5 font-mono">
                    {agent.bankDetails.ifscCode}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-text-secondary">Submitted</dt>
                  <dd className="text-sm font-medium text-text mt-0.5">
                    {formatLocalDateTime(agent.bankDetails.createdAt)}
                  </dd>
                </div>
              </dl>
            </>
          ) : null}
        </div>
      </Card>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px
                ${activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:text-text'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'chains' ? (
          <div className="space-y-3">
            <p className="text-sm text-text-secondary">
              {t(
                'admin.agent_detail.chain_view_desc',
                'All chains and this agent’s referral positions within each.',
              )}
            </p>
            <ChainReferralBoard
              chains={chains}
              loading={loadingChains}
              onUserClick={(userId) =>
                navigate(`/admin/agents/${agentId}/users/${userId}`)
              }
            />
          </div>
        ) : (
          <Card className="p-0">
            <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface/50 rounded-t-[20px]">
              <div className="w-full sm:w-96">
                <Input
                  icon={Search}
                  placeholder="Search by name, phone, or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {loadingUsers ? (
              <div className="p-12 flex justify-center">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-12 text-center text-text-secondary">{emptyMessage()}</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead>Forms</TableHead>
                  </TableRow>
                </TableHeader>
                <tbody>
                  {filteredUsers.map((user) => (
                    <TableRow
                      key={user.id}
                      className="cursor-pointer hover:bg-surface/50"
                      onClick={() => navigate(`/admin/agents/${agentId}/users/${user.id}`)}
                    >
                      <TableCell>
                        <div className="font-medium text-text">{formatUserName(user)}</div>
                      </TableCell>
                      <TableCell>{user.phoneNumber}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(user.status)}>
                          {user.status === 'pending'
                            ? 'Pending'
                            : user.status === 'rejected'
                              ? 'Rejected'
                              : 'Accepted'}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatLocalDate(user.createdAt)}</TableCell>
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
        )}
      </div>
    </div>
  );
};

export default AgentDetail;
