#!/usr/bin/env node
/**
 * Build the Hiragana + Katakana starter decks.
 *
 * 46 base characters per syllabary (gojūon — the original "fifty sounds").
 * We skip the obsolete ゐ ゑ ヰ ヱ since they're not in the modern kana set,
 * and skip dakuten / handakuten / yōon variants (が, ぎゃ, etc.) for a clean
 * starter deck — those can land in a v1.1 expansion.
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
 * Gojūon table (modern). Each row is a consonant group; each entry is
 * [hiragana, katakana, romaji-sound, mnemonic].
 *
 * Mnemonics are visual / phonetic hints — the kind of "this kana looks like X"
 * trick that actually sticks. Curated for an English-speaker beginner.
 */
const KANA = [
  // Vowels
  ["あ", "ア", "a", "あ has the 'a' shape of an apple core; ア is the 'A' on its side."],
  ["い", "イ", "i", "い is two 'eels' wiggling; イ is a stripped-down 'i'."],
  ["う", "ウ", "u", "う is mouth saying 'oo'; ウ is the 'U' with a hat."],
  ["え", "エ", "e", "え looks like an exotic bird (think 'eyy'); エ is an 'E' tipped."],
  ["お", "オ", "o", "お is a person doing the 'oh!' pose; オ is an 'O' with an arrow."],
  // K
  ["か", "カ", "ka", "か is a 'ka'rate kick; カ is the same kick, sharper."],
  ["き", "キ", "ki", "き has two 'keys' on a chain; キ is one 'key' shape."],
  ["く", "ク", "ku", "く is a 'cu'-cu's beak; ク is a 'cu'rved hook."],
  ["け", "ケ", "ke", "け is a 'ke'g with a tap; ケ is a 'ke'tchup squiggle."],
  ["こ", "コ", "ko", "こ is two 'co'ins stacked; コ is a 'co'rner bracket."],
  // S
  ["さ", "サ", "sa", "さ has a 'sa'mba dancer's hip-swing; サ has three 'sa'sa swords."],
  ["し", "シ", "shi", "し is a 'shi'p hook; シ has three 'shi'mmer marks."],
  ["す", "ス", "su", "す is a 'su'shi roll on a stick; ス is a 'su'iss-army knife."],
  ["せ", "セ", "se", "せ is the number 'se'ven (7) with a stroke; セ is also '7'-like."],
  ["そ", "ソ", "so", "そ is 'so' written quickly; ソ has two 'so'rry tear-drops."],
  // T
  ["た", "タ", "ta", "た is 'ta' for tower (looks like a flag); タ is a 'ta'lon shape."],
  ["ち", "チ", "chi", "ち is a 'chee'rio shape; チ is a 'chi'-square mark."],
  ["つ", "ツ", "tsu", "つ is a 'tsu'nami curl; ツ is the 'tsu'rprised face (smile)."],
  ["て", "テ", "te", "て has a 'te'lephone receiver shape; テ is a 'te' antenna."],
  ["と", "ト", "to", "と is a 'to'ed shoe and pin; ト is a 'to'rch."],
  // N
  ["な", "ナ", "na", "な is 'na'noma, looks like a kitten; ナ is a 'na'il cross."],
  ["に", "ニ", "ni", "に is two 'ni'kel coins side by side; ニ is just two lines (2 = ni)."],
  ["ぬ", "ヌ", "nu", "ぬ is a 'nu'dle bowl with chopsticks; ヌ is a 'nu'-deer sketch."],
  ["ね", "ネ", "ne", "ね has a cat's tail ('ne'ko = cat); ネ has a small cat shape."],
  ["の", "ノ", "no", "の is a 'no' entry sign; ノ is a single 'no' slash."],
  // H
  ["は", "ハ", "ha", "は is a 'ha'-haha laugh shape; ハ is two 'ha'ha lines."],
  ["ひ", "ヒ", "hi", "ひ is a smile saying 'hee'; ヒ is a 'hi' chair."],
  ["ふ", "フ", "fu", "ふ is Mt 'Fu'ji's silhouette; フ is the same hill simplified."],
  ["へ", "ヘ", "he", "へ is a small 'he'lmet curve; ヘ is the same curve."],
  ["ほ", "ホ", "ho", "ほ is a 'ho'me with a cross; ホ is a 'ho'spital cross."],
  // M
  ["ま", "マ", "ma", "ま is 'ma'mba snake coiled; マ is a 'ma'rk."],
  ["み", "ミ", "mi", "み is a 'mi'-mi (21) snake; ミ is three 'mi'mes' lines."],
  ["む", "ム", "mu", "む is a 'mu'cow with horns; ム is a 'mu'le's ear."],
  ["め", "メ", "me", "め is an 'me'-eye (an eye); メ is a 'me' X mark."],
  ["も", "モ", "mo", "も is a 'mo'ther fish hook; モ is a 'mo'p stand."],
  // Y (only 3 in gojūon)
  ["や", "ヤ", "ya", "や is a 'ya'cht with anchor; ヤ is a 'ya'rd-stick."],
  ["ゆ", "ユ", "yu", "ゆ is a 'yu'-shaped fish; ユ is a 'yu' bracket."],
  ["よ", "ヨ", "yo", "よ is a 'yo'-yo on a string; ヨ is a 'yo' with three teeth."],
  // R (English speakers hear 'l/r' — Japanese is between)
  ["ら", "ラ", "ra", "ら is a 'ra'bbit ear; ラ is a 'ra'cing helmet."],
  ["り", "リ", "ri", "り is two 'ri'ng-pull tabs; リ is two 'ri'ver lines."],
  ["る", "ル", "ru", "る is a 'ru'-rural curl with a knot; ル is two 'ru'nning legs."],
  ["れ", "レ", "re", "れ has a 'le'aning-back person; レ is an 'L'-shaped checkmark."],
  ["ろ", "ロ", "ro", "ろ is a 'ro'ad bend; ロ is a 'ro'om square."],
  // W (only 2 in modern use)
  ["わ", "ワ", "wa", "わ is a 'wa've crashing; ワ is a 'wa'lk-sign hat."],
  ["を", "ヲ", "wo/o", "を is the object-marker particle (rare otherwise); ヲ is rarer still."],
  // N (special — only consonant that ends a syllable on its own)
  ["ん", "ン", "n", "ん is the trailing-'n' of 'sayonara'; ン looks like a tilted 'n'."],
];

function makeCard(literal, reading, romaji, mnemonic, kind) {
  return {
    kanji: literal, // progress key; runtime treats the field uniformly
    meanings: [`'${romaji}' sound`],
    on_yomi: [],
    kun_yomi: [],
    reading: literal, // the character is its own reading
    examples: [],
    keyword: romaji,
    etymology: mnemonic,
    stroke_count: null,
    jlpt: null,
    grade: null,
    decks: [kind === "hiragana" ? "Hiragana" : "Katakana"],
  };
}

const hiraganaCards = KANA.map(([h, _k, romaji, mnemonic]) =>
  makeCard(h, h, romaji, mnemonic, "hiragana"),
);
const katakanaCards = KANA.map(([_h, k, romaji, mnemonic]) =>
  makeCard(k, k, romaji, mnemonic, "katakana"),
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
  version: "1.0",
  card_count: hiraganaCards.length,
  notes:
    "The full modern hiragana gojūon (五十音) — 46 characters covering every sound in modern Japanese. Mnemonics are English-speaker phonetic hints.",
  source: "Hand-authored for Kanjido v1.",
  cards: hiraganaCards,
});

writeDeck("kana_katakana.json", {
  deck_id: "kana-katakana",
  deck_name: "Katakana (カタカナ)",
  subtitle: "Foreign words + emphasis · the angular kana",
  version: "1.0",
  card_count: katakanaCards.length,
  notes:
    "Katakana is used for loanwords, foreign names, and emphasis. Same 46-sound table as hiragana but with sharper, angular forms.",
  source: "Hand-authored for Kanjido v1.",
  cards: katakanaCards,
});

console.log("\n✓ Kana decks written.");
