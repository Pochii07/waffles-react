# Waffles React

A static landing page for **Boogie's Crepes & Waffles**, built with Vite + React. The page showcases the menu, location, and live customer reviews pulled from Google.

This is a single-page site with no backend, no auth, and no database. Reviews are fetched from the Google Places API at **build time** and bundled as static JSON, so the production site only ships HTML, CSS, JS, and images.

## What's inside

- **Hero + about section** — branding, headline, CTA
- **Menu** — crepes, waffles, drinks, with photos
- **Reviews** — pulled live from Google at build time
- **Location** — Google Maps embed, address, hours, contact

## Stack

- [Vite](https://vitejs.dev/) + [React 19](https://react.dev/)
- Google Places API (New) — reviews + rating
- Google Maps Embed API — location iframe
- Plain CSS, legacy markup rendered via `dangerouslySetInnerHTML`

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- npm (bundled with Node)
- *(Optional)* Google Cloud API keys if you want live reviews and the Maps embed during local development. Without them, the app falls back to the checked-in [public/reviews.json](public/reviews.json) fixture and hides the Maps iframe.

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

That's it — no env file required for a basic dev run.

## Enabling live reviews & maps (optional)

Copy the example env file and fill in your keys:

```bash
cp .env.example .env
```

| Variable | Purpose |
|---|---|
| `VITE_GOOGLE_MAPS_EMBED_KEY` | Renders the location iframe in the browser. Restrict by HTTP referrer in GCP. |
| `VITE_GOOGLE_PLACE_ID` | The Google Place ID for the shop. Public, not secret. |
| `GOOGLE_PLACES_API_KEY` | Used by the build script to fetch reviews. Server-side only — never prefix with `VITE_`. |

Find a Place ID with the [Place ID Finder](https://developers.google.com/maps/documentation/places/web-service/place-id).

## Available scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server at `localhost:5173` |
| `npm run fetch:reviews` | Fetch fresh reviews into [public/reviews.json](public/reviews.json) (no-op if env vars unset) |
| `npm run build` | Fetch reviews, then produce a production bundle in `dist/` |
| `npm run build:nofetch` | Build without re-fetching reviews |
| `npm run preview` | Serve the production build locally for smoke-testing |
| `npm run lint` | Run ESLint over the project |

## Project structure

```
.
├── public/
│   ├── reviews.json         # live reviews (regenerated at build time)
│   └── assets/
│       ├── crepe.jpg        # hero image
│       └── menu/            # menu item photos
├── scripts/
│   └── fetch-reviews.mjs    # Places API → public/reviews.json
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── pageMarkup.html      # raw HTML rendered via dangerouslySetInnerHTML
│   ├── pageBehavior.js      # cursor, scroll-reveal, tabs, reviews, map hydration
│   └── index.css
├── index.html
├── vite.config.js
└── .env.example
```

## Notes

- The site is a mockup intended as a pitch piece for a real Baguio shop. The "Boogie's Crepes & Waffles" branding inside the app is a placeholder until the rebrand is finalized.
- The contact details, social links, and menu photos in [src/pageMarkup.html](src/pageMarkup.html) and [src/assets/menu/](src/assets/menu/) are placeholders — swap them with the real shop's content before going live.
