import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import useSWR from 'swr';
import { menuService } from '../services/api';

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
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform">
                T
              </div>
              <span className="font-semibold text-lg tracking-tight text-white hidden sm:block">Totan AI</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex grow justify-end items-center gap-8">
            {menuData?.items?.map((item) => (
               <Link key={item.id} to={item.url} className={linkClass(item.url)} target={item.target}>
                 {item.label}
               </Link>
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
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-white/10 px-4 pt-2 pb-6 absolute w-full top-20 left-0 animate-in slide-in-from-top-5 shadow-2xl">
           <nav className="flex flex-col gap-4 text-center">
            {menuData?.items?.map((item) => (
               <Link key={item.id} to={item.url} className="text-slate-300 hover:text-white py-2" target={item.target}>
                 {item.label}
               </Link>
            ))}
            <div className="border-t border-white/10 pt-4 flex flex-col gap-4">
               <Link to="/signin" className="text-slate-300 hover:text-white">Sign in</Link>
               <Link to="/signup" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full w-full inline-block">Sign up</Link>
            </div>
           </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
