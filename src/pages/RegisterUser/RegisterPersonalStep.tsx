import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import Input from '../../components/ui/Input';
import DatePicker from '../../components/ui/DatePicker';
import Button from '../../components/ui/Button';
import { RadioGroup } from '../../components/forms/form/Radio';
import { todayUtcDateString, yearsAgoUtcDateString } from '../../lib/dates';

type RegisterPersonalStepProps = {
  submitting: boolean;
  firstName: string;
  setFirstName: (v: string) => void;
  middleName: string;
  setMiddleName: (v: string) => void;
  lastName: string;
  setLastName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  referralCode: string;
  setReferralCode: (v: string) => void;
  dateOfBirth: string;
  setDateOfBirth: (v: string) => void;
  genderChoice: string;
  setGenderChoice: (v: string) => void;
  isMarriedChoice: string;
  marriageDate: string;
  setMarriageDate: (v: string) => void;
  handleMarriedChange: (v: string) => void;
  fieldErrors: Record<string, string>;
  onContinue: () => void;
};

export default function RegisterPersonalStep({
  submitting,
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
  fieldErrors,
  onContinue,
}: RegisterPersonalStepProps) {
  const { t } = useTranslation();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onContinue();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label={t('register.first_name', 'First name')}
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          error={fieldErrors.firstName}
          required
          disabled={submitting}
        />
        <Input
          label={t('register.middle_name', 'Middle name')}
          value={middleName}
          onChange={(e) => setMiddleName(e.target.value)}
          disabled={submitting}
        />
        <Input
          label={t('register.last_name', 'Last name')}
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          error={fieldErrors.lastName}
          required
          disabled={submitting}
        />
      </div>
      <Input
        label={t('register.email', 'Email')}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={fieldErrors.email}
        required
        disabled={submitting}
      />
      <Input
        label={t('register.password', 'Password')}
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={t(
          'register.password_hint',
          'Minimum 8 characters',
        )}
        error={fieldErrors.password}
        required
        disabled={submitting}
      />
      <DatePicker
        label={t('register.date_of_birth', 'Date of Birth')}
        value={dateOfBirth}
        onChange={setDateOfBirth}
        error={fieldErrors.dateOfBirth}
        required
        disabled={submitting}
        max={yearsAgoUtcDateString(18)}
        placeholder={t('register.date_placeholder', 'Select date')}
      />
      <RadioGroup
        name="gender"
        label={t('register.gender', 'Gender')}
        options={['Male', 'Female']}
        value={genderChoice}
        onChange={(e) => setGenderChoice(e.target.value)}
        error={fieldErrors.gender}
        required
      />
      <RadioGroup
        name="isMarried"
        label={t('register.is_married', 'Are you married?')}
        options={['Yes', 'No']}
        value={isMarriedChoice}
        onChange={(e) => handleMarriedChange(e.target.value)}
        error={fieldErrors.isMarried}
        required
      />
      {isMarriedChoice === 'Yes' && (
        <DatePicker
          label={t('register.marriage_date', 'Marriage Date')}
          value={marriageDate}
          onChange={setMarriageDate}
          error={fieldErrors.marriageDate}
          required
          disabled={submitting}
          max={todayUtcDateString()}
          placeholder={t('register.date_placeholder', 'Select date')}
        />
      )}
      <Input
        label={t('register.referral_code', "User's Referral code")}
        value={referralCode}
        onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
        placeholder={t(
          'register.referral_code_hint',
          "Optional — enter the referrer's user referral code",
        )}
        error={fieldErrors.referralCode}
        disabled={submitting}
      />
      <div className="flex justify-end pt-2">
        <Button type="submit" isLoading={submitting} className="gap-2">
          {t('register.continue', 'Continue')}
          <ArrowRight size={16} />
        </Button>
      </div>
    </form>
  );
}
