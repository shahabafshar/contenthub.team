/**
 * The single worked example the whole page is built around (MANIFEST §6.2, §6.3).
 *
 * One coherent arc, start to finish: a bug is reported in a channel, confirmed by QA and
 * by support, diagnosed in a thread, audited with the AI assistant's tool loop, settled on
 * a call, and written up as a published release note — which is the payoff artefact at the
 * bottom of the page.
 *
 * It is illustrative, not a transcript of anything real, and every surface that renders it
 * is labelled "Demo" (MANIFEST §1.6). Rewrite it here and the entire page follows.
 *
 * Text supports single backticks for inline code; see components/Rich.astro.
 */

export const workspace = {
  name: 'Northwind Platform',
  channel: 'release-2-4',
  topic: 'Cutting 2.4.0 — staging sign-off before Thursday',
  members: 9,
};

/**
 * Whose eyes the demo is seen through. The messenger renders your own messages as
 * right-aligned primary-filled bubbles and everyone else's as left-aligned muted ones,
 * so the demo needs a viewer to be faithful.
 */
export const self = 'marta';

/**
 * `hue` mirrors the app's own identity colouring: a hash of the user id picks a hue, and
 * the avatar is `linear-gradient(135deg, hsl(h 62% 55%), hsl(h 60% 42%))`. Same person,
 * same hue, on every surface — see `senderStyle.js` in the application repo.
 *
 * The assistant is the one special sender there: its avatar is the robot glyph on a fixed
 * purple→pink brand gradient rather than a hashed hue.
 */
export const people = {
  marta: { name: 'Marta Kowalczyk', first: 'Marta', role: 'Platform', initials: 'MK', hue: 247, presence: 'online' },
  daniel: { name: 'Daniel Okoro', first: 'Daniel', role: 'Backend', initials: 'DO', hue: 168, presence: 'online' },
  sofia: { name: 'Sofia Ferrara', first: 'Sofia', role: 'Documentation', initials: 'SF', hue: 292, presence: 'away' },
  kenji: { name: 'Kenji Tanaka', first: 'Kenji', role: 'QA', initials: 'KT', hue: 32, presence: 'online' },
  layla: { name: 'Layla Haddad', first: 'Layla', role: 'Support', initials: 'LH', hue: 340, presence: 'online' },
  // The app's canonical assistant avatar is the robot emoji on a purple→pink brand
  // gradient. `Avatar.astro` draws the robot as SVG instead: the emoji renders as a tofu
  // box wherever no colour emoji font is installed, including the verification browser.
  assistant: { name: 'Assistant', first: 'Assistant', role: 'AI', initials: 'AI', bot: true, presence: 'online' },
};

/**
 * The line Layla writes, kept here because two components render it: the conversation
 * itself, and the section that shows why `dir="auto"` gets it wrong.
 *
 * It opens with a Latin product name and continues in Arabic, which is exactly the shape
 * `dir="auto"` mishandles — it decides from the "P" of "Power" alone and declares the whole
 * sentence left-to-right.
 *
 * Keep it SHORT enough to sit on one line in the comparison panels. Once it wraps, both
 * panels fill their width, the two layouts stop looking different, and the side-by-side
 * stops demonstrating anything.
 */
export const bidiLine = {
  text: 'Power BI — التقارير الكبيرة تفشل منذ أمس.',
  lang: 'ar',
  gloss: 'Power BI — large reports have been failing since yesterday.',
};

/**
 * Beats, in the order they play. `reactions` and `thread` render immediately after their
 * own message, which is also the order the demo reveals them in.
 */
export const stream = [
  {
    kind: 'message',
    from: 'marta',
    time: '09:12',
    body: 'Staging is on 2.4.0-rc3. Uploads over about 40 MB fail at 100% — the progress bar completes, then the document never appears in the folder.',
    // Drawn as an SVG glyph rather than the 👀 character: the emoji renders as a
    // tofu box on machines without a colour emoji font.
    reactions: [{ icon: 'eyes', count: 2, label: 'looking into it' }],
  },
  {
    kind: 'message',
    from: 'kenji',
    time: '09:13',
    body: 'Same here. Nothing in the backend log at all, which is the odd part.',
  },
  {
    kind: 'message',
    from: 'layla',
    time: '09:15',
    body: bidiLine.text,
    lang: bidiLine.lang,
    gloss: bidiLine.gloss,
  },
  {
    kind: 'message',
    from: 'daniel',
    time: '09:16',
    body: 'Found it. `client_max_body_size` is still `32m` on the staging proxy. nginx truncates the POST, DRF sees a short body and returns 400 before our view ever runs — so the failure is in the proxy log, not ours. Production is `512m`.',
    thread: {
      count: 3,
      replies: [
        {
          from: 'sofia',
          time: '09:18',
          body: 'Reproduced with a 47 MB PDF. Same 400, same silence in the app log.',
        },
        {
          from: 'daniel',
          time: '09:19',
          body: 'Patching staging now. It only ever affected staging.',
        },
        {
          from: 'marta',
          time: '09:20',
          body: "Let's pin the value in the deploy compose as well, so the two environments can't drift apart again.",
        },
      ],
    },
  },
  {
    kind: 'call',
    from: 'daniel',
    time: '09:29',
    title: 'Release 2.4 — upload limits',
    participants: ['daniel', 'marta', 'sofia'],
    duration: '6 min',
    detail: 'Screen share · staging nginx config',
  },
  {
    kind: 'message',
    from: 'marta',
    time: '09:41',
    body: 'Agreed on the call: one limit, one place, pinned in the deploy compose. Written up in the release note below.',
    receipt: { seen: 9 },
  },
];

/**
 * The assistant is a **separate surface**, not a bot living in a channel, and the page
 * presents it that way. In the product it is its own chat type (`ai_assistant`) with its
 * own header, its own mode switch and its own agent picker — and it can additionally be
 * switched on inside a normal chat, which is the co-existence the site's copy notes
 * rather than leads with.
 *
 * `steps` is the shape the app's `AISteps` component renders: a tool slug, the human
 * label the tool registry gives it, a short preview of the arguments, and how long the
 * step took.
 *
 * **Only real tool slugs belong here** — `search_hub`, `search_messages`, `web_search`,
 * `fetch_page`, `read_list`, `my_items`, `read_attachment`, `remember`, plus the pipeline
 * steps `analyze`, `summarize`, `think`, `review`, `handoff`. Inventing one would put a
 * capability on the page that does not exist (MANIFEST §1.5) and would render with the
 * fallback wrench icon.
 */
export const assistantSession = {
  // Mirrors the header of a real assistant chat: the mode, and which agent answers.
  mode: 'Advisory',
  agent: 'Auto',
  ask: 'Where else is an upload limit configured? Staging just truncated a 47 MB file.',
  steps: [
    { tool: 'search_messages', label: 'Search messages', preview: 'client_max_body_size', ms: 900 },
    { tool: 'search_hub', label: 'Search the hub', preview: 'upload limit', ms: 1400 },
    { tool: 'read_attachment', label: 'Read an attached file', preview: 'nginx.conf', ms: 700 },
    { tool: 'think', label: 'Waiting for the model to answer', preview: '', ms: 2300 },
  ],
  answer:
    'Three places set an upload ceiling. `deploy/nginx.conf` caps the request body — `32m` in the staging block, `512m` in production, which is the difference you hit. `DATA_UPLOAD_MAX_MEMORY_SIZE` in `backend/settings.py` only decides when Django spools to a temp file, so it will not reject a large upload. The SDK also refuses anything over 500 MB client-side before it starts. Only the nginx value differs between environments.',
  citations: [
    { label: 'deploy/nginx.conf', kind: 'document' },
    { label: '#infra · 4 Feb', kind: 'message' },
  ],
};

/**
 * The hero scenario: the shortest honest path from "a person has a problem" to "the
 * assistant answered it", so a visitor sees both halves of the product working together
 * in about eight seconds without reading anything.
 *
 * Pacing matters more than content here. The two human beats are deliberately fast — a
 * report and a question — because the assistant's working steps are the part worth
 * watching, and nobody waits through a preamble to reach them. Keep the answer short:
 * the hero pane is narrow, and the full version lives in the assistant section.
 *
 * The steps are the same run the assistant section plays in full, so the hero is showing
 * that assistant, not a different one.
 */
export const heroScenario = {
  // Measured, not guessed: these waits put the assistant to work ~1.7s after the
  // scenario starts. Anything slower and the hero reads as a chat demo that happens
  // to have a bot at the end, which is the opposite of the point.
  beats: [
    { from: 'kenji', time: '09:13', body: 'Staging just rejected a 47 MB upload.', wait: 450 },
    {
      from: 'marta',
      time: '09:14',
      mine: true,
      ask: true,
      body: '@assistant where else is an upload limit set?',
      wait: 900,
    },
  ],
  answer:
    'Three places. `deploy/nginx.conf` caps the request body — `32m` on staging, `512m` in production, which is the one you hit.',
};

/**
 * The payoff (MANIFEST §6.5) — the artefact the conversation produced, shown the way a
 * reader in the hub actually consumes it.
 */
export const releaseNote = {
  breadcrumb: ['Platform', 'Release notes'],
  title: 'Upload limits now live in one place',
  author: 'marta',
  date: '24 July 2026',
  version: '2.4.0',
  tags: ['release-2.4', 'infrastructure'],
  lead: 'A 32 MB request-body cap left on the staging proxy was silently truncating large uploads. The value is now pinned in the deploy compose file, identical across environments.',
  body: [
    {
      heading: 'What was happening',
      text: 'nginx cut the request body at 32 MB on staging. The browser finished sending, so the progress bar reached 100%, but Django received a short body and rejected it with a 400 before the upload view ran. Nothing reached the application log, which is why the failure looked like it came from nowhere.',
    },
    {
      heading: 'What changed',
      text: 'The limit moved out of the per-host nginx config and into the deploy compose file, where both environments read the same value. Staging and production are now both `512m`. The two other ceilings — Django spooling to disk, and the 500 MB client-side guard in the SDK — were already environment-independent and are unchanged.',
    },
    {
      heading: 'What to do',
      text: 'Nothing, if you use the hosted upgrade path. If you run your own compose file, copy the `CONTENTHUB_MAX_UPLOAD` entry from the sample and rebuild the proxy container.',
    },
  ],
};
