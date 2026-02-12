import React from 'react';
import Hero from '../components/Hero';
import LogoTicker from '../components/LogoTicker';
import Features from '../components/Features';
import MobileSection from '../components/MobileSection';
import WhyTrust from '../components/WhyTrust';
import Pricing from '../components/Pricing';
import Testimonials from '../components/Testimonials';

const Home: React.FC = () => {
  return (
    <>
      <Hero />
      <LogoTicker />
      <Features />
      <MobileSection />
      <WhyTrust />
      <Pricing />
      <Testimonials />
    </>
  );
};

export default Home;
