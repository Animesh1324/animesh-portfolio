# Claude — Context for the Animesh Mishra Portfolio

This file is auto-loaded at the start of every Claude Code session for this
repo. Read it carefully before suggesting changes.

## Who I'm working with

- **Animesh Mishra** — B.Pharm (Honours) + MBA Pharmaceutical Management
  candidate at IIHMR University, Jaipur. Targeting Product Management
  Trainee (PMT), Brand Strategy, Pharma Consulting, and Medical Coding
  roles. Tagline: **"Molecule to Market."**
- Contact: `animesh.pm17@iihmr.in` · +91 8989468728 · WhatsApp same number
- Repo: `Animesh1324/animesh-portfolio` · published to GitHub Pages at
  `https://animesh1324.github.io/animesh-portfolio/`
- Current PMT internship: **Micro Labs Ltd., Jaipur** (CNS + cardiology
  therapy areas; brands of note: Rasagiline, Apixaban)

## How Animesh likes to work

1. **Apply, don't just propose.** When he asks for an audit and then says
   "apply this," do every item — don't skip silently. If something is out
   of reach (Formspree signup, real recommendation quotes, etc.), call it
   out explicitly as a follow-up rather than burying it.
2. **Be honest about gaps.** Never claim "everything is done" if it isn't.
   Always reconcile suggestion list ↔ actual diff before signing off.
3. **Commit in logical batches** with clear, "why-not-what" messages.
   Each batch ends with a single push.
4. **Opinionated > neutral.** He asks for creativity, judgment, and
   prioritisation (P0 / P1 / P2 / wow-factor). Give him a recommendation
   first, not a buffet of equal options.
5. **No clarifying questions for obvious paths.** Investigate the file
   first; only ask when there's genuine ambiguity that grep can't resolve.
6. **Short messages are intentional.** When he writes "Continue" or
   "Apply all" he wants you to act on context, not re-confirm scope.

## Branch & workflow conventions

- Development branch: whatever the session harness specifies in
  "Git Development Branch Requirements" (currently
  `claude/fix-ui-alignment-night-mode-GdJdw`). Never push to `main` unless
  explicitly told.
- `git push -u origin <branch>` after each logical batch.
- Don't open a PR unless he asks for one.
- Commit messages: present-tense ("Polish tools strip"), one-line summary,
  blank line, then a bullet list of *why*. End with the session URL trailer
  the harness expects.

## Design system (UI kit)

The portfolio uses a strict design system. Never introduce a new color or
font without checking these first.

### Colors (light mode)
```
--c-navy:   #1B2F4E   /* primary brand */
--c-navy-2: #243d63
--c-navy-3: #2d5080
--c-gold:   #B8962E   /* accent */
--c-gold-2: #d4ae45
--c-white:  #fff
--c-off:    #F7F8FA
--c-light:  #EDF0F5
--c-border: #E4E8EF
--c-text:   #1a2332
--c-mid:    #4a5568
--c-muted:  #8898aa
```

Dark mode redefines `--c-white / --c-off / --c-light / --c-border /
--c-text / --c-mid / --c-muted` on `[data-theme="dark"]`. Component
backgrounds typically map to `var(--c-off)` in dark mode (slightly lighter
than the page bg `var(--c-white)` for visual hierarchy). **Don't blindly
swap `#fff` to `var(--c-white)` — the existing pattern is intentional.**

### Typography
- Display: `DM Serif Display` (preferred), `Playfair Display` fallback
- Body: `Inter` (300/400/500/600/700)
- Emoji icons (🧬, 📈, 🤖, 🎯, etc.) use a deterministic emoji-font stack
  defined on `.sk-ico, .proj-ico, .cert-ico, .m-icon, .proc-ico, .ti, .star`

### Core components
- **Section header**: `.s-kicker` (pill) + `.s-title` (Playfair with `<em>`
  for gold word) + `.s-rule` (44px gradient bar)
- **Cards**: `.sk-card`, `.tl-card`, `.edu-card`, `.proj-card`, `.cert-card`,
  `.proc-step`, `.rec-card` — all share white bg, `var(--c-border)`,
  `var(--s1)` shadow, `var(--r)` radius (20px)
- **Pills/chips**: `.sk-tag`, `.pill`, `.pchip`, `.tool-pill` — all use
  `var(--c-light)` bg, no border, 100px radius
- **Outcome chips**: `.pchip.outcome` — gold-tinted, for quantified results
- **Modals**: `.m-overlay` + `.m-box`, opened via `data-modal="ID"`,
  closed via `data-close-modal="ID"` or backdrop click (delegated handler)

### Shadows / radii / spacing
- Radii: `--r: 20px`, `--r-sm: 12px`, `--r-lg: 32px`
- Shadows: `--s1` (subtle), `--s2` (hover lift), `--s3` (card hover),
  `--s4` (modal)
- Section padding: `100px 5%` everywhere — don't add per-section vertical
  overrides without a strong reason

## Tech stack

- **Single-page, single-file HTML.** `index.html` is ~6000 lines with the
  entire CSS in an inline `<style>` block and the entire JS in an inline
  `<script>` block at the bottom. There is no build step.
- `style.css` and `dark.css` were stubs that drifted from the inline
  truth — they've been deleted. **Don't recreate them.** Keep all styles
  inline.
- No frameworks. No React, no Vue, no bundler. Vanilla JS, FontAwesome
  for icons (CDN), Google Fonts for typography.
- PWA-ready via `manifest.json` (added). Logos: `logo-light.png`
  (black mark, transparent) for light mode, `logo-dark.png` (white mark,
  transparent) for dark — CSS hides the wrong variant.
- OG share card: `og-card.png` (1200×630, branded). Referenced in
  `og:image` and `twitter:image`.

## File map

```
index.html                        # the entire site
404.html                          # custom 404 (theme-aware logo)
manifest.json                     # PWA manifest
robots.txt                        # crawler allow + sitemap link
sitemap.xml                       # root + CV + 6 case-study PDFs
favicon.png, logo-light.png, logo-dark.png, og-card.png
PIC.jpg + PIC.webp                # hero photo, WebP via <picture>
Animesh_CV.pdf                    # one-page CV
case-studies/*.pdf                # 6 case studies
case-studies/thumbs/p[1-6]-*.png  # 600x400 thumbnails (cards + modals)
certificates/*.{pdf,jpg,png}      # 7 certs (most are PDFs)
```

## Content / voice rules

- Pharmaceutical / clinical context everywhere. Default vocabulary:
  PMT, HEOR, KOL, lifecycle management, IQVIA, NPV/WACC, RCPA, ICD-10-CM.
- **Outcomes > activities.** Every project / experience bullet should
  surface a quantified outcome (e.g. "$11.75B deal", "200+ codes",
  "13 languages", "DOI · First-author"). The `.pchip.outcome` gold chip
  carries the most impactful number per project card.
- Dates on `.tl-chip`: abbreviated months with em-dash separator —
  *"Jan — Mar 2024"*, *"May 2026 — Present"*, *"Jul 1 — 15, 2023"*.
- Tone: confident but precise. Avoid hype. Avoid emoji-flavoured business
  English ("excited to", "thrilled to"). British/Indian English spellings
  ("organisation", "analyse", "behaviour", "modelling").
- The glossary system (33 pharma terms) auto-links chips that match a
  keyword. New chips that mention an existing key get the dotted-underline
  hint and click-to-define behaviour for free.

## Recurring follow-ups (require Animesh's action — flag in summaries)

1. **Formspree endpoint** — `data-formspree-action=""` on `#cForm` needs
   his account ID. Until then the form falls back to a mailto.
2. **Recommendation quotes** — `#recommendations` has two `[Mentor /
   Faculty Name]` placeholders.
3. **NIPER scorecard** — once uploaded, drop the "self-reported" caveat
   in cert modal `#m-cert8`.
4. **"Now" widget** in the footer — refresh the three status lines
   ("Live PMT…", "Reading…", "Studying…") periodically.

## Things to avoid

- Don't re-add `style.css` / `dark.css` stubs.
- Don't introduce a build step (Tailwind, Vite, etc.). Inline CSS is the
  contract here.
- Don't add console.log left in shipped JS.
- Don't add tracking, analytics, or third-party scripts without asking.
- Don't replace emoji icons with FontAwesome wholesale — they carry
  semantic meaning. The emoji-font stack solves the consistency issue.
- Don't change navy/gold tokens; he's stable on this palette.
- Don't push to `main` from a feature session.
