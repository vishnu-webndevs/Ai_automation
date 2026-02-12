import React from 'react';

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

  return (
    <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-6">
          Changelog
        </h1>
        <p className="text-xl text-slate-400">
          Stay up to date with the latest improvements and fixes.
        </p>
      </div>

      <div className="space-y-12 relative before:absolute before:inset-y-0 before:left-0 md:before:left-[8.5rem] before:w-px before:bg-white/10">
          {updates.map((update, idx) => (
              <div key={idx} className="relative flex flex-col md:flex-row gap-8 md:gap-12">
                  <div className="md:w-32 shrink-0 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-2 text-right">
                      <span className="text-sm font-mono text-purple-400">{update.version}</span>
                      <span className="text-sm text-slate-500">{update.date}</span>
                  </div>
                  
                  <div className="absolute left-0 md:left-[8.5rem] top-1.5 md:top-2 -translate-x-1/2 w-3 h-3 rounded-full bg-slate-900 border border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)] z-10" />

                  <div className="flex-1 bg-slate-900/50 border border-white/10 rounded-xl p-6 md:p-8 hover:border-white/20 transition-colors">
                      <div className="flex items-center gap-3 mb-4">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                              update.type === 'Major' ? 'bg-purple-500 text-white' :
                              update.type === 'Feature' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' :
                              'bg-slate-700 text-slate-300'
                          }`}>
                              {update.type}
                          </span>
                          <h2 className="text-xl font-bold text-white">{update.title}</h2>
                      </div>
                      <ul className="space-y-2">
                          {update.content.map((item, i) => (
                              <li key={i} className="flex items-start gap-3 text-slate-300">
                                  <span className="block w-1.5 h-1.5 mt-2 rounded-full bg-slate-600 shrink-0" />
                                  <span>{item}</span>
                              </li>
                          ))}
                      </ul>
                  </div>
              </div>
          ))}
      </div>
      
      <div className="mt-12 text-center">
          <button className="text-slate-500 hover:text-white transition-colors text-sm font-medium">
              Load older updates...
          </button>
      </div>
    </div>
  );
};

export default Changelog;
