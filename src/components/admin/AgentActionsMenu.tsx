import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react';
import {
  Copy,
  Edit2,
  KeyRound,
  MoreVertical,
  Trash2,
  UserCheck,
  UserX,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Dropdown, DropdownItem } from '../ui/Dropdown';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Modal from '../ui/Modal';
import IconButton from '../ui/IconButton';
import {
  deleteAgent,
  resetAgentPassword,
  updateAgent,
  updateAgentStatus,
} from '../../services/agents.service';
import { listCities, listStates } from '../../services/location.service';
import { useConfirm } from '../../context/ConfirmContext';
import { formatApiError } from '../../lib/api';
import type { Agent, AgentCredentials, ApiError, City, State } from '../../types/api';
import { formatAgentName } from '../../types/api';

interface AgentActionsMenuProps {
  agent: Agent;
  onAgentChange?: () => void | Promise<void>;
  onDeleted?: () => void;
  align?: 'left' | 'right';
  trigger?: ReactNode;
}

const normalizePhone = (value: string) => value.replace(/\D/g, '').slice(0, 10);

const AgentActionsMenu = ({
  agent,
  onAgentChange,
  onDeleted,
  align = 'right',
  trigger,
}: AgentActionsMenuProps) => {
  const confirm = useConfirm();
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [isEditOpen, setIsEditOpen] = useState(false);
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
    void listStates()
      .then(setStates)
      .catch((error) => toast.error(formatApiError(error as ApiError)));
  }, []);

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

  const resolveLocationNames = () => {
    const state = states.find((s) => s.id === Number(formStateId));
    const city = cities.find((c) => c.id === Number(formCityId));
    return { state: state?.name ?? '', city: city?.name ?? '' };
  };

  const closeEdit = () => {
    setIsEditOpen(false);
    resetForm();
  };

  const openEdit = async () => {
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

    setIsEditOpen(true);
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();

    const confirmed = await confirm({
      title: 'Edit Agent',
      message: `Save changes to "${formatAgentName(agent)}"?`,
      confirmLabel: 'Save Changes',
    });
    if (!confirmed) return;

    const { state, city } = resolveLocationNames();
    if (!state || !city) {
      toast.error('Please select state and city');
      return;
    }

    setSubmitting(true);
    try {
      await updateAgent(agent.id, {
        firstName: formFirstName.trim(),
        middleName: formMiddleName.trim() || undefined,
        lastName: formLastName.trim(),
        email: formEmail || undefined,
        phoneNumber: formPhoneNumber || undefined,
        state,
        city,
      });
      toast.success('Agent updated successfully');
      closeEdit();
      await onAgentChange?.();
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async () => {
    const name = formatAgentName(agent);
    const confirmed = await confirm({
      title: agent.isActive ? 'Deactivate Agent' : 'Activate Agent',
      message: agent.isActive
        ? `Deactivate "${name}"? They will not be able to log in.`
        : `Activate "${name}"? They will be able to log in again.`,
      variant: agent.isActive ? 'danger' : 'default',
      confirmLabel: agent.isActive ? 'Deactivate' : 'Activate',
    });
    if (!confirmed) return;

    try {
      await updateAgentStatus(agent.id, !agent.isActive);
      toast.success(agent.isActive ? 'Agent deactivated' : 'Agent activated');
      await onAgentChange?.();
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
    }
  };

  const handleResetPassword = async () => {
    const name = formatAgentName(agent);
    const confirmed = await confirm({
      title: 'Reset Password',
      message: `Reset password for "${name}"? A new password will be generated and all existing sessions will be invalidated.`,
      variant: 'danger',
      confirmLabel: 'Reset Password',
    });
    if (!confirmed) return;

    try {
      const result = await resetAgentPassword(agent.id);
      setCredentials(result.credentials);
      toast.success('Password reset successfully');
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
    }
  };

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Delete Agent',
      message: `Delete agent "${formatAgentName(agent)}"? This cannot be undone.`,
      variant: 'danger',
      confirmLabel: 'Delete',
    });
    if (!confirmed) return;

    try {
      await deleteAgent(agent.id);
      toast.success('Agent deleted successfully');
      onDeleted?.();
      await onAgentChange?.();
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

  const stateOptions = states.map((s) => ({ value: s.id, label: s.name }));
  const cityOptions = cities.map((c) => ({ value: c.id, label: c.name }));

  return (
    <>
      <Dropdown
        align={align}
        trigger={
          trigger ?? (
            <IconButton size="sm" aria-label="Agent actions">
              <MoreVertical size={16} />
            </IconButton>
          )
        }
      >
        <DropdownItem onClick={() => void openEdit()}>
          <Edit2 size={14} /> Edit Agent
        </DropdownItem>
        <DropdownItem onClick={() => void handleResetPassword()}>
          <KeyRound size={14} /> Reset Password
        </DropdownItem>
        <DropdownItem onClick={() => void handleToggleStatus()}>
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
        <DropdownItem danger onClick={() => void handleDelete()}>
          <Trash2 size={14} /> Delete
        </DropdownItem>
      </Dropdown>

      <Modal isOpen={isEditOpen} onClose={closeEdit} title="Edit Agent">
        <form onSubmit={handleUpdate} className="space-y-4">
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
            <Button type="button" variant="secondary" onClick={closeEdit} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              Save Changes
            </Button>
          </div>
        </form>
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
                onClick={() => void copyCredentials(credentials)}
              >
                <Copy size={16} />
                Copy
              </Button>
              <Button onClick={() => setCredentials(null)}>Done</Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default AgentActionsMenu;