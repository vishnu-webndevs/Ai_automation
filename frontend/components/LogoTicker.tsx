import React from 'react';
import { motion } from 'framer-motion';

export interface LogoTickerProps {
  items?: string[];
}

const LogoTicker: React.FC<LogoTickerProps> = ({
  items = [
    "Facebook", "Tinder", "Airbnb", "Hubspot", "Amazon", "Tesla", "Google", "OpenAI", "Stripe"
  ]
}) => {
  // Duplicate array for seamless infinite loop
  const marqueeItems = [...items, ...items];

  return (
    <section className="border-t border-b border-slate-800/50 bg-slate-900/30 py-10 relative overflow-hidden">
      {/* Gradient edge masks for smooth fade */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none" />

      <div className="flex overflow-hidden select-none">
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear'
          }}
          className="flex flex-nowrap shrink-0 items-center gap-12 md:gap-20"
        >
          {marqueeItems.map((logo, idx) => (
            <motion.div 
              key={idx} 
              whileHover={{ scale: 1.1, color: '#c084fc' }}
              className="text-xl md:text-2xl font-bold tracking-wider uppercase text-slate-500 hover:text-purple-400 transition-colors cursor-pointer whitespace-nowrap"
            >
              {logo}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default LogoTicker;