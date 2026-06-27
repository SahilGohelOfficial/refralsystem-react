import PortalFormSubmit from '../../components/forms/portal/PortalFormSubmit';
import { useAgentUserPaths } from '../../lib/agentUserPaths';

const AgentUserFormSubmit = () => {
  const { userId, userDetailPath } = useAgentUserPaths();

  return (
    <PortalFormSubmit
      userType="user"
      userId={userId}
      listPath={userDetailPath}
    />
  );
};

export default AgentUserFormSubmit;
