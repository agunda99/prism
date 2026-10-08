import SpectrumRule from '../components/SpectrumRule.jsx';
import NewsletterForm from '../components/NewsletterForm.jsx';

export default function Newsletter() {
  return (
    <section className="newsletter section-pad" id="newsletter">
      <div className="newsletter-inner">
        <div className="section-kicker"><span>06</span><SpectrumRule /> NOTES FROM THE PRACTICE</div>
        <div className="newsletter-grid">
          <div>
            <h2>Signal, not<br /><em>noise.</em></h2>
            <p>Short observations on branding, measurement and African markets. Only when we have something useful to say.</p>
          </div>
          <NewsletterForm />
        </div>
      </div>
    </section>
  );
}
