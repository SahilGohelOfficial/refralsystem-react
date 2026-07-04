import { useTranslation } from 'react-i18next';
import type { ChainReferralUser } from '../../types/api';
import { formatUserName } from '../../types/api';

interface ChainUserCardProps {
  user: ChainReferralUser;
  onClick?: () => void;
}

const ChainUserCard = ({ user, onClick }: ChainUserCardProps) => {
  const { t } = useTranslation();

  const className =
    'border border-border rounded-lg p-3 bg-surface/50 hover:bg-surface-elevated hover:border-border-strong transition-all duration-150 w-full text-left';

  const inner = (
    <div className="flex items-center gap-2.5">
      <div className="avatar w-8 h-8 text-xs">{user.firstName.charAt(0)}</div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-text truncate">{formatUserName(user)}</p>
        {user.referredByName ? (
          <p className="text-[11px] text-text-muted truncate">
            {t('agent.chain_referrals.referred_by', 'Referred by {{name}}', {
              name: user.referredByName,
            })}
          </p>
        ) : null}
      </div>
      <span className="text-[10px] font-mono text-text-secondary bg-surface-elevated border border-border px-1.5 py-0.5 rounded shrink-0">
        #{user.position}
      </span>
    </div>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${className} cursor-pointer`}>
        {inner}
      </button>
    );
  }

  return <div className={className}>{inner}</div>;
};

export default ChainUserCard;