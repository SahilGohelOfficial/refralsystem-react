import { useState, useEffect, useCallback, FormEvent } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Landmark,
  Lock,
  Smartphone,
  UserPlus,
} from 'lucide-react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { RadioGroup } from '../../components/forms/form/Radio';
import { Card, CardContent } from '../../components/ui/Card';
import { agentSignUp, sendAgentRegistrationOtp } from '../../services/agents.service';
import { listCities, listStates } from '../../services/location.service';
import { formatApiError } from '../../lib/api';
import type { ApiError, City, State } from '../../types/api';
import { choiceToGender } from '../../types/api';
import { normalizePhone } from '../RegisterUser/useRegisterForm';

type Step = 'details' | 'otp' | 'bank';

const IFSC_PATTERN = /^[A-Z]{4}0[A-Z0-9]{6}$/i;

const STEPS: { id: Step; labelKey: string; fallback: string; icon: typeof UserPlus }[] = [
  { id: 'details', labelKey: 'agent.signup.step_details', fallback: 'Details', icon: UserPlus },
  { id: 'bank', labelKey: 'agent.signup.step_bank', fallback: 'Bank details', icon: Landmark },
  { id: 'otp', labelKey: 'agent.signup.step_otp', fallback: 'Verify mobile', icon: Smartphone },
];

const AgentSignUp = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAuthenticated, user, loginWithAgentSession } = useAuth();

  const [step, setStep] = useState<Step>('details');
  const [submitting, setSubmitting] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [genderChoice, setGenderChoice] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');

  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [formStateId, setFormStateId] = useState('');
  const [formCityId, setFormCityId] = useState('');
  const [loadingCities, setLoadingCities] = useState(false);

  const fetchStates = useCallback(async () => {
    try {
      const data = await listStates();
      setStates(data);
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
    }
  }, []);

  useEffect(() => {
    fetchStates();
  }, [fetchStates]);

  useEffect(() => {
    if (!formStateId) {
      setCities([]);
      setFormCityId('');
      return;
    }
    let cancelled = false;
    setLoadingCities(true);
    listCities(Number(formStateId))
      .then((data) => {
        if (!cancelled) setCities(data);
      })
      .catch((error) => {
        if (!cancelled) toast.error(formatApiError(error as ApiError));
      })
      .finally(() => {
        if (!cancelled) setLoadingCities(false);
      });
    return () => {
      cancelled = true;
    };
  }, [formStateId]);

  if (isAuthenticated && user?.role === 'agent') {
    return <Navigate to="/agent/dashboard" replace />;
  }

  const resolveLocationNames = () => {
    const state = states.find((s) => s.id === Number(formStateId));
    const city = cities.find((c) => c.id === Number(formCityId));
    return { state: state?.name ?? '', city: city?.name ?? '' };
  };

  const validateDetails = () => {
    const errors: Record<string, string> = {};
    if (!firstName.trim()) {
      errors.firstName = t('register.err_first_name', 'First name is required');
    }
    if (!lastName.trim()) {
      errors.lastName = t('register.err_last_name', 'Last name is required');
    }
    if (!choiceToGender(genderChoice)) {
      errors.gender = t('register.err_gender_required', 'Please select gender');
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = t('register.err_email', 'Valid email is required');
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = t(
        'agent.signup.err_password_match',
        'Passwords do not match',
      );
    }
    if (
      password.length < 8 ||
      !/[a-zA-Z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      errors.password = t(
        'agent.signup.err_password_rules',
        'Password must be at least 8 characters with one letter and one number',
      );
    }
    const { state, city } = resolveLocationNames();
    if (!state || !city) {
      errors.location = t(
        'agent.signup.select_location',
        'Please select state and city',
      );
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateOtp = () => {
    const errors: Record<string, string> = {};
    if (!/^\d{10}$/.test(phoneNumber)) {
      errors.phoneNumber = t(
        'register.err_phone',
        'Phone number must be exactly 10 digits',
      );
    }
    if (!otpSent) {
      errors.phoneNumber = t(
        'register.err_otp_not_sent',
        'Send a verification code to your phone first',
      );
    }
    if (!/^\d{4}$/.test(otp)) {
      errors.otp = t('register.err_otp', 'Enter the 4-digit verification code');
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateBank = () => {
    const errors: Record<string, string> = {};
    if (!accountHolderName.trim()) {
      errors.accountHolderName = t(
        'register.err_account_holder',
        'Account holder name is required',
      );
    }
    if (!/^\d+$/.test(accountNumber)) {
      errors.accountNumber = t(
        'register.err_account_number',
        'Account number must contain only digits',
      );
    }
    if (!/^\d+$/.test(confirmAccountNumber)) {
      errors.confirmAccountNumber = t(
        'register.err_confirm_account',
        'Confirm account number must contain only digits',
      );
    } else if (confirmAccountNumber !== accountNumber) {
      errors.confirmAccountNumber = t(
        'register.err_account_mismatch',
        'Account numbers do not match',
      );
    }
    if (!IFSC_PATTERN.test(ifscCode)) {
      errors.ifscCode = t(
        'register.err_ifsc',
        'Invalid IFSC format (e.g. ABCD0123456)',
      );
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleDetailsContinue = (e: FormEvent) => {
    e.preventDefault();
    if (!validateDetails()) return;
    setFieldErrors({});
    setStep('bank');
  };

  const handleBankContinue = (e: FormEvent) => {
    e.preventDefault();
    if (!validateBank()) return;
    setFieldErrors({});
    setStep('otp');
  };

  const handleSendOtp = async () => {
    if (!/^\d{10}$/.test(phoneNumber)) {
      setFieldErrors({
        phoneNumber: t(
          'register.err_phone',
          'Phone number must be exactly 10 digits',
        ),
      });
      return;
    }
    setSendingOtp(true);
    try {
      await sendAgentRegistrationOtp(phoneNumber);
      setOtpSent(true);
      toast.success(t('register.otp_sent', 'Verification code sent'));
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
    } finally {
      setSendingOtp(false);
    }
  };

  const handleOtpSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateOtp()) return;

    const { state, city } = resolveLocationNames();
    setSubmitting(true);
    try {
      const { accessToken, agent } = await agentSignUp({
        firstName: firstName.trim(),
        middleName: middleName.trim() || undefined,
        lastName: lastName.trim(),
        gender: choiceToGender(genderChoice)!,
        phoneNumber,
        email: email.trim(),
        state,
        city,
        password,
        accountHolderName: accountHolderName.trim(),
        accountNumber,
        confirmAccountNumber,
        ifscCode: ifscCode.toUpperCase(),
        otp,
      });
      loginWithAgentSession(accessToken, agent);
      toast.success(t('agent.signup.success', 'Account created successfully'));
      navigate('/agent/dashboard');
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
    } finally {
      setSubmitting(false);
    }
  };

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto space-y-6">
        <button
          type="button"
          onClick={() => navigate('/agent/login')}
          className="flex items-center gap-2 text-sm text-text-secondary hover:text-text transition-colors"
        >
          <ArrowLeft size={16} />
          {t('agent.signup.back_login', 'Back to login')}
        </button>

        <div className="text-center sm:text-left">
          <div className="inline-flex items-center justify-center size-12 rounded-xl bg-primary/15 text-primary mb-4">
            <UserPlus size={24} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text">
            {t('agent.signup.title', 'Agent Sign Up')}
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            {t('agent.signup.subtitle', 'Create your agent account to access the partner portal.')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {STEPS.map((s, index) => {
            const Icon = s.icon;
            const isActive = s.id === step;
            const isDone = stepIndex > index;
            return (
              <div key={s.id} className="flex flex-1 items-center gap-2 min-w-0">
                <div
                  className={`flex items-center justify-center size-8 shrink-0 rounded-full border text-xs font-medium transition-colors ${
                    isActive
                      ? 'border-primary bg-primary text-background'
                      : isDone
                        ? 'border-primary/50 bg-primary/10 text-primary'
                        : 'border-border bg-surface text-text-secondary'
                  }`}
                >
                  {isDone ? <CheckCircle2 size={14} /> : <Icon size={14} />}
                </div>
                <span
                  className={`hidden sm:block text-xs truncate ${
                    isActive ? 'text-text font-medium' : 'text-text-secondary'
                  }`}
                >
                  {t(s.labelKey, s.fallback)}
                </span>
                {index < STEPS.length - 1 && (
                  <div className="hidden sm:block flex-1 h-px bg-border ml-1" />
                )}
              </div>
            );
          })}
        </div>

        <Card>
          <CardContent className="pt-2">
            {step === 'details' ? (
              <form onSubmit={handleDetailsContinue} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label={t('agent.signup.first_name', 'First name')}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    error={fieldErrors.firstName}
                    required
                    disabled={submitting}
                  />
                  <Input
                    label={t('agent.signup.middle_name', 'Middle name')}
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                    disabled={submitting}
                  />
                  <Input
                    label={t('agent.signup.last_name', 'Last name')}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    error={fieldErrors.lastName}
                    required
                    disabled={submitting}
                  />
                </div>
                <RadioGroup
                  name="gender"
                  label={t('register.gender', 'Gender')}
                  options={['Male', 'Female']}
                  value={genderChoice}
                  onChange={(e) => setGenderChoice(e.target.value)}
                  error={fieldErrors.gender}
                  required
                />
                <Input
                  label={t('agent.signup.email', 'Email')}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={fieldErrors.email}
                  required
                  disabled={submitting}
                />
                <Select
                  label={t('agent.signup.state', 'State')}
                  value={formStateId}
                  onChange={(e) => {
                    setFormStateId(e.target.value);
                    setFormCityId('');
                  }}
                  options={[
                    {
                      value: '',
                      label:
                        states.length === 0
                          ? t('agent.signup.no_states', 'No states available')
                          : t('agent.signup.select_state', 'Select state'),
                    },
                    ...states.map((s) => ({ value: s.id, label: s.name })),
                  ]}
                  disabled={states.length === 0 || submitting}
                  required
                />
                <Select
                  label={t('agent.signup.city', 'City')}
                  value={formCityId}
                  onChange={(e) => setFormCityId(e.target.value)}
                  options={[
                    {
                      value: '',
                      label: !formStateId
                        ? t('agent.signup.select_state_first', 'Select state first')
                        : loadingCities
                          ? t('common.loading', 'Loading...')
                          : cities.length === 0
                            ? t('agent.signup.no_cities', 'No cities available')
                            : t('agent.signup.select_city', 'Select city'),
                    },
                    ...cities.map((c) => ({ value: c.id, label: c.name })),
                  ]}
                  disabled={!formStateId || loadingCities || submitting}
                  required
                />
                {fieldErrors.location && (
                  <p className="text-xs text-error">{fieldErrors.location}</p>
                )}
                <Input
                  label={t('agent.signup.password', 'Password')}
                  type="password"
                  icon={Lock}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={fieldErrors.password}
                  required
                  disabled={submitting}
                />
                <Input
                  label={t('agent.signup.confirm_password', 'Confirm password')}
                  type="password"
                  icon={Lock}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={fieldErrors.confirmPassword}
                  required
                  disabled={submitting}
                />

                <div className="flex justify-end pt-2">
                  <Button type="submit" className="gap-2">
                    {t('register.continue', 'Continue')}
                    <ArrowRight size={16} />
                  </Button>
                </div>
              </form>
            ) : step === 'bank' ? (
              <form onSubmit={handleBankContinue} className="space-y-4">
                <p className="text-sm text-text-secondary">
                  {t(
                    'agent.signup.bank_desc',
                    'Add your bank account details to receive payouts.',
                  )}
                </p>
                <Input
                  label={t('register.account_holder_name', 'Account Holder Name')}
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  error={fieldErrors.accountHolderName}
                  required
                  disabled={submitting}
                />
                <Input
                  label={t('register.account_number', 'Account Number')}
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                  inputMode="numeric"
                  error={fieldErrors.accountNumber}
                  required
                  disabled={submitting}
                />
                <Input
                  label={t('register.confirm_account_number', 'Confirm Account Number')}
                  value={confirmAccountNumber}
                  onChange={(e) =>
                    setConfirmAccountNumber(e.target.value.replace(/\D/g, ''))
                  }
                  inputMode="numeric"
                  error={fieldErrors.confirmAccountNumber}
                  required
                  disabled={submitting}
                />
                <Input
                  label={t('register.ifsc_code', 'IFSC Code')}
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value.toUpperCase().slice(0, 11))}
                  placeholder="ABCD0123456"
                  error={fieldErrors.ifscCode}
                  required
                  disabled={submitting}
                />
                <div className="flex justify-between pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setStep('details')}
                    disabled={submitting}
                  >
                    {t('register.back_step', 'Back')}
                  </Button>
                  <Button type="submit" className="gap-2">
                    {t('register.continue', 'Continue')}
                    <ArrowRight size={16} />
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <p className="text-sm text-text-secondary">
                  {t(
                    'register.otp_desc',
                    'Verify your mobile number. A verification code will be sent to your phone.',
                  )}
                </p>
                <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
                  <div className="flex-1">
                    <Input
                      label={t('agent.signup.phone', 'Phone number')}
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(normalizePhone(e.target.value))}
                      placeholder="9876543210"
                      inputMode="numeric"
                      maxLength={10}
                      error={fieldErrors.phoneNumber}
                      required
                      disabled={submitting}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleSendOtp}
                    isLoading={sendingOtp}
                    disabled={submitting}
                    className="sm:mb-0.5 shrink-0"
                  >
                    {otpSent
                      ? t('register.resend_otp', 'Resend code')
                      : t('register.send_otp', 'Send OTP')}
                  </Button>
                </div>
                <Input
                  label={t('register.otp_code', 'Verification code')}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="1111"
                  inputMode="numeric"
                  maxLength={4}
                  error={fieldErrors.otp}
                  required
                  disabled={submitting}
                />
                <div className="flex justify-between pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setStep('bank')}
                    disabled={submitting}
                  >
                    {t('register.back_step', 'Back')}
                  </Button>
                  <Button type="submit" isLoading={submitting} className="gap-2">
                    {t('agent.signup.submit', 'Create account')}
                    <ArrowRight size={16} />
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AgentSignUp;
