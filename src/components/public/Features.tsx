import { Zap, Shield, Globe, Cpu, BarChart, Layers } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast Generation',
    description: 'Generate high-quality content in seconds using our advanced AI models optimized for speed and accuracy.'
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-grade encryption and role-based access control ensure your proprietary data stays safe and compliant.'
  },
  {
    icon: Globe,
    title: 'Global Scale',
    description: 'Deploy content across multiple languages and regions with our built-in localization and CDN support.'
  },
  {
    icon: Cpu,
    title: 'Advanced AI Models',
    description: 'Leverage state-of-the-art LLMs including GPT-4 and Claude 3 for nuanced, human-like content creation.'
  },
  {
    icon: BarChart,
    title: 'Analytics & Insights',
    description: 'Track performance metrics and engagement rates to optimize your content strategy in real-time.'
  },
  {
    icon: Layers,
    title: 'Seamless Integration',
    description: 'Connect with your existing CMS, CRM, and marketing tools via our robust API and pre-built connectors.'
  }
];

const Features = () => {
  return (
    <section id="features" className="py-24 bg-slate-950 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-base text-purple-400 font-semibold tracking-wide uppercase">Features</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-white sm:text-4xl">
            Everything you need to scale
          </p>
          <p className="mt-4 max-w-2xl text-xl text-slate-400 mx-auto">
            A comprehensive suite of tools designed to supercharge your content operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="relative group bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-purple-500/50 transition-colors">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-blue-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-500/20 group-hover:text-purple-400 transition-colors">
                  <feature.icon className="w-6 h-6 text-slate-300 group-hover:text-purple-400" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
