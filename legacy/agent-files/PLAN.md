# Kanji JSON Generation Plan
## An Integrated Approach to Intermediate Japanese (Revised Ed.)

---

## What this is

This PLAN documents how the per-chapter kanji JSON files were produced from a PDF scan of *An Integrated Approach to Intermediate Japanese (Revised Edition)*. It lives alongside the output JSON files so any future agent or human can reproduce, extend, or audit the work.

---

## PDF Page Offset Formula

The PDF was a fliphtml5.com snapshot (image-based). Each page stored a single embedded PNG — no selectable text. The PDF page numbers match the book's printed page numbers directly.

| Chapter | Book page (kanji list) | PDF page used |
|---------|------------------------|---------------|
| Ch. 1   | 22                     | 22            |
| Ch. 2   | 42                     | 42            |
| Ch. 3   | 62                     | 62            |
| Ch. 4   | 80                     | 80            |
| Ch. 5   | 102                    | 102           |
| Ch. 7   | 141                    | 141           |

The user provided the formula `book_page − chapter_start_page = pages_into_chapter` as a cross-check. The PDF page number is simply the book page number directly.

---

## Extraction Method

1. **PyMuPDF (fitz)** was used to render each target page at 4× scale (2448 × 3168 px PNG).
2. The rendered images were read visually by Claude (multimodal) to extract vocabulary items from the **書くのを覚える漢字** ("kanji to learn to write") section on each page.
3. For each numbered vocabulary item, the **primary new kanji** introduced by that word was identified.
4. Card data (readings, meanings, examples, etymology, stroke count, JLPT, grade) was filled from language knowledge — no external API was called.

---

## What Each Page Contains

Each kanji-list page has two sections:

- **書くのを覚える漢字** — kanji the student must learn to *write* (30–50 vocabulary entries per chapter). **These are the source of all JSON cards.**
- **読めればいい漢字** — kanji the student only needs to *recognize* (20–40 entries). Not included in this batch; can be added as a second pass.

---

## Card Schema

```json
{
  "kanji": "字",
  "meanings": ["meaning1", "meaning2"],
  "on_yomi": ["オン"],
  "kun_yomi": ["くん(よみ)"],
  "examples": [
    {"kanji": "例文", "kana": "れいぶん", "meaning": "example sentence"},
    {"kanji": "例文", "kana": "れいぶん", "meaning": "example sentence"},
    {"kanji": "例文", "kana": "れいぶん", "meaning": "example sentence"}
  ],
  "keyword": "single Heisig-style keyword",
  "etymology": "Short mnemonic: component (radical) + component — what it suggests.",
  "stroke_count": 6,
  "jlpt": "N3",
  "grade": 3,
  "decks": ["An Integrated Approach Ch.X", "JLPT NX"]
}
```

Fields match the existing `genki2-preview.json` schema exactly so these files are plug-and-play with the kanji app.

---

## Output Files

All files are in the outputs folder alongside this PLAN.

| File | Cards | Chapter page |
|------|-------|-------------|
| `integrated_ch1_kanji.json` | 41 | p.22 |
| `integrated_ch2_kanji.json` | 33 | p.42 |
| `integrated_ch3_kanji.json` | 23 | p.62 |
| `integrated_ch4_kanji.json` | 36 | p.80 |
| `integrated_ch5_kanji.json` | 24 | p.102 |
| `integrated_ch7_kanji.json` | 28 | p.141 |

**Total: 185 cards across 6 chapters.**

The generator script is saved at:
`/sessions/eloquent-epic-planck/build_kanji_json.py`

To regenerate all files, run:
```bash
python3 build_kanji_json.py
```

---

## Per-Chapter Notes

- **Ch.1** (41 cards): Introduces core intermediate vocabulary. Radical hint page: にんべん (亻). Cards include: 初, 失, 礼, 申, 願, 教, 君, 留, 多, 院, 専, 攻, 部, 実, 文, 化, 性, 帰, 取, 私, 仕, 泊, 間, 所, 話, 記, 成, 町, 着, 同, 近, 歩, 曜, 男, 去, 美, 法, 考, 度, 電, 生.
- **Ch.2** (33 cards): Conversation and social interaction vocabulary. Radical hint page: ごんべん (言). Cards include: 例, 朝, 午, 変, 意, 味, 覚, 声, 難, 外, 急, 代, 僕, 番, 号, 困, 当, 相, 友, 説, 食, 事, 対, 族, 数, 決, 句, 用, 語, 客, 供, 育, 社.
- **Ch.3** (23 cards): Requests, errands, study. Radical hint page: さんずい (氵). Cards include: 頼, 忘, 枚, 受, 込, 切, 送, 屋, 痛, 思, 利, 便, 違, 以, 助, 全, 終, 識, 音, 楽, 達, 特, 知.
- **Ch.4** (36 cards): Travel, seasons, daily life. Radical hint page: きへん (木). Cards include: 写, 真, 史, 別, 兄, 妹, 似, 州, 有, 名, 湖, 冬, 春, 秋, 駅, 遠, 転, 借, 遅, 夕, 久, 末, 夏, 暑, 通, 期, 活, 役, 乗, 体, 仏, 新, 聞, 漢, 回, 晩.
- **Ch.5** (24 cards): Academic and campus life. Radical hint page: てへん (才). Cards include: 質, 科, 伺, 研, 究, 移, 績, 予, 宿, 現, 員, 島, 験, 卒, 業, 理, 由, 強, 般, 点, 重, 要, 第, 付.
- **Ch.7** (28 cards): Culture, media, history. Radical hint page: ひへん (日). Cards include: 林, 試, 祝, 品, 組, 欲, 若, 昔, 映, 央, 盛, 始, 並, 他, 訪, 問, 集, 負, 太, 洋, 戦, 争, 放, 関, 最, 身, 伝, 統.

---

## Known Gaps / Future Work

- **Ch.6 and Ch.8+ not included** — those kanji-list pages were not provided. Same method applies: render the page at 4× with PyMuPDF, read visually, add to the script.
- **読めればいい漢字 not included** — a second pass could add these as recognition-only cards (could be flagged with `"write_required": false` in the schema).
- **Grade field** — for kanji outside the elementary school 1–6 list, grade is approximated. A future pass against KANJIDIC2 would give authoritative values.
- **Etymology** — these are AI-generated mnemonics (radical decomposition + memorable hook), not strict etymological history. They are editable per-card.
- **Ch.6 missing entirely** — was not in the pages provided by the user.
