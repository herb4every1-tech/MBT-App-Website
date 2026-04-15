import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ShieldCheck, Activity, BookOpen } from 'lucide-react';

const AboutPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Democratizing <span className="bg-gradient-to-r from-teal-500 to-emerald-600 bg-clip-text text-transparent">Health Insights</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            At MBT (My Blood Test), we believe everyone deserves to understand their own biology. We bridge the gap between complex medical jargon and actionable, everyday language.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="w-14 h-14 bg-teal-100 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center mb-6">
              <Activity className="w-7 h-7 text-teal-600 dark:text-teal-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h3>
            <p className="text-gray-600 dark:text-gray-400">
              To empower individuals to take control of their health by transforming confusing blood test result numbers into clear, personalized, and actionable lifestyle plans.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mb-6">
              <ShieldCheck className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Privacy First</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your health data is deeply personal. We employ state-of-the-art encryption and strictly adhere to privacy standards to ensure your medical information remains yours alone.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6">
              <BookOpen className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Verified Knowledge</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Our AI doesn't guess. It is anchored to a meticulously curated Medical Knowledge Base built from top-level, verified medical sources to prevent hallucinations and errors.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 sm:p-12 border border-gray-100 dark:border-gray-700">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">The Technology Behind MBT</h2>
          <div className="prose prose-teal dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 space-y-6">
            <p>
              When you upload a blood test, our system uses Optical Character Recognition (OCR) to accurately extract the data points. That data is then analyzed by our advanced Large Language Model.
            </p>
            <p>
              <strong>However, AI can make mistakes.</strong> That is why we constructed the <em>MBT Verified Knowledge Base</em>. Before the AI makes any recommendation or analysis, it queries our internal database of verified medial documents and guidelines. The AI is strictly instructed to base its answers <em>only</em> on this verified context, ensuring your analysis is safe, reliable, and deeply accurate.
            </p>
            <p className="text-sm italic mt-8 text-gray-500 dark:text-gray-400">
              Disclaimer: MBT is an educational tool. Always consult your primary care physician before making major dietary or medical changes.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;
