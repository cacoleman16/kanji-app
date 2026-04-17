#!/usr/bin/env python3
"""
Production build: compiles JSX, inlines React, writes index.html + sw.js + splash screens.

Run from any directory:
    python3 pipeline/build.py

What it does:
  1. Runs bundle.py to update DECKS in kanji-app.html (skippable with --no-bundle)
  2. Extracts the <script type="text/babel"> block from kanji-app.html
  3. Compiles it with @babel/preset-react (no transpilation, just JSX → createElement)
  4. Inlines React 18 + ReactDOM 18 UMD builds from lib/
  5. Writes index.html (self-contained, no CDN, no Babel)
  6. Writes sw.js with a version key so deploys bust the cache
  7. Generates PNG app icons (180, 192, 512) into icons/
  8. Generates iOS splash screen PNGs for all major iPhone sizes into splash/
  9. Updates manifest.json (start_url, PNG icons)

After running:
    vercel --prod     (Stage 1 deploy)
"""

import os, re, sys, json, hashlib, subprocess, tempfile, urllib.request

HERE   = os.path.dirname(os.path.abspath(__file__))
ROOT   = os.path.dirname(HERE)
SRC    = os.path.join(ROOT, "kanji-app.html")
OUT    = os.path.join(ROOT, "index.html")
LIB    = os.path.join(ROOT, "lib")
ICONS  = os.path.join(ROOT, "icons")
SPLASH = os.path.join(ROOT, "splash")

# (px_w, px_h, css_w, css_h, scale, label)
SPLASH_SPECS = [
    (750,  1334, 375, 667,  2, "iPhone SE / 8"),
    (1242, 2208, 414, 736,  3, "iPhone 8 Plus"),
    (1125, 2436, 375, 812,  3, "iPhone X / XS / 11 Pro"),
    (1242, 2688, 414, 896,  3, "iPhone XS Max / 11 Pro Max"),
    (828,  1792, 414, 896,  2, "iPhone XR / 11"),
    (1170, 2532, 390, 844,  3, "iPhone 12 / 13 / 14"),
    (1284, 2778, 428, 926,  3, "iPhone 12/13/14 Plus/Max"),
    (1179, 2556, 393, 852,  3, "iPhone 14 Pro / 15 / 15 Pro"),
    (1290, 2796, 430, 932,  3, "iPhone 14/15 Pro Max / Plus"),
]

# ── 1. Run bundle.py ───────────────────────────────────────────────────────
if "--no-bundle" not in sys.argv:
    print("Running bundle.py …")
    subprocess.run([sys.executable, os.path.join(HERE, "bundle.py")], check=True)
    print()

# ── 2. Read source HTML ────────────────────────────────────────────────────
with open(SRC, encoding="utf-8") as f:
    html = f.read()

# ── 3. Extract JSX block ───────────────────────────────────────────────────
m = re.search(
    r'<script[^>]+type=["\']text/babel["\'][^>]*>(.*?)</script>',
    html, re.DOTALL
)
if not m:
    sys.exit('ERROR: could not find <script type="text/babel"> block')

jsx_src   = m.group(1)
jsx_start = m.start()
jsx_end   = m.end()

# ── 4. Compile JSX → plain JS ─────────────────────────────────────────────
babel_bin   = os.path.join(ROOT, "node_modules", ".bin", "babel")
babelrc_path = os.path.join(ROOT, ".babelrc.json")
with open(babelrc_path, "w") as f:
    json.dump({"presets": ["@babel/preset-react"]}, f)

with tempfile.NamedTemporaryFile(mode="w", suffix=".jsx", delete=False, encoding="utf-8") as tmp:
    tmp.write(jsx_src)
    tmp_path = tmp.name

print("Compiling JSX …")
result = subprocess.run(
    [babel_bin, tmp_path, "--config-file", babelrc_path],
    capture_output=True, text=True
)
os.unlink(tmp_path)
if result.returncode != 0:
    print(result.stderr)
    sys.exit("ERROR: babel compilation failed")

compiled_js = result.stdout
print(f"  {len(jsx_src):,} → {len(compiled_js):,} chars")

# ── 5. Load or download React UMD builds ──────────────────────────────────
react_path    = os.path.join(LIB, "react.production.min.js")
reactdom_path = os.path.join(LIB, "react-dom.production.min.js")

if not os.path.exists(react_path) or not os.path.exists(reactdom_path):
    print("Downloading React 18 UMD builds …")
    os.makedirs(LIB, exist_ok=True)
    urllib.request.urlretrieve("https://unpkg.com/react@18/umd/react.production.min.js",    react_path)
    urllib.request.urlretrieve("https://unpkg.com/react-dom@18/umd/react-dom.production.min.js", reactdom_path)

with open(react_path,    encoding="utf-8") as f: react_js    = f.read()
with open(reactdom_path, encoding="utf-8") as f: reactdom_js = f.read()
print(f"  React {len(react_js):,} B  ReactDOM {len(reactdom_js):,} B")

# ── 6. Build index.html ────────────────────────────────────────────────────
cdn_re   = re.compile(
    r'<script[^>]*(unpkg\.com[^"]*react[^"]*|unpkg\.com[^"]*babel[^"]*)[^>]*></script>\s*',
    re.IGNORECASE
)
splash_links = "\n".join(
    f'<link rel="apple-touch-startup-image" '
    f'media="(device-width: {cw}px) and (device-height: {ch}px) '
    f'and (-webkit-device-pixel-ratio: {sc}) and (orientation: portrait)" '
    f'href="splash/splash-{pw}x{ph}.png">'
    for pw, ph, cw, ch, sc, _ in SPLASH_SPECS
)

head_inject = (
    splash_links + '\n'
    '</head>'
)

# Strip CDN tags, replace babel block with compiled output
prod_html = html[:jsx_start]
prod_html = cdn_re.sub("", prod_html)
prod_html += (
    f'\n<script>/* React 18 */\n{react_js}\n</script>\n'
    f'<script>/* ReactDOM 18 */\n{reactdom_js}\n</script>\n'
    f'<script>\n{compiled_js}\n</script>\n'
)
tail = html[jsx_end:]
tail = cdn_re.sub("", tail)
prod_html += tail

prod_html = prod_html.replace('</head>', head_inject, 1)

with open(OUT, "w", encoding="utf-8") as f:
    f.write(prod_html)
print(f"\n✓ index.html  ({len(prod_html.encode())//1024} KB)")

# ── 7. Write sw.js ────────────────────────────────────────────────────────
ver = hashlib.md5(prod_html.encode()).hexdigest()[:8]

splash_urls = "\n".join(
    f'  "./splash/splash-{pw}x{ph}.png",'
    for pw, ph, *_ in SPLASH_SPECS
)

sw_src = f'''\
/* sw.js — auto-generated by pipeline/build.py */
const CACHE = "kanji-v{ver}";
const PRECACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon-180.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
{splash_urls}
];
const FONT_CACHE = "kanji-fonts";

self.addEventListener("install", e => {{
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
}});

self.addEventListener("activate", e => {{
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE && k !== FONT_CACHE).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
}});

self.addEventListener("fetch", e => {{
  const url = new URL(e.request.url);

  // Font requests: cache-first, long-lived separate cache
  if (url.hostname.endsWith("googleapis.com") || url.hostname.endsWith("gstatic.com")) {{
    e.respondWith(
      caches.open(FONT_CACHE).then(c =>
        c.match(e.request).then(cached => {{
          if (cached) return cached;
          return fetch(e.request).then(res => {{ c.put(e.request, res.clone()); return res; }});
        }})
      )
    );
    return;
  }}

  // Everything else: cache-first (our own assets)
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
}});
'''

with open(os.path.join(ROOT, "sw.js"), "w", encoding="utf-8") as f:
    f.write(sw_src)
print(f"✓ sw.js       (cache key: kanji-v{ver})")

# ── 8. Generate PNG icons + iOS splash screens ────────────────────────────
def draw_kanji_image(width, height, char_scale=0.55):
    """Black background, 漢 centered. Returns PIL Image."""
    from PIL import Image, ImageDraw, ImageFont
    img  = Image.new("RGBA", (width, height), "#09090b")
    draw = ImageDraw.Draw(img)
    char = "漢"
    font_candidates = [
        "/System/Library/Fonts/Hiragino Sans GB.ttc",
        "/System/Library/Fonts/ヒラギノ角ゴシック W6.ttc",
        "/Library/Fonts/Arial Unicode MS.ttf",
    ]
    jp_font_path = next((p for p in font_candidates if os.path.exists(p)), None)
    font_size = int(min(width, height) * char_scale)
    try:
        font = ImageFont.truetype(jp_font_path, font_size) if jp_font_path else ImageFont.load_default()
    except Exception:
        font = ImageFont.load_default()
        char = "K"
    # Measure actual glyph bounds, then center with a slight optical upward nudge.
    # CJK characters have heavier stroke density low, so geometric center reads as low.
    probe_x, probe_y = width // 2, height // 2
    bbox = draw.textbbox((probe_x, probe_y), char, font=font)
    glyph_cx = (bbox[0] + bbox[2]) / 2
    glyph_cy = (bbox[1] + bbox[3]) / 2
    glyph_h  = bbox[3] - bbox[1]
    dx = width  // 2 - glyph_cx
    dy = height // 2 - glyph_cy - int(glyph_h * 0.06)  # 6% upward optical correction
    draw.text((probe_x + dx, probe_y + dy), char, font=font, fill="#fafafa")
    return img

try:
    from PIL import Image  # noqa — just to test import
    os.makedirs(ICONS,  exist_ok=True)
    os.makedirs(SPLASH, exist_ok=True)

    for size in [180, 192, 512]:
        path = os.path.join(ICONS, f"icon-{size}.png")
        draw_kanji_image(size, size).save(path, "PNG")
        print(f"✓ icons/icon-{size}.png")

    for pw, ph, cw, ch, sc, label in SPLASH_SPECS:
        path = os.path.join(SPLASH, f"splash-{pw}x{ph}.png")
        draw_kanji_image(pw, ph, char_scale=0.22).save(path, "PNG")
        print(f"✓ splash/splash-{pw}x{ph}.png  ({label})")

except ImportError:
    print("  (Pillow not available — skipping image generation)")

# ── 9. Update manifest.json ────────────────────────────────────────────────
manifest_path = os.path.join(ROOT, "manifest.json")
with open(manifest_path, encoding="utf-8") as f:
    mf = json.load(f)

mf["start_url"] = "./index.html"
mf["icons"] = [
    {"src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any"},
    {"src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any"},
    {"src": "icons/icon-180.png", "sizes": "180x180", "type": "image/png", "purpose": "any maskable"},
]

with open(manifest_path, "w", encoding="utf-8") as f:
    json.dump(mf, f, indent=2, ensure_ascii=False)
print("✓ manifest.json")

print(f"""
─────────────────────────────────────────────────────────
  Stage 1 + 2 complete. Deploy:

    vercel --prod

  Files shipped:
    index.html   self-contained ({len(prod_html.encode())//1024} KB, no CDN, no Babel)
    sw.js        cache-first service worker
    manifest.json
    icons/       icon-180/192/512.png
    splash/      {len(SPLASH_SPECS)} iOS device splash screens
─────────────────────────────────────────────────────────
""")
