import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

type RegisterBankStepProps = {
  submitting: boolean;
  accountHolderName: string;
  setAccountHolderName: (v: string) => void;
  accountNumber: string;
  setAccountNumber: (v: string) => void;
  confirmAccountNumber: string;
  setConfirmAccountNumber: (v: string) => void;
  ifscCode: string;
  setIfscCode: (v: string) => void;
  fieldErrors: Record<string, string>;
  onBack: () => void;
  onContinue: () => void;
};

export default function RegisterBankStep({
  submitting,
  accountHolderName,
  setAccountHolderName,
  accountNumber,
  setAccountNumber,
  confirmAccountNumber,
  setConfirmAccountNumber,
  ifscCode,
  setIfscCode,
  fieldErrors,
  onBack,
  onContinue,
}: RegisterBankStepProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-text">
        {t('register.bank_details', 'Bank Details')}
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
        onChange={(e) => setConfirmAccountNumber(e.target.value.replace(/\D/g, ''))}
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
        <Button type="button" variant="secondary" onClick={onBack}>
          {t('register.back_step', 'Back')}
        </Button>
        <Button type="button" onClick={onContinue} isLoading={submitting} className="gap-2">
          {t('register.continue', 'Continue')}
          <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
}
