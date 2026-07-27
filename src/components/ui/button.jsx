import React from 'react';
import { clsx } from 'clsx';

export const Button = ({
  children,
  className = '',
  variant = 'default',
  size = 'default',
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded-md disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    default: "bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600 shadow-sm",
    outline: "border border-slate-200 dark:border-slate-700 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100",
  };

  const sizes = {
    default: "h-10 px-4 py-2 text-sm",
    sm: "h-8 px-3 text-xs gap-1.5",
    "icon-sm": "h-8 w-8 p-0 text-xs flex items-center justify-center",
    lg: "h-11 px-8 text-base",
  };

  return (
    <button
      className={clsx(baseStyles, variants[variant] || variants.default, sizes[size] || sizes.default, className)}
      {...props}
    >
      {children}
    </button>
  );
};
