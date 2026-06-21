import React, { forwardRef, InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ElementType;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ 
  label, 
  error, 
  icon: Icon,
  className = '',
  ...props 
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-text-secondary" />
          </div>
        )}
        <input
          ref={ref}
          className={`
            w-full bg-surface border rounded-lg px-4 py-2 text-text placeholder:text-text-secondary/50
            focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-error focus:border-error focus:ring-error/50' : 'border-border focus:border-primary'}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-error">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
