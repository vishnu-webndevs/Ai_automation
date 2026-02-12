import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-28">
      {/* Background Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl mix-blend-screen animate-pulse" />
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl mix-blend-screen animate-pulse delay-1000" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 mb-8 backdrop-blur-sm">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-sm text-slate-300">New: Advanced AI Content Generation</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-8">
          Create Content at <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Cosmic Speed</span>
        </h1>
        
        <p className="mt-4 max-w-2xl mx-auto text-xl text-slate-400 mb-10">
          Totan AI empowers your business with intelligent content generation, 
          automated workflows, and seamless integration for modern enterprises.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            to="/authentication" 
            className="group relative inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-all duration-200 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              Start Free Trial
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
          
          <Link 
            to="/web-admin" 
            className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-slate-300 bg-slate-800/50 border border-slate-700 rounded-lg hover:bg-slate-800 hover:text-white transition-all backdrop-blur-sm"
          >
            View Demo
          </Link>
        </div>

        {/* Dashboard Preview */}
        <div className="mt-20 relative rounded-xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
            <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50" />
            <div className="p-2 bg-slate-900/50 border-b border-slate-800 flex items-center gap-2">
                <div className="flex gap-1.5 ml-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                </div>
            </div>
            <div className="aspect-[16/9] w-full bg-slate-950 flex items-center justify-center text-slate-600">
                 {/* Placeholder for dashboard screenshot */}
                 <div className="text-center">
                    <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p>Dashboard Preview</p>
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
