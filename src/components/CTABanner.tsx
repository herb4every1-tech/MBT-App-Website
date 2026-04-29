import { Link } from 'react-router-dom';

interface CTABannerProps {
  scrollToSection: (id: string) => void;
}

export default function CTABanner({ scrollToSection }: CTABannerProps) {
  return (
    <section className="bg-base" style={{ paddingTop: 0 }}>
      <div className="container">
        <div className="cta-banner animate-on-scroll" style={{ position: 'relative', overflow: 'hidden', borderRadius: '24px', padding: 0, backgroundColor: 'transparent' }}>
          
          {/* Background Image */}
          <div style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
          }}>
            <img 
              src="assets/images/cta-banner.png" 
              alt="Background" 
              className="w-full h-full object-cover"
            />
            {/* Optional overlay for better text readability if needed */}
            <div className="absolute inset-0 bg-black/20" />
          </div>

          {/* All existing CTA content stays here, on top */}
          <div style={{ 
            position: 'relative', 
            zIndex: 1,
            padding: '80px 40px',
            textAlign: 'center'
          }}>
            <h2 className="section-title display-font text-white">Take control of your health today</h2>
            <p className="section-subtext text-white/90">Join thousands using MBT to understand their blood tests in their own language.</p>
            <Link to="/login" className="btn btn-white" style={{ borderRadius: '100px' }}>Get Started Free</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
