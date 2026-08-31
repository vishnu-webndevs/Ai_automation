import React from 'react';
import { motion, Variants } from 'framer-motion';

const Customers: React.FC = () => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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
    <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-slate-400 mb-6 leading-tight">
          Customer Stories
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          See how leading companies are securing and accelerating their AI infrastructure with our platform.
        </p>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20"
      >
          {/* Featured Case Study */}
          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="lg:col-span-2 relative rounded-2xl overflow-hidden group border border-purple-500/30 shadow-2xl backdrop-blur-sm"
          >
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-purple-950/40" />
              <div className="relative p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center z-10">
                  <div className="flex-1 space-y-6">
                      <div className="inline-block px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold uppercase tracking-wider">
                          Featured Case Study
                      </div>
                      <h2 className="text-3xl font-bold text-white leading-tight">How TechCorp Reduced AI Latency by 40%</h2>
                      <p className="text-slate-300 text-lg leading-relaxed">
                          TechCorp needed a way to monitor and optimize their LLM calls without compromising on security. 
                          Our platform provided the real-time visibility and policy controls they needed.
                      </p>
                      <motion.button 
                        whileHover={{ x: 4 }}
                        className="text-purple-400 font-semibold border-b border-purple-500/60 hover:border-purple-400 pb-1 transition-colors flex items-center gap-2 cursor-pointer"
                      >
                          Read full story <span>→</span>
                      </motion.button>
                  </div>
                  <div className="w-full md:w-1/2 aspect-video bg-slate-800 rounded-xl overflow-hidden shadow-2xl border border-slate-700/50 flex items-center justify-center">
                      <div className="w-full h-full bg-gradient-to-br from-purple-900/40 to-slate-900 flex items-center justify-center text-slate-400 font-medium">
                          ⚡ TechCorp Metrics Dashboard
                      </div>
                  </div>
              </div>
          </motion.div>

          {[
            { company: "FinTech Pro", quote: "Implementing this security framework was the best decision we made this year. It completely transformed our workflow.", author: "Jane Doe", role: "CTO, FinTech Pro" },
            { company: "CloudScale", quote: "Our AI response times dropped significantly while audit compliance became completely automated.", author: "Alex Smith", role: "VP Engineering, CloudScale" },
            { company: "DataDrive", quote: "The guardrails and rate limiting saved us tens of thousands in unexpected API usage spikes.", author: "Sarah Connor", role: "Head of Infrastructure, DataDrive" },
            { company: "NextGen AI", quote: "Flawless integration with our existing microservices stack. We went live in less than two days.", author: "Michael Vance", role: "Lead Architect, NextGen AI" }
          ].map((story, i) => (
              <motion.div 
                key={i} 
                variants={cardVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-slate-900/60 border border-white/10 rounded-2xl p-8 hover:border-purple-500/40 transition-colors shadow-lg backdrop-blur-sm flex flex-col justify-between"
              >
                  <div>
                    <div className="text-xs font-semibold tracking-widest text-purple-400 uppercase mb-4">{story.company}</div>
                    <blockquote className="text-lg text-slate-200 mb-6 leading-relaxed">
                        "{story.quote}"
                    </blockquote>
                  </div>
                  <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                      <div className="w-10 h-10 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                          {story.author[0]}
                      </div>
                      <div>
                          <div className="text-white font-semibold text-sm">{story.author}</div>
                          <div className="text-slate-400 text-xs">{story.role}</div>
                      </div>
                  </div>
              </motion.div>
          ))}
      </motion.div>
      
      {/* Logo Grid */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="border-t border-white/10 pt-16"
      >
          <p className="text-center text-slate-400 mb-8 text-xs font-semibold tracking-widest uppercase">TRUSTED BY INNOVATIVE TEAMS WORLDWIDE</p>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 opacity-60">
              {['Acme Corp', 'GlobalBank', 'Starlight', 'Apex AI', 'Quantum', 'Vortex'].map((name, i) => (
                  <motion.div 
                    key={i} 
                    whileHover={{ scale: 1.05, opacity: 1 }}
                    className="h-14 bg-slate-900/40 border border-slate-800 rounded-xl flex items-center justify-center cursor-pointer transition-colors hover:border-purple-500/40"
                  >
                      <span className="text-slate-400 font-bold text-sm tracking-wider uppercase">{name}</span>
                  </motion.div>
              ))}
          </div>
      </motion.div>
    </div>
  );
};

export default Customers;

