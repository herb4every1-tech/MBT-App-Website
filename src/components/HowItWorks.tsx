import { Upload, Globe, Sparkles } from 'lucide-react';

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-soft">
      <div className="container">
        <div className="text-center animate-on-scroll">
          <span className="section-label">Simple Process</span>
          <h2 className="section-title display-font">Three steps to understand your health</h2>
        </div>
        
        <div className="steps-grid">
          <div className="step-card animate-on-scroll delay-1">
            <div className="step-header">
              <div className="step-icon">
                <Upload className="text-[var(--accent-primary)]" size={24} />
              </div>
              <div className="step-number">01</div>
            </div>
            <h3 className="step-title display-font">Upload Your Report</h3>
            <p>Upload a photo or PDF of your blood test from any lab</p>
          </div>
          
          <div className="step-card animate-on-scroll delay-2">
            <div className="step-header">
              <div className="step-icon">
                <Globe className="text-[var(--accent-primary)]" size={24} />
              </div>
              <div className="step-number">02</div>
            </div>
            <h3 className="step-title display-font">Choose Your Language</h3>
            <p>Select from 66 languages for results in your native tongue</p>
          </div>
          
          <div className="step-card animate-on-scroll delay-3">
            <div className="step-header">
              <div className="step-icon">
                <Sparkles className="text-[var(--accent-primary)]" size={24} />
              </div>
              <div className="step-number">03</div>
            </div>
            <h3 className="step-title display-font">Get Your AI Analysis</h3>
            <p>Receive a detailed breakdown with health recommendations instantly</p>
          </div>
        </div>
      </div>
    </section>
  );
}
