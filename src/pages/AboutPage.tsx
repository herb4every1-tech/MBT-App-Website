import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ShieldCheck, Activity, BookOpen } from 'lucide-react';

const AboutPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1A1F1C] transition-colors duration-300">
      <Navbar scrolled={true} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-serif text-[#1A1F1C] mb-6 leading-tight">
            Democratizing <span className="text-[#4A7C59]">Health Insights</span>
          </h1>
          <p className="text-lg md:text-xl text-[#5A6B61] max-w-3xl mx-auto leading-relaxed">
            At MBT (My Blood Test), we believe everyone deserves to understand their own biology. We bridge the gap between complex medical jargon and actionable, everyday language.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-[#E5EDE8]">
            <div className="w-14 h-14 bg-[#D4E6DA] rounded-2xl flex items-center justify-center mb-6">
              <Activity className="w-7 h-7 text-[#4A7C59]" />
            </div>
            <h3 className="text-xl font-bold text-[#1A1F1C] mb-4">Our Mission</h3>
            <p className="text-[#5A6B61] leading-relaxed">
              To empower individuals to take control of their health by transforming confusing blood test result numbers into clear, personalized, and actionable lifestyle plans.
            </p>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-[#E5EDE8]">
            <div className="w-14 h-14 bg-[#D4E6DA] rounded-2xl flex items-center justify-center mb-6">
              <ShieldCheck className="w-7 h-7 text-[#4A7C59]" />
            </div>
            <h3 className="text-xl font-bold text-[#1A1F1C] mb-4">Privacy First</h3>
            <p className="text-[#5A6B61] leading-relaxed">
              Your health data is deeply personal. We employ state-of-the-art encryption to ensure your medical information remains yours alone.
            </p>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-[#E5EDE8]">
            <div className="w-14 h-14 bg-[#D4E6DA] rounded-2xl flex items-center justify-center mb-6">
              <BookOpen className="w-7 h-7 text-[#4A7C59]" />
            </div>
            <h3 className="text-xl font-bold text-[#1A1F1C] mb-4">Verified Knowledge</h3>
            <p className="text-[#5A6B61] leading-relaxed">
              Our AI is anchored to a meticulously curated Medical Knowledge Base built from top-level, verified medical sources to prevent hallucinations.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-sm p-8 sm:p-16 border border-[#E5EDE8]">
          <h2 className="text-3xl font-serif text-[#1A1F1C] mb-8">The Technology Behind MBT</h2>
          <div className="prose prose-slate max-w-none space-y-6">
            <p className="text-[#5A6B61] text-lg leading-relaxed">
              When you upload a blood test, our system uses Optical Character Recognition (OCR) to accurately extract the data points. That data is then analyzed by our advanced Large Language Model.
            </p>
            <p className="text-[#5A6B61] text-lg leading-relaxed">
              <strong>However, AI can make mistakes.</strong> That is why we constructed the <em className="text-[#4A7C59] font-semibold">MBT Verified Knowledge Base</em>. Before the AI makes any recommendation, it queries our internal database of verified medical documents.
            </p>
            <p className="text-sm italic mt-8 text-[#9BABA0]">
              Disclaimer: MBT is an educational tool. Always consult your primary care physician before making major dietary or medical changes.
            </p>
          </div>
        </div>
      </main>
      <Footer scrollToSection={() => {}} />
    </div>
  );
};

export default AboutPage;
