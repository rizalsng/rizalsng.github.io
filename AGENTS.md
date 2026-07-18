# AGENTS.md

Guidance for AI agents and contributors working on this repository.

## Project Overview

Personal website of Fachrizal Sinaga (geographer / developer), hosted on GitHub Pages at `https://rizalsng.github.io`. Static site, no build step, no dependencies, no framework.

## Structure

```
index.html          Single page, all content
css/style.css       All styles (CSS custom properties in :root)
js/scene.js         Game of Life canvas background (ES module)
js/ui.js            Interactions: Medium feed, previews, decode effect, marginalia
assets/img/         WebP project previews + og-image.jpg
assets/favicon.svg  SVG favicon
```

## Conventions

- **No build tooling.** Edit files directly; do not introduce npm, bundlers, or frameworks.
- **Styling:** use the CSS custom properties in `:root` (`--bg-color`, `--text-main`, `--text-muted`, `--accent`, `--accent-highlight`). Fonts: Cormorant Garamond (display), Space Mono (body). Keep the "map sheet / field terminal" aesthetic.
- **Design tokens:** blue `#002395` background, cyan `#66e0ff` highlights. Previews use `grayscale + mix-blend-mode: lighten`.
- **JS:** vanilla only. `scene.js` is an ES module; `ui.js` is a classic script wrapped in `DOMContentLoaded`.
- **Accessibility:** preserve `prefers-reduced-motion` handling (canvas renders static, animations disabled), keyboard-focus parity with hover states, `rel="noopener noreferrer"` on external links.
- **Performance:** keep images as WebP (convert with `cwebp -q 80`). The canvas loop must keep pausing on `document.hidden`.
- **Medium feed:** fetched via rss2json in `ui.js`, cached in localStorage (`medium-feed-cache`). Always keep a graceful fallback; never inject feed content with `innerHTML`.

## Testing

No test suite. Verify changes manually:

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

Check: desktop + mobile (~390px) viewports, keyboard navigation, console free of errors, feed fallback (block the rss2json domain to test).

## Deployment

Push to `master` → GitHub Pages deploys automatically.
