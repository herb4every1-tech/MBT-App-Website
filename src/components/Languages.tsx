import { SUPPORTED_LANGUAGES } from '../lib/languages';

export default function Languages() {
  return (
    <section id="languages" className="bg-base languages-section">
      <div className="container text-center animate-on-scroll">
        <span className="section-label">Global Reach</span>
        <h2 className="section-title display-font">Available in 66 Languages</h2>
        <p className="section-subtext mx-auto">Whether you speak Arabic, Spanish, French, Hindi, or Mandarin — MBT speaks your language.</p>
      </div>
      
      <div className="marquee-wrapper animate-on-scroll delay-1">
        <div className="marquee-content">
          {/* First set */}
          {SUPPORTED_LANGUAGES.map((lang) => (
            <div key={`first-${lang.code}`} className="language-pill">
              {lang.nativeName}
            </div>
          ))}
          {/* Duplicate set for seamless loop */}
          {SUPPORTED_LANGUAGES.map((lang) => (
            <div key={`second-${lang.code}`} className="language-pill">
              {lang.nativeName}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
