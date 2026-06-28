import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { normalizePhone } from './useRegisterForm';

type RegisterOtpStepProps = {
  submitting: boolean;
  sendingOtp: boolean;
  otpSent: boolean;
  phoneNumber: string;
  setPhoneNumber: (v: string) => void;
  otp: string;
  setOtp: (v: string) => void;
  fieldErrors: Record<string, string>;
  onBack: () => void;
  onSendOtp: () => void;
  onSubmit: () => void;
};

export default function RegisterOtpStep({
  submitting,
  sendingOtp,
  otpSent,
  phoneNumber,
  setPhoneNumber,
  otp,
  setOtp,
  fieldErrors,
  onBack,
  onSendOtp,
  onSubmit,
}: RegisterOtpStepProps) {
  const { t } = useTranslation();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-text-secondary">
        {t(
          'register.otp_desc',
          'Verify your mobile number. A verification code will be sent to your phone.',
        )}
      </p>
      <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
        <div className="flex-1">
          <Input
            label={t('register.phone', 'Phone number')}
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
          onClick={onSendOtp}
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
        <Button type="button" variant="secondary" onClick={onBack} disabled={submitting}>
          {t('register.back_step', 'Back')}
        </Button>
        <Button type="submit" isLoading={submitting} className="gap-2">
          {t('register.verify_continue', 'Verify & Continue')}
          <ArrowRight size={16} />
        </Button>
      </div>
    </form>
  );
}
