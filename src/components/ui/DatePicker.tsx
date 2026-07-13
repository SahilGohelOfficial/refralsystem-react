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
const PANEL_WIDTH = 288;
const PANEL_GAP = 6;

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
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(() => parseIso(value), [value]);
  const initialView = selected ?? parseIso(max ?? '') ?? parseIso(min ?? '') ?? dayjs.utc();
  const [viewYear, setViewYear] = useState(initialView.year());
  const [viewMonth, setViewMonth] = useState(initialView.month());

  useEffect(() => {
    if (!open) return;
    const base = selected ?? parseIso(max ?? '') ?? parseIso(min ?? '') ?? dayjs.utc();
    setViewYear(base.year());
    setViewMonth(base.month());
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
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
      onBlur?.();
    };
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        onBlur?.();
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onBlur]);

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

  const goMonth = (delta: number) => {
    const next = dayjs.utc().year(viewYear).month(viewMonth).date(1).add(delta, 'month');
    setViewYear(next.year());
    setViewMonth(next.month());
  };

  const selectDay = (iso: string) => {
    if (isDisabled(iso, min, max)) return;
    onChange(iso);
    setOpen(false);
    onBlur?.();
  };

  const displayValue = value && selected ? formatCalendarDate(value) : '';

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!disabled) setOpen((v) => !v);
    }
  };

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
            onClick={() => goMonth(-1)}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="text-sm font-semibold text-text tabular-nums">{monthLabel}</div>
          <button
            type="button"
            className="icon-btn-sm"
            onClick={() => goMonth(1)}
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

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
                className={[
                  'h-9 rounded-lg text-sm tabular-nums transition-colors duration-100',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                  disabledDay
                    ? 'cursor-not-allowed text-text-muted/40'
                    : 'cursor-pointer text-text hover:bg-surface-elevated',
                  isSelected ? 'bg-primary text-background hover:bg-primary-hover' : '',
                  !isSelected && isToday ? 'ring-1 ring-primary/40' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {cell.day}
              </button>
            );
          })}
        </div>

        {value ? (
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
