# contenthub.team

Marketing website for **ContentHub** — a self-hosted team hub: real-time chat with
threads, video calls, shared documents and an AI assistant, running on your own servers.

Astro static site (zero client framework), deployed on Cloudflare Workers from this repo:
push to `main` → build `npm run build` → serve `dist/`.

```bash
npm install
npm run dev       # local dev server
npm run build     # production build → dist/
npm run preview   # serve the production build (needed for verification)
```

## Desktop downloads

The Windows client ships **inside this repo** at
`public/download/ContentHub-<version>.exe` and is served by the site itself — it is the
2.6 MB Tauri/WebView2 build, well inside Cloudflare's 25 MiB per-file asset limit, so
there is no release to create and the link works as soon as the site deploys.

To ship a new version: drop the new exe in `public/download/`, delete the old one, and
bump `desktopVersion` in `src/site.js` — the URL is derived from it, so no cache goes
stale.

Larger artefacts (the ~74 MB Electron builds for macOS and Linux) cannot be served this
way. Those use the `file` field in `src/site.js` instead and must be attached to a GitHub
release **on this repo**, because the application repo is private and its release assets
are not publicly downloadable. Enabling any platform is a one-word change — flip its
`available` flag.

## Before reporting a change as done

Read `SITE.md` for what this site represents, and [`../MANIFEST.md`](../MANIFEST.md) for
the workspace standard it must meet. Then, against a served build:

```bash
node ../_tools/verify.mjs http://localhost:4321 --out <scratchpad>/verify-out
```

Non-zero exit means the work is not finished — and open the screenshots regardless, since
the tool cannot judge layout or artwork.
