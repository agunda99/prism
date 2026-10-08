import { ArrowDownRight, ArrowRight } from 'lucide-react';

function PrismIllustration() {
  return (
    <div className="prism-illustration" aria-label="A prism separating white light into a spectrum">
      <div className="illustration-label label-in">ONE BUSINESS.<br />A LOT OF SIGNAL.</div>
      <div className="light-beam" />
      <svg className="prism-shape" viewBox="0 0 230 240" role="img" aria-hidden="true">
        <polygon points="115,12 220,212 10,212" />
        <line x1="115" y1="12" x2="10" y2="212" />
        <line x1="115" y1="12" x2="220" y2="212" />
        <line x1="10" y1="212" x2="220" y2="212" />
      </svg>
      <div className="spectrum-rays" aria-hidden="true"><i /><i /><i /><i /><i /></div>
      <div className="illustration-label label-out">CLEAR SIGNAL.<br />REAL PREFERENCE.</div>
      <div className="illustration-caption"><span>01 / 05</span> White light in. Clear spectrum out.</div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero-grain" aria-hidden="true" />
      <div className="hero-inner">
        <div className="hero-copy">
          <p className="eyebrow eyebrow-light"><span className="eyebrow-mark" /> INDEPENDENT BRAND PRACTICE · NAIROBI</p>
          <h1>Brands that sell<br />before they <em>pitch.</em></h1>
          <p className="hero-intro">The right perception changes everything: what people choose, what they’ll pay and what they remember.</p>
          <div className="hero-actions">
            <a className="button button-light" href="#contact-form">Start with a diagnostic <ArrowRight size={17} /></a>
            <a className="text-link text-link-light" href="#services">Explore the spectrum <ArrowDownRight size={16} /></a>
          </div>
          <div className="hero-proof">
            <span className="proof-line" />
            <span>Senior strategist leads.<br /><strong>Specialists execute.</strong></span>
          </div>
        </div>
        <PrismIllustration />
        <div className="hero-side-note">STRATEGY <span>—</span> ANALYTICS <span>—</span> ENGAGEMENT</div>
      </div>
      <div className="hero-bottom">
        <span>01 / THE BELIEF</span>
        <span>BUILT FOR AFRICAN MARKET REALITIES. HELD TO GLOBAL STANDARDS.</span>
        <a href="#belief" aria-label="Scroll to the belief"><ArrowDownRight size={17} /></a>
      </div>
    </section>
  );
}
