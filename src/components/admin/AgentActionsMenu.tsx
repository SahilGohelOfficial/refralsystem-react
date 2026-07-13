import { useState, type FormEvent, type ReactNode } from 'react';
import {
  Edit2,
  KeyRound,
  MoreVertical,
  Trash2,
  UserCheck,
  UserX,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Dropdown, DropdownItem } from '../ui/Dropdown';
import Modal from '../ui/Modal';
import IconButton from '../ui/IconButton';
import AgentFormFields from './AgentFormFields';
import CredentialsModal from './CredentialsModal';
import {
  useDeleteAgent,
  useResetAgentPassword,
  useUpdateAgent,
  useUpdateAgentStatus,
} from '../../hooks/queries';
import { useLocationSelect } from '../../hooks/useLocationSelect';
import { useConfirm } from '../../stores/confirmStore';
import type { Agent, AgentCredentials } from '../../types/api';
import { formatAgentName, choiceToGender, genderToChoice } from '../../types/api';

interface AgentActionsMenuProps {
  agent: Agent;
  onDeleted?: () => void;
  align?: 'left' | 'right';
  trigger?: ReactNode;
}

const AgentActionsMenu = ({
  agent,
  onDeleted,
  align = 'right',
  trigger,
}: AgentActionsMenuProps) => {
  const confirm = useConfirm();
  const location = useLocationSelect();
  const updateAgentMutation = useUpdateAgent();
  const updateStatusMutation = useUpdateAgentStatus();
  const resetPasswordMutation = useResetAgentPassword();
  const deleteAgentMutation = useDeleteAgent();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [credentials, setCredentials] = useState<AgentCredentials | null>(null);
  const [formFirstName, setFormFirstName] = useState('');
  const [formMiddleName, setFormMiddleName] = useState('');
  const [formLastName, setFormLastName] = useState('');
  const [formGenderChoice, setFormGenderChoice] = useState('');
  const [formGenderError, setFormGenderError] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhoneNumber, setFormPhoneNumber] = useState('');

  const submitting = updateAgentMutation.isPending;

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

  const closeEdit = () => {
    setIsEditOpen(false);
    resetForm();
  };

  const openEdit = async () => {
    setFormFirstName(agent.firstName);
    setFormMiddleName(agent.middleName ?? '');
    setFormLastName(agent.lastName);
    setFormGenderChoice(genderToChoice(agent.gender));
    setFormEmail(agent.email ?? '');
    setFormPhoneNumber(agent.phoneNumber ?? '');
    await location.initFromNames(agent.state, agent.city);
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
      await updateAgentMutation.mutateAsync({
        id: agent.id,
        payload: {
          firstName: formFirstName.trim(),
          middleName: formMiddleName.trim() || undefined,
          lastName: formLastName.trim(),
          gender,
          email: formEmail || undefined,
          phoneNumber: formPhoneNumber || undefined,
          state,
          city,
        },
      });
      toast.success('Agent updated successfully');
      closeEdit();
    } catch {
      // Errors handled by mutation hooks
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
      await updateStatusMutation.mutateAsync({ id: agent.id, isActive: !agent.isActive });
      toast.success(agent.isActive ? 'Agent deactivated' : 'Agent activated');
    } catch {
      // Errors handled by mutation hooks
    }
  };

  const handleResetPassword = async () => {
    const confirmed = await confirm({
      title: 'Reset Password',
      message: `Reset password for "${formatAgentName(agent)}"? A new password will be generated and all existing sessions will be invalidated.`,
      variant: 'danger',
      confirmLabel: 'Reset Password',
    });
    if (!confirmed) return;

    try {
      const result = await resetPasswordMutation.mutateAsync(agent.id);
      setCredentials(result.credentials);
      toast.success('Password reset successfully');
    } catch {
      // Errors handled by mutation hooks
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
      await deleteAgentMutation.mutateAsync(agent.id);
      toast.success('Agent deleted successfully');
      onDeleted?.();
    } catch {
      // Errors handled by mutation hooks
    }
  };

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

      <Modal isOpen={isEditOpen} onClose={closeEdit} title="Edit Agent" maxWidth="lg">
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
          submitting={submitting}
          submitLabel="Save Changes"
          onSubmit={handleUpdate}
          onCancel={closeEdit}
        />
      </Modal>

      <CredentialsModal credentials={credentials} onClose={() => setCredentials(null)} />
    </>
  );
};

export default AgentActionsMenu;