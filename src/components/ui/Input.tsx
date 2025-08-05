// src/components/ui/Input.tsx

// FIX: Import React to use its types
import React from 'react';

// FIX: Replace 'LucideIcon' with the correct type 'React.ElementType'
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ElementType;
  iconPosition?: 'left' | 'right';
}

export function Input({ 
  label, 
  error, 
  icon: Icon, 
  iconPosition = 'left',
  className = '', 
  ...props 
}: InputProps) {
  const inputClasses = `
    w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
    rounded-lg focus:ring-2 focus:ring-[#8e43ff] focus:border-transparent 
    transition-all duration-300 text-gray-900 dark:text-gray-100
    ${Icon ? (iconPosition === 'left' ? 'pl-12' : 'pr-12') : ''}
    ${error ? 'border-red-500 focus:ring-red-500' : ''}
  `;

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className={`absolute top-1/2 transform -translate-y-1/2 ${iconPosition === 'left' ? 'left-4' : 'right-4'}`}>
            <Icon className="w-5 h-5 text-gray-400" />
          </div>
        )}
        <input
          className={`${inputClasses} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}