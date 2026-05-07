#!/usr/bin/env node
/**
 * Fourth batch of hand-authored themed vocab decks.
 *
 * Output:
 *   agent-files/vocab_restaurant.json   (Pro)
 *   agent-files/vocab_medical.json      (Pro)
 *   agent-files/vocab_colors.json       (Pro)
 *   agent-files/vocab_animals.json      (Pro)
 *   agent-files/vocab_emotions.json     (Pro)
 *   agent-files/vocab_proverbs.json     (Pro)
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
// Restaurant + Shopping
// ============================================================

const restaurant = [
  vc({
    word: "メニュー",
    reading: "メニュー",
    meanings: ["menu"],
    jlpt: "N5",
    category: "ordering",
  }),
  vc({
    word: "注文",
    reading: "ちゅうもん",
    meanings: ["order"],
    jlpt: "N4",
    category: "ordering",
    context: "注文する = to order. 注文をお願いします = I'd like to order.",
    ex: {
      jp: "ご注文はお決まりですか。",
      kana: "ごちゅうもん は おきまり です か。",
      en: "Have you decided on your order?",
    },
  }),
  vc({
    word: "お会計",
    reading: "おかいけい",
    meanings: ["the bill", "check"],
    jlpt: "N3",
    category: "paying",
    context: "Polite. Casual: 勘定 (かんじょう). At the end: お会計お願いします = check, please.",
  }),
  vc({
    word: "おすすめ",
    reading: "おすすめ",
    meanings: ["recommendation"],
    jlpt: "N3",
    category: "ordering",
    context: "Often written お勧め in writing. 何がおすすめですか = What do you recommend?",
  }),
  vc({
    word: "セット",
    reading: "セット",
    meanings: ["set meal", "combo"],
    jlpt: "N4",
    category: "ordering",
    context: "Used a lot for combo meals: ラーメンセット = ramen + sides combo.",
  }),
  vc({
    word: "定食",
    reading: "ていしょく",
    meanings: ["set meal (Japanese)"],
    jlpt: "N3",
    category: "ordering",
    context:
      "A traditional set: main + rice + miso soup + small sides. The Japanese-restaurant equivalent of a 'plate lunch'.",
  }),
  vc({
    word: "持ち帰り",
    reading: "もちかえり",
    meanings: ["takeout", "to go"],
    jlpt: "N3",
    category: "ordering",
    context: "テイクアウト also works. 持ち帰りでお願いします = to go, please.",
  }),
  vc({
    word: "店",
    reading: "みせ",
    meanings: ["shop", "store"],
    jlpt: "N5",
    category: "places",
  }),
  vc({
    word: "レストラン",
    reading: "レストラン",
    meanings: ["restaurant"],
    jlpt: "N5",
    category: "places",
    context: "Loanword. Casual Japanese eateries are usually 食堂 (しょくどう) or specific names (ラーメン屋, 寿司屋).",
  }),
  vc({
    word: "居酒屋",
    reading: "いざかや",
    meanings: ["izakaya", "Japanese pub"],
    jlpt: "N3",
    category: "places",
  }),
  vc({
    word: "コンビニ",
    reading: "コンビニ",
    meanings: ["convenience store"],
    jlpt: "N4",
    category: "places",
    context: "Shortened from コンビニエンスストア. The Japanese 24/7 convenience-store culture is unique.",
  }),
  vc({
    word: "スーパー",
    reading: "スーパー",
    meanings: ["supermarket"],
    jlpt: "N5",
    category: "places",
  }),
  vc({
    word: "デパート",
    reading: "デパート",
    meanings: ["department store"],
    jlpt: "N5",
    category: "places",
  }),
  // Shopping
  vc({
    word: "値段",
    reading: "ねだん",
    meanings: ["price"],
    jlpt: "N4",
    category: "shopping",
    ex: {
      jp: "値段はいくらですか。",
      kana: "ねだん は いくら です か。",
      en: "How much is it?",
    },
  }),
  vc({
    word: "高い",
    reading: "たかい",
    meanings: ["expensive", "high"],
    jlpt: "N5",
    category: "shopping",
    context: "Same word as 'tall' / 'high'. Context (or 値段が高い) clarifies.",
  }),
  vc({
    word: "安い",
    reading: "やすい",
    meanings: ["cheap", "inexpensive"],
    jlpt: "N5",
    category: "shopping",
  }),
  vc({
    word: "おいしい",
    reading: "おいしい",
    meanings: ["delicious"],
    jlpt: "N5",
    category: "tasting",
    context: "Often written 美味しい. The all-purpose food-compliment word — say it about anything good.",
  }),
  vc({
    word: "まずい",
    reading: "まずい",
    meanings: ["bad-tasting"],
    jlpt: "N4",
    category: "tasting",
    context: "Use carefully — direct opposite of おいしい. Casual: ぎょうさん used as 'oh no' (it's bad).",
  }),
  vc({
    word: "甘い",
    reading: "あまい",
    meanings: ["sweet"],
    jlpt: "N4",
    category: "tasting",
    context: "Also figurative: 甘い考え = naive idea, 親に甘える = act spoiled toward your parents.",
  }),
  vc({
    word: "辛い",
    reading: "からい",
    meanings: ["spicy", "salty (regional)"],
    jlpt: "N4",
    category: "tasting",
    context:
      "Means 'spicy' (chili-heat) in standard Japanese. In Tohoku/Hokkaido it can mean 'salty'. Same kanji also reads つらい = 'painful'.",
  }),
  vc({
    word: "酸っぱい",
    reading: "すっぱい",
    meanings: ["sour"],
    jlpt: "N3",
    category: "tasting",
  }),
];

// ============================================================
// Medical / Body sensations
// ============================================================

const medical = [
  vc({
    word: "病院",
    reading: "びょういん",
    meanings: ["hospital"],
    jlpt: "N5",
    category: "places",
    context: "美容院 (びよういん) = beauty salon — same kana, only the long-vowel mark differs.",
  }),
  vc({
    word: "医者",
    reading: "いしゃ",
    meanings: ["doctor"],
    jlpt: "N5",
    category: "people",
    context: "Polite: お医者さん.",
  }),
  vc({
    word: "看護師",
    reading: "かんごし",
    meanings: ["nurse"],
    jlpt: "N3",
    category: "people",
  }),
  vc({
    word: "薬",
    reading: "くすり",
    meanings: ["medicine"],
    jlpt: "N5",
    category: "objects",
    context: "薬を飲む = take medicine (lit. 'drink medicine' even for pills).",
  }),
  vc({
    word: "薬局",
    reading: "やっきょく",
    meanings: ["pharmacy"],
    jlpt: "N4",
    category: "places",
  }),
  vc({
    word: "病気",
    reading: "びょうき",
    meanings: ["sickness", "illness"],
    jlpt: "N5",
    category: "general",
    context: "病気になる = to get sick.",
  }),
  vc({
    word: "風邪",
    reading: "かぜ",
    meanings: ["cold (illness)"],
    jlpt: "N4",
    category: "illness",
    context:
      "Same reading as 風 (wind) — context disambiguates. Pre-modern theory blamed colds on 'bad winds'.",
    ex: {
      jp: "風邪を引きました。",
      kana: "かぜ を ひきました。",
      en: "I caught a cold.",
    },
  }),
  vc({
    word: "熱",
    reading: "ねつ",
    meanings: ["fever", "heat"],
    jlpt: "N4",
    category: "illness",
    context: "熱がある = have a fever. 熱を計る = take temperature.",
  }),
  vc({
    word: "怪我",
    reading: "けが",
    meanings: ["injury", "wound"],
    jlpt: "N4",
    category: "illness",
    context: "怪我をする = get hurt.",
  }),
  vc({
    word: "痛い",
    reading: "いたい",
    meanings: ["painful", "it hurts"],
    jlpt: "N5",
    category: "symptoms",
    context: "An い-adjective. By itself: 痛い! = ow! / ouch!",
    ex: {
      jp: "頭が痛いです。",
      kana: "あたま が いたい です。",
      en: "I have a headache.",
    },
  }),
  vc({
    word: "頭痛",
    reading: "ずつう",
    meanings: ["headache"],
    jlpt: "N3",
    category: "symptoms",
    context: "Compound noun. Same as saying 頭が痛い but stronger / more medical.",
  }),
  vc({
    word: "お腹が空いた",
    reading: "おなか が すいた",
    meanings: ["I'm hungry"],
    jlpt: "N5",
    category: "states",
    context: "Lit. 'stomach is empty'. お腹がすく = to get hungry.",
  }),
  vc({
    word: "疲れた",
    reading: "つかれた",
    meanings: ["I'm tired"],
    jlpt: "N5",
    category: "states",
    context:
      "Past tense of 疲れる. Stating it naturally as an exclamation. Note that お疲れ様 (workplace 'good job') uses the same root.",
  }),
  vc({
    word: "眠い",
    reading: "ねむい",
    meanings: ["sleepy"],
    jlpt: "N4",
    category: "states",
  }),
  vc({
    word: "気分",
    reading: "きぶん",
    meanings: ["mood", "feeling"],
    jlpt: "N4",
    category: "states",
    context: "気分がいい = feel good. 気分が悪い = feel sick / bad.",
  }),
  vc({
    word: "アレルギー",
    reading: "アレルギー",
    meanings: ["allergy"],
    jlpt: "N3",
    category: "general",
    context: "Critical in restaurants: ◯◯アレルギーがあります = I'm allergic to ◯◯.",
  }),
  vc({
    word: "緊急",
    reading: "きんきゅう",
    meanings: ["emergency", "urgent"],
    jlpt: "N3",
    category: "general",
    context: "Japan's emergency number is 119 (ambulance/fire) and 110 (police).",
  }),
  vc({
    word: "救急車",
    reading: "きゅうきゅうしゃ",
    meanings: ["ambulance"],
    jlpt: "N3",
    category: "general",
  }),
];

// ============================================================
// Colors
// ============================================================

const colors = [
  vc({
    word: "色",
    reading: "いろ",
    meanings: ["color"],
    jlpt: "N5",
    category: "general",
  }),
  vc({
    word: "赤",
    reading: "あか",
    meanings: ["red"],
    jlpt: "N5",
    category: "primary",
    context: "Adjective form: 赤い (い-adjective).",
  }),
  vc({
    word: "青",
    reading: "あお",
    meanings: ["blue", "green (older usage)"],
    jlpt: "N5",
    category: "primary",
    context:
      "In older Japanese, 青 covered both blue and green. Traffic lights are still called 青信号 even though they're green. Adjective: 青い.",
  }),
  vc({
    word: "黄色",
    reading: "きいろ",
    meanings: ["yellow"],
    jlpt: "N5",
    category: "primary",
    context: "Adjective: 黄色い (note the い goes on 黄色, not just 黄).",
  }),
  vc({
    word: "緑",
    reading: "みどり",
    meanings: ["green"],
    jlpt: "N4",
    category: "primary",
    context:
      "Modern green. Traffic lights say 青 historically, but real green plants/leaves are 緑. No native -i adjective form.",
  }),
  vc({
    word: "白",
    reading: "しろ",
    meanings: ["white"],
    jlpt: "N5",
    category: "neutrals",
    context: "Adjective: 白い.",
  }),
  vc({
    word: "黒",
    reading: "くろ",
    meanings: ["black"],
    jlpt: "N5",
    category: "neutrals",
    context: "Adjective: 黒い.",
  }),
  vc({
    word: "灰色",
    reading: "はいいろ",
    meanings: ["gray"],
    jlpt: "N3",
    category: "neutrals",
    context: "Lit. 'ash-color'. The loanword グレー is also common.",
  }),
  vc({
    word: "茶色",
    reading: "ちゃいろ",
    meanings: ["brown"],
    jlpt: "N4",
    category: "earthy",
    context: "Lit. 'tea-color'. Adjective: 茶色い.",
  }),
  vc({
    word: "紫",
    reading: "むらさき",
    meanings: ["purple"],
    jlpt: "N3",
    category: "earthy",
  }),
  vc({
    word: "ピンク",
    reading: "ピンク",
    meanings: ["pink"],
    jlpt: "N4",
    category: "earthy",
    context: "Loanword. Native桃色 (ももいろ) = peach-color exists but ピンク is far more common.",
  }),
  vc({
    word: "オレンジ",
    reading: "オレンジ",
    meanings: ["orange (color)"],
    jlpt: "N4",
    category: "earthy",
  }),
  vc({
    word: "金色",
    reading: "きんいろ",
    meanings: ["gold (color)"],
    jlpt: "N3",
    category: "metallic",
  }),
  vc({
    word: "銀色",
    reading: "ぎんいろ",
    meanings: ["silver (color)"],
    jlpt: "N3",
    category: "metallic",
  }),
  vc({
    word: "明るい",
    reading: "あかるい",
    meanings: ["bright"],
    jlpt: "N4",
    category: "modifiers",
    context: "明るい色 = bright color. Also: 明るい性格 = cheerful personality.",
  }),
  vc({
    word: "暗い",
    reading: "くらい",
    meanings: ["dark"],
    jlpt: "N4",
    category: "modifiers",
    context: "Same として 暗い性格 = gloomy personality.",
  }),
  vc({
    word: "濃い",
    reading: "こい",
    meanings: ["dark (saturated)", "strong (taste)"],
    jlpt: "N3",
    category: "modifiers",
    context: "濃い赤 = deep red. Also for strong flavors: 濃いコーヒー.",
  }),
  vc({
    word: "薄い",
    reading: "うすい",
    meanings: ["light (color)", "weak (taste)", "thin"],
    jlpt: "N4",
    category: "modifiers",
    context: "Pairs with 濃い. 薄い青 = light blue.",
  }),
];

// ============================================================
// Animals
// ============================================================

const animals = [
  vc({
    word: "動物",
    reading: "どうぶつ",
    meanings: ["animal"],
    jlpt: "N5",
    category: "general",
    context: "動物園 (どうぶつえん) = zoo.",
  }),
  vc({
    word: "犬",
    reading: "いぬ",
    meanings: ["dog"],
    jlpt: "N5",
    category: "domestic",
  }),
  vc({
    word: "猫",
    reading: "ねこ",
    meanings: ["cat"],
    jlpt: "N5",
    category: "domestic",
  }),
  vc({
    word: "鳥",
    reading: "とり",
    meanings: ["bird"],
    jlpt: "N5",
    category: "wild",
    context: "Also means 'chicken' in cooking context (鳥肉 = chicken meat). The kanji for bird, broadly.",
  }),
  vc({
    word: "魚",
    reading: "さかな",
    meanings: ["fish"],
    jlpt: "N5",
    category: "wild",
  }),
  vc({
    word: "馬",
    reading: "うま",
    meanings: ["horse"],
    jlpt: "N4",
    category: "farm",
  }),
  vc({
    word: "牛",
    reading: "うし",
    meanings: ["cow"],
    jlpt: "N4",
    category: "farm",
    context: "牛肉 (ぎゅうにく) = beef. The reading shifts in compounds.",
  }),
  vc({
    word: "豚",
    reading: "ぶた",
    meanings: ["pig"],
    jlpt: "N4",
    category: "farm",
    context: "豚肉 (ぶたにく) = pork.",
  }),
  vc({
    word: "羊",
    reading: "ひつじ",
    meanings: ["sheep"],
    jlpt: "N3",
    category: "farm",
  }),
  vc({
    word: "鶏",
    reading: "にわとり",
    meanings: ["chicken (bird)"],
    jlpt: "N3",
    category: "farm",
    context: "Specifically a chicken (the bird). Cooked chicken = 鶏肉 (とりにく) or just 鳥.",
  }),
  vc({
    word: "鼠",
    reading: "ねずみ",
    meanings: ["mouse", "rat"],
    jlpt: "N2",
    category: "small",
    context: "Often written ねずみ in hiragana — kanji is rare.",
  }),
  vc({
    word: "蛇",
    reading: "へび",
    meanings: ["snake"],
    jlpt: "N3",
    category: "wild",
  }),
  vc({
    word: "象",
    reading: "ぞう",
    meanings: ["elephant"],
    jlpt: "N4",
    category: "wild",
  }),
  vc({
    word: "猿",
    reading: "さる",
    meanings: ["monkey", "ape"],
    jlpt: "N3",
    category: "wild",
  }),
  vc({
    word: "鯨",
    reading: "くじら",
    meanings: ["whale"],
    jlpt: "N3",
    category: "wild",
  }),
  vc({
    word: "蟹",
    reading: "かに",
    meanings: ["crab"],
    jlpt: "N3",
    category: "wild",
  }),
  vc({
    word: "虫",
    reading: "むし",
    meanings: ["insect", "bug"],
    jlpt: "N4",
    category: "small",
  }),
  vc({
    word: "蝶",
    reading: "ちょう",
    meanings: ["butterfly"],
    jlpt: "N3",
    category: "small",
    context: "Often written 蝶々 (ちょうちょう) in everyday use.",
  }),
];

// ============================================================
// Emotions
// ============================================================

const emotions = [
  vc({
    word: "嬉しい",
    reading: "うれしい",
    meanings: ["happy", "glad"],
    jlpt: "N4",
    category: "positive",
    context:
      "For your own happy reaction to a specific event. For continuous 'happy person' state, use 楽しい (fun) or 幸せ (fortunate).",
  }),
  vc({
    word: "幸せ",
    reading: "しあわせ",
    meanings: ["happy", "fortunate"],
    jlpt: "N4",
    category: "positive",
    context: "な-adjective. More about a continuous state of well-being than a momentary feeling.",
  }),
  vc({
    word: "楽しい",
    reading: "たのしい",
    meanings: ["fun", "enjoyable"],
    jlpt: "N5",
    category: "positive",
  }),
  vc({
    word: "悲しい",
    reading: "かなしい",
    meanings: ["sad"],
    jlpt: "N5",
    category: "negative",
  }),
  vc({
    word: "寂しい",
    reading: "さびしい",
    meanings: ["lonely", "missing someone"],
    jlpt: "N4",
    category: "negative",
    context: "Sometimes pronounced さみしい. The 'I miss you' meaning is heavily implied in many contexts.",
  }),
  vc({
    word: "怒る",
    reading: "おこる",
    meanings: ["to get angry"],
    jlpt: "N4",
    category: "negative",
    context: "Verb (godan). 怒っている = is angry. 怒らせる = make someone angry.",
  }),
  vc({
    word: "怖い",
    reading: "こわい",
    meanings: ["scary", "frightening"],
    jlpt: "N4",
    category: "negative",
  }),
  vc({
    word: "恥ずかしい",
    reading: "はずかしい",
    meanings: ["embarrassed", "ashamed"],
    jlpt: "N4",
    category: "negative",
  }),
  vc({
    word: "驚く",
    reading: "おどろく",
    meanings: ["to be surprised"],
    jlpt: "N3",
    category: "neutral",
    context: "Verb form. The onomatopoeia びっくり is the more common everyday word.",
  }),
  vc({
    word: "心配",
    reading: "しんぱい",
    meanings: ["worry", "concern"],
    jlpt: "N4",
    category: "negative",
    context:
      "心配する = to worry. 心配しないで = don't worry. The な-adjective form is also valid: 心配な気持ち.",
    ex: {
      jp: "あなたが心配です。",
      kana: "あなた が しんぱい です。",
      en: "I'm worried about you.",
    },
  }),
  vc({
    word: "安心",
    reading: "あんしん",
    meanings: ["relief", "peace of mind"],
    jlpt: "N4",
    category: "positive",
    context: "な-adjective. The opposite of 心配. 安心する = to feel relieved.",
  }),
  vc({
    word: "退屈",
    reading: "たいくつ",
    meanings: ["bored", "boring"],
    jlpt: "N3",
    category: "negative",
    context: "な-adjective.",
  }),
  vc({
    word: "好き",
    reading: "すき",
    meanings: ["liked", "favorite"],
    jlpt: "N5",
    category: "preference",
    context: "な-adjective. Takes が, not を: 寿司が好き = I like sushi.",
  }),
  vc({
    word: "嫌い",
    reading: "きらい",
    meanings: ["disliked", "hated"],
    jlpt: "N5",
    category: "preference",
    context: "な-adjective despite ending in い. Takes が.",
  }),
  vc({
    word: "愛",
    reading: "あい",
    meanings: ["love"],
    jlpt: "N3",
    category: "preference",
    context: "Noun. Verb form: 愛する (irregular する verb). Less commonly used in everyday speech than English 'love'.",
  }),
  vc({
    word: "感動",
    reading: "かんどう",
    meanings: ["deep emotion", "moved"],
    jlpt: "N3",
    category: "intense",
    context: "感動した = was moved (by something). 感動的 = moving / touching.",
  }),
];

// ============================================================
// Proverbs (ことわざ)
// ============================================================

const proverbs = [
  vc({
    word: "猿も木から落ちる",
    reading: "さる も き から おちる",
    meanings: ["even monkeys fall from trees", "even experts make mistakes"],
    jlpt: "N3",
    category: "wisdom",
    context:
      "Lit. 'even monkeys fall from trees'. Used to comfort someone after a mistake — even an expert at climbing slips occasionally.",
  }),
  vc({
    word: "七転び八起き",
    reading: "ななころび やおき",
    meanings: ["fall down 7 times, get up 8", "perseverance"],
    jlpt: "N3",
    category: "perseverance",
    context: "The Japanese 'never give up' proverb. The math (7 falls but 8 standings) implies you started standing.",
  }),
  vc({
    word: "石の上にも三年",
    reading: "いし の うえ に も さんねん",
    meanings: ["3 years on a stone (warms even stone)", "patience pays off"],
    jlpt: "N3",
    category: "perseverance",
    context: "Lit. 'three years even on a stone'. Even sitting on a cold stone, you'll warm it eventually with patience.",
  }),
  vc({
    word: "塵も積もれば山となる",
    reading: "ちり も つもれば やま と なる",
    meanings: ["dust piled high becomes a mountain"],
    jlpt: "N2",
    category: "wisdom",
    context: "Small actions accumulate into big results. The Japanese 'compound interest' proverb.",
  }),
  vc({
    word: "出る杭は打たれる",
    reading: "でる くい は うたれる",
    meanings: ["the nail that sticks out gets hammered down"],
    jlpt: "N2",
    category: "society",
    context: "Famous proverb about Japanese conformity culture. Standing out attracts criticism.",
  }),
  vc({
    word: "二兎を追う者は一兎をも得ず",
    reading: "にと を おう もの は いっと を も えず",
    meanings: ["chase two rabbits, catch neither"],
    jlpt: "N1",
    category: "wisdom",
    context: "Trying to do too many things at once → accomplish none.",
  }),
  vc({
    word: "百聞は一見に如かず",
    reading: "ひゃくぶん は いっけん に しかず",
    meanings: ["seeing once is better than hearing 100 times"],
    jlpt: "N1",
    category: "wisdom",
    context: "Direct equivalent of 'a picture is worth a thousand words'.",
  }),
  vc({
    word: "急がば回れ",
    reading: "いそがば まわれ",
    meanings: ["if in a hurry, take the long way"],
    jlpt: "N2",
    category: "wisdom",
    context: "Slow and steady wins. The shortcut often costs more.",
  }),
  vc({
    word: "蛙の子は蛙",
    reading: "かえる の こ は かえる",
    meanings: ["the child of a frog is a frog", "like father, like son"],
    jlpt: "N2",
    category: "society",
  }),
  vc({
    word: "知らぬが仏",
    reading: "しらぬ が ほとけ",
    meanings: ["ignorance is bliss", "lit. not knowing is Buddha"],
    jlpt: "N1",
    category: "wisdom",
    context: "The peace of mind that comes from not knowing something troubling.",
  }),
  vc({
    word: "一期一会",
    reading: "いちご いちえ",
    meanings: ["one time, one meeting", "treasure every encounter"],
    jlpt: "N1",
    category: "philosophy",
    context:
      "Tea-ceremony origin. Every encounter is unique, never to be repeated — treat it accordingly. Often used to invoke mindfulness.",
  }),
  vc({
    word: "井の中の蛙大海を知らず",
    reading: "いのなかの かわず たいかい を しらず",
    meanings: ["a frog in a well doesn't know the ocean"],
    jlpt: "N1",
    category: "wisdom",
    context: "Often shortened to 井の中の蛙. About narrow worldviews.",
  }),
  vc({
    word: "覆水盆に返らず",
    reading: "ふくすい ぼん に かえらず",
    meanings: ["spilt water won't return to the tray", "no use crying over spilt milk"],
    jlpt: "N1",
    category: "wisdom",
  }),
  vc({
    word: "頑張って",
    reading: "がんばって",
    meanings: ["do your best", "good luck"],
    jlpt: "N5",
    category: "encouragement",
    context:
      "Not technically a proverb but the most-used Japanese phrase of encouragement. Said before exams, sports, work, anything difficult. From 頑張る = to persist.",
  }),
  vc({
    word: "お互い様",
    reading: "おたがいさま",
    meanings: ["we're both in the same boat"],
    jlpt: "N3",
    category: "society",
    context:
      "Said when accepting thanks or apology — 'don't mention it, we both do this for each other'. Uniquely Japanese reciprocity concept.",
  }),
];

// ============================================================
// Emit decks
// ============================================================

const decks = [
  {
    file: "vocab_restaurant.json",
    deck_id: "vocab-restaurant",
    deck_name: "Restaurant & Shopping (お店)",
    subtitle: "Menus, ordering, paying, taste · everyday Japan",
    notes:
      "Ordering food, asking for the bill, describing taste (おいしい/まずい/甘い/辛い), and the place categories you'll meet (レストラン, 居酒屋, コンビニ, デパート). Includes the お会計 / 持ち帰り phrases and shopping basics.",
    cards: restaurant,
  },
  {
    file: "vocab_medical.json",
    deck_id: "vocab-medical",
    deck_name: "Medical & Health (医療)",
    subtitle: "Doctor, pharmacy, symptoms, emergencies",
    notes:
      "Health vocabulary you'll need at a 病院, pharmacy, or in an emergency. Includes critical phrases like 風邪を引きました and ◯◯アレルギーがあります. Notes the 病院 vs 美容院 trap.",
    cards: medical,
  },
  {
    file: "vocab_colors.json",
    deck_id: "vocab-colors",
    deck_name: "Colors (色)",
    subtitle: "Primary, neutrals, modifiers — and the 青/緑 history",
    notes:
      "Color vocabulary. Notes the famous 青/緑 history (青信号 = 'blue' light that's actually green) and the い-adjective forms (赤い vs 黄色い vs 茶色い). Modifiers (明るい/暗い/濃い/薄い) close out the deck.",
    cards: colors,
  },
  {
    file: "vocab_animals.json",
    deck_id: "vocab-animals",
    deck_name: "Animals (動物)",
    subtitle: "Pets, farm, wild — plus the meat-name shifts",
    notes:
      "Animal names with the reading-shifts in compound forms (牛 うし → 牛肉 ぎゅうにく). Note that 鳥 means both 'bird' and 'chicken' depending on context.",
    cards: animals,
  },
  {
    file: "vocab_emotions.json",
    deck_id: "vocab-emotions",
    deck_name: "Emotions (感情)",
    subtitle: "Joy, sadness, anger, worry · the inner world",
    notes:
      "Emotion vocabulary with usage contrasts: 嬉しい (one-time joy) vs 楽しい (fun) vs 幸せ (continuous well-being); 心配 vs 安心. Includes 好き/嫌い (the famous な-adjectives that take が, not を).",
    cards: emotions,
  },
  {
    file: "vocab_proverbs.json",
    deck_id: "vocab-proverbs",
    deck_name: "Proverbs (ことわざ)",
    subtitle: "猿も木から落ちる · 七転び八起き · 一期一会",
    notes:
      "Famous Japanese proverbs and idiomatic encouragements. Most are pre-modern wisdom literature — knowing them gets you instant cultural credit, and they pop up in news/business writing more than English proverbs do. Includes the everyday 頑張って and お互い様 closers.",
    cards: proverbs,
  },
];

console.log("Writing batch-4 themed vocab decks → agent-files/\n");
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
  console.log(`  ${d.file.padEnd(28)} ${d.cards.length.toString().padStart(3)} cards`);
}
console.log("\n✓ Batch-4 themed vocab decks written.");
