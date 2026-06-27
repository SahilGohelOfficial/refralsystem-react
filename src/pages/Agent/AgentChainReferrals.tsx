import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { formatApiError } from '../../lib/api';
import { getMyChainReferrals } from '../../services/agents.service';
import ChainReferralBoard from '../../components/chains/ChainReferralBoard';
import type { ApiError, ChainWithUsers } from '../../types/api';

const AgentChainReferrals = () => {
  const { t } = useTranslation();
  const [chains, setChains] = useState<ChainWithUsers[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyChainReferrals();
      setChains(data.chains);
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">
          {t('agent.chain_referrals.title', 'Your Chains')}
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {t('agent.chain_referrals.subtitle', 'View your chain assignments and referral positions')}
        </p>
      </div>
      <ChainReferralBoard chains={chains} loading={loading} />
    </div>
  );
};

export default AgentChainReferrals;
