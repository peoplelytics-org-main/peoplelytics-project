import React from 'react';

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Switch: React.FC<SwitchProps> = ({ id, label, checked, onChange, ...props }) => {
  return (
    <label htmlFor={id} className={`flex items-center ${label ? 'justify-between' : 'justify-center'} cursor-pointer`}>
      {label && <span className="text-sm font-medium text-text-primary">{label}</span>}
      <div className="relative">
        <input
          id={id}
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={onChange}
          {...props}
        />
        <div className={`block w-10 h-6 rounded-full transition-colors ${checked ? 'bg-primary-600' : 'bg-border'}`}></div>
        <div
          className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
            checked ? 'transform translate-x-full' : ''
          }`}
        ></div>
      </div>
    </label>
  );
};

export default Switch;