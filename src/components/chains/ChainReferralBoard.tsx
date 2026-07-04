import { useTranslation } from 'react-i18next';
import type { ChainWithUsers } from '../../types/api';
import ChainColumn from './ChainColumn';

interface ChainReferralBoardProps {
  chains: ChainWithUsers[];
  loading?: boolean;
}

const ChainReferralBoard = ({ chains, loading }: ChainReferralBoardProps) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (chains.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-text-secondary">
        <p className="text-lg">{t('agent.chain_referrals.empty', 'No chains available')}</p>
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {chains.map((chain) => (
        <ChainColumn key={chain.id} chain={chain} />
      ))}
    </div>
  );
};

export default ChainReferralBoard;
