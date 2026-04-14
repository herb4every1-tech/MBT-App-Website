import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NavbarProps {
  scrolled: boolean;
  isMenuOpen: boolean;
  toggleMenu: () => void;
  scrollToSection: (id: string) => void;
  session?: any;
}

export default function Navbar({ scrolled, isMenuOpen, toggleMenu, scrollToSection, session }: NavbarProps) {
  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} id="navbar">
      <div className="container nav-container">
        <a href="#" className="logo flex items-center">
          <img 
            src="https://lh3.googleusercontent.com/d/1z1JsfrefDz8_aihQsWmDlE7QGB9pESm3" 
            alt="MBT Logo" 
            style={{ height: '40px', width: 'auto', display: 'block' }}
            referrerPolicy="no-referrer"
          />
        </a>
        
        <div className="nav-links">
          <a href="#hero" onClick={(e) => { e.preventDefault(); scrollToSection('#hero'); }} className="nav-link">Home</a>
          <a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollToSection('#how-it-works'); }} className="nav-link">How It Works</a>
          <a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('#features'); }} className="nav-link">Features</a>
          <a href="#pricing" onClick={(e) => { e.preventDefault(); scrollToSection('#pricing'); }} className="nav-link">Pricing</a>
          <a href="#faq" onClick={(e) => { e.preventDefault(); scrollToSection('#faq'); }} className="nav-link">FAQ</a>
        </div>

        <div className="nav-buttons">
          {session ? (
            <Link to="/dashboard" className="btn btn-primary">Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">Log In</Link>
              <Link to="/login" className="btn btn-primary">Get Started Free</Link>
            </>
          )}
        </div>

        <button className={`hamburger ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu} aria-label="Toggle menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
}
