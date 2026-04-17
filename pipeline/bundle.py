#!/usr/bin/env python3
"""
bundle.py — Embeds all deck JSON into kanji-app.html as a self-contained file.

Reads:
  - pipeline/out/jlpt-n5.json, jlpt-n4.json, genki1.json, genki2.json
  - agent-files/integrated_ch*.json   (185 An Integrated Approach cards)
  - kanji-app.html  (source HTML)

Replaces the DECKS declaration in the HTML with all real data.
Writes: kanji-app.html  (in-place, with a backup)
"""
import json, os, re, shutil

HERE   = os.path.dirname(os.path.abspath(__file__))
REPO   = os.path.dirname(HERE)
PIPE   = os.path.join(HERE, "out")
AGENTS = os.path.join(REPO, "agent-files")
HTML   = os.path.join(REPO, "kanji-app.html")

# ── 1. Load generated decks ───────────────────────────────────────────────────
def load(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)

n5   = load(os.path.join(PIPE, "jlpt-n5.json"))
n4   = load(os.path.join(PIPE, "jlpt-n4.json"))
n2   = load(os.path.join(PIPE, "jlpt-n2.json"))
n1   = load(os.path.join(PIPE, "jlpt-n1.json"))
g1   = load(os.path.join(PIPE, "genki1.json"))
g2   = load(os.path.join(PIPE, "genki2.json"))

# ── 2. Load An Integrated Approach chapters ────────────────────────────────────
integrated_files = sorted([
    f for f in os.listdir(AGENTS) if f.startswith("integrated_ch") and f.endswith(".json")
])
integrated_decks = [load(os.path.join(AGENTS, f)) for f in integrated_files]
print(f"Loaded {len(integrated_decks)} Integrated Approach chapters:")
for d in integrated_decks:
    print(f"  {d['deck_name']}: {d['card_count']} cards")

# ── 2b. Load vocabulary decks (agent-files/vocab_*.json) ──────────────────────
# Vocab cards use a different schema (word/reading/context instead of kanji/on/kun).
# Normalize each card so the runtime can treat them uniformly:
#   kanji     ← word        (progress key + front-of-card display)
#   meanings  ← meanings
#   reading   ← reading     (new field — triggers the vocab card back)
#   context   ← context     (story/usage note)
#   category  ← category    (optional thematic tag)
#   jlpt      ← jlpt
#   on_yomi, kun_yomi, examples, keyword, etymology all set to empty/fallback
def normalize_vocab_card(c):
    return {
        "kanji": c["word"],
        "meanings": c.get("meanings", []),
        "reading": c.get("reading", ""),
        "category": c.get("category", ""),
        "context": c.get("context", ""),
        "jlpt": c.get("jlpt", ""),
        "example_sentence": c.get("example_sentence", ""),
        "example_reading": c.get("example_reading", ""),
        "example_meaning": c.get("example_meaning", ""),
        "on_yomi": [],
        "kun_yomi": [],
        "examples": [],
        "keyword": (c.get("meanings") or [""])[0],
        "etymology": c.get("context", ""),
    }

vocab_files = sorted([f for f in os.listdir(AGENTS) if f.startswith("vocab_") and f.endswith(".json")])
vocab_decks = []
for f in vocab_files:
    raw = load(os.path.join(AGENTS, f))
    raw["cards"] = [normalize_vocab_card(c) for c in raw["cards"]]
    vocab_decks.append(raw)
print(f"\nLoaded {len(vocab_decks)} vocabulary deck(s):")
for d in vocab_decks:
    print(f"  {d['deck_name']}: {d['card_count']} cards")

# ── 3. Build the JS DECKS array ───────────────────────────────────────────────
def cards_js(deck):
    """Return compact JS representation of cards array."""
    lines = []
    for c in deck["cards"]:
        lines.append(json.dumps(c, ensure_ascii=False, separators=(',',':')))
    return "[\n" + ",\n".join(lines) + "\n]"

def deck_entry(js_id, deck_obj, available=True, kind="kanji", unit="kanji"):
    name = deck_obj["deck_name"]
    count = deck_obj["card_count"]
    cards = cards_js(deck_obj)
    avail = "true" if available else "false"
    subtitle = f"{count} {unit}"
    return f'  {{ id: "{js_id}", name: "{name}", subtitle: "{subtitle}", kind: "{kind}", cards: {cards}, available: {avail} }}'

# Build Integrated entries grouped (one per chapter)
integrated_entries = []
for d in integrated_decks:
    safe_id = d["deck_id"]
    integrated_entries.append(deck_entry(safe_id, d))

decks_js = "const DECKS = [\n"
decks_js += deck_entry("genki2", g2) + ",\n"
decks_js += deck_entry("genki1", g1) + ",\n"
for ie in integrated_entries:
    decks_js += ie + ",\n"
decks_js += deck_entry("n5", n5) + ",\n"
decks_js += deck_entry("n4", n4) + ",\n"
# Stubs for future kanji decks
decks_js += '  { id: "quartet1", name: "Quartet 1", subtitle: "coming soon", kind: "kanji", cards: [], available: false },\n'
decks_js += '  { id: "quartet2", name: "Quartet 2", subtitle: "coming soon", kind: "kanji", cards: [], available: false },\n'
decks_js += '  { id: "n3", name: "JLPT N3", subtitle: "coming soon", kind: "kanji", cards: [], available: false },\n'
decks_js += deck_entry("n2", n2) + ",\n"
decks_js += deck_entry("n1", n1) + ",\n"
# Vocabulary decks
for vd in vocab_decks:
    decks_js += deck_entry(vd["deck_id"], vd, kind="vocab", unit="words") + ",\n"
decks_js += "];"

# ── 4. Patch the HTML ─────────────────────────────────────────────────────────
with open(HTML, encoding="utf-8") as f:
    html = f.read()

# Back up original
backup = HTML + ".bak"
shutil.copy2(HTML, backup)
print(f"\nBacked up original to {backup}")

# Find the region to replace:
# Everything from the GENKI2_CARDS data section down to the end of the DECKS array
# Marker: // DATA — Genki 2 deck ... down to the line that ends with ];  (the DECKS close)

# Strategy: replace from the first DATA comment to the closing ]; of DECKS
data_start = html.index("// DATA —")
# Find the const DECKS ... ]; block end
decks_start = html.index("const DECKS = [")
# Find the closing ]; after const DECKS
decks_end = html.index("];", decks_start) + len("];")

old_section = html[data_start:decks_end]

# Build replacement: just the new DECKS constant (no GENKI2_CARDS stub)
new_section = (
    "// DATA — All decks generated by the data pipeline.\n"
    "// DO NOT edit by hand — regenerate with pipeline/bundle.py\n"
    "// ============================================================\n"
    + decks_js
)

new_html = html[:data_start] + new_section + html[decks_end:]

with open(HTML, "w", encoding="utf-8") as f:
    f.write(new_html)

print(f"\n✓ Wrote updated HTML: {HTML}")
print(f"  Size: {len(new_html):,} bytes")

# ── 5. Verify the patch ───────────────────────────────────────────────────────
# Count how many kanji cards are now in the HTML
total = n5['card_count'] + n4['card_count'] + n2['card_count'] + n1['card_count'] + g1['card_count'] + g2['card_count']
total += sum(d['card_count'] for d in integrated_decks)
total += sum(d['card_count'] for d in vocab_decks)
print(f"\n  JLPT N5:   {n5['card_count']} cards")
print(f"  JLPT N4:   {n4['card_count']} cards")
print(f"  JLPT N2:   {n2['card_count']} cards")
print(f"  JLPT N1:   {n1['card_count']} cards")
print(f"  Genki 1:   {g1['card_count']} cards")
print(f"  Genki 2:   {g2['card_count']} cards")
for d in integrated_decks:
    print(f"  {d['deck_name']}: {d['card_count']} cards")
for d in vocab_decks:
    print(f"  {d['deck_name']}: {d['card_count']} cards")
print(f"  ─────────────────────────────────────")
print(f"  Total embedded: {total} card instances\n")
