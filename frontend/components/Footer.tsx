"use client";
import React from 'react';
import { Github, Twitter, Linkedin, Mail, Phone } from 'lucide-react';
import useSWR from 'swr';
import { menuService } from '../services/api';

const Footer: React.FC = () => {
  const { data: footerMenu } = useSWR('menu-footer', () => menuService.getByLocation('footer').catch(() => null));

  return (
    <footer className="relative pt-16 pb-12 overflow-hidden border-t border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top Navigation */}
        {footerMenu?.items && (
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-16">
            {footerMenu.items.map((item) => (
              <a key={item.id} href={item.url} target={item.target} className="text-slate-300 hover:text-white font-medium transition-colors">
                {item.label}
              </a>
            ))}
          </nav>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            {/* Left Column: Logo, Description, Socials */}
            <div className="md:col-span-7 lg:col-span-8">
               <a href="/" className="flex items-center gap-2 mb-6">
                  <img src="/totan_logo.png" alt="Totan AI" className="w-[100px] h-auto" />
               </a>
               <p className="text-slate-400 text-base leading-relaxed mb-8 max-w-md">
                 We specialize in the creation of custom AI solutions tailored to the specific needs of our clients around the world. Our team is dedicated to delivering the highest quality automation pipelines.
               </p>
               <div className="flex gap-3">
                  <a href="#" className="w-9 h-9 rounded-full bg-slate-800/80 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-purple-500 hover:bg-purple-500/10 transition-all"><Twitter size={16} /></a>
                  <a href="#" className="w-9 h-9 rounded-full bg-slate-800/80 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-purple-500 hover:bg-purple-500/10 transition-all"><Github size={16} /></a>
                  <a href="#" className="w-9 h-9 rounded-full bg-slate-800/80 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-purple-500 hover:bg-purple-500/10 transition-all"><Linkedin size={16} /></a>
               </div>
            </div>

            {/* Right Column: Contact Info */}
            <div className="md:col-span-5 lg:col-span-4">
              <h4 className="text-white font-bold text-lg mb-6 tracking-tight">Contact Info</h4>
              <ul className="space-y-5">
                <li className="flex items-center gap-4">
                  <Phone size={18} className="text-purple-400 flex-shrink-0" />
                  <div className="flex flex-col gap-1">
                    <a href="tel:+17627603015" className="text-slate-400 hover:text-white transition-colors text-base">+1 (762) 760-3015</a>
                    <a href="tel:+919887603015" className="text-slate-400 hover:text-white transition-colors text-base">+91-9887603015</a>
                  </div>
                </li>
                <li className="flex items-center gap-4">
                  <Mail size={18} className="text-purple-400 flex-shrink-0" />
                  <a href="mailto:hello@totan.ai" className="text-slate-400 hover:text-white transition-colors text-base break-all">
                    hello@totan.ai
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
