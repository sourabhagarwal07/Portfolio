# Sourabh Agarwal — Portfolio

A single-page portfolio site. No build step, no framework — plain HTML, CSS, and JS, deployed directly via GitHub Pages.

Live at: **https://sourabhagarwal07.github.io/Portfolio**

## Updating your content

Everything on the page — hero taglines, summary stats, experience, skills, projects, education, patents, and contact links — comes from one file:

```
data/content.json
```

To update the site, edit that file and push. You don't need to touch `index.html`, `css/styles.css`, or `js/script.js` for routine content changes (new role, new project, updated numbers, etc).

A few notes on the shape of that file:

- **`hero.taglines`** — array of short phrases the hero types out on load. Add, remove, or reorder freely; the last one in the list is what stays on screen.
- **`summary.stats`** — each object needs `value` (a number), `suffix` (e.g. `"×"`, `"M+"`), and `label`. These animate as count-up numbers when scrolled into view.
- **`experience`** — array of jobs, most recent first. `end: null` isn't required here since we use the literal string `"Present"` for the current role.
- **`skills`** — an object keyed by category name; each value is an array of skill strings. Add a new category by adding a new key — it'll render as its own card automatically.
- **`projects`** — replace the two placeholder entries with your real projects. Each needs `title` and `description`; `link` and `tags` are optional. Remove the `"placeholder": true` field (or set it to `false`) once it's a real project — that field only controls the dashed-border placeholder styling.
- **`education`** / **`patents`** — straightforward arrays of objects; add or remove entries as needed.
- **`contact`** — `email`, `phone`, `linkedin` (display text), and `linkedinUrl` (the actual link).

## Running locally

Because `script.js` fetches `data/content.json` with the Fetch API, opening `index.html` directly via `file://` will fail in most browsers (they block local file fetches for security). Serve the folder instead:

```bash
python3 -m http.server 8000
```

Then open **http://localhost:8000** in your browser.

(Any other static file server works too — e.g. the VS Code "Live Server" extension.)

## Deploying to GitHub Pages

1. Push this repo to `github.com/sourabhagarwal07/Portfolio`.
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to "Deploy from a branch."
4. Set **Branch** to `main` and folder to `/ (root)`, then save.
5. GitHub will publish the site at `https://sourabhagarwal07.github.io/Portfolio` within a minute or two — no build step, no GitHub Actions required, since this is a plain static site.

If you'd rather have the site live at the root `sourabhagarwal07.github.io` (no `/Portfolio` subpath), rename this repository to `sourabhagarwal07.github.io` in GitHub's repo settings — everything else about the deployment stays the same.

## File structure

```
Portfolio/
├── index.html          # page markup — section shells only, no hardcoded content
├── css/
│   └── styles.css       # design tokens, layout, animations, responsive rules
├── js/
│   └── script.js         # fetches content.json, renders every section, drives animations
├── data/
│   └── content.json      # <- edit this file to update the site
├── docs/superpowers/     # design spec (for reference/history)
└── README.md
```

## Accessibility & performance notes

- All motion (typing effect, scroll reveals, count-up stats, parallax) is disabled automatically for visitors with `prefers-reduced-motion` set at the OS level — content still renders fully, just without animation.
- No animation library or web font framework beyond Google Fonts (Space Grotesk, Inter, JetBrains Mono) — kept deliberately lightweight for fast load.
- Keyboard focus is visible on all interactive elements (contact links, project links).
