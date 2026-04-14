import { Bot, Globe, Files, History, FileDown, ShieldCheck } from 'lucide-react';

export default function Features() {
  return (
    <section id="features" className="bg-base">
      <div className="container">
        <div className="text-center animate-on-scroll">
          <span className="section-label">What's Included</span>
          <h2 className="section-title display-font">Everything you need to understand your health</h2>
        </div>
        
        <div className="features-grid">
          <div className="feature-card animate-on-scroll delay-1">
            <div className="feature-icon">
              <Bot className="text-[var(--accent-primary)]" size={28} />
            </div>
            <h3 className="feature-title display-font">AI Comprehensive Analysis</h3>
            <p>Detailed breakdown of every value</p>
          </div>
          
          <div className="feature-card animate-on-scroll delay-2">
            <div className="feature-icon">
              <Globe className="text-[var(--accent-primary)]" size={28} />
            </div>
            <h3 className="feature-title display-font">66 Languages</h3>
            <p>Get results in your native language</p>
          </div>
          
          <div className="feature-card animate-on-scroll delay-3">
            <div className="feature-icon">
              <Files className="text-[var(--accent-primary)]" size={28} />
            </div>
            <h3 className="feature-title display-font">Multi-file Upload</h3>
            <p>Upload multiple images or one PDF</p>
          </div>
          
          <div className="feature-card animate-on-scroll delay-1">
            <div className="feature-icon">
              <History className="text-[var(--accent-primary)]" size={28} />
            </div>
            <h3 className="feature-title display-font">Analysis History</h3>
            <p>Access all your past reports anytime</p>
          </div>
          
          <div className="feature-card animate-on-scroll delay-2">
            <div className="feature-icon">
              <FileDown className="text-[var(--accent-primary)]" size={28} />
            </div>
            <h3 className="feature-title display-font">Download as PDF</h3>
            <p>Save and share your health report</p>
          </div>
          
          <div className="feature-card animate-on-scroll delay-3">
            <div className="feature-icon">
              <ShieldCheck className="text-[var(--accent-primary)]" size={28} />
            </div>
            <h3 className="feature-title display-font">Private & Secure</h3>
            <p>Your health data is encrypted and safe</p>
          </div>
        </div>
      </div>
    </section>
  );
}
