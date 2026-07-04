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
} from '../../services/users.service';
import type {
  Agent,
  ApiError,
  City,
  CreateUserPayload,
  ReferralUser,
  State,
} from '../../types/api';
import { isPastOrTodayUtc } from '../../lib/dates';

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
  const [referralCode, setReferralCode] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
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

  const locationLocked = isAgentPortal && !!agentProfile?.state && !!agentProfile?.city;

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
    if (!isAgentPortal || !agentProfile?.state || states.length === 0) return;
    const matchedState = states.find((s) => s.name === agentProfile.state);
    if (matchedState) setFormStateId(String(matchedState.id));
  }, [isAgentPortal, agentProfile, states]);

  useEffect(() => {
    if (!isAgentPortal || !agentProfile?.city || cities.length === 0) return;
    const matchedCity = cities.find((c) => c.name === agentProfile.city);
    if (matchedCity) setFormCityId(String(matchedCity.id));
  }, [isAgentPortal, agentProfile, cities]);

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
    } else if (
      password.length < 8 ||
      !/[a-zA-Z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      errors.password = t(
        'register.err_password_rules',
        'Password must be at least 8 characters and include letters and numbers',
      );
    }
    if (!dateOfBirth) {
      errors.dateOfBirth = t('register.err_dob_required', 'Date of birth is required');
    } else if (!isPastOrTodayUtc(dateOfBirth)) {
      errors.dateOfBirth = t('register.err_dob_invalid', 'Enter a valid date of birth');
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
      toast.success(t('register.otp_sent', 'Verification code sent'));
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
    } finally {
      setSendingOtp(false);
    }
  };

  const completeRegistration = async () => {
    if (!validateOtp()) return false;

    setSubmitting(true);
    try {
      const user = await createUser(buildCreateUserPayload());
      setCreatedUser(user);

      if (isAgentPortal && agentUserId) {
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
      return true;
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignAgent = async () => {
    if (!createdUser || !selectedAgentId || !formStateId || !formCityId) return;

    setSubmitting(true);
    try {
      const result = await assignAgent(createdUser.id, {
        agentId: selectedAgentId,
        stateId: Number(formStateId),
        cityId: Number(formCityId),
      });
      setAssignedUser(result);
      setStep('success');
      toast.success(t('register.success', 'Registration completed successfully'));
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
    } finally {
      setSubmitting(false);
    }
  };

  const goBack = () => {
    if (step === 'address') setStep('personal');
    else if (step === 'bank') setStep('address');
    else if (step === 'otp') setStep('bank');
    else if (step === 'agent') setStep('otp');
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
    validateOtp,
    handleSendOtp,
    completeRegistration,
    handleAssignAgent,
    goBack,
  };
}
