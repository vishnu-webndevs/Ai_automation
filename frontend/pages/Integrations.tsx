import React from 'react';
import { Check, ArrowRight } from 'lucide-react';

const Integrations: React.FC = () => {
  const categories = ['LLM Providers', 'Cloud Platforms', 'CI/CD Tools', 'Monitoring'];
  const integrations = [
    { name: 'OpenAI', category: 'LLM Providers', status: 'Connected', icon: 'O' },
    { name: 'Anthropic', category: 'LLM Providers', status: 'Available', icon: 'A' },
    { name: 'AWS Bedrock', category: 'Cloud Platforms', status: 'Available', icon: 'B' },
    { name: 'Hugging Face', category: 'LLM Providers', status: 'Beta', icon: 'H' },
    { name: 'GitHub Actions', category: 'CI/CD Tools', status: 'Connected', icon: 'G' },
    { name: 'Datadog', category: 'Monitoring', status: 'Available', icon: 'D' },
  ];

  return (
    <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-6">
          Integrations
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          Seamlessly connect with your existing stack. We support all major LLM providers and cloud platforms.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 mb-12">
          {/* Sidebar Filters */}
          <div className="w-full md:w-64 shrink-0">
              <div className="bg-slate-900 border border-white/10 rounded-xl p-6 sticky top-24">
                  <h3 className="text-lg font-semibold text-white mb-4">Categories</h3>
                  <div className="space-y-2">
                      <label className="flex items-center gap-2 text-slate-400 hover:text-white cursor-pointer">
                          <input type="checkbox" className="rounded border-slate-700 bg-slate-800 text-purple-600 focus:ring-purple-500" defaultChecked />
                          <span>All Integrations</span>
                      </label>
                      {categories.map(cat => (
                          <label key={cat} className="flex items-center gap-2 text-slate-400 hover:text-white cursor-pointer">
                              <input type="checkbox" className="rounded border-slate-700 bg-slate-800 text-purple-600 focus:ring-purple-500" />
                              <span>{cat}</span>
                          </label>
                      ))}
                  </div>
              </div>
          </div>

          {/* Grid */}
          <div className="flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {integrations.map((integration, idx) => (
                      <div key={idx} className="bg-slate-900 border border-white/10 rounded-xl p-6 hover:border-purple-500/50 transition-all group">
                          <div className="flex justify-between items-start mb-4">
                              <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center text-xl font-bold text-white group-hover:bg-purple-600 transition-colors">
                                  {integration.icon}
                              </div>
                              <span className={`text-xs px-2 py-1 rounded-full border ${
                                  integration.status === 'Connected' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                                  integration.status === 'Beta' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                                  'bg-slate-800 border-slate-700 text-slate-400'
                              }`}>
                                  {integration.status}
                              </span>
                          </div>
                          <h3 className="text-lg font-bold text-white mb-1">{integration.name}</h3>
                          <p className="text-sm text-slate-500 mb-4">{integration.category}</p>
                          <button className="w-full py-2 px-4 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 group-hover:bg-purple-600/20 group-hover:text-purple-300">
                              Configure <ArrowRight size={16} />
                          </button>
                      </div>
                  ))}
              </div>
              
              {/* Empty State Example */}
              <div className="mt-12 p-8 border border-dashed border-slate-700 rounded-xl text-center bg-slate-900/30">
                  <p className="text-slate-400 mb-4">Don't see what you're looking for?</p>
                  <button className="text-purple-400 hover:text-purple-300 font-medium">Request an integration &rarr;</button>
              </div>
          </div>
      </div>
    </div>
  );
};

export default Integrations;
