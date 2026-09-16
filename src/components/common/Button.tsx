/**
 * Buttons.
 *
 * `primary` is the brand green and there is at most ONE per view: if two buttons
 * are green the operator cannot tell which is "the" action, so the second one
 * must be `secondary`. Green is permitted in exactly five places in this product
 * and this is the third of them.
 */

import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const VARIANT: Record<Variant, string> = {
  primary: 'bg-green-400 hover:bg-green-300 text-zinc-950 border border-green-400',
  secondary: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700',
  ghost: 'bg-transparent hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 border border-transparent',
  danger: 'bg-zinc-800 hover:bg-red-500/15 text-red-400 border border-zinc-700 hover:border-red-500/30',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  icon?: ReactNode;
  size?: 'sm' | 'md';
  /** Disables the control while an in-flight mutation is running. */
  loading?: boolean;
}

export default function Button({
  variant = 'secondary',
  icon,
  size = 'sm',
  loading = false,
  disabled,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const sizing = size === 'sm' ? 'h-7 px-2 text-[13px]' : 'h-8 px-3 text-[13px]';
  return (
    <button
      type="button"
      {...rest}
      disabled={disabled || loading}
      data-component="button"
      className={`inline-flex items-center gap-1.5 rounded-md font-medium transition-colors duration-150 disabled:opacity-45 disabled:cursor-not-allowed focus-visible:ring-1 focus-visible:ring-green-400 ${sizing} ${VARIANT[variant]} ${className}`}
    >
      {icon ? <span className="shrink-0">{icon}</span> : null}
      {children}
    </button>
  );
}
