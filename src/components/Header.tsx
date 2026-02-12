import { Menu, Bell, ChevronDown, Search, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const Header = (props: HeaderProps) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 flex w-full bg-white/80 backdrop-blur-md border-b border-slate-200 drop-shadow-sm dark:bg-boxdark dark:border-strokedark dark:drop-shadow-none transition-colors duration-300">
      <div className="flex flex-grow items-center justify-between px-4 py-3 shadow-none md:px-6 2xl:px-11">
        <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
          {/* Hamburger Toggle BTN */}
          <button
            aria-controls="sidebar"
            onClick={(e) => {
              e.stopPropagation();
              props.setSidebarOpen(!props.sidebarOpen);
            }}
            className="z-50 block rounded-lg border border-slate-200 bg-white p-2 shadow-sm dark:border-strokedark dark:bg-boxdark lg:hidden text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <div className="hidden sm:block flex-grow max-w-xl">
          <div className="relative">
            <button className="absolute left-3 top-1/2 -translate-y-1/2">
              <Search className="h-5 w-5 text-slate-400" />
            </button>
            <input
              type="text"
              placeholder="Search anything..."
              className="w-full bg-slate-100 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all text-slate-600 placeholder:text-slate-400 dark:bg-meta-4 dark:text-white"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <span className="hidden md:inline-flex items-center justify-center h-5 px-1.5 text-[10px] font-medium text-slate-400 border border-slate-200 rounded bg-white">
                    ⌘ K
                </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 2xsm:gap-7">
          <ul className="flex items-center gap-2 2xsm:gap-4">
            {/* Notification Menu Area */}
            <li className="relative">
              <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-200 dark:bg-meta-4 dark:text-white">
                <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white dark:border-meta-4"></span>
                <Bell className="h-5 w-5 text-slate-500 hover:text-indigo-600 transition-colors" />
              </button>
            </li>
          </ul>

          {/* User Area */}
          <div className="relative">
            <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 hover:bg-slate-50 p-1.5 pr-3 rounded-full transition-colors duration-200"
            >
              <span className="hidden text-right lg:block">
                <span className="block text-sm font-semibold text-slate-700 dark:text-white">
                  {user?.name || 'Admin'}
                </span>
                <span className="block text-xs text-slate-500 font-medium">{user?.role || 'Super Admin'}</span>
              </span>

              <div className="h-10 w-10 rounded-full overflow-hidden shadow-sm ring-2 ring-white dark:ring-boxdark">
                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                    {user?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
              </div>
              <ChevronDown className={`hidden sm:block h-4 w-4 text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Start */}
            {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-64 rounded-xl border border-slate-100 bg-white py-3 shadow-xl dark:border-strokedark dark:bg-boxdark z-50">
                    <div className="px-4 py-3 border-b border-slate-100 mb-2">
                        <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    </div>
                    <ul className="flex flex-col gap-1 px-2">
                        <li>
                            <Link
                                to="/web-admin/profile"
                                className="flex items-center gap-3.5 px-4 py-2 text-sm font-medium text-slate-600 duration-300 ease-in-out hover:bg-slate-50 hover:text-indigo-600 rounded-lg"
                            >
                                <User className="h-4.5 w-4.5" />
                                My Profile
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/web-admin/settings"
                                className="flex items-center gap-3.5 px-4 py-2 text-sm font-medium text-slate-600 duration-300 ease-in-out hover:bg-slate-50 hover:text-indigo-600 rounded-lg"
                            >
                                <Settings className="h-4.5 w-4.5" />
                                Account Settings
                            </Link>
                        </li>
                    </ul>
                    <div className="mt-2 border-t border-slate-100 pt-2 px-2">
                        <button
                            onClick={logout}
                            className="flex w-full items-center gap-3.5 px-4 py-2 text-sm font-medium text-red-600 duration-300 ease-in-out hover:bg-red-50 rounded-lg"
                        >
                            <LogOut className="h-4.5 w-4.5" />
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
            {/* Dropdown End */}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
