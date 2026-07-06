import { useCallback, useEffect, useState, FormEvent, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { RadioGroup } from '../forms/form/Radio';
import { useMyUser, useUpdateMyUser } from '../../hooks/queries';
import { useConfirm } from '../../context/ConfirmContext';
import { useToastOnError } from '../../hooks/useToastOnError';
import { choiceToGender, genderToChoice, type ReferralUser } from '../../types/api';
import { isPastOrTodayUtc, todayUtcDateString, toDateInputValue } from '../../lib/dates';

interface AgentUserEditModalProps {
  user: ReferralUser | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (user: ReferralUser) => void;
}

const SectionTitle = ({ children }: { children: ReactNode }) => (
  <h3 className="text-sm font-semibold text-text border-b border-border pb-2">{children}</h3>
);

const AgentUserEditModal = ({ user, isOpen, onClose, onSaved }: AgentUserEditModalProps) => {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const updateUserMutation = useUpdateMyUser();
  const { data: fetchedProfile, isLoading, error } = useMyUser(user?.id ?? '', isOpen && !!user?.id);
  useToastOnError(error, isOpen);

  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [genderChoice, setGenderChoice] = useState('');
  const [isMarriedChoice, setIsMarriedChoice] = useState('');
  const [marriageDate, setMarriageDate] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [landmark, setLandmark] = useState('');
  const [postalCode, setPostalCode] = useState('');

  const hydrateForm = useCallback((data: ReferralUser) => {
    setFirstName(data.firstName);
    setMiddleName(data.middleName ?? '');
    setLastName(data.lastName);
    setDateOfBirth(toDateInputValue(data.dateOfBirth));
    setGenderChoice(genderToChoice(data.gender));
    setIsMarriedChoice(data.isMarried ? 'Yes' : 'No');
    setMarriageDate(toDateInputValue(data.marriageDate));
    setAddressLine1(data.addressLine1 ?? '');
    setAddressLine2(data.addressLine2 ?? '');
    setLandmark(data.landmark ?? '');
    setPostalCode(data.postalCode ?? '');
  }, []);

  useEffect(() => {
    if (fetchedProfile) hydrateForm(fetchedProfile);
  }, [fetchedProfile, hydrateForm]);

  const handleMarriedChange = (value: string) => {
    setIsMarriedChoice(value);
    if (value !== 'Yes') setMarriageDate('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!fetchedProfile) return;

    if (!firstName.trim() || !lastName.trim()) {
      toast.error(t('agent.my_users.err_name_required', 'First and last name are required'));
      return;
    }
    if (!dateOfBirth) {
      toast.error(t('register.err_dob_required', 'Date of birth is required'));
      return;
    }
    if (!isPastOrTodayUtc(dateOfBirth)) {
      toast.error(t('register.err_dob_invalid', 'Enter a valid date of birth'));
      return;
    }
    const gender = choiceToGender(genderChoice);
    if (!gender) {
      toast.error(t('register.err_gender_required', 'Please select gender'));
      return;
    }
    if (!isMarriedChoice) {
      toast.error(t('register.err_married_required', 'Please select an option'));
      return;
    }
    if (isMarriedChoice === 'Yes' && !marriageDate) {
      toast.error(
        t('register.err_marriage_date_required', 'Marriage date is required when married'),
      );
      return;
    }
    if (isMarriedChoice === 'Yes' && marriageDate && !isPastOrTodayUtc(marriageDate)) {
      toast.error(t('register.err_marriage_date_invalid', 'Enter a valid marriage date'));
      return;
    }
    if (!addressLine1.trim()) {
      toast.error(t('register.err_address_line1', 'Address line 1 is required'));
      return;
    }
    if (!/^\d{6}$/.test(postalCode)) {
      toast.error(t('register.err_pin', 'PIN code must be 6 digits'));
      return;
    }

    const confirmed = await confirm({
      title: t('agent.my_users.edit_title', 'Edit User'),
      message: t('agent.my_users.update_confirm', 'Save changes to this user?'),
      confirmLabel: t('agent.my_users.save', 'Save changes'),
    });
    if (!confirmed) return;

    try {
      const updated = await updateUserMutation.mutateAsync({
        id: fetchedProfile.id,
        payload: {
          firstName: firstName.trim(),
          middleName: middleName.trim(),
          lastName: lastName.trim(),
          dateOfBirth,
          gender,
          isMarried: isMarriedChoice === 'Yes',
          marriageDate: isMarriedChoice === 'Yes' ? marriageDate : null,
          addressLine1: addressLine1.trim(),
          addressLine2: addressLine2.trim() || undefined,
          landmark: landmark.trim() || undefined,
          postalCode,
        },
      });
      toast.success(t('agent.my_users.updated_success', 'User updated successfully'));
      onSaved(updated);
      onClose();
    } catch {
      // Errors handled by mutation hooks
    }
  };

  const submitting = updateUserMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('agent.my_users.edit_title', 'Edit User')}
      description={t(
        'agent.my_users.edit_desc_full',
        'Update personal and address details. Phone, email, and bank details cannot be changed.',
      )}
      maxWidth="2xl"
    >
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : fetchedProfile ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-lg border border-border bg-surface/50 p-3 space-y-2 text-sm">
            <p className="text-xs font-medium text-text-muted uppercase tracking-wide">
              {t('agent.my_users.read_only_fields', 'Cannot be changed')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-text-secondary block text-xs">
                  {t('agent.my_users.phone', 'Phone number')}
                </span>
                <span className="font-medium text-text">{fetchedProfile.phoneNumber}</span>
              </div>
              <div>
                <span className="text-text-secondary block text-xs">
                  {t('agent.my_users.email', 'Email')}
                </span>
                <span className="font-medium text-text break-all">{fetchedProfile.email}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <SectionTitle>
              {t('agent.my_users.section_personal', 'Personal details')}
            </SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label={t('agent.my_users.first_name', 'First name')}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                disabled={submitting}
              />
              <Input
                label={t('agent.my_users.middle_name', 'Middle name')}
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
                disabled={submitting}
              />
              <Input
                label={t('agent.my_users.last_name', 'Last name')}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                disabled={submitting}
              />
            </div>
            <Input
              label={t('register.date_of_birth', 'Date of Birth')}
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              required
              disabled={submitting}
              max={todayUtcDateString()}
            />
            <RadioGroup
              name="gender"
              label={t('register.gender', 'Gender')}
              options={['Male', 'Female']}
              value={genderChoice}
              onChange={(e) => setGenderChoice(e.target.value)}
              required
            />
            <RadioGroup
              name="isMarried"
              label={t('register.is_married', 'Are you married?')}
              options={['Yes', 'No']}
              value={isMarriedChoice}
              onChange={(e) => handleMarriedChange(e.target.value)}
              required
            />
            {isMarriedChoice === 'Yes' && (
              <Input
                label={t('register.marriage_date', 'Marriage Date')}
                type="date"
                value={marriageDate}
                onChange={(e) => setMarriageDate(e.target.value)}
                required
                disabled={submitting}
                max={todayUtcDateString()}
              />
            )}
          </div>

          <div className="space-y-4">
            <SectionTitle>
              {t('agent.my_users.section_address', 'Address details')}
            </SectionTitle>
            <Input
              label={t('register.address_line1', 'Address line 1')}
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              required
              disabled={submitting}
            />
            <Input
              label={t('register.address_line2', 'Address line 2')}
              value={addressLine2}
              onChange={(e) => setAddressLine2(e.target.value)}
              disabled={submitting}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={t('register.landmark', 'Landmark')}
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                disabled={submitting}
              />
              <Input
                label={t('register.postal_code', 'PIN code')}
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                inputMode="numeric"
                maxLength={6}
                required
                disabled={submitting}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button type="submit" isLoading={submitting}>
              {t('agent.my_users.save', 'Save changes')}
            </Button>
          </div>
        </form>
      ) : null}
    </Modal>
  );
};

export default AgentUserEditModal;