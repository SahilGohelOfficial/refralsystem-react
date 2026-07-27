import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCalendarDate } from '../../lib/dates';

dayjs.extend(utc);
dayjs.extend(customParseFormat);

const ISO = 'YYYY-MM-DD';
const ISO_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const PANEL_WIDTH = 288;
const PANEL_GAP = 6;
const YEAR_PAGE_SIZE = 12;

type PanelMode = 'days' | 'months' | 'years';

function parseIso(value: string) {
  if (!ISO_PATTERN.test(value)) return null;
  const d = dayjs.utc(value, ISO, true);
  return d.isValid() ? d : null;
}

function isDisabled(iso: string, min?: string, max?: string): boolean {
  const d = parseIso(iso);
  if (!d) return true;
  if (min) {
    const minD = parseIso(min);
    if (minD && d.isBefore(minD, 'day')) return true;
  }
  if (max) {
    const maxD = parseIso(max);
    if (maxD && d.isAfter(maxD, 'day')) return true;
  }
  return false;
}

function isMonthOutOfRange(year: number, month: number, min?: string, max?: string): boolean {
  const start = dayjs.utc().year(year).month(month).date(1);
  const end = start.endOf('month');
  if (min) {
    const minD = parseIso(min);
    if (minD && end.isBefore(minD, 'day')) return true;
  }
  if (max) {
    const maxD = parseIso(max);
    if (maxD && start.isAfter(maxD, 'day')) return true;
  }
  return false;
}

function isYearOutOfRange(year: number, min?: string, max?: string): boolean {
  const start = dayjs.utc().year(year).month(0).date(1);
  const end = dayjs.utc().year(year).month(11).endOf('month');
  if (min) {
    const minD = parseIso(min);
    if (minD && end.isBefore(minD, 'day')) return true;
  }
  if (max) {
    const maxD = parseIso(max);
    if (maxD && start.isAfter(maxD, 'day')) return true;
  }
  return false;
}

function cellButtonClass(opts: {
  disabled: boolean;
  selected: boolean;
  highlighted?: boolean;
}) {
  return [
    'h-9 rounded-lg text-sm tabular-nums transition-colors duration-100',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
    opts.disabled
      ? 'cursor-not-allowed text-text-muted/40'
      : 'cursor-pointer text-text hover:bg-surface-elevated',
    opts.selected ? 'bg-primary text-background hover:bg-primary-hover' : '',
    !opts.selected && opts.highlighted ? 'ring-1 ring-primary/40' : '',
  ]
    .filter(Boolean)
    .join(' ');
}

export type DatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  placeholder?: string;
  onBlur?: () => void;
  className?: string;
};

export default function DatePicker({
  value,
  onChange,
  min,
  max,
  label,
  error,
  hint,
  required,
  disabled,
  id,
  placeholder = 'Select date',
  onBlur,
  className = '',
}: DatePickerProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const [open, setOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<PanelMode>('days');
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(() => parseIso(value), [value]);
  const initialView = selected ?? parseIso(max ?? '') ?? parseIso(min ?? '') ?? dayjs.utc();
  const [viewYear, setViewYear] = useState(initialView.year());
  const [viewMonth, setViewMonth] = useState(initialView.month());
  const [yearPageStart, setYearPageStart] = useState(
    () => Math.floor(initialView.year() / YEAR_PAGE_SIZE) * YEAR_PAGE_SIZE,
  );

  useEffect(() => {
    if (!open) return;
    const base = selected ?? parseIso(max ?? '') ?? parseIso(min ?? '') ?? dayjs.utc();
    setViewYear(base.year());
    setViewMonth(base.month());
    setYearPageStart(Math.floor(base.year() / YEAR_PAGE_SIZE) * YEAR_PAGE_SIZE);
    setPanelMode('days');
  }, [open, selected, min, max]);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const panelHeight = panelRef.current?.offsetHeight ?? 320;

    let left = rect.left;
    let top = rect.bottom + PANEL_GAP;

    if (top + panelHeight > window.innerHeight - PANEL_GAP) {
      top = rect.top - panelHeight - PANEL_GAP;
    }

    left = Math.max(PANEL_GAP, Math.min(left, window.innerWidth - PANEL_WIDTH - PANEL_GAP));
    top = Math.max(PANEL_GAP, top);

    setPosition({ top, left });
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePosition();
    const raf = requestAnimationFrame(updatePosition);
    const onScrollOrResize = () => updatePosition();
    window.addEventListener('resize', onScrollOrResize);
    window.addEventListener('scroll', onScrollOrResize, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onScrollOrResize);
      window.removeEventListener('scroll', onScrollOrResize, true);
    };
  }, [open, panelMode, updatePosition]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
      onBlur?.();
    };
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (panelMode !== 'days') {
        setPanelMode(panelMode === 'years' ? 'months' : 'days');
        return;
      }
      setOpen(false);
      onBlur?.();
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onBlur, panelMode]);

  const viewCursor = dayjs.utc().year(viewYear).month(viewMonth).date(1);
  const monthLabel = viewCursor.format('MMMM YYYY');

  const days = useMemo(() => {
    const start = dayjs.utc().year(viewYear).month(viewMonth).date(1);
    const startWeekday = start.day();
    const daysInMonth = start.daysInMonth();
    const cells: Array<{ iso: string; day: number; inMonth: boolean } | null> = [];

    for (let i = 0; i < startWeekday; i += 1) {
      cells.push(null);
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      const d = start.date(day);
      cells.push({ iso: d.format(ISO), day, inMonth: true });
    }
    return cells;
  }, [viewYear, viewMonth]);

  const years = useMemo(
    () => Array.from({ length: YEAR_PAGE_SIZE }, (_, i) => yearPageStart + i),
    [yearPageStart],
  );

  const goMonth = (delta: number) => {
    const next = dayjs.utc().year(viewYear).month(viewMonth).date(1).add(delta, 'month');
    setViewYear(next.year());
    setViewMonth(next.month());
  };

  const goYear = (delta: number) => {
    setViewYear((y) => y + delta);
  };

  const goYearPage = (delta: number) => {
    setYearPageStart((start) => start + delta * YEAR_PAGE_SIZE);
  };

  const selectDay = (iso: string) => {
    if (isDisabled(iso, min, max)) return;
    onChange(iso);
    setOpen(false);
    onBlur?.();
  };

  const selectMonth = (month: number) => {
    if (isMonthOutOfRange(viewYear, month, min, max)) return;
    setViewMonth(month);
    setPanelMode('days');
  };

  const selectYear = (year: number) => {
    if (isYearOutOfRange(year, min, max)) return;
    setViewYear(year);
    setPanelMode('months');
  };

  const displayValue = value && selected ? formatCalendarDate(value) : '';

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!disabled) setOpen((v) => !v);
    }
  };

  const headerTitle =
    panelMode === 'days'
      ? monthLabel
      : panelMode === 'months'
        ? String(viewYear)
        : `${yearPageStart} – ${yearPageStart + YEAR_PAGE_SIZE - 1}`;

  const onHeaderClick = () => {
    if (panelMode === 'days') setPanelMode('months');
    else if (panelMode === 'months') setPanelMode('years');
  };

  const onPrev = () => {
    if (panelMode === 'days') goMonth(-1);
    else if (panelMode === 'months') goYear(-1);
    else goYearPage(-1);
  };

  const onNext = () => {
    if (panelMode === 'days') goMonth(1);
    else if (panelMode === 'months') goYear(1);
    else goYearPage(1);
  };

  const prevLabel =
    panelMode === 'days' ? 'Previous month' : panelMode === 'months' ? 'Previous year' : 'Previous years';
  const nextLabel =
    panelMode === 'days' ? 'Next month' : panelMode === 'months' ? 'Next year' : 'Next years';

  const panel =
    open &&
    createPortal(
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="false"
        aria-label={label ?? 'Choose date'}
        style={{
          position: 'fixed',
          top: position.top,
          left: position.left,
          width: PANEL_WIDTH,
          zIndex: 9999,
        }}
        className="rounded-xl border border-border bg-card p-3 shadow-xl"
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <button
            type="button"
            className="icon-btn-sm"
            onClick={onPrev}
            aria-label={prevLabel}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onHeaderClick}
            disabled={panelMode === 'years'}
            aria-label={
              panelMode === 'days'
                ? 'Choose month'
                : panelMode === 'months'
                  ? 'Choose year'
                  : undefined
            }
            className={[
              'rounded-lg px-2 py-1 text-sm font-semibold text-text tabular-nums transition-colors duration-100',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
              panelMode === 'years'
                ? 'cursor-default'
                : 'cursor-pointer hover:bg-surface-elevated',
            ].join(' ')}
          >
            {headerTitle}
          </button>
          <button
            type="button"
            className="icon-btn-sm"
            onClick={onNext}
            aria-label={nextLabel}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {panelMode === 'days' ? (
          <>
            <div className="mb-1 grid grid-cols-7 gap-0.5">
              {WEEKDAYS.map((d) => (
                <div
                  key={d}
                  className="py-1 text-center text-[11px] font-medium uppercase tracking-wide text-text-muted"
                >
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-0.5">
              {days.map((cell, index) => {
                if (!cell) {
                  return <div key={`empty-${index}`} className="h-9" />;
                }
                const disabledDay = isDisabled(cell.iso, min, max);
                const isSelected = value === cell.iso;
                const isToday = cell.iso === dayjs.utc().format(ISO);

                return (
                  <button
                    key={cell.iso}
                    type="button"
                    disabled={disabledDay}
                    onClick={() => selectDay(cell.iso)}
                    className={cellButtonClass({
                      disabled: disabledDay,
                      selected: isSelected,
                      highlighted: isToday,
                    })}
                  >
                    {cell.day}
                  </button>
                );
              })}
            </div>
          </>
        ) : null}

        {panelMode === 'months' ? (
          <div className="grid grid-cols-3 gap-1">
            {MONTHS.map((name, month) => {
              const disabledMonth = isMonthOutOfRange(viewYear, month, min, max);
              const isSelected = selected?.year() === viewYear && selected.month() === month;
              const isCurrent =
                dayjs.utc().year() === viewYear && dayjs.utc().month() === month;

              return (
                <button
                  key={name}
                  type="button"
                  disabled={disabledMonth}
                  onClick={() => selectMonth(month)}
                  className={cellButtonClass({
                    disabled: disabledMonth,
                    selected: isSelected,
                    highlighted: isCurrent,
                  })}
                >
                  {name}
                </button>
              );
            })}
          </div>
        ) : null}

        {panelMode === 'years' ? (
          <div className="grid grid-cols-3 gap-1">
            {years.map((year) => {
              const disabledYear = isYearOutOfRange(year, min, max);
              const isSelected = selected?.year() === year;
              const isCurrent = dayjs.utc().year() === year;

              return (
                <button
                  key={year}
                  type="button"
                  disabled={disabledYear}
                  onClick={() => selectYear(year)}
                  className={cellButtonClass({
                    disabled: disabledYear,
                    selected: isSelected,
                    highlighted: isCurrent,
                  })}
                >
                  {year}
                </button>
              );
            })}
          </div>
        ) : null}

        {value && panelMode === 'days' ? (
          <div className="mt-3 flex justify-end border-t border-border pt-2">
            <button
              type="button"
              className="text-xs font-medium text-text-secondary hover:text-text"
              onClick={() => {
                onChange('');
                setOpen(false);
                onBlur?.();
              }}
            >
              Clear
            </button>
          </div>
        ) : null}
      </div>,
      document.body,
    );

  return (
    <div className={`w-full ${className}`}>
      {label ? (
        <label htmlFor={inputId} className="form-label">
          {label}
          {required ? <span className="ml-0.5 text-error">*</span> : null}
        </label>
      ) : null}

      <button
        ref={triggerRef}
        id={inputId}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-invalid={error ? true : undefined}
        aria-required={required || undefined}
        onClick={() => {
          if (disabled) return;
          setOpen((v) => !v);
        }}
        onKeyDown={handleTriggerKeyDown}
        onBlur={() => {
          if (!open) onBlur?.();
        }}
        className={[
          'form-input flex w-full items-center justify-between gap-2 text-left',
          error ? 'border-error/50 focus:border-error focus:ring-error/30' : '',
          !displayValue ? 'text-text-muted' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <span className="truncate">{displayValue || placeholder}</span>
        <Calendar className="h-4 w-4 shrink-0 text-text-muted" />
      </button>

      {error ? <p className="mt-1.5 text-xs text-error">{error}</p> : null}
      {hint && !error ? <p className="mt-1.5 text-xs text-text-muted">{hint}</p> : null}
      {panel}
    </div>
  );
}
