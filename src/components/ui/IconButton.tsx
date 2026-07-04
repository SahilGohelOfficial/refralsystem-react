import React, { ButtonHTMLAttributes } from 'react';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md';
  variant?: 'default' | 'danger';
}

const IconButton = ({
  children,
  size = 'md',
  variant = 'default',
  className = '',
  ...props
}: IconButtonProps) => {
  const sizeClass = size === 'sm' ? 'icon-btn-sm' : 'icon-btn';
  const variantClass =
    variant === 'danger'
      ? 'hover:text-error hover:bg-error-muted'
      : '';

  return (
    <button
      type="button"
      className={`${sizeClass} ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default IconButton;