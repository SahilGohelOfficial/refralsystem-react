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
  { id: 'otp', labelKey: 'register.step_otp', fallback: 'Verify mobile', icon: Smartphone },
  { id: 'agent', labelKey: 'register.step_agent', fallback: 'Choose agent', icon: Users },
];

const AGENT_PORTAL_STEPS = STEPS.filter((s) => s.id !== 'agent');

const RegisterUser = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const isAgentPortal = user?.role === 'agent';

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
    marriageDate,
    setMarriageDate,
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
    loadingAgentProfile,
    locationLocked,
    selectedState,
    selectedCity,
    selectedAgent,
    validatePersonal,
    validateAddress,
    validateBank,
    handleSendOtp,
    completeRegistration,
    handleAssignAgent,
    goBack,
  } = form;

  const visibleSteps = isAgentPortal ? AGENT_PORTAL_STEPS : STEPS;
  const stepIndex = visibleSteps.findIndex((s) => s.id === step);
  const exitPath = isAgentPortal ? '/agent/dashboard' : '/choose-login';
  const assignedAgentDisplay = isAgentPortal ? agentProfile : selectedAgent;

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
          <div className="flex items-center gap-2">
            {visibleSteps.map((s, index) => {
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
                  {index < visibleSteps.length - 1 && (
                    <div className="hidden sm:block flex-1 h-px bg-border ml-1" />
                  )}
                </div>
              );
            })}
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
                marriageDate={marriageDate}
                setMarriageDate={setMarriageDate}
                handleMarriedChange={handleMarriedChange}
                fieldErrors={fieldErrors}
                onContinue={() => {
                  if (validatePersonal()) setStep('address');
                }}
              />
            </CardContent>
          </Card>
        )}

        {step === 'address' && (
          <Card>
            <CardContent className="space-y-4 pt-2">
              <RegisterAddressStep
                isAgentPortal={isAgentPortal}
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
                loadingAgentProfile={loadingAgentProfile}
                locationLocked={locationLocked}
                agentProfile={agentProfile}
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
                  if (validateBank()) setStep('otp');
                }}
              />
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
                    onClick={handleAssignAgent}
                    isLoading={submitting}
                    disabled={!selectedAgentId}
                  >
                    {t('register.complete', 'Complete registration')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {step === 'success' && assignedUser && (
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
                    {assignedAgentDisplay ? formatAgentName(assignedAgentDisplay) : '—'}
                  </span>
                </div>
              </div>
              <p className="text-sm text-text-secondary bg-primary/5 border border-primary/20 rounded-lg px-4 py-3">
                {t(
                  'register.agent_contact_note',
                  'Your assigned agent will contact you as soon as possible.',
                )}
              </p>
              <Button onClick={() => navigate(exitPath)} className="w-full sm:w-auto">
                {isAgentPortal
                  ? t('register.back_dashboard', 'Back to dashboard')
                  : t('register.done', 'Done')}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RegisterUser;
