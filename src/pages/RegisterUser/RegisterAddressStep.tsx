import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import type { City, State } from '../../types/api';
import { formatAgentName } from '../../types/api';
import type { Agent } from '../../types/api';

type RegisterAddressStepProps = {
  isAgentPortal: boolean;
  submitting: boolean;
  addressLine1: string;
  setAddressLine1: (v: string) => void;
  addressLine2: string;
  setAddressLine2: (v: string) => void;
  landmark: string;
  setLandmark: (v: string) => void;
  postalCode: string;
  setPostalCode: (v: string) => void;
  formStateId: string;
  setFormStateId: (v: string) => void;
  formCityId: string;
  setFormCityId: (v: string) => void;
  states: State[];
  cities: City[];
  loadingCities: boolean;
  loadingAgentProfile: boolean;
  locationLocked: boolean;
  agentProfile: Agent | null;
  fieldErrors: Record<string, string>;
  onBack: () => void;
  onContinue: () => void;
};

export default function RegisterAddressStep({
  isAgentPortal,
  submitting,
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
  states,
  cities,
  loadingCities,
  loadingAgentProfile,
  locationLocked,
  agentProfile,
  fieldErrors,
  onBack,
  onContinue,
}: RegisterAddressStepProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {isAgentPortal && agentProfile && (
        <p className="text-sm text-text-secondary bg-surface/50 border border-border rounded-lg px-3 py-2">
          {t('register.agent_self_assign', 'You will be assigned as the referral agent')}:{' '}
          <span className="text-text font-medium">{formatAgentName(agentProfile)}</span>
        </p>
      )}
      {locationLocked && (
        <p className="text-sm text-text-secondary bg-primary/5 border border-primary/20 rounded-lg px-3 py-2">
          {t(
            'register.agent_location_locked',
            'Location is set to your registered service area.',
          )}
        </p>
      )}
      <Input
        label={t('register.address_line1', 'Address Line 1')}
        value={addressLine1}
        onChange={(e) => setAddressLine1(e.target.value)}
        placeholder={t(
          'register.address_line1_hint',
          'House/Flat No., Building Name, Street',
        )}
        error={fieldErrors.addressLine1}
        required
        disabled={submitting}
      />
      <Input
        label={t('register.address_line2', 'Address Line 2')}
        value={addressLine2}
        onChange={(e) => setAddressLine2(e.target.value)}
        placeholder={t('register.address_line2_hint', 'Area, Landmark')}
        disabled={submitting}
      />
      <Input
        label={t('register.landmark', 'Landmark')}
        value={landmark}
        onChange={(e) => setLandmark(e.target.value)}
        disabled={submitting}
      />
      <Input
        label={t('register.postal_code', 'Postal/ZIP Code (PIN Code)')}
        value={postalCode}
        onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
        inputMode="numeric"
        maxLength={6}
        error={fieldErrors.postalCode}
        required
        disabled={submitting}
      />
      <Select
        label={t('register.state', 'State')}
        value={formStateId}
        onChange={(e) => {
          setFormStateId(e.target.value);
          setFormCityId('');
        }}
        options={[
          {
            value: '',
            label:
              loadingAgentProfile
                ? t('common.loading', 'Loading...')
                : states.length === 0
                  ? t('register.no_states', 'No states available')
                  : t('register.select_state', 'Select state'),
          },
          ...states.map((s) => ({ value: s.id, label: `${s.name} (${s.stateCode})` })),
        ]}
        disabled={locationLocked || loadingAgentProfile || states.length === 0}
        required
      />
      <Select
        label={t('register.city', 'City')}
        value={formCityId}
        onChange={(e) => setFormCityId(e.target.value)}
        options={[
          {
            value: '',
            label: !formStateId
              ? t('register.select_state_first', 'Select state first')
              : loadingCities
                ? t('common.loading', 'Loading...')
                : cities.length === 0
                  ? t('register.no_cities', 'No cities available')
                  : t('register.select_city', 'Select city'),
          },
          ...cities.map((c) => ({ value: c.id, label: c.name })),
        ]}
        disabled={locationLocked || !formStateId || loadingCities}
        required
      />
      {fieldErrors.location && (
        <p className="text-xs text-error">{fieldErrors.location}</p>
      )}
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
