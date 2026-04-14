import React from 'react';
import { motion } from 'motion/react';
import { Mail, ArrowLeft } from 'lucide-react';

interface EmailConfirmationProps {
  email: string;
  onBackToLogin: () => void;
  onResend: () => void;
}

export default function EmailConfirmation({ email, onBackToLogin, onResend }: EmailConfirmationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-[480px] bg-white rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-8 md:p-12 flex flex-col items-center text-center my-auto border border-white/80"
    >
      {/* Icon Header */}
      <div className="mb-8">
        <div className="w-20 h-20 bg-[#F0F4F2] rounded-3xl flex items-center justify-center relative">
          {/* Glow effect animation */}
          <motion.div 
            animate={{ 
              boxShadow: [
                "0 0 5px rgba(93, 138, 117, 0.1)", 
                "0 0 20px rgba(93, 138, 117, 0.2)", 
                "0 0 5px rgba(93, 138, 117, 0.1)"
              ] 
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-3xl"
          />
          <Mail className="w-10 h-10 text-[#5D8A75] relative z-10" strokeWidth={1.5} />
        </div>
      </div>

      {/* Content Text */}
      <div className="mb-10">
        <h1 className="text-[32px] font-extrabold text-[#111827] tracking-tight mb-4">
          Check your email
        </h1>
        <p className="text-[#6B7280] text-[16px] leading-relaxed max-w-[320px] mx-auto">
          We've sent a verification link to <span className="font-semibold text-[#111827]">{email}</span>. Please click the link to confirm your account.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="w-full space-y-6">
        <div className="text-sm font-medium">
          <span className="text-[#6B7280]">Didn't receive the email?</span>
          <button 
            onClick={onResend}
            className="text-[#5D8A75] hover:underline ml-1 font-semibold"
          >
            Resend email
          </button>
        </div>
      </div>

      {/* Footer Link */}
      <div className="mt-12 pt-8 border-t border-gray-100 w-full">
        <button 
          onClick={onBackToLogin}
          className="inline-flex items-center text-[#6B7280] hover:text-[#111827] transition-colors font-semibold text-sm group"
        >
          <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
          Back to login
        </button>
      </div>

      {/* Bottom Support Link */}
      <div className="mt-12">
        <a 
          href="#" 
          onClick={(e) => e.preventDefault()}
          className="text-[11px] font-bold tracking-[0.1em] text-[#9CA3AF] uppercase hover:text-[#6B7280] transition-colors"
        >
          Help Center & Support
        </a>
      </div>
    </motion.div>
  );
}
