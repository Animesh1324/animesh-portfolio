# Animesh Mishra — Portfolio

Static portfolio for an early-career pharmaceutical product and commercial-strategy candidate. It is served by GitHub Pages at <https://animesh1324.github.io/animesh-portfolio/>.

There is no framework and no build step for the site itself. Push to `main` and GitHub Pages publishes it.

## Structure

| Path | What it is |
| --- | --- |
| `index.html` | All page content. Every fact a recruiter reads is in the HTML, so it works without JavaScript. |
| `assets/css/styles.css` | Design tokens (light and dark), layout, components, motion and print styles |
| `assets/js/main.js` | Progressive enhancement: theme, mobile menu, section reveals, dialogs, CV switcher, credential filter, contact form |
| `assets/fonts/` | Self-hosted Newsreader and Inter (variable, latin subset; SIL OFL — licences included) |
| `assets/img/` | Optimised portrait, logo marks, case covers, CV preview images |
| `data/resume.json` | **Canonical fact source for both CVs.** Edit facts here, never in the PDFs. |
| `tools/cv/` | CV generator: templates, fonts, the IIHMR header logo and CV photograph |
| `tools/og/` | Open Graph card source (`og-card.html`) and renderer |
| `Animesh_CV.pdf` | ATS résumé (generated; the filename is linked from the site) |
| `Animesh_CV_IIHMR.pdf` | IIHMR placement CV (generated; the filename is linked from the site) |
| `case-studies/`, `certificates/` | Source documents. URLs are unchanged. |
| `gen_og.py` | Legacy OG-card script (macOS fonts). Superseded by `tools/og/build_og.py`. |

## Updating the CVs

1. Edit `data/resume.json`. Any entry with `"show": false` (or `show_ats` / `show_iihmr` set to false) is kept for reference but not printed.
2. Run:

   ```bash
   pip install jinja2 playwright pypdf pillow   # once
   python3 -m playwright install chromium       # once, if Chromium is not already available
   python3 tools/cv/build_cv.py
   ```

   The script writes both PDFs and the preview images used on the site. It then checks that each PDF is one page, has a selectable text layer and embedded non-Type-3 fonts, and contains no banned phrases (for example "peer-reviewed" or "QC Analyst"). It also lists every link in the PDF.
3. If a fact also appears on the website (dates, titles, numbers), update `index.html` to match.

`poppler-utils` (`pdftotext`, `pdftoppm`, `pdffonts`, `pdfinfo`) is required for the checks.

## Other maintenance

- **Last updated:** change the `<time>` in the footer, `dateModified` in the JSON-LD, and `lastmod` in `sitemap.xml`.
- **Social card:** edit `tools/og/og-card.html`, run `python3 tools/og/build_og.py`, then bump `?v=` on the `og:image` URLs in `index.html`.
- **Contact form:** posts to the Formspree endpoint in `data-formspree-action` on `#cForm`. If that fails, it falls back to a pre-filled email.
- **Theme:** the saved choice (`localStorage.theme`) wins; otherwise the page follows the system setting.

## Local preview

```bash
python3 -m http.server 8000
# open http://localhost:8000/
```

`404.html` uses absolute `/animesh-portfolio/...` paths, so it only looks right when deployed.

## Deploy

Settings → Pages → Deploy from branch → `main` / root. GitHub Pages runs its default Jekyll step. `tools/` is published too, which is harmless.
