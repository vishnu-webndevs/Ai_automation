"use client";
import React from 'react';
import { useLocation } from 'react-router-dom';
import { Github, Twitter, Linkedin } from 'lucide-react';
import useSWR from 'swr';
import { menuService } from '../services/api';

const Footer: React.FC = () => {
  const location = useLocation();
  const hideCta =
    location.pathname === '/contact-us' ||
    location.pathname === '/' ||
    location.pathname === '/home' ||
    location.pathname.startsWith('/services/');
  
  const { data: footerMenu } = useSWR('menu-footer', () => menuService.getByLocation('footer').catch(() => null));

  // Determine dynamic columns from menu
  const dynamicColumns = footerMenu?.items || [];
  
  return (
    <footer className="relative pt-20 pb-10 overflow-hidden">
      {/* Background glow bottom */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[300px] bg-purple-900/20 blur-[100px] rounded-t-full pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* CTA Section (hidden on Contact page) */}
        {!hideCta && (
          <div className="text-center mb-20">
            <div className="text-purple-400 font-medium mb-2">The security first platform</div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Take control of your business</h2>
            <p className="text-slate-400 max-w-2xl mx-auto mb-10">
              All the lorem ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet.
            </p>
            <button className="px-8 py-3 rounded-full bg-white text-slate-900 font-bold hover:bg-slate-200 transition-colors shadow-lg shadow-purple-500/20">
              Get Started
            </button>
          </div>
        )}

        <div className="border-t border-slate-800 pt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-12 mb-12">
            <div className="col-span-1 lg:col-span-1">
               <a href="/" className="flex items-center gap-2 mb-4">
                  <img src="/totan_logo.png" alt="Totan AI" className="w-[100px] h-auto" />
               </a>
               <p className="text-slate-500 text-sm mb-6">© Totan.ai - All rights reserved.</p>
               <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-purple-600 transition-colors cursor-pointer"><Twitter size={16} /></div>
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-purple-600 transition-colors cursor-pointer"><Github size={16} /></div>
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-purple-600 transition-colors cursor-pointer"><Linkedin size={16} /></div>
               </div>
            </div>

            {/* Dynamic Columns from Admin Panel */}
            {dynamicColumns.map((column) => (
              <div key={column.id}>
                <h4 className="text-white font-semibold mb-6">{column.label}</h4>
                <ul className="space-y-4 text-sm text-slate-400">
                  {column.children?.map((link) => (
                    <li key={link.id}>
                      <a href={link.url} className="hover:text-purple-400 transition-colors" target={link.target}>
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Skeleton Loading */}
            {!footerMenu && [1, 2].map(i => (
              <div key={i}>
                <div className="h-5 w-24 bg-slate-800/50 rounded mb-6 animate-pulse"></div>
                <div className="space-y-4">
                  <div className="h-4 w-32 bg-slate-800/50 rounded animate-pulse"></div>
                  <div className="h-4 w-28 bg-slate-800/50 rounded animate-pulse"></div>
                </div>
              </div>
            ))}

            {/* Contact Column - Always Last */}
            <div>
              <h4 className="text-white font-semibold mb-6">Contact Us</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                <li className="flex flex-col gap-1">
                  <span className="text-slate-500 text-xs uppercase tracking-wider">Email Address</span>
                  <a href="mailto:hello@totan.ai" className="text-white hover:text-purple-400 transition-colors font-medium">
                    hello@totan.ai
                  </a>
                </li>
                <li className="flex flex-col gap-1">
                  <span className="text-slate-500 text-xs uppercase tracking-wider">Support</span>
                  <a href="mailto:support@totan.ai" className="text-white hover:text-purple-400 transition-colors font-medium">
                    support@totan.ai
                  </a>
                </li>
              </ul>
            </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
