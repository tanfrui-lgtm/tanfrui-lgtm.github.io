# Rui Tang · Academic Homepage

English-first academic homepage with Chinese language switching.

## GitHub Pages

Publish the `main` branch from `/ (root)` using **Settings → Pages → Deploy from a branch**. The `.nojekyll` file keeps the site fully static; no build dependencies are required.

## Update

- `content.js`: bilingual education, research, publications, and awards.
- `app.js`: page structure, translations, navigation, motion, and certificate viewer.
- CSS files: typography, layout, atmospheric backgrounds, and responsive behavior.
- `assets/`: portrait, CV, project images, videos, certificate previews, and locally hosted fonts.

Use `?lang=en` or `?lang=zh` to open a specific language. Fonts include their OFL licenses in `assets/fonts/`.

## Publication links

Conditionally accepted work lists only its bibliographic information and status. Published work links to DOI landing pages. Paper PDFs are not included in this repository or website.

## Local preview

Run `python -m http.server 4173` in this directory and open `http://localhost:4173/`.
