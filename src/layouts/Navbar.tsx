import React, { useState } from 'react';
import { Menu, Search, Bell, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar = ({ onMenuClick }: NavbarProps) => {
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="h-16 glass-panel border-x-0 border-t-0 rounded-none sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-text-secondary hover:text-primary transition-colors"
        >
          <Menu size={24} />
        </button>
        
        <div className="hidden md:flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-1.5 focus-within:border-primary/50 transition-colors w-64 lg:w-96">
          <Search size={18} className="text-text-secondary" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-transparent border-none outline-none text-sm w-full text-text placeholder:text-text-secondary"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-text-secondary hover:text-primary transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full ring-2 ring-card"></span>
        </button>

        <div className="relative">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 pl-2 py-1 rounded-full hover:bg-surface transition-colors"
          >
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-text">{user?.name || 'Admin User'}</p>
              <p className="text-xs text-text-secondary">{user?.role || 'Admin'}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-surface border border-primary/30 flex items-center justify-center text-primary">
              <User size={16} />
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 glass-panel border border-border py-1">
              <div className="px-4 py-2 border-b border-border md:hidden">
                <p className="text-sm font-medium text-text">{user?.name}</p>
                <p className="text-xs text-text-secondary">{user?.email}</p>
              </div>
              <button 
                onClick={() => {
                  setShowProfileMenu(false);
                  logout();
                }}
                className="w-full text-left px-4 py-2 text-sm text-error hover:bg-surface flex items-center gap-2 transition-colors"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
