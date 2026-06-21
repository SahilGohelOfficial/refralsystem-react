import { useState, useEffect, useCallback, FormEvent } from 'react';
import { ArrowLeft, Lock, UserPlus } from 'lucide-react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { Card, CardContent } from '../../components/ui/Card';
import { agentSignUp } from '../../services/agents.service';
import { listCities, listStates } from '../../services/location.service';
import { formatApiError } from '../../lib/api';
import type { ApiError, City, State } from '../../types/api';

function normalizePhone(value: string): string {
  return value.replace(/\D/g, '').slice(0, 10);
}

const AgentSignUp = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAuthenticated, user, loginWithAgentSession } = useAuth();

  const [submitting, setSubmitting] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [formStateId, setFormStateId] = useState('');
  const [formCityId, setFormCityId] = useState('');
  const [loadingCities, setLoadingCities] = useState(false);

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

  if (isAuthenticated && user?.role === 'agent') {
    return <Navigate to="/agent/dashboard" replace />;
  }

  const resolveLocationNames = () => {
    const state = states.find((s) => s.id === Number(formStateId));
    const city = cities.find((c) => c.id === Number(formCityId));
    return { state: state?.name ?? '', city: city?.name ?? '' };
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!/^\d{10}$/.test(phoneNumber)) {
      toast.error(t('agent.signup.err_phone', 'Phone number must be exactly 10 digits'));
      return;
    }
    if (password !== confirmPassword) {
      toast.error(t('agent.signup.err_password_match', 'Passwords do not match'));
      return;
    }
    if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      toast.error(
        t(
          'agent.signup.err_password_rules',
          'Password must be at least 8 characters with one letter and one number',
        ),
      );
      return;
    }

    const { state, city } = resolveLocationNames();
    if (!state || !city) {
      toast.error(t('agent.signup.select_location', 'Please select state and city'));
      return;
    }

    setSubmitting(true);
    try {
      const { accessToken, agent } = await agentSignUp({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber,
        email: email.trim(),
        state,
        city,
        password,
      });
      loginWithAgentSession(accessToken, agent);
      toast.success(t('agent.signup.success', 'Account created successfully'));
      navigate('/agent/dashboard');
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto space-y-6">
        <button
          type="button"
          onClick={() => navigate('/agent/login')}
          className="flex items-center gap-2 text-sm text-text-secondary hover:text-text transition-colors"
        >
          <ArrowLeft size={16} />
          {t('agent.signup.back_login', 'Back to login')}
        </button>

        <div className="text-center sm:text-left">
          <div className="inline-flex items-center justify-center size-12 rounded-xl bg-primary/15 text-primary mb-4">
            <UserPlus size={24} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text">
            {t('agent.signup.title', 'Agent Sign Up')}
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            {t('agent.signup.subtitle', 'Create your agent account to access the partner portal.')}
          </p>
        </div>

        <Card>
          <CardContent className="pt-2">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={t('agent.signup.first_name', 'First name')}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  disabled={submitting}
                />
                <Input
                  label={t('agent.signup.last_name', 'Last name')}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>
              <Input
                label={t('agent.signup.phone', 'Phone number')}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(normalizePhone(e.target.value))}
                placeholder="9876543210"
                inputMode="numeric"
                maxLength={10}
                required
                disabled={submitting}
              />
              <Input
                label={t('agent.signup.email', 'Email')}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={submitting}
              />
              <Select
                label={t('agent.signup.state', 'State')}
                value={formStateId}
                onChange={(e) => {
                  setFormStateId(e.target.value);
                  setFormCityId('');
                }}
                options={[
                  {
                    value: '',
                    label:
                      states.length === 0
                        ? t('agent.signup.no_states', 'No states available')
                        : t('agent.signup.select_state', 'Select state'),
                  },
                  ...states.map((s) => ({ value: s.id, label: s.name })),
                ]}
                disabled={states.length === 0 || submitting}
                required
              />
              <Select
                label={t('agent.signup.city', 'City')}
                value={formCityId}
                onChange={(e) => setFormCityId(e.target.value)}
                options={[
                  {
                    value: '',
                    label: !formStateId
                      ? t('agent.signup.select_state_first', 'Select state first')
                      : loadingCities
                        ? t('common.loading', 'Loading...')
                        : cities.length === 0
                          ? t('agent.signup.no_cities', 'No cities available')
                          : t('agent.signup.select_city', 'Select city'),
                  },
                  ...cities.map((c) => ({ value: c.id, label: c.name })),
                ]}
                disabled={!formStateId || loadingCities || submitting}
                required
              />
              <Input
                label={t('agent.signup.password', 'Password')}
                type="password"
                icon={Lock}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={submitting}
              />
              <Input
                label={t('agent.signup.confirm_password', 'Confirm password')}
                type="password"
                icon={Lock}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={submitting}
              />
              <Button type="submit" fullWidth isLoading={submitting} className="mt-2">
                {t('agent.signup.submit', 'Create account')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AgentSignUp;
