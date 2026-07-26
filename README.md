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

## Desktop releases

The download buttons on the site point at **this repo's GitHub Releases**, because the
application repo is private and the build is too large for Cloudflare's static assets:

```
https://github.com/shahabafshar/contenthub.team/releases/latest/download/ContentHub.exe
```

Attach `ContentHub.exe` (and later `ContentHub.dmg` / `ContentHub.AppImage`) to a release
here, then bump `desktopVersion` in `src/site.js`. Enabling another platform is a one-word
change — flip its `available` flag in the same file.

## Before reporting a change as done

Read `SITE.md` for what this site represents, and [`../MANIFEST.md`](../MANIFEST.md) for
the workspace standard it must meet. Then, against a served build:

```bash
node ../_tools/verify.mjs http://localhost:4321 --out <scratchpad>/verify-out
```

Non-zero exit means the work is not finished — and open the screenshots regardless, since
the tool cannot judge layout or artwork.
