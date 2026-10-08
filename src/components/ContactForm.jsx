import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';

const initialForm = { name: '', email: '', organization: '', message: '', hp: '' };

export default function ContactForm() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [notificationStatus, setNotificationStatus] = useState('not_configured');

  function update(field) {
    return (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setStatus('sending');
    setError('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Your message could not be sent.');
      setStatus('success');
      setNotificationStatus(result.notificationStatus || 'not_configured');
      setForm(initialForm);
    } catch (submitError) {
      setStatus('error');
      setError(submitError.message || 'Your message could not be sent. Please try again.');
    }
  }

  return (
    <form className="contact-form" id="contact-form" onSubmit={submit}>
      <div className="contact-form-fields">
        <label>
          Your name
          <input name="name" autoComplete="name" value={form.name} onChange={update('name')} required />
        </label>
        <label>
          Work email
          <input name="email" type="email" autoComplete="email" value={form.email} onChange={update('email')} required />
        </label>
        <label>
          Organization
          <input name="organization" autoComplete="organization" value={form.organization} onChange={update('organization')} required />
        </label>
        <label>
          What are you working through?
          <textarea name="message" rows="3" value={form.message} onChange={update('message')} required />
        </label>
      </div>
      <label className="form-honeypot" aria-hidden="true">
        Leave this field empty
        <input name="hp" tabIndex="-1" autoComplete="off" value={form.hp} onChange={update('hp')} />
      </label>
      <div className="contact-form-actions">
        <button className="button button-light" type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : 'Send enquiry'} <ArrowUpRight size={17} />
        </button>
        <p className={`form-status form-status-${status}`} role="status" aria-live="polite">
          {status === 'success' && notificationStatus === 'sent' && 'Thanks. Your enquiry is with us.'}
          {status === 'success' && notificationStatus === 'not_configured'
            && 'Your enquiry has been saved. Email notifications are not configured yet.'}
          {status === 'success' && notificationStatus === 'failed'
            && <>Your enquiry was saved, but the email notification failed. <a href="mailto:pipinstall85@gmail.com">Email Prism directly</a>.</>}
          {status === 'error' && error}
        </p>
      </div>
    </form>
  );
}
