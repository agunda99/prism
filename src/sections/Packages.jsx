import { ArrowUpRight } from 'lucide-react';
import SpectrumRule from '../components/SpectrumRule.jsx';
import { packages } from '../data/siteContent.js';

export default function Packages() {
  return (
    <section className="packages section-pad" id="packages">
      <div className="section-kicker"><span>04</span><SpectrumRule /> A GOOD PLACE TO START</div>
      <div className="section-heading packages-heading">
        <h2>Right-sized for<br /><em>what’s next.</em></h2>
        <p>Start with the question in front of you. We’ll shape the right scope around it.</p>
      </div>
      <div className="package-grid">
        {packages.map((item) => (
          <article className={`package-card${item.featured ? ' package-featured' : ''}`} key={item.index}>
            <div className="package-top">
              <span>{item.index} / OFFERING</span>
              {item.featured && <span className="package-tag">THE CONNECTED SYSTEM</span>}
            </div>
            <div>
              <h3>{item.name}</h3>
              <p className="package-description">{item.description}</p>
            </div>
            <div className="package-bottom">
              <p>{item.includes}</p>
              <a href="#contact-form" aria-label={`Ask about ${item.name}`}><ArrowUpRight size={18} /></a>
            </div>
          </article>
        ))}
      </div>
      <p className="packages-note">Every engagement starts with a paid diagnostic. Not sure which one fits? That’s a good first conversation.</p>
    </section>
  );
}
