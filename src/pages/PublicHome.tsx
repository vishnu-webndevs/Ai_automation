import Navbar from '../components/public/Navbar';
import Hero from '../components/public/Hero';
import Features from '../components/public/Features';
import Footer from '../components/public/Footer';

const PublicHome = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-purple-500/30">
      <Navbar />
      <main>
        <Hero />
        <Features />
      </main>
      <Footer />
    </div>
  );
};

export default PublicHome;
