"use client";
import React from "react";
import { useLocation } from "react-router-dom";
import { Github, Twitter, Linkedin, Mail, Phone, MapPin, Facebook, Instagram } from "lucide-react";
import useSWR from "swr";
import { menuService } from "../services/api";

const Footer: React.FC = () => {
  const location = useLocation();
  const hideCta =
    location.pathname === "/contact-us" ||
    location.pathname === "/" ||
    location.pathname === "/home" ||
    location.pathname.startsWith("/services/");

  const { data: footerMenu } = useSWR("menu-footer", () =>
    menuService.getByLocation("footer").catch(() => null)
  );

  // Determine dynamic columns from menu
  const dynamicColumns = footerMenu?.items || [];

  return (
    <footer className="relative pt-24 pb-12 overflow-hidden border-t border-slate-800/50">
      {/* Background glow bottom */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[300px] bg-purple-900/10 blur-[120px] rounded-t-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* CTA Section (hidden on specific pages) */}
        {!hideCta && (
          <div className="text-center mb-24">
            <div className="text-purple-400 font-medium mb-3 tracking-wider uppercase text-sm">
              The security first platform
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Take control of your business
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto mb-10 text-lg leading-relaxed">
              Empower your enterprise with AI-driven automation that scales with
              your growth.
            </p>
            <button className="px-10 py-4 rounded-full bg-white text-slate-950 font-bold hover:bg-slate-100 transition-all shadow-xl shadow-purple-500/10 hover:scale-105 active:scale-95">
              Get Started Now
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-20">
          {/* Column 1: Logo & Description */}
          <div className="lg:col-span-4">
            <a href="/" className="flex items-center gap-2 mb-6">
              <img
                src="/totan_logo.png"
                alt="Totan AI"
                className="w-[120px] h-auto"
              />
            </a>
            <p className="text-slate-400 text-base leading-relaxed mb-8 max-w-sm">
              We specialize in the creation of custom AI solutions tailored to
              the specific needs of our clients around the world. Our team is
              dedicated to delivering the highest quality automation pipelines.
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/people/TotanAI/61588253724105/"
                target="_blank"
                rel="noopener noreferrer"
                title="Facebook"
                aria-label="Visit Facebook Page"
                className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-purple-500 hover:bg-purple-500/10 transition-all"
              >
                <Facebook size={18} />
              </a>
              <a
                href="https://www.instagram.com/totan_ai/"
                target="_blank"
                rel="noopener noreferrer"
                title="Instagram"
                aria-label="Visit Instagram Profile"
                className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-purple-500 hover:bg-purple-500/10 transition-all"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://www.linkedin.com/company/totan-ai/"
                target="_blank"
                rel="noopener noreferrer"
                title="LinkedIn"
                aria-label="Visit LinkedIn Page"
                className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-purple-500 hover:bg-purple-500/10 transition-all"
              >
                <Linkedin size={18} />
              </a>
              <a
                href="#"
                title="Twitter"
                aria-label="Visit Twitter Page"
                className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-purple-500 hover:bg-purple-500/10 transition-all"
              >
                <Twitter size={18} />
              </a>
              <a
                href="#"
                title="GitHub"
                aria-label="Visit GitHub Page"
                className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-purple-500 hover:bg-purple-500/10 transition-all"
              >
                <Github size={18} />
              </a>
            </div>
          </div>

          {/* Dynamic Columns from Admin Panel */}
          {dynamicColumns.map((column) => (
            <div key={column.id} className="lg:col-span-4">
              <h4 className="text-white font-bold text-lg mb-8 tracking-tight">
                {column.label}
              </h4>
              <ul className="space-y-4">
                {column.children?.map((link) => (
                  <li key={link.id}>
                    <a
                      href={link.url}
                      className="text-slate-400 hover:text-purple-400 transition-colors text-base inline-block"
                      target={link.target}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Skeleton Loading */}
          {!footerMenu &&
            [1, 2].map((i) => (
              <div key={i} className="lg:col-span-4">
                <div className="h-6 w-24 bg-slate-800/50 rounded mb-8 animate-pulse"></div>
                <div className="space-y-4">
                  <div className="h-4 w-32 bg-slate-800/50 rounded animate-pulse"></div>
                  <div className="h-4 w-28 bg-slate-800/50 rounded animate-pulse"></div>
                  <div className="h-4 w-36 bg-slate-800/50 rounded animate-pulse"></div>
                </div>
              </div>
            ))}

          {/* Contact Info Column - Always Last */}
          <div className="lg:col-span-4 xl:col-span-4">
            <h4 className="text-white font-bold text-lg mb-8 tracking-tight">
              Contact Info
            </h4>
            <ul className="space-y-6">
              <li className="flex items-start gap-3">
                <Phone size={18} className="text-purple-500 mt-1 flex-shrink-0" />
                <div className="flex flex-col gap-1">
                  <a
                    href="tel:+17627603015"
                    className="text-slate-400 hover:text-white transition-colors text-base"
                  >
                    +1 (762) 760-3015
                  </a>
                  <a
                    href="tel:+919887603015"
                    className="text-slate-400 hover:text-white transition-colors text-base"
                  >
                    +91-9887603015
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={18} className="text-purple-500 mt-1 flex-shrink-0" />
                <a
                  href="mailto:support@totan.ai"
                  className="text-slate-400 hover:text-white transition-colors text-base break-all"
                >
                  support@totan.ai
                </a>
              </li>
             
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-10 border-t border-slate-800/50 flex flex-col md:flex-row justify-center items-center gap-4 text-center">
          <p className="text-slate-500 text-sm font-medium">
            © {new Date().getFullYear()} Totan AI Automation Solutions. All
            rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
