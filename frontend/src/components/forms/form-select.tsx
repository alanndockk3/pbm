// components/forms/FormSelect.tsx
'use client'

import React, { useCallback } from 'react';

interface FormSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
  className?: string;
}

const FormSelect = React.memo(({ 
  label, 
  value, 
  onChange, 
  options, 
  required = false,
  className = ''
}: FormSelectProps) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-rose-900 dark:text-rose-100 mb-2">
        {label} {required && '*'}
      </label>
      <select
        value={value || ''}
        onChange={handleChange}
        className="w-full px-3 py-2 border border-rose-200 dark:border-rose-700 rounded-lg bg-white/50 dark:bg-rose-800/50 text-rose-900 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
        required={required}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );
});

FormSelect.displayName = 'FormSelect';

export default FormSelect;