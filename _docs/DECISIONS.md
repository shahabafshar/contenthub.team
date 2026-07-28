# DECISIONS — contenthub.team

Append-only. Newest first. One entry per non-obvious choice: what was decided, why, and
what was rejected.

**Do not delete or rewrite entries.** If a decision is reversed, add a new entry
referencing the old one. The purpose of this log is to stop a future agent undoing a
deliberate choice because the reason was not visible.

Internal file — never deployed. **But this repo is public** (see 2026-07-26, *Serve the
Windows binary from this repo*), so MANIFEST §5.3's Tier B allowance does not apply here:
no local paths, internal hostnames or deployment topology. Tier A — credentials, keys,
`.env`/`.state` contents — was never permitted at any visibility.

---

## 2026-07-28 — Desktop builds are taken from the per-version folder, not the dist mirror

Publishing 0.3.5 turned up a trap in the runbook. The application repo's build script keeps
each build in `desktop/dist/<version>/` and mirrors the latest to `desktop/dist/`, and the
runbook said to copy "the binary" — which in practice meant the mirror.

The mirror was stale. It held **0.3.4**, timestamped one minute *after* 0.3.5 was built, with
a `.md5` sidecar that agreed with the stale binary. Nothing about it looked wrong from the
website side: right filename, right size to the nearest MB, self-consistent hash. Copying it
would have published 0.3.4 under the label 0.3.5 — the same class of defect as the
`desktopVersion` drift recorded below, arriving by a different route.

The runbook now sources from the per-version folder, which is authoritative because three
independent things agree there: the folder name, the exe's own FileVersion, and the
`version.json` beside it. It also adds a mandatory cross-check of FileVersion against the
folder you copied from, before anything else happens. That check is cheap and it catches the
one failure mode that leaves no trace afterwards.

Rejected: fixing the mirror in the application repo instead — the website should not depend
on a convenience copy being correct when an authoritative source is right there. Rejected:
trusting the sidecar that ships beside the binary — it was regenerated from the stale bytes
and therefore agreed with them, which is precisely why a self-consistent hash proves nothing
about *which build* you have.

---

## 2026-07-28 — The demos hold a constant height; nothing on the page moves while they play

The step rows were `display: none` until the engine reached them, so the assistant's panel
grew **108px** over a run. Everything below the hero was shoved down by that much, and
because the hero grid is centred, the headline and buttons drifted 54px as well. Measured,
not eyeballed: `probe-shift.mjs` sampled the window, the copy column and the next section
every 150ms.

Two changes fix it. Rows now stay in the layout at every stage and are revealed by opacity,
with a fixed `height` so the panel is full size from the first frame. And the finished state
no longer swaps the whole box for a chip — the box stays and only its **header** swaps,
"Working…" becoming "Worked · 4 steps · 5.3s" with a chevron. The rows collapse only when
the visitor clicks that summary, which is movement they asked for rather than movement that
happens under them.

Re-measured after: 108px → **1px**, which is sub-pixel rounding.

A side effect worth keeping: the completed steps now stay on screen instead of folding away
a second after they finish, which suits a page whose argument is "it does the work first".

Reserving the row space also exposed a real overflow at 390px, because un-started rows now
contribute their intrinsic width. The cause was a **bare `1fr` grid track**: `1fr` will not
shrink below its content's min-content width, so `.split` blew out to 426px inside a 342px
container. Every flexible track in the site is now `minmax(0, 1fr)`. `documentElement.scrollWidth`
is back to exactly 390.

Rejected: reserving a `min-height` on the steps container instead — the collapse would then
leave a blank gap inside the bubble. Rejected: keeping the auto-collapse and absorbing the
shrink at the window level — it needs a fixed window height per breakpoint, which is fragile
and clips content the moment copy changes.

---

## 2026-07-28 — The hero plays a scenario where chat hands off to the assistant

**This supersedes part of the entry below**, which removed the assistant from the hero on
the grounds that showing it there re-mixed two concepts. That reasoning held for a *static*
hero, where the assistant appearing among the bubbles read as "a bot in this channel". It
does not hold for a *scenario*, where the handoff is the thing being shown.

The hero now plays: someone reports a rejected upload, the next person asks the assistant
where the limit is set, and the assistant works through its tools and answers. Both halves
of the product, co-operating, in about seven seconds and without reading any copy. The
sections below still teach each half as a feature in its own right, so the separation the
entry below established is intact — the hero demonstrates the system, the sections define
the features.

**Pacing is the design.** The two human beats are 450ms and 900ms, which puts the assistant
to work about 1.7 seconds in. That number was measured, not guessed: an earlier draft at
700/1100 took long enough that the hero read as a chat demo which happens to end with a
bot. The assistant's own steps keep their real durations, because watching it work is the
part worth the time. If you edit `heroScenario`, re-measure — the ratio between the human
setup and the assistant's work is what makes it legible.

Two consequences. The step engine had to become tolerant of a demo with no controls, since
play/restart buttons in a hero would be clutter — every control reference in
`DemoEngine.astro` is now null-guarded. And the hero's desktop notification card was
dropped: with a taller window it collided with the composer, and the version pill plus the
download section already carry the "this is a desktop app" signal.

Rejected: looping the scenario — a hero that restarts every few seconds competes with the
copy beside it, so it plays once and rests on the answer. Rejected: keeping the assistant
out of the hero and describing the handoff in words — the handoff is a behaviour, and the
whole page's method is to show behaviour rather than assert it.

---

## 2026-07-28 — Chat and the assistant are two features, drawn the way the product draws them

Two related changes, both driven by the site misrepresenting the product.

**The demo was not shaped like the messenger.** Hero and transcript were a flat Slack-style
list — avatar, name, text. The product is a bubble messenger: `MessageArea.jsx` puts your
own messages right-aligned in the primary fill with delivery ticks under them and everyone
else's left-aligned in the muted fill, `rounded-2xl` with the corner nearest the speaker
tightened. Both now follow it, avatars derive their gradient the way `senderStyle.js` does
(one hue, two lightnesses, 135deg), read state is Telegram-style double ticks rather than
the invented "Seen by all 9 members" line, and the typing hint is the constant-height
italic row above the composer.

**The assistant was framed as a bot in a channel.** It was one beat inside the transcript,
which is not what it is: in the product it is a distinct chat type (`ai_assistant`) with
its own header, its own mode switch — advisory "consultation and strategic guidance" versus
builder "actively creates sites, lists and pages" — and its own agent picker. It now has
its own section and its own surface, and the transcript contains no assistant at all. That
they co-exist — the same assistant can be switched on inside any conversation — is stated
at the end of that section rather than used as the framing.

The centrepiece is `AiSteps.astro`, a reproduction of the app's `AISteps` component: the
bordered "Working…" box, each row spinning with a counting timer and swapping to a check
and its real duration, then collapsing to a "Worked · 4 steps · 5.3s" chip that reopens on
click. Rows are driven off the real durations, so a step takes as long on screen as its
label claims. `AiIcons.astro` carries the same lucide glyphs the app maps each slug to.

**Only real tool slugs may appear.** `search_hub`, `search_messages`, `web_search`,
`fetch_page`, `read_list`, `my_items`, `read_attachment`, `remember`, and the pipeline
steps. An invented slug would claim a capability that does not exist (MANIFEST §1.5) and
would render as the fallback wrench.

The step engine moved to `DemoEngine.astro`, rendered once from the layout and bound to
every `[data-demo]` block, because two demos running the same logic from two copies would
drift.

Rejected: keeping the assistant in the transcript and merely writing more about it —
the placement was the claim, and no amount of copy fixes a wrong frame. Rejected: leading
the hero with the assistant — it re-mixed the two concepts in the most prominent place on
the page. Rejected: the robot emoji the app uses for the assistant avatar, for the reason
already recorded about emoji rendering as tofu; it is drawn as SVG on the same purple→pink
brand gradient.

---

## 2026-07-27 — Published 0.3.4; the version is now derived from one source, not restated

Routine binary swap to **0.3.4**, `f0501e69…`, 4,198,400 bytes — still "4 MB" under the
MiB rounding rule, so no size copy changed. The entry exists for what the swap uncovered.

`desktopVersion` in `src/site.js` had never been bumped when 0.3.1 shipped. It still read
`0.3.0`, and it drives the hero pill and the download section, so **the live page advertised
0.3.0 while handing out a 0.3.1 binary for a full release cycle.** `OPERATIONS.md` step 5
did not catch it because it only told you to check `softwareVersion` in the JSON-LD — the
one version string that *had* been updated.

Two literals for one fact is the defect, not the forgetfulness. `softwareVersion` now
imports `desktopVersion`, so there is a single source and the hero, the download section
and the structured data cannot disagree. The runbook step was rewritten to say "bump the
version — one place", and to warn against reintroducing a second literal rather than
adding another line to a checklist.

This is the same reasoning that put MD5 generation in `prebuild` (2026-07-26): when a fact
must match in two places, derive it, do not remember it.

Rejected: adding `desktopVersion` to the runbook checklist alongside the JSON-LD — it
preserves the drift and only shortens the window. Rejected: reading the version out of the
binary's FileVersion at build time — it would make the site's stated version untrackable in
git and unreviewable in a diff, and the exe is only present at build time by convention.

---

## 2026-07-27 — Published 0.3.1 (4 MB); the size is now a derived fact, not a constant

The Windows client was updated from the 0.3.0 build to **0.3.1**, `996b36a5…`,
4,196,864 bytes. The earlier entry below quotes 2.6 MB throughout; that was true
of the 0.3.0 binary and is left standing, because this log is append-only.

Two things this exposed, both now documented in `OPERATIONS.md`:

**`dist/download/` is not the download folder.** A new binary was dropped there
and nothing happened in git — correctly, because `dist/` is build output:
gitignored, and wiped by the next `npm run build`. The tracked source is
`public/download/`. The two paths read identically and the wrong one fails
silently, so it is now hazard 3 with its own runbook.

**The stated size is a derived fact and must be re-derived on every swap.** It
appears in four places in the copy plus `softwareVersion` in the JSON-LD. A
binary swap that leaves them alone ships a false claim on a public page
(MANIFEST §1.5) and structured data that overstates the shipped version
(MANIFEST §9). All five were updated to 4 MB / 0.3.1, and the verification now
asserts that every size on the page matches the bytes actually served.

The site quotes **MiB**, one decimal, trailing `.0` dropped — 2,728,448 → 2.6 MB,
4,196,864 → 4 MB. Recorded because two plausible conventions differ by 5% here
and a future editor will otherwise guess.

Rejected: quoting a size range, or dropping the figure. The small download is
the product's main advantage over the 74 MB Electron build; it earns its place
on the page and is worth the maintenance.

## 2026-07-27 — Internal docs live in `_docs/`, written to a public-repo constraint

Adopted the MANIFEST §5 three-document split: `SITE.md` answers *what the site is*,
`_docs/HANDOFF.md` answers *where the work stands*, `_docs/DECISIONS.md` answers *why*.
Material that was accumulating in `SITE.md` — a hazards list and an ad-hoc "Notes /
decisions" section — moved to the file that owns it, so each fact lives in one place.

The important deviation: **§5.3 permits Tier B operational detail in `_docs/` because
site repos in this workspace are private. This repo is not.** It must stay public to serve
the Windows binary, so `_docs/` here is world-readable and Tier B is excluded. §5.3 itself
requires this dependency to be recorded, which is what this entry is.

Two pieces of Tier B had already been committed publicly in `SITE.md` before this rule
existed — the absolute local path to the application checkout, and the deployment's
environment names. Both were removed and replaced with references by location. They remain
in git history, which cannot be undone without rewriting a pushed public branch; the
hostname among them was already published inside the shipped binary by explicit decision,
so the incremental exposure is nil and no rewrite was attempted.

Rejected: making the repo private — it would break the download, which is the site's only
call to action. Rejected: keeping `_docs/` out of the repo — it would not survive session
loss or travel with a clone, which is the whole point of §5.2. Rejected: rewriting git
history to purge the earlier Tier B — a destructive operation on a pushed public branch,
for material that is already public by another route.

---

## 2026-07-27 — The mixed-script section is a live demonstration, and the cast is international

The example conversation was recast with names spanning several countries, and a support
engineer writing in Arabic was added. This is not decoration: it sets up the one genuinely
differentiating behaviour found in the app — message direction resolved by **counting
strong characters** rather than by `dir="auto"`, which decides from the *first* strong
character and so lays a mostly-Arabic sentence that opens with a Latin product name out
left-to-right.

The section renders the identical string twice and changes only the `dir` attribute, so the
viewer's own browser performs the bug and the fix. `src/bidi.js` is deliberately the same
algorithm as the app's `MessageArea.jsx`, so the site renders the example the way the
product would rather than approximating it.

Three constraints were discovered the hard way and are recorded in `HANDOFF.md` because each
silently destroys the demo: `unicode-bidi: plaintext` must never be applied (it re-derives
direction from the first strong character, reporting `rtl` while rendering flush-left); the
compared line must not wrap (two wrapped lines fill both bubbles and the layouts stop
differing); and computed `direction` is not proof anything moved, so alignment is measured
from a `Range`.

**No localisation is claimed.** The project has no i18n library and no locale catalogues,
so the section states plainly that the interface is English and this concerns the text a
team writes. Do not upgrade that into a localisation claim.

Rejected: a feature card describing bidi support — describing it would have been unverifiable
marketing where showing it is self-evident. Rejected: making the marketing page itself RTL —
it is an English page; the claim is about message content, not the site.

---

## 2026-07-26 — The Windows download keeps a fixed filename, with a load-bearing MD5 sidecar

The binary is published as `ContentHub-Native.exe` — matching what the app's `build-all.mjs`
mirrors to its dist directory — with **no version in the path**, because the URL is linked
from outside this site and must not change between releases.

A stable filename means freshness cannot come from the URL, so an MD5 sidecar sits beside
the binary at the same name plus `.md5`, holding the bare lowercase digest and nothing else
so a client can compare `(await res.text()).trim()` without parsing. Installed clients poll
it to detect a new build, which makes it part of the update mechanism rather than a nicety.

Because a hash that disagrees with its binary is worse than no hash — it either blinds every
installed copy to an update or sends it after a build that does not exist — generation is
structural, not manual: `scripts/write-download-hash.mjs` runs from npm `prebuild`, so every
build including Cloudflare's rewrites it. `public/_headers` caps `/download/*` at
`max-age=300` for the same reason; a long cache would hide new builds outright, and both
files share one max-age so the pair can never be served from different generations.

Rejected: a version-stamped path — it rots every embedded link on each release. Rejected:
generating the hash by hand or in a release script — it would drift the first time someone
swapped the exe and forgot. Rejected: `md5sum` output format — the filename column forces
clients to parse. Rejected: a long cache with a purge step — it makes correctness depend on
remembering to purge.

---

## 2026-07-26 — Publish the 2.6 MB Tauri build, not the 74 MB Electron one

ContentHub has two Windows clients. The Electron one is fully featured and cross-platform
but ~74 MB; the Tauri/WebView2 one is 2.6 MB because it renders through the runtime Windows
already ships. The site publishes the Tauri build: at 2.6 MB it fits inside Cloudflare's
25 MiB per-file asset limit and can be served by the site itself.

The consequence is editorial, and it is the expensive part. The Tauri build is phase 1 — no
unread badge, no notification cards, no deep links, no start-at-login, no auto-update, no
hub picker — and its README flags WebView2 camera/microphone permission as unverified, so
calls in it are unconfirmed. All page copy was rewritten to match: the download section no
longer claims taskbar unread counts, call ringing, notification cards or a first-run hub
picker; the hero mock shows a **message** notification rather than the Electron client's
Answer/Decline call card; and the calls section's "ring from the desktop client" bullet was
replaced with the in-call presence override, which is real.

**If the Electron build ever becomes the published Windows download, that copy has to move
back.**

Rejected: publishing the Electron build — it cannot be self-hosted at 74 MB and would have
required a GitHub release to exist before the button worked. Rejected: offering both as two
Windows cards — clutter, and it pushes a choice onto the visitor that the page cannot help
them make.

---

## 2026-07-26 — Serve the binary from this repo, which requires the repo to stay public

The application repo is private, so its GitHub release assets are not publicly downloadable
— an anonymous request 404s. The website repo is public, so the binary ships inside it and
is served by the site at a relative path. No external host, no release to create, and the
link works the moment Cloudflare deploys.

This is load-bearing for other decisions: **the repo cannot be made private without breaking
the download**, which is why MANIFEST §5.3's Tier B allowance is void here (see 2026-07-27).

`src/site.js` keeps a second route — `file`, pointing at a GitHub release asset on this repo
— for artefacts too large to self-host, which is how macOS and Linux will ship.

Rejected: Cloudflare R2 with a custom subdomain — more infrastructure to provision for a
2.6 MB file. Rejected: serving from the live application host — it couples a public
marketing download to an on-premise deployment's uptime and bandwidth. Rejected: attaching
to the private app repo's releases — not publicly downloadable, which was the original
blocker.

---

## 2026-07-26 — The shipped exe embeds a fixed hub address, and was published anyway

The Tauri build hard-codes its hub URL as the window target and has no picker, so anyone who
downloads it opens that specific host, and the string is permanent in this public repo's
history. It also means the build is **not usable by another team self-hosting their own
instance**, which sits awkwardly against the rest of the page's pitch.

This was raised before publishing, with the alternatives, and the site owner chose to publish
it. Recorded here so nobody assumes it was an oversight — and so the tension is visible when
someone next asks why the download is not more prominent.

The single change that most improves the site's honesty is a configurable hub address in the
Tauri build; revisit this entry then.

Rejected: waiting for a hub picker before publishing — the owner wanted the small build
available now. Rejected: publishing while implying the address is configurable — that would
have been a fabricated capability.

---

## 2026-07-26 — The live deployment is not linked from the site

The application instance is verified reachable, but the site does not link it: no "Sign in"
button in the header, no URL in the markup. It is not a public sign-up destination, and the
page's job is to explain the product and deliver the client, not to route strangers into
someone's deployment.

Note the tension with the entry above: the address is not in the *markup*, but it is inside
the *binary*. Those were separate decisions taken on the same day.

Rejected: a "Sign in" link — implies anyone can. Rejected: naming it as a reference
deployment in body copy — same exposure, less benefit.

---

## 2026-07-26 — Reaction chips are drawn as SVG, not emoji

The `👀` character renders as a tofu box on any machine without a colour emoji font,
including the headless Chromium used for verification. Declaring an emoji font stack did not
fix it. The chip now draws its own eyes glyph, which renders identically everywhere.

Rejected: the emoji with a font stack — still tofu in verification, and unverifiable on
visitors' machines. Rejected: dropping the reaction — it is a real product feature and one of
the cheapest ways to show the messenger is more than a text list.

---

## 2026-07-26 — A precise container count was removed from a heading

An early draft of the self-hosting section read "Nine containers, one compose file". The
architecture diagram supports no such number — the worker and beat share one chip, and the
static frontend and metasearch service are not drawn at all — and the real count varies by
deployment. The heading is now "One compose file, and nothing that phones home", which is
true and verifiable from the project's own no-SaaS constraint.

Recorded because a specific number is exactly the kind of detail a future editor would
"helpfully" restore. MANIFEST §1.5: if a number is not verified, it does not go on the page.

Rejected: counting the containers in the current compose file and using that — it would be
accurate for one deployment and wrong for the next, and the page cannot qualify it without
becoming a footnote.
