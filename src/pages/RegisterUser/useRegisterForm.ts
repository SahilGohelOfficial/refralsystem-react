import { useState, useEffect, useCallback } from 'react';
import type { TFunction } from 'i18next';
import toast from 'react-hot-toast';
import { formatApiError } from '../../lib/api';
import { listCities, listStates } from '../../services/location.service';
import { getAgentProfile } from '../../services/agents.service';
import {
  assignAgent,
  createUser,
  listAgentsByLocation,
  sendRegistrationOtp,
  validateReferralCode,
  validateRegistrationEmail,
} from '../../services/users.service';
import type {
  Agent,
  ApiError,
  City,
  CreateUserPayload,
  ReferralUser,
  State,
} from '../../types/api';
import { choiceToGender } from '../../types/api';
import { isAtLeastAgeUtc, isPastOrTodayUtc } from '../../lib/dates';

export type RegisterStep = 'personal' | 'address' | 'bank' | 'otp' | 'agent' | 'success';

export function normalizePhone(value: string): string {
  return value.replace(/\D/g, '').slice(0, 10);
}

const IFSC_PATTERN = /^[A-Z]{4}0[A-Z0-9]{6}$/i;

type UseRegisterFormOptions = {
  t: TFunction;
  isAgentPortal: boolean;
  agentUserId?: string;
};

export function useRegisterForm({ t, isAgentPortal, agentUserId }: UseRegisterFormOptions) {
  const [step, setStep] = useState<RegisterStep>('personal');
  const [submitting, setSubmitting] = useState(false);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const [createdUser, setCreatedUser] = useState<ReferralUser | null>(null);
  const [assignedUser, setAssignedUser] = useState<ReferralUser | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCodeState] = useState('');
  /** True after personal-step Continue successfully validated a non-empty referral code. */
  const [referralValidated, setReferralValidated] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [genderChoice, setGenderChoice] = useState('');
  const [isMarriedChoice, setIsMarriedChoice] = useState('');
  const [marriageDate, setMarriageDate] = useState('');

  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [landmark, setLandmark] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [formStateId, setFormStateId] = useState('');
  const [formCityId, setFormCityId] = useState('');

  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');

  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');

  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [agentProfile, setAgentProfile] = useState<Agent | null>(null);
  const [loadingAgentProfile, setLoadingAgentProfile] = useState(false);

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
    if (!isAgentPortal) return;
    let cancelled = false;
    setLoadingAgentProfile(true);
    getAgentProfile()
      .then((profile) => {
        if (!cancelled) setAgentProfile(profile);
      })
      .catch((error) => {
        if (!cancelled) toast.error(formatApiError(error as ApiError));
      })
      .finally(() => {
        if (!cancelled) setLoadingAgentProfile(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isAgentPortal]);

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

  const validatePersonal = () => {
    const errors: Record<string, string> = {};
    if (!firstName.trim()) {
      errors.firstName = t('register.err_first_name', 'First name is required');
    }
    if (!lastName.trim()) {
      errors.lastName = t('register.err_last_name', 'Last name is required');
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = t('register.err_email', 'Valid email is required');
    }
    if (!password.trim()) {
      errors.password = t('register.err_password_required', 'Password is required');
    } else if (password.length < 8) {
      errors.password = t(
        'register.err_password_rules',
        'Password must be at least 8 characters',
      );
    }
    if (!dateOfBirth) {
      errors.dateOfBirth = t('register.err_dob_required', 'Date of birth is required');
    } else if (!isPastOrTodayUtc(dateOfBirth)) {
      errors.dateOfBirth = t('register.err_dob_invalid', 'Enter a valid date of birth');
    } else if (!isAtLeastAgeUtc(dateOfBirth, 18)) {
      errors.dateOfBirth = t(
        'register.err_dob_min_age',
        'You must be at least 18 years old',
      );
    }
    if (!choiceToGender(genderChoice)) {
      errors.gender = t('register.err_gender_required', 'Please select gender');
    }
    if (!isMarriedChoice) {
      errors.isMarried = t('register.err_married_required', 'Please select an option');
    } else if (isMarriedChoice === 'Yes' && !marriageDate) {
      errors.marriageDate = t(
        'register.err_marriage_date_required',
        'Marriage date is required when married',
      );
    } else if (isMarriedChoice === 'Yes' && marriageDate && !isPastOrTodayUtc(marriageDate)) {
      errors.marriageDate = t('register.err_marriage_date_invalid', 'Enter a valid marriage date');
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const setReferralCode = (value: string) => {
    setReferralCodeState(value);
    setReferralValidated(false);
  };

  const continueFromPersonal = async (): Promise<boolean> => {
    if (!validatePersonal()) return false;

    setSubmitting(true);
    try {
      await validateRegistrationEmail(email.trim());
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.email;
        return next;
      });

      const code = referralCode.trim();
      if (!code) {
        setReferralValidated(false);
        setStep('address');
        return true;
      }

      await validateReferralCode(code);
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.referralCode;
        return next;
      });
      setReferralValidated(true);
      setStep('address');
      return true;
    } catch (error) {
      const message = formatApiError(error as ApiError);
      const apiError = error as ApiError;
      const raw = Array.isArray(apiError.message)
        ? apiError.message.join(' ')
        : String(apiError.message ?? '');
      const isEmailError =
        /email/i.test(raw) ||
        raw.includes('user.emailExists') ||
        message.toLowerCase().includes('email');

      if (isEmailError) {
        setFieldErrors((prev) => ({
          ...prev,
          email:
            message ||
            t('register.err_email_exists', 'This email is already registered'),
        }));
      } else {
        setReferralValidated(false);
        setFieldErrors((prev) => ({
          ...prev,
          referralCode:
            message ||
            t(
              'register.err_referral_code_invalid',
              'Referral code is invalid or not found',
            ),
        }));
      }
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const validateAddress = () => {
    const errors: Record<string, string> = {};
    if (!addressLine1.trim()) {
      errors.addressLine1 = t(
        'register.err_address_line1',
        'Address line 1 is required',
      );
    }
    if (!/^\d{6}$/.test(postalCode)) {
      errors.postalCode = t('register.err_pin', 'PIN code must be 6 digits');
    }
    if (!formStateId || !formCityId) {
      errors.location = t('register.select_location', 'Please select state and city');
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

  const validateOtp = () => {
    const errors: Record<string, string> = {};
    if (!/^\d{10}$/.test(phoneNumber)) {
      errors.phoneNumber = t(
        'register.err_phone',
        'Phone number must be exactly 10 digits',
      );
    }
    if (!/^\d{4}$/.test(otp)) {
      errors.otp = t('register.err_otp', 'Enter the 4-digit verification code');
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const buildCreateUserPayload = (): CreateUserPayload => ({
    firstName: firstName.trim(),
    middleName: middleName.trim() || undefined,
    lastName: lastName.trim(),
    phoneNumber,
    email: email.trim(),
    password,
    ...(referralCode.trim()
      ? { referralCode: referralCode.trim().toUpperCase() }
      : {}),
    dateOfBirth,
    gender: choiceToGender(genderChoice)!,
    addressLine1: addressLine1.trim(),
    addressLine2: addressLine2.trim() || undefined,
    landmark: landmark.trim() || undefined,
    postalCode,
    isMarried: isMarriedChoice === 'Yes',
    marriageDate: isMarriedChoice === 'Yes' ? marriageDate : null,
    accountHolderName: accountHolderName.trim(),
    accountNumber,
    confirmAccountNumber,
    ifscCode: ifscCode.toUpperCase(),
    otp,
  });

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
      await sendRegistrationOtp(phoneNumber);
      setOtpSent(true);
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.phoneNumber;
        return next;
      });
      toast.success(t('register.otp_sent', 'Verification code sent'));
    } catch (error) {
      const message = formatApiError(error as ApiError);
      setFieldErrors((prev) => ({
        ...prev,
        phoneNumber:
          message ||
          t(
            'register.err_phone_exists',
            'This phone number is already registered',
          ),
      }));
      toast.error(
        message ||
          t(
            'register.err_phone_exists',
            'This phone number is already registered',
          ),
      );
    } finally {
      setSendingOtp(false);
    }
  };

  const goToAgentStep = async () => {
    setLoadingAgents(true);
    setSelectedAgentId('');
    try {
      const data = await listAgentsByLocation(
        Number(formStateId),
        Number(formCityId),
      );
      setAgents(data);
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
      setAgents([]);
    } finally {
      setLoadingAgents(false);
    }
    setStep('agent');
  };

  /** After bank: agent picker (public) or OTP when agent step is skipped. */
  const continueFromBank = async () => {
    if (!validateBank()) return false;
    if (isAgentPortal || referralValidated) {
      setStep('otp');
      return true;
    }
    await goToAgentStep();
    return true;
  };

  /** Agent selected → go to verify mobile (account not created yet). */
  const continueFromAgent = () => {
    if (!selectedAgentId) {
      toast.error(t('register.select_agent', 'Select your referral agent'));
      return false;
    }
    setStep('otp');
    return true;
  };

  const completeRegistration = async () => {
    if (!validateOtp()) return false;

    setSubmitting(true);
    try {
      const user = await createUser(buildCreateUserPayload());
      setCreatedUser(user);

      if (isAgentPortal && agentUserId) {
        if (user.agentId === agentUserId) {
          setAssignedUser(user);
          setStep('success');
          toast.success(t('register.success', 'Registration completed successfully'));
          return true;
        }

        const result = await assignAgent(user.id, {
          agentId: agentUserId,
          stateId: Number(formStateId),
          cityId: Number(formCityId),
        });
        setAssignedUser(result);
        setStep('success');
        toast.success(t('register.success', 'Registration completed successfully'));
        return true;
      }

      // Public: referral auto-assigned agent on create
      if (user.agentId && (referralValidated || !selectedAgentId)) {
        setAssignedUser(user);
        if (user.agentId) {
          try {
            const data = await listAgentsByLocation(
              Number(formStateId),
              Number(formCityId),
            );
            setAgents(data);
            const match = data.find((a) => a.id === user.agentId);
            if (match) setSelectedAgentId(match.id);
          } catch {
            // display may fall back to "Assigned via referral"
          }
        }
        setStep('success');
        toast.success(t('register.success', 'Registration completed successfully'));
        return true;
      }

      if (selectedAgentId && formStateId && formCityId) {
        // Prefer keep auto-assigned agent if create already set one and it matches selection
        if (user.agentId === selectedAgentId) {
          setAssignedUser(user);
          setStep('success');
          toast.success(t('register.success', 'Registration completed successfully'));
          return true;
        }

        const result = await assignAgent(user.id, {
          agentId: selectedAgentId,
          stateId: Number(formStateId),
          cityId: Number(formCityId),
        });
        setAssignedUser(result);
        setStep('success');
        toast.success(t('register.success', 'Registration completed successfully'));
        return true;
      }

      // Referral validated but no agent on referrer — still complete without assign
      if (referralValidated) {
        setAssignedUser(user);
        setStep('success');
        toast.success(t('register.success', 'Registration completed successfully'));
        return true;
      }

      toast.error(t('register.select_agent', 'Select your referral agent'));
      return false;
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const goBack = () => {
    if (step === 'address') setStep('personal');
    else if (step === 'bank') setStep('address');
    else if (step === 'agent') setStep('bank');
    else if (step === 'otp') {
      if (isAgentPortal || referralValidated) setStep('bank');
      else setStep('agent');
    }
  };

  const handleMarriedChange = (value: string) => {
    setIsMarriedChoice(value);
    if (value !== 'Yes') setMarriageDate('');
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next.isMarried;
      delete next.marriageDate;
      return next;
    });
  };

  const selectedState = states.find((s) => s.id === Number(formStateId));
  const selectedCity = cities.find((c) => c.id === Number(formCityId));
  const selectedAgent = agents.find((a) => a.id === selectedAgentId);

  return {
    step,
    setStep,
    submitting,
    loadingAgents,
    sendingOtp,
    otpSent,
    createdUser,
    assignedUser,
    fieldErrors,
    setFieldErrors,
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
    selectedState,
    selectedCity,
    selectedAgent,
    /** Hide Choose agent when a referral code was validated on personal step. */
    skipAgentStep: isAgentPortal || referralValidated,
    validatePersonal,
    continueFromPersonal,
    continueFromBank,
    continueFromAgent,
    validateAddress,
    validateBank,
    validateOtp,
    handleSendOtp,
    completeRegistration,
    goBack,
  };
}
