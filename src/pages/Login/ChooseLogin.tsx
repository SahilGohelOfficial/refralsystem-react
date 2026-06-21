import React from 'react';
import { Shield, Users, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ChooseLogin = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-primary/5 rounded-full blur-[100px]"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-4xl relative z-10">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-background font-bold text-4xl shadow-[0_0_30px_rgba(212,160,23,0.5)]">
            A
          </div>
        </div>
        <h2 className="mt-2 text-center text-4xl font-extrabold text-text tracking-tight">
          Choose Your Portal
        </h2>
        <p className="mt-4 text-center text-base text-text-secondary">
          Select the appropriate portal to securely access your account
        </p>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Admin Portal */}
          <button
            onClick={() => navigate('/admin/login')}
            className="group relative glass-panel p-8 rounded-2xl border border-primary/20 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,160,23,0.15)] hover:-translate-y-2 text-left w-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Shield size={100} className="text-primary transform rotate-12 group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="w-16 h-16 rounded-xl bg-surface border border-border flex items-center justify-center mb-8 group-hover:bg-primary/10 transition-colors">
              <Shield className="text-primary" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-text mb-3">Admin Portal</h3>
            <p className="text-sm text-text-secondary leading-relaxed">System Management & Analytics Control</p>
          </button>

          {/* Agent Portal */}
          <button
            onClick={() => navigate('/agent/login')}
            className="group relative glass-panel p-8 rounded-2xl border border-primary/20 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,160,23,0.15)] hover:-translate-y-2 text-left w-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Users size={100} className="text-primary transform rotate-12 group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="w-16 h-16 rounded-xl bg-surface border border-border flex items-center justify-center mb-8 group-hover:bg-primary/10 transition-colors">
              <Users className="text-primary" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-text mb-3">Agent Portal</h3>
            <p className="text-sm text-text-secondary leading-relaxed">Partner Access & User Onboarding</p>
          </button>

          {/* User Withdrawal Portal */}
          <button
            onClick={() => navigate('/withdrawal/login')}
            className="group relative glass-panel p-8 rounded-2xl border border-primary/20 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,160,23,0.15)] hover:-translate-y-2 text-left w-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Wallet size={100} className="text-primary transform rotate-12 group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="w-16 h-16 rounded-xl bg-surface border border-border flex items-center justify-center mb-8 group-hover:bg-primary/10 transition-colors">
              <Wallet className="text-primary" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-text mb-3">User Withdrawal</h3>
            <p className="text-sm text-text-secondary leading-relaxed">Wallet Management & Payment Requests</p>
          </button>
        </div>

        <p className="mt-10 text-center text-sm text-text-secondary">
          New user?{' '}
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="text-primary hover:underline font-medium"
          >
            Register for referral
          </button>
        </p>
      </div>
    </div>
  );
};

export default ChooseLogin;
