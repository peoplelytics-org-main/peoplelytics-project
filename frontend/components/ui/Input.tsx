
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Input: React.FC<InputProps> = ({ label, id, ...props }) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-text-secondary mb-1">
        {label}
      </label>
      <input
        id={id}
        className="w-full bg-white dark:bg-background border border-gray-300 dark:border-border rounded-md px-3 py-2 text-gray-900 dark:text-text-primary placeholder:text-gray-400 dark:placeholder:text-text-secondary focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none transition-colors"
        {...props}
      />
    </div>
  );
};

export default Input;
