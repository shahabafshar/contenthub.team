# SITE.md — contenthub.team

> Source of truth for this website. Read this before changing anything here.
> The workspace standard is [`../MANIFEST.md`](../MANIFEST.md) — it is binding.

## Identity

- **Domain:** contenthub.team
- **Represents project:** ContentHub
- **Project source code:** `D:\_projects\ContentHub` (GitHub `shahabafshar/ContentHub` — **private**)
- **What the project is:** A self-hosted team hub — a Django 5 + React application
  combining real-time channel and direct messaging, threads, reactions and read
  receipts, group video calls with screen sharing, full-text message search, an AI
  assistant that calls tools, and content objects (documents, folders, pages,
  announcements, structured lists). It deploys with Docker Compose behind the operator's
  own OpenID Connect provider, with no SaaS dependency in the critical path.
- **App URL:** `https://hub.rahiaft.com` — **verified live** (HTTP 200, checked
  2026-07-26) but **deliberately not linked from this site**. It is the office1/newport
  deployment, not a public sign-up destination; per the site owner's decision the public
  page does not expose it. If a public instance ever exists, add it to `src/site.js`
  rather than inline in a component.

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
  are copied verbatim from the app's `frontend/public/icon.svg` and
  `frontend/public/icons/icon-512.png`. `apple-touch-icon.png` is the app's 180px icon.
- **`favicon.svg` is authored here**, not copied: the app icon stacks three cards with
  three accent dots, which turns to mush at 16px. The favicon keeps two cards at higher
  contrast and drops the dots. Verified legible at 16/32/64px.
- **Colours:** indigo `#4338ca` → violet `#7c3aed` (the app icon's own gradient;
  `#4338ca` is also the PWA `theme_color`). Mint `#2dd4bf` is the signal colour for
  presence, live calls and resolved state. Full token set in `src/styles/global.css`,
  both schemes defined and both visually checked.
- **Font:** Inter (Google Fonts).
- **Tone:** plain and technical. It names real components — nginx, mediasoup, coturn,
  Meilisearch, Celery — because the audience is the person who will run it.

## Tech

- **Type:** Astro 5 static site, vanilla CSS design tokens, no CSS framework.
- **Client JS:** three small hand-written scripts. No framework, no islands, no analytics.
  1. `BaseLayout.astro` — adds `.js` to `<html>` and runs the scroll-reveal observer.
  2. `ChatDemo.astro` — the step engine that plays the conversation, plus thread toggles.
  3. `Download.astro` — marks the card matching the visitor's OS.

  All three are progressive enhancement per MANIFEST §8.1. Every hiding rule is scoped to
  `.js`, so with scripting off the whole transcript is present, thread replies are
  expanded, and the demo controls and thread toggle are **not rendered at all** rather
  than shipped inert.

- **Structure:**

  ```
  src/
    site.js            outbound URLs, download targets, per-platform availability
    conversation.js    the single worked example (see Design intent)
    layouts/BaseLayout.astro   SEO contract, JSON-LD, reveal observer
    components/
      Header.astro Hero.astro ChatDemo.astro Payoff.astro Calls.astro
      Features.astro SelfHosted.astro Download.astro Footer.astro
      Avatar.astro Logo.astro PlatformIcon.astro Rich.astro
    pages/index.astro  404.astro
    styles/global.css  tokens, base, layout helpers, shared app chrome
  public/
    og.jpg  robots.txt  assets/
  ```

## Design intent

**One coherent example, kept in `src/conversation.js`** (MANIFEST §6.2–6.3). A morning in
a `#release-2-4` channel: Mina reports that uploads over 40 MB fail at 100%; Omid
confirms; Ali finds a 32 MB `client_max_body_size` left on the staging proxy and works it
out in a thread; the AI assistant is asked where else an upload limit is set and answers
by calling three tools; a six-minute call settles it; and the outcome is a published
release note. That release note is the payoff section (§6.5), rendered the way a reader
consumes it.

The same story runs through every section deliberately: the calls section's shared screen
is the *same* nginx config from the thread, so the page reads as one morning rather than a
set of unrelated screenshots. Rewrite `conversation.js` and the whole page follows.

**The main demo genuinely works** (§6.4). Pause holds, Play resumes, Restart clears and
replays, and it pauses when scrolled out of view — all asserted by script, not by
inspection. It reveals the first message immediately so the panel is never an empty box.
Under `prefers-reduced-motion` the whole transcript shows at once and the controls are
hidden, because a pause button is meaningless with no animation to pause.

**Mock UI is labelled.** Every simulated app surface carries a small `Demo` tag (§1.6),
and the purely decorative mocks (hero window, call window) are `aria-hidden` with their
meaning carried in real headings and copy.

**Artwork.** No photographs and no figures. Avatars are initials on a two-stop disc; the
architecture diagram is HTML chips on a CSS grid with short vertical connectors, so it
reflows on a phone and themes for free. Nothing in the set is a stroke terminating in a
circular form, which is the §7.4 hazard. Platform glyphs are fill-based at one optical
weight, and the Android eyes are knocked out with `fill-rule="evenodd"` rather than
painted in a background colour, since those chips sit on several different backgrounds.

**Reactions are SVG, not emoji.** The `👀` character renders as a tofu box on machines
without a colour emoji font — including the headless Chromium used for verification — so
the reaction chip draws its own eyes glyph.

## SEO

- Meta, Open Graph, Twitter and JSON-LD all live in `src/layouts/BaseLayout.astro`.
- `trailingSlash: 'never'` in `astro.config.mjs` keeps canonical, `og:url` and the
  sitemap entry byte-identical.
- **Social card:** `public/og.jpg` — 1200×630, JPEG quality 86, 56 KB.
  To regenerate: recreate `src/pages/og.astro` (a 1200×630 `#card` built from the real
  `Logo`, `Avatar` and `conversation.js`), serve the build, screenshot the `#card` element
  with Playwright as JPEG q86 into `public/og.jpg`, then **delete the page again**. Two
  traps: the card hard-codes a dark background, so it must also hard-code `color`, or the
  wordmark inherits the light scheme's near-black text and vanishes; and
  `await document.fonts.ready` before capturing, or it ships in a fallback face.
- **Structured data asserts:** `WebSite`, and `SoftwareApplication` with name, URL,
  category, operating systems, `softwareVersion` 0.3.0 and a `featureList` of capabilities
  that are actually implemented. **Deliberately omits** `offers`, `aggregateRating`,
  review counts, author, and anything else unverifiable.
- `robots.txt` in `public/` points at `sitemap-index.xml`; `@astrojs/sitemap` generates
  the sitemap; `404.astro` is `noindex, follow` and is wired up by
  `not_found_handling: "404-page"`.

## Deploy

- **Host:** Cloudflare Workers (git-connected Workers Builds), static assets only
- **Repo:** https://github.com/shahabafshar/contenthub.team (public)
- **Config:** `wrangler.jsonc` (name `contenthub-team`, serves `./dist`); `wrangler`
  pinned as a devDependency
- **Dashboard:** build `npm run build`; deploy `npx wrangler deploy`; non-production
  branches `npx wrangler versions upload`; root directory `/`
- **Flow:** commit → push to `main` → Cloudflare builds and deploys

### Desktop downloads — why they live on *this* repo

The download button points at
`https://github.com/shahabafshar/contenthub.team/releases/latest/download/ContentHub.exe`.

That is this website's repo, not the application's, for two reasons:

1. The application repo `shahabafshar/ContentHub` is **private**, so its release assets
   are not publicly downloadable — an anonymous request 404s.
2. The build is ~74 MB, far over Cloudflare's per-file static-asset limit, so it cannot be
   served out of this site's own `dist/`.

GitHub release assets on a public repo are public, allow up to 2 GB per file, and cost
nothing. **A release must exist for the link to resolve** — see Notes below.

To publish a new version: attach the artefacts from the app repo's
`desktop/dist/<version>/` to a release here, then bump `desktopVersion` in `src/site.js`.
To enable another platform, flip its `available` flag in the same file — the filenames are
already pre-filled from the app's electron-builder `artifactName` config.

## Notes / decisions

- **Outstanding prerequisite:** no GitHub release exists on this repo yet, so the Windows
  download link 404s until one is created with `ContentHub.exe` attached. Everything else
  on the page works. The app repo has no `v*` tags either, so its release CI has never run.
- **Unsigned builds.** CI sets `CSC_IDENTITY_AUTO_DISCOVERY: false` and there are no
  signing certificates. The download section says so and warns about the SmartScreen
  prompt. Only flip `desktopSigned` in `src/site.js` when real signing exists.
- **macOS and Linux are "In progress", not "Planned"**, because the CI matrix already
  builds a `.dmg` and an `.AppImage` — they are unsigned and untagged, not unwritten.
  Android and iOS are "Planned" and have no code.
- **Capabilities deliberately not claimed.** The project's phase 7 (audit trails,
  retention policy, DLP, end-to-end encryption, guest access, native mobile apps) has not
  started, so none of it appears on the page or in the JSON-LD `featureList`.
- **A container count was removed from a heading.** An earlier draft read "Nine
  containers"; the diagram supports no such precise number (worker and beat are one chip;
  the static frontend and SearXNG are not drawn), so the heading is now "One compose file,
  and nothing that phones home".
- **No private project content is published.** Test users, testbed IPs and internal
  hostnames are absent. The example conversation uses invented people and a fictional
  `Northwind Platform` workspace, and its hostnames (`staging.internal`, `hub.internal`)
  are deliberately generic.
- The header has no "Sign in" link, by decision — see **App URL** above.
