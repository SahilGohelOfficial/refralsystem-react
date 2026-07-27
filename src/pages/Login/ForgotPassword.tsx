import { useEffect, useState, type FormEvent } from 'react';
import { ArrowLeft, Lock, Phone, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { formatApiError } from '../../lib/api';
import { getDashboardPath } from '../../lib/roles';
import {
  agentForgotPassword,
  agentResetPassword,
  userForgotPassword,
  userResetPassword,
} from '../../services/auth.service';
import { useAuth } from '../../stores/authStore';
import type { ApiError } from '../../types/api';

type Step = 'phone' | 'reset';

type FieldErrors = {
  phoneNumber?: string;
  otp?: string;
  newPassword?: string;
  confirmPassword?: string;
};

const PHONE_REGEX = /^\d{10}$/;

const ForgotPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  const portal: 'agent' | 'user' = location.pathname.includes('/agent/')
    ? 'agent'
    : 'user';
  const loginPath = portal === 'agent' ? '/agent/login' : '/user/login';
  const title =
    portal === 'agent'
      ? t('auth.forgot.agent_title', 'Agent — Forgot password')
      : t('auth.forgot.user_title', 'User — Forgot password');

  const [step, setStep] = useState<Step>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [sendingOtp, setSendingOtp] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    setStep('phone');
    setPhoneNumber('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setFieldErrors({});
    setOtpSent(false);
  }, [portal]);

  if (isAuthenticated && user) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  const validatePhone = (): boolean => {
    const next: FieldErrors = {};
    const phone = phoneNumber.replace(/\D/g, '');
    if (!PHONE_REGEX.test(phone)) {
      next.phoneNumber = t(
        'auth.forgot.err_phone',
        'Enter a valid 10-digit mobile number',
      );
    }
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateReset = (): boolean => {
    const next: FieldErrors = {};
    if (!/^\d{4}$/.test(otp)) {
      next.otp = t('auth.forgot.err_otp', 'Enter the 4-digit verification code');
    }
    if (newPassword.length < 8) {
      next.newPassword = t(
        'auth.forgot.err_password',
        'Password must be at least 8 characters',
      );
    }
    if (confirmPassword !== newPassword) {
      next.confirmPassword = t(
        'auth.forgot.err_password_match',
        'Passwords do not match',
      );
    }
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSendOtp = async () => {
    if (!validatePhone()) return;
    const phone = phoneNumber.replace(/\D/g, '');
    setSendingOtp(true);
    try {
      if (portal === 'agent') {
        await agentForgotPassword(phone);
      } else {
        await userForgotPassword(phone);
      }
      setPhoneNumber(phone);
      setOtpSent(true);
      setStep('reset');
      toast.success(
        t(
          'auth.forgot.otp_sent',
          'If this number is registered, an OTP has been sent',
        ),
      );
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
    } finally {
      setSendingOtp(false);
    }
  };

  const handleReset = async (event: FormEvent) => {
    event.preventDefault();
    if (!validateReset()) {
      toast.error(t('auth.forgot.fix_errors', 'Please fix the highlighted fields'));
      return;
    }

    const phone = phoneNumber.replace(/\D/g, '');
    setSubmitting(true);
    try {
      const payload = {
        phoneNumber: phone,
        otp,
        newPassword,
      };
      if (portal === 'agent') {
        await agentResetPassword(payload);
      } else {
        await userResetPassword(payload);
      }
      toast.success(
        t('auth.forgot.reset_success', 'Password reset successfully. Please sign in.'),
      );
      navigate(loginPath, { replace: true });
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-glow-top" />
      <div className="auth-glow-bottom" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <button
          type="button"
          onClick={() => navigate(loginPath)}
          className="absolute left-0 top-2 icon-btn gap-2 !inline-flex"
        >
          <ArrowLeft size={18} />
          <span className="text-sm">{t('common.back', 'Back')}</span>
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
          {step === 'phone'
            ? t(
                'auth.forgot.subtitle_phone',
                'Enter your registered mobile number to receive a verification code.',
              )
            : t(
                'auth.forgot.subtitle_reset',
                'Enter the code sent to your phone and choose a new password.',
              )}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="glass-panel rounded-xl py-8 px-5 sm:px-8">
          {step === 'phone' ? (
            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                void handleSendOtp();
              }}
            >
              <Input
                label={t('auth.forgot.phone_label', 'Mobile number')}
                type="text"
                placeholder="9876543210"
                icon={Phone}
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10));
                  setFieldErrors((prev) => ({ ...prev, phoneNumber: undefined }));
                }}
                inputMode="numeric"
                maxLength={10}
                autoComplete="tel"
                error={fieldErrors.phoneNumber}
                required
                disabled={sendingOtp}
              />

              <Button type="submit" fullWidth size="lg" isLoading={sendingOtp}>
                {t('auth.forgot.send_otp', 'Send OTP')}
              </Button>
            </form>
          ) : (
            <form className="space-y-5" onSubmit={(e) => void handleReset(e)}>
              <div className="rounded-lg border border-border bg-surface/40 px-3 py-2 text-sm text-text-secondary">
                {t('auth.forgot.code_sent_to', 'Code sent to')}{' '}
                <span className="font-medium text-text">{phoneNumber}</span>
                <button
                  type="button"
                  className="ml-2 text-primary hover:underline text-xs font-medium"
                  onClick={() => {
                    setStep('phone');
                    setOtp('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setFieldErrors({});
                  }}
                  disabled={submitting}
                >
                  {t('auth.forgot.change_number', 'Change')}
                </button>
              </div>

              <Input
                label={t('auth.forgot.otp_label', 'Verification code')}
                type="text"
                placeholder="1111"
                icon={Smartphone}
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, '').slice(0, 4));
                  setFieldErrors((prev) => ({ ...prev, otp: undefined }));
                }}
                inputMode="numeric"
                maxLength={4}
                autoComplete="one-time-code"
                error={fieldErrors.otp}
                required
                disabled={submitting}
              />

              <Input
                label={t('auth.forgot.new_password', 'New password')}
                type="password"
                placeholder="••••••••"
                icon={Lock}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, newPassword: undefined }));
                }}
                autoComplete="new-password"
                error={fieldErrors.newPassword}
                required
                disabled={submitting}
              />

              <Input
                label={t('auth.forgot.confirm_password', 'Confirm password')}
                type="password"
                placeholder="••••••••"
                icon={Lock}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setFieldErrors((prev) => ({
                    ...prev,
                    confirmPassword: undefined,
                  }));
                }}
                autoComplete="new-password"
                error={fieldErrors.confirmPassword}
                required
                disabled={submitting}
              />

              <div className="flex flex-col gap-2">
                <Button type="submit" fullWidth size="lg" isLoading={submitting}>
                  {t('auth.forgot.reset_button', 'Reset password')}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  fullWidth
                  disabled={submitting || sendingOtp}
                  onClick={() => void handleSendOtp()}
                  isLoading={sendingOtp}
                >
                  {otpSent
                    ? t('auth.forgot.resend_otp', 'Resend code')
                    : t('auth.forgot.send_otp', 'Send OTP')}
                </Button>
              </div>

              <p className="text-xs text-center text-text-muted">
                {t(
                  'auth.forgot.otp_hint',
                  'Use the same 4-digit OTP flow as signup (demo code: 1111).',
                )}
              </p>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-text-secondary">
            <button
              type="button"
              onClick={() => navigate(loginPath)}
              className="text-primary hover:underline font-medium"
            >
              {t('auth.forgot.back_to_login', 'Back to sign in')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
