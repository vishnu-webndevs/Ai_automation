
import React, { useState } from 'react';
import { FiAlertCircle, FiCheck, FiEye, FiEyeOff } from 'react-icons/fi';

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
  type = 'text',
  ...props 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || props.name || Math.random().toString(36).substr(2, 9);
  
  const isPassword = type === 'password';
  const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const stateClasses = {
    default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
    success: 'border-green-500 text-green-900 placeholder-green-700 focus:ring-green-500 focus:border-green-500',
    error: 'border-red-500 text-red-900 placeholder-red-700 focus:ring-red-500 focus:border-red-500',
  };

  const hasStatusIcon = state === 'success' || state === 'error';

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
            type={effectiveType}
            className={`bg-gray-50 border text-sm rounded-lg block w-full p-2.5 ${isPassword || hasStatusIcon ? 'pe-10' : ''} focus:outline-none focus:ring-1 ${stateClasses[state]} ${className}`}
            {...props}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 end-0 flex items-center pe-3 text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <FiEyeOff className="w-5 h-5 text-gray-500" /> : <FiEye className="w-5 h-5 text-gray-500" />}
          </button>
        ) : hasStatusIcon ? (
          <div className="absolute inset-y-0 end-0 flex items-center pe-3 pointer-events-none">
            {state === 'success' ? <FiCheck className="text-green-500" /> : <FiAlertCircle className="text-red-500" />}
          </div>
        ) : null}
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
