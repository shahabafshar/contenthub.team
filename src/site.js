// Single source of truth for outbound links and download targets (MANIFEST §8.5).
// Change a URL here, or flip a platform's `available` flag, and the whole site follows.

export const siteName = 'ContentHub';
export const domain = 'contenthub.team';

// This site's own public repo. Desktop builds are attached to ITS GitHub Releases
// because (a) the application source repo is private, so its release assets are not
// publicly downloadable, and (b) the build is ~74 MB — far over Cloudflare's per-file
// static-asset limit, so it cannot be served out of this site's own `dist/`.
export const repoUrl = 'https://github.com/shahabafshar/contenthub.team';
export const releasesUrl = `${repoUrl}/releases`;
const downloadBase = `${repoUrl}/releases/latest/download`;

// Desktop shell version. Tracks `desktop/package.json` in the application repo —
// bump it here when a new release is published.
export const desktopVersion = '0.3.0';

// Builds are produced unsigned (no code-signing certificates in CI), which is why the
// download note mentions the SmartScreen prompt. Do not drop that note without also
// adding real signing.
export const desktopSigned = false;

/**
 * Download targets. `available: false` renders a disabled button showing its status:
 * the buttons stay on the page so the roadmap is visible, but nothing pretends to be
 * downloadable before it exists.
 *
 * `file` is pre-filled from the electron-builder `artifactName` config in the app repo
 * (`${productName}.${ext}`), so publishing a platform is a one-word edit here.
 */
export const platforms = [
  {
    id: 'windows',
    name: 'Windows',
    icon: 'windows',
    detail: 'Windows 10 & 11 · 64-bit',
    note: 'Portable single .exe, 74 MB — no installer, no admin rights.',
    file: 'ContentHub.exe',
    size: '74 MB',
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

/** Absolute download URL for a platform, or null when it has no published build. */
export function downloadUrl(platform) {
  return platform.available && platform.file ? `${downloadBase}/${platform.file}` : null;
}
