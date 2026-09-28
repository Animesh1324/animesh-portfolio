#!/usr/bin/env python3
"""
Build both CVs from the single canonical fact file, data/resume.json.

    python3 tools/cv/build_cv.py            # build + verify
    python3 tools/cv/build_cv.py --check    # verify the existing PDFs only

Outputs (filenames are fixed because the website links to them):
    Animesh_CV.pdf          ATS résumé (single column, no photo, selectable text)
    Animesh_CV_IIHMR.pdf    IIHMR University placement template (photo + official header)
    assets/img/cv-ats-preview.webp, assets/img/cv-iihmr-preview.webp   (page-1 previews for the site)

Requirements: python3, jinja2, playwright (Chromium), poppler-utils (pdftotext, pdftoppm, pdffonts), Pillow.
"""
import json, subprocess, sys, re, tempfile, shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
DATA = json.loads((ROOT / "data" / "resume.json").read_text(encoding="utf-8"))

TARGETS = {
    "ats":   {"template": "ats.html.j2",   "pdf": ROOT / "Animesh_CV.pdf",       "preview": ROOT / "assets/img/cv-ats-preview.webp",
              "title": "Animesh Mishra — ATS Résumé", "subject": "Pharmaceutical product management and commercial strategy résumé"},
    "iihmr": {"template": "iihmr.html.j2", "pdf": ROOT / "Animesh_CV_IIHMR.pdf", "preview": ROOT / "assets/img/cv-iihmr-preview.webp",
              "title": "Animesh Mishra — IIHMR Placement CV", "subject": "IIHMR University School of Pharmaceutical Management placement CV"},
}

# Phrases that must never appear in a generated CV (see the verification notes).
FORBIDDEN = [r"peer[- ]reviewed", r"IIT Hyderabad", r"QC Analyst", r"Professional Certificate(?! —)", r"GLUMIC®", r"Coding Analyst"]


def render(kind):
    from jinja2 import Environment, FileSystemLoader, StrictUndefined
    env = Environment(loader=FileSystemLoader(HERE / "templates"), undefined=StrictUndefined, autoescape=True)
    d = DATA
    ach = [a["text"] for a in d["achievements"] if a["show"]]
    ctx = dict(
        p=d["person"], headline=d["headline"],
        summary=d["summary"][kind], experience=d["experience"], projects=d["projects"],
        education=d["education"], competencies=d["competencies"], tools=d["tools"],
        sk=d["skills_iihmr"], achievements=d["achievements"], certifications=d["certifications"],
        achievements_ats=" · ".join(ach[:2]) ,
        fonts=(HERE / "fonts").as_uri(), assets=(HERE / "assets").as_uri(),
    )
    return env.get_template(TARGETS[kind]["template"]).render(**ctx)


def to_pdf(html, out_pdf, title, subject):
    from playwright.sync_api import sync_playwright
    with tempfile.TemporaryDirectory() as td:
        src = Path(td) / "cv.html"
        src.write_text(html, encoding="utf-8")
        with sync_playwright() as pw:
            b = pw.chromium.launch()
            pg = b.new_page()
            pg.goto(src.as_uri(), wait_until="networkidle")
            pg.evaluate("document.fonts.ready")
            pg.pdf(path=str(out_pdf), format="A4", print_background=True, prefer_css_page_size=True)
            b.close()
    # Set document metadata (title/author/subject) without re-rendering.
    from pypdf import PdfReader, PdfWriter
    r = PdfReader(str(out_pdf)); w = PdfWriter()
    for page in r.pages: w.add_page(page)
    w.add_metadata({"/Title": title, "/Author": DATA["person"]["name"], "/Subject": subject,
                    "/Keywords": "pharmaceutical product management, PMT, brand management, market access, IIHMR"})
    with open(out_pdf, "wb") as f: w.write(f)


def preview(pdf, out_webp):
    from PIL import Image
    with tempfile.TemporaryDirectory() as td:
        subprocess.run(["pdftoppm", "-r", "110", "-png", "-f", "1", "-l", "1", str(pdf), f"{td}/p"], check=True)
        png = sorted(Path(td).glob("p*.png"))[0]
        im = Image.open(png).convert("RGB")
        im.thumbnail((760, 1080))
        out_webp.parent.mkdir(parents=True, exist_ok=True)
        im.save(out_webp, "WEBP", quality=74, method=6)
        return im.size


def verify(kind):
    t = TARGETS[kind]; pdf = t["pdf"]; ok = True
    info = subprocess.run(["pdfinfo", str(pdf)], capture_output=True, text=True).stdout
    pages = int(re.search(r"Pages:\s+(\d+)", info).group(1))
    text = subprocess.run(["pdftotext", str(pdf), "-"], capture_output=True, text=True).stdout
    fonts = subprocess.run(["pdffonts", str(pdf)], capture_output=True, text=True).stdout
    size_kb = pdf.stat().st_size / 1024
    print(f"\n== {pdf.name}: {pages} page(s), {size_kb:.0f} KB")
    if pages != 1: print("  ! expected exactly one page"); ok = False
    if len(text.split()) < 250: print("  ! text layer looks too small — is the text selectable?"); ok = False
    for pat in FORBIDDEN:
        if re.search(pat, text, re.I): print(f"  ! forbidden phrase present: {pat}"); ok = False
    for must in [DATA["person"]["name"].upper() if kind == "iihmr" else DATA["person"]["name"], DATA["person"]["email_primary"], "Micro Labs", "IIHMR University"]:
        if must not in text: print(f"  ! missing expected text: {must}"); ok = False
    if "�" in text: print("  ! replacement glyphs found (missing characters)"); ok = False
    emb = [l for l in fonts.splitlines()[2:] if l.strip()]
    print(f"  fonts: {len(emb)} ({'all embedded' if all(' yes ' in l for l in emb) else 'check embedding'})")
    if any("Type 3" in l for l in emb): print("  ! Type 3 fonts found (use static fonts for ATS safety)"); ok = False
    from pypdf import PdfReader
    uris = sorted({a.get_object()["/A"]["/URI"] for pg in PdfReader(str(pdf)).pages for a in (pg.get("/Annots") or [])
                   if a.get_object().get("/A") and a.get_object()["/A"].get("/URI")})
    print("  links:", *uris, sep="\n    ")
    if size_kb > 600: print("  ! file larger than 600 KB"); ok = False
    print("  result:", "OK" if ok else "NEEDS ATTENTION")
    return ok


def main():
    check_only = "--check" in sys.argv
    ok = True
    for kind, t in TARGETS.items():
        if not check_only:
            to_pdf(render(kind), t["pdf"], t["title"], t["subject"])
            w, h = preview(t["pdf"], t["preview"])
            print(f"built {t['pdf'].name}; preview {t['preview'].name} {w}x{h}")
        ok &= verify(kind)
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
