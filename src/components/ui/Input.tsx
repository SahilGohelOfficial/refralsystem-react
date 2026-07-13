import React, { forwardRef, InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ElementType;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon: Icon, className = '', ...props }, ref) => {
    return (
      <div className="w-full text-left">
        {label && <label className="form-label text-left">{label}</label>}
        <div className="relative">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Icon className="h-4 w-4 text-text-muted" />
            </div>
          )}
          <input
            ref={ref}
            className={`
              form-input text-left
              ${Icon ? 'pl-10' : ''}
              ${error ? 'border-error/50 focus:border-error focus:ring-error/30' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && <p className="mt-1.5 text-xs text-error text-left">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-xs text-text-muted text-left">{hint}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;