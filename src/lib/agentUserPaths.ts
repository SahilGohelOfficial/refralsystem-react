import { useLocation, useParams } from 'react-router-dom';

export function useAgentUserPaths() {
  const { userId = '' } = useParams<{ userId: string }>();
  const location = useLocation();
  const fromUserRequests = location.pathname.includes('/agent/user-requests/');

  const backListPath = fromUserRequests ? '/agent/user-requests' : '/agent/users';
  const userDetailPath = fromUserRequests
    ? `/agent/user-requests/${userId}`
    : `/agent/users/${userId}`;

  return {
    userId,
    fromUserRequests,
    backListPath,
    userDetailPath,
    formSubmitPath: (formId: string) => `${userDetailPath}/forms/${formId}`,
  };
}
