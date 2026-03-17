# GlowBal QA Checklist

Date: 2026-03-17

## Integration & UX Checks

- [x] **PASS** Hero section visual consistency
  - Upload panel, how-it-works, trust strip share consistent glass styling and spacing.
  - Header/logo spacing remains stable between idle/quiz/results states.

- [x] **PASS** Quiz visual consistency
  - Question card typography/spacing normalized.
  - Option buttons and CTA/button hierarchy aligned with global button styles.
  - Back/next actions stay legible on mobile width.

- [x] **PASS** Results visual consistency
  - Results header uses responsive typography.
  - Cards/tier sections keep consistent spacing and no horizontal overflow at mobile widths.
  - Grid min width adjusted to avoid clipped cards on narrow screens.

- [x] **PASS** Loading UX states
  - CV analysis and result generation each show loading spinner + context copy.
  - Loading layout centers correctly across laptop/mobile.

- [x] **PASS** Error UX states
  - Added prominent error banner for processing/generation failures.
  - Clear recovery actions: back to start and retry when applicable.

- [x] **PASS** Responsive behavior
  - Added breakpoints for <=1024 and <=768 widths.
  - Question metadata, controls, and error actions stack correctly on mobile.

## Mobile QA Checklist (360px–430px)

Test in browser devtools with these exact viewport widths: **360x800, 375x812, 390x844, 412x915, 430x932**.

- [ ] Home: hero title wraps cleanly, upload dropzone fully visible, start CTA >=44px high, no horizontal scroll.
- [ ] Upload state: long CV filename truncates/wraps without overflow; trust strip remains readable.
- [ ] Quiz: option tiles + back/next controls remain thumb-friendly (>=44px), progression text does not clip.
- [ ] Results: sticky report action bar stays usable; tier cards and bookmarks remain tappable; selecting card scrolls to detail smoothly on mobile.
- [ ] Detail panel: image, metadata chips, and action buttons stack without clipping; external link + export are full-width readable.
- [ ] Motion/perf: reduced-motion disables entrance animations; scrolling remains smooth and jank-free.

## Build & Lint

- [x] **PASS** `npm run build`
- [x] **PASS** `npm run lint`

## Notes

- Existing parser-related flow in `App.jsx` was kept intact and integrated with improved state UX.
- No git conflicts encountered during this pass.

## Match Report UX Redesign (Amazon-like browsing)

### Before
- Report was long-scroll with large cards, comparison table, and modal controls competing for attention.
- Reach/Target/Safety existed as separate stacked sections rather than a quick browse surface.
- Detail-level info was repeated across cards, increasing visual clutter.
- Shortlist/export controls were prominent and interrupted scanning.

### After
- Added a calm top report heading + compact menu bar with source and lightweight shortlist status.
- Introduced a desktop-first 3-column browse layout (Reach, Target, Safety), each showing 2 compact image-first cards.
- Clicking a card now drives a dedicated detail panel with:
  - larger image
  - university name, location, official link
  - concise description
  - "Why this fits you / CV" bullets
  - metadata chips (cost band, competitiveness, subject fit)
- Shortlist capability is preserved but visually de-emphasized (small card bookmark + subtle detail button).
- Added responsive behavior to stack columns and detail panel cleanly on smaller screens.
