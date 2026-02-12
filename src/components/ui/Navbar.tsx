
import React from 'react';
import { Link } from 'react-router-dom';

interface NavbarProps {
  brand?: React.ReactNode;
  children: React.ReactNode;
  variant?: 'light' | 'dark';
}

const Navbar: React.FC<NavbarProps> = ({ brand, children, variant = 'light' }) => {
  const bgClass = variant === 'light' ? 'bg-white border-b border-gray-200' : 'bg-gray-900 text-white';
  
  return (
    <nav className={`${bgClass} px-4 py-3 rounded-lg mb-4`}>
      <div className="container mx-auto flex flex-wrap items-center justify-between">
        <Link to="/" className="flex items-center text-xl font-semibold">
          {brand || 'Brand'}
        </Link>
        <div className="hidden w-full md:block md:w-auto">
           {children}
        </div>
      </div>
    </nav>
  );
};

export const Nav: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => {
    return (
        <ul className={`flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 ${className}`}>
            {children}
        </ul>
    );
};

export const NavItem: React.FC<{ children: React.ReactNode, active?: boolean, href?: string }> = ({ children, active, href = '#' }) => {
    return (
        <li>
            <Link to={href} className={`block py-2 px-3 rounded md:p-0 ${active ? 'text-blue-700' : 'text-gray-900 hover:text-blue-700'}`}>
                {children}
            </Link>
        </li>
    );
};

export default Navbar;
