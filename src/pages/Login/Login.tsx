import React, { useState, FormEvent } from 'react';
import { Mail, Lock, ArrowLeft, User, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../stores/authStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getDashboardPath } from '../../lib/roles';

type LoginFieldErrors = {
  identifier?: string;
  password?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\d{10}$/;

const Login = () => {
  const { login, isAuthenticated, user } = useAuth();
  const { t } = useTranslation();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
  const navigate = useNavigate();
  const location = useLocation();

  const path = location.pathname;
  let portal: 'admin' | 'agent' | 'user' = 'admin';
  let title = 'Admin Portal';
  let identifierLabel = 'Email address';
  let identifierType: 'email' | 'text' = 'email';
  let identifierPlaceholder = 'admin@example.com';

  if (path.includes('agent')) {
    portal = 'agent';
    title = 'Agent Portal';
    identifierLabel = 'Agent Login ID';
    identifierType = 'text';
    identifierPlaceholder = 'GJ-AMD-XXXX';
  } else if (path.startsWith('/user')) {
    portal = 'user';
    title = 'User Portal';
    identifierLabel = 'Phone number';
    identifierType = 'text';
    identifierPlaceholder = '9876543210';
  }

  if (isAuthenticated && user) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  const getIdentifierError = (value: string): string | undefined => {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return `${identifierLabel} is required`;
    }

    if (portal === 'admin' && !EMAIL_REGEX.test(trimmedValue)) {
      return 'Enter a valid email address';
    }

    if (portal === 'user' && !PHONE_REGEX.test(trimmedValue)) {
      return 'Phone number must be exactly 10 digits';
    }

    return undefined;
  };

  const validateLoginForm = (): boolean => {
    const nextErrors: LoginFieldErrors = {};
    const identifierError = getIdentifierError(identifier);
    const trimmedPassword = password.trim();

    if (identifierError) {
      nextErrors.identifier = identifierError;
    }

    if (!trimmedPassword) {
      nextErrors.password = 'Password is required';
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleIdentifierChange = (value: string) => {
    const nextValue =
      portal === 'user' ? value.replace(/\D/g, '').slice(0, 10) : value;
    setIdentifier(nextValue);
    setFieldErrors((prev) => ({ ...prev, identifier: undefined }));
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setFieldErrors((prev) => ({ ...prev, password: undefined }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateLoginForm()) {
      toast.error('Please fix the highlighted fields');
      return;
    }

    const normalizedIdentifier =
      portal === 'user'
        ? identifier.replace(/\D/g, '')
        : portal === 'agent'
          ? identifier.trim().toUpperCase()
          : identifier.trim();

    setIsLoading(true);
    try {
      await login(normalizedIdentifier, password, portal);
      toast.success('Successfully logged in!');
      navigate(getDashboardPath(portal === 'admin' ? 'admin' : portal));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Login failed';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const IdentifierIcon = portal === 'agent' ? User : portal === 'user' ? Phone : Mail;

  return (
    <div className="auth-shell">
      <div className="auth-glow-top" />
      <div className="auth-glow-bottom" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <button
          onClick={() => navigate('/choose-login')}
          className="absolute left-0 top-2 icon-btn gap-2 !inline-flex"
        >
          <ArrowLeft size={18} />
          <span className="text-sm">Back</span>
        </button>
        <div className="flex justify-center mb-6 mt-10">
          <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center text-background font-bold text-xl shadow-sm">
            A
          </div>
        </div>
        <h2 className="text-center text-2xl font-semibold text-text tracking-tight">
          {title}
        </h2>
        <p className="mt-2 text-center text-sm text-text-secondary">
          Sign in to access your dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="glass-panel rounded-xl py-8 px-5 sm:px-8">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <Input
              label={identifierLabel}
              type={identifierType}
              placeholder={identifierPlaceholder}
              icon={IdentifierIcon}
              value={identifier}
              onChange={(e) => handleIdentifierChange(e.target.value)}
              inputMode={portal === 'user' ? 'numeric' : undefined}
              maxLength={portal === 'user' ? 10 : undefined}
              pattern={portal === 'user' ? '\\d{10}' : undefined}
              autoComplete={portal === 'admin' ? 'email' : 'username'}
              error={fieldErrors.identifier}
              required
              disabled={isLoading}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              autoComplete="current-password"
              error={fieldErrors.password}
              required
              disabled={isLoading}
            />

            {(portal === 'user' || portal === 'agent') && (
              <div className="flex justify-end -mt-2">
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      portal === 'agent' ? '/agent/forgot-password' : '/user/forgot-password',
                    )
                  }
                  className="text-sm text-primary hover:underline font-medium"
                  disabled={isLoading}
                >
                  {t('auth.forgot.link', 'Forgot password?')}
                </button>
              </div>
            )}

            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={isLoading}
              className="mt-2"
            >
              Sign in
            </Button>
          </form>

          {(portal === 'agent' || portal === 'user') && (
            <div className="mt-6 text-center text-xs text-text-muted">
              {portal === 'agent' && (
                <>
                  <p>
                    {t(
                      'auth.agent_hint',
                      'Use credentials provided when your agent account was created',
                    )}
                  </p>
                  <p className="mt-3 text-sm text-text-secondary">
                    {t('agent.signup.new_agent', 'New agent?')}{' '}
                    <button
                      type="button"
                      onClick={() => navigate('/agent/sign-up')}
                      className="text-primary hover:underline font-medium"
                    >
                      {t('agent.signup.link', 'Sign up')}
                    </button>
                  </p>
                </>
              )}
              {portal === 'user' && (
                <>
                  <p>
                    {t(
                      'auth.user_hint',
                      'Use your registered phone number and password',
                    )}
                  </p>
                  <p className="mt-3 text-sm text-text-secondary">
                    New user?{' '}
                    <button
                      type="button"
                      onClick={() => navigate('/register')}
                      className="text-primary hover:underline font-medium"
                    >
                      Register for referral
                    </button>
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;