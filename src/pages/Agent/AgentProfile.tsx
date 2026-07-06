import { useState, useEffect, useCallback, FormEvent, type ElementType } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  ChevronRight,
  Clock,
  Fingerprint,
  Mail,
  MapPin,
  Phone,
  Save,
  Shield,
  User,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardContent, CardFooter } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import PageHeader from '../../components/ui/PageHeader';
import Select from '../../components/ui/Select';
import { RadioGroup } from '../../components/forms/form/Radio';
import Skeleton from '../../components/ui/Skeleton';
import { useConfirm } from '../../context/ConfirmContext';
import { getAgentProfile, updateAgentProfile } from '../../services/agents.service';
import { listCities, listStates } from '../../services/location.service';
import { formatApiError } from '../../lib/api';
import { choiceToGender, formatAgentName, genderToChoice } from '../../types/api';
import type { Agent, ApiError, City, State } from '../../types/api';
import { formatLocalDate, formatLocalDateTime } from '../../lib/dates';

function normalizePhone(value: string): string {
  return value.replace(/\D/g, '').slice(0, 10);
}

function formatLocation(agent: Pick<Agent, 'city' | 'state'>): string {
  if (agent.city && agent.state) return `${agent.city}, ${agent.state}`;
  if (agent.state) return agent.state;
  if (agent.city) return agent.city;
  return '—';
}

const SectionHeading = ({
  icon: Icon,
  title,
  description,
}: {
  icon: ElementType;
  title: string;
  description?: string;
}) => (
  <div className="flex items-start gap-3 pb-5 border-b border-border">
    <div className="w-9 h-9 rounded-lg bg-primary-muted border border-primary/20 flex items-center justify-center text-primary shrink-0">
      <Icon size={16} strokeWidth={2} />
    </div>
    <div className="min-w-0">
      <h2 className="text-sm font-semibold text-text">{title}</h2>
      {description && (
        <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{description}</p>
      )}
    </div>
  </div>
);

const InfoRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: ElementType;
  label: string;
  value: string;
}) => (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-text-muted shrink-0">
      <Icon size={14} strokeWidth={2} />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xs text-text-muted">{label}</p>
      <p className="text-sm font-medium text-text mt-0.5 break-all">{value}</p>
    </div>
  </div>
);

const AgentProfile = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const confirm = useConfirm();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState<Agent | null>(null);

  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [genderChoice, setGenderChoice] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');

  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [formStateId, setFormStateId] = useState('');
  const [formCityId, setFormCityId] = useState('');
  const [loadingCities, setLoadingCities] = useState(false);

  const loadCitiesForState = useCallback(async (stateId: number) => {
    setLoadingCities(true);
    try {
      const data = await listCities(stateId);
      setCities(data);
      return data;
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
      setCities([]);
      return [];
    } finally {
      setLoadingCities(false);
    }
  }, []);

  const hydrateLocation = useCallback(
    async (agent: Agent, stateList: State[]) => {
      const matchedState = stateList.find((s) => s.name === agent.state);
      if (!matchedState) {
        setFormStateId('');
        setFormCityId('');
        setCities([]);
        return;
      }
      setFormStateId(String(matchedState.id));
      const cityList = await loadCitiesForState(matchedState.id);
      const matchedCity = cityList.find((c) => c.name === agent.city);
      setFormCityId(matchedCity ? String(matchedCity.id) : '');
    },
    [loadCitiesForState],
  );

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const [agent, stateList] = await Promise.all([getAgentProfile(), listStates()]);
      setProfile(agent);
      setFirstName(agent.firstName);
      setMiddleName(agent.middleName ?? '');
      setLastName(agent.lastName);
      setGenderChoice(genderToChoice(agent.gender));
      setPhoneNumber(agent.phoneNumber ?? '');
      setEmail(agent.email ?? '');
      setStates(stateList);
      await hydrateLocation(agent, stateList);
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
    } finally {
      setLoading(false);
    }
  }, [hydrateLocation]);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (!formStateId) {
      setCities([]);
      setFormCityId('');
      return;
    }
    void loadCitiesForState(Number(formStateId));
  }, [formStateId, loadCitiesForState]);

  const resolveLocationNames = () => {
    const state = states.find((s) => s.id === Number(formStateId));
    const city = cities.find((c) => c.id === Number(formCityId));
    return { state: state?.name ?? '', city: city?.name ?? '' };
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (phoneNumber && !/^\d{10}$/.test(phoneNumber)) {
      toast.error(t('agent.profile.err_phone', 'Phone number must be exactly 10 digits'));
      return;
    }
    const gender = choiceToGender(genderChoice);
    if (!gender) {
      toast.error(t('register.err_gender_required', 'Please select gender'));
      return;
    }

    const { state, city } = resolveLocationNames();
    if (!state || !city) {
      toast.error(t('agent.profile.select_location', 'Please select state and city'));
      return;
    }

    const confirmed = await confirm({
      title: t('agent.profile.edit_title', 'Edit Profile'),
      message: t('agent.profile.update_confirm', 'Save changes to your profile?'),
      confirmLabel: t('common.save', 'Save Changes'),
    });
    if (!confirmed) return;

    setSubmitting(true);
    try {
      const updated = await updateAgentProfile({
        firstName: firstName.trim(),
        middleName: middleName.trim(),
        lastName: lastName.trim(),
        gender,
        phoneNumber: phoneNumber || undefined,
        email: email.trim() || undefined,
        state,
        city,
      });
      setProfile(updated);
      toast.success(t('agent.profile.saved', 'Profile updated successfully'));
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-shell max-w-5xl">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-36 w-full rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 rounded-xl lg:col-span-1" />
          <Skeleton className="h-96 rounded-xl lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const initials = [profile.firstName, profile.lastName]
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);

  return (
    <div className="page-shell max-w-5xl">
      <PageHeader
        title={t('agent.profile.title', 'My Profile')}
        description={t(
          'agent.profile.subtitle',
          'View and update your agent account details.',
        )}
      />

      <Card padding="none" className="overflow-hidden">
        <div className="relative px-6 pt-6 pb-5">
          <div
            className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent pointer-events-none"
            aria-hidden="true"
          />
          <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-background text-xl font-bold shadow-lg shadow-primary/20 shrink-0">
              {initials || <User size={28} strokeWidth={1.75} />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl font-semibold text-text tracking-tight">
                  {formatAgentName(profile)}
                </h2>
                <Badge variant={profile.isActive ? 'success' : 'neutral'} dot>
                  {profile.isActive
                    ? t('agent.profile.active', 'Active')
                    : t('agent.profile.inactive', 'Inactive')}
                </Badge>
              </div>
              <p className="text-sm text-text-secondary font-mono mt-1">
                {profile.agentLoginId}
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={12} />
                  {formatLocation(profile)}
                </span>
                {profile.lastLogin && (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock size={12} />
                    {t('agent.profile.last_login', 'Last login')}:{' '}
                    {formatLocalDateTime(profile.lastLogin)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardContent className="space-y-5">
              <SectionHeading
                icon={Fingerprint}
                title={t('agent.profile.account_info', 'Account information')}
                description={t(
                  'agent.profile.account_info_desc',
                  'Read-only details tied to your agent account.',
                )}
              />
              <div className="space-y-4">
                <InfoRow
                  icon={Fingerprint}
                  label={t('agent.profile.login_id', 'Login ID')}
                  value={profile.agentLoginId}
                />
                <InfoRow
                  icon={Calendar}
                  label={t('agent.profile.member_since', 'Member since')}
                  value={formatLocalDate(profile.createdAt)}
                />
                <InfoRow
                  icon={Clock}
                  label={t('agent.profile.last_login', 'Last login')}
                  value={formatLocalDateTime(profile.lastLogin)}
                />
                <InfoRow
                  icon={MapPin}
                  label={t('agent.profile.current_location', 'Current location')}
                  value={formatLocation(profile)}
                />
              </div>
            </CardContent>
          </Card>

          <Card variant="interactive" padding="none">
            <button
              type="button"
              onClick={() => navigate('/agent/change-password')}
              className="w-full flex items-center gap-4 p-5 text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-warning-muted border border-warning/20 flex items-center justify-center text-warning shrink-0">
                <Shield size={18} strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-text group-hover:text-primary transition-colors">
                  {t('agent.profile.security', 'Security')}
                </p>
                <p className="text-xs text-text-secondary mt-0.5">
                  {t('agent.profile.change_password', 'Change password')}
                </p>
              </div>
              <ChevronRight
                size={16}
                className="text-text-muted group-hover:text-primary transition-colors shrink-0"
              />
            </button>
          </Card>
        </div>

        <Card padding="none" className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-8 p-6">
              <div className="space-y-5">
                <SectionHeading
                  icon={User}
                  title={t('agent.profile.personal_info', 'Personal information')}
                  description={t(
                    'agent.profile.personal_info_desc',
                    'Update how your name appears across the portal.',
                  )}
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label={t('agent.profile.first_name', 'First name')}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    disabled={submitting}
                  />
                  <Input
                    label={t('agent.profile.middle_name', 'Middle name')}
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                    disabled={submitting}
                  />
                  <Input
                    label={t('agent.profile.last_name', 'Last name')}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    disabled={submitting}
                  />
                </div>
                <RadioGroup
                  name="gender"
                  label={t('agent.profile.gender', 'Gender')}
                  options={['Male', 'Female']}
                  value={genderChoice}
                  onChange={(e) => setGenderChoice(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-5">
                <SectionHeading
                  icon={Phone}
                  title={t('agent.profile.contact_info', 'Contact details')}
                  description={t(
                    'agent.profile.contact_info_desc',
                    'Used for notifications and account recovery.',
                  )}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label={t('agent.profile.phone', 'Phone number')}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(normalizePhone(e.target.value))}
                    placeholder="9876543210"
                    inputMode="numeric"
                    maxLength={10}
                    icon={Phone}
                    disabled={submitting}
                    hint={t('agent.profile.phone_hint', '10-digit mobile number')}
                  />
                  <Input
                    label={t('agent.profile.email', 'Email')}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    icon={Mail}
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="space-y-5">
                <SectionHeading
                  icon={MapPin}
                  title={t('agent.profile.location_info', 'Location')}
                  description={t(
                    'agent.profile.location_info_desc',
                    'Your service area for users assignments.',
                  )}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label={t('agent.profile.state', 'State')}
                    value={formStateId}
                    onChange={(e) => {
                      setFormStateId(e.target.value);
                      setFormCityId('');
                    }}
                    options={[
                      {
                        value: '',
                        label: t('agent.profile.select_state', 'Select state'),
                      },
                      ...states.map((s) => ({ value: s.id, label: s.name })),
                    ]}
                    disabled={submitting}
                    required
                  />
                  <Select
                    label={t('agent.profile.city', 'City')}
                    value={formCityId}
                    onChange={(e) => setFormCityId(e.target.value)}
                    options={[
                      {
                        value: '',
                        label: !formStateId
                          ? t('agent.profile.select_state_first', 'Select state first')
                          : loadingCities
                            ? t('common.loading', 'Loading...')
                            : t('agent.profile.select_city', 'Select city'),
                      },
                      ...cities.map((c) => ({ value: c.id, label: c.name })),
                    ]}
                    disabled={!formStateId || loadingCities || submitting}
                    required
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="px-6 pb-6 mt-0 pt-5 bg-surface/30">
              <p className="text-xs text-text-muted mr-auto hidden sm:block">
                {t('agent.profile.save_hint', 'Changes apply immediately after saving.')}
              </p>
              <Button type="submit" isLoading={submitting} className="gap-2 w-full sm:w-auto">
                <Save size={16} />
                {t('agent.profile.save', 'Save changes')}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AgentProfile;