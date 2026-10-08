import { ArrowUpRight } from 'lucide-react';
import SpectrumRule from '../components/SpectrumRule.jsx';
import ContactForm from '../components/ContactForm.jsx';

export default function Contact() {
  return (
    <section className="contact" id="contact">
      <div className="contact-inner">
        <div className="section-kicker section-kicker-light"><span>07</span><SpectrumRule /> THE NEXT MOVE</div>
        <div className="contact-grid">
          <div>
            <p className="contact-pretitle">SOMETHING ON YOUR MIND?</p>
            <h2>Let’s make it<br /><em>clear.</em></h2>
          </div>
          <div className="contact-copy">
            <p>Start with a paid diagnostic conversation. We’ll understand the question, then recommend a clear scope before any larger engagement.</p>
            <a className="text-link text-link-light" href="#contact-form">Tell us what you’re working through <ArrowUpRight size={15} /></a>
            <a className="contact-direct-email" href="mailto:pipinstall85@gmail.com">Or email us directly: pipinstall85@gmail.com</a>
          </div>
        </div>
        <ContactForm />
        <div className="contact-signature"><SpectrumRule /><span>BRANDS THAT SELL BEFORE THEY PITCH.</span></div>
      </div>
    </section>
  );
}
