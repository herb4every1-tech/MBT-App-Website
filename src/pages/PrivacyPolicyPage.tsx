import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PrivacyPolicyPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0f18] text-zinc-300 transition-colors duration-300">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-12 mb-12 border border-slate-800">
          <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-teal-400 to-emerald-500 bg-clip-text text-transparent mb-8">
            Privacy Policy
          </h1>
          <div className="prose prose-invert prose-teal max-w-none space-y-6">
            <p className="text-zinc-400"><strong>Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong></p>
            
            <h2 className="text-2xl font-semibold text-white mt-8 italic font-serif">1. Introduction</h2>
            <p>Welcome to MBT (My Blood Test). Your privacy is critically important to us. This Privacy Policy explains how we collect, use, and protect your personal and medical information when you use our website and mobile application.</p>
            
            <h2 className="text-2xl font-semibold text-white mt-8 italic font-serif">2. Data We Collect</h2>
            <p>We collect information you provide directly to us, including your name, email address, password, and the blood test documents (PDF or images) you upload for analysis. Payment information is securely processed by Stripe and is not stored on our servers.</p>
            
            <h2 className="text-2xl font-semibold text-white mt-8 italic font-serif">3. How We Use Your Data</h2>
            <p>The blood test documents you upload are processed by our advanced AI system to provide you with insights. The AI analysis is strictly guided by a proprietary, verified Medical Knowledge Base to ensure accuracy. Your documents are used solely for the purpose of generating your personal report and chat history.</p>

            <h2 className="text-2xl font-semibold text-white mt-8 italic font-serif">4. Data Security</h2>
            <p>We implement strict security measures to protect your data. Your connection to our servers is encrypted using SSL. Authentication and database records are securely managed through Supabase.</p>

            <h2 className="text-2xl font-semibold text-white mt-8 italic font-serif">5. Third-Party Services</h2>
            <p>We use third-party services such as Stripe for billing and Mistral AI for complex data processing. These services have their own strict data processing agreements and privacy policies.</p>

            <h2 className="text-2xl font-semibold text-white mt-8 italic font-serif">6. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us via our Contact Page or at <a href="mailto:herb4every1@gmail.com" className="text-teal-400">herb4every1@gmail.com</a>.</p>
          </div>
        </div>
      </main>
      <Footer scrollToSection={() => {}} />
    </div>
  );
};

export default PrivacyPolicyPage;
