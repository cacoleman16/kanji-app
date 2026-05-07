#!/usr/bin/env node
/**
 * Build the Hiragana + Katakana starter decks with rich back-of-card content.
 *
 * 46 base characters per syllabary (modern gojūon). Each card carries:
 *   - the kana itself (front)
 *   - the romaji sound (front when direction = en→ja)
 *   - English-speaker phonetic mnemonic
 *   - paired kana from the other syllabary  (hira ↔ kata)
 *   - voiced variants where applicable: dakuten (が, ざ, だ, ば) and
 *     handakuten (ぱ-row only)
 *   - 2 real example words containing the kana, with romaji + English
 *
 * This gives the back of the card real engagement — instead of just
 * "'a' sound, looks like an apple core", the user sees:
 *
 *     a    pair: ア    examples: あさ (asa) morning · あお (ao) blue
 *     "あ has the apple-core shape; ア is the 'A' on its side."
 *
 * Output:
 *   agent-files/kana_hiragana.json
 *   agent-files/kana_katakana.json
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(dirname(HERE), "agent-files");
mkdirSync(OUT_DIR, { recursive: true });

/**
 * Master gojūon table.
 * Tuple: [hiragana, katakana, romaji, mnemonic, hiraganaExamples, katakanaExamples]
 *
 * Examples are simple, beginner-recognizable real Japanese words. Hiragana
 * examples are mostly hiragana-only (so beginners aren't blocked by kanji);
 * katakana examples are loanwords (the typical katakana use case).
 *
 * Each example is [word, romaji, english].
 */
const KANA = [
  // Vowels — no dakuten variants
  [
    "あ", "ア", "a",
    "あ has the curl of an apple core; ア is an angular 'A' on its side.",
    [["あさ", "asa", "morning"], ["あお", "ao", "blue"]],
    [["アイス", "aisu", "ice cream"], ["アジア", "ajia", "Asia"]],
  ],
  [
    "い", "イ", "i",
    "い is two eels wiggling side by side; イ is the bare bones of an 'i'.",
    [["いぬ", "inu", "dog"], ["いし", "ishi", "stone"]],
    [["イタリア", "itaria", "Italy"], ["インド", "indo", "India"]],
  ],
  [
    "う", "ウ", "u",
    "う is a mouth saying 'oo'; ウ wears a hat over a cup.",
    [["うみ", "umi", "sea"], ["うた", "uta", "song"]],
    [["ウール", "ūru", "wool"], ["ウィルス", "wirusu", "virus"]],
  ],
  [
    "え", "エ", "e",
    "え looks like a wading crane crying 'eyy'; エ is an 'E' tipped over.",
    [["えき", "eki", "station"], ["えん", "en", "yen"]],
    [["エビ", "ebi", "shrimp (often in katakana on menus)"], ["エネルギー", "enerugī", "energy"]],
  ],
  [
    "お", "オ", "o",
    "お is a person doing the 'oh!' pose; オ is an 'O' with an arrow.",
    [["おに", "oni", "demon"], ["おゆ", "oyu", "hot water"]],
    [["オレンジ", "orenji", "orange"], ["オーストラリア", "ōsutoraria", "Australia"]],
  ],
  // K-row (dakuten → g)
  [
    "か", "カ", "ka",
    "か is mid-karate-kick; カ is the same kick, sharper.",
    [["かさ", "kasa", "umbrella"], ["かお", "kao", "face"]],
    [["カメラ", "kamera", "camera"], ["カナダ", "kanada", "Canada"]],
  ],
  [
    "き", "キ", "ki",
    "き has two keys on a chain; キ is the simplified key shape.",
    [["き", "ki", "tree"], ["きた", "kita", "north"]],
    [["キス", "kisu", "kiss"], ["キーボード", "kībōdo", "keyboard"]],
  ],
  [
    "く", "ク", "ku",
    "く is a cuckoo's beak; ク is a curved hook.",
    [["くち", "kuchi", "mouth"], ["くも", "kumo", "cloud"]],
    [["クッキー", "kukkī", "cookie"], ["クラス", "kurasu", "class"]],
  ],
  [
    "け", "ケ", "ke",
    "け is a keg with a tap; ケ is a ketchup squiggle.",
    [["けさ", "kesa", "this morning"], ["けむり", "kemuri", "smoke"]],
    [["ケーキ", "kēki", "cake"], ["ケース", "kēsu", "case"]],
  ],
  [
    "こ", "コ", "ko",
    "こ is two coins stacked; コ is a corner bracket.",
    [["こ", "ko", "child"], ["こめ", "kome", "rice"]],
    [["コーヒー", "kōhī", "coffee"], ["コップ", "koppu", "cup"]],
  ],
  // S-row (dakuten → z, except し → じ)
  [
    "さ", "サ", "sa",
    "さ has a samba dancer's hip-swing; サ has three sasa-sword strokes.",
    [["さくら", "sakura", "cherry blossom"], ["さかな", "sakana", "fish"]],
    [["サラダ", "sarada", "salad"], ["サイズ", "saizu", "size"]],
  ],
  [
    "し", "シ", "shi",
    "し is a ship's hook; シ has three shimmer marks (looks like 'tsu' below).",
    [["しろ", "shiro", "white"], ["しま", "shima", "island"]],
    [["シャツ", "shatsu", "shirt"], ["シェフ", "shefu", "chef"]],
  ],
  [
    "す", "ス", "su",
    "す is a sushi roll on a stick; ス is a Swiss-army knife shape.",
    [["すし", "sushi", "sushi"], ["すな", "suna", "sand"]],
    [["スープ", "sūpu", "soup"], ["スマホ", "sumaho", "smartphone"]],
  ],
  [
    "せ", "セ", "se",
    "せ has the silhouette of a 7 with a stroke; セ is also '7'-like.",
    [["せかい", "sekai", "world"], ["せなか", "senaka", "back (body)"]],
    [["セット", "setto", "set"], ["セーター", "sētā", "sweater"]],
  ],
  [
    "そ", "ソ", "so",
    "そ is 'so' written quickly; ソ has two sorry-tear-drops.",
    [["そら", "sora", "sky"], ["そと", "soto", "outside"]],
    [["ソース", "sōsu", "sauce"], ["ソファ", "sofa", "sofa"]],
  ],
  // T-row (dakuten → d, except ち → ぢ, つ → づ which are rare)
  [
    "た", "タ", "ta",
    "た is 'ta' for a tower with a flag; タ is a talon shape.",
    [["たまご", "tamago", "egg"], ["たから", "takara", "treasure"]],
    [["タクシー", "takushī", "taxi"], ["タオル", "taoru", "towel"]],
  ],
  [
    "ち", "チ", "chi",
    "ち is a Cheerio shape; チ is a chi-square mark.",
    [["ちず", "chizu", "map"], ["ちかい", "chikai", "near"]],
    [["チーズ", "chīzu", "cheese"], ["チケット", "chiketto", "ticket"]],
  ],
  [
    "つ", "ツ", "tsu",
    "つ is a tsunami curl; ツ is the sideways 'tsu'-rprised face (smile).",
    [["つき", "tsuki", "moon"], ["つくえ", "tsukue", "desk"]],
    [["ツアー", "tsuā", "tour"], ["ツナ", "tsuna", "tuna"]],
  ],
  [
    "て", "テ", "te",
    "て has a telephone-receiver shape; テ is a 'te' antenna.",
    [["て", "te", "hand"], ["てがみ", "tegami", "letter"]],
    [["テスト", "tesuto", "test"], ["テーブル", "tēburu", "table"]],
  ],
  [
    "と", "ト", "to",
    "と is a toed shoe with a pin; ト is a torch.",
    [["とり", "tori", "bird"], ["とけい", "tokei", "watch/clock"]],
    [["トイレ", "toire", "toilet"], ["トマト", "tomato", "tomato"]],
  ],
  // N-row — no dakuten
  [
    "な", "ナ", "na",
    "な resembles a kitten ('na-noma'); ナ is a nail cross.",
    [["なつ", "natsu", "summer"], ["なまえ", "namae", "name"]],
    [["ナイフ", "naifu", "knife"], ["ナチュラル", "nachuraru", "natural"]],
  ],
  [
    "に", "ニ", "ni",
    "に is two nickel coins; ニ is just two lines (2 = ni).",
    [["にく", "niku", "meat"], ["にじ", "niji", "rainbow"]],
    [["ニュース", "nyūsu", "news"], ["ニンジン", "ninjin", "carrot"]],
  ],
  [
    "ぬ", "ヌ", "nu",
    "ぬ is a noodle bowl with chopsticks; ヌ is a no-deer sketch.",
    [["ぬの", "nuno", "cloth"], ["いぬ", "inu", "dog"]],
    [["ヌードル", "nūdoru", "noodle"], ["ヌガー", "nugā", "nougat"]],
  ],
  [
    "ね", "ネ", "ne",
    "ね has a cat's tail (ねこ = neko/cat); ネ has a small cat-like top.",
    [["ねこ", "neko", "cat"], ["ねつ", "netsu", "fever"]],
    [["ネコ", "neko", "cat (often katakana for emphasis)"], ["ネット", "netto", "net / online"]],
  ],
  [
    "の", "ノ", "no",
    "の is a no-entry sign; ノ is a single no-slash.",
    [["の", "no", "of (particle)"], ["のみもの", "nomimono", "drink"]],
    [["ノート", "nōto", "notebook"], ["ノー", "nō", "no"]],
  ],
  // H-row (dakuten → b; handakuten → p)
  [
    "は", "ハ", "ha",
    "は is the hahaha-laugh shape; ハ is two hahaha lines.",
    [["はな", "hana", "flower / nose"], ["はる", "haru", "spring (season)"]],
    [["ハム", "hamu", "ham"], ["ハワイ", "hawai", "Hawaii"]],
  ],
  [
    "ひ", "ヒ", "hi",
    "ひ is a smile saying 'hee'; ヒ is a 'hi' chair.",
    [["ひと", "hito", "person"], ["ひる", "hiru", "noon"]],
    [["ヒーロー", "hīrō", "hero"], ["ヒント", "hinto", "hint"]],
  ],
  [
    "ふ", "フ", "fu",
    "ふ is Mt Fuji's silhouette; フ is the same hill simplified.",
    [["ふく", "fuku", "clothes"], ["ふね", "fune", "boat"]],
    [["フォーク", "fōku", "fork"], ["フランス", "furansu", "France"]],
  ],
  [
    "へ", "ヘ", "he",
    "へ is a small helmet curve; ヘ is the same curve.",
    [["へや", "heya", "room"], ["へび", "hebi", "snake"]],
    [["ヘッド", "heddo", "head"], ["ヘリ", "heri", "helicopter (short)"]],
  ],
  [
    "ほ", "ホ", "ho",
    "ほ is a home with a cross; ホ is a hospital cross.",
    [["ほし", "hoshi", "star"], ["ほん", "hon", "book"]],
    [["ホテル", "hoteru", "hotel"], ["ホット", "hotto", "hot"]],
  ],
  // M-row — no dakuten
  [
    "ま", "マ", "ma",
    "ま is a mamba snake coiled; マ is a marker tick.",
    [["まど", "mado", "window"], ["まち", "machi", "town"]],
    [["マスク", "masuku", "mask"], ["マンション", "manshon", "apartment"]],
  ],
  [
    "み", "ミ", "mi",
    "み is a mi-mi (number 21) snake; ミ is three mimes' lines.",
    [["みず", "mizu", "water"], ["みみ", "mimi", "ear"]],
    [["ミルク", "miruku", "milk"], ["ミニ", "mini", "mini"]],
  ],
  [
    "む", "ム", "mu",
    "む is a mu-cow with horns; ム is a mule's ear.",
    [["むし", "mushi", "insect"], ["むら", "mura", "village"]],
    [["ムード", "mūdo", "mood"], ["ムービー", "mūbī", "movie"]],
  ],
  [
    "め", "メ", "me",
    "め is a 'me'-eye shape; メ is a 'me' X mark.",
    [["め", "me", "eye"], ["めし", "meshi", "rice / meal"]],
    [["メール", "mēru", "email"], ["メモ", "memo", "memo"]],
  ],
  [
    "も", "モ", "mo",
    "も is a mother fish hook; モ is a mop stand.",
    [["もも", "momo", "peach"], ["もり", "mori", "forest"]],
    [["モデル", "moderu", "model"], ["モバイル", "mobairu", "mobile"]],
  ],
  // Y-row (only 3 in modern use)
  [
    "や", "ヤ", "ya",
    "や is a yacht with anchor; ヤ is a yard-stick.",
    [["やま", "yama", "mountain"], ["やすい", "yasui", "cheap"]],
    [["ヤシ", "yashi", "palm tree"], ["ヤング", "yangu", "young"]],
  ],
  [
    "ゆ", "ユ", "yu",
    "ゆ is a yu-shaped fish; ユ is a yu-bracket.",
    [["ゆき", "yuki", "snow"], ["ゆめ", "yume", "dream"]],
    [["ユーロ", "yūro", "euro"], ["ユニフォーム", "yunifōmu", "uniform"]],
  ],
  [
    "よ", "ヨ", "yo",
    "よ is a yo-yo on a string; ヨ is a yo with three teeth.",
    [["よる", "yoru", "night"], ["よん", "yon", "four"]],
    [["ヨガ", "yoga", "yoga"], ["ヨーロッパ", "yōroppa", "Europe"]],
  ],
  // R-row — no dakuten
  [
    "ら", "ラ", "ra",
    "ら is a rabbit ear; ラ is a racing helmet.",
    [["らく", "raku", "comfort"], ["さくら", "sakura", "cherry blossom"]],
    [["ラジオ", "rajio", "radio"], ["ランチ", "ranchi", "lunch"]],
  ],
  [
    "り", "リ", "ri",
    "り is two ring-pull tabs; リ is two river lines.",
    [["りんご", "ringo", "apple"], ["りょこう", "ryokō", "trip"]],
    [["リスト", "risuto", "list"], ["リモコン", "rimokon", "remote control"]],
  ],
  [
    "る", "ル", "ru",
    "る is a rural curl with a knot; ル is two running legs.",
    [["くる", "kuru", "to come"], ["はる", "haru", "spring"]],
    [["ルール", "rūru", "rule"], ["ルーム", "rūmu", "room"]],
  ],
  [
    "れ", "レ", "re",
    "れ has a leaning-back person; レ is an L-shaped checkmark.",
    [["れい", "rei", "zero / example"], ["れんしゅう", "renshū", "practice"]],
    [["レストラン", "resutoran", "restaurant"], ["レモン", "remon", "lemon"]],
  ],
  [
    "ろ", "ロ", "ro",
    "ろ is a road bend; ロ is a room square.",
    [["ろく", "roku", "six"], ["ろうじん", "rōjin", "elderly person"]],
    [["ロボット", "robotto", "robot"], ["ロンドン", "rondon", "London"]],
  ],
  // W-row (modern)
  [
    "わ", "ワ", "wa",
    "わ is a wave crashing; ワ is a walk-sign hat.",
    [["わたし", "watashi", "I / me"], ["わかる", "wakaru", "to understand"]],
    [["ワイン", "wain", "wine"], ["ワッフル", "waffuru", "waffle"]],
  ],
  [
    "を", "ヲ", "wo",
    "を is the object-marker particle (heard 'o' in modern speech); ヲ is rarer still.",
    [["ほんを よむ", "hon o yomu", "to read a book (object marker)"]],
    [["カタカナのヲ", "katakana no wo", "katakana ヲ — almost archaic"]],
  ],
  // Trailing N
  [
    "ん", "ン", "n",
    "ん is the trailing 'n' of 'sayonara'; ン looks like a tilted 'n'.",
    [["ほん", "hon", "book"], ["みかん", "mikan", "mandarin"]],
    [["パン", "pan", "bread"], ["レモン", "remon", "lemon"]],
  ],
];

/**
 * Voicing rules.
 *
 * Map a romaji to its dakuten + handakuten variants. Most consonants get
 * one variant; only the H-row gets both (h→b, h→p).
 */
const VOICED = {
  // K → G
  ka: { dakuten: { hira: "が", kata: "ガ", romaji: "ga" } },
  ki: { dakuten: { hira: "ぎ", kata: "ギ", romaji: "gi" } },
  ku: { dakuten: { hira: "ぐ", kata: "グ", romaji: "gu" } },
  ke: { dakuten: { hira: "げ", kata: "ゲ", romaji: "ge" } },
  ko: { dakuten: { hira: "ご", kata: "ゴ", romaji: "go" } },
  // S → Z (and shi → ji)
  sa: { dakuten: { hira: "ざ", kata: "ザ", romaji: "za" } },
  shi: { dakuten: { hira: "じ", kata: "ジ", romaji: "ji" } },
  su: { dakuten: { hira: "ず", kata: "ズ", romaji: "zu" } },
  se: { dakuten: { hira: "ぜ", kata: "ゼ", romaji: "ze" } },
  so: { dakuten: { hira: "ぞ", kata: "ゾ", romaji: "zo" } },
  // T → D (and chi → ji [usually written ぢ but rare]; tsu → zu [rare])
  ta: { dakuten: { hira: "だ", kata: "ダ", romaji: "da" } },
  chi: { dakuten: { hira: "ぢ", kata: "ヂ", romaji: "ji (rare)" } },
  tsu: { dakuten: { hira: "づ", kata: "ヅ", romaji: "zu (rare)" } },
  te: { dakuten: { hira: "で", kata: "デ", romaji: "de" } },
  to: { dakuten: { hira: "ど", kata: "ド", romaji: "do" } },
  // H → B / P
  ha: {
    dakuten: { hira: "ば", kata: "バ", romaji: "ba" },
    handakuten: { hira: "ぱ", kata: "パ", romaji: "pa" },
  },
  hi: {
    dakuten: { hira: "び", kata: "ビ", romaji: "bi" },
    handakuten: { hira: "ぴ", kata: "ピ", romaji: "pi" },
  },
  fu: {
    dakuten: { hira: "ぶ", kata: "ブ", romaji: "bu" },
    handakuten: { hira: "ぷ", kata: "プ", romaji: "pu" },
  },
  he: {
    dakuten: { hira: "べ", kata: "ベ", romaji: "be" },
    handakuten: { hira: "ぺ", kata: "ペ", romaji: "pe" },
  },
  ho: {
    dakuten: { hira: "ぼ", kata: "ボ", romaji: "bo" },
    handakuten: { hira: "ぽ", kata: "ポ", romaji: "po" },
  },
};

/** Map example tuples to the runtime examples-array shape. */
function mapExamples(rawList) {
  return (rawList ?? []).map(([word, romaji, english]) => ({
    kanji: word,
    kana: romaji,
    meaning: english,
  }));
}

function makeCard(literal, paired, romaji, mnemonic, examples, voicing, kindLabel) {
  const card = {
    kanji: literal,
    meanings: [`'${romaji}' sound`],
    on_yomi: [],
    kun_yomi: [],
    reading: literal,
    examples,
    keyword: romaji,
    etymology: mnemonic,
    stroke_count: null,
    jlpt: null,
    grade: null,
    decks: [kindLabel],
    paired_kana: paired,
  };
  if (voicing?.dakuten) {
    card.dakuten = {
      kana: kindLabel === "Hiragana" ? voicing.dakuten.hira : voicing.dakuten.kata,
      romaji: voicing.dakuten.romaji,
    };
  }
  if (voicing?.handakuten) {
    card.handakuten = {
      kana: kindLabel === "Hiragana" ? voicing.handakuten.hira : voicing.handakuten.kata,
      romaji: voicing.handakuten.romaji,
    };
  }
  return card;
}

const hiraganaCards = KANA.map(([h, k, romaji, mnemonic, hiraEx]) =>
  makeCard(h, k, romaji, mnemonic, mapExamples(hiraEx), VOICED[romaji], "Hiragana"),
);
const katakanaCards = KANA.map(([h, k, romaji, mnemonic, , kataEx]) =>
  makeCard(k, h, romaji, mnemonic, mapExamples(kataEx), VOICED[romaji], "Katakana"),
);

function writeDeck(filename, payload) {
  const path = join(OUT_DIR, filename);
  writeFileSync(path, JSON.stringify(payload, null, 2) + "\n");
  console.log(`  ${filename.padEnd(28)} ${payload.cards.length} cards`);
}

console.log("Writing kana decks → agent-files/\n");

writeDeck("kana_hiragana.json", {
  deck_id: "kana-hiragana",
  deck_name: "Hiragana (ひらがな)",
  subtitle: "Start here · the first 46 sounds of Japanese",
  version: "2.0",
  card_count: hiraganaCards.length,
  notes:
    "The full modern hiragana gojūon (五十音) — 46 characters covering every sound in modern Japanese. Each card includes: the romaji sound, an English-speaker phonetic mnemonic, the paired katakana (so you learn both syllabaries together), the dakuten/handakuten voiced variants where applicable, and 2 real example words.",
  source: "Hand-authored for Kanjido v1.",
  cards: hiraganaCards,
});

writeDeck("kana_katakana.json", {
  deck_id: "kana-katakana",
  deck_name: "Katakana (カタカナ)",
  subtitle: "Foreign words + emphasis · the angular kana",
  version: "2.0",
  card_count: katakanaCards.length,
  notes:
    "Katakana is used for loanwords, foreign names, and emphasis. Same 46-sound table as hiragana but with sharper, angular forms. Each card pairs the katakana with its hiragana counterpart, the dakuten/handakuten variants, and 2 real loanword examples (the typical katakana use case).",
  source: "Hand-authored for Kanjido v1.",
  cards: katakanaCards,
});

console.log("\n✓ Kana decks written.");
