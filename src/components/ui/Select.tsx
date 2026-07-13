import React, { forwardRef, SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';

export interface Option {
  value: string | number;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options?: Option[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options = [], className = '', ...props }, ref) => {
    return (
      <div className="w-full text-left">
        {label && <label className="form-label text-left">{label}</label>}
        <div className="relative">
          <select
            ref={ref}
            className={`
              form-input appearance-none pr-10 text-left
              ${error ? 'border-error/50 focus:border-error focus:ring-error/30' : ''}
              ${className}
            `}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value} className="bg-surface text-text">
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ChevronDown className="h-4 w-4 text-text-muted" />
          </div>
        </div>
        {error && <p className="mt-1.5 text-xs text-error text-left">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-xs text-text-muted text-left">{hint}</p>}
      </div>
    );
  },
);

Select.displayName = 'Select';

export default Select;