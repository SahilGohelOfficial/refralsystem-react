import { Navigate, useLocation, useParams } from 'react-router-dom';

const AgentUserFormsRedirect = () => {
  const { userId } = useParams<{ userId: string }>();
  const location = useLocation();
  const target = location.pathname.includes('/user-requests/')
    ? `/agent/user-requests/${userId}`
    : `/agent/customers/${userId}`;

  return <Navigate to={target} replace />;
};

export default AgentUserFormsRedirect;
