# Manual Test Plan — Mutual NDA Creator

A checklist for a human tester to run through before releasing changes to
this app. Automated coverage (unit/component/PDF-content tests) lives in
`__tests__/` and is run via `npm run test`; this checklist covers what
those tests can't: real rendering, real PDF viewers, real keyboards,
real screen readers, and real browsers.

Prerequisites: `npm run dev` in `frontend/`, then open http://localhost:3000.

## 1. Golden path

- [ ] Fill in Party 1 (name, title, company, notice address) and Party 2 with
      realistic values.
- [ ] Change Purpose to a custom sentence.
- [ ] Set an Effective Date via the date picker.
- [ ] Select "Expires" for MNDA Term and set years to `2`.
- [ ] Select "In perpetuity" for Term of Confidentiality.
- [ ] Fill in Governing Law and Jurisdiction.
- [ ] Confirm every value you entered appears correctly in the live preview
      on the right, including inside the Standard Terms paragraphs (Section
      1, 2, 5, 9), not just the Cover Page summary.
- [ ] Click "Download PDF". Confirm a file named `Mutual-NDA.pdf` downloads.
- [ ] Open the downloaded PDF in a real PDF viewer (not just the browser's
      built-in preview). Confirm:
  - [ ] Text is selectable/searchable (i.e. it's real text, not a
        screenshot/image).
  - [ ] All 11 Standard Terms sections are present, in order, after the
        Cover Page.
  - [ ] The content exactly matches what the live preview showed.
  - [ ] The document paginates correctly (no cut-off text at page breaks).

## 2. Term option combinations

For each combination below, verify Section 5 ("Term and Termination") in
both the live preview and the downloaded PDF reads as grammatically
correct, complete English — this is where a garbled-text bug shipped once
already (`{{confidentialityTermClause}}` substitution in `lib/mnda-content.ts`).

- [ ] MNDA Term = Expires (N years) + Confidentiality = N years
- [ ] MNDA Term = Expires (N years) + Confidentiality = In perpetuity
      → should read "...will survive in perpetuity, despite..." (not
      "survive for in perpetuity").
- [ ] MNDA Term = Continues until terminated + Confidentiality = N years
- [ ] MNDA Term = Continues until terminated + Confidentiality = In perpetuity

## 3. Edge-case inputs

- [ ] Leave every field empty and check the preview/PDF show sensible
      bracketed placeholders (e.g. `[Name]`, `[Purpose not specified]`,
      `[Fill in state]`) rather than blank gaps or the literal word
      "undefined".
- [ ] Type a very long Purpose (a few paragraphs) and confirm it wraps
      correctly in both the preview and the PDF without overflowing or
      getting clipped.
- [ ] Type special characters / accented or Cyrillic/Greek text into party
      names and company (e.g. `Müller & Söhne, Ltd. — "Beta"`, `ООО Тест`)
      and confirm they render correctly in both the live preview and the
      downloaded PDF text (`lib/pdf-fonts.ts` registers Noto Sans for this
      range — regression check for a bug where these silently rendered as
      garbled mojibake in the PDF with no error).
  - [ ] **Known limitation, not a bug to file:** CJK (e.g. `株式会社`) and
        Arabic/RTL text still render as garbled mojibake in the PDF —
        Noto Sans has no CJK glyph coverage, and Arabic needs a separate
        font plus RTL text shaping this renderer doesn't provide. Confirm
        this still fails the same way (a silent behavior change here,
        either better or worse, is worth investigating either way).
- [ ] In the MNDA Term / Term of Confidentiality year fields:
  - [ ] Type a negative number character-by-character (e.g. click the
        field and type `-`, then `5`). Confirm the `-` is not silently
        eaten mid-typing (regression check for a bug where per-keystroke
        clamping turned typed "-5" into "15" — see `MndaForm.tsx`'s
        `YearsInput`). Tab away and confirm it snaps to `1`.
  - [ ] Type `0`, tab away, confirm it snaps to `1`.
  - [ ] Type a decimal like `2.7`, tab away, confirm it rounds to `3`.
  - [ ] Type a large number like `99`, tab away, confirm it's accepted as-is.
- [ ] Pick an Effective Date in the past and one more than a year in the
      future; confirm both display correctly (no off-by-one day) in the
      preview and PDF.
- [ ] Reload the page and check the default Effective Date shown matches
      **today's date on your own system clock** (regression check for a
      UTC-vs-local-timezone bug — most relevant if your system timezone is
      behind UTC, e.g. anywhere in the Americas, especially late evening).

## 4. Keyboard-only navigation

Unplug your mouse (or just don't touch it) and, using only Tab / Shift+Tab
/ Space / Arrow keys / Enter:

- [ ] Tab through the entire form in a sensible order (Party 1 fields →
      Party 2 fields → Purpose → Effective Date → MNDA Term radios/year →
      Confidentiality radios/year → Governing Law → Jurisdiction →
      Download button).
- [ ] Confirm the focused element always has a visible focus outline.
- [ ] Use arrow keys to switch between the two radio options within a
      group (MNDA Term, Term of Confidentiality) and confirm the
      corresponding year input's disabled state updates.
- [ ] Reach the Download button via Tab and activate it with Enter/Space;
      confirm the download still triggers.

## 5. Screen reader spot check

Using a screen reader (VoiceOver on macOS, Narrator/NVDA on Windows):

- [ ] Tab to the Effective Date field and confirm it announces "Effective
      Date" (not just "date, blank" — regression check for a previously
      missing accessible label).
- [ ] Tab to the MNDA Term year number input and confirm it announces
      something meaningful referencing "year(s) from Effective Date" (not
      silence — regression check for a previously ambiguous nested-label
      structure).
- [ ] Confirm each fieldset's legend (e.g. "Party 1", "MNDA Term") is
      announced when entering that group.

## 6. Cross-browser / responsive

- [ ] Run the golden path (§1) in at least two of: Chrome, Firefox, Safari,
      Edge.
- [ ] Resize the browser to a narrow (mobile-width, ~375px) viewport and
      confirm the form and preview remain usable (readable, no horizontal
      scroll needed, inputs not clipped).
- [ ] Confirm the PDF download works the same way across browsers (some
      browsers block/prompt differently for programmatic downloads).

## 7. Console hygiene

- [ ] Open the browser devtools console during the entire golden path
      (§1) and confirm there are no errors or React warnings logged.
