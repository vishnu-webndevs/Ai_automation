
import React from 'react';

// Checkbox
interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="flex items-center mb-4">
      <input
        type="checkbox"
        className={`w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 ${className}`}
        {...props}
      />
      {label && (
        <label className="ms-2 text-sm font-medium text-gray-900">
          {label}
        </label>
      )}
    </div>
  );
};

// Radio
interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Radio: React.FC<RadioProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="flex items-center mb-4">
      <input
        type="radio"
        className={`w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2 ${className}`}
        {...props}
      />
      {label && (
        <label className="ms-2 text-sm font-medium text-gray-900">
          {label}
        </label>
      )}
    </div>
  );
};

// Switch (Toggle)
interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Switch: React.FC<SwitchProps> = ({ label, className = '', ...props }) => {
  return (
    <label className="inline-flex items-center cursor-pointer">
      <input type="checkbox" className="sr-only peer" {...props} />
      <div className={`relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 ${className}`}></div>
      {label && <span className="ms-3 text-sm font-medium text-gray-900">{label}</span>}
    </label>
  );
};

// Range Slider
interface RangeProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  min?: number;
  max?: number;
}

export const Range: React.FC<RangeProps> = ({ label, className = '', min = 0, max = 100, ...props }) => {
  return (
    <div className="w-full">
        {label && <label className="block mb-2 text-sm font-medium text-gray-900">{label}</label>}
        <input 
            type="range" 
            min={min} 
            max={max} 
            className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer ${className}`}
            {...props} 
        />
    </div>
  );
};
