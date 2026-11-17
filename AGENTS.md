# Codex workspace instructions

This repository is a design sandbox for Alex Krawec's personal website. It is independent from the Lovable-hosted production site at alexkrawec.com.

- Keep the production site and its Lovable project untouched.
- Make public-site design changes primarily in `src/routes/index.tsx`, `src/styles.css`, and `src/components/`.
- Keep GitHub Pages compatible: the public demo is static and lives under the `/alexs-digital-crib-design-lab/` base path.
- Do not add secrets or copy a local `.env` file into the repository.
- Treat the analytics, authentication, admin, Supabase, and API code as server-only reference. Do not expose service credentials or assume those routes work on GitHub Pages.
- Preserve `noindex, nofollow` on the demo and keep alexkrawec.com as the canonical site unless the owner explicitly changes that policy.
- Run `npm run typecheck`, `npm run lint`, and `npm run build` before handing off changes.
- Keep downloaded portfolio media in `public/assets`; do not reintroduce Lovable-only `/__l5e/assets-v1/` URLs.

## Agent skills

### Issue tracker

Track issues and specifications in `ALEXKDOT/alexs-digital-crib-design-lab` GitHub Issues using `gh`. See `docs/agents/issue-tracker.md`.

### Triage labels

Use the five canonical triage labels defined for this repository. See `docs/agents/triage-labels.md`.

### Domain docs

Use the single-context domain-documentation layout. See `docs/agents/domain.md`.
