
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'link';
  size?: 'sm' | 'md' | 'lg';
  outline?: boolean;
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  outline = false, 
  isLoading = false,
  className = '', 
  children, 
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  
  const variants = {
    primary: outline 
      ? 'border border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500' 
      : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: outline
      ? 'border border-gray-600 text-gray-600 hover:bg-gray-50 focus:ring-gray-500'
      : 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    success: outline
      ? 'border border-green-600 text-green-600 hover:bg-green-50 focus:ring-green-500'
      : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    danger: outline
      ? 'border border-red-600 text-red-600 hover:bg-red-50 focus:ring-red-500'
      : 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    warning: outline
      ? 'border border-yellow-500 text-yellow-600 hover:bg-yellow-50 focus:ring-yellow-500'
      : 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500',
    info: outline
      ? 'border border-cyan-500 text-cyan-600 hover:bg-cyan-50 focus:ring-cyan-500'
      : 'bg-cyan-500 text-white hover:bg-cyan-600 focus:ring-cyan-500',
    light: outline
      ? 'border border-gray-200 text-gray-700 hover:bg-gray-50 focus:ring-gray-200'
      : 'bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-200',
    dark: outline
      ? 'border border-gray-900 text-gray-900 hover:bg-gray-50 focus:ring-gray-900'
      : 'bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-900',
    link: 'text-blue-600 hover:underline bg-transparent shadow-none',
  };

  return (
    <button 
      className={`${baseStyles} ${sizeStyles[size]} ${variants[variant]} ${className} ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
