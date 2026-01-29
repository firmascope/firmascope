import React from 'react';

type DialogProps = { children: React.ReactNode };

export const Dialog = ({ children }: DialogProps) => <div>{children}</div>;

export const DialogTrigger = ({ children }: DialogProps) => <div>{children}</div>;

export const DialogContent = ({ children, className }: DialogProps & { className?: string }) => (
  <div className={['rounded-lg border border-gray-200 bg-white p-4', className].filter(Boolean).join(' ')}>{children}</div>
);

export const DialogHeader = ({ children, className }: DialogProps & { className?: string }) => (
  <div className={['mb-3', className].filter(Boolean).join(' ')}>{children}</div>
);

export const DialogTitle = ({ children, className }: DialogProps & { className?: string }) => (
  <h4 className={['text-base font-semibold', className].filter(Boolean).join(' ')}>{children}</h4>
);
