import React from 'react';

export const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label ref={ref} className={['text-sm font-medium text-gray-700', className].filter(Boolean).join(' ')} {...props} />
  )
);
Label.displayName = 'Label';
