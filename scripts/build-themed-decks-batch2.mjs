#!/usr/bin/env node
/**
 * Second batch of hand-authored themed vocab decks for Kanjido.
 *
 * All content is original or factual common-knowledge Japanese vocabulary
 * — no textbook reproduction.
 *
 * Output:
 *   agent-files/vocab_food.json        (Pro)
 *   agent-files/vocab_verbs.json       (Pro)
 *   agent-files/vocab_adjectives.json  (Pro)
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(dirname(HERE), "agent-files");
mkdirSync(OUT_DIR, { recursive: true });

function vc({ word, reading, meanings, jlpt, category, context, ex }) {
  return {
    word,
    reading,
    meanings,
    jlpt,
    category: category ?? "",
    context: context ?? "",
    example_sentence: ex?.jp ?? "",
    example_reading: ex?.kana ?? "",
    example_meaning: ex?.en ?? "",
  };
}

// ============================================================
// Food
// ============================================================

const food = [
  // Staples
  vc({
    word: "ご飯",
    reading: "ごはん",
    meanings: ["cooked rice", "meal"],
    jlpt: "N5",
    category: "staples",
    context:
      "Means both 'cooked rice' and 'meal' — 朝ご飯 = breakfast, 昼ご飯 = lunch, 晩ご飯 = dinner.",
  }),
  vc({
    word: "パン",
    reading: "パン",
    meanings: ["bread"],
    jlpt: "N5",
    category: "staples",
    context: "Loanword from Portuguese 'pão' — predates the English 'bread' loan.",
  }),
  vc({
    word: "麺",
    reading: "めん",
    meanings: ["noodles"],
    jlpt: "N3",
    category: "staples",
    context: "Generic word; specific kinds are ラーメン, うどん, そば, パスタ.",
  }),
  vc({
    word: "肉",
    reading: "にく",
    meanings: ["meat"],
    jlpt: "N5",
    category: "staples",
    context: "Compounds: 牛肉 ぎゅうにく (beef), 豚肉 ぶたにく (pork), 鶏肉 とりにく (chicken).",
  }),
  vc({
    word: "魚",
    reading: "さかな",
    meanings: ["fish"],
    jlpt: "N5",
    category: "staples",
  }),
  vc({
    word: "卵",
    reading: "たまご",
    meanings: ["egg"],
    jlpt: "N5",
    category: "staples",
  }),
  vc({
    word: "豆腐",
    reading: "とうふ",
    meanings: ["tofu"],
    jlpt: "N4",
    category: "staples",
  }),
  vc({
    word: "野菜",
    reading: "やさい",
    meanings: ["vegetables"],
    jlpt: "N5",
    category: "produce",
  }),
  vc({
    word: "果物",
    reading: "くだもの",
    meanings: ["fruit"],
    jlpt: "N5",
    category: "produce",
    context: "Irregular reading — don't try to sound it out from the kanji.",
  }),
  // Specific produce
  vc({
    word: "りんご",
    reading: "りんご",
    meanings: ["apple"],
    jlpt: "N5",
    category: "produce",
    context: "Often written 林檎 in formal contexts but everyone uses hiragana day-to-day.",
  }),
  vc({
    word: "みかん",
    reading: "みかん",
    meanings: ["mandarin orange", "tangerine"],
    jlpt: "N5",
    category: "produce",
  }),
  vc({
    word: "いちご",
    reading: "いちご",
    meanings: ["strawberry"],
    jlpt: "N4",
    category: "produce",
  }),
  vc({
    word: "ねぎ",
    reading: "ねぎ",
    meanings: ["green onion", "leek"],
    jlpt: "N3",
    category: "produce",
  }),
  // Drinks
  vc({
    word: "水",
    reading: "みず",
    meanings: ["water"],
    jlpt: "N5",
    category: "drinks",
    context: "Specifically cold water — hot water is お湯 (おゆ).",
  }),
  vc({
    word: "お茶",
    reading: "おちゃ",
    meanings: ["tea"],
    jlpt: "N5",
    category: "drinks",
    context: "The honorific お is conventional; you'd rarely say just 茶 for the drink.",
  }),
  vc({
    word: "コーヒー",
    reading: "コーヒー",
    meanings: ["coffee"],
    jlpt: "N5",
    category: "drinks",
  }),
  vc({
    word: "牛乳",
    reading: "ぎゅうにゅう",
    meanings: ["milk"],
    jlpt: "N4",
    category: "drinks",
    context: "Lit. 'cow + milk'. Casual word: ミルク (often for the white-coffee variety).",
  }),
  vc({
    word: "ビール",
    reading: "ビール",
    meanings: ["beer"],
    jlpt: "N5",
    category: "drinks",
  }),
  vc({
    word: "酒",
    reading: "さけ / お酒",
    meanings: ["alcohol", "rice wine"],
    jlpt: "N5",
    category: "drinks",
    context:
      "お酒 (おさけ) is the everyday word for alcohol generally. Bare 酒 is more poetic/classical.",
  }),
  // Dishes & meal types
  vc({
    word: "寿司",
    reading: "すし",
    meanings: ["sushi"],
    jlpt: "N4",
    category: "dishes",
    context: "Often written お寿司 (おすし) in polite speech.",
  }),
  vc({
    word: "ラーメン",
    reading: "ラーメン",
    meanings: ["ramen"],
    jlpt: "N5",
    category: "dishes",
  }),
  vc({
    word: "天ぷら",
    reading: "てんぷら",
    meanings: ["tempura"],
    jlpt: "N4",
    category: "dishes",
    context: "Loanword from 16th-century Portuguese; the kanji 天婦羅 are used decoratively.",
  }),
  vc({
    word: "弁当",
    reading: "べんとう",
    meanings: ["bento", "boxed lunch"],
    jlpt: "N4",
    category: "dishes",
  }),
  // Taste & condiments
  vc({
    word: "塩",
    reading: "しお",
    meanings: ["salt"],
    jlpt: "N4",
    category: "condiments",
  }),
  vc({
    word: "砂糖",
    reading: "さとう",
    meanings: ["sugar"],
    jlpt: "N4",
    category: "condiments",
  }),
  vc({
    word: "醤油",
    reading: "しょうゆ",
    meanings: ["soy sauce"],
    jlpt: "N3",
    category: "condiments",
    context: "Often written しょう油 in casual signage.",
  }),
  vc({
    word: "味噌",
    reading: "みそ",
    meanings: ["miso (fermented soybean paste)"],
    jlpt: "N3",
    category: "condiments",
    context: "味噌汁 (みそしる) = miso soup.",
  }),
];

// ============================================================
// Common verbs
// ============================================================

const verbs = [
  // Existence + identity
  vc({
    word: "ある",
    reading: "ある",
    meanings: ["to exist (inanimate)", "to have"],
    jlpt: "N5",
    category: "essentials",
    context:
      "Use for things that don't move: books, money, problems. Animate things use いる. Negative: ない.",
    ex: {
      jp: "本があります。",
      kana: "ほん が あります。",
      en: "There is a book. / I have a book.",
    },
  }),
  vc({
    word: "いる",
    reading: "いる",
    meanings: ["to exist (animate)", "to be (somewhere)"],
    jlpt: "N5",
    category: "essentials",
    context: "Counterpart to ある — for people and animals.",
  }),
  vc({
    word: "する",
    reading: "する",
    meanings: ["to do"],
    jlpt: "N5",
    category: "essentials",
    context:
      "Forms compound verbs with nouns: 勉強する (study), 運動する (exercise), 結婚する (marry).",
  }),
  // Movement
  vc({
    word: "行く",
    reading: "いく",
    meanings: ["to go"],
    jlpt: "N5",
    category: "movement",
    context: "Irregular: 行きます (not いきます from the te-form pattern), 行って (not いって).",
  }),
  vc({
    word: "来る",
    reading: "くる",
    meanings: ["to come"],
    jlpt: "N5",
    category: "movement",
    context:
      "Irregular conjugation: 来ます きます, 来た きた, 来て きて, 来ない こない. Memorize the readings.",
  }),
  vc({
    word: "帰る",
    reading: "かえる",
    meanings: ["to return home", "to go back"],
    jlpt: "N5",
    category: "movement",
    context: "Looks like a -ru verb but conjugates as -u verb. 帰ります (not 帰えます).",
  }),
  vc({
    word: "歩く",
    reading: "あるく",
    meanings: ["to walk"],
    jlpt: "N5",
    category: "movement",
  }),
  vc({
    word: "走る",
    reading: "はしる",
    meanings: ["to run"],
    jlpt: "N5",
    category: "movement",
    context: "Another -ru-looking-but-actually-u verb.",
  }),
  // Daily-life
  vc({
    word: "食べる",
    reading: "たべる",
    meanings: ["to eat"],
    jlpt: "N5",
    category: "daily",
    ex: {
      jp: "朝ご飯を食べました。",
      kana: "あさごはん を たべました。",
      en: "I ate breakfast.",
    },
  }),
  vc({
    word: "飲む",
    reading: "のむ",
    meanings: ["to drink"],
    jlpt: "N5",
    category: "daily",
    context: "Also used for taking medicine: 薬を飲む.",
  }),
  vc({
    word: "見る",
    reading: "みる",
    meanings: ["to see", "to watch", "to look at"],
    jlpt: "N5",
    category: "daily",
  }),
  vc({
    word: "聞く",
    reading: "きく",
    meanings: ["to hear", "to listen", "to ask"],
    jlpt: "N5",
    category: "daily",
    context: "Same word for 'listen' and 'ask' — context disambiguates.",
  }),
  vc({
    word: "話す",
    reading: "はなす",
    meanings: ["to speak", "to talk"],
    jlpt: "N5",
    category: "daily",
  }),
  vc({
    word: "読む",
    reading: "よむ",
    meanings: ["to read"],
    jlpt: "N5",
    category: "daily",
  }),
  vc({
    word: "書く",
    reading: "かく",
    meanings: ["to write"],
    jlpt: "N5",
    category: "daily",
  }),
  vc({
    word: "買う",
    reading: "かう",
    meanings: ["to buy"],
    jlpt: "N5",
    category: "daily",
  }),
  vc({
    word: "売る",
    reading: "うる",
    meanings: ["to sell"],
    jlpt: "N4",
    category: "daily",
  }),
  vc({
    word: "作る",
    reading: "つくる",
    meanings: ["to make"],
    jlpt: "N5",
    category: "daily",
  }),
  // Mental
  vc({
    word: "思う",
    reading: "おもう",
    meanings: ["to think", "to feel"],
    jlpt: "N5",
    category: "mental",
    context:
      "Used for opinions and immediate feelings: ～と思う = 'I think that ～'. Compare 考える.",
  }),
  vc({
    word: "考える",
    reading: "かんがえる",
    meanings: ["to think (about)", "to consider"],
    jlpt: "N4",
    category: "mental",
    context: "More deliberate / analytical than 思う. Use for decisions and reasoning.",
  }),
  vc({
    word: "知る",
    reading: "しる",
    meanings: ["to know", "to learn of"],
    jlpt: "N4",
    category: "mental",
    context:
      "Rarely used in plain present — affirmative is almost always 知っている (know currently). 知らない = don't know is the most-used form.",
  }),
  vc({
    word: "分かる",
    reading: "わかる",
    meanings: ["to understand", "to know"],
    jlpt: "N5",
    category: "mental",
    context:
      "Takes が, not を. Subtle difference from 知る: 分かる = comprehend, 知る = be aware of.",
  }),
  // Other essentials
  vc({
    word: "持つ",
    reading: "もつ",
    meanings: ["to hold", "to have", "to own"],
    jlpt: "N5",
    category: "daily",
    context: "Like 'hold' in English: physically + 'I have a meeting'.",
  }),
  vc({
    word: "待つ",
    reading: "まつ",
    meanings: ["to wait"],
    jlpt: "N5",
    category: "daily",
  }),
  vc({
    word: "立つ",
    reading: "たつ",
    meanings: ["to stand"],
    jlpt: "N5",
    category: "daily",
  }),
  vc({
    word: "座る",
    reading: "すわる",
    meanings: ["to sit"],
    jlpt: "N4",
    category: "daily",
  }),
  vc({
    word: "寝る",
    reading: "ねる",
    meanings: ["to sleep", "to lie down"],
    jlpt: "N5",
    category: "daily",
  }),
  vc({
    word: "起きる",
    reading: "おきる",
    meanings: ["to wake up", "to get up"],
    jlpt: "N5",
    category: "daily",
  }),
  vc({
    word: "勉強する",
    reading: "べんきょうする",
    meanings: ["to study"],
    jlpt: "N5",
    category: "daily",
    context: "Compound する verb: 勉強 (study, noun) + する (do).",
  }),
  vc({
    word: "働く",
    reading: "はたらく",
    meanings: ["to work"],
    jlpt: "N5",
    category: "daily",
  }),
];

// ============================================================
// Common adjectives
// ============================================================

const adjectives = [
  // Size + amount
  vc({
    word: "大きい",
    reading: "おおきい",
    meanings: ["big", "large"],
    jlpt: "N5",
    category: "size",
    context: "い-adjective. Negative: 大きくない.",
  }),
  vc({
    word: "小さい",
    reading: "ちいさい",
    meanings: ["small", "little"],
    jlpt: "N5",
    category: "size",
  }),
  vc({
    word: "高い",
    reading: "たかい",
    meanings: ["tall", "high", "expensive"],
    jlpt: "N5",
    category: "size",
    context: "Same word for 'tall', 'high', and 'expensive' — context disambiguates.",
  }),
  vc({
    word: "低い",
    reading: "ひくい",
    meanings: ["low", "short (height)"],
    jlpt: "N4",
    category: "size",
    context: "For people: 背が低い (short stature). 低い is the height-only opposite of 高い.",
  }),
  vc({
    word: "長い",
    reading: "ながい",
    meanings: ["long"],
    jlpt: "N5",
    category: "size",
    context: "Both for length and duration: 長い手紙 (long letter), 長い時間 (long time).",
  }),
  vc({
    word: "短い",
    reading: "みじかい",
    meanings: ["short (length)", "brief"],
    jlpt: "N5",
    category: "size",
  }),
  vc({
    word: "多い",
    reading: "おおい",
    meanings: ["many", "numerous"],
    jlpt: "N5",
    category: "amount",
    context: "Cannot precede a noun directly — say 人が多い (there are many people), not 多い人.",
  }),
  vc({
    word: "少ない",
    reading: "すくない",
    meanings: ["few", "scarce"],
    jlpt: "N5",
    category: "amount",
  }),
  // Quality
  vc({
    word: "いい / 良い",
    reading: "いい / よい",
    meanings: ["good"],
    jlpt: "N5",
    category: "quality",
    context:
      "Irregular conjugation — past is よかった (not いかった), te-form is よくて. Use 良い in writing, いい in speech.",
  }),
  vc({
    word: "悪い",
    reading: "わるい",
    meanings: ["bad"],
    jlpt: "N5",
    category: "quality",
    context: "Also informal apology: 悪い、悪い! (My bad, sorry).",
  }),
  vc({
    word: "新しい",
    reading: "あたらしい",
    meanings: ["new"],
    jlpt: "N5",
    category: "quality",
  }),
  vc({
    word: "古い",
    reading: "ふるい",
    meanings: ["old (of objects)"],
    jlpt: "N5",
    category: "quality",
    context:
      "For things, not people. For age of people: 年上 (older), 年寄り (elderly). Saying ふるい about a person is rude.",
  }),
  vc({
    word: "難しい",
    reading: "むずかしい",
    meanings: ["difficult"],
    jlpt: "N5",
    category: "quality",
  }),
  vc({
    word: "易しい",
    reading: "やさしい",
    meanings: ["easy", "simple"],
    jlpt: "N5",
    category: "quality",
    context:
      "Same reading as 優しい (kind/gentle, the other やさしい) — written form distinguishes. 易しい = easy, 優しい = kind.",
  }),
  // Speed / pace
  vc({
    word: "速い",
    reading: "はやい",
    meanings: ["fast", "quick (speed)"],
    jlpt: "N4",
    category: "pace",
    context: "Same reading as 早い (early in time). 速い = velocity, 早い = timing.",
  }),
  vc({
    word: "遅い",
    reading: "おそい",
    meanings: ["slow", "late"],
    jlpt: "N5",
    category: "pace",
  }),
  // Temperature
  vc({
    word: "暑い",
    reading: "あつい",
    meanings: ["hot (weather)"],
    jlpt: "N5",
    category: "temperature",
    context:
      "Three different homophones of あつい: 暑い (weather), 熱い (object), 厚い (thick). Pick the right one.",
  }),
  vc({
    word: "寒い",
    reading: "さむい",
    meanings: ["cold (weather)"],
    jlpt: "N5",
    category: "temperature",
    context: "For weather only. Cold-to-the-touch objects use 冷たい (つめたい).",
  }),
  vc({
    word: "暖かい",
    reading: "あたたかい",
    meanings: ["warm (weather)"],
    jlpt: "N5",
    category: "temperature",
    context: "Sometimes shortened to あったかい in casual speech. Object/food version: 温かい.",
  }),
  vc({
    word: "涼しい",
    reading: "すずしい",
    meanings: ["cool (pleasantly cold)"],
    jlpt: "N4",
    category: "temperature",
    context: "Pleasantly cool — autumn weather. Cold-cold is 寒い.",
  }),
  // Emotion
  vc({
    word: "嬉しい",
    reading: "うれしい",
    meanings: ["happy", "glad"],
    jlpt: "N4",
    category: "emotion",
    context:
      "Use for your own happy reaction to a specific event. For a continuous 'happy person' state, use 楽しい (fun) or 幸せ (na-adj, fortunate).",
  }),
  vc({
    word: "悲しい",
    reading: "かなしい",
    meanings: ["sad"],
    jlpt: "N5",
    category: "emotion",
  }),
  vc({
    word: "楽しい",
    reading: "たのしい",
    meanings: ["fun", "enjoyable"],
    jlpt: "N5",
    category: "emotion",
  }),
  vc({
    word: "怖い",
    reading: "こわい",
    meanings: ["scary", "frightening"],
    jlpt: "N4",
    category: "emotion",
  }),
  // Common na-adjectives
  vc({
    word: "好き",
    reading: "すき",
    meanings: ["liked", "favorite"],
    jlpt: "N5",
    category: "na-adjectives",
    context:
      "な-adjective, takes が: 寿司が好きです = I like sushi. To attribute to a noun: 好きな食べ物 = favorite food.",
  }),
  vc({
    word: "嫌い",
    reading: "きらい",
    meanings: ["disliked", "hated"],
    jlpt: "N5",
    category: "na-adjectives",
    context:
      "な-adjective even though it ends in い. Don't conjugate it like an い-adjective.",
  }),
  vc({
    word: "上手",
    reading: "じょうず",
    meanings: ["skilled", "good at"],
    jlpt: "N5",
    category: "na-adjectives",
    context:
      "な-adjective. Generally used about others' skill, not your own (humility). For your own: 得意 (とくい).",
  }),
  vc({
    word: "下手",
    reading: "へた",
    meanings: ["bad at", "unskilled"],
    jlpt: "N5",
    category: "na-adjectives",
  }),
  vc({
    word: "便利",
    reading: "べんり",
    meanings: ["convenient", "useful"],
    jlpt: "N5",
    category: "na-adjectives",
  }),
  vc({
    word: "静か",
    reading: "しずか",
    meanings: ["quiet"],
    jlpt: "N5",
    category: "na-adjectives",
  }),
  vc({
    word: "賑やか",
    reading: "にぎやか",
    meanings: ["lively", "bustling"],
    jlpt: "N5",
    category: "na-adjectives",
    context: "The classic dictionary opposite of 静か. Used for places, parties, scenes.",
  }),
  vc({
    word: "綺麗",
    reading: "きれい",
    meanings: ["beautiful", "clean"],
    jlpt: "N5",
    category: "na-adjectives",
    context:
      "な-adjective. Means both 'beautiful' and 'clean' — useful for both compliments and tidiness.",
  }),
];

// ============================================================
// Emit decks
// ============================================================

const decks = [
  {
    file: "vocab_food.json",
    deck_id: "vocab-food",
    deck_name: "Food (食べ物)",
    subtitle: "Staples · drinks · dishes · condiments — eating in Japanese",
    notes:
      "Japanese food vocabulary you'll use at restaurants, in conversations, or buying groceries.",
    cards: food,
  },
  {
    file: "vocab_verbs.json",
    deck_id: "vocab-verbs",
    deck_name: "Common verbs (動詞)",
    subtitle: "Eat, go, see, think · the verbs you'll use every day",
    notes:
      "30 of the most-used Japanese verbs covering existence, movement, daily life, and mental actions. Notes the irregulars (来る, 行く, 帰る, 知る) and the disambiguations (思う vs 考える, 知る vs 分かる).",
    cards: verbs,
  },
  {
    file: "vocab_adjectives.json",
    deck_id: "vocab-adjectives",
    deck_name: "Common adjectives (形容詞)",
    subtitle: "Big, small, hot, cold · describing the world",
    notes:
      "Both い-adjectives and な-adjectives, organized by what they describe (size, quality, temperature, emotion). Calls out the famous traps: 暑い/熱い/厚い (all あつい), 速い vs 早い, 易しい vs 優しい.",
    cards: adjectives,
  },
];

console.log("Writing batch-2 themed vocab decks → agent-files/\n");
for (const d of decks) {
  const payload = {
    deck_id: d.deck_id,
    deck_name: d.deck_name,
    subtitle: d.subtitle,
    version: "1.0",
    card_count: d.cards.length,
    notes: d.notes,
    source: "Hand-authored for Kanjido v1 (factual common-knowledge Japanese vocabulary).",
    cards: d.cards,
  };
  writeFileSync(join(OUT_DIR, d.file), JSON.stringify(payload, null, 2) + "\n");
  console.log(`  ${d.file.padEnd(28)} ${d.cards.length.toString().padStart(3)} cards · ${d.subtitle}`);
}
console.log("\n✓ Batch-2 themed vocab decks written.");
