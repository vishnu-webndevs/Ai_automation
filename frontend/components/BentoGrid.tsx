import React from 'react';

export interface BentoItem {
  title: string;
  description: string;
  colSpan?: number;
  bgGradient?: string;
  bgImage?: string;
  ctaText?: string;
  ctaUrl?: string;
}

export interface BentoGridProps {
  heading?: string;
  subheading?: string;
  items?: BentoItem[];
}

const BentoGrid: React.FC<BentoGridProps> = ({
  heading = "Faster. Smarter.",
  subheading = "There are many variations available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable.",
  items = [
    {
      title: "Optimized for security",
      description: "Optimize for user experience and privacy. Use social login integrations, lower user friction, incorporate rich user profiling.",
      colSpan: 8,
      ctaText: "Learn more",
      ctaUrl: "#"
    },
    {
      title: "Extensibility",
      description: "Your login box must find the right balance between user convenience, privacy and security.",
      colSpan: 4
    }
  ]
}) => {
  return (
    <section className="py-20 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">{heading}</h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            {subheading}
          </p>
        </div>

        <div className="grid md:grid-cols-12 gap-6 mb-32">
            {items.map((item, idx) => (
                <div 
                  key={idx} 
                  className={`md:col-span-12 lg:col-span-${item.colSpan || 4} bg-slate-900/50 border border-slate-800 rounded-3xl p-8 relative overflow-hidden group hover:border-slate-700 transition-colors flex flex-col justify-between`}
                >
                   {/* Optional Background Glow for larger items */}
                   {item.colSpan === 8 && (
                       <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />
                   )}
                   
                   <div className="relative z-10">
                      <h3 className="text-2xl font-bold text-white mb-2">{item.title}</h3>
                      <p className="text-slate-400 mb-6 max-w-md">{item.description}</p>
                      {item.ctaText && (
                          <button className="text-sm font-medium text-purple-400 hover:text-purple-300 flex items-center gap-1">
                              {item.ctaText} <span className="text-xs">→</span>
                          </button>
                      )}
                   </div>

                   {/* Decorative Elements for specific items (could be made dynamic later) */}
                   {item.colSpan === 8 && (
                       <div className="mt-8 flex justify-end">
                          <div className="relative w-full max-w-md h-40">
                             {[
                               {bg: "bg-purple-600", text: "Transactions", top: "0%", left: "10%"},
                               {bg: "bg-blue-600", text: "Auth", top: "20%", left: "60%"},
                               {bg: "bg-pink-600", text: "Secure", top: "60%", left: "30%"},
                               {bg: "bg-indigo-600", text: "Login", top: "50%", left: "80%"},
                             ].map((pill, i) => (
                               <div key={i} className={`absolute px-3 py-1 rounded-full text-xs font-semibold text-white ${pill.bg} shadow-lg animate-float`} style={{top: pill.top, left: pill.left, animationDelay: `${i * 1}s`}}>
                                  {pill.text}
                               </div>
                             ))}
                          </div>
                       </div>
                   )}
                </div>
            ))}
        </div>
      </div>
    </section>
  );
};

export default BentoGrid;
