import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Sparkles, 
  Globe,
  TrendingUp,
  CloudRain,
  Activity,
  Tags, 
  Briefcase, 
  Target, 
  BookOpen, 
  List, 
  Hash, 
  Link2, 
  GitMerge, 
  Code, 
  Map, 
  FileClock, 
  MousePointer, 
  Menu as MenuIcon, 
  Image, 
  Lock, 
  Palette, 
  ChevronDown, 
  // ChevronRight,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface MenuItem {
  title: string;
  path?: string;
  icon: any;
  permission?: string;
  submenu?: MenuItem[];
}

interface SidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (arg: boolean) => void;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const location = useLocation();
  const { hasPermission } = useAuth();

  const toggleSubmenu = (title: string) => {
    setExpandedMenus(prev => 
      prev.includes(title) 
        ? prev.filter(t => t !== title) 
        : [...prev, title]
    );
  };

  const menuItems: MenuItem[] = [
    { title: 'Dashboard', path: '/web-admin', icon: LayoutDashboard },
    { title: 'Pages', path: '/web-admin/pages', icon: FileText, permission: 'manage_pages' },
    { title: 'AI Generator', path: '/web-admin/ai-generator', icon: Sparkles, permission: 'generate_ai' },
    {
        title: 'Live Verticals',
        icon: Globe,
        submenu: [
            { title: 'Fintech (Crypto)', path: '/web-admin/verticals/fintech', icon: TrendingUp },
            { title: 'Agri-Tech (Weather)', path: '/web-admin/verticals/agritech', icon: CloudRain },
            { title: 'System Status', path: '/web-admin/verticals/status', icon: Activity },
        ]
    },
    { 
      title: 'Taxonomy', 
      icon: Tags, 
      permission: 'manage_taxonomy',
      submenu: [
        { title: 'Services', path: '/web-admin/taxonomy/services', icon: Briefcase },
        { title: 'Industries', path: '/web-admin/taxonomy/industries', icon: Briefcase },
        { title: 'Use Cases', path: '/web-admin/taxonomy/use-cases', icon: Target },
      ]
    },
    {
      title: 'Blog',
      icon: BookOpen,
      permission: 'manage_blog',
      submenu: [
        { title: 'Posts', path: '/web-admin/blog/posts', icon: FileText },
        { title: 'Categories', path: '/web-admin/blog/categories', icon: List },
        { title: 'Tags', path: '/web-admin/blog/tags', icon: Hash },
      ]
    },
    {
      title: 'SEO',
      icon: SearchIcon,
      permission: 'manage_seo',
      submenu: [
        { title: 'Internal Links', path: '/web-admin/seo/internal-links', icon: Link2 },
        { title: 'Redirects', path: '/web-admin/seo/redirects', icon: GitMerge },
        { title: 'Schema', path: '/web-admin/seo/schema', icon: Code },
        { title: 'Sitemap', path: '/web-admin/seo/sitemap', icon: Map },
        { title: 'Audit Logs', path: '/web-admin/audit-logs', icon: FileClock },
      ]
    },
    {
      title: 'Components',
      icon: Palette,
      submenu: [
        { title: 'UI Kit', path: '/web-admin/ui-kit', icon: Palette },
        { title: 'Icons', path: '/web-admin/icons', icon: Image },
        { title: 'Style Guide', path: '/web-admin/style-guide', icon: BookOpen },
      ]
    },
    {
      title: 'System',
      icon: Lock,
      submenu: [
        { title: 'Media Library', path: '/web-admin/media', icon: Image },
        { title: 'Menus', path: '/web-admin/menus', icon: MenuIcon },
        { title: 'CTAs', path: '/web-admin/ctas', icon: MousePointer },
        { title: 'Authentication', path: '/authentication', icon: Lock },
      ]
    },
  ];

  // Helper for Search Icon
  function SearchIcon(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    );
  }

  return (
    <aside
      className={`absolute left-0 top-0 z-50 flex h-screen w-72.5 flex-col overflow-y-hidden bg-slate-900 duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* <!-- SIDEBAR HEADER --> */}
      <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5 bg-slate-950">
        <Link to="/web-admin" className="flex items-center gap-3">
            <img src="/totan_ai_logo.png" alt="Totan.ai Logo" className="w-[120px] h-auto" />
        </Link>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="block lg:hidden text-slate-400 hover:text-white"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      {/* <!-- SIDEBAR HEADER --> */}

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        {/* <!-- Sidebar Menu --> */}
        <nav className="mt-5 px-4 py-4 lg:mt-9 lg:px-6">
            <div className="mb-6">
                <h3 className="mb-4 ml-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    MENU
                </h3>

                <ul className="mb-6 flex flex-col gap-1.5">
                    {menuItems.map((item, index) => {
                        // Check permission
                        if (item.permission && !hasPermission(item.permission)) {
                            return null;
                        }

                        const Icon = item.icon;
                        // Fix: Dashboard (/web-admin) should only be active on exact match, otherwise it highlights for all sub-pages
                        const isActive = item.path 
                            ? location.pathname === item.path || (item.path !== '/web-admin' && location.pathname.startsWith(item.path + '/'))
                            : false;
                        const isExpanded = expandedMenus.includes(item.title);
                        const hasSubmenu = item.submenu && item.submenu.length > 0;

                        return (
                            <li key={index}>
                                {hasSubmenu ? (
                                    <>
                                        <button
                                            className={`group relative flex w-full items-center justify-between gap-2.5 rounded-lg px-4 py-2.5 font-medium text-slate-300 duration-300 ease-in-out hover:bg-slate-800 hover:text-white ${
                                                isExpanded || isActive ? 'bg-slate-800 text-white' : ''
                                            }`}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                toggleSubmenu(item.title);
                                            }}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <Icon className="h-5 w-5" />
                                                {item.title}
                                            </div>
                                            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                        </button>
                                        
                                        <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[500px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                                            <ul className="mb-5.5 mt-2 flex flex-col gap-2.5 pl-6 border-l border-slate-800 ml-6">
                                                {item.submenu?.map((subItem, subIndex) => (
                                                    <li key={subIndex}>
                                                        <Link
                                                            to={subItem.path || '#'}
                                                            className={`group relative flex items-center gap-2.5 rounded-md px-4 py-2 text-sm font-medium text-slate-400 duration-300 ease-in-out hover:text-white ${
                                                                location.pathname === subItem.path ? 'text-white font-semibold' : ''
                                                            }`}
                                                        >
                                                            <span className={`h-1.5 w-1.5 rounded-full bg-current ${location.pathname === subItem.path ? 'bg-indigo-500' : 'bg-slate-600 group-hover:bg-slate-400'}`}></span>
                                                            {subItem.title}
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </>
                                ) : (
                                    <Link
                                        to={item.path || '#'}
                                        className={`group relative flex items-center gap-2.5 rounded-lg px-4 py-2.5 font-medium text-slate-300 duration-300 ease-in-out hover:bg-slate-800 hover:text-white ${
                                            isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : ''
                                        }`}
                                    >
                                        <Icon className="h-5 w-5" />
                                        {item.title}
                                    </Link>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </div>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
