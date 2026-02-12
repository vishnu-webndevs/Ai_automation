
import React from 'react';
import { FiAlertCircle, FiCheck } from 'react-icons/fi';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  state?: 'default' | 'success' | 'error';
  errorMessage?: string; // Kept for compatibility with error prop if needed, or alias
  helperText?: string;
}

const Input: React.FC<InputProps> = ({ 
  label, 
  state = 'default', 
  errorMessage, 
  helperText,
  className = '', 
  id, 
  ...props 
}) => {
  const inputId = id || props.name || Math.random().toString(36).substr(2, 9);
  
  const stateClasses = {
    default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
    success: 'border-green-500 text-green-900 placeholder-green-700 focus:ring-green-500 focus:border-green-500',
    error: 'border-red-500 text-red-900 placeholder-red-700 focus:ring-red-500 focus:border-red-500',
  };

  const hasIcon = state === 'success' || state === 'error';

  return (
    <div className="mb-4">
      {label && (
        <label 
            htmlFor={inputId} 
            className={`block mb-2 text-sm font-medium ${state === 'error' ? 'text-red-700' : state === 'success' ? 'text-green-700' : 'text-gray-900'}`}
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
            id={inputId}
            className={`bg-gray-50 border text-sm rounded-lg block w-full p-2.5 focus:outline-none focus:ring-1 ${stateClasses[state]} ${className}`}
            {...props}
        />
        {hasIcon && (
            <div className="absolute inset-y-0 end-0 flex items-center pe-3 pointer-events-none">
                {state === 'success' ? <FiCheck className="text-green-500" /> : <FiAlertCircle className="text-red-500" />}
            </div>
        )}
      </div>
      {(errorMessage || (state === 'error' && helperText)) && (
        <p className="mt-2 text-sm text-red-600">
            {errorMessage || helperText}
        </p>
      )}
      {state === 'success' && helperText && (
        <p className="mt-2 text-sm text-green-600">
            {helperText}
        </p>
      )}
      {state === 'default' && helperText && (
        <p className="mt-2 text-sm text-gray-500">
            {helperText}
        </p>
      )}
    </div>
  );
};

export default Input;
