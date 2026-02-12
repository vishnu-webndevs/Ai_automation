
import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown } from 'react-icons/fi';

interface DropdownItem {
  label: string;
  onClick?: () => void;
  href?: string;
  divider?: boolean;
}

interface DropdownProps {
  label: string;
  items: DropdownItem[];
  variant?: 'primary' | 'secondary' | 'light';
}

const Dropdown: React.FC<DropdownProps> = ({ label, items, variant = 'primary' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const variants = {
    primary: 'text-white bg-blue-700 hover:bg-blue-800 focus:ring-blue-300',
    secondary: 'text-gray-900 bg-white border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:ring-gray-100',
    light: 'text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 focus:ring-gray-200',
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center justify-between px-5 py-2.5 text-sm font-medium rounded-lg focus:ring-4 focus:outline-none ${variants[variant]}`}
        type="button"
      >
        {label} 
        <FiChevronDown className="w-2.5 h-2.5 ms-3" />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-2 bg-white divide-y divide-gray-100 rounded-lg shadow w-44">
          <ul className="py-2 text-sm text-gray-700">
            {items.map((item, index) => (
              <li key={index}>
                {item.divider ? (
                  <div className="my-1 h-px bg-gray-100" />
                ) : (
                  <a
                    href={item.href || '#'}
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={(e) => {
                      if (item.onClick) {
                        e.preventDefault();
                        item.onClick();
                        setIsOpen(false);
                      }
                    }}
                  >
                    {item.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
