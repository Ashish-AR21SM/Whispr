import React from 'react';

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variantClasses = {
    default: 'bg-gray-800 text-gray-400',
    environmental: 'bg-emerald-900 bg-opacity-40 text-emerald-400',
    fraud: 'bg-amber-900 bg-opacity-40 text-amber-400',
    cybercrime: 'bg-blue-900 bg-opacity-40 text-blue-400',
    corruption: 'bg-purple-900 bg-opacity-40 text-purple-400',
    violence: 'bg-red-900 bg-opacity-40 text-red-400',
    domestic_violence: 'bg-red-900 bg-opacity-40 text-red-400',
    verified: 'bg-green-900 bg-opacity-30 text-green-400',
    rejected: 'bg-red-900 bg-opacity-30 text-red-400',
    pending: 'bg-amber-900 bg-opacity-30 text-amber-400',
    under_review: 'bg-blue-900 bg-opacity-30 text-blue-400'
  };

  const classes = [
    'px-2 py-1 text-xs rounded-full',
    variantClasses[variant] || variantClasses.default,
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={classes}>
      {children}
    </span>
  );
};

export default Badge;
