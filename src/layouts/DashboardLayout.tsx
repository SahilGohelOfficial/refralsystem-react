import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import UserPortalStatusBanner from '../components/user-portal/UserPortalStatusBanner';
import { useAuth } from '../stores/authStore';
import { useUserPortalSync } from '../hooks/useUserPortalSync';

const DashboardLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, refreshUserProfile } = useAuth();
  const location = useLocation();

  // Dashboard owns status UI in its own card — avoid duplicate global banner there.
  const hideUserStatusBanner =
    user?.role === 'user' &&
    (location.pathname === '/user/dashboard' || location.pathname === '/user');

  useUserPortalSync({
    enabled: user?.role === 'user',
    userId: user?.id,
    userStatus: user?.status,
  });

  useEffect(() => {
    if (user?.role === 'user') {
      void refreshUserProfile().catch(() => {
        // Keep cached session if profile refresh fails
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.role]);

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onMenuClick={() => setIsMobileOpen(true)} />

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
          <div className="mx-auto w-full">
            {user?.role === 'user' && !hideUserStatusBanner && <UserPortalStatusBanner />}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;