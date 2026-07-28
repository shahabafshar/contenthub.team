# SITE.md — contenthub.team

> Source of truth for **what this site is and how it is configured**. Read this before
> changing anything here. The workspace standard is [`../MANIFEST.md`](../MANIFEST.md) —
> it is binding.
>
> Two internal documents sit beside it and own different questions (MANIFEST §5):
> [`_docs/HANDOFF.md`](_docs/HANDOFF.md) — where the work stands, the hazards, and what is
> blocked on the user. [`_docs/DECISIONS.md`](_docs/DECISIONS.md) — why things are the way
> they are; read it before changing anything that looks odd. Facts are not duplicated
> between the three.

## Identity

- **Domain:** contenthub.team
- **Represents project:** ContentHub
- **Project source code:** GitHub `shahabafshar/ContentHub` — **private**. The local
  checkout path is in the workspace registry, `_WEB/CLAUDE.md`.

  *Deviation from MANIFEST §5.1, which requires the absolute path here:* **this repo is
  public**, so §5.3 Tier B material is excluded from it. §5.3 is the stricter rule and wins.
  See `_docs/DECISIONS.md`, 2026-07-27.
- **What the project is:** A self-hosted team hub — a Django 5 + React application
  combining real-time channel and direct messaging, threads, reactions and read receipts,
  group video calls with screen sharing, full-text message search, an AI assistant that
  calls tools, and content objects (documents, folders, pages, announcements, structured
  lists). It deploys with Docker Compose behind the operator's own OpenID Connect provider,
  with no SaaS dependency in the critical path.
- **App URL:** a live instance exists and was verified reachable on 2026-07-26, but is
  **deliberately not linked from this site** and is not named in this repo. If a public
  instance ever exists, add it to `src/site.js` rather than inline in a component. Reasons
  in `_docs/DECISIONS.md`.

## Purpose of this site

Convince a team evaluating self-hosted chat that ContentHub is a credible replacement for
Teams or Slack, then get the desktop client onto their machine. A visitor must come away
with two things:

1. What using it actually looks like — not a feature list.
2. That every moving part, including call routing and search, runs on their hardware.

The single call to action is the desktop download. There is no sign-up, no pricing and no
contact form, because none of those exist yet.

## Branding

- **Logo assets:** `public/assets/` — `contenthub-icon.svg` and `contenthub-icon-512.png`
  are copied verbatim from the application's own `frontend/public/icon.svg` and
  `frontend/public/icons/icon-512.png`. `apple-touch-icon.png` is the app's 180px icon.
- **`favicon.svg` is authored here**, not copied: the app icon stacks three cards with
  three accent dots, which turns to mush at 16px. The favicon keeps two cards at higher
  contrast and drops the dots. Verified legible at 16/32/64px.
- **Colours:** indigo `#4338ca` → violet `#7c3aed` (the app icon's own gradient; `#4338ca`
  is also the PWA `theme_color`). Mint `#2dd4bf` is the signal colour for presence, live
  calls and resolved state. Full token set in `src/styles/global.css`, both schemes defined
  and both visually checked.
- **Font:** Inter (Google Fonts).
- **Tone:** plain and technical. It names real components — nginx, mediasoup, coturn,
  Meilisearch, Celery — because the audience is the person who will run it.

## Tech

- **Type:** Astro 5 static site, vanilla CSS design tokens, no CSS framework.
- **Client JS:** three small hand-written scripts. No framework, no islands, no analytics.
  1. `BaseLayout.astro` — adds `.js` to `<html>` and runs the scroll-reveal observer.
  2. `ChatDemo.astro` — the step engine that plays the conversation, plus thread toggles.
  3. `Download.astro` — marks the card matching the visitor's OS.
  4. `BackToTop.astro` — a plain `#top` anchor; script only decides when it is visible.

  All three are progressive enhancement per MANIFEST §8.1. Every hiding rule is scoped to
  `.js`, so with scripting off the whole transcript is present, thread replies are expanded,
  and the demo controls and thread toggle are **not rendered at all** rather than shipped
  inert.

- **Structure:**

  ```
  src/
    site.js            outbound URLs, download targets, per-platform availability
    conversation.js    the single worked example (see Design intent)
    bidi.js            majority-script direction, mirroring the app's own algorithm
    layouts/BaseLayout.astro   SEO contract, JSON-LD, reveal observer
    components/
      Header.astro Hero.astro ChatDemo.astro Payoff.astro Assistant.astro
      Calls.astro Script.astro Features.astro SelfHosted.astro Download.astro
      Footer.astro BackToTop.astro
      AiSteps.astro    the app's working indicator, reproduced
      AiIcons.astro    tool-slug icon sprite (the app's lucide glyphs)
      DemoEngine.astro the step engine both demos share, rendered from the layout
      Avatar.astro Logo.astro PlatformIcon.astro Rich.astro
    pages/index.astro  404.astro
    styles/global.css  tokens, base, layout helpers, shared app chrome
  public/
    og.jpg  robots.txt  assets/
    _headers                            caps /download/* caching so updates are noticed
    download/ContentHub-Native.exe      the 4 MB Windows build, served by this site
    download/ContentHub-Native.exe.md5  generated on prebuild — never edit by hand
  scripts/
    write-download-hash.mjs             writes the MD5 sidecars; wired to npm prebuild
  _docs/
    HANDOFF.md  DECISIONS.md            internal; committed, never deployed (§5.2)
  ```

  `_docs/` sits at the site root, a sibling of `src/`. Astro emits only `src/pages/` and
  `public/` into `dist/`, and Cloudflare uploads only `dist/`, so it cannot reach the web.
  The verifier asserts `/_docs/…` returns a non-200 — check the outcome, do not trust the
  mechanism.

## Design intent

**One coherent example, kept in `src/conversation.js`** (MANIFEST §6.2–6.3). A morning in a
`#release-2-4` channel: Marta reports that uploads over 40 MB fail at 100%; Kenji confirms;
Layla adds the customer-facing impact in Arabic; Daniel finds a 32 MB `client_max_body_size`
left on the staging proxy and works it out in a thread; the AI assistant is asked where else
an upload limit is set and answers by calling three tools; a six-minute call settles it; and
the outcome is a published release note. That release note is the payoff section (§6.5),
rendered the way a reader consumes it.

The cast is deliberately international, and the same story runs through every section: the
calls section's shared screen is the *same* nginx config from the thread, so the page reads
as one morning rather than a set of unrelated screenshots. Rewrite `conversation.js` and the
whole page follows.

**The main demo genuinely works** (§6.4). Pause holds, Play resumes, Restart clears and
replays, and it pauses when scrolled out of view — all asserted by script, not by inspection.
It reveals the first message immediately, and unrevealed beats sit at `opacity: 0.06`, so the
panel is never an empty box. Under `prefers-reduced-motion` the whole transcript shows at
once and the controls are hidden, because a pause button is meaningless with no animation.

**The mixed-script section is a live demonstration, not a mockup.** `Script.astro` renders
the same string twice and changes only the `dir` attribute, so the visitor's own browser
performs the bug and the fix. `src/bidi.js` is the same majority-script algorithm the app
uses in `frontend/src/components/messenger/MessageArea.jsx`, kept identical on purpose.
It demonstrates message direction only — **no localisation is claimed**, because there is
none. The traps that silently break this section are listed in `_docs/HANDOFF.md`.

**Chat and the assistant are presented as two features.** That is what they are in the
product — the assistant is its own chat type with its own header, mode switch and agent
picker, not a bot in a channel — so the transcript contains no assistant and the assistant
has its own section and its own surface. That the same assistant can be switched on inside
any conversation is a closing note there, not the framing.

**The demos are drawn the way the product draws them.** Bubbles rather than a flat list:
your own messages right-aligned in the primary fill with delivery ticks, everyone else's
left-aligned in the muted fill under a name in their identity colour, avatars built from
the same hue-to-gradient rule the app uses. The assistant's working indicator reproduces
the app's own component — a "Working…" box whose rows spin with a counting timer and swap
to a check and a real duration, collapsing to a "Worked · N steps" chip that reopens on
click. Both demos are driven by one shared engine, `DemoEngine.astro`.

**Mock UI is labelled.** Every simulated app surface carries a small `Demo` tag (§1.6), and
the purely decorative mocks (hero window, call window) are `aria-hidden` with their meaning
carried in real headings and copy.

**Artwork.** No photographs and no figures. Avatars are initials on a two-stop disc; the
architecture diagram is HTML chips on a CSS grid with short vertical connectors, so it
reflows on a phone and themes for free. Nothing in the set is a stroke terminating in a
circular form, which is the §7.4 hazard. Platform glyphs are fill-based at one optical
weight, and the Android eyes are knocked out with `fill-rule="evenodd"` rather than painted
in a background colour, since those chips sit on several different backgrounds. Reaction
chips are SVG rather than emoji.

## SEO

- Meta, Open Graph, Twitter and JSON-LD all live in `src/layouts/BaseLayout.astro`.
- `trailingSlash: 'never'` in `astro.config.mjs` keeps canonical, `og:url` and the sitemap
  entry byte-identical.
- **Social card:** `public/og.jpg` — 1200×630, JPEG quality 86, ~55 KB.
  To regenerate: recreate `src/pages/og.astro` (a 1200×630 `#card` built from the real
  `Logo`, `Avatar` and `conversation.js`), serve the build, screenshot the `#card` element
  with Playwright as JPEG q86 into `public/og.jpg`, then **delete the page again**. Two
  traps: the card hard-codes a dark background, so it must also hard-code `color`, or the
  wordmark inherits the light scheme's near-black text and vanishes; and
  `await document.fonts.ready` before capturing, or it ships in a fallback face.
- **Structured data asserts:** `WebSite`, and `SoftwareApplication` with name, URL, category,
  operating systems, `softwareVersion` and a `featureList` of capabilities that are actually
  implemented. **Deliberately omits** `offers`, `aggregateRating`, review counts, author, and
  anything else unverifiable.
- `robots.txt` in `public/` points at `sitemap-index.xml`; `@astrojs/sitemap` generates the
  sitemap; `404.astro` is `noindex, follow` and is wired up by
  `not_found_handling: "404-page"`.

## Deploy

- **Host:** Cloudflare Workers (git-connected Workers Builds), static assets only
- **Repo:** https://github.com/shahabafshar/contenthub.team — **public**, and it must stay
  that way; the download depends on it. See `_docs/DECISIONS.md`.
- **Config:** `wrangler.jsonc` (name `contenthub-team`, serves `./dist`); `wrangler` pinned
  as a devDependency
- **Dashboard:** build `npm run build`; deploy `npx wrangler deploy`; non-production branches
  `npx wrangler versions upload`; root directory `/`. **Name the Worker `contenthub-team`,
  not `contenthub.team`** — `wrangler deploy` reads the name from `wrangler.jsonc` and
  ignores the dashboard's, so a mismatch deploys to a different Worker than the project.
- **Flow:** commit → push to `main` → Cloudflare builds and deploys

### Desktop downloads — served by this site

The Windows build ships inside this repo at `public/download/ContentHub-Native.exe`, and the
button points at the relative path. No external host, no release to create:

```
https://contenthub.team/download/ContentHub-Native.exe
https://contenthub.team/download/ContentHub-Native.exe.md5
```

The filename is **fixed** — no version in the path, ever — because the URL is linked from
outside this site. Freshness comes from the MD5 sidecar instead: it holds the bare lowercase
digest and nothing else, so a client can compare `(await res.text()).trim()` without parsing,
and installed clients poll it to detect a new build.

Two mechanisms keep that honest and **must stay wired up**:

- `scripts/write-download-hash.mjs` rewrites a sidecar for every binary in `public/download/`
  and runs from npm **`prebuild`**, so `npm run build` — including Cloudflare's — regenerates
  it and the hash cannot drift from the binary. `npm run download:hash` runs it standalone.
- `public/_headers` caps `/download/*` at `max-age=300`, with the same max-age on both files
  so the pair can never be served from different generations. Cloudflare honours this file;
  `astro preview` ignores it, so the header is only observable on a real deploy.

**To ship a new build:** copy the new `ContentHub-Native.exe` over the existing one, bump
`desktopVersion` in `src/site.js` for the version shown on the page, and build. The sidecar
updates itself. Each new binary adds ~4 MB to git history.

`src/site.js` supports two hosting routes, and `downloadUrl()` picks per platform:

| Field  | Serves from                         | Use when                                  |
|--------|-------------------------------------|-------------------------------------------|
| `path` | this site, out of `public/`         | under 25 MiB — preferred, works instantly |
| `file` | a GitHub release asset on this repo | too large for `path`                      |

`file` is pre-filled for macOS and Linux from the application's electron-builder
`artifactName` config, because those are Electron builds and far too large to self-host.
The application repo is private, so its own release assets are not publicly downloadable —
which is why any release-hosted artefact must be attached here rather than there.

Enabling a platform is a one-word change: flip its `available` flag.

## Notes / decisions

Reasoning for the choices below lives in [`_docs/DECISIONS.md`](_docs/DECISIONS.md); the
traps that break things live in [`_docs/HANDOFF.md`](_docs/HANDOFF.md). What follows is only
what is unverified or pending.

- **`contenthub.team` does not resolve yet**, and the site has never been deployed —
  Cloudflare is not connected. The absolute URLs in meta and JSON-LD are correct for when it
  is, but no social preview or canonical will work until then.
- **Calls in the published Windows client are unverified.** Its own README flags WebView2
  camera/microphone permission as the first thing to check. This gates what the calls section
  may claim and needs a human to test.
- **Builds are unsigned** — no certificates exist. The download section says so and warns
  about the SmartScreen prompt. Only flip `desktopSigned` in `src/site.js` when real signing
  exists.
- **The published client's hub address is fixed at build time**, so the download is not yet
  usable by another team self-hosting their own instance. This is the widest gap between what
  the page argues and what the download delivers; revisit when the address is configurable.
- **macOS and Linux are "In progress", not "Planned"** — the Electron CI matrix already builds
  a `.dmg` and an `.AppImage`; they are unsigned and untagged, not unwritten. Android and iOS
  are "Planned" and have no code.
- **Capabilities deliberately not claimed:** the project's unstarted enterprise phase — audit
  trails, retention policy, DLP, end-to-end encryption, guest access, native mobile apps —
  appears nowhere on the page or in the JSON-LD `featureList`.
- **No private project content is published.** Test users, testbed addresses and real
  hostnames are absent. The example conversation uses invented people and a fictional
  `Northwind Platform` workspace, and its hostnames (`staging.internal`, `hub.internal`) are
  deliberately generic.
