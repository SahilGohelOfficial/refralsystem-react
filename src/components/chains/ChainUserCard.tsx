import { useTranslation } from 'react-i18next';
import type { ChainReferralUser } from '../../types/api';

interface ChainUserCardProps {
  user: ChainReferralUser;
}

const ChainUserCard = ({ user }: ChainUserCardProps) => {
  const { t } = useTranslation();

  return (
    <div className="border border-border rounded-lg p-3 bg-surface/50 hover:bg-surface transition-colors">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-primary text-sm font-bold shrink-0">
          {user.firstName.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-text truncate">
            {user.firstName} {user.lastName}
          </p>
          {user.referredByName ? (
            <p className="text-[11px] text-text-secondary truncate">
              {t('agent.chain_referrals.referred_by', 'Referred by {{name}}', { name: user.referredByName })}
            </p>
          ) : null}
        </div>
        <span className="text-[10px] font-mono text-text-secondary bg-background px-1.5 py-0.5 rounded shrink-0">
          #{user.position}
        </span>
      </div>
    </div>
  );
};

export default ChainUserCard;
