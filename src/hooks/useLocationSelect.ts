import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { listCities, listStates } from '../services/location.service';
import { formatApiError } from '../lib/api';
import type { ApiError, City, State } from '../types/api';

export function useLocationSelect() {
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [stateId, setStateId] = useState('');
  const [cityId, setCityId] = useState('');
  const [loadingCities, setLoadingCities] = useState(false);

  useEffect(() => {
    void listStates()
      .then(setStates)
      .catch((error) => toast.error(formatApiError(error as ApiError)));
  }, []);

  const loadCitiesForState = useCallback(async (id: number) => {
    setLoadingCities(true);
    try {
      const data = await listCities(id);
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

  useEffect(() => {
    if (!stateId) {
      setCities([]);
      setCityId('');
      return;
    }
    void loadCitiesForState(Number(stateId));
  }, [stateId, loadCitiesForState]);

  const reset = () => {
    setStateId('');
    setCityId('');
    setCities([]);
  };

  const resolveNames = () => {
    const state = states.find((s) => s.id === Number(stateId));
    const city = cities.find((c) => c.id === Number(cityId));
    return { state: state?.name ?? '', city: city?.name ?? '' };
  };

  const initFromNames = async (stateName?: string | null, cityName?: string | null) => {
    reset();
    const matchedState = states.find((s) => s.name === stateName);
    if (!matchedState) return;

    setStateId(String(matchedState.id));
    const cityList = await loadCitiesForState(matchedState.id);
    const matchedCity = cityList.find((c) => c.name === cityName);
    if (matchedCity) setCityId(String(matchedCity.id));
  };

  const stateOptions = states.map((s) => ({ value: s.id, label: s.name }));
  const cityOptions = cities.map((c) => ({ value: c.id, label: c.name }));

  return {
    stateId,
    setStateId,
    cityId,
    setCityId,
    loadingCities,
    stateOptions,
    cityOptions,
    reset,
    resolveNames,
    initFromNames,
  };
}