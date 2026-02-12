import React from 'react';

const About: React.FC = () => {
  return (
    <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-6">
          About Us
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          We are on a mission to secure the AI-driven future by providing robust API security solutions for modern enterprises.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-white">Our Story</h2>
          <p className="text-slate-400 leading-relaxed">
            Founded in 2024, we recognized that the explosion of AI adoption created a new attack surface that traditional security tools couldn't address. Our team of security experts and AI researchers came together to build a platform that understands the unique risks of LLM interactions.
          </p>
          <p className="text-slate-400 leading-relaxed">
            Today, we protect millions of API calls daily for forward-thinking companies who refuse to compromise on security while innovating.
          </p>
        </div>
        <div className="bg-slate-900/50 p-8 rounded-2xl border border-white/10 relative overflow-hidden group">
            <div className="absolute inset-0 bg-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                    <div className="h-32 bg-slate-800 rounded-lg w-full animate-pulse" />
                    <div className="h-24 bg-slate-800 rounded-lg w-full animate-pulse delay-75" />
                </div>
                <div className="space-y-4 pt-8">
                    <div className="h-24 bg-slate-800 rounded-lg w-full animate-pulse delay-150" />
                    <div className="h-32 bg-slate-800 rounded-lg w-full animate-pulse delay-200" />
                </div>
            </div>
        </div>
      </div>

      <div className="mb-20">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
                { title: 'Security First', desc: 'We never compromise on the security of your data or your users.' },
                { title: 'Innovation', desc: 'We stay ahead of threats by constantly pushing the boundaries of what is possible.' },
                { title: 'Transparency', desc: 'We believe in open communication and clear, actionable insights.' }
            ].map((value, i) => (
                <div key={i} className="bg-slate-900 border border-white/10 p-8 rounded-xl hover:border-purple-500/50 transition-colors">
                    <h3 className="text-xl font-semibold text-white mb-4">{value.title}</h3>
                    <p className="text-slate-400">{value.desc}</p>
                </div>
            ))}
        </div>
      </div>
      
      {/* Team Section Placeholder */}
      <div>
          <h2 className="text-3xl font-bold text-white text-center mb-12">Meet the Team</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="text-center group">
                      <div className="w-32 h-32 mx-auto bg-slate-800 rounded-full mb-4 overflow-hidden relative">
                          <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-blue-500/20 group-hover:opacity-0 transition-opacity" />
                          <div className="w-full h-full flex items-center justify-center text-slate-600">
                              <span className="sr-only">Team Member {i}</span>
                              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                          </div>
                      </div>
                      <h3 className="text-lg font-medium text-white">Team Member</h3>
                      <p className="text-sm text-purple-400">Position</p>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
};

export default About;
