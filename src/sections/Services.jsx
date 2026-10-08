import { ArrowUpRight } from 'lucide-react';
import SpectrumRule from '../components/SpectrumRule.jsx';
import { services } from '../data/siteContent.js';

export default function Services() {
  return (
    <section className="services section-pad" id="services">
      <div className="section-kicker section-kicker-light"><span>02</span><SpectrumRule /> THE FULL SPECTRUM</div>
      <div className="section-heading">
        <h2>One brand.<br /><em>Every</em> angle.</h2>
        <p>Strategy, analytics and engagement—connected from the first question to the measurable outcome.</p>
      </div>
      <div className="services-list">
        {services.map((service) => (
          <article className="service-row" key={service.number}>
            <span className="service-number">{service.number}</span>
            <h3>{service.title}</h3>
            <p>{service.description}</p>
            <span className="service-details">{service.details}</span>
            <ArrowUpRight className="service-arrow" size={19} />
          </article>
        ))}
      </div>
      <div className="services-footnote"><SpectrumRule /><span>FULL SPECTRUM BRANDING. ONE ACCOUNTABLE LEAD.</span></div>
    </section>
  );
}
