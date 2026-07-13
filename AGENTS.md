# Project Instructions

- Before changing or reviewing this repository, read `TODO.md` completely. It is the required session memory and current-work entry point.
- Use `docs/project-memory.md` for longer research notes and historical context after reading `TODO.md`.
- The active student application is in `current/`. Preserve unrelated user changes and do not edit `legacy/` unless the user explicitly asks.
- Student pages must not contain internal wording such as development progress, prototype status, placeholders, or future-production notes.
- Render mathematics through the local KaTeX files in `current/vendor/katex/`.
- Video and interaction blocks are optional. Render them only when real content exists.
- Representative examples keep the question visible, with answers or analysis revealed only after student action.

## UI verification before commit

When changing student-facing UI under `current/` (layout, topbar, sidebar,
brand, cover animation, example challenge, page rail, styles):

1. Finish the code change first.
2. Verify in a real browser or Playwright against local `current/learn.html`
   and, if cover is touched, `current/index.html`.
3. Check at least: no console/page errors, intended layout/alignment,
   desktop and a narrow/mobile width when layout is involved.
4. Only then commit, push, or open/update a PR.
5. Do not claim the work is done until that browser check has passed.

Prefer Playwright screenshots or a short automated smoke check when available.
If the preview is GitHub Pages, hard-refresh or confirm the deployed asset
matches the commit before asking the user to review.
