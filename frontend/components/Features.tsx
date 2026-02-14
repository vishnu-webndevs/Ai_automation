import React from 'react';
import { Shield, Zap, Lock, Grid, Share2, Activity, Github, BarChart3, Bell, Search, Globe, Database } from 'lucide-react';

export interface FeatureItem {
  title: string;
  description: string;
  icon?: string;
}

export interface FeaturesProps {
  heading?: string;
  subheading?: string;
  items?: FeatureItem[];
  layout?: 'left' | 'right';
}

const Features: React.FC<FeaturesProps> = ({
  heading = "Simplify your security with authentication services",
  subheading = "Define access roles for the end-users, and extend your authorization capabilities to implement dynamic access control.",
  items = [
    { title: 'Simplify your security', description: '' },
    { title: 'Customer identity', description: '' },
    { title: 'Adaptable authentication', description: '' }
  ],
  layout = 'left'
}) => {
  return (
    <section className="py-20 relative">
      {/* Background glow spot */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-purple-900/20 blur-[120px] rounded-full -z-10 pointer-events-none translate-x-1/2" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Feature 1: Simplify */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className={layout === 'right' ? 'md:order-2' : ''}>
            <div className="text-purple-400 font-medium mb-2">The security first platform</div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{heading}</h2>
            <p className="text-slate-400 text-lg mb-8">{subheading}</p>
            
            <ul className="space-y-4">
              {items.map((item, i) => (
                <li key={i} className={`flex items-center gap-3 p-3 rounded-lg border ${i === 0 ? 'bg-slate-800/50 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'border-transparent hover:bg-slate-800/30'}`}>
                  {i === 0 ? <Zap className="text-purple-400" size={20} /> : <div className="w-5" />}
                  <span className={i === 0 ? 'text-white font-medium' : 'text-slate-500'}>{item.title}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className={`relative ${layout === 'right' ? 'md:order-1' : ''}`}>
             <div className="aspect-square rounded-2xl bg-slate-800/50 border border-slate-700/50 p-8 relative overflow-hidden group">
                {/* Abstract Grid visual */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_70%)]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-purple-600/20 rounded-full blur-xl animate-pulse-slow" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                   <Zap size={64} className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                </div>
             </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Features;