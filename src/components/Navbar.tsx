import { Menu, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface NavbarProps {
  scrolled: boolean;
  isMenuOpen: boolean;
  toggleMenu: () => void;
  scrollToSection: (id: string) => void;
  session?: any;
}

export default function Navbar({ scrolled, isMenuOpen, toggleMenu, scrollToSection, session }: NavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavClick = (id: string) => {
    if (location.pathname !== '/') {
      navigate('/' + id);
    } else {
      scrollToSection(id);
    }
    if (isMenuOpen) toggleMenu();
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} id="navbar">
      <div className="container nav-container">
        <Link to="/" className="logo flex items-center">
          <img 
            src="https://lh3.googleusercontent.com/d/1z1JsfrefDz8_aihQsWmDlE7QGB9pESm3" 
            alt="MBT Logo" 
            style={{ height: '40px', width: 'auto', display: 'block' }}
            referrerPolicy="no-referrer"
          />
        </Link>
        
        <div className="nav-links">
          <button onClick={() => handleNavClick('#hero')} className="nav-link bg-transparent border-none cursor-pointer">Home</button>
          <button onClick={() => handleNavClick('#how-it-works')} className="nav-link bg-transparent border-none cursor-pointer">How It Works</button>
          <button onClick={() => handleNavClick('#features')} className="nav-link bg-transparent border-none cursor-pointer">Features</button>
          <button onClick={() => handleNavClick('#pricing')} className="nav-link bg-transparent border-none cursor-pointer">Pricing</button>
          <button onClick={() => handleNavClick('#faq')} className="nav-link bg-transparent border-none cursor-pointer">FAQ</button>
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
