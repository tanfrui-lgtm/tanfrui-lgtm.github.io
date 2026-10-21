# Rui Tang · Academic Homepage

This repository now redirects the former website to [tangrui-web.github.io](https://tangrui-web.github.io/), preserving page paths, language selections, and anchors. Keep GitHub Pages enabled here for existing links.

For website updates, use [tangrui-web/tangrui-web.github.io](https://github.com/tangrui-web/tangrui-web.github.io). The notes below describe the original portfolio; its full source and assets are maintained in the new repository.

English-first research portfolio with Chinese language switching, organized around intelligent modeling and decision-making for the physical world.

The homepage presents selected work, experiments, and conference moments. Complete papers and honors live in `publications.html` and `honors.html`; the homepage has no résumé download entry.

## GitHub Pages

Publish the `main` branch from `/ (root)` using **Settings → Pages → Deploy from a branch**. The `.nojekyll` file keeps the site fully static; no build dependencies are required.

## Update

- `content.js`: bilingual education, research, publications, and awards.
- `portfolio-content.js`: homepage narratives, selected-work prompts, and paper summaries.
- `app.js`: page structure, translations, navigation, and image viewer.
- `experience.css` and `experience.js`: editorial layouts, scroll-linked research media, motion controls, and responsive behavior.
- `kinetic-scene.js`: perspective 3D navigation with a spatial orbit, projected HTML links, free rotation, and damped inertia; HTML destinations remain usable without WebGL.
- `refinement.css`: personal introduction, navigation map, and paired text/media transitions.
- `pointer-effects.js` and `pointer-effects.css`: locally rendered WebGL liquid pointer surface, spring-linked trails, and click waves.
- `motion-polish.css`: masked, perspective typography, hover waves, and coordinated chapter transitions.
- Other CSS files: base styles, local fonts, galleries, and publication layouts.
- `assets/`: portrait, CV, project images, videos, certificate previews, and locally hosted fonts.

Use `?lang=en` or `?lang=zh` to open a specific language. Fonts include their OFL licenses in `assets/fonts/`.

The spatial navigation uses a pinned, locally hosted Three.js module in `assets/vendor/three-0.180.0/`, including its MIT license. Reduced-motion preferences and the homepage pause control disable continuous motion. Research text and media share the same active chapter. Videos play muted when visible and pause when leaving their chapter; narrow screens show all media inline. The pointer shader shades only the gesture area and stops drawing when idle; touch and reduced-motion users receive a static presentation.

The vessel world-model demo was supplied and authorized for display by Rui Tang. Its poster is a direct frame from the video. This is ongoing research; the website does not claim publication or acceptance. Scientific discovery, world models, embodied action, and cooperative control are presented as parallel research directions.

## Publication links

Published work links to DOI landing pages. Paper PDFs are not included in this repository or website. ATLAS-SR remains a text-only Coming soon entry, without author names, figures, or technical summaries.

## Local preview

Run `python -m http.server 4173` in this directory and open `http://localhost:4173/`.
