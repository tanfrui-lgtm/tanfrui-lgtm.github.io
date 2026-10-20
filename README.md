# Rui Tang · Academic Homepage

English-first research portfolio with Chinese language switching.

The homepage presents selected work, experiments, and conference moments. Complete papers and honors live in `publications.html` and `honors.html`; the homepage has no résumé download entry.

## GitHub Pages

Publish the `main` branch from `/ (root)` using **Settings → Pages → Deploy from a branch**. The `.nojekyll` file keeps the site fully static; no build dependencies are required.

## Update

- `content.js`: bilingual education, research, publications, and awards.
- `portfolio-content.js`: homepage narratives, selected-work prompts, and paper summaries.
- `app.js`: page structure, translations, navigation, and image viewer.
- `experience.css` and `experience.js`: editorial layouts, scroll-linked research media, motion controls, and responsive behavior.
- `kinetic-scene.js`: original interactive 3D sculpture, with a static fallback when WebGL is unavailable.
- Other CSS files: base styles, local fonts, galleries, and publication layouts.
- `assets/`: portrait, CV, project images, videos, certificate previews, and locally hosted fonts.

Use `?lang=en` or `?lang=zh` to open a specific language. Fonts include their OFL licenses in `assets/fonts/`.

The sculpture uses a pinned, locally hosted Three.js module in `assets/vendor/three-0.180.0/`, including its MIT license. Reduced-motion preferences and the homepage pause control disable continuous motion. Research videos play muted when visible and pause when leaving their chapter; narrow screens show media inline.

## Publication links

Published work links to DOI landing pages. Paper PDFs are not included in this repository or website. ATLAS-SR remains a text-only Coming soon entry, without author names, figures, or technical summaries.

## Local preview

Run `python -m http.server 4173` in this directory and open `http://localhost:4173/`.
