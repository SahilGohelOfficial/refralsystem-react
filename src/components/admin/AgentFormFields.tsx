import type { FormEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';

const normalizePhone = (value: string) => value.replace(/\D/g, '').slice(0, 10);

function FormRow({
  label,
  htmlFor,
  required,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[8.5rem_minmax(0,1fr)] gap-x-4 gap-y-1.5 items-start">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-text-secondary text-left sm:pt-2.5 mb-0"
      >
        {label}
        {required ? <span className="ml-0.5 text-error">*</span> : null}
      </label>
      <div className="min-w-0 w-full text-left">
        {children}
        {error ? (
          <p className="mt-1.5 text-xs text-error text-left" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}

interface AgentFormFieldsProps {
  firstName: string;
  setFirstName: (value: string) => void;
  middleName: string;
  setMiddleName: (value: string) => void;
  lastName: string;
  setLastName: (value: string) => void;
  genderChoice: string;
  setGenderChoice: (value: string) => void;
  genderError?: string;
  email: string;
  setEmail: (value: string) => void;
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  stateId: string;
  setStateId: (value: string) => void;
  cityId: string;
  setCityId: (value: string) => void;
  stateOptions: { value: number; label: string }[];
  cityOptions: { value: number; label: string }[];
  loadingCities: boolean;
  submitting: boolean;
  submitLabel: string;
  onSubmit: (e: FormEvent) => void;
  onCancel: () => void;
}

const AgentFormFields = ({
  firstName,
  setFirstName,
  middleName,
  setMiddleName,
  lastName,
  setLastName,
  genderChoice,
  setGenderChoice,
  genderError,
  email,
  setEmail,
  phoneNumber,
  setPhoneNumber,
  stateId,
  setStateId,
  cityId,
  setCityId,
  stateOptions,
  cityOptions,
  loadingCities,
  submitting,
  submitLabel,
  onSubmit,
  onCancel,
}: AgentFormFieldsProps) => {
  const { t } = useTranslation();

  return (
    <form onSubmit={onSubmit} className="space-y-4 text-left">
      <FormRow label="First name" htmlFor="agent-first-name" required>
        <Input
          id="agent-first-name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
          disabled={submitting}
          className="text-left"
        />
      </FormRow>
      <FormRow label="Middle name" htmlFor="agent-middle-name">
        <Input
          id="agent-middle-name"
          value={middleName}
          onChange={(e) => setMiddleName(e.target.value)}
          disabled={submitting}
          className="text-left"
        />
      </FormRow>
      <FormRow label="Last name" htmlFor="agent-last-name" required>
        <Input
          id="agent-last-name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
          disabled={submitting}
          className="text-left"
        />
      </FormRow>

      <FormRow label={t('register.gender', 'Gender')} required error={genderError}>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t('register.gender', 'Gender')}>
          {['Male', 'Female'].map((option) => {
            const id = `agent-gender-${option}`;
            const checked = genderChoice === option;
            return (
              <label
                key={option}
                htmlFor={id}
                className={[
                  'inline-flex min-w-[6.5rem] cursor-pointer items-center gap-2 rounded-lg border px-3.5 py-2.5 text-sm text-left',
                  'transition-all duration-150',
                  checked
                    ? 'border-primary/40 bg-primary-muted text-text'
                    : 'border-border bg-surface/50 text-text hover:border-border-strong hover:bg-surface-elevated',
                ].join(' ')}
              >
                <input
                  id={id}
                  type="radio"
                  name="gender"
                  value={option}
                  checked={checked}
                  required
                  disabled={submitting}
                  onChange={(e) => setGenderChoice(e.target.value)}
                  className="size-4 shrink-0 border-border text-primary focus:ring-2 focus:ring-primary/20"
                />
                <span>{option}</span>
              </label>
            );
          })}
        </div>
      </FormRow>

      <FormRow label="Email" htmlFor="agent-email">
        <Input
          id="agent-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={submitting}
          className="text-left"
        />
      </FormRow>
      <FormRow label="Phone" htmlFor="agent-phone">
        <Input
          id="agent-phone"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(normalizePhone(e.target.value))}
          placeholder="9876543210"
          inputMode="numeric"
          maxLength={10}
          disabled={submitting}
          className="text-left"
        />
      </FormRow>
      <FormRow label="State" htmlFor="agent-state" required>
        <Select
          id="agent-state"
          value={stateId}
          onChange={(e) => {
            setStateId(e.target.value);
            setCityId('');
          }}
          options={[
            {
              value: '',
              label: stateOptions.length === 0 ? 'No states available' : 'Select state',
            },
            ...stateOptions,
          ]}
          disabled={submitting || stateOptions.length === 0}
          required
          className="text-left"
        />
      </FormRow>
      <FormRow label="City" htmlFor="agent-city" required>
        <Select
          id="agent-city"
          value={cityId}
          onChange={(e) => setCityId(e.target.value)}
          options={[
            {
              value: '',
              label: !stateId
                ? 'Select state first'
                : loadingCities
                  ? 'Loading cities...'
                  : cityOptions.length === 0
                    ? 'No cities available'
                    : 'Select city',
            },
            ...cityOptions,
          ]}
          disabled={submitting || !stateId || loadingCities}
          required
          className="text-left"
        />
      </FormRow>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" isLoading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default AgentFormFields;
