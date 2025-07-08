// components/forms/FormInput.tsx
'use client'

import React, { useCallback } from 'react';

interface FormInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  placeholder?: string;
  className?: string;
}

const FormInput = React.memo(({ 
  label, 
  value, 
  onChange, 
  required = false, 
  type = 'text', 
  placeholder = '',
  className = ''
}: FormInputProps) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-rose-900 dark:text-rose-100 mb-2">
        {label} {required && '*'}
      </label>
      <input
        type={type}
        value={value || ''}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-rose-200 dark:border-rose-700 rounded-lg bg-white/50 dark:bg-rose-800/50 text-rose-900 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
        required={required}
      />
    </div>
  );
});

FormInput.displayName = 'FormInput';

export default FormInput;