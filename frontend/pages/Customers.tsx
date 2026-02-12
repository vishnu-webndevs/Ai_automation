import React from 'react';

const Customers: React.FC = () => {
  return (
    <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-6">
          Customer Stories
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          See how leading companies are securing their AI infrastructure with our platform.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Featured Case Study */}
          <div className="lg:col-span-2 relative rounded-2xl overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-slate-800" />
              <div className="relative p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center">
                  <div className="flex-1 space-y-6">
                      <div className="inline-block px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium">
                          Featured Case Study
                      </div>
                      <h2 className="text-3xl font-bold text-white">How TechCorp Reduced AI Latency by 40%</h2>
                      <p className="text-slate-400 text-lg">
                          TechCorp needed a way to monitor and optimize their LLM calls without compromising on security. 
                          Our platform provided the visibility they needed.
                      </p>
                      <button className="text-white font-medium border-b border-purple-500 hover:border-purple-400 pb-1 transition-colors">
                          Read full story &rarr;
                      </button>
                  </div>
                  <div className="w-full md:w-1/2 aspect-video bg-slate-700 rounded-xl overflow-hidden shadow-2xl shadow-black/50">
                      <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-600">
                          [Customer Image Placeholder]
                      </div>
                  </div>
              </div>
          </div>

          {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-slate-900 border border-white/10 rounded-xl p-8 hover:border-white/20 transition-colors">
                  <div className="h-8 w-24 bg-slate-800 rounded mb-6 opacity-50" />
                  <blockquote className="text-lg text-slate-300 mb-6">
                      "Implementing this security framework was the best decision we made this year. It completely transformed our workflow."
                  </blockquote>
                  <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-800 rounded-full" />
                      <div>
                          <div className="text-white font-medium">Jane Doe</div>
                          <div className="text-slate-500 text-sm">CTO, Company {i}</div>
                      </div>
                  </div>
              </div>
          ))}
      </div>
      
      {/* Logo Grid */}
      <div className="border-t border-white/10 pt-16">
          <p className="text-center text-slate-500 mb-8 font-medium">TRUSTED BY INNOVATIVE TEAMS</p>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-12 bg-slate-800/50 rounded flex items-center justify-center">
                      <span className="text-slate-500 font-bold">LOGO {i}</span>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
};

export default Customers;
