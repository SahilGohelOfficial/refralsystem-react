import PortalFormsList from '../../components/forms/portal/PortalFormsList';

export default function UserForms() {
  return <PortalFormsList userType="user" detailsPathPrefix="/user/forms" />;
}
