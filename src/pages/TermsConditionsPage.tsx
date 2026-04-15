import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MobileMenu from '../components/MobileMenu';

const TermsConditionsPage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    document.body.style.overflow = !isMenuOpen ? 'hidden' : '';
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1A1F1C] transition-colors duration-300">
      <Navbar 
        scrolled={true} 
        isMenuOpen={isMenuOpen} 
        toggleMenu={toggleMenu} 
        scrollToSection={(id) => navigate('/' + id)}
      />
      <MobileMenu isMenuOpen={isMenuOpen} scrollToSection={(id) => navigate('/' + id)} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="bg-white rounded-[2.5rem] shadow-sm p-8 sm:p-16 mb-12 border border-[#E5EDE8]">
          <h1 className="text-4xl md:text-6xl font-serif text-[#1A1F1C] mb-12 leading-tight">
            Terms and Conditions
          </h1>
          <div className="prose prose-slate max-w-none space-y-8">
            <p className="text-[#5A6B61] font-medium uppercase tracking-wider text-sm">Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-[#1A1F1C]">1. Acceptance of Terms</h2>
              <p className="text-[#5A6B61] leading-relaxed text-lg">By accessing or using the MBT (My Blood Test) application, you agree to be bound by these Terms and Conditions. If you disagree with any part of the terms, you may not access the service.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-red-600">2. Medical Disclaimer (Crucial)</h2>
              <div className="p-6 bg-red-50 border-l-4 border-red-500 rounded-r-2xl">
                <p className="font-semibold text-red-800 text-lg">
                  MBT IS NOT A MEDICAL PROFESSIONAL. The information provided by our AI system is for educational and informational purposes only. It does not constitute medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
                </p>
              </div>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-[#1A1F1C]">3. Our Verified Knowledge Base</h2>
              <p className="text-[#5A6B61] leading-relaxed text-lg">To provide high-quality and safe insights, our AI agent is strictly bounded by a custom, verified Medical Knowledge Base. This knowledge base has been carefully curated from top-tier, authoritative medical sources. The AI is programmed to rely on these verified documents rather than hallucinating external information, ensuring a safer and more grounded analysis.</p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-[#1A1F1C]">4. Subscriptions and Payments</h2>
              <p className="text-[#5A6B61] leading-relaxed text-lg">Some features of MBT are billed on a subscription basis ("Pro Plan"). You will be billed in advance on a recurring and periodic basis. Payments are handled securely via Stripe.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-[#1A1F1C]">5. Account Responsibilities</h2>
              <p className="text-[#5A6B61] leading-relaxed text-lg">You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-[#1A1F1C]">6. Changes to Terms</h2>
              <p className="text-[#5A6B61] leading-relaxed text-lg">We reserve the right to modify or replace these Terms at any time. We will try to provide at least 30 days' notice prior to any new terms taking effect.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer scrollToSection={() => {}} />
    </div>
  );
};

export default TermsConditionsPage;
