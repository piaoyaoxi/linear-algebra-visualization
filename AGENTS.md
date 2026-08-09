# Project Instructions

- Before changing or reviewing this repository, read `TODO.md` completely. It is the required session memory and current-work entry point.
- Use `docs/project-memory.md` for longer research notes and historical context after reading `TODO.md`.
- The active student application is in `current/`. Preserve unrelated user changes and do not edit `legacy/` unless the user explicitly asks.
- Student pages must not contain internal wording such as development progress, prototype status, placeholders, or future-production notes.
- Render mathematics through the local KaTeX files in `current/vendor/katex/`.
- Video and interaction blocks are optional. Render them only when real content exists.
- Representative examples keep the question visible, with answers or analysis revealed only after student action.

## Package manager

- None. The active app is static HTML, CSS, and JavaScript; do not introduce a package manager unless the task requires it.

## Commit attribution

- AI commits must include the agent's own attribution:

```text
Co-Authored-By: <agent model name> <attribution email>
```

## Git workflow

- `main` is the only integration branch. Do not commit or push directly to it; create a short-lived task branch and open a PR targeting `main`.
- Organize branches around one complete delivery goal, not around whether a file contains content, CSS, or JavaScript. Use two branch prefixes:
  - `content/<task>` owns a complete chapter-section task. Keep that section's wording, formulas, examples, self-tests, summaries, `videoPlan`, interaction code, presentation JavaScript, CSS, Canvas/SVG, and visual assets together in the same branch.
  - `ui/<task>` is only for a standalone visualization/UI change that does not change section content, or for shared site UI such as themes, navigation, sidebars, and global presentation components.
- One complete section uses one branch, one PR, and one preview. Do not split the same section into dependent Content and UI PRs merely because it contains both teaching content and interaction/layout work.
- Keep at most one active content branch and one active UI branch. Merge an accepted PR promptly, delete its branch, and create the next task branch from the updated `main`.
- Do not build long stacks of dependent PRs. A temporary two-PR dependency is allowed only when unavoidable; merge the prerequisite first, then rebase or merge `main` into the dependent branch and retarget it to `main`.
- Before final review, an active branch must incorporate the latest `main` so its preview includes already-accepted work from the other lane.
- Treat `current/learn.html`, `current/app.js`, and shared registries/mount files as integration hotspots. Avoid concurrent edits; coordinate ownership and recheck the combined page after syncing `main`.
- Delete merged task branches. Keep `gh-pages` only for the automatic `main` site deployment and PR previews; never use it as a development base or edit it directly.

## Mathematical visualization

- Derive visual geometry from the mathematical invariant; do not hand-place an object until it merely looks aligned.
- For vector-component diagrams, compute the result endpoint from the component sum. The rendered arrow apex itself—not the shaft endpoint, marker box, or a clipped tip—must coincide with the exact mathematical endpoint or polygon vertex at every stage.
- Keep internal correctness constraints internal when the diagram already communicates the relationship. Do not add redundant equations or explanatory copy to the student page.
- In the §4 inverse-workbench diagram, keep visible vector labels to `e₁`, `e₂`, and `x`; keep the stage equations to `Ix=x`, `Ax`, and `A⁻¹Ax=x`. Treat `x=e₁+e₂` as an implementation invariant, not visible student-page copy.
- Verify both coordinate equality and rendered arrow-apex alignment in a real browser before committing a mathematical visualization.

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
