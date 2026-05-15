# Animesh Mishra Portfolio

Static personal portfolio for Animesh Mishra, focused on pharmaceutical management, PMT, brand strategy, market access, medical coding, and molecule-to-market work.

## What Is Live

- Single-page portfolio in `index.html`
- Inline CSS and JavaScript inside `index.html`
- CV preview and download from `Animesh_CV.pdf`
- Project case-study PDFs in `case-studies/`
- Certificate previews in `certificates/`
- Contact form with a mailto fallback
- SEO basics: canonical URL, Open Graph tags, JSON-LD, `robots.txt`, and `sitemap.xml`

## Editing

| Item | Where to edit |
| --- | --- |
| Name / headline | Search `Animesh Mishra` in `index.html` |
| Profile photo | Replace `PIC.jpg` or update `src="PIC.jpg"` |
| Logo | Replace `logo.png` |
| CV | Replace `Animesh_CV.pdf` |
| Primary email | Search `animesh.pm17@iihmr.in` |
| Phone / WhatsApp | Search `8989468728` |
| Projects | Search `Featured Projects` and the matching `m-p` modal |
| Insights | Search `Featured Insights` and the matching `m-ins` modal |
| Certificates | Search `Certifications` and the matching `m-cert` modal |
| Last updated text | Search `footerUpdated` |

## Contact Form

The form currently opens a prefilled email to `animesh.pm17@iihmr.in`. To use Formspree later:

1. Create a form in the Formspree dashboard.
2. Copy the endpoint that looks like `https://formspree.io/f/your-form-id`.
3. Put that URL in `data-formspree-action` on the `#cForm` form.

The JavaScript only posts to valid `/f/...` Formspree endpoints; otherwise it keeps the email fallback.

## Notes

`style.css` and `dark.css` are reference mirror files only. The active styling is the inline `<style>` block in `index.html`.

## Deploy

Publish the repository with GitHub Pages from the main branch. The expected URL is:

`https://animesh1324.github.io/animesh-portfolio/`
