import React from 'react';
import { Github, Twitter, Linkedin } from 'lucide-react';
import useSWR from 'swr';
import { menuService } from '../services/api';

const Footer: React.FC = () => {
  const { data: menuData } = useSWR('menu-footer-primary', () => menuService.getByLocation('footer-primary').catch(() => null));

  return (
    <footer className="relative pt-20 pb-10 overflow-hidden">
      {/* Background glow bottom */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[300px] bg-purple-900/20 blur-[100px] rounded-t-full pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* CTA Section */}
        <div className="text-center mb-20">
           <div className="text-purple-400 font-medium mb-2">The security first platform</div>
           <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Take control of your business</h2>
           <p className="text-slate-400 max-w-2xl mx-auto mb-10">All the lorem ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet.</p>
           <button className="px-8 py-3 rounded-full bg-white text-slate-900 font-bold hover:bg-slate-200 transition-colors shadow-lg shadow-purple-500/20">
              Get Started
           </button>
        </div>

        <div className="border-t border-slate-800 pt-12 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 lg:col-span-1">
               <a href="#" className="flex items-center gap-2 mb-4">
                  <img src="/totan_ai_logo.png" alt="Totan AI" className="w-[120px] h-auto" />
               </a>
               <p className="text-slate-500 text-sm">© Totan.ai - All rights reserved.</p>
            </div>

            {/* Dynamic Footer Menu */}
            {menuData?.items && menuData.items.some(item => item.children && item.children.length > 0) ? (
               // Hierarchical Menu (Columns)
               menuData.items.map((column) => (
                  <div key={column.id}>
                     <h4 className="text-white font-semibold mb-4">{column.label}</h4>
                     <ul className="space-y-2 text-sm text-slate-400">
                        {column.children?.map((link) => (
                           <li key={link.id}>
                               <a href={link.url} className="hover:text-purple-400" target={link.target}>
                                   {link.label}
                               </a>
                           </li>
                        ))}
                     </ul>
                  </div>
               ))
            ) : (
               // Flat Menu (Fallback to single column or grid)
               <div className="col-span-2 md:col-span-3 lg:col-span-4">
                  <h4 className="text-white font-semibold mb-4">Quick Links</h4>
                  <ul className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-2 text-sm text-slate-400">
                     {menuData?.items?.map((link) => (
                        <li key={link.id}>
                            <a href={link.url} className="hover:text-purple-400" target={link.target}>
                                {link.label}
                            </a>
                        </li>
                     ))}
                  </ul>
               </div>
            )}
            
            {!menuData && (
               <>
                  <div>
                    <div className="h-5 w-24 bg-slate-800/50 rounded mb-4 animate-pulse"></div>
                    <div className="space-y-2">
                        <div className="h-4 w-20 bg-slate-800/50 rounded animate-pulse"></div>
                        <div className="h-4 w-20 bg-slate-800/50 rounded animate-pulse"></div>
                    </div>
                  </div>
                  <div>
                    <div className="h-5 w-24 bg-slate-800/50 rounded mb-4 animate-pulse"></div>
                    <div className="space-y-2">
                        <div className="h-4 w-20 bg-slate-800/50 rounded animate-pulse"></div>
                    </div>
                  </div>
               </>
            )}

        </div>
        
        <div className="flex gap-4 mb-4">
             <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-purple-600 transition-colors cursor-pointer"><Twitter size={16} /></div>
             <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-purple-600 transition-colors cursor-pointer"><Github size={16} /></div>
             <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-purple-600 transition-colors cursor-pointer"><Linkedin size={16} /></div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;