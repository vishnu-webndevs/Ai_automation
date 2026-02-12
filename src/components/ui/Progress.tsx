
import React from 'react';

interface ProgressProps {
  value: number;
  max?: number;
  variant?: 'primary' | 'success' | 'danger' | 'warning' | 'info';
  showLabel?: boolean;
  height?: string;
  striped?: boolean;
  animated?: boolean;
}

const Progress: React.FC<ProgressProps> = ({ 
  value, 
  max = 100, 
  variant = 'primary', 
  showLabel = false,
  height = 'h-2.5',
  striped = false,
  animated = false
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const variants = {
    primary: 'bg-blue-600',
    success: 'bg-green-500',
    danger: 'bg-red-500',
    warning: 'bg-yellow-400',
    info: 'bg-cyan-500',
  };

  return (
    <div className={`w-full bg-gray-200 rounded-full ${height} mb-4`}>
      <div 
        className={`${variants[variant]} ${height} rounded-full transition-all duration-300 ${striped ? 'bg-[length:1rem_1rem] bg-gradient-to-r from-transparent via-white/30 to-transparent' : ''} ${animated ? 'animate-pulse' : ''}`} 
        style={{ width: `${percentage}%` }}
      >
        {showLabel && height !== 'h-1' && height !== 'h-1.5' && height !== 'h-2.5' && (
             <span className="text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full block"> {percentage.toFixed(0)}%</span>
        )}
      </div>
    </div>
  );
};

export default Progress;
