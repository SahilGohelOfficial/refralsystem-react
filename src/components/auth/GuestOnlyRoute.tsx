import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../stores/authStore';
import { getDashboardPath } from '../../lib/roles';
import type { PortalRole } from '../../types/api';

type GuestOnlyRouteProps = {
  children: ReactNode;
  /**
   * Authenticated roles allowed to stay on this public page
   * (e.g. agent on /register for user onboarding).
   */
  allowRoles?: PortalRole[];
};

/**
 * Public auth routes: guests pass through.
 * Logged-in users are sent to their dashboard unless their role is in allowRoles.
 */
const GuestOnlyRoute = ({ children, allowRoles }: GuestOnlyRouteProps) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated && user) {
    if (allowRoles?.includes(user.role)) {
      return <>{children}</>;
    }
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return <>{children}</>;
};

export default GuestOnlyRoute;
