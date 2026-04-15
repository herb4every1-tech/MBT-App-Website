import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PrivacyPolicyPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1A1F1C] transition-colors duration-300">
      <Navbar scrolled={true} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="bg-white rounded-[2.5rem] shadow-sm p-8 sm:p-16 mb-12 border border-[#E5EDE8]">
          <h1 className="text-4xl md:text-6xl font-serif text-[#1A1F1C] mb-12 leading-tight">
            Privacy Policy
          </h1>
          <div className="prose prose-slate max-w-none space-y-8">
            <p className="text-[#5A6B61] font-medium uppercase tracking-wider text-sm">Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-[#1A1F1C]">1. Introduction</h2>
              <p className="text-[#5A6B61] leading-relaxed text-lg">Welcome to MBT (My Blood Test). Your privacy is critically important to us. This Privacy Policy explains how we collect, use, and protect your personal and medical information when you use our website and mobile application.</p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-[#1A1F1C]">2. Data We Collect</h2>
              <p className="text-[#5A6B61] leading-relaxed text-lg">We collect information you provide directly to us, including your name, email address, password, and the blood test documents (PDF or images) you upload for analysis. Payment information is securely processed by Stripe and is not stored on our servers.</p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-[#1A1F1C]">3. How We Use Your Data</h2>
              <p className="text-[#5A6B61] leading-relaxed text-lg">The blood test documents you upload are processed by our advanced AI system to provide you with insights. The AI analysis is strictly guided by a proprietary, verified Medical Knowledge Base to ensure accuracy. Your documents are used solely for the purpose of generating your personal report and chat history.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-[#1A1F1C]">4. Data Security</h2>
              <p className="text-[#5A6B61] leading-relaxed text-lg">We implement strict security measures to protect your data. Your connection to our servers is encrypted using SSL. Authentication and database records are securely managed through Supabase.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-[#1A1F1C]">5. Third-Party Services</h2>
              <p className="text-[#5A6B61] leading-relaxed text-lg">We use third-party services such as Stripe for billing and Mistral AI for complex data processing. These services have their own strict data processing agreements and privacy policies.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-[#1A1F1C]">6. Contact Us</h2>
              <p className="text-[#5A6B61] leading-relaxed text-lg">If you have any questions about this Privacy Policy, please contact us via our Contact Page or at <a href="mailto:herb4every1@gmail.com" className="text-[#4A7C59] underline decoration-[#D4E6DA] underline-offset-4 font-semibold">herb4every1@gmail.com</a>.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer scrollToSection={() => {}} />
    </div>
  );
};

export default PrivacyPolicyPage;
