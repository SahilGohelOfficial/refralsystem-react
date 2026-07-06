import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { RadioGroup } from '../forms/form/Radio';

const normalizePhone = (value: string) => value.replace(/\D/g, '').slice(0, 10);

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
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input label="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required disabled={submitting} />
        <Input label="Middle name" value={middleName} onChange={(e) => setMiddleName(e.target.value)} disabled={submitting} />
        <Input label="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} required disabled={submitting} />
      </div>
      <RadioGroup
        name="gender"
        label={t('register.gender', 'Gender')}
        options={['Male', 'Female']}
        value={genderChoice}
        onChange={(e) => setGenderChoice(e.target.value)}
        error={genderError}
        required
      />
      <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={submitting} />
      <Input
        label="Phone"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(normalizePhone(e.target.value))}
        placeholder="9876543210"
        inputMode="numeric"
        maxLength={10}
        disabled={submitting}
      />
      <Select
        label="State"
        value={stateId}
        onChange={(e) => {
          setStateId(e.target.value);
          setCityId('');
        }}
        options={[
          { value: '', label: stateOptions.length === 0 ? 'No states available' : 'Select state' },
          ...stateOptions,
        ]}
        disabled={submitting || stateOptions.length === 0}
        required
      />
      <Select
        label="City"
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
      />
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
