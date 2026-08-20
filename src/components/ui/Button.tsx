import React from 'react';
import { Spinner } from './Spinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]';

  const variants = {
    primary: 'bg-[#5B43EE] text-white hover:bg-[#4a35d4] focus:ring-[#5B43EE]',
    secondary: 'bg-[#EEF2FF] text-[#5B43EE] hover:bg-[#e0e7ff] focus:ring-[#5B43EE]',
    danger: 'border border-red-500 text-red-600 hover:bg-red-50 focus:ring-red-500',
    ghost: 'bg-transparent text-[#5B43EE] hover:bg-[#EEF2FF] focus:ring-[#5B43EE]',
  };

  const sizes = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-12 px-5 text-base',
    lg: 'h-14 px-6 text-lg',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Spinner size={size === 'sm' ? 'sm' : 'md'} color="current" /> : children}
    </button>
  );
}
