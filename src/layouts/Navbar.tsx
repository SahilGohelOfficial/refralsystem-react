import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, Lock, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isAdminPortalRole } from '../lib/roles';
import type { PortalRole } from '../types/api';

const getProfilePath = (role: PortalRole): string | null => {
  if (isAdminPortalRole(role)) return '/admin/profile';
  if (role === 'agent') return '/agent/profile';
  if (role === 'user') return '/user/profile';
  return null;
};

const getChangePasswordPath = (role: PortalRole): string | null => {
  if (isAdminPortalRole(role)) return '/admin/change-password';
  if (role === 'agent') return '/agent/change-password';
  if (role === 'user') return '/user/change-password';
  return null;
};

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar = ({ onMenuClick }: NavbarProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const profilePath = user ? getProfilePath(user.role) : null;
  const changePasswordPath = user ? getChangePasswordPath(user.role) : null;

  useEffect(() => {
    if (!showProfileMenu) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu]);

  const roleLabel =
    user?.role === 'superAdmin'
      ? 'Super Admin'
      : user?.role
        ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
        : 'Admin';

  return (
    <header className="h-14 lg:h-16 bg-card/80 backdrop-blur-xl border-b border-border sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden icon-btn"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-lg hover:bg-surface-elevated transition-colors duration-150"
            aria-expanded={showProfileMenu}
            aria-haspopup="menu"
          >
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-text leading-tight">
                {user?.name || 'Admin User'}
              </p>
              <p className="text-xs text-text-muted leading-tight">{roleLabel}</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-primary-muted border border-primary/20 flex items-center justify-center text-primary">
              <User size={15} strokeWidth={2} />
            </div>
          </button>

          {showProfileMenu && (
            <div
              className="absolute right-0 mt-2 w-52 bg-card border border-border rounded-lg shadow-xl py-1 z-50"
              role="menu"
            >
              <div className="px-3.5 py-2.5 border-b border-border md:hidden">
                <p className="text-sm font-medium text-text">{user?.name}</p>
                <p className="text-xs text-text-muted truncate">{user?.email}</p>
              </div>
              {profilePath && (
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate(profilePath);
                  }}
                  className="w-full text-left px-3.5 py-2 text-sm text-text hover:bg-surface-elevated flex items-center gap-2.5 transition-colors duration-150"
                  role="menuitem"
                >
                  <User size={15} />
                  {user?.role === 'agent'
                    ? t('nav.agent.profile', 'Profile')
                    : user?.role === 'user'
                      ? t('nav.user_portal.profile', 'Profile')
                      : t('nav.admin.profile', 'Profile')}
                </button>
              )}
              {changePasswordPath && (
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate(changePasswordPath);
                  }}
                  className="w-full text-left px-3.5 py-2 text-sm text-text hover:bg-surface-elevated flex items-center gap-2.5 transition-colors duration-150"
                  role="menuitem"
                >
                  <Lock size={15} />
                  {t('nav.admin.change_password', 'Change Password')}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
