#!/usr/bin/env node
/**
 * Build hand-authored themed vocab decks for Kanjido.
 *
 * All content is original (written by the Kanjido team) or factual
 * common-knowledge Japanese vocabulary. No textbook or third-party content
 * is reproduced. Counter usage and example sentences are simple constructions
 * any beginner-Japanese textbook would teach.
 *
 * Output:
 *   agent-files/vocab_numbers.json    (free)
 *   agent-files/vocab_time.json       (free)
 *   agent-files/vocab_counters.json   (Pro)
 *   agent-files/vocab_body.json       (Pro)
 *   agent-files/vocab_family.json     (Pro)
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(dirname(HERE), "agent-files");
mkdirSync(OUT_DIR, { recursive: true });

/** Build a vocab card record. */
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
// Numbers
// ============================================================

const numbers = [
  vc({
    word: "一",
    reading: "いち",
    meanings: ["one"],
    jlpt: "N5",
    category: "numerals",
    context: "Standalone reading. In compounds, often shifts to いっ (e.g. 一緒 いっしょ together).",
  }),
  vc({
    word: "二",
    reading: "に",
    meanings: ["two"],
    jlpt: "N5",
    category: "numerals",
  }),
  vc({
    word: "三",
    reading: "さん",
    meanings: ["three"],
    jlpt: "N5",
    category: "numerals",
  }),
  vc({
    word: "四",
    reading: "よん / し",
    meanings: ["four"],
    jlpt: "N5",
    category: "numerals",
    context:
      "Two readings: よん (yon, native) and し (shi, Sino). し sounds like the word for death (死), so よん is preferred in casual speech.",
  }),
  vc({
    word: "五",
    reading: "ご",
    meanings: ["five"],
    jlpt: "N5",
    category: "numerals",
  }),
  vc({
    word: "六",
    reading: "ろく",
    meanings: ["six"],
    jlpt: "N5",
    category: "numerals",
  }),
  vc({
    word: "七",
    reading: "なな / しち",
    meanings: ["seven"],
    jlpt: "N5",
    category: "numerals",
    context: "なな is more common in everyday counting; しち appears in some compounds (七月 = July).",
  }),
  vc({
    word: "八",
    reading: "はち",
    meanings: ["eight"],
    jlpt: "N5",
    category: "numerals",
  }),
  vc({
    word: "九",
    reading: "きゅう / く",
    meanings: ["nine"],
    jlpt: "N5",
    category: "numerals",
    context: "きゅう for general counting; く in fixed compounds like 九月 (September).",
  }),
  vc({
    word: "十",
    reading: "じゅう",
    meanings: ["ten"],
    jlpt: "N5",
    category: "numerals",
  }),
  vc({
    word: "百",
    reading: "ひゃく",
    meanings: ["hundred"],
    jlpt: "N5",
    category: "numerals",
    context: "Sound-changes in compounds: 三百 さんびゃく, 六百 ろっぴゃく, 八百 はっぴゃく.",
  }),
  vc({
    word: "千",
    reading: "せん",
    meanings: ["thousand"],
    jlpt: "N5",
    category: "numerals",
    context: "三千 さんぜん (3000), 八千 はっせん (8000) take rendaku/sokuon.",
  }),
  vc({
    word: "万",
    reading: "まん",
    meanings: ["ten thousand"],
    jlpt: "N5",
    category: "numerals",
    context:
      "Japanese counts in units of 10,000 — 100,000 is 十万 (jūman, lit. ten ten-thousands), one million is 百万 (hyakuman).",
  }),
  vc({
    word: "億",
    reading: "おく",
    meanings: ["hundred million"],
    jlpt: "N3",
    category: "numerals",
    context: "Larger than 万. 一億 = 100,000,000.",
  }),
  vc({
    word: "零",
    reading: "ゼロ / れい",
    meanings: ["zero"],
    jlpt: "N3",
    category: "numerals",
    context:
      "ゼロ is far more common in everyday speech; れい appears in formal contexts (零下 れいか = below zero).",
  }),
  vc({
    word: "半",
    reading: "はん",
    meanings: ["half"],
    jlpt: "N5",
    category: "numerals",
    context: "Common with time: 三時半 さんじはん = 3:30.",
  }),
  vc({
    word: "数",
    reading: "かず / すう",
    meanings: ["number", "count"],
    jlpt: "N3",
    category: "numerals",
    context: "Reading varies: かず = a count of things; すう appears in compounds (数学 = mathematics).",
  }),
  vc({
    word: "番号",
    reading: "ばんごう",
    meanings: ["number", "ID number"],
    jlpt: "N4",
    category: "numerals",
    context: "Used for phone numbers, room numbers, ID numbers — anything sequential.",
    ex: {
      jp: "電話番号を教えてください。",
      kana: "でんわ ばんごう を おしえて ください。",
      en: "Please tell me your phone number.",
    },
  }),
  vc({
    word: "番",
    reading: "ばん",
    meanings: ["number (in a series)", "turn"],
    jlpt: "N5",
    category: "numerals",
    context:
      "Counter for ordering: 一番 いちばん (number one / the first), 二番 にばん (second), and so on.",
    ex: {
      jp: "私の番です。",
      kana: "わたし の ばん です。",
      en: "It's my turn.",
    },
  }),
  vc({
    word: "倍",
    reading: "ばい",
    meanings: ["times (multiplier)", "double"],
    jlpt: "N3",
    category: "numerals",
    context: "二倍 にばい = twice / double; 三倍 さんばい = triple.",
  }),
];

// ============================================================
// Time, Days, Months
// ============================================================

const time = [
  // Days of the week (lit. "X-day")
  vc({
    word: "月曜日",
    reading: "げつようび",
    meanings: ["Monday"],
    jlpt: "N5",
    category: "days",
    context: "月 = moon. Days of the week are named after celestial bodies + elements (same as English).",
  }),
  vc({
    word: "火曜日",
    reading: "かようび",
    meanings: ["Tuesday"],
    jlpt: "N5",
    category: "days",
    context: "火 = fire (Mars).",
  }),
  vc({
    word: "水曜日",
    reading: "すいようび",
    meanings: ["Wednesday"],
    jlpt: "N5",
    category: "days",
    context: "水 = water (Mercury).",
  }),
  vc({
    word: "木曜日",
    reading: "もくようび",
    meanings: ["Thursday"],
    jlpt: "N5",
    category: "days",
    context: "木 = wood (Jupiter).",
  }),
  vc({
    word: "金曜日",
    reading: "きんようび",
    meanings: ["Friday"],
    jlpt: "N5",
    category: "days",
    context: "金 = gold/metal (Venus).",
  }),
  vc({
    word: "土曜日",
    reading: "どようび",
    meanings: ["Saturday"],
    jlpt: "N5",
    category: "days",
    context: "土 = earth (Saturn).",
  }),
  vc({
    word: "日曜日",
    reading: "にちようび",
    meanings: ["Sunday"],
    jlpt: "N5",
    category: "days",
    context: "日 = sun.",
  }),
  // Time of day
  vc({
    word: "朝",
    reading: "あさ",
    meanings: ["morning"],
    jlpt: "N5",
    category: "time-of-day",
    ex: {
      jp: "朝ご飯を食べました。",
      kana: "あさ ごはん を たべました。",
      en: "I ate breakfast.",
    },
  }),
  vc({
    word: "昼",
    reading: "ひる",
    meanings: ["noon", "daytime"],
    jlpt: "N4",
    category: "time-of-day",
    ex: {
      jp: "昼ご飯はラーメンでした。",
      kana: "ひる ごはん は らーめん でした。",
      en: "Lunch was ramen.",
    },
  }),
  vc({
    word: "夕方",
    reading: "ゆうがた",
    meanings: ["evening", "early evening"],
    jlpt: "N4",
    category: "time-of-day",
    context: "Roughly the late afternoon to dusk window — softer than 夜 (night).",
  }),
  vc({
    word: "夜",
    reading: "よる",
    meanings: ["night"],
    jlpt: "N5",
    category: "time-of-day",
  }),
  vc({
    word: "午前",
    reading: "ごぜん",
    meanings: ["a.m.", "morning"],
    jlpt: "N5",
    category: "time-of-day",
    context: "Used for clock times: 午前八時 = 8 a.m.",
  }),
  vc({
    word: "午後",
    reading: "ごご",
    meanings: ["p.m.", "afternoon"],
    jlpt: "N5",
    category: "time-of-day",
    context: "Used for clock times: 午後三時 = 3 p.m.",
  }),
  // Today / yesterday / tomorrow / etc.
  vc({
    word: "今日",
    reading: "きょう",
    meanings: ["today"],
    jlpt: "N5",
    category: "relative-time",
    context: "Irregular reading — don't try to break it down phonetically.",
  }),
  vc({
    word: "昨日",
    reading: "きのう",
    meanings: ["yesterday"],
    jlpt: "N5",
    category: "relative-time",
    context: "Also irregular reading; the sino reading さくじつ is used in formal/written contexts.",
  }),
  vc({
    word: "明日",
    reading: "あした / あす",
    meanings: ["tomorrow"],
    jlpt: "N5",
    category: "relative-time",
    context: "Both readings are common; あした is more conversational, あす slightly more formal.",
  }),
  vc({
    word: "今",
    reading: "いま",
    meanings: ["now"],
    jlpt: "N5",
    category: "relative-time",
  }),
  vc({
    word: "毎日",
    reading: "まいにち",
    meanings: ["every day", "daily"],
    jlpt: "N5",
    category: "relative-time",
    ex: {
      jp: "毎日勉強しています。",
      kana: "まいにち べんきょう して います。",
      en: "I study every day.",
    },
  }),
  vc({
    word: "週末",
    reading: "しゅうまつ",
    meanings: ["weekend"],
    jlpt: "N4",
    category: "relative-time",
  }),
  // Months — pattern: 〜月 = "〜-month"
  vc({
    word: "一月",
    reading: "いちがつ",
    meanings: ["January"],
    jlpt: "N5",
    category: "months",
    context: "Months are just (number) + 月 (month). 月 is read がつ here.",
  }),
  vc({
    word: "四月",
    reading: "しがつ",
    meanings: ["April"],
    jlpt: "N5",
    category: "months",
    context: "Note し instead of よん — months use the Sino reading.",
  }),
  vc({
    word: "七月",
    reading: "しちがつ",
    meanings: ["July"],
    jlpt: "N5",
    category: "months",
    context: "Note しち (not なな) — months use the Sino reading.",
  }),
  vc({
    word: "九月",
    reading: "くがつ",
    meanings: ["September"],
    jlpt: "N5",
    category: "months",
    context: "Note く (not きゅう) — months use the Sino reading.",
  }),
  vc({
    word: "時間",
    reading: "じかん",
    meanings: ["time", "hours"],
    jlpt: "N5",
    category: "time-words",
    context:
      "Bare 時間 means 'time' or as a counter for hours: 二時間 にじかん = two hours.",
  }),
  vc({
    word: "分",
    reading: "ふん / ぷん",
    meanings: ["minute"],
    jlpt: "N5",
    category: "time-words",
    context:
      "Counter for minutes. The voicing alternates: 一分 いっぷん, 二分 にふん, 三分 さんぷん.",
  }),
  vc({
    word: "秒",
    reading: "びょう",
    meanings: ["second (time)"],
    jlpt: "N3",
    category: "time-words",
  }),
  vc({
    word: "年",
    reading: "とし / ねん",
    meanings: ["year"],
    jlpt: "N5",
    category: "time-words",
    context: "とし = year as a noun; ねん appears in compounds (二年生 = 2nd-grade student).",
  }),
];

// ============================================================
// Counters
// ============================================================

const counters = [
  vc({
    word: "つ",
    reading: "つ",
    meanings: ["general counter (1-10)"],
    jlpt: "N5",
    category: "general",
    context:
      "The most universal counter. Pairs with native numbers 1-10 (一つ, 二つ, …). Use when in doubt about which counter is correct.",
    ex: {
      jp: "りんごを三つください。",
      kana: "りんご を みっつ ください。",
      en: "Please give me three apples.",
    },
  }),
  vc({
    word: "個",
    reading: "こ",
    meanings: ["counter for small objects"],
    jlpt: "N5",
    category: "objects",
    context: "Default counter for round-ish small items: balls, eggs, pieces of fruit, candies.",
    ex: {
      jp: "卵を二個買いました。",
      kana: "たまご を にこ かいました。",
      en: "I bought two eggs.",
    },
  }),
  vc({
    word: "人",
    reading: "にん",
    meanings: ["counter for people"],
    jlpt: "N5",
    category: "people",
    context:
      "Two irregulars: 一人 ひとり (one person), 二人 ふたり (two people). From three onwards: 三人 さんにん, 四人 よにん, etc.",
    ex: {
      jp: "クラスに三十人います。",
      kana: "くらす に さんじゅうにん います。",
      en: "There are 30 people in the class.",
    },
  }),
  vc({
    word: "本",
    reading: "ほん / ぼん / ぽん",
    meanings: ["counter for long thin objects"],
    jlpt: "N5",
    category: "objects",
    context:
      "Pens, bottles, trees, umbrellas, train tracks. Sound shifts: 一本 いっぽん, 三本 さんぼん, 六本 ろっぽん, 八本 はっぽん.",
    ex: {
      jp: "ペンが二本あります。",
      kana: "ぺん が にほん あります。",
      en: "There are two pens.",
    },
  }),
  vc({
    word: "枚",
    reading: "まい",
    meanings: ["counter for flat thin objects"],
    jlpt: "N5",
    category: "objects",
    context: "Paper, plates, shirts, stamps, photos, coins. No sound changes — clean and regular.",
    ex: {
      jp: "切手を五枚ください。",
      kana: "きって を ごまい ください。",
      en: "Please give me five stamps.",
    },
  }),
  vc({
    word: "冊",
    reading: "さつ",
    meanings: ["counter for books / bound volumes"],
    jlpt: "N5",
    category: "objects",
    context: "Books, magazines, notebooks. Sound shifts: 一冊 いっさつ, 八冊 はっさつ.",
    ex: {
      jp: "本を三冊借りました。",
      kana: "ほん を さんさつ かりました。",
      en: "I borrowed three books.",
    },
  }),
  vc({
    word: "匹",
    reading: "ひき / びき / ぴき",
    meanings: ["counter for small animals"],
    jlpt: "N5",
    category: "animals",
    context:
      "Cats, dogs, fish, insects. Sound shifts: 一匹 いっぴき, 三匹 さんびき, 六匹 ろっぴき.",
    ex: {
      jp: "犬が二匹います。",
      kana: "いぬ が にひき います。",
      en: "There are two dogs.",
    },
  }),
  vc({
    word: "頭",
    reading: "とう",
    meanings: ["counter for large animals"],
    jlpt: "N3",
    category: "animals",
    context: "Cows, horses, elephants. Smaller animals use 匹 instead.",
  }),
  vc({
    word: "羽",
    reading: "わ / ば / ぱ",
    meanings: ["counter for birds and rabbits"],
    jlpt: "N3",
    category: "animals",
    context:
      "Strange Japanese fact: rabbits are counted as if they were birds (originally so monks could eat them as 'fowl' during Buddhist fasts).",
  }),
  vc({
    word: "杯",
    reading: "はい / ばい / ぱい",
    meanings: ["counter for cups, glasses, bowlfuls"],
    jlpt: "N5",
    category: "containers",
    context:
      "Cup of coffee, glass of water, bowl of rice. Sound shifts: 一杯 いっぱい, 三杯 さんばい, 六杯 ろっぱい.",
    ex: {
      jp: "コーヒーを一杯お願いします。",
      kana: "こーひー を いっぱい おねがい します。",
      en: "One cup of coffee, please.",
    },
  }),
  vc({
    word: "回",
    reading: "かい",
    meanings: ["counter for occurrences / times"],
    jlpt: "N5",
    category: "events",
    context: "How many times something happens: 一回 (once), 二回 (twice). Sound shifts at 三回 さんかい.",
    ex: {
      jp: "週に三回ジムに行きます。",
      kana: "しゅう に さんかい じむ に いきます。",
      en: "I go to the gym three times a week.",
    },
  }),
  vc({
    word: "階",
    reading: "かい / がい",
    meanings: ["counter for floors"],
    jlpt: "N5",
    category: "buildings",
    context:
      "Building floors. Watch the sound shift on 三階 さんがい (vs 三回 さんかい — different counter, different reading).",
    ex: {
      jp: "私のオフィスは五階です。",
      kana: "わたし の おふぃす は ごかい です。",
      en: "My office is on the 5th floor.",
    },
  }),
  vc({
    word: "時",
    reading: "じ",
    meanings: ["counter for o'clock"],
    jlpt: "N5",
    category: "time-counters",
    context:
      "Telling time: 三時 さんじ = 3 o'clock. Irregulars: 四時 よじ, 七時 しちじ, 九時 くじ.",
    ex: {
      jp: "今、何時ですか。",
      kana: "いま、 なんじ です か。",
      en: "What time is it now?",
    },
  }),
  vc({
    word: "歳",
    reading: "さい",
    meanings: ["counter for age (years old)"],
    jlpt: "N5",
    category: "age",
    context:
      "Often written 才 in casual contexts. Irregular: 二十歳 はたち = 20 years old (a coming-of-age word).",
    ex: {
      jp: "三十歳です。",
      kana: "さんじゅっさい です。",
      en: "I'm 30 years old.",
    },
  }),
  vc({
    word: "円",
    reading: "えん",
    meanings: ["yen (currency)"],
    jlpt: "N5",
    category: "money",
    context: "Reading is えん, not the western 'yen' — though English borrowed it from a different historical romanization.",
    ex: {
      jp: "三百円です。",
      kana: "さんびゃくえん です。",
      en: "It's 300 yen.",
    },
  }),
  vc({
    word: "番目",
    reading: "ばんめ",
    meanings: ["ordinal counter (Nth)"],
    jlpt: "N4",
    category: "general",
    context: "Append to numbers to make ordinals: 二番目 にばんめ = the second one.",
  }),
  vc({
    word: "週間",
    reading: "しゅうかん",
    meanings: ["counter for weeks"],
    jlpt: "N5",
    category: "time-counters",
    ex: {
      jp: "二週間休みを取りました。",
      kana: "にしゅうかん やすみ を とりました。",
      en: "I took two weeks off.",
    },
  }),
  vc({
    word: "ヶ月",
    reading: "かげつ",
    meanings: ["counter for months (duration)"],
    jlpt: "N5",
    category: "time-counters",
    context:
      "Different from 月 (month-name). Sound shifts: 一ヶ月 いっかげつ, 六ヶ月 ろっかげつ. Often written ヵ月 or か月.",
  }),
];

// ============================================================
// Body parts
// ============================================================

const body = [
  vc({
    word: "頭",
    reading: "あたま",
    meanings: ["head"],
    jlpt: "N5",
    category: "head",
    context: "Different reading from the 'large-animal counter' (頭 とう).",
    ex: {
      jp: "頭が痛いです。",
      kana: "あたま が いたい です。",
      en: "My head hurts.",
    },
  }),
  vc({
    word: "顔",
    reading: "かお",
    meanings: ["face"],
    jlpt: "N5",
    category: "head",
  }),
  vc({
    word: "目",
    reading: "め",
    meanings: ["eye"],
    jlpt: "N5",
    category: "head",
  }),
  vc({
    word: "耳",
    reading: "みみ",
    meanings: ["ear"],
    jlpt: "N5",
    category: "head",
  }),
  vc({
    word: "鼻",
    reading: "はな",
    meanings: ["nose"],
    jlpt: "N5",
    category: "head",
    context: "Same reading as 花 (flower) — context disambiguates.",
  }),
  vc({
    word: "口",
    reading: "くち",
    meanings: ["mouth"],
    jlpt: "N5",
    category: "head",
  }),
  vc({
    word: "歯",
    reading: "は",
    meanings: ["tooth", "teeth"],
    jlpt: "N4",
    category: "head",
  }),
  vc({
    word: "舌",
    reading: "した",
    meanings: ["tongue"],
    jlpt: "N3",
    category: "head",
    context: "Same reading as 下 (below) — context disambiguates.",
  }),
  vc({
    word: "首",
    reading: "くび",
    meanings: ["neck"],
    jlpt: "N4",
    category: "head",
    context: "首になる literally means 'become a neck' but idiomatically means 'be fired'.",
  }),
  vc({
    word: "肩",
    reading: "かた",
    meanings: ["shoulder"],
    jlpt: "N3",
    category: "torso",
  }),
  vc({
    word: "腕",
    reading: "うで",
    meanings: ["arm"],
    jlpt: "N3",
    category: "limbs",
    context: "Also means 'skill' or 'ability' (腕がいい = skilled).",
  }),
  vc({
    word: "手",
    reading: "て",
    meanings: ["hand"],
    jlpt: "N5",
    category: "limbs",
  }),
  vc({
    word: "指",
    reading: "ゆび",
    meanings: ["finger", "toe"],
    jlpt: "N3",
    category: "limbs",
    context: "Same word for fingers and toes; clarified by 手の指 (hand-finger) or 足の指 (foot-toe).",
  }),
  vc({
    word: "胸",
    reading: "むね",
    meanings: ["chest", "breast"],
    jlpt: "N3",
    category: "torso",
  }),
  vc({
    word: "背中",
    reading: "せなか",
    meanings: ["back"],
    jlpt: "N3",
    category: "torso",
  }),
  vc({
    word: "腹",
    reading: "はら / おなか",
    meanings: ["belly", "stomach"],
    jlpt: "N3",
    category: "torso",
    context: "おなか is more polite/everyday; はら is rougher/casual.",
  }),
  vc({
    word: "足",
    reading: "あし",
    meanings: ["foot", "leg"],
    jlpt: "N5",
    category: "limbs",
    context:
      "Covers both foot and leg in Japanese. 脚 also reads あし but specifically means leg.",
  }),
  vc({
    word: "膝",
    reading: "ひざ",
    meanings: ["knee", "lap"],
    jlpt: "N3",
    category: "limbs",
  }),
  vc({
    word: "髪",
    reading: "かみ",
    meanings: ["hair (on the head)"],
    jlpt: "N4",
    category: "head",
    context:
      "Specifically scalp hair. Body hair is 毛 (け). Same reading as 神 (god) and 紙 (paper) — pure context.",
  }),
  vc({
    word: "心臓",
    reading: "しんぞう",
    meanings: ["heart (organ)"],
    jlpt: "N3",
    category: "internal",
    context: "心 (こころ) is the metaphorical heart; 心臓 is the physical organ.",
  }),
];

// ============================================================
// Family
// ============================================================

const family = [
  vc({
    word: "家族",
    reading: "かぞく",
    meanings: ["family"],
    jlpt: "N5",
    category: "general",
  }),
  vc({
    word: "両親",
    reading: "りょうしん",
    meanings: ["parents (both)"],
    jlpt: "N4",
    category: "general",
  }),
  vc({
    word: "父",
    reading: "ちち",
    meanings: ["father (humble, your own)"],
    jlpt: "N5",
    category: "parents",
    context:
      "Use 父 when talking about your own father to outsiders. Reference someone else's father with お父さん.",
  }),
  vc({
    word: "お父さん",
    reading: "おとうさん",
    meanings: ["father (polite, others')"],
    jlpt: "N5",
    category: "parents",
    context: "Polite form. Used when addressing your own father or referring to someone else's.",
  }),
  vc({
    word: "母",
    reading: "はは",
    meanings: ["mother (humble, your own)"],
    jlpt: "N5",
    category: "parents",
  }),
  vc({
    word: "お母さん",
    reading: "おかあさん",
    meanings: ["mother (polite, others')"],
    jlpt: "N5",
    category: "parents",
  }),
  vc({
    word: "兄",
    reading: "あに",
    meanings: ["older brother (humble, your own)"],
    jlpt: "N5",
    category: "siblings",
  }),
  vc({
    word: "お兄さん",
    reading: "おにいさん",
    meanings: ["older brother (polite, others')"],
    jlpt: "N5",
    category: "siblings",
  }),
  vc({
    word: "姉",
    reading: "あね",
    meanings: ["older sister (humble, your own)"],
    jlpt: "N5",
    category: "siblings",
  }),
  vc({
    word: "お姉さん",
    reading: "おねえさん",
    meanings: ["older sister (polite, others')"],
    jlpt: "N5",
    category: "siblings",
  }),
  vc({
    word: "弟",
    reading: "おとうと",
    meanings: ["younger brother"],
    jlpt: "N5",
    category: "siblings",
    context: "Younger siblings don't have a distinct humble/polite form — same word for own and others'.",
  }),
  vc({
    word: "妹",
    reading: "いもうと",
    meanings: ["younger sister"],
    jlpt: "N5",
    category: "siblings",
  }),
  vc({
    word: "祖父",
    reading: "そふ",
    meanings: ["grandfather (humble, your own)"],
    jlpt: "N4",
    category: "grandparents",
  }),
  vc({
    word: "おじいさん",
    reading: "おじいさん",
    meanings: ["grandfather (polite)", "elderly man"],
    jlpt: "N5",
    category: "grandparents",
    context: "Also used as a generic term for an elderly man.",
  }),
  vc({
    word: "祖母",
    reading: "そぼ",
    meanings: ["grandmother (humble, your own)"],
    jlpt: "N4",
    category: "grandparents",
  }),
  vc({
    word: "おばあさん",
    reading: "おばあさん",
    meanings: ["grandmother (polite)", "elderly woman"],
    jlpt: "N5",
    category: "grandparents",
  }),
  vc({
    word: "おじ",
    reading: "おじ",
    meanings: ["uncle (your own)"],
    jlpt: "N3",
    category: "extended",
    context: "Written 伯父 (older than parent) or 叔父 (younger than parent) for the kanji-distinguished forms.",
  }),
  vc({
    word: "おば",
    reading: "おば",
    meanings: ["aunt (your own)"],
    jlpt: "N3",
    category: "extended",
    context: "Same elder/younger kanji distinction: 伯母 / 叔母.",
  }),
  vc({
    word: "夫",
    reading: "おっと",
    meanings: ["husband (your own)"],
    jlpt: "N3",
    category: "spouse",
  }),
  vc({
    word: "妻",
    reading: "つま",
    meanings: ["wife (your own)"],
    jlpt: "N3",
    category: "spouse",
  }),
  vc({
    word: "息子",
    reading: "むすこ",
    meanings: ["son"],
    jlpt: "N4",
    category: "children",
  }),
  vc({
    word: "娘",
    reading: "むすめ",
    meanings: ["daughter"],
    jlpt: "N4",
    category: "children",
    context: "Also used historically and in literature to mean 'young woman'.",
  }),
];

// ============================================================
// Emit decks
// ============================================================

const decks = [
  {
    file: "vocab_numbers.json",
    deck_id: "vocab-numbers",
    deck_name: "Numbers (数字)",
    subtitle: "1, 10, 100, half · the building blocks of every counter",
    notes: "Numerical kanji from 一 to 億, plus universal building-blocks like 半 (half), 番 (ordinal), 倍 (multiplier).",
    cards: numbers,
  },
  {
    file: "vocab_time.json",
    deck_id: "vocab-time",
    deck_name: "Time, Days, Months (時間)",
    subtitle: "Days of the week · times of day · months · today/tomorrow",
    notes:
      "Days of the week (named after celestial bodies, like English), parts of the day, the irregular today/yesterday/tomorrow words, and the irregular month readings (4月 しがつ, 7月 しちがつ, 9月 くがつ).",
    cards: time,
  },
  {
    file: "vocab_counters.json",
    deck_id: "vocab-counters",
    deck_name: "Counters (助数詞)",
    subtitle: "～つ ～本 ～枚 ～回 · the uniquely-Japanese counting words",
    notes:
      "Counter suffixes are the trickiest part of basic Japanese for English speakers. Each card covers when to use the counter, an example, and the irregular sound-changes (一本 いっぽん, 三本 さんぼん).",
    cards: counters,
  },
  {
    file: "vocab_body.json",
    deck_id: "vocab-body",
    deck_name: "Body parts (体)",
    subtitle: "Head to toe · everyday vocabulary",
    notes:
      "Body parts you'll need at the doctor's, in the gym, or in everyday conversation. Includes the head/face/limbs/torso plus a few internal organs.",
    cards: body,
  },
  {
    file: "vocab_family.json",
    deck_id: "vocab-family",
    deck_name: "Family (家族)",
    subtitle: "Parents · siblings · grandparents · in-laws · own vs others'",
    notes:
      "Japanese family vocab has a humble/polite split: when referring to your own family to outsiders you use the humble form (父, 母, 兄), and you use the polite form (お父さん, お母さん, お兄さん) for someone else's family or when addressing yours directly.",
    cards: family,
  },
];

console.log("Writing themed vocab decks → agent-files/\n");
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
console.log("\n✓ Themed vocab decks written.");
