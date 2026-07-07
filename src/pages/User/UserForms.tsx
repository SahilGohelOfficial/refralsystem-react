import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PortalFormsList from '../../components/forms/portal/PortalFormsList';
import { selectNeedsPaymentSubmission, useUserPortalStore } from '../../stores/userPortalStore';

export default function UserForms() {
  const navigate = useNavigate();
  const needsPaymentSubmission = useUserPortalStore(selectNeedsPaymentSubmission);

  useEffect(() => {
    if (needsPaymentSubmission) {
      navigate('/user/payment', { replace: true });
    }
  }, [needsPaymentSubmission, navigate]);

  if (needsPaymentSubmission) {
    return null;
  }

  return <PortalFormsList userType="user" detailsPathPrefix="/user/forms" />;
}
