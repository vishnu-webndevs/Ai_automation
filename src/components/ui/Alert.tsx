
import React from 'react';

interface AlertProps {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
  children: React.ReactNode;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({ variant = 'primary', children, className = '' }) => {
  const variants = {
    primary: 'bg-blue-50 text-blue-800 border-blue-200',
    secondary: 'bg-gray-50 text-gray-800 border-gray-200',
    success: 'bg-green-50 text-green-800 border-green-200',
    danger: 'bg-red-50 text-red-800 border-red-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    info: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    light: 'bg-gray-50 text-gray-600 border-gray-100',
    dark: 'bg-gray-800 text-gray-100 border-gray-700',
  };

  return (
    <div className={`p-4 rounded-lg border ${variants[variant]} ${className}`} role="alert">
      {children}
    </div>
  );
};

export default Alert;
