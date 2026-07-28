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

One page plus a 404, in this order: hero → the chat demo → the release note it produced →
**the AI assistant** → calls → mixed scripts → features → self-hosting → download.

**The hero plays a scenario**: a rejected upload is reported, the next person asks the
assistant, and it works through its tools and answers — chat handing off to the assistant
in about seven seconds. Its pacing is measured, not decorative; see `DECISIONS.md` before
changing `heroScenario`. It is the one demo with no controls, which is why every control
reference in `DemoEngine.astro` is null-guarded.

**Chat and the assistant are deliberately separate features** in the sections below,
because that is what they are in the product: the assistant is its own chat type with its own header, mode switch and
agent picker, not a bot living in a channel. The transcript contains no assistant; the
assistant section has its own surface and its own demo. Their co-existence — the same
assistant can be switched on inside any conversation — is a closing note in that section,
not the framing. Do not fold one back into the other.

- **The conversation demo works and is asserted, not assumed.** Pause holds, Play resumes,
  Restart clears and replays, it pauses off-screen, and the thread toggle flips
  `aria-expanded`. It reveals the first message immediately so the panel is never an empty
  box, and unrevealed beats sit at `opacity: 0.06` so it reads as a populated conversation
  rather than a blank rectangle before it plays.
- **Both demos are drawn as the product draws them** — bubbles, delivery ticks, identity
  colours from the same hue-to-gradient rule the app uses, and the assistant's real
  working indicator with its counting timers and collapsing "Worked · N steps" chip.
- **The mixed-script section is a live demonstration.** Both panels render the identical
  string and differ only in `dir`, so the viewer's own browser performs the bug and the fix.
- **The download works the moment the site deploys** — the binary ships in this repo.
- **Deliberately unfinished:** macOS, Linux, Android and iOS are rendered as genuinely
  `disabled` buttons showing real status. That is not a placeholder; it is the honest state.

Published Windows build: **0.3.6**, 4,096,512 bytes (**3.9 MB**), md5 `19407c85…`. Always
taken from the application repo's **per-version folder**, never the dist-root mirror — see
`OPERATIONS.md` step 2 for why. The stated size is not a constant: 0.3.6 shrank to 3.9 MB
from 0.3.5's 4 MB, and all four quoted sizes had to change with it.

Last verification (2026-07-27, against a served build): `_tools/verify.mjs` **50 passed,
0 failed**; project-specific harness **51 passed, 0 failed**. Screenshots reviewed in dark,
light and at 390px.

---

## How the content is structured

| What | Where |
|---|---|
| The worked example — people, messages, thread, release note | `src/conversation.js` |
| The hero scenario and its pacing | `heroScenario` in `src/conversation.js` |
| The assistant's exchange, steps and durations | `assistantSession` in `src/conversation.js` |
| The assistant's working indicator (reproduces the app's `AISteps`) | `src/components/AiSteps.astro` |
| Tool-slug icon sprite (the app's lucide glyphs) | `src/components/AiIcons.astro` |
| The step engine both demos share | `src/components/DemoEngine.astro` |
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
3. **The new binary goes in `public/download/`, never `dist/download/`.**
   `dist/` is build output: gitignored, and wiped and regenerated by every
   `npm run build`. A binary dropped there produces a clean `git status`,
   deploys nothing, and is deleted by the next build. This has already caught
   someone. Full runbook in `OPERATIONS.md`.
4. **A binary swap changes stated facts.** The download size is quoted in four
   places (`src/site.js` ×3, `src/components/Download.astro` ×1) — re-derive all
   four or the page states a false size (MANIFEST §1.5). The **version** is now a
   single source, `desktopVersion` in `src/site.js`; the hero pill, the download
   section and the JSON-LD all derive from it. It used to be restated in
   `BaseLayout.astro`, the two drifted, and the site advertised 0.3.0 while
   serving 0.3.1. Never reintroduce a second literal. Runbook: `OPERATIONS.md`.
5. **Never hand-edit the `.md5` sidecar, and keep `prebuild` wired.** Installed clients poll
   it to detect new builds. A hash that disagrees with the binary beside it either blinds
   every installed copy to an update or sends it after a build that does not exist.
   `public/_headers` capping `/download/*` at `max-age=300` is part of the same mechanism —
   a long cache hides new builds entirely.
6. **Never add `unicode-bidi: plaintext`** to the message bodies or the comparison lines. It
   re-derives paragraph direction from the *first strong character* — precisely what the
   majority rule exists to override. It reported `direction: rtl` in `getComputedStyle`
   while the line still rendered flush-left, so it looked correct and was not.
7. **The compared bidi line must not wrap.** Two wrapped lines fill both bubbles, the
   layouts stop looking different, and the comparison demonstrates nothing.
8. **Computed `direction` is not proof anything moved.** Measure where the ink actually
   starts with a `Range`, or you will assert a passing test over a broken layout.
9. **Do not describe the Electron client's features.** The published build is the Tauri one.
   It has no unread badge, no notification cards, no deep links, no start-at-login, no
   auto-update, and no hub picker — and its own README flags WebView2 camera/microphone
   permission as unverified, so **calls in this build are unconfirmed**.
10. **Do not claim localisation.** There is no i18n library and no locale catalogues. The
   mixed-script section is about the text a team writes, and says so explicitly.
11. **Do not claim anything from the app's unstarted enterprise phase** — audit trails,
   retention, DLP, end-to-end encryption, guest access, native mobile.
12. **Emoji render as tofu boxes** in the headless Chromium used for verification, and on
    any machine without a colour emoji font. The reaction chip draws its own SVG glyph.
13. **Never publish private project content** — test users, testbed IPs, real hostnames.
    The example conversation is invented, and its hostnames (`staging.internal`,
    `hub.internal`) are deliberately generic.
14. **Nothing may be hidden behind JavaScript** (MANIFEST §8.1). Every hiding rule is scoped
    to `.js`. With scripting off the whole transcript is present, thread replies are
    expanded, and the demo controls and thread toggle are *not rendered at all* rather than
    shipped inert. Keep that pattern for anything new.
15. **PowerShell mangles UTF-8.** `Get-Content -Raw` decodes as ANSI and rewriting turns
    every em-dash and `§` into mojibake. Edit files with the editor, not shell string
    replacement. Commit messages with double quotes break argument passing — use
    `git commit -F <file>`.
16. **`src/pages/og.astro` is temporary** and must be deleted after regenerating the social
    card. Astro also excludes `_`-prefixed files in `src/pages/`, so never name a temporary
    page `_something.astro` — it silently will not build.
17. **`file://` will not render the build**; serve it with `npm run preview`. Full-page
    screenshots do not fire `IntersectionObserver`, so scroll the page in the harness before
    capturing or reveal-on-scroll sections shoot blank.
18. **Only real AI tool slugs may appear in `assistantSession.steps`** — `search_hub`,
    `search_messages`, `web_search`, `fetch_page`, `read_list`, `my_items`,
    `read_attachment`, `remember`, plus the pipeline steps `analyze`, `summarize`, `think`,
    `review`, `handoff`. An invented slug claims a capability that does not exist, and
    renders as the fallback wrench because `AiIcons.astro` only defines the real ones.
19. **The step engine is shared and lives in `DemoEngine.astro`**, rendered once from the
    layout and bound to every `[data-demo]`. Do not copy it into a component — a second
    copy will drift. A new demo opts in by providing `[data-beat]` elements in document
    order plus the control elements the engine reads.
20. **Two demos means two of every control.** Playwright's strict mode rejects a bare
    `[data-play]` / `[data-controls]` locator now; scope harness selectors to
    `#conversation` or `#assistant`, or you will test the wrong one.
21. **Never reveal demo content with `display`.** Anything that appears mid-playback must
    already occupy its space and be revealed by opacity, or the panel grows and shoves the
    rest of the page down — the step rows cost 108px of movement that way. Step rows carry
    a fixed `height` for the same reason, and the finished state swaps only the box's
    header, never the box. Re-run `probe-shift`-style sampling after touching any demo:
    the target is ≤1px.
22. **Use `minmax(0, 1fr)`, never a bare `1fr`.** A `1fr` track will not shrink below its
    content's min-content width, so a column holding anything intrinsically wide blows out
    and the page scrolls sideways at 390px. This already happened once, in `.split`.
23. **A class-level `display` beats the UA's `[hidden]` rule.** The assistant's collapsed
    chip leaked into the live state until `.chip[hidden] { display: none }` was added.
    Anything toggled by the `hidden` attribute needs the same guard.

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
