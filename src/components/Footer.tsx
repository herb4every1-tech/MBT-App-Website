interface FooterProps {
  scrollToSection: (id: string) => void;
}

export default function Footer({ scrollToSection }: FooterProps) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <a href="#" className="footer-logo">MBT</a>
            <p className="footer-tagline">Your health, in your language.</p>
          </div>
          
          <div>
            <h4 className="footer-heading">Product</h4>
            <ul className="footer-links">
              <li><a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('#features'); }}>Features</a></li>
              <li><a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollToSection('#how-it-works'); }}>How It Works</a></li>
              <li><a href="#pricing" onClick={(e) => { e.preventDefault(); scrollToSection('#pricing'); }}>Pricing</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="footer-heading">Support</h4>
            <ul className="footer-links">
              <li><a href="#faq" onClick={(e) => { e.preventDefault(); scrollToSection('#faq'); }}>FAQ</a></li>
              <li><a href="#">Contact Us</a></li>
              <li><a href="#">Privacy Policy</a></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-heading">Company</h4>
            <ul className="footer-links">
              <li><a href="#">About</a></li>
              <li><a href="#">Terms & Conditions</a></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          &copy; 2025 MBT. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
