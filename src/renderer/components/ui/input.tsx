import React from 'react';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={[
        'h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-black/10',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  )
);
Input.displayName = 'Input';
