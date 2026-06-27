import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  UserPlus,
  FileText,
  Wallet,
  Clock,
  Bell,
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
  { path: '/agent/customers', labelKey: 'nav.agent.my_users', icon: Users },
  { path: '/agent/user-requests', labelKey: 'nav.agent.user_requests', icon: ClipboardList },
  { path: '/agent/your-chains', labelKey: 'nav.agent.your_chains', icon: Link2 },
  { path: '/agent/forms', labelKey: 'nav.agent.forms', icon: FileText },
  { path: '/agent/profile', labelKey: 'nav.agent.profile', icon: Users },
  { path: '/agent/settings', labelKey: 'nav.agent.settings', icon: Settings },
];

const userNavItems = [
  { path: '/user/dashboard', labelKey: 'nav.user_portal.dashboard', icon: LayoutDashboard },
  { path: '/user/forms', labelKey: 'nav.user_portal.forms', icon: FileText },
  { path: '/user/request', labelKey: 'nav.user_portal.request_withdrawal', icon: Wallet },
  { path: '/user/history', labelKey: 'nav.user_portal.history', icon: Clock },
  { path: '/user/notifications', labelKey: 'nav.user_portal.notifications', icon: Bell },
  { path: '/user/profile', labelKey: 'nav.user_portal.profile', icon: Users },
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
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen transition-all duration-300 glass-panel border-l-0 border-y-0 rounded-none flex flex-col
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'w-20' : 'w-64'}
        `}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-border shrink-0">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-background font-bold text-xl shrink-0">
                A
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent truncate">
                {title}
              </span>
            </div>
          )}
          {isCollapsed && (
            <div className="w-8 h-8 mx-auto rounded bg-primary flex items-center justify-center text-background font-bold text-xl shrink-0">
              A
            </div>
          )}
          
          <button 
            onClick={toggleSidebar}
            className="hidden lg:flex p-1 rounded-md text-text-secondary hover:text-primary hover:bg-surface transition-colors absolute -right-3 top-5 bg-card border border-border"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                ${isActive 
                  ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_10px_rgba(212,160,23,0.1)]' 
                  : 'text-text-secondary hover:text-text hover:bg-surface'
                }
              `}
            >
              <item.icon size={20} className="shrink-0" />
              {!isCollapsed && (
                <span className="font-medium truncate whitespace-nowrap">
                  {t(item.labelKey)}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        
        <div className="p-4 border-t border-border shrink-0">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-error hover:bg-error/10 transition-colors"
          >
            <LogOut size={20} className="shrink-0" />
            {!isCollapsed && <span className="font-medium truncate whitespace-nowrap">{t('common.logout', 'Logout')}</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
