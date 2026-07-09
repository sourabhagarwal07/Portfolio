# Portfolio Website — Design Spec

**Date:** 2026-07-09
**Owner:** Sourabh Agarwal
**Deployment target:** GitHub Pages — `github.com/sourabhagarwal07/Portfolio` → `sourabhagarwal07.github.io/Portfolio`

## Purpose

A single-page portfolio site built from Sourabh's resume, designed to communicate his impact to a recruiter within ~5 seconds of landing on the page, using minimalist visual design, scroll-driven animation, and a subtle parallax effect. Content must be trivially updatable by editing a single data file — no code changes required for routine updates (new role, new project, updated numbers).

## Non-goals

- No backend / server-side logic (contact is link-based, not a form).
- No build pipeline, bundler, or framework — plain static assets only.
- No CMS or database — a single JSON file is the source of truth.
- No multi-page routing — everything lives on one scrollable page.

## Architecture

Static site, no build step, deployed directly from the `main` branch via GitHub Pages.

```
Portfolio/
├── index.html          # single-page markup, section shells only (no hardcoded resume content)
├── css/
│   └── styles.css      # CSS variables (palette/spacing/type), layout, animation keyframes, responsive rules
├── js/
│   └── script.js       # fetches data/content.json, renders all sections, drives scroll animations
├── data/
│   └── content.json    # single source of truth for all editable content
└── README.md           # how to edit content.json, how to run locally, how deployment works
```

### Data flow

1. Browser loads `index.html`, which contains empty section containers (e.g. `<section id="experience"></section>`) plus `script.js`.
2. `script.js` runs `fetch('data/content.json')` on `DOMContentLoaded`.
3. Each section is rendered by a dedicated render function (`renderHero()`, `renderExperience()`, etc.) that reads its slice of the JSON and injects markup.
4. After render, an `IntersectionObserver` is attached to animatable elements (timeline entries, skill tags, stat counters, project cards) to trigger fade/slide/count-up animations as they scroll into view.
5. To update the site: edit `data/content.json`, commit, push. No other file needs to change for routine content updates.

### `content.json` shape (illustrative)

```json
{
  "hero": {
    "name": "Sourabh Agarwal",
    "title": "Technical Leader & Software Engineer",
    "taglines": [
      "Technical Leader.",
      "Distributed Systems Architect.",
      "8+ years shipping production AI/backend systems."
    ]
  },
  "summary": {
    "text": "...",
    "stats": [
      { "value": 12, "suffix": "×", "label": "inference latency reduction" },
      { "value": 5, "suffix": "M+", "label": "users served" },
      { "value": 1, "suffix": "M+/day", "label": "records ingested" }
    ]
  },
  "experience": [
    {
      "company": "National Research Council of Canada",
      "role": "Application Development Specialist",
      "location": "Ottawa, ON",
      "start": "2022-09",
      "end": null,
      "bullets": ["...", "..."]
    }
  ],
  "skills": {
    "Languages": ["C", "C++", "Java", "Python", "R"],
    "Distributed Systems & Backend": ["REST APIs", "Spring Boot", "..."]
  },
  "projects": [
    { "title": "Placeholder Project", "description": "...", "link": "", "tags": [] }
  ],
  "education": [ { "degree": "M.Sc., Digital Transformation and Innovation", "school": "University of Ottawa", "years": "2019 – 2021" } ],
  "patents": [ { "title": "...", "detail": "..." } ],
  "contact": { "email": "Sourabh.max01@gmail.com", "phone": "(613) 255-2684", "linkedin": "linkedin.com/in/sourabh-agarwal-261b57111" }
}
```

## Sections & content (scroll order)

1. **Hero** — full viewport height. Typing-effect animation cycles through `hero.taglines`, then settles on name + title. Minimal initials avatar (no photo).
2. **Summary** — positioning statement styled as a short highlighted block, with `summary.stats` rendered as animated count-up numbers triggered on scroll-into-view.
3. **Experience** — vertical timeline built from the `experience` array (NRC → StatCan → uOttawa co-op → Cognizant), each entry fades/slides in on scroll. Subtle parallax offset on the timeline line itself.
4. **Skills** — grouped tag clusters keyed by `skills` object categories, staggered fade-in.
5. **Projects** — card grid from the `projects` array. Ships with 1-2 placeholder cards (clearly marked as placeholders) since this section starts empty of real projects.
6. **Education & Patents** — compact combined section from `education` and `patents` arrays.
7. **Contact** — icon links only (email / phone / LinkedIn), from the `contact` object. No form, no backend.
8. **Footer** — minimal, small print, auto-filled year.

## Visual design

- **Palette:** Deep navy/charcoal background (`#0a0e1a` to `#131824` range), off-white text (`#e8eaf0`-ish), electric blue accent (`#2563eb`-ish, exact shade tuned for WCAG AA contrast against the background) used for links, highlights, timeline markers, and stat numbers.
- **Type:** Large, confident type for the hero name/tagline; smaller letter-spaced/small-caps labels for section headers. Generous whitespace throughout — minimalist, not cluttered.
- **Layout:** Single scrolling column, max content width constrained for readability on large screens.

## Animation & parallax

- No animation library — plain CSS transforms/transitions plus the native `IntersectionObserver` API, to keep the page fast (critical for the 5-second attention window).
- Hero typing effect: JS-driven text cycling, respecting reduced-motion (see below).
- Scroll-triggered fade/slide-in for timeline entries, skill tags, and project cards.
- Count-up animation for summary stats, triggered once when scrolled into view.
- Subtle parallax on hero background and the experience timeline (CSS `transform: translateY()` tied to scroll position, throttled via `requestAnimationFrame`).
- All motion is wrapped in a `prefers-reduced-motion: reduce` media query / JS check — for users with that OS setting, animations are replaced with instant state changes (no motion, content still fully visible).

## Error handling

- If `fetch('data/content.json')` fails (e.g. network issue, or the page is opened directly via `file://` where fetch is blocked by browser security), the page shows a minimal inline message ("Content failed to load — please refresh") instead of a blank page.
- This does not affect the live GitHub Pages deployment, which serves everything over HTTPS and works normally; it only affects local testing without a server. README documents running a local server (`python3 -m http.server`, or VS Code Live Server) for local development.

## Testing

- Responsive layout check at mobile / tablet / desktop breakpoints.
- Lighthouse pass for performance and accessibility (contrast, reduced-motion support, semantic HTML).
- Manual scroll-animation smoke test in Chrome, Firefox, and Safari.
- Manual check of `content.json` edits reflecting correctly with no other file changes.

## Deployment

- Repo: `github.com/sourabhagarwal07/Portfolio`.
- GitHub Pages configured to serve from `main` branch, root directory.
- Resulting URL: `sourabhagarwal07.github.io/Portfolio`. (Note: serving from the repo root under a project name means the site lives at a `/Portfolio` subpath, not the account root — acceptable per current repo name; switching to a root-level site would require renaming the repo to `sourabhagarwal07.github.io`, which is out of scope for this spec.)
- No GitHub Actions needed — Pages serves static files directly, no build step.
