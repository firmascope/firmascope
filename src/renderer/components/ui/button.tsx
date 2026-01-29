import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const base = 'inline-flex items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium transition';
    const variants: Record<string, string> = {
      default: 'bg-black text-white hover:opacity-90',
      outline: 'border-gray-300 bg-white text-gray-900 hover:bg-gray-50',
      ghost: 'bg-transparent text-gray-900 hover:bg-gray-100',
    };
    const sizes: Record<string, string> = {
      default: 'h-10',
      sm: 'h-8 px-3 text-xs',
      lg: 'h-12 px-6 text-base',
    };

    return (
      <button ref={ref} className={[base, variants[variant], sizes[size], className].filter(Boolean).join(' ')} {...props} />
    );
  }
);
Button.displayName = 'Button';
