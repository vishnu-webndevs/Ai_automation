import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Particles from '../components/Particles';

const Layout: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-300 selection:bg-purple-500/30 selection:text-purple-200">
      <Particles />
      <Navbar />
      <main className="relative z-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
