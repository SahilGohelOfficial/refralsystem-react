import { useEffect, useState } from 'react';
import { Copy, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import type { AgentCredentials } from '../../types/api';

interface CredentialsModalProps {
  credentials: AgentCredentials | null;
  onClose: () => void;
}

const CredentialsModal = ({ credentials, onClose }: CredentialsModalProps) => {
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!credentials) {
      setShowPassword(false);
    }
  }, [credentials]);
  const copyCredentials = async () => {
    if (!credentials) return;
    const text = `Login ID: ${credentials.agentLoginId}\nPassword: ${credentials.password}`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Credentials copied to clipboard');
    } catch {
      toast.error('Failed to copy credentials');
    }
  };

  return (
    <Modal isOpen={!!credentials} onClose={onClose} title="Agent Credentials" maxWidth="lg">
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
            <div className="flex justify-between items-center gap-4">
              <span className="text-text-secondary">Password</span>
              <div className="flex items-center gap-2">
                <span className="text-text">
                  {showPassword ? credentials.password : '•'.repeat(credentials.password.length)}
                </span>
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-text-muted hover:text-text transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center pt-2">
            <Button variant="secondary" className="gap-2" onClick={() => void copyCredentials()}>
              <Copy size={16} />
              Copy
            </Button>
            <Button onClick={onClose}>Done</Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default CredentialsModal;