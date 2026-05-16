"""
OG card generator — 1200×630  (polished)
Run: python3 gen_og.py
"""

from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os, math

BASE = os.path.dirname(os.path.abspath(__file__))
W, H = 1200, 630

NAVY     = (27,  47,  78)
NAVY_2   = (33,  55,  90)
GOLD     = (184, 150, 46)
GOLD_LT  = (212, 174, 69)
WHITE    = (255, 255, 255)
OFF_W    = (232, 237, 245)   # near-white for secondary text
TEXT_DIM = (155, 170, 195)   # descriptor / muted
AMBER    = (245, 158, 11)

LEFT_W   = 350
PANEL_MX = LEFT_W // 2       # 175
BAR_H    = 66
BAR_Y    = H - BAR_H         # 564

FONT_ROOT = "/System/Library/Fonts/Supplemental"
def F(name, size):
    return ImageFont.truetype(os.path.join(FONT_ROOT, name), size)


# ── 1. Background ─────────────────────────────────────────────────────────────
card = Image.new("RGBA", (W, H), (*NAVY, 255))

def glow(cx, cy, r, rgb, amax):
    b = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(b)
    for i in range(6):
        f  = i / 5
        rd = int(r * (1 - f * 0.7))
        a  = int(amax * (1 - f))
        d.ellipse([cx-rd, cy-rd, cx+rd, cy+rd], fill=(*rgb, a))
    return b.filter(ImageFilter.GaussianBlur(r // 3))

# warm gold burst top-right (matches reference)
card = Image.alpha_composite(card, glow(1110, -30, 340, (210, 165, 38), 34))
# soft cold-blue depth bottom-left
card = Image.alpha_composite(card, glow(-20, 650, 240, (20, 40, 70), 40))

# dot grid — pure RGBA layer so dots never bleed into text
dots = Image.new("RGBA", (W, H), (0, 0, 0, 0))
dd = ImageDraw.Draw(dots)
for x in range(0, W, 24):
    for y in range(0, H, 24):
        dd.ellipse([x-1, y-1, x+1, y+1], fill=(255, 255, 255, 10))
card = Image.alpha_composite(card, dots)


# ── 2. Left panel ─────────────────────────────────────────────────────────────
card.alpha_composite(Image.new("RGBA", (LEFT_W, H), (*NAVY_2, 255)), (0, 0))

# subtle inner gold glow top-left for depth
card = Image.alpha_composite(card, glow(-30, -30, 260, GOLD, 18))

# crisp gold vertical separator (full opacity, 3 px)
card.alpha_composite(Image.new("RGBA", (3, H), (*GOLD, 255)), (LEFT_W, 0))


# ── 2b. Background geometry (drawn after panels so it overlays both) ──────────
geo = Image.new("RGBA", (W, H), (0, 0, 0, 0))
gd  = ImageDraw.Draw(geo)

# concentric arc rings centred just off top-right corner → sweeping dome arcs
ARC_CX, ARC_CY = W + 80, -80
arc_alphas = [52, 44, 36, 28, 20, 13]
for alpha, r in zip(arc_alphas, [320, 490, 660, 830, 1000, 1170]):
    gd.ellipse([ARC_CX - r, ARC_CY - r, ARC_CX + r, ARC_CY + r],
               outline=(80, 118, 170, alpha), width=1)

# hexagon helper
def hex_pts(cx, cy, r, rot=30):
    return [(cx + r * math.cos(math.radians(60*i + rot)),
             cy + r * math.sin(math.radians(60*i + rot))) for i in range(6)]

# large ghost hex over left panel — echoes the logo shape
h1 = hex_pts(PANEL_MX, BAR_Y // 2, 235)
gd.line(h1 + [h1[0]], fill=(105, 148, 205, 48), width=1)

# medium accent hex bottom-right
h2 = hex_pts(W - 130, H - 80, 140)
gd.line(h2 + [h2[0]], fill=(90, 128, 185, 36), width=1)

# small accent hex top-right (near the glow)
h3 = hex_pts(W - 60, 70, 75)
gd.line(h3 + [h3[0]], fill=(130, 165, 210, 30), width=1)

# subtle diagonal line grid on right panel only
for offset in range(20, 550, 100):
    x0 = LEFT_W + 3 + offset
    gd.line([(x0, 0), (x0 + 260, H)], fill=(65, 95, 145, 18), width=1)

card = Image.alpha_composite(card, geo)


# ── 3. Full logo — large, centred in left panel ───────────────────────────────
LOGO_W = 286
try:
    logo_raw = Image.open(os.path.join(BASE, "logo-dark.png")).convert("RGBA")
    lw, lh   = logo_raw.size                   # 670 × 895
    logo_h   = int(lh / lw * LOGO_W)           # ≈ 382 px

    ly = (BAR_Y - logo_h) // 2                 # perfectly centred above bar
    lx = PANEL_MX - LOGO_W // 2

    logo_img = logo_raw.resize((LOGO_W, logo_h), Image.LANCZOS)
    card.alpha_composite(logo_img, (lx, ly))
except Exception as e:
    print(f"Logo error: {e}")


# ── 4. Right panel ────────────────────────────────────────────────────────────
RP_X   = LEFT_W + 3 + 40    # past separator + breathing room
R_PAD  = 32                  # right-edge padding

draw = ImageDraw.Draw(card)

# fonts
kf = F("Arial Bold.ttf",    14)
nf = F("Georgia Bold.ttf",  76)
tf = F("Georgia Italic.ttf", 28)
df = F("Arial.ttf",          22)
cf = F("Arial.ttf",          19)
sf = F("Arial Bold.ttf",     17)

# row heights (measured / approximated)
KH = 30   # kicker badge
NH = 80   # name  (76pt Georgia Bold)
TH = 32   # tagline
DH = 62   # descriptor 2-liner  (22pt × 2 + gap)
CH = 26   # contact line

# inter-element gaps
G_KN = 34   # kicker  → name
G_NT = 11   # name    → tagline
G_TD = 26   # tagline → descriptor
G_DC = 24   # descriptor → contact

content_h = KH + G_KN + NH + G_NT + TH + G_TD + DH + G_DC + CH
rp_top    = (BAR_Y - content_h) // 2    # vertically centres block

KY = rp_top
NY = KY + KH  + G_KN
TY = NY + NH  + G_NT
DY = TY + TH  + G_TD
CY = DY + DH  + G_DC


# — kicker badge  ─────────────────────────────────────────────────────────────
kicker = "MBA PHARMACEUTICAL MANAGEMENT  ·  IIHMR"
ktw    = draw.textlength(kicker, font=kf)
kph, kpv = 13, 8
draw.rounded_rectangle(
    [RP_X, KY, RP_X + ktw + kph*2, KY + KH],
    radius=5, outline=(*GOLD, 230), width=2      # 2 px border — crisper
)
draw.text((RP_X + kph, KY + kpv - 1), kicker, font=kf, fill=GOLD_LT)


# — name  ─────────────────────────────────────────────────────────────────────
draw.text((RP_X, NY), "Animesh Mishra", font=nf, fill=WHITE)


# — tagline  ──────────────────────────────────────────────────────────────────
draw.text((RP_X, TY), "Molecule to Market", font=tf, fill=GOLD_LT)


# — descriptor  ───────────────────────────────────────────────────────────────
draw.text((RP_X, DY),      "B.Pharm (Hons.) + MBA  ·  PMT / Brand Strategy /",    font=df, fill=TEXT_DIM)
draw.text((RP_X, DY + 32), "Medical Coding  ·  Lab-trained  ·  AI-first thinker", font=df, fill=TEXT_DIM)


# — contact line  (phone gold-dot email, each segment coloured) ───────────────
rule_y = CY - 12
draw.rectangle([RP_X, rule_y, W - R_PAD, rule_y + 1], fill=(*GOLD, 100))

phone = "+91 8989468728"
sep   = "   ·   "
email = "animesh.pm17@iihmr.in"

pw = draw.textlength(phone, font=cf)
sw = draw.textlength(sep,   font=cf)

draw.text((RP_X,            CY), phone, font=cf, fill=OFF_W)
draw.text((RP_X + pw,       CY), sep,   font=cf, fill=GOLD_LT)
draw.text((RP_X + pw + sw,  CY), email, font=cf, fill=OFF_W)


# ── 5. Status bar  ────────────────────────────────────────────────────────────
# full-width gold rule
draw.rectangle([0, BAR_Y, W, BAR_Y + 1], fill=(*GOLD, 140))

# amber dot — slightly larger
DOT_X  = RP_X
DOT_CY = BAR_Y + BAR_H // 2
R      = 8
draw.ellipse([DOT_X-R, DOT_CY-R, DOT_X+R, DOT_CY+R], fill=AMBER)

draw.text(
    (DOT_X + 22, BAR_Y + (BAR_H - 20) // 2),
    "PMT Intern · Micro Labs Ltd.  ·  Open to post-graduation roles  ·  Jaipur, IN",
    font=sf, fill=OFF_W
)


# ── 6. Save  ──────────────────────────────────────────────────────────────────
card.convert("RGB").save(os.path.join(BASE, "og-card.png"), "PNG", optimize=True)
print(f"Saved → og-card.png  ({W}×{H})")
