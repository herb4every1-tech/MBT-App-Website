import { Link } from 'react-router-dom';

interface MobileMenuProps {
  isMenuOpen: boolean;
  scrollToSection: (id: string) => void;
}

export default function MobileMenu({ isMenuOpen, scrollToSection }: MobileMenuProps) {
  return (
    <div className={`mobile-menu ${isMenuOpen ? 'active' : ''}`} id="mobileMenu">
      <a href="#hero" onClick={(e) => { e.preventDefault(); scrollToSection('#hero'); }} className="nav-link mobile-link">Home</a>
      <a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollToSection('#how-it-works'); }} className="nav-link mobile-link">How It Works</a>
      <a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('#features'); }} className="nav-link mobile-link">Features</a>
      <a href="#pricing" onClick={(e) => { e.preventDefault(); scrollToSection('#pricing'); }} className="nav-link mobile-link">Pricing</a>
      <a href="#faq" onClick={(e) => { e.preventDefault(); scrollToSection('#faq'); }} className="nav-link mobile-link">FAQ</a>
      <Link to="/login" className="btn btn-ghost" style={{ marginTop: '20px' }}>Log In</Link>
      <Link to="/login" className="btn btn-primary">Get Started Free</Link>
    </div>
  );
}
