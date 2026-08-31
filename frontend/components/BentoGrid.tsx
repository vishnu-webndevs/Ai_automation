import React from 'react';
import { motion, Variants } from 'framer-motion';

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
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.05
      }
    }
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div 
          initial={{ opacity: 0, y: -15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">{heading}</h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            {subheading}
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid md:grid-cols-12 gap-6 mb-32"
        >
            {items.map((item, idx) => (
                <motion.div 
                  key={idx} 
                  variants={cardVariants}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  className={`md:col-span-12 lg:col-span-${item.colSpan || 4} bg-slate-900/50 border border-slate-800 rounded-3xl p-8 relative overflow-hidden group hover:border-slate-700 transition-colors flex flex-col justify-between backdrop-blur-sm shadow-xl`}
                >
                   {/* Optional Background Glow */}
                   {item.colSpan === 8 && (
                       <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />
                   )}
                   
                   <div className="relative z-10">
                      <h3 className="text-2xl font-bold text-white mb-2">{item.title}</h3>
                      <p className="text-slate-400 mb-6 max-w-md leading-relaxed">{item.description}</p>
                      {item.ctaText && (
                          <motion.button 
                            whileHover={{ x: 4 }}
                            className="text-sm font-medium text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
                          >
                              {item.ctaText} <span className="text-xs">→</span>
                          </motion.button>
                      )}
                   </div>

                   {/* Decorative Floating Pills */}
                   {item.colSpan === 8 && (
                       <div className="mt-8 flex justify-end">
                          <div className="relative w-full max-w-md h-40">
                             {[
                               {bg: "bg-purple-600", text: "Transactions", top: "0%", left: "10%"},
                               {bg: "bg-blue-600", text: "Auth", top: "20%", left: "60%"},
                               {bg: "bg-pink-600", text: "Secure", top: "60%", left: "30%"},
                               {bg: "bg-indigo-600", text: "Login", top: "50%", left: "80%"},
                             ].map((pill, i) => (
                               <motion.div 
                                 key={i} 
                                 animate={{ y: [0, -8, 0] }}
                                 transition={{ duration: 3 + i, repeat: Infinity, ease: "easeInOut" }}
                                 className={`absolute px-3.5 py-1.5 rounded-full text-xs font-semibold text-white ${pill.bg} shadow-lg backdrop-blur-sm`} 
                                 style={{top: pill.top, left: pill.left}}
                               >
                                  {pill.text}
                               </motion.div>
                             ))}
                          </div>
                       </div>
                   )}
                </motion.div>
            ))}
        </motion.div>
      </div>
    </section>
  );
};

export default BentoGrid;

