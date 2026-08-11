# Changelog

All notable changes to KVPy are logged here, in the order they were built. Format loosely follows [Keep a Changelog](https://keepachangelog.com/).

## [0.8.1] — Bug fixes

### Fixed
- File action buttons (rename/duplicate/download/delete) never appeared on hover on desktop. The design kit only revealed them on a folder's `<summary>:hover`, but file rows aren't inside a `<summary>` — added a dedicated hover rule for file rows. (They always worked on touch devices, since the kit already shows them permanently under `@media (hover: none)`, which is why the bug was desktop-only.)
- The boot screen could hang on "Booting Python runtime" indefinitely with no feedback if the Pyodide CDN download stalled (blocked/slow network). Added a 20s timeout that shows a clearer message, a network hint, and a **Retry** button.

## [0.8.0] — Notebook mode & richer output

### Added
- Real multi-cell `.ipynb` editing: code and markdown cells, a shared persistent Python namespace across cells (a real notebook kernel model, not per-cell isolation), per-cell output (stdout/stderr/images/DataFrames), execution counters, Run All / Restart & Run All / Clear All Outputs, add/move/delete cells.
- `Shift+Enter` (run cell, advance) and `Ctrl+Enter` (run cell in place) inside notebook cells.
- Sortable, filterable tables: every rendered table (DataFrame output, CSV preview) now gets click-to-sort headers and a filter box, client-side, with no Python-side changes.
- Export Report: a self-contained HTML report (source + Terminal/Output for regular files, or every cell for notebooks) with a built-in "Print / Save as PDF" button and a "Download as .html" button.
- `.ipynb` import now preserves the real multi-cell notebook (previously it flattened cells into a single `.py` file).

### Changed
- Worker execution now tracks a "current exec target" (Terminal vs. a specific notebook cell) so stdout/stderr/images route to the right place.

## [0.7.0] — Coding quality

### Added
- Jedi-backed autocomplete (installed lazily on first use), layered alongside the existing static `str.`-method and `import`-name heuristics.
- Background linting via pyflakes, debounced while typing, shown as inline warnings alongside runtime-error highlighting.
- Format on demand (`Shift+Alt+F`) or on save, via `autopep8` (default) or `black`.
- Command palette (`Ctrl+Shift+P`): fuzzy search across every File/Edit/View/Run/Terminal/Help action.
- New Settings section: "Code quality" (toggle Jedi, toggle lint, formatter choice, format-on-save).

## [0.6.0] — Offline support

### Added
- `sw.js` service worker: network-first caching for the app's own files (always fresh online, still works offline), cache-first with background refresh for pinned CDN assets (CodeMirror, fflate, Pyodide, fonts) — since every CDN URL is version-pinned, a cache hit is always correct.
- An "update available" banner when a new deployed version is detected.
- An offline indicator in the status bar.

### Notes
- Requires the page to be served over HTTPS or `localhost` — service workers don't register on `file://` pages.

## [0.5.0] — Icon, SEO & social banner

### Added
- App icon set (`favicon.svg`, `favicon.ico`, `icon-180/192/512.png`), generated to match the design kit's palette and IBM Plex Mono typeface.
- `og-banner.png`, a 1200×630 social-preview image.
- Full SEO metadata: description, canonical URL, robots, theme-color, Open Graph tags, Twitter Card tags, JSON-LD structured data.
- `site.webmanifest` for "Add to Home Screen" / PWA installation.

## [0.4.0] — Rebrand to KVPy

### Changed
- Renamed the project from the generic "Python IDE" to **KVPy** across the title, header, and welcome message.
- Saved the single-file app as `index.html`.

### Added
- A "Welcome back" modal (replacing a plain `confirm()` dialog) offering to restore a previously saved session, with a credit line linking the author, GitHub repo, and live site.

## [0.3.2] — Security & bug-fix pass

### Fixed
- Stored HTML injection in the file explorer: file/folder names (from rename, `.zip` import, or `.ipynb` import) were inserted unescaped. Now HTML-escaped.
- HTML injection via rich Python output (e.g. a crafted `_repr_html_()`): added a sanitizer that strips `<script>`/`<iframe>`/`<object>`/`<embed>`/`<link>`/`<meta>`/`<form>`, all `on*=` handlers, and `javascript:` URLs before insertion.
- Zip-slip style paths (`../../evil.py`) in `.zip` imports are now stripped.
- A malformed/tampered saved session in `localStorage` could partially corrupt in-memory state before failing; added structural validation before restoring.
- Breakpoints became orphaned after renaming a file, and were left as dead entries after deleting one — now migrated/cleaned up.
- The Variables panel could show a misleading empty state stacked above real call-stack data while debugging.
- "Restart runtime" in Settings had backwards, partly dead logic.

### Hardened
- Added a verified Subresource Integrity hash (computed from the official npm tarball) to the `fflate` CDN script.
- Pinned all CodeMirror/Lezer ESM imports from a floating major-version tag to exact, verified npm versions.

## [0.3.1] — Removed hover documentation

### Removed
- The hover-tooltip documentation feature (a curated docs dictionary for builtins/keywords) was removed at the user's request.

## [0.3.0] — Version 3: Advanced

### Added
- Menu bar: File, Edit, View, Run, Terminal, Help, each with real wired actions.
- Settings modal: Editor (theme, font, font size, tab size, word wrap, minimap, auto save), Python (runtime version, packages, restart), Terminal (font size, clear on run), and a Security notes section.
- Save system: "Save Project" to `localStorage`, autosave every 20s, restore-on-reload.
- Import/export `.zip` (via `fflate`) and basic `.ipynb` import/export.
- A debugger: breakpoints (click the gutter), Step Into/Over/Out, Continue, Variables, Call Stack — implemented as a trace-replay (record the whole run once via `sys.settrace`, then navigate the recording), since a browser script can't be truly paused mid-execution without special server headers.
- Hover documentation tooltips for common builtins/keywords (later removed — see 0.3.1).
- A minimap.
- Reorganized output into four tabs: Terminal, Problems, Output, Variables.

## [0.2.0] — Version 2: File explorer, packages, data science

### Added
- File Explorer sidebar: new/rename/duplicate/delete/download/upload, folders — synced into Pyodide's virtual filesystem so multi-file imports work.
- Package manager modal (numpy, pandas, matplotlib, scipy, scikit-learn, …) via `pyodide.loadPackage` / micropip.
- DataFrame auto-render via `_repr_html_()`.
- matplotlib chart capture (patches `plt.show()` to emit an inline PNG).
- CSV/JSON file preview.
- Execution time and exit status on every run.
- `input()` support via a pre-fill dialog (collects values before running, since the browser can't pause mid-script).
- Richer traceback formatting.
- Smarter autocomplete: `str.` → string methods, `import pan` → package name suggestions.

## [0.1.0] — Version 1: Basic editor + runtime

### Added
- CodeMirror 6 editor: syntax highlighting, auto-indent, bracket/quote matching, line numbers, code folding, autocomplete, find & replace, multi-cursor editing, undo/redo, dark/light themes, font-size control, word wrap.
- Pyodide Python runtime running in a Web Worker (so Stop can actually interrupt execution).
- Run / Stop / Clear, with Console/Errors output tabs (stdout/stderr coloring, traceback + error-line highlighting).
- New / Open / Save `.py`.
- Keyboard shortcuts modal.
- Built on the `kvsql-ui-kit` design system.
