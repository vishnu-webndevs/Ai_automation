import { Bot, Github, Twitter, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Bot className="text-white w-5 h-5" />
              </div>
              <span className="text-white font-bold text-xl">Totan AI</span>
            </div>
            <p className="text-slate-400 text-sm">
              Empowering the next generation of content creators with artificial intelligence.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="#" className="hover:text-purple-400 transition-colors">Features</Link></li>
              <li><Link to="#" className="hover:text-purple-400 transition-colors">Integrations</Link></li>
              <li><Link to="#" className="hover:text-purple-400 transition-colors">Pricing</Link></li>
              <li><Link to="#" className="hover:text-purple-400 transition-colors">Changelog</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="#" className="hover:text-purple-400 transition-colors">About Us</Link></li>
              <li><Link to="#" className="hover:text-purple-400 transition-colors">Careers</Link></li>
              <li><Link to="#" className="hover:text-purple-400 transition-colors">Blog</Link></li>
              <li><Link to="#" className="hover:text-purple-400 transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="#" className="hover:text-purple-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="#" className="hover:text-purple-400 transition-colors">Terms of Service</Link></li>
              <li><Link to="#" className="hover:text-purple-400 transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} Totan AI. All rights reserved.
          </p>
          <div className="flex space-x-4">
            <a href="#" className="text-slate-500 hover:text-white transition-colors"><Github className="w-5 h-5" /></a>
            <a href="#" className="text-slate-500 hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
            <a href="#" className="text-slate-500 hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
