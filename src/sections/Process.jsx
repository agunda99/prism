import SpectrumRule from '../components/SpectrumRule.jsx';
import { process } from '../data/siteContent.js';

export default function Process() {
  return (
    <section className="process section-pad" id="process">
      <div className="section-kicker"><span>03</span><SpectrumRule /> HOW THE WORK MOVES</div>
      <div className="section-heading process-heading">
        <h2>Clear thinking.<br /><em>Visible</em> progress.</h2>
        <p>No black box. You’ll know what we’re learning, what we’re making and how it’s working.</p>
      </div>
      <div className="process-track">
        {process.map(([number, title, description], index) => (
          <article className="process-step" key={number}>
            <div className="step-marker"><span>{number}</span><i className={`step-dot dot-${index + 1}`} /></div>
            <h3>{title}</h3>
            <p>{description}</p>
          </article>
        ))}
      </div>
      <div className="process-note"><span className="mono">01 — 05</span> Good brand work doesn’t end at launch. That’s where the learning begins.</div>
    </section>
  );
}
