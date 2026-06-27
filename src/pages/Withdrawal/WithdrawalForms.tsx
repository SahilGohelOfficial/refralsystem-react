import PortalFormsList from '../../components/forms/portal/PortalFormsList';

export default function WithdrawalForms() {
  return <PortalFormsList userType="user" detailsPathPrefix="/user/forms" />;
}
