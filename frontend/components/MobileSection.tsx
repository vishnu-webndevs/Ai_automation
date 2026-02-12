import React from 'react';

export interface MobileSectionProps {
  heading?: string;
  subheading?: string;
  description?: string;
}

const MobileSection: React.FC<MobileSectionProps> = ({
  heading = "Spot issues faster",
  subheading = "The security first platform",
  description = "All the lorem ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet."
}) => {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
        <div className="text-purple-400 font-medium mb-2">{subheading}</div>
        <h2 className="text-4xl font-bold text-white mb-6">{heading}</h2>
        <p className="text-slate-400 max-w-2xl mx-auto mb-16">
           {description}
        </p>
        
        {/* Mobile Mockup Area */}
        <div className="relative mx-auto w-full max-w-[300px] h-[600px] bg-slate-900 rounded-[3rem] border-8 border-slate-800 shadow-2xl flex flex-col overflow-hidden">
           {/* Inner Screen */}
           <div className="flex-1 bg-slate-950 p-6 relative">
              {/* Glow behind phone */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-purple-500/20 blur-2xl pointer-events-none" />
              
              <div className="relative z-10 flex flex-col items-center justify-center h-full gap-4">
                 <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4">
                    ⚡
                 </div>
                 <h4 className="text-white font-semibold text-lg">Welcome Back!</h4>
                 
                 <div className="w-full space-y-3">
                    <input type="text" placeholder="hello@cruip.com" className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500" disabled />
                    <input type="password" placeholder="••••••••" className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500" disabled />
                    <button className="w-full bg-white text-slate-900 font-semibold py-2 rounded-lg text-sm mt-2">Continue →</button>
                 </div>
                 
                 <div className="text-xs text-slate-500 mt-4">or login with</div>
                 <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 text-xs">Tw</div>
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 text-xs">Gi</div>
                 </div>
              </div>
           </div>
        </div>

        {/* Floating Icons around phone (Simulated) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none hidden md:block">
           <div className="absolute top-[20%] left-[20%] w-10 h-10 bg-slate-800 rounded-lg border border-slate-700 flex items-center justify-center shadow-lg animate-float" style={{animationDelay: '0.5s'}}>🔴</div>
           <div className="absolute top-[30%] right-[25%] w-12 h-12 bg-slate-800 rounded-lg border border-slate-700 flex items-center justify-center shadow-lg animate-float" style={{animationDelay: '1.2s'}}>⚙️</div>
           <div className="absolute bottom-[25%] left-[25%] w-8 h-8 bg-slate-800 rounded-lg border border-slate-700 flex items-center justify-center shadow-lg animate-float" style={{animationDelay: '2.5s'}}>🔒</div>
           <div className="absolute bottom-[30%] right-[20%] w-14 h-14 bg-slate-800 rounded-lg border border-slate-700 flex items-center justify-center shadow-lg animate-float" style={{animationDelay: '1.8s'}}>📊</div>
        </div>

      </div>
    </section>
  );
};

export default MobileSection;