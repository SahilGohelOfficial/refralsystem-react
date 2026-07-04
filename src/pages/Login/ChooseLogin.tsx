import React from 'react';
import { Shield, Users, Wallet, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const portals = [
  {
    path: '/admin/login',
    icon: Shield,
    title: 'Admin Portal',
    description: 'System management, analytics, and configuration',
  },
  {
    path: '/agent/login',
    icon: Users,
    title: 'Agent Portal',
    description: 'Partner access, user onboarding, and referrals',
  },
  {
    path: '/user/login',
    icon: Wallet,
    title: 'User Portal',
    description: 'Account access, forms, and referral services',
  },
];

const ChooseLogin = () => {
  const navigate = useNavigate();

  return (
    <div className="auth-shell px-4">
      <div className="auth-glow-top" />
      <div className="auth-glow-bottom" />

      <div className="sm:mx-auto sm:w-full sm:max-w-4xl relative z-10">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-background font-bold text-2xl shadow-sm">
            A
          </div>
        </div>
        <h2 className="text-center text-3xl font-semibold text-text tracking-tight">
          Choose Your Portal
        </h2>
        <p className="mt-3 text-center text-sm text-text-secondary max-w-md mx-auto">
          Select the appropriate portal to securely access your account
        </p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
          {portals.map((portal) => (
            <button
              key={portal.path}
              onClick={() => navigate(portal.path)}
              className="portal-card group"
            >
              <div className="w-12 h-12 rounded-xl bg-surface-elevated border border-border flex items-center justify-center mb-6 group-hover:bg-primary-muted group-hover:border-primary/20 transition-colors duration-200">
                <portal.icon className="text-primary" size={24} strokeWidth={1.75} />
              </div>
              <h3 className="text-lg font-semibold text-text mb-2">{portal.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed mb-6">
                {portal.description}
              </p>
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary group-hover:gap-2.5 transition-all duration-200">
                Continue
                <ArrowRight size={16} />
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChooseLogin;