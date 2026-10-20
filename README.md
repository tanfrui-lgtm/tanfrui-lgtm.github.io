# Rui Tang · Academic Homepage

English-first research portfolio with Chinese language switching, organized around intelligent modeling and decision-making for the physical world.

The homepage presents selected work, experiments, and conference moments. Complete papers and honors live in `publications.html` and `honors.html`; the homepage has no résumé download entry.

## GitHub Pages

Publish the `main` branch from `/ (root)` using **Settings → Pages → Deploy from a branch**. The `.nojekyll` file keeps the site fully static; no build dependencies are required.

## Update

- `content.js`: bilingual education, research, publications, and awards.
- `portfolio-content.js`: homepage narratives, selected-work prompts, and paper summaries.
- `app.js`: page structure, translations, navigation, and image viewer.
- `experience.css` and `experience.js`: editorial layouts, scroll-linked research media, motion controls, and responsive behavior.
- `kinetic-scene.js`: interactive trajectory navigation with five real destinations; keyboard, hover, and drag controls remain functional without WebGL.
- `refinement.css`: personal introduction, navigation map, and paired text/media transitions.
- `pointer-effects.js` and `pointer-effects.css`: lightweight water and bubble pointer feedback.
- Other CSS files: base styles, local fonts, galleries, and publication layouts.
- `assets/`: portrait, CV, project images, videos, certificate previews, and locally hosted fonts.

Use `?lang=en` or `?lang=zh` to open a specific language. Fonts include their OFL licenses in `assets/fonts/`.

The trajectory map uses a pinned, locally hosted Three.js module in `assets/vendor/three-0.180.0/`, including its MIT license. Reduced-motion preferences and the homepage pause control disable continuous motion. Research text and media share the same active chapter. Videos play muted when visible and pause when leaving their chapter; narrow screens show all media inline. Pointer effects are disabled for touch and reduced-motion users.

The vessel world-model demo was supplied and authorized for display by Rui Tang. Its poster is a direct frame from the video. This is ongoing research; the website does not claim publication or acceptance. Scientific discovery, world models, embodied action, and cooperative control are presented as parallel research directions.

## Publication links

Published work links to DOI landing pages. Paper PDFs are not included in this repository or website. ATLAS-SR remains a text-only Coming soon entry, without author names, figures, or technical summaries.

## Local preview

Run `python -m http.server 4173` in this directory and open `http://localhost:4173/`.
