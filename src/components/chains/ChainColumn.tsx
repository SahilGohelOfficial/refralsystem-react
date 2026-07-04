import { useTranslation } from 'react-i18next';
import type { ChainWithUsers } from '../../types/api';
import ChainUserCard from './ChainUserCard';

interface ChainColumnProps {
  chain: ChainWithUsers;
  onUserClick?: (userId: string) => void;
}

const ChainColumn = ({ chain, onUserClick }: ChainColumnProps) => {
  const { t } = useTranslation();

  return (
    <div className="w-64 shrink-0 glass-card flex flex-col">
      <div className="px-4 py-3.5 border-b border-border bg-surface/40">
        <h3 className="text-sm font-semibold text-text truncate">{chain.name}</h3>
        <p className="text-xs text-text-muted mt-0.5">
          {chain.users.length === 0
            ? t('agent.chain_referrals.not_joined', 'Not joined yet')
            : t('agent.chain_referrals.user_count', '{{count}} users', {
                count: chain.users.length,
              })}
        </p>
      </div>
      <div className="p-3 space-y-2 flex-1 overflow-y-auto max-h-[calc(100vh-280px)]">
        {chain.users.length === 0 ? (
          <p className="text-xs text-text-secondary text-center py-4">
            {t(
              'agent.chain_referrals.empty_chain',
              'No users assigned to this chain yet',
            )}
          </p>
        ) : (
          chain.users.map((user) => (
            <ChainUserCard
              key={user.id}
              user={user}
              onClick={onUserClick ? () => onUserClick(user.id) : undefined}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ChainColumn;
