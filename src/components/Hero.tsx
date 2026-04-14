import { Dna, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeroProps {
  scrollToSection: (id: string) => void;
}

export default function Hero({ scrollToSection }: HeroProps) {
  return (
    <section id="hero" className="hero">
      <div className="container hero-content">
        <div className="hero-text">
          <div className="hero-pill hero-fade-in delay-1">
            <span className="flex items-center gap-2"><Dna size={16} className="text-[var(--accent-primary)]" /> AI-Powered Blood Analysis</span>
          </div>
          <h1 className="hero-headline display-font italic hero-fade-in delay-2">
            Understand Your Blood Test — In Any Language.
          </h1>
          <p className="hero-subheadline hero-fade-in delay-3">
            Upload your blood test report, choose your language, and get a detailed AI analysis with health recommendations in seconds.
          </p>
          <div className="hero-buttons hero-fade-in delay-4">
            <Link to="/login" className="btn btn-primary">Get Started Free</Link>
            <a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollToSection('#how-it-works'); }} className="btn btn-ghost">See How It Works</a>
          </div>
          <div className="hero-trust hero-fade-in delay-4 flex gap-4 text-sm text-[var(--text-muted)]">
            <span className="flex items-center gap-1"><Check size={16} className="text-[var(--accent-primary)]" /> Free to start</span>
            <span className="flex items-center gap-1"><Check size={16} className="text-[var(--accent-primary)]" /> No doctor needed</span>
            <span className="flex items-center gap-1"><Check size={16} className="text-[var(--accent-primary)]" /> 66 languages</span>
          </div>
        </div>
        <div className="hero-image-wrapper hero-fade-in delay-3">
          <img src="https://lh3.googleusercontent.com/d/1k7S1RiKfLs95LAc5z4JvdTMbCpj1Og3B" alt="MBT App Interface Mockup" className="hero-image" width="480" height="480" loading="eager" decoding="async" />
        </div>
      </div>
    </section>
  );
}
