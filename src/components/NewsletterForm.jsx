import { useState } from 'react';
import { ArrowRight } from 'lucide-react';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [hp, setHp] = useState('');
  const [status, setStatus] = useState('idle');
  const [newsletterStatus, setNewsletterStatus] = useState('not_configured');
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setStatus('sending');
    setError('');

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, consent, hp }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'We could not add you to the list.');
      setStatus('success');
      setNewsletterStatus(result.newsletterStatus || 'not_configured');
      setEmail('');
      setConsent(false);
    } catch (submitError) {
      setStatus('error');
      setError(submitError.message || 'We could not add you to the list. Please try again.');
    }
  }

  return (
    <form className="newsletter-form" onSubmit={submit}>
      <label htmlFor="newsletter-email">Your email</label>
      <div className="newsletter-input-row">
        <input
          id="newsletter-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <button type="submit" aria-label="Subscribe to Prism notes" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : <>Keep me posted <ArrowRight size={16} /></>}
        </button>
      </div>
      <label className="newsletter-consent">
        <input
          type="checkbox"
          name="consent"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          required
        />
        <span>I agree to receive occasional emails from Prism. I can unsubscribe anytime.</span>
      </label>
      <label className="newsletter-honeypot" aria-hidden="true">
        Leave this field empty
        <input
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={hp}
          onChange={(event) => setHp(event.target.value)}
        />
      </label>
      <p className={`newsletter-status newsletter-status-${status}`} role="status" aria-live="polite">
        {status === 'success' && newsletterStatus === 'synced' && 'You’re on the list. Thanks for joining us.'}
        {status === 'success' && newsletterStatus === 'not_configured'
          && 'Your signup has been saved. Newsletter delivery is not connected yet.'}
        {status === 'success' && newsletterStatus === 'failed'
          && 'Your signup has been saved, but newsletter sync failed. Please try again later.'}
        {status === 'error' && <>{error} <a href="mailto:pipinstall85@gmail.com">Email Prism directly</a>.</>}
        {status === 'idle' && 'Occasional notes on brands, measurement and African markets. No noise.'}
      </p>
    </form>
  );
}
