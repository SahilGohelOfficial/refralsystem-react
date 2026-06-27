import { useTranslation } from 'react-i18next';
import type { ChainWithUsers } from '../../types/api';
import ChainUserCard from './ChainUserCard';

interface ChainColumnProps {
  chain: ChainWithUsers;
}

const ChainColumn = ({ chain }: ChainColumnProps) => {
  const { t } = useTranslation();

  return (
    <div className="w-64 shrink-0 glass-card rounded-xl border border-border flex flex-col">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-text truncate">{chain.name}</h3>
        <p className="text-xs text-text-secondary mt-0.5">
          {chain.users.length} {chain.users.length === 1 ? 'user' : 'users'}
        </p>
      </div>
      <div className="p-3 space-y-2 flex-1 overflow-y-auto max-h-[calc(100vh-280px)]">
        {chain.users.length === 0 ? (
          <p className="text-xs text-text-secondary text-center py-4">
            {t('agent.chain_referrals.empty_chain', 'No users in this chain')}
          </p>
        ) : (
          chain.users.map((user) => (
            <ChainUserCard key={user.id} user={user} />
          ))
        )}
      </div>
    </div>
  );
};

export default ChainColumn;
