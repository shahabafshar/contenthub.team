/**
 * Majority-script direction detection, mirroring the app's own implementation in
 * `frontend/src/components/messenger/MessageArea.jsx`.
 *
 * The point: `dir="auto"` resolves from the FIRST strong directional character, so a
 * mostly-Arabic line that opens with a Latin term ("Power BI reports — …") is declared
 * left-to-right and lays out wrongly. Counting strong characters instead gives the
 * direction the text is actually written in.
 *
 * Kept identical to the app on purpose, so this site renders the example the same way
 * the product would rather than approximating it.
 */

// Hebrew, Arabic, Syriac, Thaana, N'Ko, and the Arabic presentation forms.
const RTL_CHARS = /[֑-޿ࢠ-ࣿיִ-﷽ﹰ-ﻼ]/g;
// Latin, Latin-Extended, Greek and Cyrillic.
const LTR_CHARS = /[A-Za-zÀ-ɏͰ-ϿЀ-ӿ]/g;

/** 'rtl' | 'ltr' | 'auto' — 'auto' only when the text has no strong characters at all. */
export function textDirection(text) {
  const rtl = (text.match(RTL_CHARS) || []).length;
  const ltr = (text.match(LTR_CHARS) || []).length;
  if (!rtl && !ltr) return 'auto';
  return rtl >= ltr ? 'rtl' : 'ltr';
}

/** Counts, for showing why the majority rule beats first-strong-character. */
export function scriptCounts(text) {
  return {
    rtl: (text.match(RTL_CHARS) || []).length,
    ltr: (text.match(LTR_CHARS) || []).length,
  };
}
