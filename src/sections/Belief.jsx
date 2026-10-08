import { ArrowUpRight } from 'lucide-react';
import SpectrumRule from '../components/SpectrumRule.jsx';

export default function Belief() {
  return (
    <section className="belief section-pad" id="belief">
      <div className="section-kicker"><span>01</span><SpectrumRule /> THE PRISM POINT OF VIEW</div>
      <div className="belief-grid">
        <h2>Branding is<br /><span>perception</span><br />control.</h2>
        <div className="belief-copy">
          <p className="belief-lead">It shapes what customers think you are, why you’re different and why you’re worth choosing.</p>
          <p>Get that right and the impact travels: stronger trust, sharper preference, more pricing power and marketing that works harder. Not a prettier surface. A commercial advantage.</p>
          <a className="text-link" href="#about">Why Prism sees it this way <ArrowUpRight size={15} /></a>
        </div>
      </div>
      <div className="outcome-strip">
        {['CHOSEN', 'PAID MORE FOR', 'REMEMBERED'].map((word, index) => (
          <div className="outcome" key={word}><span>0{index + 1}</span><strong>{word}</strong></div>
        ))}
      </div>
    </section>
  );
}
