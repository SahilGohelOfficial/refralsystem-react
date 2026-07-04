import React, { useState, useEffect, useCallback, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
  KeyRound,
  UserX,
  UserCheck,
  Copy,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '../../components/ui/Card';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import { Dropdown, DropdownItem } from '../../components/ui/Dropdown';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import PageHeader from '../../components/ui/PageHeader';
import IconButton from '../../components/ui/IconButton';
import Loader from '../../components/ui/Loader';
import {
  createAgent,
  deleteAgent,
  listAgents,
  resetAgentPassword,
  updateAgent,
  updateAgentStatus,
} from '../../services/agents.service';
import { listCities, listStates } from '../../services/location.service';
import { formatApiError } from '../../lib/api';
import type { Agent, AgentCredentials, ApiError, City, State } from '../../types/api';
import { formatAgentName } from '../../types/api';

const Agents = () => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [credentials, setCredentials] = useState<AgentCredentials | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  const [formFirstName, setFormFirstName] = useState('');
  const [formMiddleName, setFormMiddleName] = useState('');
  const [formLastName, setFormLastName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhoneNumber, setFormPhoneNumber] = useState('');
  const [formStateId, setFormStateId] = useState('');
  const [formCityId, setFormCityId] = useState('');

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listAgents();
      setAgents(data);
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStates = useCallback(async () => {
    try {
      const data = await listStates();
      setStates(data);
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
    }
  }, []);

  const loadCitiesForState = useCallback(async (stateId: number) => {
    setLoadingCities(true);
    try {
      const data = await listCities(stateId);
      setCities(data);
      return data;
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
      setCities([]);
      return [];
    } finally {
      setLoadingCities(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
    fetchStates();
  }, [fetchAgents, fetchStates]);

  useEffect(() => {
    if (!formStateId) {
      setCities([]);
      setFormCityId('');
      return;
    }
    void loadCitiesForState(Number(formStateId));
  }, [formStateId, loadCitiesForState]);

  const resetForm = () => {
    setFormFirstName('');
    setFormMiddleName('');
    setFormLastName('');
    setFormEmail('');
    setFormPhoneNumber('');
    setFormStateId('');
    setFormCityId('');
    setCities([]);
  };

  const normalizePhone = (value: string) => value.replace(/\D/g, '').slice(0, 10);

  const resolveLocationNames = () => {
    const state = states.find((s) => s.id === Number(formStateId));
    const city = cities.find((c) => c.id === Number(formCityId));
    return { state: state?.name ?? '', city: city?.name ?? '' };
  };

  const openCreate = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const openEdit = async (agent: Agent) => {
    setFormFirstName(agent.firstName);
    setFormMiddleName(agent.middleName ?? '');
    setFormLastName(agent.lastName);
    setFormEmail(agent.email ?? '');
    setFormPhoneNumber(agent.phoneNumber ?? '');
    setFormStateId('');
    setFormCityId('');
    setCities([]);

    const matchedState = states.find((s) => s.name === agent.state);
    if (matchedState) {
      setFormStateId(String(matchedState.id));
      const cityList = await loadCitiesForState(matchedState.id);
      const matchedCity = cityList.find((c) => c.name === agent.city);
      if (matchedCity) {
        setFormCityId(String(matchedCity.id));
      }
    }

    setEditingAgent(agent);
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    const { state, city } = resolveLocationNames();
    if (!state || !city) {
      toast.error('Please select state and city');
      return;
    }

    setSubmitting(true);
    try {
      const result = await createAgent({
        firstName: formFirstName.trim(),
        middleName: formMiddleName.trim() || undefined,
        lastName: formLastName.trim(),
        email: formEmail || undefined,
        phoneNumber: formPhoneNumber || undefined,
        state,
        city,
      });
      toast.success('Agent created successfully');
      setIsCreateOpen(false);
      setCredentials(result.credentials);
      resetForm();
      await fetchAgents();
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingAgent) return;

    const { state, city } = resolveLocationNames();
    if (!state || !city) {
      toast.error('Please select state and city');
      return;
    }

    setSubmitting(true);
    try {
      await updateAgent(editingAgent.id, {
        firstName: formFirstName.trim(),
        middleName: formMiddleName.trim(),
        lastName: formLastName.trim(),
        email: formEmail || undefined,
        phoneNumber: formPhoneNumber || undefined,
        state,
        city,
      });
      toast.success('Agent updated successfully');
      setEditingAgent(null);
      resetForm();
      await fetchAgents();
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (agent: Agent) => {
    try {
      await updateAgentStatus(agent.id, !agent.isActive);
      toast.success(agent.isActive ? 'Agent deactivated' : 'Agent activated');
      await fetchAgents();
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
    }
  };

  const handleResetPassword = async (agent: Agent) => {
    try {
      const result = await resetAgentPassword(agent.id);
      setCredentials(result.credentials);
      toast.success('Password reset successfully');
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
    }
  };

  const handleDelete = async (agent: Agent) => {
    if (!window.confirm(`Delete agent "${formatAgentName(agent)}"? This cannot be undone.`)) {
      return;
    }

    try {
      await deleteAgent(agent.id);
      toast.success('Agent deleted successfully');
      await fetchAgents();
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
    }
  };

  const copyCredentials = async (creds: AgentCredentials) => {
    const text = `Login ID: ${creds.agentLoginId}\nPassword: ${creds.password}`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Credentials copied to clipboard');
    } catch {
      toast.error('Failed to copy credentials');
    }
  };

  const formatLocation = (agent: Agent) => {
    if (agent.city && agent.state) return `${agent.city}, ${agent.state}`;
    if (agent.state) return agent.state;
    if (agent.city) return agent.city;
    return '—';
  };

  const filteredAgents = agents.filter((agent) => {
    const query = search.toLowerCase();
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

  const stateOptions = states.map((s) => ({ value: s.id, label: s.name }));
  const cityOptions = cities.map((c) => ({ value: c.id, label: c.name }));

  const agentForm = (onSubmit: (e: FormEvent) => void, submitLabel: string) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label="First name"
          value={formFirstName}
          onChange={(e) => setFormFirstName(e.target.value)}
          required
          disabled={submitting}
        />
        <Input
          label="Middle name"
          value={formMiddleName}
          onChange={(e) => setFormMiddleName(e.target.value)}
          disabled={submitting}
        />
        <Input
          label="Last name"
          value={formLastName}
          onChange={(e) => setFormLastName(e.target.value)}
          required
          disabled={submitting}
        />
      </div>
      <Input
        label="Email"
        type="email"
        value={formEmail}
        onChange={(e) => setFormEmail(e.target.value)}
        disabled={submitting}
      />
      <Input
        label="Phone"
        value={formPhoneNumber}
        onChange={(e) => setFormPhoneNumber(normalizePhone(e.target.value))}
        placeholder="9876543210"
        inputMode="numeric"
        maxLength={10}
        disabled={submitting}
      />
      <Select
        label="State"
        value={formStateId}
        onChange={(e) => {
          setFormStateId(e.target.value);
          setFormCityId('');
        }}
        options={[
          {
            value: '',
            label: stateOptions.length === 0 ? 'No states available' : 'Select state',
          },
          ...stateOptions,
        ]}
        disabled={submitting || stateOptions.length === 0}
        required
      />
      <Select
        label="City"
        value={formCityId}
        onChange={(e) => setFormCityId(e.target.value)}
        options={[
          {
            value: '',
            label: !formStateId
              ? 'Select state first'
              : loadingCities
                ? 'Loading cities...'
                : cityOptions.length === 0
                  ? 'No cities available'
                  : 'Select city',
          },
          ...cityOptions,
        ]}
        disabled={submitting || !formStateId || loadingCities}
        required
      />
      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            setIsCreateOpen(false);
            setEditingAgent(null);
            resetForm();
          }}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button type="submit" isLoading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );

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
        <div className="table-toolbar">
          <div className="w-full sm:max-w-md">
            <Input
              icon={Search}
              placeholder="Search by name, login ID, email, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <Loader text="Loading agents..." />
        ) : filteredAgents.length === 0 ? (
          <div className="py-16 text-center text-sm text-text-secondary">
            {search ? 'No agents match your search.' : 'No agents yet. Create your first agent.'}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>Login ID</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <tbody>
              {filteredAgents.map((agent) => (
                <TableRow
                  key={agent.id}
                  onClick={() => navigate(`/admin/agents/${agent.id}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="avatar w-10 h-10 text-sm">
                        {agent.firstName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-text">{formatAgentName(agent)}</div>
                        <div className="text-xs text-text-secondary">
                          {agent.email ?? 'No email'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">{agent.agentLoginId}</span>
                  </TableCell>
                  <TableCell>{formatLocation(agent)}</TableCell>
                  <TableCell>{agent.phoneNumber ?? '—'}</TableCell>
                  <TableCell>
                    <Badge variant={agent.isActive ? 'success' : 'neutral'} dot>
                      {agent.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <Dropdown
                      align="right"
                      trigger={
                        <IconButton size="sm" aria-label="Agent actions">
                          <MoreVertical size={16} />
                        </IconButton>
                      }
                    >
                      <DropdownItem onClick={() => void openEdit(agent)}>
                        <Edit2 size={14} /> Edit Agent
                      </DropdownItem>
                      <DropdownItem onClick={() => handleResetPassword(agent)}>
                        <KeyRound size={14} /> Reset Password
                      </DropdownItem>
                      <DropdownItem onClick={() => handleToggleStatus(agent)}>
                        {agent.isActive ? (
                          <>
                            <UserX size={14} /> Deactivate
                          </>
                        ) : (
                          <>
                            <UserCheck size={14} /> Activate
                          </>
                        )}
                      </DropdownItem>
                      <DropdownItem danger onClick={() => handleDelete(agent)}>
                        <Trash2 size={14} /> Delete
                      </DropdownItem>
                    </Dropdown>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Add New Agent">
        {agentForm(handleCreate, 'Create Agent')}
      </Modal>

      <Modal
        isOpen={!!editingAgent}
        onClose={() => {
          setEditingAgent(null);
          resetForm();
        }}
        title="Edit Agent"
      >
        {agentForm(handleUpdate, 'Save Changes')}
      </Modal>

      <Modal
        isOpen={!!credentials}
        onClose={() => setCredentials(null)}
        title="Agent Credentials"
        maxWidth="lg"
      >
        {credentials && (
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">
              Save these credentials now. The password cannot be retrieved later.
            </p>
            <div className="rounded-lg border border-border bg-surface-elevated p-4 space-y-3 font-mono text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-text-secondary">Login ID</span>
                <span className="text-text">{credentials.agentLoginId}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-text-secondary">Password</span>
                <span className="text-text">{credentials.password}</span>
              </div>
            </div>
            <div className="flex justify-between items-center pt-2">
              <Button
                variant="secondary"
                className="gap-2"
                onClick={() => copyCredentials(credentials)}
              >
                <Copy size={16} />
                Copy
              </Button>
              <Button onClick={() => setCredentials(null)}>Done</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Agents;
