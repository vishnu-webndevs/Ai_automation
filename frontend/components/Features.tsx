import React from 'react';
import { Zap } from 'lucide-react';
import { motion } from 'framer-motion';

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
  heading = "Automate your workflows with AI, not more tabs",
  subheading = "Build reliable AI automations that connect tools, reduce manual work, and keep humans in control.",
  items = [
    { title: 'Automate repetitive work', description: '' },
    { title: 'AI in your existing stack', description: '' },
    { title: 'Human in the loop by default', description: '' }
  ],
  layout = 'left'
}) => {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background glow spot */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-purple-900/20 blur-[120px] rounded-full -z-10 pointer-events-none translate-x-1/2" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: layout === 'right' ? 30 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={layout === 'right' ? 'md:order-2' : ''}
          >
            <div className="text-purple-400 font-medium mb-2 uppercase tracking-wider text-xs">The AI automation platform</div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">{heading}</h2>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">{subheading}</p>
            
            <ul className="space-y-4">
              {items.map((item, i) => (
                <motion.li 
                  key={i} 
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.3 }}
                  whileHover={{ x: 6 }}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                    i === 0 
                      ? 'bg-slate-800/60 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)] text-white' 
                      : 'border-white/5 hover:border-white/10 bg-slate-900/40 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {i === 0 ? <Zap className="text-purple-400 shrink-0" size={20} /> : <div className="w-5" />}
                  <span className={`text-sm md:text-base ${i === 0 ? 'font-semibold text-white' : 'font-medium'}`}>{item.title}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95, x: layout === 'right' ? -30 : 30 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`relative ${layout === 'right' ? 'md:order-1' : ''}`}
          >
             <div className="aspect-square rounded-2xl bg-slate-900/60 border border-slate-700/60 p-8 relative overflow-hidden group backdrop-blur-sm shadow-xl">
                {/* Abstract Grid visual */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_70%)]" />
                
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-purple-600/30 rounded-full blur-2xl" 
                />
                
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                >
                   <Zap size={64} className="text-white drop-shadow-[0_0_15px_rgba(168,85,247,0.8)]" />
                </motion.div>
             </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
};

export default Features;

