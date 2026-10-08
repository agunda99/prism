import express from 'express';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import { appendFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import rateLimit from 'express-rate-limit';

const directory = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(directory, '..', 'dist');
const dataDirectory = process.env.DATA_DIR || path.join(directory, 'data');
const apiBaseUrl = (process.env.BREVO_API_BASE_URL || 'https://api.brevo.com/v3').replace(/\/$/, '');
fs.mkdirSync(dataDirectory, { recursive: true });

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '10kb' }));
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
}));

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clean = (value, maxLength = 2000) => String(value ?? '').trim().slice(0, maxLength);
const hasBrevoKey = Boolean(process.env.BREVO_API_KEY);
const hasSender = emailPattern.test(process.env.BREVO_SENDER_EMAIL || '');
const hasRecipient = emailPattern.test(process.env.CONTACT_TO || '');
const hasListId = /^\d+$/.test(process.env.BREVO_LIST_ID || '');

function configuredForContact() {
  return hasBrevoKey && hasSender && hasRecipient;
}

function configuredForNewsletter() {
  return hasBrevoKey && hasListId;
}

async function storeSubmission(filename, record) {
  const entry = {
    id: randomUUID(),
    receivedAt: new Date().toISOString(),
    ...record,
  };
  await appendFile(
    path.join(dataDirectory, filename),
    `${JSON.stringify(entry)}\n`,
    { encoding: 'utf8', flag: 'a' },
  );
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}

async function sendBrevoRequest(endpoint, payload) {
  let response;
  try {
    response = await fetch(`${apiBaseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });
  } catch (error) {
    console.error(`Brevo request failed: ${error.message}`);
    throw new Error('The email service is temporarily unavailable.');
  }

  if (!response.ok) {
    console.error(`Brevo returned HTTP ${response.status} for ${endpoint}.`);
    throw new Error('The email service could not accept this submission.');
  }
}

app.post('/api/contact', async (request, response) => {
  const body = request.body || {};
  if (clean(body.hp)) return response.json({ ok: true });

  const enquiry = {
    name: clean(body.name, 120),
    email: clean(body.email, 200),
    organization: clean(body.organization, 160),
    message: clean(body.message, 3000),
  };

  if (!enquiry.name || !emailPattern.test(enquiry.email) || !enquiry.organization || !enquiry.message) {
    return response.status(400).json({ ok: false, error: 'Please complete all fields with a valid email.' });
  }
  try {
    await storeSubmission('enquiries.jsonl', enquiry);
  } catch (error) {
    console.error(`Could not store contact enquiry: ${error.message}`);
    return response.status(500).json({
      ok: false,
      error: 'We could not save your enquiry. Please try again.',
    });
  }

  let notificationStatus = 'not_configured';
  if (configuredForContact()) {
    notificationStatus = 'failed';
    const textContent = [
      'A new enquiry was submitted through the Prism website.',
      '',
      `Name: ${enquiry.name}`,
      `Email: ${enquiry.email}`,
      `Organization: ${enquiry.organization}`,
      '',
      'What they are working through:',
      enquiry.message,
    ].join('\n');
    const htmlContent = `
      <h2>New Prism website enquiry</h2>
      <p><strong>Name:</strong> ${escapeHtml(enquiry.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(enquiry.email)}</p>
      <p><strong>Organization:</strong> ${escapeHtml(enquiry.organization)}</p>
      <p><strong>What they are working through:</strong></p>
      <p>${escapeHtml(enquiry.message).replace(/\n/g, '<br>')}</p>
    `;

    try {
      await sendBrevoRequest('/smtp/email', {
        sender: { name: 'Prism', email: process.env.BREVO_SENDER_EMAIL },
        to: [{ email: process.env.CONTACT_TO }],
        replyTo: { email: enquiry.email, name: enquiry.name },
        subject: `New Prism enquiry: ${enquiry.organization}`,
        textContent,
        htmlContent,
      });
      notificationStatus = 'sent';
    } catch (error) {
      console.error(`Contact enquiry saved, but email notification failed: ${error.message}`);
    }
  }

  return response.json({ ok: true, notificationStatus });
});

app.post('/api/subscribe', async (request, response) => {
  const body = request.body || {};
  if (clean(body.hp)) return response.json({ ok: true });

  const email = clean(body.email, 200);
  if (!emailPattern.test(email)) {
    return response.status(400).json({ ok: false, error: 'Enter a valid email address.' });
  }
  if (body.consent !== true) {
    return response.status(400).json({ ok: false, error: 'Please confirm you want to receive Prism emails.' });
  }
  const normalizedEmail = email.toLowerCase();
  try {
    await storeSubmission('subscribers.jsonl', {
      email: normalizedEmail,
      consentedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`Could not store newsletter signup: ${error.message}`);
    return response.status(500).json({
      ok: false,
      error: 'We could not save your signup. Please try again.',
    });
  }

  let newsletterStatus = 'not_configured';
  if (configuredForNewsletter()) {
    newsletterStatus = 'failed';
    try {
      await sendBrevoRequest('/contacts', {
        email: normalizedEmail,
        listIds: [Number(process.env.BREVO_LIST_ID)],
        updateEnabled: true,
      });
      newsletterStatus = 'synced';
    } catch (error) {
      console.error(`Newsletter signup saved, but Brevo sync failed: ${error.message}`);
    }
  }

  return response.json({ ok: true, newsletterStatus });
});

app.get('/api/health', (_request, response) => response.json({
  ok: true,
  storage: true,
  integrations: {
    contact: configuredForContact(),
    newsletter: configuredForNewsletter(),
  },
}));

if (fs.existsSync(dist)) {
  app.use(express.static(dist, { maxAge: '1h', index: false }));
  app.get('*', (_request, response) => response.sendFile(path.join(dist, 'index.html')));
}

const port = Number(process.env.PORT || 3001);
app.listen(port, () => console.log(`Prism server listening on port ${port}`));
