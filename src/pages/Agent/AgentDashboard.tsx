import PageHeader from '../../components/ui/PageHeader';
import { useTranslation } from 'react-i18next';

const AgentDashboard = () => {
  const { t } = useTranslation();

  return (
    <div className="page-shell">
      <PageHeader
        title={t('nav.agent.dashboard', 'Dashboard')}
        description="Welcome to the agent portal."
      />
    </div>
  );
};

export default AgentDashboard;
