import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PrivacyPolicyPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 sm:p-12 mb-12 border border-gray-100 dark:border-gray-700">
          <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-teal-500 to-emerald-600 bg-clip-text text-transparent mb-8">
            Privacy Policy
          </h1>
          <div className="prose prose-teal dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 space-y-6">
            <p><strong>Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong></p>
            
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8">1. Introduction</h2>
            <p>Welcome to MBT (My Blood Test). Your privacy is critically important to us. This Privacy Policy explains how we collect, use, and protect your personal and medical information when you use our website and mobile application.</p>
            
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8">2. Data We Collect</h2>
            <p>We collect information you provide directly to us, including your name, email address, password, and the blood test documents (PDF or images) you upload for analysis. Payment information is securely processed by Stripe and is not stored on our servers.</p>
            
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8">3. How We Use Your Data</h2>
            <p>The blood test documents you upload are processed by our advanced AI system to provide you with insights. The AI analysis is strictly guided by a proprietary, verified Medical Knowledge Base to ensure accuracy. Your documents are used solely for the purpose of generating your personal report and chat history.</p>

            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8">4. Data Security</h2>
            <p>We implement strict security measures to protect your data. Your connection to our servers is encrypted using SSL. Authentication and database records are securely managed through Supabase.</p>

            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8">5. Third-Party Services</h2>
            <p>We use third-party services such as Stripe for billing and Mistral AI for complex data processing. These services have their own strict data processing agreements and privacy policies.</p>

            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8">6. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us via our Contact Page.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;
