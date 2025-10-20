import React from 'react';
import '../styles/landing.css';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import DestinosDestacados from '../components/DestinosDestacados';
import ComoFunciona from '../components/ComoFunciona';
import CTAFinal from '../components/CTAFinal';
import Footer from '../components/Footer';

const LandingPage = () => {
  // Smooth scroll function
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Navigation */}
      <Navbar />
      
      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <HeroSection />
        
        {/* Destinos Destacados */}
        <DestinosDestacados />
        
        {/* Cómo Funciona */}
        <ComoFunciona />
        
        {/* CTA Final */}
        <CTAFinal />
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;