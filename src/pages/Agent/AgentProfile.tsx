import { useState, useEffect, useCallback, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Lock, Save, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { getAgentProfile, updateAgentProfile } from '../../services/agents.service';
import { listCities, listStates } from '../../services/location.service';
import { formatApiError } from '../../lib/api';
import { formatAgentName } from '../../types/api';
import type { Agent, ApiError, City, State } from '../../types/api';

function normalizePhone(value: string): string {
  return value.replace(/\D/g, '').slice(0, 10);
}

const AgentProfile = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState<Agent | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
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
      setLastName(agent.lastName);
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

    const { state, city } = resolveLocationNames();
    if (!state || !city) {
      toast.error(t('agent.profile.select_location', 'Please select state and city'));
      return;
    }

    setSubmitting(true);
    try {
      const updated = await updateAgentProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
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
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-text">{t('agent.profile.title', 'My Profile')}</h1>
        <p className="text-sm text-text-secondary mt-1">
          {t('agent.profile.subtitle', 'View and update your agent account details.')}
        </p>
      </div>

      {profile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User size={18} className="text-primary" />
              {formatAgentName(profile)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="rounded-lg border border-border bg-surface/50 p-3 space-y-2">
              <div className="flex justify-between gap-4">
                <span className="text-text-secondary">{t('agent.profile.login_id', 'Login ID')}</span>
                <span className="font-mono text-text">{profile.agentLoginId}</span>
              </div>
              {profile.lastLogin && (
                <div className="flex justify-between gap-4">
                  <span className="text-text-secondary">{t('agent.profile.last_login', 'Last login')}</span>
                  <span className="text-text">
                    {new Date(profile.lastLogin).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={t('agent.profile.first_name', 'First name')}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
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
              <Input
                label={t('agent.profile.phone', 'Phone number')}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(normalizePhone(e.target.value))}
                placeholder="9876543210"
                inputMode="numeric"
                maxLength={10}
                disabled={submitting}
              />
              <Input
                label={t('agent.profile.email', 'Email')}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
              />
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
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button type="submit" isLoading={submitting} className="gap-2">
                  <Save size={16} />
                  {t('agent.profile.save', 'Save changes')}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="gap-2"
                  onClick={() => navigate('/agent/change-password')}
                >
                  <Lock size={16} />
                  {t('agent.profile.change_password', 'Change password')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AgentProfile;
