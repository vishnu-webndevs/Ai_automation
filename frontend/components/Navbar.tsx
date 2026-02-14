import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu as MenuIcon, X, ChevronDown } from 'lucide-react';
import useSWR from 'swr';
import { menuService } from '../services/api';
import { MenuItem } from '../types';

const DesktopMenuItem = ({ item }: { item: MenuItem }) => {
    const location = useLocation();
    const hasChildren = item.children && item.children.length > 0;
    const isActive = (path: string) => location.pathname === path;
    const linkClass = (path: string) => 
        `text-sm font-medium transition-colors ${isActive(path) ? 'text-white' : 'text-slate-300 hover:text-white'}`;

    if (hasChildren) {
        return (
            <div className="relative group">
                <button className={`flex items-center gap-1 ${linkClass(item.url)} group-hover:text-white outline-none`}>
                    {item.label}
                    <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-200" />
                </button>
                
                {/* Dropdown */}
                <div className="absolute left-0 top-full pt-4 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left z-50">
                    <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/50 rounded-xl shadow-2xl p-2 flex flex-col gap-1 overflow-hidden">
                        {item.children!.map(child => (
                             <Link 
                                key={child.id} 
                                to={child.url} 
                                className="block px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors" 
                                target={child.target}
                             >
                                {child.label}
                             </Link>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Link to={item.url} className={linkClass(item.url)} target={item.target}>
            {item.label}
        </Link>
    );
};

const MobileMenuItem = ({ item, closeMenu }: { item: MenuItem, closeMenu: () => void }) => {
    const hasChildren = item.children && item.children.length > 0;
    const [isOpen, setIsOpen] = useState(false);

    if (hasChildren) {
        return (
            <div className="flex flex-col w-full">
                <button 
                    onClick={() => setIsOpen(!isOpen)} 
                    className="flex items-center justify-between text-slate-300 hover:text-white py-3 px-4 w-full text-left"
                >
                    <span>{item.label}</span>
                    <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isOpen && (
                    <div className="bg-white/5 rounded-lg mx-4 mb-2 overflow-hidden flex flex-col">
                        {item.children!.map(child => (
                            <Link 
                                key={child.id} 
                                to={child.url} 
                                onClick={closeMenu} 
                                className="text-slate-400 hover:text-white text-sm py-2.5 px-4 block hover:bg-white/5 transition-colors text-left"
                            >
                                {child.label}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        );
    }
    
    return (
        <Link 
            to={item.url} 
            onClick={closeMenu} 
            className="text-slate-300 hover:text-white py-3 px-4 block w-full text-left" 
            target={item.target}
        >
            {item.label}
        </Link>
    );
};

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const { data: menuData } = useSWR('menu-header-main', () => menuService.getByLocation('header-main').catch(() => null));

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const isActive = (path: string) => location.pathname === path;
  const linkClass = (path: string) => 
    `text-sm font-medium transition-colors ${isActive(path) ? 'text-white' : 'text-slate-300 hover:text-white'}`;

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-slate-900/80 backdrop-blur-md border-b border-white/10' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div className="shrink-0 mr-4">
            <Link to="/" className="flex items-center gap-2 group">
              <img src="/totan_logo.png" alt="Totan AI" className="w-[80px] h-auto group-hover:scale-110 transition-transform" />
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex grow justify-end items-center gap-8">
            {menuData?.items?.map((item) => (
               <DesktopMenuItem key={item.id} item={item} />
            ))}
            {!menuData && (
                <>
                    {/* Fallback while loading or if error */}
                    <div className="h-4 w-16 bg-slate-800/50 rounded animate-pulse"></div>
                    <div className="h-4 w-16 bg-slate-800/50 rounded animate-pulse"></div>
                    <div className="h-4 w-16 bg-slate-800/50 rounded animate-pulse"></div>
                </>
            )}
            
            <div className="flex items-center gap-4 ml-4">
              <Link to="/signin" className={linkClass('/signin')}>Sign in</Link>
              <Link to="/signup" className="text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full transition-colors shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                Sign up <span className="ml-1 text-purple-200">→</span>
              </Link>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-300 hover:text-white p-2">
              {mobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-white/10 absolute w-full top-20 left-0 animate-in slide-in-from-top-5 shadow-2xl max-h-[calc(100vh-80px)] overflow-y-auto">
           <nav className="flex flex-col py-4">
            {menuData?.items?.map((item) => (
               <MobileMenuItem key={item.id} item={item} closeMenu={() => setMobileMenuOpen(false)} />
            ))}
            <div className="border-t border-white/10 mt-2 pt-4 flex flex-col gap-4 px-4 pb-4">
               <Link to="/signin" className="text-slate-300 hover:text-white text-center py-2">Sign in</Link>
               <Link to="/signup" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-full w-full text-center">Sign up</Link>
            </div>
           </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
