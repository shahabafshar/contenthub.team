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
