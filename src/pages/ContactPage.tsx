import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Mail, MessageCircle, Send, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, MessageCircle, Send, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MobileMenu from '../components/MobileMenu';

const ContactPage: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    document.body.style.overflow = !isMenuOpen ? 'hidden' : '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    
    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert([formData]);

      if (error) throw error;
      setStatus('success');
    } catch (err) {
      console.error('Contact submit error:', err);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1A1F1C] transition-colors duration-300">
      <Navbar scrolled={true} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-serif text-[#1A1F1C] mb-6 leading-tight">
            Get in <span className="text-[#4A7C59]">Touch</span>
          </h1>
          <p className="text-lg md:text-xl text-[#5A6B61] max-w-2xl mx-auto leading-relaxed">
            Have questions about our AI analysis, subscriptions, or the platform? We're here to help.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-[#E5EDE8]">
              <h3 className="text-2xl font-bold text-[#1A1F1C] mb-6 italic font-serif">Contact Information</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#D4E6DA] rounded-full flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6 text-[#4A7C59]" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-[#1A1F1C]">Email Support</h4>
                    <p className="text-[#5A6B61] text-sm mt-1">Our team typically replies within 24 hours.</p>
                    <a href="mailto:herb4every1@gmail.com" className="text-[#4A7C59] font-medium hover:underline mt-2 inline-block">herb4every1@gmail.com</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#EBF4EE] rounded-full flex items-center justify-center shrink-0">
                    <MessageCircle className="w-6 h-6 text-[#4A7C59]" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-[#1A1F1C]">Feedback</h4>
                    <p className="text-[#5A6B61] text-sm mt-1">Found a bug or have a suggestion? We'd love to hear from you to improve the MBT platform.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-[#E5EDE8]">
            {status === 'success' ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-100">
                  <Send className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-[#1A1F1C] mb-2">Message Sent!</h3>
                <p className="text-[#5A6B61]">We've received your message and will get back to you shortly.</p>
                <button 
                  onClick={() => setStatus('idle')}
                  className="mt-8 px-6 py-2 bg-[#FAFAF8] text-[#1A1F1C] rounded-xl font-medium hover:bg-[#F3F4EF] transition-colors"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {status === 'error' && (
                  <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-xl mb-6 border border-red-100">
                    <AlertCircle className="w-5 h-5" />
                    <p className="text-sm">Something went wrong. Please try again later.</p>
                  </div>
                )}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-[#5A6B61] mb-2">Full Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#FAFAF8] border border-[#E5EDE8] text-[#1A1F1C] focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent outline-none transition-all placeholder:text-[#9BABA0]"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[#5A6B61] mb-2">Email Address</label>
                  <input 
                    type="email" 
                    id="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#FAFAF8] border border-[#E5EDE8] text-[#1A1F1C] focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent outline-none transition-all placeholder:text-[#9BABA0]"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-[#5A6B61] mb-2">Subject</label>
                  <input 
                    type="text" 
                    id="subject" 
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#FAFAF8] border border-[#E5EDE8] text-[#1A1F1C] focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent outline-none transition-all placeholder:text-[#9BABA0]"
                    placeholder="How can we help?"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-[#5A6B61] mb-2">Message</label>
                  <textarea 
                    id="message" 
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#FAFAF8] border border-[#E5EDE8] text-[#1A1F1C] focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent outline-none transition-all placeholder:text-[#9BABA0] resize-none"
                    placeholder="Write your message here..."
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  disabled={status === 'sending'}
                  className="w-full py-4 rounded-xl bg-[#4A7C59] text-white font-bold text-lg hover:shadow-lg hover:shadow-[#4A7C59]/20 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {status === 'sending' ? (
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>Send Message <Send className="w-5 h-5 ml-1" /></>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

      </main>
      <Footer scrollToSection={() => {}} />
    </div>
  );
};

export default ContactPage;
