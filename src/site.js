// Single source of truth for outbound links and download targets (MANIFEST §8.5).
// Change a URL here, or flip a platform's `available` flag, and the whole site follows.

export const siteName = 'ContentHub';
export const domain = 'contenthub.team';

// This site's own public repo. Builds too large to serve from `dist/` are attached to
// ITS GitHub Releases rather than the application repo's, because the application repo
// is private and its release assets are not publicly downloadable.
export const repoUrl = 'https://github.com/shahabafshar/contenthub.team';
export const releasesUrl = `${repoUrl}/releases`;
const downloadBase = `${repoUrl}/releases/latest/download`;

// Desktop version. Tracks `desktop-win/src-tauri/tauri.conf.json` (and
// `desktop/package.json`) in the application repo — bump it here when a new build ships.
export const desktopVersion = '0.3.0';

/**
 * The Windows filename is FIXED, deliberately — it matches `build-all.mjs`'s
 * `desktop/dist/ContentHub-Native.exe` in the application repo, so the download URL never
 * changes and can be linked from installers, docs and scripts elsewhere.
 *
 * Because the name is stable, freshness cannot come from the URL. Instead an MD5 sidecar
 * sits beside the binary at the same path plus `.md5`, holding the bare lowercase digest
 * and nothing else. Installed clients poll it to detect a new build. `scripts/
 * write-download-hash.mjs` regenerates every sidecar on `prebuild`, so the hash can never
 * disagree with the binary next to it, and `public/_headers` keeps both on a short cache
 * so a new build is actually noticed.
 */
export const nativeWindowsFile = 'ContentHub-Native.exe';

/** Absolute URL of a platform's MD5 sidecar, or null when it has no self-hosted build. */
export function checksumUrl(platform) {
  return platform.path ? `${platform.path}.md5` : null;
}

// Builds are produced unsigned (no code-signing certificates in CI), which is why the
// download note mentions the SmartScreen prompt. Do not drop that note without also
// adding real signing.
export const desktopSigned = false;

/**
 * Download targets. `available: false` renders a disabled button showing its status:
 * the buttons stay on the page so the roadmap is visible, but nothing pretends to be
 * downloadable before it exists.
 *
 * Two ways to serve a build:
 *   `path` — served by this site out of `public/`. Only viable under Cloudflare's
 *            25 MiB per-file asset limit, which the 2.6 MB Windows build is well
 *            inside. No external host, and the link works the moment the site deploys.
 *   `file` — a GitHub release asset on this repo, for anything too large for `path`.
 *            Pre-filled from the electron-builder `artifactName` config in the app repo
 *            (`${productName}.${ext}`), so publishing a platform is a one-word edit.
 */
export const platforms = [
  {
    id: 'windows',
    name: 'Windows',
    icon: 'windows',
    detail: 'Windows 10 & 11 · 64-bit',
    note: 'One 2.6 MB .exe — no installer, no admin rights. Uses the WebView2 runtime already on Windows 10 and 11.',
    path: `/download/${nativeWindowsFile}`,
    size: '2.6 MB',
    available: true,
    match: 'Windows',
  },
  {
    id: 'macos',
    name: 'macOS',
    icon: 'apple',
    detail: 'Apple silicon & Intel',
    note: 'Already builds in CI. Unsigned and un-notarised, so not published yet.',
    file: 'ContentHub.dmg',
    available: false,
    status: 'In progress',
    match: 'macOS',
  },
  {
    id: 'linux',
    name: 'Linux',
    icon: 'linux',
    detail: 'AppImage · x86-64',
    note: 'Already builds in CI, awaiting a tagged release.',
    file: 'ContentHub.AppImage',
    available: false,
    status: 'In progress',
    match: 'Linux',
  },
  {
    id: 'android',
    name: 'Android',
    icon: 'android',
    detail: 'Phone & tablet',
    note: 'Planned. Web push and the responsive layout already work in a mobile browser.',
    available: false,
    status: 'Planned',
    match: 'Android',
  },
  {
    id: 'ios',
    name: 'iOS',
    icon: 'ios',
    detail: 'iPhone & iPad',
    note: 'Planned. Installs as a home-screen web app in the meantime.',
    available: false,
    status: 'Planned',
    match: 'iOS',
  },
];

export const primaryPlatform = platforms.find((p) => p.available) ?? null;

/** Download URL for a platform, or null when it has no published build. */
export function downloadUrl(platform) {
  if (!platform.available) return null;
  if (platform.path) return platform.path;
  return platform.file ? `${downloadBase}/${platform.file}` : null;
}

/** True when the build is served by this site, so the link can carry `download`. */
export function isSelfHosted(platform) {
  return Boolean(platform.path);
}
