# Prism

Prism is a responsive, one-page brand practice website built with React and Vite. The visual design remains the original indigo, off-white, and restrained spectrum system; reusable sections and forms live in separate files.

## Run locally

```sh
npm install
npm run dev
```

The Vite site runs on port `5173`; the API runs on port `3001` and Vite proxies `/api` requests to it. Use Node.js `20.19+`. For production, run `npm run build` followed by `npm start`; set `PORT` in the hosting environment to change the API port.

## Form handling and email notifications

Both forms work without third-party credentials. Valid enquiries and consented newsletter signups are saved on the server as JSON Lines in `server/data/enquiries.jsonl` and `server/data/subscribers.jsonl`. Form success confirms the submission was saved; the site only says an email notification or newsletter sync succeeded after Brevo confirms it.

For inbox notifications and mailing-list delivery, create a Brevo account, verify a sender address, create a contacts list, then copy `.env.example` to `.env` and set:

- `BREVO_API_KEY` to the API key (keep this secret; never add it to client-side `VITE_*` variables).
- `BREVO_SENDER_EMAIL` to the verified sender address.
- `CONTACT_TO` to the inbox receiving enquiries (currently set in the example to `pipinstall85@gmail.com`).
- `BREVO_LIST_ID` to the numeric ID of the list for newsletter subscribers.

Set these variables in the hosting provider's secret/environment settings for production. Confirm Brevo's current plan limits and terms before launch. `GET /api/health` reports whether the contact and newsletter integrations are configured.

The contact recipient is `pipinstall85@gmail.com`. The Brevo API key and sender address must be supplied locally or in deployment settings; never commit them. If Brevo is not configured or temporarily unavailable, the valid submission remains saved on the server and the UI says that delivery is not connected.

For production, configure a persistent writable `DATA_DIR` volume. Ephemeral hosting filesystems may discard saved submissions when an instance restarts or redeploys. Restrict access to this directory because it contains personal information, and establish a retention/deletion policy before publishing the forms.

## API

- `GET /api/health` — service health
- `POST /api/contact` — validates and saves an enquiry; emails it to `CONTACT_TO` when Brevo is configured
- `POST /api/subscribe` — requires opt-in, validates and saves an email; syncs it to `BREVO_LIST_ID` when Brevo is configured

Run `npm test` for API endpoint tests and `npm run build` for a production build.

## Front-end structure

- `src/App.jsx` composes the one-page layout and section components.
- `src/components/` contains the header, footer, wordmark, spectrum rule, and submission forms.
- `src/sections/` contains the individually addressable website sections.
- `src/data/siteContent.js` holds shared services, phases, and package content.
