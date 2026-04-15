import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const TermsConditionsPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0f18] text-zinc-300 transition-colors duration-300">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-12 mb-12 border border-slate-800">
          <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-teal-400 to-emerald-500 bg-clip-text text-transparent mb-8">
            Terms and Conditions
          </h1>
          <div className="prose prose-invert prose-teal max-w-none space-y-6">
            <p className="text-zinc-400"><strong>Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong></p>
            
            <h2 className="text-2xl font-semibold text-white mt-8 italic font-serif">1. Acceptance of Terms</h2>
            <p>By accessing or using the MBT (My Blood Test) application, you agree to be bound by these Terms and Conditions. If you disagree with any part of the terms, you may not access the service.</p>

            <h2 className="text-2xl font-semibold text-red-400 mt-8 italic font-serif">2. Medical Disclaimer (Crucial)</h2>
            <div className="p-4 bg-red-950/20 border-l-4 border-red-500 rounded-r-lg">
              <p className="font-medium text-red-200">
                MBT IS NOT A MEDICAL PROFESSIONAL. The information provided by our AI system is for educational and informational purposes only. It does not constitute medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
              </p>
            </div>
            
            <h2 className="text-2xl font-semibold text-white mt-8 italic font-serif">3. Our Verified Knowledge Base</h2>
            <p>To provide high-quality and safe insights, our AI agent is strictly bounded by a custom, verified Medical Knowledge Base. This knowledge base has been carefully curated from top-tier, authoritative medical sources. The AI is programmed to rely on these verified documents rather than hallucinating external information, ensuring a safer and more grounded analysis.</p>
            
            <h2 className="text-2xl font-semibold text-white mt-8 italic font-serif">4. Subscriptions and Payments</h2>
            <p>Some features of MBT are billed on a subscription basis ("Pro Plan"). You will be billed in advance on a recurring and periodic basis. Payments are handled securely via Stripe.</p>

            <h2 className="text-2xl font-semibold text-white mt-8 italic font-serif">5. Account Responsibilities</h2>
            <p>You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.</p>

            <h2 className="text-2xl font-semibold text-white mt-8 italic font-serif">6. Changes to Terms</h2>
            <p>We reserve the right to modify or replace these Terms at any time. We will try to provide at least 30 days' notice prior to any new terms taking effect.</p>
          </div>
        </div>
      </main>
      <Footer scrollToSection={() => {}} />
    </div>
  );
};

export default TermsConditionsPage;
