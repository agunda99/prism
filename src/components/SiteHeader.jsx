import { useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import Wordmark from './Wordmark.jsx';

const links = [
  ['What we do', '#services'],
  ['How we work', '#process'],
  ['Ways to work together', '#packages'],
  ['About Prism', '#about'],
];

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <a className="skip-link" href="#main">Skip to content</a>
      <div className="header-inner">
        <Wordmark light />
        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
        <nav
          id="primary-navigation"
          className={menuOpen ? 'main-nav nav-open' : 'main-nav'}
          aria-label="Main navigation"
        >
          {links.map(([label, href]) => (
            <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>
          ))}
          <a className="nav-contact" href="#contact-form" onClick={() => setMenuOpen(false)}>
            Start a conversation <ArrowUpRight size={15} />
          </a>
        </nav>
      </div>
    </header>
  );
}
