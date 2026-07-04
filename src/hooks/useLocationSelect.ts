import { useEffect, useState } from 'react';
import { queryClient } from '../lib/queryClient';
import { queryKeys } from '../lib/queryKeys';
import { listCities } from '../services/location.service';
import { useCities, useStates } from './queries/useLocation';

export function useLocationSelect() {
  const [stateId, setStateId] = useState('');
  const [cityId, setCityId] = useState('');
  const { data: states = [] } = useStates();
  const { data: cities = [], isLoading: loadingCities } = useCities(
    stateId ? Number(stateId) : null,
  );

  useEffect(() => {
    if (!stateId) setCityId('');
  }, [stateId]);

  const reset = () => {
    setStateId('');
    setCityId('');
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
    const cityList = await queryClient.fetchQuery({
      queryKey: queryKeys.location.cities(matchedState.id),
      queryFn: () => listCities(matchedState.id),
    });
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