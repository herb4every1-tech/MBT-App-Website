import React from 'react';

interface AuthLeftPanelProps {
  leftPanelRef: React.RefObject<HTMLDivElement>;
}

export default function AuthLeftPanel({ leftPanelRef }: AuthLeftPanelProps) {
  return (
    <div 
      ref={leftPanelRef}
      className="hidden lg:flex w-[45%] relative overflow-hidden flex-col justify-center items-center p-12"
    >
      <div className="absolute inset-0 z-0">
        <img 
          src="https://lh3.googleusercontent.com/d/1xPGw5lHv1XozQDaRwMENkGIEfLvzMS-b" 
          alt="Background" 
          className="w-full h-full object-cover scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f0d]/40 via-[#0a0f0d]/60 to-[#0a0f0d]/90 backdrop-blur-[2px]" />
      </div>

      <div className="z-10 flex flex-col items-center text-center max-w-md w-full">
        <div className="mb-16">
          <span className="display-font text-white text-[28px] tracking-[0.2em] uppercase">MBT</span>
        </div>
        
        <h1 
          className="display-font italic text-[56px] leading-[1.1] mb-8 drop-shadow-2xl"
          style={{ color: '#FDE68A' }}
        >
          Your health,<br />understood.
        </h1>
        
        <p className="font-sans text-white/80 text-[18px] mb-16 font-light leading-relaxed px-4">
          Upload your blood test and get AI analysis in your language.
        </p>

        <div className="flex flex-col gap-5 items-center w-full mb-24">
          {['AI-powered analysis', '66 languages supported', 'Private and secure'].map((text, i) => (
            <div key={i} className="flex items-center gap-4 text-white/90 font-sans text-[15px] tracking-wide font-light">
              <div className="w-1.5 h-1.5 rotate-45 bg-[#D4E6DA]/80" />
              <span>{text}</span>
            </div>
          ))}
        </div>

        <div className="w-full border-t border-white/10 pt-8 mt-auto">
          <p className="text-white/40 text-[11px] tracking-[0.2em] uppercase font-medium">© 2025 MBT. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
