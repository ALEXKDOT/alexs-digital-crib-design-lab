# Alex's Digital Crib — Design Lab

An independent design sandbox based on [alexkrawec.com](https://alexkrawec.com/). This repository is intentionally separate from the Lovable-hosted production site, so experiments here do not change the original.

## What is published

GitHub Pages publishes a static, non-indexed copy of the public portfolio. The original server-only analytics, authentication, and admin code is retained as reference but is not available on GitHub Pages. Analytics are off unless `VITE_ENABLE_ANALYTICS=true` is provided by a server-capable deployment.

All portfolio media is stored under `public/assets` so the demo does not depend on Lovable's asset service.

## Local development

Requirements: Node.js 22 or newer and npm.

```sh
npm install
npm run dev
```

Before committing a design change:

```sh
npm run typecheck
npm run lint
npm run build
```

## Deployment

Pushing to `main` runs `.github/workflows/deploy-pages.yml`. The workflow builds the site with the repository base path and publishes `.output/public` to GitHub Pages.

The production site at [alexkrawec.com](https://alexkrawec.com/) remains the canonical version.
