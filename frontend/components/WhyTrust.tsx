import React from 'react';
import { MessageSquare, Users, Search, BarChart2, Bell, Share2, Shield, Download, Zap } from 'lucide-react';
import { motion, Variants } from 'framer-motion';

export interface TrustFeature {
  title: string;
  desc: string;
  icon?: string;
}

export interface WhyTrustProps {
  heading?: string;
  description?: string;
  features?: TrustFeature[];
}

const iconMap: Record<string, React.ReactNode> = {
  'message-square': <MessageSquare className="text-purple-400" />,
  'users': <Users className="text-purple-400" />,
  'search': <Search className="text-purple-400" />,
  'bar-chart': <BarChart2 className="text-pink-400" />,
  'bell': <Bell className="text-pink-400" />,
  'share': <Share2 className="text-pink-400" />,
  'shield': <Shield className="text-blue-400" />,
  'download': <Download className="text-blue-400" />,
  'zap': <Zap className="text-blue-400" />,
};

const WhyTrust: React.FC<WhyTrustProps> = ({
  heading = "Why trust us?",
  description = "Many desktop publishing packages and web page editors now use lorem ipsum as their default model text.",
  features = [
    { icon: 'message-square', title: "Discussions", desc: "Login box must find the right balance for the user convenience, privacy and security." },
    { icon: 'users', title: "Team views", desc: "Login box must find the right balance for the user convenience, privacy and security." },
    { icon: 'search', title: "Powerful search", desc: "Login box must find the right balance for the user convenience, privacy and security." },
    { icon: 'bar-chart', title: "Analytics", desc: "Login box must find the right balance for the user convenience, privacy and security." },
    { icon: 'bell', title: "Notifications", desc: "Login box must find the right balance for the user convenience, privacy and security." },
    { icon: 'share', title: "Integrations", desc: "Login box must find the right balance for the user convenience, privacy and security." },
    { icon: 'shield', title: "Privacy", desc: "Login box must find the right balance for the user convenience, privacy and security." },
    { icon: 'download', title: "Data export", desc: "Login box must find the right balance for the user convenience, privacy and security." },
    { icon: 'zap', title: "Real-time sync", desc: "Login box must find the right balance for the user convenience, privacy and security." },
  ]
}) => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.05
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: "easeOut" }
    }
  };

  return (
    <section className="py-20 bg-slate-900/20 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div 
          initial={{ opacity: 0, y: -15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-16"
        >
           <h2 className="text-3xl font-bold text-white mb-4">{heading}</h2>
           <p className="text-slate-400 max-w-2xl leading-relaxed">{description}</p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid md:grid-cols-3 gap-x-8 gap-y-12"
        >
           {features.map((f, i) => (
             <motion.div 
               key={i} 
               variants={itemVariants}
               whileHover={{ x: 4 }}
               className="group cursor-pointer"
             >
                <div className="mb-4 bg-slate-800/50 w-10 h-10 flex items-center justify-center rounded-lg border border-slate-700/50 group-hover:bg-slate-800 transition-colors shadow-sm">
                   {f.icon && iconMap[f.icon] ? iconMap[f.icon] : <Zap className="text-slate-400" />}
                </div>
                <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-purple-400 transition-colors">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
             </motion.div>
           ))}
        </motion.div>
      </div>
    </section>
  );
};

export default WhyTrust;