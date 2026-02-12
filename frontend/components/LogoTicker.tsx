import React from 'react';

export interface LogoTickerProps {
  items?: string[];
}

const LogoTicker: React.FC<LogoTickerProps> = ({
  items = [
    "Facebook", "Tinder", "Airbnb", "Hubspot", "Amazon", "Tesla", "Google"
  ]
}) => {
  return (
    <section className="border-t border-slate-800/50 bg-slate-900/30 py-10 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
          {items.map((logo, idx) => (
             <div key={idx} className="text-xl md:text-2xl font-bold font-serif text-slate-500 select-none">
                {logo}
             </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LogoTicker;