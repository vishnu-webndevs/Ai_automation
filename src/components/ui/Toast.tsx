
import React, { useState, useEffect } from 'react';
import { FiX, FiCheck, FiAlertTriangle, FiInfo } from 'react-icons/fi';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onClose?: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'info', onClose, duration = 3000 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!isVisible) return null;

  const icons = {
    success: <FiCheck className="w-5 h-5" />,
    error: <FiX className="w-5 h-5" />,
    warning: <FiAlertTriangle className="w-5 h-5" />,
    info: <FiInfo className="w-5 h-5" />,
  };

  const colors = {
    success: 'text-green-500 bg-green-100',
    error: 'text-red-500 bg-red-100',
    warning: 'text-orange-500 bg-orange-100',
    info: 'text-blue-500 bg-blue-100',
  };

  return (
    <div className="flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow" role="alert">
        <div className={`inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg ${colors[type]}`}>
            {icons[type]}
            <span className="sr-only">{type} icon</span>
        </div>
        <div className="ms-3 text-sm font-normal">{message}</div>
        <button 
            onClick={() => { setIsVisible(false); onClose?.(); }}
            type="button" 
            className="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8" 
            aria-label="Close"
        >
            <span className="sr-only">Close</span>
            <FiX className="w-3 h-3" />
        </button>
    </div>
  );
};

export default Toast;
