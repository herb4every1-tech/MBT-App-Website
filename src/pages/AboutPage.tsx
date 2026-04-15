import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ShieldCheck, Activity, BookOpen } from 'lucide-react';

const AboutPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0f18] text-zinc-300 transition-colors duration-300">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Democratizing <span className="bg-gradient-to-r from-teal-400 to-emerald-500 bg-clip-text text-transparent">Health Insights</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 max-w-3xl mx-auto">
            At MBT (My Blood Test), we believe everyone deserves to understand their own biology. We bridge the gap between complex medical jargon and actionable, everyday language.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-3xl shadow-sm border border-slate-800">
            <div className="w-14 h-14 bg-teal-950/30 rounded-2xl flex items-center justify-center mb-6 border border-teal-500/20">
              <Activity className="w-7 h-7 text-teal-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4 italic font-serif">Our Mission</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              To empower individuals to take control of their health by transforming confusing blood test result numbers into clear, personalized, and actionable lifestyle plans.
            </p>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-3xl shadow-sm border border-slate-800">
            <div className="w-14 h-14 bg-emerald-950/30 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20">
              <ShieldCheck className="w-7 h-7 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4 italic font-serif">Privacy First</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Your health data is deeply personal. We employ state-of-the-art encryption and strictly adhere to privacy standards to ensure your medical information remains yours alone.
            </p>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-3xl shadow-sm border border-slate-800">
            <div className="w-14 h-14 bg-blue-950/30 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20">
              <BookOpen className="w-7 h-7 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4 italic font-serif">Verified Knowledge</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Our AI doesn't guess. It is anchored to a meticulously curated Medical Knowledge Base built from top-level, verified medical sources to prevent hallucinations and errors.
            </p>
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-12 border border-slate-800">
          <h2 className="text-3xl font-bold text-white mb-6 italic font-serif">The Technology Behind MBT</h2>
          <div className="prose prose-invert prose-teal max-w-none space-y-6">
            <p className="text-zinc-400">
              When you upload a blood test, our system uses Optical Character Recognition (OCR) to accurately extract the data points. That data is then analyzed by our advanced Large Language Model.
            </p>
            <p className="text-zinc-400">
              <strong>However, AI can make mistakes.</strong> That is why we constructed the <em className="text-teal-400 italic">MBT Verified Knowledge Base</em>. Before the AI makes any recommendation or analysis, it queries our internal database of verified medial documents and guidelines. The AI is strictly instructed to base its answers <em>only</em> on this verified context, ensuring your analysis is safe, reliable, and deeply accurate.
            </p>
            <p className="text-sm italic mt-8 text-zinc-500">
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
