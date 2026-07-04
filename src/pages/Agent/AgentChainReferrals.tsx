import { useTranslation } from 'react-i18next';
import ChainReferralBoard from '../../components/chains/ChainReferralBoard';
import { useMyChainReferrals } from '../../hooks/queries';
import { useToastOnError } from '../../hooks/useToastOnError';

const AgentChainReferrals = () => {
  const { t } = useTranslation();
  const { data: chains = [], isLoading, error } = useMyChainReferrals();
  useToastOnError(error);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">
          {t('agent.chain_referrals.title', 'Your Chains')}
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {t(
            'agent.chain_referrals.subtitle',
            'View all chains and your referral positions within each.',
          )}
        </p>
      </div>
      <ChainReferralBoard chains={chains} loading={isLoading} />
    </div>
  );
};

export default AgentChainReferrals;