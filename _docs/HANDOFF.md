# HANDOFF — contenthub.team

> **Read this first if you are picking up this site with no prior context.**
> Then `../SITE.md` (what the site is) and `../../MANIFEST.md` (the binding standard).
> `DECISIONS.md` beside this file explains *why* things are as they are.
>
> Internal file: committed to the repo, never deployed (MANIFEST §5.2).
>
> ⚠️ **This repo is PUBLIC, unlike the workspace norm** — it has to be, because it serves
> the Windows binary (see `DECISIONS.md`, 2026-07-26). MANIFEST §5.3's Tier B allowance
> (local paths, internal hostnames, deployment topology) is therefore **void here**: this
> file is world-readable on GitHub. Reference such things by location, never by value.
> Tier A material — credentials, tokens, keys, `.env`/`.state` contents — was never
> permitted at any visibility.

Last updated: 2026-07-27.

---

## Mission

Convince a team evaluating self-hosted chat that ContentHub is a credible replacement for
Teams or Slack, then get the Windows client onto their machine. The page has to *show* the
product working rather than list features, and it has to make the on-premise story concrete
— including the parts most self-hosted chat tools hand to a third party, like call routing
and search.

There is no sign-up, no pricing and no contact form, because none of those exist yet. The
single call to action is the download.

---

## Source of truth

| Thing | Where |
|---|---|
| Project source | ContentHub — GitHub `shahabafshar/ContentHub`, **private**. Local checkout path is in the workspace registry, `_WEB/CLAUDE.md`. |
| Product capabilities (what feature copy must trace back to) | `CLAUDE.md` at the app repo root, plus `_docs/MESSENGER_PHASE*.md` |
| Windows client source | `desktop-win/` (Tauri/WebView2) in the app repo — **this is what the site publishes**. `desktop/` is the larger Electron client. |
| Bidi algorithm the site mirrors | `frontend/src/components/messenger/MessageArea.jsx` in the app repo |
| Branding originals | app repo `frontend/public/icon.svg` and `frontend/public/icons/` → copied into `public/assets/` |
| Real app + environment domains | The infrastructure repo on the workstation (path in the workspace registry, `_WEB/CLAUDE.md`) — its `environments/` and `projects/` env files. Read them there; never copy values into this repo. |

**Live app URL:** verified reachable 2026-07-26, but **deliberately not linked from this
site** — see `DECISIONS.md`. It is not a public sign-up destination. Nothing in `src/`
references it; if a public instance ever exists, put it in `src/site.js`, never inline in a
component.

**`contenthub.team` does not resolve yet.** Do not link to it as though it were live; the
absolute URLs in meta/JSON-LD are correct for when it is.

---

## Current state

The site is complete, verified and pushed. It has never been deployed, because Cloudflare
is not connected yet (see *Blocked on the user*).

One page plus a 404, in this order: hero → the conversation demo → the release note it
produced → calls → mixed scripts → features → self-hosting → download.

- **The conversation demo works and is asserted, not assumed.** Pause holds, Play resumes,
  Restart clears and replays, it pauses off-screen, and the thread toggle flips
  `aria-expanded`. It reveals the first message immediately so the panel is never an empty
  box, and unrevealed beats sit at `opacity: 0.06` so it reads as a populated conversation
  rather than a blank rectangle before it plays.
- **The mixed-script section is a live demonstration.** Both panels render the identical
  string and differ only in `dir`, so the viewer's own browser performs the bug and the fix.
- **The download works the moment the site deploys** — the binary ships in this repo.
- **Deliberately unfinished:** macOS, Linux, Android and iOS are rendered as genuinely
  `disabled` buttons showing real status. That is not a placeholder; it is the honest state.

Last verification (2026-07-27, against a served build): `_tools/verify.mjs` **47 passed,
0 failed**; project-specific harness **50 passed, 0 failed**. Screenshots reviewed in dark,
light and at 390px.

---

## How the content is structured

| What | Where |
|---|---|
| The worked example — people, messages, thread, release note | `src/conversation.js` |
| Outbound links, download targets, per-platform availability | `src/site.js` |
| Majority-script direction (mirrors the app's algorithm) | `src/bidi.js` |
| Design tokens, both colour schemes | `src/styles/global.css` |
| Meta / OG / JSON-LD | `src/layouts/BaseLayout.astro` |
| The published Windows binary + its MD5 sidecar | `public/download/` |
| Download cache rule | `public/_headers` |
| MD5 sidecar generator (runs on `prebuild`) | `scripts/write-download-hash.mjs` |

**Couplings that are easy to break:**

- `conversation.js` drives the hero, the demo, the payoff, the calls mock, the mixed-script
  section *and* the social card. Rewrite it and the whole page follows — which is the point,
  but it also means a careless edit ripples further than it looks.
- The calls section's shared screen is the **same nginx config** as the thread that
  precedes it. If you change one, change the other or the page stops being one story.
- `bidiLine` in `conversation.js` is rendered in three places. It must stay short enough not
  to wrap (see Hazards).
- The social card is generated from real components, so a branding change means
  regenerating `public/og.jpg` (procedure in `../SITE.md` § SEO).

---

## Hazards

Every one of these cost time or shipped a defect during the initial build.

1. **This repo is public.** Never add absolute local paths, internal hostnames, environment
   names or deployment topology, and never any secret. Git history is permanent.
2. **Never rename the download or put a version in its path.** It must stay
   `public/download/ContentHub-Native.exe`. The URL is linked from outside this site.
3. **Never hand-edit the `.md5` sidecar, and keep `prebuild` wired.** Installed clients poll
   it to detect new builds. A hash that disagrees with the binary beside it either blinds
   every installed copy to an update or sends it after a build that does not exist.
   `public/_headers` capping `/download/*` at `max-age=300` is part of the same mechanism —
   a long cache hides new builds entirely.
4. **Never add `unicode-bidi: plaintext`** to the message bodies or the comparison lines. It
   re-derives paragraph direction from the *first strong character* — precisely what the
   majority rule exists to override. It reported `direction: rtl` in `getComputedStyle`
   while the line still rendered flush-left, so it looked correct and was not.
5. **The compared bidi line must not wrap.** Two wrapped lines fill both bubbles, the
   layouts stop looking different, and the comparison demonstrates nothing.
6. **Computed `direction` is not proof anything moved.** Measure where the ink actually
   starts with a `Range`, or you will assert a passing test over a broken layout.
7. **Do not describe the Electron client's features.** The published build is the Tauri one.
   It has no unread badge, no notification cards, no deep links, no start-at-login, no
   auto-update, and no hub picker — and its own README flags WebView2 camera/microphone
   permission as unverified, so **calls in this build are unconfirmed**.
8. **Do not claim localisation.** There is no i18n library and no locale catalogues. The
   mixed-script section is about the text a team writes, and says so explicitly.
9. **Do not claim anything from the app's unstarted enterprise phase** — audit trails,
   retention, DLP, end-to-end encryption, guest access, native mobile.
10. **Emoji render as tofu boxes** in the headless Chromium used for verification, and on
    any machine without a colour emoji font. The reaction chip draws its own SVG glyph.
11. **Never publish private project content** — test users, testbed IPs, real hostnames.
    The example conversation is invented, and its hostnames (`staging.internal`,
    `hub.internal`) are deliberately generic.
12. **Nothing may be hidden behind JavaScript** (MANIFEST §8.1). Every hiding rule is scoped
    to `.js`. With scripting off the whole transcript is present, thread replies are
    expanded, and the demo controls and thread toggle are *not rendered at all* rather than
    shipped inert. Keep that pattern for anything new.
13. **PowerShell mangles UTF-8.** `Get-Content -Raw` decodes as ANSI and rewriting turns
    every em-dash and `§` into mojibake. Edit files with the editor, not shell string
    replacement. Commit messages with double quotes break argument passing — use
    `git commit -F <file>`.
14. **`src/pages/og.astro` is temporary** and must be deleted after regenerating the social
    card. Astro also excludes `_`-prefixed files in `src/pages/`, so never name a temporary
    page `_something.astro` — it silently will not build.
15. **`file://` will not render the build**; serve it with `npm run preview`. Full-page
    screenshots do not fire `IntersectionObserver`, so scroll the page in the harness before
    capturing or reveal-on-scroll sections shoot blank.

---

## Blocked on the user — do not retry these

- **Register `contenthub.team`** and add it to the Cloudflare account. It does not resolve
  today; only `slideroo.io` is on that account.
- **Connect this repo in Cloudflare Workers Builds.** Settings are in `../SITE.md` § Deploy.
  **Name the Worker `contenthub-team`, not `contenthub.team`** — `wrangler.jsonc` declares
  the hyphenated name and `wrangler deploy` ignores the dashboard's, so a mismatch deploys
  to a different Worker than the project being created.
- **Verify calls in the Tauri build** (log in, start a call, check camera/mic are not
  blocked by WebView2). This is a human-in-the-loop check and it gates what the calls
  section may claim.
- **Code signing.** No certificates exist; builds are unsigned and the page says so.

---

## Next steps, ranked

1. **Cloudflare connection and domain**, so the site is actually live and the download URL
   resolves. Everything else is cosmetic until then.
2. **Confirm WebView2 call permission.** If calls are blocked in the published client, the
   calls section needs a caveat, or the permission handler needs adding upstream.
3. **A hub picker in the Tauri build.** Until the hub address is configurable, the download
   is not usable by another team self-hosting — which sits awkwardly against the rest of
   the page's pitch. This is the single change that would most improve the site's honesty.
4. **macOS and Linux**: sign and notarise, attach to a release on this repo, then flip
   `available` in `src/site.js`. The filenames are already pre-filled.
5. **Consider a `version.json` beside the MD5.** The hash detects *change*, not *ordering*;
   a rollback currently looks identical to an update.

---

## How to verify

```bash
npm install && npm run build && npm run preview
node ../../_tools/verify.mjs http://localhost:4321 --out <scratch>/verify-out
```

Playwright must be importable — install it in the session scratchpad, never in this repo.

Non-zero exit means not done. **Then open the screenshots** — the tool cannot see bad
layout, bad art or vague copy.

### Project-specific checks the generic tool cannot do

Write these as a throwaway Playwright script in the scratchpad (MANIFEST §10). They are
listed precisely because the script itself is not kept:

- **Demo controls genuinely work** — Pause holds the beat count across ~3s; Play advances
  it; Restart clears to near zero and replays; scrolling away freezes it.
- **Thread toggle** flips `aria-expanded`, shows and hides the panel, renders 3 replies.
- **Bidi comparison is real** — both panels hold the identical string; `dir="auto"` computes
  to `ltr` while the majority panel computes to `rtl`; each line occupies exactly one line
  box; the transcript's Arabic message is measurably flush-right (compare a `Range`
  bounding box against the element box, not just the `direction` property); code inside the
  mixed-script reply stays `ltr`.
- **Download integrity** — the button points at `/download/ContentHub-Native.exe` with no
  version in the path; the file is served, begins `MZ`, and is under 25 MiB; the `.md5`
  sidecar is served, holds a bare 32-char lowercase digest, and **equals the MD5 of the
  bytes actually served**; `_headers` caps `/download/*`.
- **Unavailable platforms** are truly `disabled`, not links styled to look inert.
- **With JavaScript off**: the whole transcript is visible, thread replies are expanded, and
  neither the demo controls nor the thread toggle are rendered.
- **`/_docs/…` must not be reachable** — the generic verifier asserts this; confirm the
  outcome rather than trusting the mechanism.
