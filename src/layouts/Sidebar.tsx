import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  FileText,
  LogOut,
  ShieldCheck,
  Link2,
  ClipboardList,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const adminNavItems = [
  { path: '/admin/dashboard', labelKey: 'nav.admin.dashboard', icon: LayoutDashboard },
  { path: '/admin/agents', labelKey: 'nav.admin.agents', icon: Users },
  { path: '/admin/admins', labelKey: 'nav.admin.admins', icon: ShieldCheck, superAdminOnly: true },
  { path: '/admin/chains', labelKey: 'nav.admin.chains', icon: Link2, superAdminOnly: true },
  { path: '/admin/forms', labelKey: 'nav.admin.forms', icon: FileText },
  { path: '/admin/settings', labelKey: 'nav.admin.settings', icon: Settings },
];

const agentNavItems = [
  { path: '/agent/dashboard', labelKey: 'nav.agent.dashboard', icon: LayoutDashboard },
  { path: '/agent/users', labelKey: 'nav.agent.my_users', icon: Users },
  { path: '/agent/user-requests', labelKey: 'nav.agent.user_requests', icon: ClipboardList },
  { path: '/agent/your-chains', labelKey: 'nav.agent.your_chains', icon: Link2 },
  { path: '/agent/forms', labelKey: 'nav.agent.forms', icon: FileText },
  { path: '/agent/profile', labelKey: 'nav.agent.profile', icon: Users },
  { path: '/agent/settings', labelKey: 'nav.agent.settings', icon: Settings },
];

const userNavItems = [
  { path: '/user/dashboard', labelKey: 'nav.user_portal.dashboard', icon: LayoutDashboard },
  { path: '/user/forms', labelKey: 'nav.user_portal.forms', icon: FileText },
  { path: '/user/settings', labelKey: 'nav.user_portal.settings', icon: Settings },
];

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (isOpen: boolean) => void;
}

const Sidebar = ({ isMobileOpen, setIsMobileOpen }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  let navItems = adminNavItems;
  let title = 'AdminPro';

  if (user?.role === 'agent') {
    navItems = agentNavItems;
    title = 'Agent Portal';
  } else if (user?.role === 'user') {
    navItems = userNavItems;
    title = 'User Portal';
  } else {
    navItems =
      user?.role === 'superAdmin'
        ? adminNavItems
        : adminNavItems.filter((item) => !item.superAdminOnly);
  }

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen transition-all duration-300 ease-out
          bg-card/95 backdrop-blur-xl border-r border-border flex flex-col
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'w-[4.5rem]' : 'w-64'}
        `}
      >
        <div className="flex items-center h-16 px-4 border-b border-border shrink-0 relative">
          {!isCollapsed ? (
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-background font-bold text-sm shrink-0 shadow-sm">
                A
              </div>
              <div className="min-w-0">
                <span className="text-sm font-semibold text-text truncate block">{title}</span>
                <span className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
                  Dashboard
                </span>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 mx-auto rounded-lg bg-primary flex items-center justify-center text-background font-bold text-sm shrink-0 shadow-sm">
              A
            </div>
          )}

          <button
            onClick={toggleSidebar}
            className="hidden lg:flex icon-btn-sm absolute -right-3 top-1/2 -translate-y-1/2 bg-card border border-border shadow-sm"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {!isCollapsed && (
            <p className="px-3 pt-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
              Menu
            </p>
          )}
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              title={isCollapsed ? t(item.labelKey) : undefined}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'nav-item-active' : 'nav-item-inactive'} ${
                  isCollapsed ? 'justify-center px-2' : ''
                }`
              }
            >
              <item.icon size={18} className="shrink-0" strokeWidth={1.75} />
              {!isCollapsed && <span className="truncate">{t(item.labelKey)}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-border shrink-0">
          <button
            onClick={logout}
            className={`nav-item nav-item-inactive hover:text-error hover:bg-error-muted w-full ${
              isCollapsed ? 'justify-center px-2' : ''
            }`}
          >
            <LogOut size={18} className="shrink-0" strokeWidth={1.75} />
            {!isCollapsed && (
              <span className="truncate">{t('common.logout', 'Logout')}</span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;