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

The Windows client ships **inside this repo** and is served by the site itself — it is the
2.6 MB Tauri/WebView2 build, well inside Cloudflare's 25 MiB per-file asset limit, so there
is no release to create and the link works as soon as the site deploys:

```
https://contenthub.team/download/ContentHub-Native.exe
https://contenthub.team/download/ContentHub-Native.exe.md5
```

**The filename is fixed on purpose** — it matches `desktop/dist/ContentHub-Native.exe` in
the application repo, and the URL is linked from elsewhere, so it must never change. Never
put a version in the path.

Freshness therefore comes from the **MD5 sidecar**, not the URL: installed clients poll
`ContentHub-Native.exe.md5` to notice a new build. It holds the bare lowercase digest and
nothing else, so a client can compare `(await res.text()).trim()` directly.
`scripts/write-download-hash.mjs` regenerates it from npm `prebuild`, so every build —
including Cloudflare's — rewrites it and the hash can never disagree with the binary.
`public/_headers` keeps `/download/*` on a 5-minute cache so updates are actually seen.
Leave all three in place.

To ship a new build: copy `desktop/dist/ContentHub-Native.exe` over the existing one, bump
`desktopVersion` in `src/site.js` for the displayed version, and build.

Larger artefacts (the ~74 MB Electron builds for macOS and Linux) cannot be served this
way. Those use the `file` field in `src/site.js` instead and must be attached to a GitHub
release **on this repo**, because the application repo is private and its release assets
are not publicly downloadable. Enabling any platform is a one-word change — flip its
`available` flag.

## Documentation

| File | Answers |
|---|---|
| [`SITE.md`](SITE.md) | What this site is and how it is configured |
| [`_docs/HANDOFF.md`](_docs/HANDOFF.md) | Where the work stands, the hazards, what is blocked on the user |
| [`_docs/DECISIONS.md`](_docs/DECISIONS.md) | Why it is the way it is — read before changing anything that looks odd |

`_docs/` is committed but never deployed. **This repo is public**, so it carries no local
paths, internal hostnames or secrets — see `_docs/DECISIONS.md`.

## Before reporting a change as done

Read `_docs/HANDOFF.md` and `SITE.md`, and [`../MANIFEST.md`](../MANIFEST.md) for the
workspace standard this must meet. Then, against a served build:

```bash
node ../_tools/verify.mjs http://localhost:4321 --out <scratchpad>/verify-out
```

Non-zero exit means the work is not finished — and open the screenshots regardless, since
the tool cannot judge layout or artwork.
