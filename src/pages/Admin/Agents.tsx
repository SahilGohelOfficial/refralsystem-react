import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '../../components/ui/Card';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import AgentActionsMenu from '../../components/admin/AgentActionsMenu';
import AgentFormFields from '../../components/admin/AgentFormFields';
import CredentialsModal from '../../components/admin/CredentialsModal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import PageHeader from '../../components/ui/PageHeader';
import Loader from '../../components/ui/Loader';
import { useAgents, useCreateAgent } from '../../hooks/queries';
import { useLocationSelect } from '../../hooks/useLocationSelect';
import { useToastOnError } from '../../hooks/useToastOnError';
import { formatLocation } from '../../lib/location';
import { agentStatusBadgeVariant, agentStatusLabel } from '../../lib/labels';
import type { AgentCredentials, AgentStatus } from '../../types/api';
import { formatAgentName, choiceToGender } from '../../types/api';

const STATUS_TABS: { id: AgentStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'active', label: 'Active' },
  { id: 'inactive', label: 'Inactive' },
  { id: 'rejected', label: 'Rejected' },
];

const Agents = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<AgentStatus | 'all'>('all');
  const { data: agents = [], isLoading, error } = useAgents(
    statusFilter === 'all' ? undefined : statusFilter,
  );
  const createAgentMutation = useCreateAgent();
  useToastOnError(error);

  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [credentials, setCredentials] = useState<AgentCredentials | null>(null);
  const [formFirstName, setFormFirstName] = useState('');
  const [formMiddleName, setFormMiddleName] = useState('');
  const [formLastName, setFormLastName] = useState('');
  const [formGenderChoice, setFormGenderChoice] = useState('');
  const [formGenderError, setFormGenderError] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhoneNumber, setFormPhoneNumber] = useState('');
  const location = useLocationSelect();

  const resetForm = () => {
    setFormFirstName('');
    setFormMiddleName('');
    setFormLastName('');
    setFormGenderChoice('');
    setFormGenderError('');
    setFormEmail('');
    setFormPhoneNumber('');
    location.reset();
  };

  const openCreate = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    const gender = choiceToGender(formGenderChoice);
    if (!gender) {
      setFormGenderError('Please select gender');
      return;
    }
    setFormGenderError('');
    const { state, city } = location.resolveNames();
    if (!state || !city) {
      toast.error('Please select state and city');
      return;
    }

    try {
      const result = await createAgentMutation.mutateAsync({
        firstName: formFirstName.trim(),
        middleName: formMiddleName.trim() || undefined,
        lastName: formLastName.trim(),
        gender,
        email: formEmail || undefined,
        phoneNumber: formPhoneNumber || undefined,
        state,
        city,
      });
      toast.success('Agent created successfully');
      setIsCreateOpen(false);
      setCredentials(result.credentials);
      resetForm();
    } catch {
      // Errors handled by mutation hooks
    }
  };

  const query = search.toLowerCase();
  const filteredAgents = agents.filter((agent) => {
    const fullName = formatAgentName(agent).toLowerCase();
    return (
      fullName.includes(query) ||
      agent.firstName.toLowerCase().includes(query) ||
      (agent.middleName?.toLowerCase().includes(query) ?? false) ||
      agent.lastName.toLowerCase().includes(query) ||
      agent.agentLoginId.toLowerCase().includes(query) ||
      (agent.email?.toLowerCase().includes(query) ?? false) ||
      (agent.state?.toLowerCase().includes(query) ?? false) ||
      (agent.city?.toLowerCase().includes(query) ?? false)
    );
  });

  return (
    <div className="page-shell">
      <PageHeader
        title="Agent Management"
        description="Manage partner agents and their accounts."
        actions={
          <Button onClick={openCreate}>
            <Plus size={16} />
            Add New Agent
          </Button>
        }
      />

      <Card padding="none" className="data-card">
        <div className="table-toolbar flex-col items-stretch sm:items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {STATUS_TABS.map((tab) => {
              const selected = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    selected
                      ? 'border-primary/40 bg-primary-muted text-primary'
                      : 'border-border bg-surface text-text-secondary hover:border-border-strong hover:text-text'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
          <div className="w-full sm:max-w-md">
            <Input
              icon={Search}
              placeholder="Search by name, login ID, email, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <Loader text="Loading agents..." />
        ) : filteredAgents.length === 0 ? (
          <div className="py-16 text-center text-sm text-text-secondary">
            {search
              ? 'No agents match your search.'
              : statusFilter === 'pending'
                ? 'No pending agent requests.'
                : 'No agents yet. Create your first agent.'}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>Login ID</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-center">All Users</TableHead>
                <TableHead className="text-center">Pending Users</TableHead>
                <TableHead className="text-center">Accepted Users</TableHead>
                <TableHead className="text-center">Rejected Users</TableHead>
                <TableHead className="text-center">Payment Requests</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <tbody>
              {filteredAgents.map((agent) => (
                <TableRow key={agent.id} onClick={() => navigate(`/admin/agents/${agent.id}`)}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="avatar w-10 h-10 text-sm">{agent.firstName.charAt(0)}</div>
                      <div>
                        <div className="font-medium text-text">{formatAgentName(agent)}</div>
                        <div className="text-xs text-text-secondary">{agent.email ?? 'No email'}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">{agent.agentLoginId}</span>
                  </TableCell>
                  <TableCell>{formatLocation(agent.state, agent.city)}</TableCell>
                  <TableCell>{agent.phoneNumber ?? '—'}</TableCell>
                  <TableCell className="text-center">{agent.allUsersCount ?? 0}</TableCell>
                  <TableCell className="text-center">{agent.pendingUsersCount ?? 0}</TableCell>
                  <TableCell className="text-center">{agent.approvedUsersCount ?? 0}</TableCell>
                  <TableCell className="text-center">{agent.rejectedUsersCount ?? 0}</TableCell>
                  <TableCell className="text-center">{agent.paymentRequestsCount ?? 0}</TableCell>
                  <TableCell>
                    <Badge variant={agentStatusBadgeVariant(agent.status)} dot>
                      {agentStatusLabel(agent.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <AgentActionsMenu agent={agent} />
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add New Agent"
        maxWidth="lg"
      >
        <AgentFormFields
          firstName={formFirstName}
          setFirstName={setFormFirstName}
          middleName={formMiddleName}
          setMiddleName={setFormMiddleName}
          lastName={formLastName}
          setLastName={setFormLastName}
          genderChoice={formGenderChoice}
          setGenderChoice={setFormGenderChoice}
          genderError={formGenderError}
          email={formEmail}
          setEmail={setFormEmail}
          phoneNumber={formPhoneNumber}
          setPhoneNumber={setFormPhoneNumber}
          stateId={location.stateId}
          setStateId={location.setStateId}
          cityId={location.cityId}
          setCityId={location.setCityId}
          stateOptions={location.stateOptions}
          cityOptions={location.cityOptions}
          loadingCities={location.loadingCities}
          submitting={createAgentMutation.isPending}
          submitLabel="Create Agent"
          onSubmit={handleCreate}
          onCancel={() => {
            setIsCreateOpen(false);
            resetForm();
          }}
        />
      </Modal>

      <CredentialsModal credentials={credentials} onClose={() => setCredentials(null)} />
    </div>
  );
};

export default Agents;