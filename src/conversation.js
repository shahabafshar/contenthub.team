/**
 * The single worked example the whole page is built around (MANIFEST §6.2, §6.3).
 *
 * One coherent arc, start to finish: a bug is reported in a channel, diagnosed in a
 * thread, audited with the AI assistant's tool loop, settled on a call, and written up
 * as a published release note — which is the payoff artefact at the bottom of the page.
 *
 * It is illustrative, not a transcript of anything real, and every surface that renders
 * it is labelled "Demo" (MANIFEST §1.6). Rewrite it here and the entire page follows.
 *
 * Text supports single backticks for inline code; see components/Rich.astro.
 */

export const workspace = {
  name: 'Northwind Platform',
  channel: 'release-2-4',
  topic: 'Cutting 2.4.0 — staging sign-off before Thursday',
  members: 9,
};

export const people = {
  mina: { name: 'Mina Rostami', first: 'Mina', role: 'Platform', initials: 'MR', hue: 247, presence: 'online' },
  ali: { name: 'Ali Karimi', first: 'Ali', role: 'Backend', initials: 'AK', hue: 168, presence: 'online' },
  sara: { name: 'Sara Taheri', first: 'Sara', role: 'Documentation', initials: 'ST', hue: 292, presence: 'away' },
  omid: { name: 'Omid Nazari', first: 'Omid', role: 'QA', initials: 'ON', hue: 32, presence: 'online' },
  assistant: { name: 'Assistant', first: 'Assistant', role: 'AI', initials: 'AI', hue: 205, bot: true, presence: 'online' },
};

/**
 * Beats, in the order they play. `reactions` and `thread` render immediately after
 * their own message, which is also the order the demo reveals them in.
 */
export const stream = [
  {
    kind: 'message',
    from: 'mina',
    time: '09:12',
    body: 'Staging is on 2.4.0-rc3. Uploads over about 40 MB fail at 100% — the progress bar completes, then the document never appears in the folder.',
    // Drawn as an SVG glyph rather than the 👀 character: the emoji renders as a
    // tofu box on machines without a colour emoji font.
    reactions: [{ icon: 'eyes', count: 2, label: 'looking into it' }],
  },
  {
    kind: 'message',
    from: 'omid',
    time: '09:13',
    body: 'Same here. Nothing in the backend log at all, which is the odd part.',
  },
  {
    kind: 'message',
    from: 'ali',
    time: '09:16',
    body: 'Found it. `client_max_body_size` is still `32m` on the staging proxy. nginx truncates the POST, DRF sees a short body and returns 400 before our view ever runs — so the failure is in the proxy log, not ours. Production is `512m`.',
    thread: {
      count: 3,
      replies: [
        {
          from: 'sara',
          time: '09:18',
          body: 'Reproduced with a 47 MB PDF. Same 400, same silence in the app log.',
        },
        {
          from: 'ali',
          time: '09:19',
          body: 'Patching staging now. It only ever affected staging.',
        },
        {
          from: 'mina',
          time: '09:20',
          body: "Let's pin the value in the deploy compose as well, so the two environments can't drift apart again.",
        },
      ],
    },
  },
  {
    kind: 'assistant',
    from: 'mina',
    time: '09:24',
    ask: '@assistant where else is an upload limit configured?',
    steps: [
      { tool: 'search_messages', arg: 'client_max_body_size', result: '4 matches across 2 channels' },
      { tool: 'read_document', arg: 'deploy/nginx.conf', result: '2 server blocks' },
      { tool: 'read_document', arg: 'backend/settings.py', result: '1 match' },
    ],
    answer:
      'Three places set an upload ceiling. `deploy/nginx.conf` caps the request body — `32m` in the staging block, `512m` in production, which is the difference you hit. `DATA_UPLOAD_MAX_MEMORY_SIZE` in `backend/settings.py` only decides when Django spools to a temp file, so it will not reject a large upload. The SDK also refuses anything over 500 MB client-side before it starts. Only the nginx value differs between environments.',
    citations: [
      { label: 'deploy/nginx.conf', kind: 'document' },
      { label: '#infra · 4 Feb', kind: 'message' },
    ],
  },
  {
    kind: 'call',
    from: 'ali',
    time: '09:29',
    title: 'Release 2.4 — upload limits',
    participants: ['ali', 'mina', 'sara'],
    duration: '6 min',
    detail: 'Screen share · staging nginx config',
  },
  {
    kind: 'message',
    from: 'mina',
    time: '09:41',
    body: 'Agreed on the call: one limit, one place, pinned in the deploy compose. Written up in the release note below.',
    receipt: { seen: 9 },
  },
];

/**
 * The payoff (MANIFEST §6.5) — the artefact the conversation produced, shown the way a
 * reader in the hub actually consumes it.
 */
export const releaseNote = {
  breadcrumb: ['Platform', 'Release notes'],
  title: 'Upload limits now live in one place',
  author: 'mina',
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
