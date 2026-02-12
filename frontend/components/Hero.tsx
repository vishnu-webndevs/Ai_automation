import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface HeroProps {
  badge?: string;
  heading?: string;
  subheading?: string;
  primary_cta?: { text: string; url: string };
  secondary_cta?: { text: string; url: string };
}

const Hero: React.FC<HeroProps> = ({ 
  badge = "API Studio is now in beta",
  heading = "The API Security Framework",
  subheading = "Our landing page template works on all devices, so you only have to set it up once, and get beautiful results forever.",
  primary_cta = { text: "Get Started", url: "/signup" },
  secondary_cta = { text: "Read the docs", url: "/docs" }
}) => {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 blur-[100px] rounded-full -z-10 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center relative z-10">
        
        {/* Badge */}
        {badge && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 backdrop-blur-sm mb-8 animate-fade-in-up">
            <span className="text-xs font-semibold text-purple-400">{badge}</span>
            <ChevronRight size={12} className="text-slate-500" />
          </div>
        )}

        {/* Heading */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 mb-6 drop-shadow-sm">
          {heading}
        </h1>

        {/* Subtitle */}
        <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
          {subheading}
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {primary_cta && (
            <Link to={primary_cta.url} className="w-full sm:w-auto px-8 py-3 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all hover:scale-105 flex items-center justify-center">
              {primary_cta.text} <span className="ml-1">→</span>
            </Link>
          )}
          {secondary_cta && (
            <Link to={secondary_cta.url} className="w-full sm:w-auto px-8 py-3 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium transition-all flex items-center justify-center gap-2 hover:border-slate-600">
               <span>{secondary_cta.text}</span>
            </Link>
          )}
        </div>
        
      </div>
    </section>
  );
};

export default Hero;