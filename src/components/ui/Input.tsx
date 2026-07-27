import React, { forwardRef, InputHTMLAttributes, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ElementType;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon: Icon, className = '', type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

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
            type={inputType}
            className={`
              form-input text-left
              ${Icon ? 'pl-10' : ''}
              ${isPassword ? 'pr-10' : ''}
              ${error ? 'border-error/50 focus:border-error focus:ring-error/30' : ''}
              ${className}
            `}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
        </div>
        {error && <p className="mt-1.5 text-xs text-error text-left">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-xs text-text-muted text-left">{hint}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;