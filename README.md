# kitsonexus.com

Marketing site for Kitso Nexus Advisory, an Odoo ERP consultancy in Gaborone, Botswana. Live at https://www.kitsonexus.com.

## Stack

Vite, React 18, TypeScript, Tailwind CSS and shadcn/ui. A static single-page app with no backend. The project started in Lovable and is now edited directly.

## Run it locally

```bash
npm ci
npm run dev
```

The dev server runs on http://localhost:8080.

Other scripts:

- `npm run build` builds the site into `dist/`
- `npm test` runs the Vitest tests
- `npm run lint` runs ESLint

## Pages and SEO

Routes are in `src/App.tsx`: `/`, `/services`, `/about`, `/contact`.

Each page's title and description live in `src/seo/pageMeta.ts`. The build writes one HTML file per page (`index.html`, `services.html`, `about.html`, `contact.html`) with that page's tags, so search engines and link previews see the right text without running JavaScript. When you add a page, add it to `pageMeta.ts` and `public/sitemap.xml`; a test checks the two match.

## Deployment

Hosted on Netlify. `public/_redirects` sends unknown paths to `index.html` so client-side routing works.

Brand colours are CSS variables in `src/index.css`; `.lovable/plan.md` explains how the old class names (`navy`, `teal`, `blue`) map to the current palette.
