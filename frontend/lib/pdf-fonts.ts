import { Font } from "@react-pdf/renderer";
import { notoSansBoldBase64, notoSansRegularBase64 } from "@/lib/noto-sans-font-data";

export const NOTO_SANS_FAMILY = "Noto Sans";

// The default PDF standard font (Helvetica) only covers WinAnsi/Latin-1, so
// party or company names in other scripts render as garbled mojibake
// instead of erroring. Noto Sans covers Latin Extended, Cyrillic, Greek,
// and Vietnamese, which fixes the common cases. It does not cover CJK or
// Arabic (those need separate, much larger script-specific fonts, and
// Arabic also needs RTL text shaping this renderer doesn't provide) -- see
// MANUAL_TESTING.md for that known limitation.
//
// Embedded as base64 data URLs (not fetched from a URL) so PDF generation
// has no network dependency and behaves identically in the browser and in
// Node-based tests, at the cost of ~1.5MB added to the bundle that imports
// this module.
export function registerNotoSansFont(): void {
  Font.register({
    family: NOTO_SANS_FAMILY,
    fonts: [
      { src: `data:font/ttf;base64,${notoSansRegularBase64}`, fontWeight: 400 },
      { src: `data:font/ttf;base64,${notoSansBoldBase64}`, fontWeight: 700 },
    ],
  });
}
