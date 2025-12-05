import React from 'react';

const FormField = ({ label, error, required, children, className = '' }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  );
};

const Input = ({ 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  error,
  className = '',
  ...props 
}) => {
  const hasError = Boolean(error);
  
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-2 rounded-lg bg-slate-800 border ${
        hasError ? 'border-red-500' : 'border-slate-700'
      } focus:outline-none focus:ring-2 ${
        hasError ? 'focus:ring-red-500' : 'focus:ring-purple-500'
      } text-white ${className}`}
      {...props}
    />
  );
};

const TextArea = ({ 
  placeholder, 
  value, 
  onChange, 
  rows = 4, 
  error,
  className = '',
  ...props 
}) => {
  const hasError = Boolean(error);
  
  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      rows={rows}
      className={`w-full px-4 py-2 rounded-lg bg-slate-800 border ${
        hasError ? 'border-red-500' : 'border-slate-700'
      } focus:outline-none focus:ring-2 ${
        hasError ? 'focus:ring-red-500' : 'focus:ring-purple-500'
      } text-white resize-none ${className}`}
      {...props}
    />
  );
};

const Select = ({ 
  value, 
  onChange, 
  options, 
  placeholder,
  error,
  className = '',
  ...props 
}) => {
  const hasError = Boolean(error);
  
  return (
    <select
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-2 rounded-lg bg-slate-800 border ${
        hasError ? 'border-red-500' : 'border-slate-700'
      } focus:outline-none focus:ring-2 ${
        hasError ? 'focus:ring-red-500' : 'focus:ring-purple-500'
      } text-white ${className}`}
      {...props}
    >
      {placeholder && (
        <option value="">{placeholder}</option>
      )}
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export { FormField, Input, TextArea, Select };
