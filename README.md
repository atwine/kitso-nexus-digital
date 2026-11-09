# kitsonexus.com

Marketing site for Kitso Nexus Advisory, an Odoo ERP consultancy in Gaborone, Botswana. Live at https://www.kitsonexus.com.

## Stack

Vite, React 18, TypeScript, Tailwind CSS and shadcn/ui. A static single-page app with no backend. The project started in Lovable and is now edited directly.

## Run it locally

```bash
npm ci
npm run dev
```

The dev server runs on http://localhost:8080 and only answers on this computer (`127.0.0.1`). To try the site on a phone, open it to the local network on purpose for that session.

Other scripts:

- `npm run build` builds the site into `dist/`
- `npm test` runs the Vitest tests
- `npm run lint` runs ESLint
- `npx netlify dev` runs the site together with its server functions on port 8888, as Netlify would, without deploying anything. It sends real leads and emails if `.env` is filled in, and other devices on the same network can reach it, so run it only while testing. In a git worktree, Netlify looks in the main checkout instead, so use `node --env-file=.env node_modules/netlify-cli/bin/run.js dev --offline --functions "<full path to this folder>/netlify/functions"`
- `node scripts/screenshots.mjs <base-url> <out-dir>` takes full-page screenshots of every page at phone (390px) and laptop (1440px) width
- `node scripts/fit-check-shots.mjs <base-url> <out-dir>` walks through the fit check as a sample business and screenshots every screen at both widths

Secrets such as API keys go in a `.env` file, which git ignores. Never put them in the code. Copy `.env.example` to `.env` and fill it in; the same names go into Netlify's site settings for the live site.

## Server parts

`netlify/lib/` holds the server code the site's functions use: `odoo.ts` adds leads to Kitso's Odoo CRM through Odoo's External API, `mailer.ts` sends email through the Google Workspace account, and `config.ts` checks the settings. Their tests run with `npm test`, against a fake Odoo and a fake mail server.

`netlify/functions/` has the five public addresses: `/api/contact` (Contact form), `/api/fit-check`, `/api/report`, `/api/count` and `/api/cal-booking` (Cal.com's booking notice, checked with `CAL_WEBHOOK_SECRET`). Each lead goes into Odoo and an alert goes to `ALERT_TO`; `alerts.ts` and `report.ts` build the emails. `/api/count` adds to the fit check's drop-off counts, kept in Netlify Blobs, and `daily-counts` emails them to `ALERT_TO` at 08:00 Gaborone time on days with visits. `/api/report` opens the report page at `/fit/report`: the email's link carries the answers, signed with `REPORT_LINK_SECRET`, and stops working after 6 months. Changing that secret, or renaming a question's answer options, stops existing links working. Who may see and do what is in `ACCESS.md`, proven by `netlify/access.test.ts`.

Leads in Odoo have a custom field, `x_studio_lead_type` (Hot, Warm or Cold), shown as the Lead type column on the Leads list. If it's ever removed, leads still save, with Hot, Warm or Cold as a tag.

Email limits, in `netlify/lib/intake.ts`: at most 3 reports to one address and 600 website leads emailed in 24 hours. Past a limit the lead is still saved. Report links in emails always point at the live site, so a local test email links there. New flyer labels need adding to `KNOWN_SOURCES` in `netlify/lib/fitCheckLead.ts` before they become Odoo tags.

Netlify's build command, publish folder and Node version are set in `netlify.toml`, and browser security headers in `public/_headers`. Installs come from `package-lock.json`, so keep Bun lockfiles out of the repository.

## Fit check

`src/lib/fitCheck/` holds the fit check's questions and maths, with no screens: `questions.ts` lists every question, its answer options and the number each answer stands for, and `calculate.ts` works out the Pula and hours lost per area, the health score, the verdict (strong fit, fit or not yet, with the reasons) and the hot, warm or cold call label. `advice.ts` writes the honest next steps for someone Odoo isn't right for yet. The site and the server use the same code, so the server can re-check every answer. `npm run fit:samples` prints the results for four sample businesses and every number the maths assumes, for checking by hand.

`npm run check:connections` is a one-off live check. It creates one test lead in Odoo and sends one test email, using the real settings in `.env`. `npm run check:connections -- --cleanup` deletes the test leads it made.

## Pages and SEO

Routes are in `src/App.tsx`: `/`, `/services`, `/about`, `/contact`, `/privacy` and `/fit`. The fit check at `/fit` loads on demand and hides the menu, footer, floating WhatsApp button and "Before you go" pop-up. Its screens are in `src/components/fit/`. Answers and the `?from=` label (for example `?from=flyer` on a QR code) are saved in the visitor's browser, so a reload or a return visit can continue. Names, emails and numbers are never saved there.

Each page's title, description and (optionally) its own share picture live in `src/seo/pageMeta.ts`; `/fit` uses `public/og/fit-check.jpg`. The build writes one HTML file per page (`index.html`, `services.html`, `about.html`, `contact.html`) with that page's tags, so search engines and link previews see the right text without running JavaScript. When you add a page, add it to `pageMeta.ts` and `public/sitemap.xml`; a test checks the two match.

## Deployment

Hosted on Netlify. `public/_redirects` sends unknown paths to `index.html` so client-side routing works.

Brand colours are CSS variables in `src/index.css`; `.lovable/plan.md` explains how the old class names (`navy`, `teal`, `blue`) map to the current palette.
