import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  CheckCircle2,
  Home,
  Smartphone,
  User,
  Users,
  Wallet,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useAuth } from '../../stores/authStore';
import { formatAgentName, formatUserName } from '../../types/api';
import { useRegisterForm, type RegisterStep } from './useRegisterForm';
import RegisterPersonalStep from './RegisterPersonalStep';
import RegisterAddressStep from './RegisterAddressStep';
import RegisterBankStep from './RegisterBankStep';
import RegisterOtpStep from './RegisterOtpStep';

const STEPS: {
  id: RegisterStep;
  labelKey: string;
  fallback: string;
  icon: typeof User;
}[] = [
  { id: 'personal', labelKey: 'register.step_personal', fallback: 'Personal', icon: User },
  { id: 'address', labelKey: 'register.step_address', fallback: 'Address', icon: Home },
  { id: 'bank', labelKey: 'register.step_bank', fallback: 'Bank', icon: Wallet },
  { id: 'agent', labelKey: 'register.step_agent', fallback: 'Choose agent', icon: Users },
  { id: 'otp', labelKey: 'register.step_otp', fallback: 'Verify mobile', icon: Smartphone },
];

const AGENT_PORTAL_STEPS = STEPS.filter((s) => s.id !== 'agent');

const RegisterUser = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, login } = useAuth();
  const isAgentPortal = user?.role === 'agent';
  const [redirectingToDashboard, setRedirectingToDashboard] = useState(false);
  const autoLoginAttemptedRef = useRef(false);

  const form = useRegisterForm({
    t,
    isAgentPortal,
    agentUserId: user?.id,
  });

  const {
    step,
    setStep,
    submitting,
    loadingAgents,
    sendingOtp,
    otpSent,
    assignedUser,
    fieldErrors,
    firstName,
    setFirstName,
    middleName,
    setMiddleName,
    lastName,
    setLastName,
    email,
    setEmail,
    password,
    setPassword,
    referralCode,
    setReferralCode,
    dateOfBirth,
    setDateOfBirth,
    genderChoice,
    setGenderChoice,
    isMarriedChoice,
    handleMarriedChange,
    addressLine1,
    setAddressLine1,
    addressLine2,
    setAddressLine2,
    landmark,
    setLandmark,
    postalCode,
    setPostalCode,
    formStateId,
    setFormStateId,
    formCityId,
    setFormCityId,
    accountHolderName,
    setAccountHolderName,
    accountNumber,
    setAccountNumber,
    confirmAccountNumber,
    setConfirmAccountNumber,
    ifscCode,
    setIfscCode,
    phoneNumber,
    setPhoneNumber,
    otp,
    setOtp,
    states,
    cities,
    loadingCities,
    agents,
    selectedAgentId,
    setSelectedAgentId,
    agentProfile,
    selectedState,
    selectedCity,
    selectedAgent,
    skipAgentStep,
    continueFromPersonal,
    continueFromBank,
    continueFromAgent,
    validateAddress,
    handleSendOtp,
    completeRegistration,
    goBack,
  } = form;

  const visibleSteps = skipAgentStep ? AGENT_PORTAL_STEPS : STEPS;
  const stepIndex = visibleSteps.findIndex((s) => s.id === step);
  const exitPath = isAgentPortal ? '/agent/dashboard' : '/choose-login';
  const assignedAgentDisplay = isAgentPortal ? agentProfile : selectedAgent;

  useEffect(() => {
    if (isAgentPortal || step !== 'success' || !assignedUser || autoLoginAttemptedRef.current) {
      return;
    }

    autoLoginAttemptedRef.current = true;
    let cancelled = false;
    const redirectToDashboard = async () => {
      setRedirectingToDashboard(true);
      try {
        await login(phoneNumber, password, 'user');
        if (!cancelled) {
          navigate('/user/dashboard', { replace: true });
        }
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error
              ? error.message
              : t('register.auto_login_failed', 'Registration successful. Please sign in.');
          toast.error(message);
          setRedirectingToDashboard(false);
          autoLoginAttemptedRef.current = false;
        }
      }
    };

    void redirectToDashboard();
    return () => {
      cancelled = true;
    };
  }, [
    isAgentPortal,
    step,
    assignedUser,
    login,
    phoneNumber,
    password,
    navigate,
    t,
  ]);

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate(exitPath)}
            className="flex items-center gap-2 text-sm text-text-secondary hover:text-text transition-colors"
          >
            <ArrowLeft size={16} />
            {t('register.back', 'Back')}
          </button>
          <Badge variant="primary">{t('register.badge', 'Referral registration')}</Badge>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text">
            {t('register.title', 'User Registration')}
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            {t(
              'register.subtitle',
              'Complete your profile, address, bank details, and connect with a referral agent.',
            )}
          </p>
        </div>

        {step !== 'success' && (
          <div className="space-y-3 rounded-xl border border-border bg-surface/40 px-3 py-4 sm:px-4">
            <ol className="flex w-full list-none p-0 m-0">
              {visibleSteps.map((s, index) => {
                const Icon = s.icon;
                const isActive = s.id === step;
                const isDone = stepIndex > index;
                const label = t(s.labelKey, s.fallback);
                return (
                  <li key={s.id} className="flex flex-1 min-w-0 flex-col items-center">
                    <div className="flex w-full items-center">
                      <div
                        className={`h-0.5 flex-1 ${
                          index === 0
                            ? 'bg-transparent'
                            : stepIndex >= index
                              ? 'bg-primary/50'
                              : 'bg-border'
                        }`}
                        aria-hidden
                      />
                      <div
                        className={`relative z-[1] flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-full border text-xs font-medium transition-colors ${
                          isActive
                            ? 'border-primary bg-primary text-background shadow-sm shadow-primary/25'
                            : isDone
                              ? 'border-primary/50 bg-primary/10 text-primary'
                              : 'border-border bg-card text-text-secondary'
                        }`}
                        aria-current={isActive ? 'step' : undefined}
                        title={label}
                      >
                        {isDone ? <CheckCircle2 size={16} /> : <Icon size={16} />}
                      </div>
                      <div
                        className={`h-0.5 flex-1 ${
                          index === visibleSteps.length - 1
                            ? 'bg-transparent'
                            : stepIndex > index
                              ? 'bg-primary/50'
                              : 'bg-border'
                        }`}
                        aria-hidden
                      />
                    </div>
                    <span
                      className={`mt-2 w-full max-w-[4.75rem] sm:max-w-none px-0.5 text-center text-[10px] sm:text-xs leading-snug ${
                        isActive
                          ? 'text-text font-semibold'
                          : isDone
                            ? 'text-primary font-medium'
                            : 'text-text-secondary'
                      }`}
                    >
                      {label}
                    </span>
                  </li>
                );
              })}
            </ol>
            {stepIndex >= 0 && (
              <p className="text-center text-sm text-text-secondary border-t border-border pt-3">
                <span className="text-text font-medium">
                  {t('register.step_progress', 'Step {{current}} of {{total}}', {
                    current: stepIndex + 1,
                    total: visibleSteps.length,
                  })}
                </span>
                <span className="mx-1.5 text-text-muted">·</span>
                <span>
                  {t(
                    visibleSteps[stepIndex].labelKey,
                    visibleSteps[stepIndex].fallback,
                  )}
                </span>
              </p>
            )}
          </div>
        )}

        {step === 'personal' && (
          <Card>
            <CardContent className="space-y-4 pt-2">
              <RegisterPersonalStep
                submitting={submitting}
                firstName={firstName}
                setFirstName={setFirstName}
                middleName={middleName}
                setMiddleName={setMiddleName}
                lastName={lastName}
                setLastName={setLastName}
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                referralCode={referralCode}
                setReferralCode={setReferralCode}
                dateOfBirth={dateOfBirth}
                setDateOfBirth={setDateOfBirth}
                genderChoice={genderChoice}
                setGenderChoice={setGenderChoice}
                isMarriedChoice={isMarriedChoice}
                handleMarriedChange={handleMarriedChange}
                fieldErrors={fieldErrors}
                onContinue={() => {
                  void continueFromPersonal();
                }}
              />
            </CardContent>
          </Card>
        )}

        {step === 'address' && (
          <Card>
            <CardContent className="space-y-4 pt-2">
              <RegisterAddressStep
                submitting={submitting}
                addressLine1={addressLine1}
                setAddressLine1={setAddressLine1}
                addressLine2={addressLine2}
                setAddressLine2={setAddressLine2}
                landmark={landmark}
                setLandmark={setLandmark}
                postalCode={postalCode}
                setPostalCode={setPostalCode}
                formStateId={formStateId}
                setFormStateId={setFormStateId}
                formCityId={formCityId}
                setFormCityId={setFormCityId}
                states={states}
                cities={cities}
                loadingCities={loadingCities}
                fieldErrors={fieldErrors}
                onBack={goBack}
                onContinue={() => {
                  if (validateAddress()) setStep('bank');
                }}
              />
            </CardContent>
          </Card>
        )}

        {step === 'bank' && (
          <Card>
            <CardContent className="space-y-4 pt-2">
              <RegisterBankStep
                submitting={submitting}
                accountHolderName={accountHolderName}
                setAccountHolderName={setAccountHolderName}
                accountNumber={accountNumber}
                setAccountNumber={setAccountNumber}
                confirmAccountNumber={confirmAccountNumber}
                setConfirmAccountNumber={setConfirmAccountNumber}
                ifscCode={ifscCode}
                setIfscCode={setIfscCode}
                fieldErrors={fieldErrors}
                onBack={goBack}
                onContinue={() => {
                  void continueFromBank();
                }}
              />
            </CardContent>
          </Card>
        )}

        {step === 'agent' && !isAgentPortal && (
          <Card>
            <CardContent className="space-y-4 pt-2">
              <div className="rounded-lg border border-border bg-surface/50 p-3 text-sm text-text-secondary">
                {t('register.location_summary', 'Location')}:{' '}
                <span className="text-text font-medium">
                  {selectedCity?.name}, {selectedState?.name}
                </span>
              </div>

              {loadingAgents ? (
                <div className="flex justify-center py-12">
                  <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                </div>
              ) : agents.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <Users className="mx-auto mb-3 text-text-secondary/40" size={40} />
                  <p className="text-text font-medium">
                    {t('register.no_agents', 'No agents available in this location')}
                  </p>
                  <p className="text-sm text-text-secondary mt-1">
                    {t('register.no_agents_hint', 'Try a different city or contact support.')}
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    className="mt-4"
                    onClick={() => setStep('address')}
                  >
                    {t('register.change_location', 'Change location')}
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-text-secondary">
                    {t('register.select_agent', 'Select your referral agent')}
                  </p>
                  {agents.map((agent) => {
                    const selected = selectedAgentId === agent.id;
                    return (
                      <button
                        key={agent.id}
                        type="button"
                        onClick={() => setSelectedAgentId(agent.id)}
                        className={`w-full text-left rounded-xl border p-4 transition-all ${
                          selected
                            ? 'border-primary bg-primary/10 shadow-[0_0_12px_rgba(212,160,23,0.15)]'
                            : 'border-border bg-surface/40 hover:border-primary/30 hover:bg-primary/5'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-text">{formatAgentName(agent)}</p>
                            <p className="text-xs text-text-secondary mt-0.5 font-mono">
                              {agent.agentLoginId}
                            </p>
                            {(agent.phoneNumber || agent.email) && (
                              <p className="text-xs text-text-secondary mt-1">
                                {[agent.phoneNumber, agent.email].filter(Boolean).join(' · ')}
                              </p>
                            )}
                          </div>
                          {selected && (
                            <CheckCircle2 className="shrink-0 text-primary" size={20} />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {agents.length > 0 && (
                <div className="flex justify-between pt-2">
                  <Button type="button" variant="secondary" onClick={goBack}>
                    {t('register.back_step', 'Back')}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => continueFromAgent()}
                    disabled={!selectedAgentId}
                  >
                    {t('register.continue', 'Continue')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {step === 'otp' && (
          <Card>
            <CardContent className="space-y-4 pt-2">
              <RegisterOtpStep
                submitting={submitting}
                sendingOtp={sendingOtp}
                otpSent={otpSent}
                phoneNumber={phoneNumber}
                setPhoneNumber={setPhoneNumber}
                otp={otp}
                setOtp={setOtp}
                fieldErrors={fieldErrors}
                onBack={goBack}
                onSendOtp={handleSendOtp}
                onSubmit={completeRegistration}
              />
            </CardContent>
          </Card>
        )}

        {isAgentPortal && step === 'success' && assignedUser && (
          <Card>
            <CardContent className="py-8 text-center space-y-4">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-success/15 border border-success/30">
                <CheckCircle2 className="text-success" size={32} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-text">
                  {t('register.success_title', 'Registration complete')}
                </h2>
                <p className="text-sm text-text-secondary mt-2">
                  {t(
                    'register.success_desc',
                    'You have been successfully registered and assigned to an agent.',
                  )}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-surface/50 p-4 text-left text-sm space-y-2">
                <div className="flex justify-between gap-4">
                  <span className="text-text-secondary">{t('register.name', 'Name')}</span>
                  <span className="text-text font-medium">
                    {formatUserName(assignedUser)}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-text-secondary">{t('register.phone', 'Phone')}</span>
                  <span className="text-text font-medium">{assignedUser.phoneNumber}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-text-secondary">
                    {t('register.location_summary', 'Location')}
                  </span>
                  <span className="text-text font-medium text-right">
                    {selectedCity?.name}, {selectedState?.name}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-text-secondary">{t('register.agent', 'Agent')}</span>
                  <span className="text-text font-medium text-right">
                    {assignedAgentDisplay
                      ? formatAgentName(assignedAgentDisplay)
                      : assignedUser.agentId
                        ? t('register.agent_via_referral', 'Assigned via referral')
                        : '—'}
                  </span>
                </div>
              </div>
              <Button
                onClick={() => navigate(isAgentPortal ? exitPath : '/user/login')}
                isLoading={redirectingToDashboard}
                className="w-full sm:w-auto"
              >
                {isAgentPortal
                  ? t('register.back_dashboard', 'Back to dashboard')
                  : t('register.sign_in', 'Sign in')}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RegisterUser;
