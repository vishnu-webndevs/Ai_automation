
import React from 'react';

interface BadgeProps {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
  children: React.ReactNode;
  className?: string;
  pill?: boolean;
}

const Badge: React.FC<BadgeProps> = ({ variant = 'primary', pill = false, children, className = '' }) => {
  const variants = {
    primary: 'bg-blue-600 text-white',
    secondary: 'bg-gray-600 text-white',
    success: 'bg-green-600 text-white',
    danger: 'bg-red-600 text-white',
    warning: 'bg-yellow-500 text-white',
    info: 'bg-cyan-500 text-white',
    light: 'bg-gray-100 text-gray-800',
    dark: 'bg-gray-900 text-white',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium ${pill ? 'rounded-full' : 'rounded'} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
