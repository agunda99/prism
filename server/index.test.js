import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import fs from 'node:fs/promises';
import http from 'node:http';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const integrationVariables = [
  'BREVO_API_KEY',
  'BREVO_SENDER_EMAIL',
  'CONTACT_TO',
  'BREVO_LIST_ID',
];

async function getFreePort() {
  const probe = net.createServer();
  probe.listen(0, '127.0.0.1');
  await once(probe, 'listening');
  const { port } = probe.address();
  probe.close();
  await once(probe, 'close');
  return port;
}

async function waitForHealth(url, child) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (child.exitCode !== null) throw new Error('API process exited before becoming ready.');
    try {
      const response = await fetch(`${url}/api/health`);
      if (response.ok) return response.json();
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  throw new Error('API process did not become ready.');
}

function startApi(port, envOverrides = {}) {
  const env = { ...process.env, PORT: String(port), ...envOverrides };
  for (const key of integrationVariables) {
    if (!(key in envOverrides)) delete env[key];
  }

  return spawn(process.execPath, [path.join(directory, 'index.js')], {
    cwd: directory,
    env,
    stdio: 'ignore',
  });
}

async function stopProcess(child) {
  if (child.exitCode === null) {
    child.kill();
    await once(child, 'exit');
  }
}

async function postJson(url, endpoint, body) {
  return fetch(`${url}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

test('contact and newsletter forms save submissions without provider credentials', async () => {
  const port = await getFreePort();
  const dataDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'prism-api-test-'));
  const url = `http://127.0.0.1:${port}`;
  const child = startApi(port, { DATA_DIR: dataDirectory });

  try {
    const health = await waitForHealth(url, child);
    assert.deepEqual(health, {
      ok: true,
      storage: true,
      integrations: { contact: false, newsletter: false },
    });

    const enquiry = await postJson(url, '/api/contact', {
      name: 'Test Contact',
      email: 'test@example.com',
      organization: 'Prism Test',
      message: 'Checking the enquiry endpoint.',
    });
    assert.equal(enquiry.status, 200);
    assert.deepEqual(await enquiry.json(), { ok: true, notificationStatus: 'not_configured' });

    const subscription = await postJson(url, '/api/subscribe', { email: 'reader@example.com', consent: true });
    assert.equal(subscription.status, 200);
    assert.deepEqual(await subscription.json(), { ok: true, newsletterStatus: 'not_configured' });

    const savedEnquiries = await fs.readFile(path.join(dataDirectory, 'enquiries.jsonl'), 'utf8');
    const savedSubscribers = await fs.readFile(path.join(dataDirectory, 'subscribers.jsonl'), 'utf8');
    assert.match(savedEnquiries, /test@example\.com/);
    assert.match(savedEnquiries, /Checking the enquiry endpoint/);
    assert.match(savedSubscribers, /reader@example\.com/);
    assert.match(savedSubscribers, /consentedAt/);
  } finally {
    await stopProcess(child);
    await fs.rm(dataDirectory, { recursive: true, force: true });
  }
});

test('contact and newsletter endpoints validate and deliver submissions to Brevo', async () => {
  const receivedRequests = [];
  const provider = http.createServer(async (request, response) => {
    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    receivedRequests.push({
      method: request.method,
      path: request.url,
      apiKey: request.headers['api-key'],
      payload: JSON.parse(Buffer.concat(chunks).toString('utf8')),
    });

    if (
      (request.url === '/v3/contacts' && receivedRequests.at(-1).payload.email === 'fail@example.com')
      || (request.url === '/v3/smtp/email' && receivedRequests.at(-1).payload.subject.includes('Provider Failure'))
    ) {
      response.writeHead(503, { 'content-type': 'application/json' });
      response.end(JSON.stringify({ message: 'Provider unavailable' }));
      return;
    }
    response.writeHead(request.url === '/v3/contacts' ? 201 : 202, { 'content-type': 'application/json' });
    response.end(JSON.stringify({ ok: true }));
  });
  provider.listen(0, '127.0.0.1');
  await once(provider, 'listening');

  const providerPort = provider.address().port;
  const port = await getFreePort();
  const dataDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'prism-api-test-'));
  const url = `http://127.0.0.1:${port}`;
  const child = startApi(port, {
    BREVO_API_KEY: 'test-api-key',
    BREVO_SENDER_EMAIL: 'prism@example.com',
    CONTACT_TO: 'inbox@example.com',
    BREVO_LIST_ID: '42',
    BREVO_API_BASE_URL: `http://127.0.0.1:${providerPort}/v3`,
    DATA_DIR: dataDirectory,
  });

  try {
    const health = await waitForHealth(url, child);
    assert.deepEqual(health, {
      ok: true,
      storage: true,
      integrations: { contact: true, newsletter: true },
    });

    const enquiry = await postJson(url, '/api/contact', {
      name: '<Test Contact>',
      email: 'test@example.com',
      organization: 'Prism Test',
      message: 'Check <script>alert("x")</script>',
    });
    assert.equal(enquiry.status, 200);
    assert.deepEqual(await enquiry.json(), { ok: true, notificationStatus: 'sent' });

    const subscription = await postJson(url, '/api/subscribe', { email: 'reader@example.com', consent: true });
    assert.equal(subscription.status, 200);
    assert.deepEqual(await subscription.json(), { ok: true, newsletterStatus: 'synced' });

    const withoutConsent = await postJson(url, '/api/subscribe', { email: 'reader@example.com', consent: false });
    assert.equal(withoutConsent.status, 400);

    const invalidEnquiry = await postJson(url, '/api/contact', {
      name: 'Test Contact',
      email: 'invalid',
      organization: 'Prism Test',
      message: 'Test',
    });
    assert.equal(invalidEnquiry.status, 400);

    assert.equal(receivedRequests.length, 2);
    assert.equal(receivedRequests[0].path, '/v3/smtp/email');
    assert.equal(receivedRequests[0].apiKey, 'test-api-key');
    assert.equal(receivedRequests[0].payload.to[0].email, 'inbox@example.com');
    assert.equal(receivedRequests[0].payload.replyTo.email, 'test@example.com');
    assert.match(receivedRequests[0].payload.htmlContent, /&lt;Test Contact&gt;/);
    assert.equal(receivedRequests[1].path, '/v3/contacts');
    assert.deepEqual(receivedRequests[1].payload.listIds, [42]);
    assert.equal(receivedRequests[1].payload.email, 'reader@example.com');
    assert.equal(receivedRequests[1].payload.updateEnabled, true);

    const providerEmailFailure = await postJson(url, '/api/contact', {
      name: 'Test Contact',
      email: 'test@example.com',
      organization: 'Provider Failure',
      message: 'The enquiry should still be saved.',
    });
    assert.equal(providerEmailFailure.status, 200);
    assert.deepEqual(await providerEmailFailure.json(), { ok: true, notificationStatus: 'failed' });

    const providerFailure = await postJson(url, '/api/subscribe', { email: 'fail@example.com', consent: true });
    assert.equal(providerFailure.status, 200);
    assert.deepEqual(await providerFailure.json(), { ok: true, newsletterStatus: 'failed' });

    const savedEnquiries = await fs.readFile(path.join(dataDirectory, 'enquiries.jsonl'), 'utf8');
    const savedSubscribers = await fs.readFile(path.join(dataDirectory, 'subscribers.jsonl'), 'utf8');
    assert.match(savedEnquiries, /test@example\.com/);
    assert.match(savedEnquiries, /Provider Failure/);
    assert.match(savedSubscribers, /reader@example\.com/);
    assert.match(savedSubscribers, /fail@example\.com/);
  } finally {
    await stopProcess(child);
    provider.close();
    await once(provider, 'close');
    await fs.rm(dataDirectory, { recursive: true, force: true });
  }
});
