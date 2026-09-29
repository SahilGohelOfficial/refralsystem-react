import { useTranslation } from 'react-i18next';
import Switch from '../ui/Switch';
import type { ChainWithUsers } from '../../types/api';

function isAgentChainEnableLocked(
  chain: Pick<ChainWithUsers, 'enabled' | 'users'>,
): boolean {
  return chain.enabled === true && chain.users.length > 0;
}

type AgentChainEnableSwitchProps = {
  chain: ChainWithUsers;
  pending?: boolean;
  onChange: (enabled: boolean) => void;
  showLabel?: boolean;
};

const AgentChainEnableSwitch = ({
  chain,
  pending = false,
  onChange,
  showLabel = false,
}: AgentChainEnableSwitchProps) => {
  const { t } = useTranslation();
  const locked = isAgentChainEnableLocked(chain);

  const control = (
    <span
      title={
        locked
          ? t(
              'chains.agentAccess.locked_with_users',
              'Cannot turn off while users are on this chain',
            )
          : undefined
      }
      className="inline-flex"
    >
      <Switch
        checked={chain.enabled === true}
        disabled={locked || pending}
        aria-label={t('admin.agent_detail.chain_enabled', 'Enabled for this agent')}
        onChange={onChange}
      />
    </span>
  );

  if (!showLabel) {
    return control;
  }

  return (
    <div className="flex flex-col items-end gap-1 shrink-0">
      <span className="text-[10px] uppercase tracking-wide text-text-muted">
        {t('chains.agentAccess.enabled', 'Enabled')}
      </span>
      {control}
    </div>
  );
};

export default AgentChainEnableSwitch;
