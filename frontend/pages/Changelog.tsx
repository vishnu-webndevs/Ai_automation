import React from 'react';
import { motion, Variants } from 'framer-motion';

const Changelog: React.FC = () => {
  const updates = [
    {
      version: 'v2.1.0',
      date: 'February 8, 2026',
      title: 'Enhanced Rate Limiting & New Dashboard',
      type: 'Feature',
      content: [
        'Added granular rate limiting policies per API key',
        'Completely redesigned analytics dashboard with real-time metrics',
        'Fixed an issue with webhook delivery reliability'
      ]
    },
    {
      version: 'v2.0.5',
      date: 'January 25, 2026',
      title: 'Security Patch & Performance Improvements',
      type: 'Fix',
      content: [
        'Optimized request latency by 15%',
        'Patched a potential vulnerability in the authentication flow',
        'Updated dependency versions'
      ]
    },
    {
      version: 'v2.0.0',
      date: 'January 10, 2026',
      title: 'Major Release: LLM Firewall',
      type: 'Major',
      content: [
        'Introduced the LLM Firewall for filtering malicious prompts',
        'Added support for Anthropic Claude 3',
        'New team management capabilities'
      ]
    }
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  return (
    <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-slate-400 mb-6 leading-tight">
          Changelog
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Stay up to date with the latest improvements, releases, and fixes.
        </p>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-12 relative before:absolute before:inset-y-0 before:left-0 md:before:left-[8.5rem] before:w-px before:bg-white/10"
      >
          {updates.map((update, idx) => (
              <motion.div 
                key={idx} 
                variants={itemVariants}
                className="relative flex flex-col md:flex-row gap-8 md:gap-12"
              >
                  <div className="md:w-32 shrink-0 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-2 text-right">
                      <span className="text-sm font-mono text-purple-400 font-bold">{update.version}</span>
                      <span className="text-sm text-slate-500">{update.date}</span>
                  </div>
                  
                  <div className="absolute left-0 md:left-[8.5rem] top-1.5 md:top-2 -translate-x-1/2 w-3 h-3 rounded-full bg-slate-900 border border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)] z-10" />

                  <motion.div 
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    className="flex-1 bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 md:p-8 hover:border-purple-500/30 transition-colors shadow-lg"
                  >
                      <div className="flex items-center gap-3 mb-4">
                          <span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                              update.type === 'Major' ? 'bg-purple-500 text-white' :
                              update.type === 'Feature' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' :
                              'bg-slate-700 text-slate-300'
                          }`}>
                              {update.type}
                          </span>
                          <h2 className="text-xl font-bold text-white">{update.title}</h2>
                      </div>
                      <ul className="space-y-2.5">
                          {update.content.map((item, i) => (
                              <li key={i} className="flex items-start gap-3 text-slate-300 text-sm md:text-base">
                                  <span className="block w-1.5 h-1.5 mt-2 rounded-full bg-purple-400 shrink-0" />
                                  <span>{item}</span>
                              </li>
                          ))}
                      </ul>
                  </motion.div>
              </motion.div>
          ))}
      </motion.div>
      
      <div className="mt-12 text-center">
          <button className="text-slate-500 hover:text-white transition-colors text-sm font-medium cursor-pointer">
              Load older updates...
          </button>
      </div>
    </div>
  );
};

export default Changelog;

