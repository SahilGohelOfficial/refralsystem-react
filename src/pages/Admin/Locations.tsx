import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Building2,
  Hash,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardDescription, CardTitle } from '../../components/ui/Card';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import PageHeader from '../../components/ui/PageHeader';
import IconButton from '../../components/ui/IconButton';
import Loader from '../../components/ui/Loader';
import {
  useCities,
  useCreateCity,
  useCreateState,
  useDeleteCity,
  useDeleteState,
  useStates,
  useUpdateCity,
  useUpdateState,
} from '../../hooks/queries';
import { useConfirm } from '../../stores/confirmStore';
import { useToastOnError } from '../../hooks/useToastOnError';
import type { City, State } from '../../types/api';

type StateModal = { mode: 'create' } | { mode: 'edit'; state: State };
type CityModal =
  | { mode: 'create'; state: State }
  | { mode: 'edit'; state: State; city: City };

const Locations = () => {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const { data: states = [], isLoading, error } = useStates();
  const createStateMutation = useCreateState();
  const updateStateMutation = useUpdateState();
  const deleteStateMutation = useDeleteState();
  const createCityMutation = useCreateCity();
  const updateCityMutation = useUpdateCity();
  useToastOnError(error);

  const [search, setSearch] = useState('');
  const [selectedStateId, setSelectedStateId] = useState<number | null>(null);
  const [stateModal, setStateModal] = useState<StateModal | null>(null);
  const [cityModal, setCityModal] = useState<CityModal | null>(null);
  const [stateName, setStateName] = useState('');
  const [stateCode, setStateCode] = useState('');
  const [cityName, setCityName] = useState('');
  const [cityShortCode, setCityShortCode] = useState('');

  const query = search.toLowerCase();
  const filteredStates = useMemo(
    () =>
      states.filter(
        (state) =>
          state.name.toLowerCase().includes(query) ||
          state.stateCode.toLowerCase().includes(query),
      ),
    [states, query],
  );

  const selectedState = useMemo(
    () => filteredStates.find((state) => state.id === selectedStateId) ?? null,
    [filteredStates, selectedStateId],
  );

  const {
    data: cities = [],
    isLoading: citiesLoading,
    error: citiesError,
  } = useCities(selectedState?.id ?? null);
  const deleteCityMutation = useDeleteCity();
  useToastOnError(citiesError);

  useEffect(() => {
    if (filteredStates.length === 0) {
      setSelectedStateId(null);
      return;
    }

    const stillVisible = filteredStates.some((state) => state.id === selectedStateId);
    if (!stillVisible) {
      setSelectedStateId(filteredStates[0].id);
    }
  }, [filteredStates, selectedStateId]);

  useEffect(() => {
    if (selectedStateId == null && filteredStates.length > 0) {
      setSelectedStateId(filteredStates[0].id);
    }
  }, [filteredStates, selectedStateId]);

  const submittingState =
    createStateMutation.isPending || updateStateMutation.isPending;
  const submittingCity = createCityMutation.isPending || updateCityMutation.isPending;

  const openCreateState = () => {
    setStateName('');
    setStateCode('');
    setStateModal({ mode: 'create' });
  };

  const openEditState = (state: State) => {
    setStateName(state.name);
    setStateCode(state.stateCode);
    setStateModal({ mode: 'edit', state });
  };

  const closeStateModal = () => {
    setStateModal(null);
    setStateName('');
    setStateCode('');
  };

  const openCreateCity = (state: State) => {
    setCityName('');
    setCityShortCode('');
    setCityModal({ mode: 'create', state });
  };

  const openEditCity = (state: State, city: City) => {
    setCityName(city.name);
    setCityShortCode(city.shortCode ?? '');
    setCityModal({ mode: 'edit', state, city });
  };

  const closeCityModal = () => {
    setCityModal(null);
    setCityName('');
    setCityShortCode('');
  };

  const handleSaveState = async (e: FormEvent) => {
    e.preventDefault();
    if (!stateModal) return;

    if (stateModal.mode === 'edit') {
      const confirmed = await confirm({
        title: t('locations.editState'),
        message: t('locations.updateStateConfirm', { name: stateModal.state.name }),
        confirmLabel: t('common.save', 'Save Changes'),
      });
      if (!confirmed) return;
    }

    try {
      if (stateModal.mode === 'create') {
        const created = await createStateMutation.mutateAsync({
          name: stateName,
          stateCode,
        });
        setSelectedStateId(created.id);
        toast.success(t('locations.createStateSuccess'));
      } else {
        await updateStateMutation.mutateAsync({
          id: stateModal.state.id,
          payload: { name: stateName, stateCode },
        });
        toast.success(t('locations.updateStateSuccess'));
      }
      closeStateModal();
    } catch {
      // Errors handled by mutation hooks
    }
  };

  const handleDeleteState = async (state: State) => {
    const confirmed = await confirm({
      title: t('locations.deleteState'),
      message: t('locations.deleteStateConfirm', { name: state.name }),
      variant: 'danger',
      confirmLabel: t('locations.deleteState'),
    });
    if (!confirmed) return;

    try {
      await deleteStateMutation.mutateAsync(state.id);
      toast.success(t('locations.deleteStateSuccess'));
    } catch {
      // Errors handled by mutation hooks
    }
  };

  const handleSaveCity = async (e: FormEvent) => {
    e.preventDefault();
    if (!cityModal) return;

    if (cityModal.mode === 'edit') {
      const confirmed = await confirm({
        title: t('locations.editCity'),
        message: t('locations.updateCityConfirm', { name: cityModal.city.name }),
        confirmLabel: t('common.save', 'Save Changes'),
      });
      if (!confirmed) return;
    }

    const shortCode = cityShortCode.trim() === '' ? null : cityShortCode.trim();

    try {
      if (cityModal.mode === 'create') {
        await createCityMutation.mutateAsync({
          stateId: cityModal.state.id,
          payload: { name: cityName, shortCode },
        });
        toast.success(t('locations.createCitySuccess'));
      } else {
        await updateCityMutation.mutateAsync({
          id: cityModal.city.id,
          stateId: cityModal.state.id,
          payload: { name: cityName, shortCode },
        });
        toast.success(t('locations.updateCitySuccess'));
      }
      closeCityModal();
    } catch {
      // Errors handled by mutation hooks
    }
  };

  const handleDeleteCity = async (city: City) => {
    if (!selectedState) return;

    const confirmed = await confirm({
      title: t('locations.deleteCity'),
      message: t('locations.deleteCityConfirm', { name: city.name }),
      variant: 'danger',
      confirmLabel: t('locations.deleteCity'),
    });
    if (!confirmed) return;

    try {
      await deleteCityMutation.mutateAsync({ id: city.id, stateId: selectedState.id });
      toast.success(t('locations.deleteCitySuccess'));
    } catch {
      // Errors handled by mutation hooks
    }
  };

  return (
    <div className="page-shell">
      <PageHeader
        title={t('locations.title')}
        description={t('locations.subtitle')}
        actions={
          <Button onClick={openCreateState}>
            <Plus size={16} />
            {t('locations.addState')}
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card padding="md" className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-muted border border-primary/20">
            <MapPin size={20} className="text-primary" />
          </div>
          <div>
            <p className="text-sm text-text-secondary">{t('locations.totalStates')}</p>
            <p className="stat-value text-2xl">{states.length}</p>
          </div>
        </Card>

        <Card padding="md" className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-info-muted border border-info/20">
            <Building2 size={20} className="text-info" />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-text-secondary">{t('locations.selectedState')}</p>
            <p className="truncate text-lg font-semibold text-text">
              {selectedState?.name ?? t('locations.noneSelected')}
            </p>
          </div>
        </Card>

        <Card padding="md" className="flex items-start gap-4 sm:col-span-2 lg:col-span-1">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-success-muted border border-success/20">
            <Hash size={20} className="text-success" />
          </div>
          <div>
            <p className="text-sm text-text-secondary">{t('locations.cityCount')}</p>
            <p className="stat-value text-2xl">
              {selectedState ? (citiesLoading ? '…' : cities.length) : '—'}
            </p>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(280px,340px)_1fr] lg:items-start">
        <Card padding="none" className="data-card flex flex-col min-h-[420px]">
          <div className="data-card-toolbar !items-stretch">
            <div className="w-full space-y-3">
              <div>
                <CardTitle>{t('locations.statesPanel')}</CardTitle>
                <CardDescription>{t('locations.statesPanelHint')}</CardDescription>
              </div>
              <Input
                icon={Search}
                placeholder={t('locations.search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[520px]">
            {isLoading ? (
              <Loader text={t('common.loading', 'Loading...')} />
            ) : filteredStates.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-elevated border border-border">
                  <MapPin size={20} className="text-text-muted" />
                </div>
                <p className="text-sm text-text-secondary">
                  {search ? t('locations.noResults') : t('locations.empty')}
                </p>
                {!search && (
                  <Button size="sm" variant="secondary" onClick={openCreateState}>
                    <Plus size={14} />
                    {t('locations.addState')}
                  </Button>
                )}
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {filteredStates.map((state) => {
                  const isSelected = state.id === selectedStateId;
                  return (
                    <li key={state.id}>
                      <div
                        className={`group flex items-center gap-3 px-4 py-3 transition-colors ${
                          isSelected
                            ? 'bg-primary-muted/60 border-l-2 border-l-primary'
                            : 'hover:bg-surface/60 border-l-2 border-l-transparent'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedStateId(state.id)}
                          className="min-w-0 flex-1 text-left"
                        >
                          <div className="truncate font-medium text-text">{state.name}</div>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <Badge variant={isSelected ? 'primary' : 'neutral'}>
                              {state.stateCode}
                            </Badge>
                            <span className="text-xs text-text-muted">
                              {t('locations.rowCityCount', { count: state.cityCount ?? 0 })}
                            </span>
                          </div>
                        </button>

                        <div className="flex shrink-0 items-center gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity">
                          <IconButton
                            size="sm"
                            aria-label={t('locations.editState')}
                            onClick={() => openEditState(state)}
                          >
                            <Edit2 size={15} />
                          </IconButton>
                          <IconButton
                            size="sm"
                            aria-label={t('locations.deleteState')}
                            onClick={() => void handleDeleteState(state)}
                          >
                            <Trash2 size={15} className="text-error" />
                          </IconButton>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </Card>

        <Card padding="none" className="data-card flex flex-col min-h-[420px]">
          <div className="data-card-toolbar">
            <div className="min-w-0">
              <CardTitle>{t('locations.citiesPanel')}</CardTitle>
              <CardDescription>
                {selectedState
                  ? t('locations.citiesPanelHint', { name: selectedState.name })
                  : t('locations.selectStatePrompt')}
              </CardDescription>
            </div>
            {selectedState && (
              <Button size="sm" onClick={() => openCreateCity(selectedState)}>
                <Plus size={14} />
                {t('locations.addCity')}
              </Button>
            )}
          </div>

          {!selectedState ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-20 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-elevated border border-border">
                <Building2 size={24} className="text-text-muted" />
              </div>
              <p className="max-w-sm text-sm text-text-secondary">
                {t('locations.selectStatePrompt')}
              </p>
            </div>
          ) : citiesLoading ? (
            <Loader text={t('common.loading', 'Loading...')} />
          ) : cities.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-20 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-elevated border border-border">
                <Building2 size={24} className="text-text-muted" />
              </div>
              <p className="text-sm text-text-secondary">{t('locations.citiesEmpty')}</p>
              <Button size="sm" onClick={() => openCreateCity(selectedState)}>
                <Plus size={14} />
                {t('locations.addCity')}
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('locations.cityName')}</TableHead>
                    <TableHead>{t('locations.shortCode')}</TableHead>
                    <TableHead className="text-right w-28">{t('locations.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <tbody>
                  {cities.map((city) => (
                    <TableRow key={city.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface border border-border">
                            <Building2 size={14} className="text-text-muted" />
                          </div>
                          <span className="font-medium text-text">{city.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {city.shortCode ? (
                          <Badge variant="neutral">{city.shortCode}</Badge>
                        ) : (
                          <span className="text-text-muted">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex items-center gap-1">
                          <IconButton
                            size="sm"
                            aria-label={t('locations.editCity')}
                            onClick={() => openEditCity(selectedState, city)}
                          >
                            <Edit2 size={15} />
                          </IconButton>
                          <IconButton
                            size="sm"
                            aria-label={t('locations.deleteCity')}
                            onClick={() => void handleDeleteCity(city)}
                          >
                            <Trash2 size={15} className="text-error" />
                          </IconButton>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card>
      </div>

      <Modal
        isOpen={!!stateModal}
        onClose={closeStateModal}
        title={
          stateModal?.mode === 'create' ? t('locations.addState') : t('locations.editState')
        }
      >
        <form onSubmit={handleSaveState} className="space-y-4">
          <Input
            label={t('locations.stateName')}
            value={stateName}
            onChange={(e) => setStateName(e.target.value)}
            required
            disabled={submittingState}
          />
          <Input
            label={t('locations.stateCode')}
            value={stateCode}
            onChange={(e) => setStateCode(e.target.value)}
            required
            disabled={submittingState}
            hint={t('locations.stateCodeHint')}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={closeStateModal}
              disabled={submittingState}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" isLoading={submittingState}>
              {stateModal?.mode === 'create'
                ? t('locations.addState')
                : t('common.save')}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!cityModal}
        onClose={closeCityModal}
        title={cityModal?.mode === 'create' ? t('locations.addCity') : t('locations.editCity')}
      >
        <form onSubmit={handleSaveCity} className="space-y-4">
          {cityModal && (
            <div className="rounded-lg border border-border bg-surface/50 px-3.5 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                {t('locations.parentState')}
              </p>
              <p className="mt-1 text-sm font-medium text-text">{cityModal.state.name}</p>
              <Badge variant="neutral" className="mt-2">
                {cityModal.state.stateCode}
              </Badge>
            </div>
          )}
          <Input
            label={t('locations.cityName')}
            value={cityName}
            onChange={(e) => setCityName(e.target.value)}
            required
            disabled={submittingCity}
          />
          <Input
            label={t('locations.shortCode')}
            value={cityShortCode}
            onChange={(e) => setCityShortCode(e.target.value)}
            maxLength={3}
            disabled={submittingCity}
            hint={t('locations.shortCodeHint')}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={closeCityModal}
              disabled={submittingCity}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" isLoading={submittingCity}>
              {cityModal?.mode === 'create' ? t('locations.addCity') : t('common.save')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Locations;
