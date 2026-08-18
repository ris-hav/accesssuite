# Frontend

React + TypeScript, built with Vite. Talks to the NestJS API in `../backend`.

## Development

```bash
npm install
npm run dev
```

Runs on `http://localhost:5173` by default. Requires the backend running locally (see `../backend/README.md`) with `CORS_ORIGIN` set to match this dev server's origin.

## Scripts

- `npm run dev` — start the Vite dev server
- `npm run build` — type-check and build for production
- `npm test` — run the Vitest test suite once
- `npm run lint` — run oxlint
- `npm run format` — run Prettier

## Environment variables

`VITE_API_BASE` is the backend API's base URL. Set in `.env.development` (dev server) and `.env.production` (production build).
