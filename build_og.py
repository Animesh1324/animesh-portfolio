#!/usr/bin/env python3
"""Render og-card.png (1200×630) from tools/og/og-card.html.  Run: python3 tools/og/build_og.py"""
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT = Path(__file__).resolve().parents[2]
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={"width": 1200, "height": 630})
    pg.goto((ROOT / "tools/og/og-card.html").as_uri(), wait_until="networkidle"); pg.evaluate("document.fonts.ready")
    pg.screenshot(path=str(ROOT / "og-card.png")); b.close()
print("wrote og-card.png")
