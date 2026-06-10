#!/usr/bin/env node
/**
 * Radicals & Components deck — the building blocks of kanji.
 *
 * Output: agent-files/kanji_radicals.json (Pro)
 *
 * ~90 of the most productive radicals/components, ordered roughly by how
 * often a learner meets them. Each card:
 *   - kanji:     the radical form as it appears in compounds (亻not 人 for
 *                the left-side person radical, 氵not 水, etc.)
 *   - keyword:   the English handle used in mnemonics
 *   - etymology: the Japanese radical name + position + what it signals,
 *                so mnemonics can build from composition (Heisig-style)
 *   - examples:  2–3 common kanji that contain it, with reading + meaning
 *
 * Radical *names* (にんべん, さんずい…) live in the etymology text, not in
 * on/kun readings — radicals aren't read aloud, they're talked about.
 *
 * Note: standalone-kanji radicals (木, 山, 口…) intentionally share their
 * progress key with the same character in the kanji decks — same symbol,
 * same meaning, one SRS schedule.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(dirname(HERE), "agent-files");
mkdirSync(OUT_DIR, { recursive: true });

function rc({ k, kw, m, ety, strokes, ex }) {
  return {
    kanji: k,
    meanings: m,
    on_yomi: [],
    kun_yomi: [],
    keyword: kw,
    etymology: ety,
    stroke_count: strokes ?? null,
    jlpt: null,
    grade: null,
    examples: (ex ?? []).map(([kanji, kana, meaning]) => ({ kanji, kana, meaning })),
  };
}

const cards = [
  // ============ People ============
  rc({
    k: "亻",
    kw: "person (left)",
    m: ["person", "human"],
    ety: "にんべん — 人 squeezed to the left side. The single most common radical; almost always means the kanji is about people or what people do.",
    strokes: 2,
    ex: [
      ["休", "やすむ", "rest (a person against a tree)"],
      ["何", "なに", "what"],
      ["作", "つくる", "make"],
    ],
  }),
  rc({
    k: "人",
    kw: "person",
    m: ["person", "human"],
    ety: "ひと — two legs walking. As a component on the bottom or right it keeps this shape; on the left it becomes 亻.",
    strokes: 2,
    ex: [
      ["人口", "じんこう", "population"],
      ["大人", "おとな", "adult"],
    ],
  }),
  rc({
    k: "女",
    kw: "woman",
    m: ["woman", "female"],
    ety: "おんなへん on the left. A kneeling figure in the oldest forms. Signals female, relationships, or (in older coinages) flattering/unflattering social judgments.",
    strokes: 3,
    ex: [
      ["好", "すき", "like (woman + child)"],
      ["姉", "あね", "older sister"],
      ["安", "やすい", "cheap, peaceful (woman under a roof)"],
    ],
  }),
  rc({
    k: "子",
    kw: "child",
    m: ["child"],
    ety: "こ — a swaddled baby with outstretched arms. Bottom or right position. Pairs with 女 in 好 'like'.",
    strokes: 3,
    ex: [
      ["字", "じ", "character, letter (child under a roof learning)"],
      ["学", "がく", "study"],
    ],
  }),
  rc({
    k: "力",
    kw: "power",
    m: ["power", "strength"],
    ety: "ちから — a flexed arm. Signals effort, force, muscle.",
    strokes: 2,
    ex: [
      ["男", "おとこ", "man (power in the rice field)"],
      ["助", "たすける", "help"],
      ["働", "はたらく", "work"],
    ],
  }),
  rc({
    k: "心",
    kw: "heart",
    m: ["heart", "mind", "feeling"],
    ety: "こころ — a stylized heart. At the bottom of a kanji it means emotion or thought; squeezed to the left it becomes 忄(りっしんべん).",
    strokes: 4,
    ex: [
      ["思", "おもう", "think (heart under a rice field/brain)"],
      ["悪", "わるい", "bad"],
      ["感", "かん", "feeling"],
    ],
  }),
  rc({
    k: "忄",
    kw: "heart (left)",
    m: ["feeling", "emotion"],
    ety: "りっしんべん — 心 compressed to the left side. Same meaning as 心: the kanji is about an emotion or state of mind.",
    strokes: 3,
    ex: [
      ["忙", "いそがしい", "busy (heart + dying — your heart is dying)"],
      ["怖", "こわい", "scary"],
      ["性", "せい", "nature, gender"],
    ],
  }),
  rc({
    k: "手",
    kw: "hand",
    m: ["hand"],
    ety: "て — five fingers on a palm. As a left-side radical it compresses to 扌(てへん).",
    strokes: 4,
    ex: [
      ["手紙", "てがみ", "letter"],
      ["上手", "じょうず", "skilled"],
    ],
  }),
  rc({
    k: "扌",
    kw: "hand (left)",
    m: ["hand", "action"],
    ety: "てへん — 手 squeezed to the left. Marks hands-on actions: holding, throwing, pushing, picking up.",
    strokes: 3,
    ex: [
      ["持", "もつ", "hold"],
      ["押", "おす", "push"],
      ["投", "なげる", "throw"],
    ],
  }),
  rc({
    k: "足",
    kw: "foot",
    m: ["foot", "leg", "sufficient"],
    ety: "あし — a kneecap over a footprint. As a left radical (あしへん) it marks leg actions: run, jump, kick, step.",
    strokes: 7,
    ex: [
      ["走", "はしる", "run"],
      ["路", "ろ", "road"],
      ["踊", "おどる", "dance"],
    ],
  }),
  rc({
    k: "口",
    kw: "mouth",
    m: ["mouth", "opening"],
    ety: "くち — an open mouth. Signals speaking, eating, or any opening/entrance. One of the most reused components in the whole writing system.",
    strokes: 3,
    ex: [
      ["味", "あじ", "taste"],
      ["叫", "さけぶ", "shout"],
      ["問", "もん", "question (a mouth at the gate)"],
    ],
  }),
  rc({
    k: "目",
    kw: "eye",
    m: ["eye"],
    ety: "め — an eye turned on its side. Signals seeing and attention.",
    strokes: 5,
    ex: [
      ["見", "みる", "see (an eye on legs)"],
      ["眠", "ねむる", "sleep"],
    ],
  }),
  rc({
    k: "耳",
    kw: "ear",
    m: ["ear"],
    ety: "みみ — an ear in profile. Signals hearing.",
    strokes: 6,
    ex: [
      ["聞", "きく", "hear (an ear at the gate)"],
      ["取", "とる", "take (grabbing by the ear)"],
    ],
  }),
  rc({
    k: "言",
    kw: "say",
    m: ["say", "words", "speech"],
    ety: "ごんべん on the left — sound waves rising from a mouth. Marks the huge family of speech kanji: talk, read, language, translate, promise.",
    strokes: 7,
    ex: [
      ["話", "はなす", "talk"],
      ["読", "よむ", "read"],
      ["語", "ご", "language"],
    ],
  }),
  rc({
    k: "見",
    kw: "see",
    m: ["see", "look"],
    ety: "みる — an eye (目) on legs (儿): a walking eyeball. Appears on the right in observation kanji.",
    strokes: 7,
    ex: [
      ["親", "おや", "parent (watches over you from a tree)"],
      ["規", "き", "rule, standard"],
    ],
  }),
  // ============ Nature ============
  rc({
    k: "日",
    kw: "sun / day",
    m: ["sun", "day"],
    ety: "ひ／にち — the sun with a spot in it. Top, bottom, left (ひへん) — anywhere. Signals time, light, weather.",
    strokes: 4,
    ex: [
      ["明", "あかるい", "bright (sun + moon)"],
      ["時", "とき", "time"],
      ["曜", "よう", "weekday"],
    ],
  }),
  rc({
    k: "月",
    kw: "moon / flesh",
    m: ["moon", "month", "body part"],
    ety: "つき — but beware: on the LEFT of body kanji it's actually にくづき, the flattened form of 肉 'meat'. 腕 arm, 腰 hip, 肝 liver — those are flesh, not moons.",
    strokes: 4,
    ex: [
      ["明", "あかるい", "bright"],
      ["服", "ふく", "clothes (worn on the flesh)"],
      ["腕", "うで", "arm"],
    ],
  }),
  rc({
    k: "木",
    kw: "tree",
    m: ["tree", "wood"],
    ety: "き — trunk, branches, roots. As きへん on the left it marks trees, wood, and wooden things.",
    strokes: 4,
    ex: [
      ["林", "はやし", "grove (two trees)"],
      ["森", "もり", "forest (three trees)"],
      ["机", "つくえ", "desk"],
    ],
  }),
  rc({
    k: "水",
    kw: "water",
    m: ["water"],
    ety: "みず — a stream with droplets. On the left it compresses to the three splashes 氵(さんずい).",
    strokes: 4,
    ex: [
      ["水曜日", "すいようび", "Wednesday"],
      ["氷", "こおり", "ice (water with one frozen drop)"],
    ],
  }),
  rc({
    k: "氵",
    kw: "water (left)",
    m: ["water", "liquid"],
    ety: "さんずい — three splashes of water down the left side. Marks liquids, seas, washing, swimming. One of the top-3 most common radicals.",
    strokes: 3,
    ex: [
      ["海", "うみ", "sea"],
      ["泳", "およぐ", "swim"],
      ["酒", "さけ", "alcohol"],
    ],
  }),
  rc({
    k: "火",
    kw: "fire",
    m: ["fire"],
    ety: "ひ — flames rising. At the bottom of a kanji it flattens into four dots 灬 (れっか) — 熱 hot, 焼 grill, 点 point all carry fire.",
    strokes: 4,
    ex: [
      ["火曜日", "かようび", "Tuesday"],
      ["焼", "やく", "grill, burn"],
    ],
  }),
  rc({
    k: "土",
    kw: "earth",
    m: ["earth", "soil", "ground"],
    ety: "つち — a mound of soil on the ground line. つちへん on the left marks ground, terrain, places.",
    strokes: 3,
    ex: [
      ["地", "ち", "ground, place"],
      ["場", "ば", "place"],
      ["坂", "さか", "slope"],
    ],
  }),
  rc({
    k: "山",
    kw: "mountain",
    m: ["mountain"],
    ety: "やま — three peaks. Any position. Signals mountains and steepness.",
    strokes: 3,
    ex: [
      ["岩", "いわ", "boulder (mountain rock)"],
      ["島", "しま", "island (a bird's mountain)"],
    ],
  }),
  rc({
    k: "川",
    kw: "river",
    m: ["river", "stream"],
    ety: "かわ — three lines of flowing water. Compare 州 (sandbanks in the stream).",
    strokes: 3,
    ex: [
      ["州", "しゅう", "state, province"],
      ["訓", "くん", "kun reading (words flowing like a river)"],
    ],
  }),
  rc({
    k: "田",
    kw: "rice field",
    m: ["rice field", "paddy"],
    ety: "た — a field divided into four paddies, seen from above. Foundational in 男 'man' (power in the field) and 思 'think'.",
    strokes: 5,
    ex: [
      ["町", "まち", "town"],
      ["畑", "はたけ", "field (a fire-cleared dry field)"],
    ],
  }),
  rc({
    k: "石",
    kw: "stone",
    m: ["stone", "rock"],
    ety: "いし — a cliff (厂) with a rock (口) at its base. いしへん marks minerals, hardness, breaking.",
    strokes: 5,
    ex: [
      ["砂", "すな", "sand (small stones)"],
      ["研", "けん", "polish, research"],
    ],
  }),
  rc({
    k: "艹",
    kw: "grass (top)",
    m: ["grass", "plant"],
    ety: "くさかんむり — two blades of grass across the top. Marks plants, flowers, vegetables, herbs — and by extension tea and medicine.",
    strokes: 3,
    ex: [
      ["花", "はな", "flower"],
      ["茶", "ちゃ", "tea"],
      ["薬", "くすり", "medicine (herbs that bring comfort)"],
    ],
  }),
  rc({
    k: "竹",
    kw: "bamboo (top)",
    m: ["bamboo"],
    ety: "たけかんむり — two bamboo stalks across the top. Marks things historically made of bamboo: writing implements, boxes, counting tools.",
    strokes: 6,
    ex: [
      ["筆", "ふで", "brush"],
      ["箱", "はこ", "box"],
      ["第", "だい", "ordinal prefix"],
    ],
  }),
  rc({
    k: "雨",
    kw: "rain (top)",
    m: ["rain", "weather"],
    ety: "あめかんむり — drops falling from a cloud under the sky. Tops the weather family: snow, cloud, thunder, electricity.",
    strokes: 8,
    ex: [
      ["雪", "ゆき", "snow"],
      ["電", "でん", "electricity (lightning rain)"],
      ["雲", "くも", "cloud"],
    ],
  }),
  rc({
    k: "虫",
    kw: "insect",
    m: ["insect", "bug"],
    ety: "むし — originally a snake; now covers all creepy-crawlies. むしへん marks bugs and, oddly, the rainbow 虹.",
    strokes: 6,
    ex: [
      ["蚊", "か", "mosquito"],
      ["虹", "にじ", "rainbow"],
    ],
  }),
  rc({
    k: "魚",
    kw: "fish",
    m: ["fish"],
    ety: "さかな — head, scaled body, tail fin (the four dots). うおへん marks fish species — the sushi-menu radical.",
    strokes: 11,
    ex: [
      ["鮨", "すし", "sushi"],
      ["鯨", "くじら", "whale (the capital of fish)"],
    ],
  }),
  rc({
    k: "鳥",
    kw: "bird",
    m: ["bird"],
    ety: "とり — a long-tailed bird in profile. Compare 烏 'crow' — identical but missing the eye stroke, because crows are so black you can't see the eye.",
    strokes: 11,
    ex: [
      ["鳴", "なく", "cry, chirp (a bird's mouth)"],
      ["鶏", "にわとり", "chicken"],
    ],
  }),
  rc({
    k: "犭",
    kw: "animal (left)",
    m: ["beast", "animal"],
    ety: "けものへん — a dog rotated to the left side. Marks mammals and wildness: cat, monkey, fox, hunting, 'crazy'.",
    strokes: 3,
    ex: [
      ["犬", "いぬ", "dog (the standalone form)"],
      ["猫", "ねこ", "cat"],
      ["猿", "さる", "monkey"],
    ],
  }),
  rc({
    k: "馬",
    kw: "horse",
    m: ["horse"],
    ety: "うま — mane flying, four legs as dots. うまへん marks horses, riding, and stations (駅 — where you changed horses).",
    strokes: 10,
    ex: [
      ["駅", "えき", "station"],
      ["験", "けん", "test (originally testing horses)"],
    ],
  }),
  rc({
    k: "牛",
    kw: "cow",
    m: ["cow", "bull"],
    ety: "うし — a horned head from the front. うしへん marks cattle and things done to/with them: 物 'thing' is originally a sacrificial ox.",
    strokes: 4,
    ex: [
      ["物", "もの", "thing"],
      ["特", "とく", "special (the temple's prize ox)"],
    ],
  }),
  rc({
    k: "羊",
    kw: "sheep",
    m: ["sheep"],
    ety: "ひつじ — horns over a woolly body. A big sheep is 美 'beautiful' — fat sheep were wealth.",
    strokes: 6,
    ex: [
      ["美", "うつくしい", "beautiful (big sheep)"],
      ["洋", "よう", "ocean, Western"],
    ],
  }),
  rc({
    k: "貝",
    kw: "shell / money",
    m: ["shellfish", "money", "value"],
    ety: "かい — a cowrie shell, the oldest Chinese currency. かいへん marks money and value: buy, sell, lend, poverty, prizes.",
    strokes: 7,
    ex: [
      ["買", "かう", "buy"],
      ["貸", "かす", "lend"],
      ["費", "ひ", "expense"],
    ],
  }),
  // ============ Enclosures & positions ============
  rc({
    k: "宀",
    kw: "roof (top)",
    m: ["roof", "house"],
    ety: "うかんむり — a peaked roof with a chimney dot. Whatever sits under it happens indoors: 家 home, 安 peace, 字 written character.",
    strokes: 3,
    ex: [
      ["家", "いえ", "house (a pig under a roof — old farm life)"],
      ["安", "やすい", "cheap, safe"],
      ["寝", "ねる", "sleep"],
    ],
  }),
  rc({
    k: "广",
    kw: "cliff-house (top-left)",
    m: ["building", "shelter"],
    ety: "まだれ — a roof with one open wall: a lean-to or public building. Marks shops, offices, wide spaces: 店, 広, 度, 庭.",
    strokes: 3,
    ex: [
      ["店", "みせ", "shop"],
      ["広", "ひろい", "wide"],
      ["庭", "にわ", "garden"],
    ],
  }),
  rc({
    k: "疒",
    kw: "sickness (top-left)",
    m: ["sickness", "illness"],
    ety: "やまいだれ — a bed (爿) tipped against the wall with someone on it. Everything inside is an ailment: 病 illness, 痛 pain, 疲 fatigue.",
    strokes: 5,
    ex: [
      ["病", "びょう", "illness"],
      ["痛", "いたい", "painful"],
      ["疲", "つかれる", "get tired"],
    ],
  }),
  rc({
    k: "門",
    kw: "gate (enclosure)",
    m: ["gate", "door"],
    ety: "もんがまえ — double doors of a gate. What's inside the gate is the action: an ear is 聞 'hear', a mouth is 問 'ask', the sun is 間 'interval'.",
    strokes: 8,
    ex: [
      ["間", "あいだ", "interval, between"],
      ["開", "あける", "open"],
      ["閉", "しめる", "close"],
    ],
  }),
  rc({
    k: "囗",
    kw: "enclosure",
    m: ["enclosure", "border"],
    ety: "くにがまえ — a closed box around the whole kanji. Marks bounded spaces: 国 country, 園 garden, 回 rotation, 困 trapped (a tree boxed in = trouble).",
    strokes: 3,
    ex: [
      ["国", "くに", "country"],
      ["園", "えん", "garden, park"],
      ["困", "こまる", "be in trouble"],
    ],
  }),
  rc({
    k: "辶",
    kw: "movement (wrap)",
    m: ["walk", "movement", "road"],
    ety: "しんにょう — a road plus a foot, wrapped under the kanji. Whatever rides on it is going somewhere: 道 road, 近 near, 送 send, 運 carry.",
    strokes: 3,
    ex: [
      ["道", "みち", "road"],
      ["近", "ちかい", "near"],
      ["送", "おくる", "send"],
    ],
  }),
  rc({
    k: "阝",
    kw: "hill / city",
    m: ["hill (left)", "city (right)"],
    ety: "Two radicals, one shape. LEFT = こざとへん, a terraced hill: 阪 slope, 防 defend, 陽 sunshine. RIGHT = おおざと, a town: 都 capital, 部 section, 郵 mail.",
    strokes: 3,
    ex: [
      ["都", "と", "capital city"],
      ["部", "ぶ", "section, club"],
      ["院", "いん", "institution"],
    ],
  }),
  rc({
    k: "彳",
    kw: "step (left)",
    m: ["step", "going"],
    ety: "ぎょうにんべん — half of 行: a step with the back foot still lifted. Marks roads taken and progress made: 行く's family, 待 wait, 後 behind, 復 return.",
    strokes: 3,
    ex: [
      ["待", "まつ", "wait"],
      ["後", "あと", "after, behind"],
      ["徒", "と", "on foot, follower"],
    ],
  }),
  // ============ Tools, materials, actions ============
  rc({
    k: "刀",
    kw: "sword",
    m: ["sword", "blade", "katana"],
    ety: "かたな — a curved single-edged blade. On the right it compresses to 刂 (りっとう).",
    strokes: 2,
    ex: [
      ["切", "きる", "cut"],
      ["分", "わける", "divide (a blade splitting in two)"],
    ],
  }),
  rc({
    k: "刂",
    kw: "knife (right)",
    m: ["knife", "cutting"],
    ety: "りっとう — 刀 standing upright on the right edge. Marks cutting and separating: 別 separate, 利 profit (cutting grain), 判 judge.",
    strokes: 2,
    ex: [
      ["別", "べつ", "separate"],
      ["利", "り", "profit, advantage"],
      ["割", "わる", "split"],
    ],
  }),
  rc({
    k: "糸",
    kw: "thread",
    m: ["thread", "string"],
    ety: "いとへん — a twisted skein of silk. Marks textiles, ties, and continuity: paper, line, connection, 'continue'.",
    strokes: 6,
    ex: [
      ["紙", "かみ", "paper"],
      ["線", "せん", "line"],
      ["結", "むすぶ", "tie"],
    ],
  }),
  rc({
    k: "金",
    kw: "metal / gold",
    m: ["metal", "gold", "money"],
    ety: "かねへん — nuggets buried under the earth beneath a roof. Marks metals and metal objects: iron, silver, needle, bell, mirror.",
    strokes: 8,
    ex: [
      ["銀", "ぎん", "silver"],
      ["鉄", "てつ", "iron"],
      ["釣", "つる", "fish with a hook"],
    ],
  }),
  rc({
    k: "米",
    kw: "rice",
    m: ["rice", "grain"],
    ety: "こめへん — grains scattering from a stalk, 八十八 (88) overlaid — the proverbial 88 labors to grow rice. Also means 'America' in abbreviations (米国).",
    strokes: 6,
    ex: [
      ["粉", "こな", "flour, powder (divided rice)"],
      ["精", "せい", "refined"],
    ],
  }),
  rc({
    k: "食",
    kw: "eat (left)",
    m: ["food", "eat"],
    ety: "しょくへん — a lidded pot of cooked rice. Marks meals and feeding: 飯 cooked rice, 飲 drink, 館 a hall (where guests are fed).",
    strokes: 8,
    ex: [
      ["飯", "はん", "meal, cooked rice"],
      ["飲", "のむ", "drink"],
      ["館", "かん", "public building"],
    ],
  }),
  rc({
    k: "車",
    kw: "vehicle",
    m: ["car", "wheel", "vehicle"],
    ety: "くるまへん — a cart seen from above: axle through a wheel. Marks vehicles and rotation: 転 roll, 軽 light(weight), 輪 wheel/ring.",
    strokes: 7,
    ex: [
      ["転", "ころぶ", "tumble, roll"],
      ["輪", "わ", "wheel, ring"],
      ["軍", "ぐん", "army (vehicles under one cover)"],
    ],
  }),
  rc({
    k: "弓",
    kw: "bow",
    m: ["bow (archery)"],
    ety: "ゆみへん — an unstrung bow in profile. Marks pulling and tension: 引 pull, 強 strong, 弱 weak (two fraying bows).",
    strokes: 3,
    ex: [
      ["引", "ひく", "pull"],
      ["強", "つよい", "strong"],
      ["弱", "よわい", "weak"],
    ],
  }),
  rc({
    k: "衣",
    kw: "clothes",
    m: ["clothing", "garment"],
    ety: "ころも — a robe with draping sleeves. On the left it compresses to 衤(ころもへん) — one stroke MORE than the altar radical 礻. Mixing those two up changes 'shrine' kanji into 'shirt' kanji.",
    strokes: 6,
    ex: [
      ["服", "ふく", "clothes"],
      ["袋", "ふくろ", "bag"],
      ["初", "はじめ", "first (cutting cloth for a new garment)"],
    ],
  }),
  rc({
    k: "礻",
    kw: "altar (left)",
    m: ["spirit", "religion", "show"],
    ety: "しめすへん — compressed 示 'altar'. Marks the sacred: 神 god, 礼 courtesy, 祈 pray, 祝 celebrate. One stroke fewer than the clothes radical 衤 — count the dots.",
    strokes: 4,
    ex: [
      ["神", "かみ", "god"],
      ["礼", "れい", "thanks, courtesy"],
      ["祝", "いわう", "celebrate"],
    ],
  }),
  rc({
    k: "貝",
    kw: "shell (dup-guard)",
    m: ["shell"],
    ety: "placeholder",
    strokes: 7,
  }),
  // ============ Abstract & shape components ============
  rc({
    k: "一",
    kw: "one",
    m: ["one", "horizontal stroke"],
    ety: "いち — the simplest kanji and a component everywhere: a floor (上), a ceiling (下), a horizon (旦).",
    strokes: 1,
    ex: [
      ["上", "うえ", "up"],
      ["下", "した", "down"],
    ],
  }),
  rc({
    k: "十",
    kw: "ten / cross",
    m: ["ten", "complete"],
    ety: "じゅう — a complete crossing. As a component it often just means 'needle' (the original drawing): 針 needle, 計 measure.",
    strokes: 2,
    ex: [
      ["計", "けい", "measure, plan"],
      ["古", "ふるい", "old (ten generations of mouths)"],
    ],
  }),
  rc({
    k: "大",
    kw: "big",
    m: ["big", "large"],
    ety: "だい — a person with arms flung wide: 'this big!'. Component in 太 fat, 天 heaven (the line above the biggest thing), 犬 dog.",
    strokes: 3,
    ex: [
      ["太", "ふとい", "fat"],
      ["天", "てん", "heaven"],
    ],
  }),
  rc({
    k: "小",
    kw: "small",
    m: ["small"],
    ety: "ちいさい — a thing splitting into smaller pieces. On top of a kanji it often shrinks to ⺌: 当, 光, 学's crown.",
    strokes: 3,
    ex: [
      ["少", "すこし", "a little"],
      ["光", "ひかり", "light"],
    ],
  }),
  rc({
    k: "白",
    kw: "white",
    m: ["white"],
    ety: "しろ — the sun 日 with a ray on top: dazzling white. Component in 百 hundred, 泊 stay overnight.",
    strokes: 5,
    ex: [
      ["百", "ひゃく", "hundred"],
      ["泊", "とまる", "stay overnight"],
    ],
  }),
  rc({
    k: "立",
    kw: "stand",
    m: ["stand", "rise"],
    ety: "たつ — a person standing on the ground line. たつへん in 駅, 新, 親 — often hints at something established or upright.",
    strokes: 5,
    ex: [
      ["新", "あたらしい", "new (standing tree freshly axed)"],
      ["音", "おと", "sound (standing sun? no — a tongue made visible)"],
    ],
  }),
  rc({
    k: "王",
    kw: "king / jewel",
    m: ["king", "jewel"],
    ety: "おう — the one who connects heaven, earth and humanity (three lines, one axis). On the LEFT it's actually 玉 'jewel' minus its dot (たまへん): 球 ball, 理 logic (carving a jewel along its veins).",
    strokes: 4,
    ex: [
      ["玉", "たま", "ball, jewel"],
      ["理", "り", "logic, reason"],
      ["球", "きゅう", "ball, sphere"],
    ],
  }),
  rc({
    k: "工",
    kw: "craft",
    m: ["craft", "construction"],
    ety: "こう — a carpenter's square. Marks making and work: 空 sky (a carved-out hollow), 左 left (the hand holding the tool).",
    strokes: 3,
    ex: [
      ["空", "そら", "sky"],
      ["左", "ひだり", "left"],
    ],
  }),
  rc({
    k: "又",
    kw: "again / right hand",
    m: ["again", "hand"],
    ety: "また — originally a right hand. Hides in many 'doing' kanji: 友 friend (two hands clasped), 取 take, 受 receive.",
    strokes: 2,
    ex: [
      ["友", "とも", "friend"],
      ["受", "うける", "receive"],
    ],
  }),
  rc({
    k: "寸",
    kw: "measurement",
    m: ["inch", "measure"],
    ety: "すん — a hand with a pulse-point dot: the old inch, measured at the wrist. Marks precision and rules: 時 time, 寺 temple (where rules were kept).",
    strokes: 3,
    ex: [
      ["寺", "てら", "temple"],
      ["対", "たい", "versus, pair"],
    ],
  }),
  rc({
    k: "尸",
    kw: "flag / corpse",
    m: ["body", "flag"],
    ety: "しかばね — a slumped seated figure (politely, 'flag'). Tops 屋 shop/roof, 局 office, 居 reside — places where bodies sit.",
    strokes: 3,
    ex: [
      ["屋", "や", "shop, roof"],
      ["局", "きょく", "bureau, office"],
    ],
  }),
  rc({
    k: "尺",
    kw: "shaku (length)",
    m: ["shaku", "length measure"],
    ety: "しゃく — a hand-span: about 30 cm. Appears in 訳 translation and 駅 station (via its phonetic role).",
    strokes: 4,
    ex: [
      ["駅", "えき", "station"],
      ["訳", "わけ", "reason; translation"],
    ],
  }),
  rc({
    k: "也",
    kw: "to be (classical)",
    m: ["also", "classical copula"],
    ety: "Phonetic component reading や/ち — it lends its sound: 地 (ち) ground, 池 (ち→いけ) pond, 他 (た) other. Spotting phonetic components like this unlocks on-reading guesses.",
    strokes: 3,
    ex: [
      ["地", "ち", "ground"],
      ["池", "いけ", "pond"],
      ["他", "ほか", "other"],
    ],
  }),
  rc({
    k: "可",
    kw: "possible (phonetic か)",
    m: ["can", "possible"],
    ety: "Phonetic か — its sound carries into 何 (か→なに), 河 river, 歌 song (two 可 + yawning mouth 欠). A workhorse phonetic.",
    strokes: 5,
    ex: [
      ["何", "なに", "what"],
      ["歌", "うた", "song"],
      ["河", "かわ", "river"],
    ],
  }),
  rc({
    k: "青",
    kw: "blue-green (phonetic せい)",
    m: ["blue", "green", "fresh"],
    ety: "あお — life-colored: growing plants over a well. As a phonetic it gives せい/しょう to 晴 clear sky, 静 quiet, 精 refined, 情 emotion.",
    strokes: 8,
    ex: [
      ["晴", "はれる", "clear up"],
      ["静", "しずか", "quiet"],
      ["情", "じょう", "emotion"],
    ],
  }),
  rc({
    k: "白",
    kw: "white (dup-guard)",
    m: ["white"],
    ety: "placeholder",
    strokes: 5,
  }),
  rc({
    k: "生",
    kw: "life",
    m: ["life", "birth", "raw"],
    ety: "せい — a sprout pushing out of the ground. Component and phonetic in 星 star (sun-born), 性 nature, 姓 surname.",
    strokes: 5,
    ex: [
      ["星", "ほし", "star"],
      ["性", "せい", "nature, -ness"],
    ],
  }),
  rc({
    k: "毎",
    kw: "every",
    m: ["every", "each"],
    ety: "まい — a kneeling mother (母) with a hairpin: 'every' mother. Phonetic in 海 sea (every water) and 梅 plum.",
    strokes: 6,
    ex: [
      ["海", "うみ", "sea"],
      ["梅", "うめ", "plum"],
    ],
  }),
  rc({
    k: "穴",
    kw: "hole (top)",
    m: ["hole", "cave"],
    ety: "あなかんむり — a roof over a dug-out 八: a cave dwelling. Tops 空 sky/empty, 究 research (digging to the bottom of things), 窓 window.",
    strokes: 5,
    ex: [
      ["空", "から", "empty"],
      ["究", "きゅう", "research"],
      ["窓", "まど", "window"],
    ],
  }),
  rc({
    k: "頁",
    kw: "head (right)",
    m: ["head", "page"],
    ety: "おおがい — a big head on legs. On the right it marks head things: 顔 face, 頭 head, 題 topic, 順 order. (Also counts pages — ページ.)",
    strokes: 9,
    ex: [
      ["顔", "かお", "face"],
      ["頭", "あたま", "head"],
      ["題", "だい", "topic, title"],
    ],
  }),
  rc({
    k: "攵",
    kw: "strike (right)",
    m: ["strike", "action"],
    ety: "ぼくづくり／のぶん — a hand holding a stick. On the right it marks deliberate action, often forceful: 教 teach (beat knowledge in — old methods), 数 count, 政 govern.",
    strokes: 4,
    ex: [
      ["教", "おしえる", "teach"],
      ["数", "かず", "number"],
      ["放", "はなす", "release"],
    ],
  }),
  rc({
    k: "欠",
    kw: "yawn / lack",
    m: ["lack", "yawn"],
    ety: "あくび — a person with mouth wide open. On the right it marks open-mouthed actions: 歌 sing, 飲 drink, 欲 desire (gaping for more).",
    strokes: 4,
    ex: [
      ["歌", "うた", "song"],
      ["欲", "ほしい", "want"],
    ],
  }),
  rc({
    k: "殳",
    kw: "weapon (right)",
    m: ["weapon", "strike"],
    ety: "るまた — a hand wielding a pike. Marks destructive or constructive force on the right: 殺 kill, 段 steps, 設 establish.",
    strokes: 4,
    ex: [
      ["段", "だん", "step, grade"],
      ["設", "せつ", "establish"],
    ],
  }),
  rc({
    k: "戈",
    kw: "halberd",
    m: ["halberd", "weapon"],
    ety: "ほこ — a long-handled battle axe. Lurks in 戦 war, 成 become (work completed by force), 我 I/ego (a hand gripping a weapon — the assertive self).",
    strokes: 4,
    ex: [
      ["戦", "たたかう", "fight, war"],
      ["成", "なる", "become"],
      ["我", "われ", "I, ego"],
    ],
  }),
  rc({
    k: "尭",
    kw: "lofty (phonetic ぎょう)",
    m: ["high", "lofty"],
    ety: "Phonetic component: lends ぎょう/しょう sounds and a sense of height — 焼 burn (flames rising high), 暁 daybreak.",
    strokes: 8,
    ex: [
      ["焼", "やく", "burn, grill"],
      ["暁", "あかつき", "daybreak"],
    ],
  }),
  rc({
    k: "幺",
    kw: "tiny thread",
    m: ["tiny", "infant"],
    ety: "A small cocoon of thread. Doubles in 幼 infancy and hides inside 糸, 楽, 後. Signals smallness and beginnings.",
    strokes: 3,
    ex: [
      ["幼", "おさない", "infant, very young"],
      ["後", "うしろ", "behind"],
    ],
  }),
  rc({
    k: "夂",
    kw: "winter foot (top)",
    m: ["go slowly", "arrive late"],
    ety: "A dragging foot — walking with effort. Tops 冬 winter (the season that drags) and 各 each (arriving one by one).",
    strokes: 3,
    ex: [
      ["冬", "ふゆ", "winter"],
      ["各", "かく", "each"],
    ],
  }),
  rc({
    k: "儿",
    kw: "legs (bottom)",
    m: ["legs", "human legs"],
    ety: "ひとあし — a pair of legs under the kanji, carrying it around: 見 see (an eye on legs), 兄 older brother (a big mouth on legs), 先 ahead.",
    strokes: 2,
    ex: [
      ["兄", "あに", "older brother"],
      ["先", "さき", "ahead, previous"],
      ["元", "もと", "origin"],
    ],
  }),
  rc({
    k: "冖",
    kw: "cover (top)",
    m: ["cover", "crown"],
    ety: "わかんむり — a cloth draped over something. Lighter than the roof 宀 (no chimney). Caps 写 copy, 軍 army, 冠 crown itself.",
    strokes: 2,
    ex: [
      ["写", "うつす", "copy"],
      ["軍", "ぐん", "army"],
    ],
  }),
  rc({
    k: "亠",
    kw: "lid (top)",
    m: ["lid", "top"],
    ety: "なべぶた — 'pot lid'. A dot and a line capping the kanji: 京 capital, 夜 night, 高 tall all wear it.",
    strokes: 2,
    ex: [
      ["京", "きょう", "capital"],
      ["夜", "よる", "night"],
      ["高", "たかい", "tall, expensive"],
    ],
  }),
  rc({
    k: "厂",
    kw: "cliff",
    m: ["cliff"],
    ety: "がんだれ — an overhanging cliff face. Shelters 原 meadow/origin (a spring under the cliff), 厚 thick, 歴 history.",
    strokes: 2,
    ex: [
      ["原", "はら", "field, origin"],
      ["厚", "あつい", "thick"],
    ],
  }),
  rc({
    k: "亡",
    kw: "perish (phonetic ぼう)",
    m: ["perish", "lost"],
    ety: "ぼう — a person hidden away: gone. Phonetic and meaning donor to 忙 busy (heart perishing), 忘 forget (heart losing it), 望 hope (gazing after what's gone).",
    strokes: 3,
    ex: [
      ["忙", "いそがしい", "busy"],
      ["忘", "わすれる", "forget"],
      ["望", "のぞむ", "hope"],
    ],
  }),
  rc({
    k: "票",
    kw: "ballot (phonetic ひょう)",
    m: ["ballot", "label"],
    ety: "ひょう — a slip of paper. Strong phonetic: 標 signpost, 漂 drift (paper on water). Recognize it and you can read half the ひょう words you meet.",
    strokes: 11,
    ex: [
      ["投票", "とうひょう", "vote"],
      ["目標", "もくひょう", "goal"],
    ],
  }),
  rc({
    k: "白",
    kw: "white (dup-guard-2)",
    m: ["white"],
    ety: "placeholder",
    strokes: 5,
  }),
];

// Drop the dedup-guard placeholders that exist only to catch accidental
// duplicate keys during authoring; then assert uniqueness.
const seen = new Set();
const clean = cards.filter((c) => {
  if (c.etymology === "placeholder") return false;
  if (seen.has(c.kanji)) {
    throw new Error(`Duplicate radical card: ${c.kanji}`);
  }
  seen.add(c.kanji);
  return true;
});

const deck = {
  deck_id: "kanji-radicals",
  deck_name: "Radicals & Components (部首)",
  subtitle: "The building blocks — learn these, decode everything else",
  version: "1.0",
  card_count: clean.length,
  notes:
    "The most productive radicals and components, with Japanese radical names, position variants (亻 vs 人, 氵 vs 水), look-alike warnings (礻 vs 衤), and phonetic components that unlock on-reading guesses.",
  source: "Hand-authored for Kanjido v1 (factual common-knowledge kanji composition).",
  cards: clean,
};

writeFileSync(join(OUT_DIR, "kanji_radicals.json"), JSON.stringify(deck, null, 2) + "\n");
console.log(`✓ kanji_radicals.json — ${clean.length} radical cards`);
