import React from 'react';
import { ChevronRight, Calendar, User, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface HeroProps {
  badge?: string;
  heading?: string;
  subheading?: string;
  primary_cta?: { text: string; url: string };
  secondary_cta?: { text: string; url: string };
  image?: string;
  layout?: 'center' | 'left' | 'right' | 'top';
  meta?: {
    date?: string;
    categories?: string[];
    author?: string;
  };
}

const Hero: React.FC<HeroProps> = ({ 
  badge = "API Studio is now in beta",
  heading = "The API Security Framework",
  subheading = "Our landing page template works on all devices, so you only have to set it up once, and get beautiful results forever.",
  primary_cta = { text: "Get Started", url: "/signup" },
  secondary_cta = { text: "Read the docs", url: "/docs" },
  image,
  layout = 'center',
  meta
}) => {
  
  const renderContent = () => (
    <div className={`flex flex-col ${layout === 'center' ? 'items-center text-center' : 'items-start text-left'} gap-6`}>
      {/* Badge */}
      {badge && (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 backdrop-blur-sm animate-fade-in-up">
          <span className="text-xs font-semibold text-purple-400">{badge}</span>
          <ChevronRight size={12} className="text-slate-500" />
        </div>
      )}

      {/* Meta (Date, Categories) - Only show if provided */}
      {meta && (
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
          {meta.date && (
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{meta.date}</span>
            </div>
          )}
          {meta.author && (
            <div className="flex items-center gap-1">
              <User size={14} />
              <span>{meta.author}</span>
            </div>
          )}
          {meta.categories && meta.categories.length > 0 && (
            <div className="flex items-center gap-1">
              <Tag size={14} />
              <span className="text-purple-400">{meta.categories.join(', ')}</span>
            </div>
          )}
        </div>
      )}

      {/* Heading */}
      <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 drop-shadow-sm leading-tight">
        {heading}
      </h1>

      {/* Subtitle */}
      <p className="text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed">
        {subheading}
      </p>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
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
  );

  const renderImage = () => (
    image ? (
      <div className="relative w-full h-full min-h-[300px] rounded-2xl overflow-hidden shadow-2xl border border-slate-800 group">
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-blue-500/10 group-hover:opacity-75 transition-opacity" />
        <img 
          src={image} 
          alt={heading} 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
        />
      </div>
    ) : null
  );

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 blur-[100px] rounded-full -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {layout === 'center' && (
          <div className="flex flex-col items-center text-center">
            {renderContent()}
            {image && (
              <div className="mt-16 w-full max-w-4xl mx-auto">
                {renderImage()}
              </div>
            )}
          </div>
        )}

        {layout === 'top' && (
          <div className="flex flex-col gap-12">
            {image && (
               <div className="w-full max-w-5xl mx-auto h-[400px] md:h-[500px]">
                 {renderImage()}
               </div>
            )}
            <div className="max-w-4xl mx-auto text-center">
               {renderContent()}
            </div>
          </div>
        )}

        {layout === 'left' && (
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
               {renderImage()}
            </div>
            <div className="order-1 lg:order-2">
               {renderContent()}
            </div>
          </div>
        )}

        {layout === 'right' && (
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
               {renderContent()}
            </div>
            <div>
               {renderImage()}
            </div>
          </div>
        )}
        
      </div>
    </section>
  );
};

export default Hero;
