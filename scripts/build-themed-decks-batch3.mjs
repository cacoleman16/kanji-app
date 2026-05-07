#!/usr/bin/env node
/**
 * Third batch of hand-authored themed vocab decks for Kanjido.
 *
 * Output:
 *   agent-files/vocab_travel.json          (Pro)
 *   agent-files/vocab_weather.json         (Pro)
 *   agent-files/vocab_office.json          (Pro)
 *   agent-files/vocab_verbs_pairs.json     (Pro) — intransitive/transitive pairs
 *   agent-files/vocab_onomatopoeia.json    (Pro)
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
// Travel
// ============================================================

const travel = [
  vc({
    word: "旅行",
    reading: "りょこう",
    meanings: ["trip", "travel"],
    jlpt: "N5",
    category: "general",
    context: "海外旅行 (overseas trip), 国内旅行 (domestic trip).",
  }),
  vc({
    word: "観光",
    reading: "かんこう",
    meanings: ["sightseeing", "tourism"],
    jlpt: "N3",
    category: "general",
    context: "観光地 = tourist spot. 観光客 = tourist.",
  }),
  vc({
    word: "ホテル",
    reading: "ホテル",
    meanings: ["hotel"],
    jlpt: "N5",
    category: "lodging",
  }),
  vc({
    word: "旅館",
    reading: "りょかん",
    meanings: ["traditional Japanese inn"],
    jlpt: "N4",
    category: "lodging",
    context: "Tatami floors, futons, often comes with kaiseki dinner + onsen.",
  }),
  vc({
    word: "民宿",
    reading: "みんしゅく",
    meanings: ["family-run guesthouse"],
    jlpt: "N3",
    category: "lodging",
  }),
  vc({
    word: "予約",
    reading: "よやく",
    meanings: ["reservation"],
    jlpt: "N4",
    category: "general",
    context: "予約する = to reserve. 予約しています = I have a reservation.",
    ex: {
      jp: "ホテルを予約しました。",
      kana: "ほてる を よやく しました。",
      en: "I made a hotel reservation.",
    },
  }),
  // Transport
  vc({
    word: "電車",
    reading: "でんしゃ",
    meanings: ["electric train"],
    jlpt: "N5",
    category: "transport",
    context: "Most urban trains are electric. 列車 (れっしゃ) is more general.",
  }),
  vc({
    word: "新幹線",
    reading: "しんかんせん",
    meanings: ["bullet train"],
    jlpt: "N5",
    category: "transport",
  }),
  vc({
    word: "地下鉄",
    reading: "ちかてつ",
    meanings: ["subway"],
    jlpt: "N5",
    category: "transport",
    context: "Lit. 'underground iron'.",
  }),
  vc({
    word: "バス",
    reading: "バス",
    meanings: ["bus"],
    jlpt: "N5",
    category: "transport",
  }),
  vc({
    word: "タクシー",
    reading: "タクシー",
    meanings: ["taxi"],
    jlpt: "N5",
    category: "transport",
  }),
  vc({
    word: "飛行機",
    reading: "ひこうき",
    meanings: ["airplane"],
    jlpt: "N5",
    category: "transport",
  }),
  vc({
    word: "船",
    reading: "ふね",
    meanings: ["boat", "ship"],
    jlpt: "N4",
    category: "transport",
  }),
  // Places
  vc({
    word: "駅",
    reading: "えき",
    meanings: ["station"],
    jlpt: "N5",
    category: "places",
  }),
  vc({
    word: "空港",
    reading: "くうこう",
    meanings: ["airport"],
    jlpt: "N5",
    category: "places",
  }),
  vc({
    word: "切符",
    reading: "きっぷ",
    meanings: ["ticket"],
    jlpt: "N5",
    category: "objects",
    context: "Often used for transport tickets. Movie/event tickets are usually チケット.",
  }),
  vc({
    word: "荷物",
    reading: "にもつ",
    meanings: ["luggage", "baggage"],
    jlpt: "N5",
    category: "objects",
    context: "Lit. 'load + thing'.",
  }),
  vc({
    word: "地図",
    reading: "ちず",
    meanings: ["map"],
    jlpt: "N5",
    category: "objects",
  }),
  vc({
    word: "道",
    reading: "みち",
    meanings: ["road", "way", "path"],
    jlpt: "N5",
    category: "places",
    context: "Same character as the -do in judo, kendo, kanjido — 'the way'.",
  }),
  vc({
    word: "温泉",
    reading: "おんせん",
    meanings: ["hot spring"],
    jlpt: "N4",
    category: "experiences",
    context: "Lit. 'warm spring'. The cultural tourist staple.",
  }),
  vc({
    word: "お土産",
    reading: "おみやげ",
    meanings: ["souvenir"],
    jlpt: "N5",
    category: "experiences",
    context: "Customary to bring back food souvenirs (especially regional 名物 specialties) for coworkers/family.",
  }),
  vc({
    word: "迷う",
    reading: "まよう",
    meanings: ["to get lost", "to hesitate"],
    jlpt: "N4",
    category: "verbs",
    context: "道に迷う = to get lost (lit. 'be lost in the road').",
  }),
];

// ============================================================
// Weather & Nature
// ============================================================

const weather = [
  // Weather
  vc({
    word: "天気",
    reading: "てんき",
    meanings: ["weather"],
    jlpt: "N5",
    category: "general",
    context: "Polite weather inquiry: いい天気ですね = Nice weather, isn't it?",
  }),
  vc({
    word: "晴れ",
    reading: "はれ",
    meanings: ["sunny", "clear weather"],
    jlpt: "N5",
    category: "weather",
    context: "Verb form: 晴れる = to clear up.",
  }),
  vc({
    word: "曇り",
    reading: "くもり",
    meanings: ["cloudy"],
    jlpt: "N5",
    category: "weather",
    context: "Verb: 曇る = to become cloudy.",
  }),
  vc({
    word: "雨",
    reading: "あめ",
    meanings: ["rain"],
    jlpt: "N5",
    category: "weather",
    context:
      "Same reading as 飴 (candy) — pitch accent distinguishes them in speech (rain = head-accent, candy = flat).",
    ex: {
      jp: "明日は雨が降ります。",
      kana: "あした は あめ が ふります。",
      en: "It will rain tomorrow.",
    },
  }),
  vc({
    word: "雪",
    reading: "ゆき",
    meanings: ["snow"],
    jlpt: "N5",
    category: "weather",
  }),
  vc({
    word: "風",
    reading: "かぜ",
    meanings: ["wind"],
    jlpt: "N5",
    category: "weather",
    context: "Same word/spelling as 風邪 (cold/illness) — context disambiguates.",
  }),
  vc({
    word: "台風",
    reading: "たいふう",
    meanings: ["typhoon"],
    jlpt: "N3",
    category: "weather",
    context: "The English 'typhoon' is borrowed from Japanese (or possibly Chinese 颱風 → JP).",
  }),
  vc({
    word: "嵐",
    reading: "あらし",
    meanings: ["storm"],
    jlpt: "N3",
    category: "weather",
  }),
  vc({
    word: "雷",
    reading: "かみなり",
    meanings: ["thunder", "lightning"],
    jlpt: "N3",
    category: "weather",
    context: "Lit. '神の音 god + sound' historically.",
  }),
  vc({
    word: "霧",
    reading: "きり",
    meanings: ["fog", "mist"],
    jlpt: "N3",
    category: "weather",
  }),
  // Seasons
  vc({
    word: "春",
    reading: "はる",
    meanings: ["spring (season)"],
    jlpt: "N5",
    category: "seasons",
  }),
  vc({
    word: "夏",
    reading: "なつ",
    meanings: ["summer"],
    jlpt: "N5",
    category: "seasons",
  }),
  vc({
    word: "秋",
    reading: "あき",
    meanings: ["autumn", "fall"],
    jlpt: "N5",
    category: "seasons",
    context: "Same reading as 飽き (boredom) — context disambiguates.",
  }),
  vc({
    word: "冬",
    reading: "ふゆ",
    meanings: ["winter"],
    jlpt: "N5",
    category: "seasons",
  }),
  vc({
    word: "梅雨",
    reading: "つゆ",
    meanings: ["rainy season"],
    jlpt: "N3",
    category: "seasons",
    context: "Lit. 'plum rain' — the early-summer monsoon, roughly mid-June to mid-July.",
  }),
  // Geography / nature
  vc({
    word: "山",
    reading: "やま",
    meanings: ["mountain"],
    jlpt: "N5",
    category: "geography",
    context: "Compounds use サン: 富士山 ふじさん = Mt. Fuji.",
  }),
  vc({
    word: "川",
    reading: "かわ",
    meanings: ["river"],
    jlpt: "N5",
    category: "geography",
    context: "河 is also かわ but used for larger rivers; 川 covers most everyday cases.",
  }),
  vc({
    word: "海",
    reading: "うみ",
    meanings: ["sea", "ocean"],
    jlpt: "N5",
    category: "geography",
  }),
  vc({
    word: "湖",
    reading: "みずうみ",
    meanings: ["lake"],
    jlpt: "N4",
    category: "geography",
  }),
  vc({
    word: "森",
    reading: "もり",
    meanings: ["forest"],
    jlpt: "N4",
    category: "geography",
    context: "森林 (しんりん) is the formal compound 'forest/woodland'.",
  }),
  vc({
    word: "空",
    reading: "そら",
    meanings: ["sky"],
    jlpt: "N5",
    category: "geography",
    context: "Also 'empty' as くう in compounds (空気 = air).",
  }),
  vc({
    word: "星",
    reading: "ほし",
    meanings: ["star"],
    jlpt: "N4",
    category: "geography",
  }),
  vc({
    word: "月",
    reading: "つき",
    meanings: ["moon"],
    jlpt: "N5",
    category: "geography",
    context: "Same kanji as 月 (month) — つき = moon (kun), がつ/げつ = month (on).",
  }),
  vc({
    word: "太陽",
    reading: "たいよう",
    meanings: ["sun"],
    jlpt: "N3",
    category: "geography",
    context: "日 (sun) is the kanji-element word; 太陽 is the formal celestial-body word.",
  }),
  vc({
    word: "花",
    reading: "はな",
    meanings: ["flower"],
    jlpt: "N5",
    category: "nature",
    context: "Same reading as 鼻 (nose).",
  }),
  vc({
    word: "桜",
    reading: "さくら",
    meanings: ["cherry blossom"],
    jlpt: "N3",
    category: "nature",
    context: "The national flower; 花見 = cherry-blossom viewing.",
  }),
];

// ============================================================
// Office / Business
// ============================================================

const office = [
  vc({
    word: "会社",
    reading: "かいしゃ",
    meanings: ["company"],
    jlpt: "N5",
    category: "general",
    context: "会社員 = company employee, 会社に行く = go to work.",
  }),
  vc({
    word: "仕事",
    reading: "しごと",
    meanings: ["work", "job"],
    jlpt: "N5",
    category: "general",
  }),
  vc({
    word: "事務所",
    reading: "じむしょ",
    meanings: ["office"],
    jlpt: "N4",
    category: "general",
    context: "オフィス is the loanword and equally common.",
  }),
  vc({
    word: "会議",
    reading: "かいぎ",
    meanings: ["meeting"],
    jlpt: "N4",
    category: "events",
    context: "会議室 = meeting room.",
  }),
  vc({
    word: "プレゼン",
    reading: "プレゼン",
    meanings: ["presentation"],
    jlpt: "N3",
    category: "events",
    context: "Shortened from プレゼンテーション.",
  }),
  vc({
    word: "資料",
    reading: "しりょう",
    meanings: ["documents", "materials"],
    jlpt: "N3",
    category: "objects",
  }),
  vc({
    word: "書類",
    reading: "しょるい",
    meanings: ["paperwork", "documents"],
    jlpt: "N3",
    category: "objects",
  }),
  vc({
    word: "メール",
    reading: "メール",
    meanings: ["email"],
    jlpt: "N5",
    category: "comms",
    context: "メールを送る = send an email.",
  }),
  vc({
    word: "電話",
    reading: "でんわ",
    meanings: ["telephone", "phone call"],
    jlpt: "N5",
    category: "comms",
    context: "電話する / 電話をかける = make a phone call.",
  }),
  vc({
    word: "返事",
    reading: "へんじ",
    meanings: ["reply", "response"],
    jlpt: "N4",
    category: "comms",
    context: "返事する = to reply.",
  }),
  vc({
    word: "上司",
    reading: "じょうし",
    meanings: ["boss", "supervisor"],
    jlpt: "N3",
    category: "people",
    context: "Direct counterpart: 部下 (ぶか) = subordinate.",
  }),
  vc({
    word: "同僚",
    reading: "どうりょう",
    meanings: ["colleague", "coworker"],
    jlpt: "N3",
    category: "people",
  }),
  vc({
    word: "顧客",
    reading: "こきゃく",
    meanings: ["customer", "client"],
    jlpt: "N2",
    category: "people",
    context: "More formal than お客さん; common in business writing.",
  }),
  vc({
    word: "出張",
    reading: "しゅっちょう",
    meanings: ["business trip"],
    jlpt: "N3",
    category: "events",
  }),
  vc({
    word: "残業",
    reading: "ざんぎょう",
    meanings: ["overtime work"],
    jlpt: "N3",
    category: "events",
    context: "Lit. 'remaining + work'. 残業する = work overtime.",
  }),
  vc({
    word: "休み",
    reading: "やすみ",
    meanings: ["holiday", "day off"],
    jlpt: "N5",
    category: "events",
    context: "夏休み = summer break, 冬休み = winter break, 連休 = string of holidays.",
  }),
  vc({
    word: "給料",
    reading: "きゅうりょう",
    meanings: ["salary", "wages"],
    jlpt: "N3",
    category: "money",
  }),
  vc({
    word: "仕事を頑張る",
    reading: "しごと を がんばる",
    meanings: ["work hard"],
    jlpt: "N5",
    category: "phrases",
    context: "頑張る is one of the most-used Japanese verbs — try hard / do one's best.",
    ex: {
      jp: "今日も仕事を頑張ります。",
      kana: "きょう も しごと を がんばります。",
      en: "I'll work hard at my job today too.",
    },
  }),
  vc({
    word: "お疲れ様",
    reading: "おつかれさま",
    meanings: ["thanks for your hard work", "good job"],
    jlpt: "N5",
    category: "phrases",
    context:
      "The most-used office phrase. Greet coworkers with お疲れ様です in passing; お疲れ様でした when leaving for the day.",
  }),
  vc({
    word: "よろしくお願いします",
    reading: "よろしく おねがい します",
    meanings: ["please / I look forward to working with you"],
    jlpt: "N5",
    category: "phrases",
    context:
      "Untranslatable opener/closer. Used to ask favors, end emails, after introductions, before any task. Casual: よろしく.",
  }),
];

// ============================================================
// Intransitive / transitive verb pairs
// ============================================================

const verbsPairs = [
  vc({
    word: "開く ↔ 開ける",
    reading: "あく ↔ あける",
    meanings: ["open (intrans.) ↔ open (trans.)"],
    jlpt: "N5",
    category: "pairs",
    context:
      "ドアが開く = the door opens (it just does). ドアを開ける = (someone) opens the door. The intrans/trans split is a major learner stumbling block.",
    ex: {
      jp: "ドアが開きました。 / ドアを開けました。",
      kana: "どあ が あきました。 / どあ を あけました。",
      en: "The door opened. / I opened the door.",
    },
  }),
  vc({
    word: "閉まる ↔ 閉める",
    reading: "しまる ↔ しめる",
    meanings: ["close (intrans.) ↔ close (trans.)"],
    jlpt: "N5",
    category: "pairs",
  }),
  vc({
    word: "始まる ↔ 始める",
    reading: "はじまる ↔ はじめる",
    meanings: ["begin (intrans.) ↔ begin (trans.)"],
    jlpt: "N5",
    category: "pairs",
    context: "授業が始まる = class begins. 授業を始める = begin class.",
  }),
  vc({
    word: "終わる ↔ 終える",
    reading: "おわる ↔ おえる",
    meanings: ["end (intrans.) ↔ end (trans.)"],
    jlpt: "N5",
    category: "pairs",
    context:
      "終わる is far more common in everyday speech, even for active 'finishing' (宿題が終わった = I finished my homework). 終える is more formal/literary.",
  }),
  vc({
    word: "上がる ↔ 上げる",
    reading: "あがる ↔ あげる",
    meanings: ["go up (intrans.) ↔ raise (trans.)"],
    jlpt: "N5",
    category: "pairs",
    context: "値段が上がる = the price goes up. 手を上げる = raise your hand.",
  }),
  vc({
    word: "下がる ↔ 下げる",
    reading: "さがる ↔ さげる",
    meanings: ["go down (intrans.) ↔ lower (trans.)"],
    jlpt: "N4",
    category: "pairs",
  }),
  vc({
    word: "出る ↔ 出す",
    reading: "でる ↔ だす",
    meanings: ["go out (intrans.) ↔ take out (trans.)"],
    jlpt: "N5",
    category: "pairs",
    context: "家を出る = leave home. ゴミを出す = take out the trash.",
  }),
  vc({
    word: "入る ↔ 入れる",
    reading: "はいる ↔ いれる",
    meanings: ["enter (intrans.) ↔ insert (trans.)"],
    jlpt: "N5",
    category: "pairs",
  }),
  vc({
    word: "回る ↔ 回す",
    reading: "まわる ↔ まわす",
    meanings: ["spin (intrans.) ↔ spin (trans.)"],
    jlpt: "N4",
    category: "pairs",
  }),
  vc({
    word: "壊れる ↔ 壊す",
    reading: "こわれる ↔ こわす",
    meanings: ["break (intrans.) ↔ break (trans.)"],
    jlpt: "N4",
    category: "pairs",
    context: "携帯が壊れた = my phone broke. 携帯を壊した = I broke (someone's) phone.",
  }),
  vc({
    word: "起きる ↔ 起こす",
    reading: "おきる ↔ おこす",
    meanings: ["wake up (intrans.) ↔ wake (someone) up (trans.)"],
    jlpt: "N5",
    category: "pairs",
  }),
  vc({
    word: "落ちる ↔ 落とす",
    reading: "おちる ↔ おとす",
    meanings: ["fall (intrans.) ↔ drop (trans.)"],
    jlpt: "N4",
    category: "pairs",
    context: "Also used metaphorically: 試験に落ちる = fail an exam, 財布を落とす = lose a wallet.",
  }),
  vc({
    word: "決まる ↔ 決める",
    reading: "きまる ↔ きめる",
    meanings: ["be decided ↔ decide"],
    jlpt: "N4",
    category: "pairs",
    context: "決まりました = it's been decided / settled. 決めました = I decided.",
  }),
  vc({
    word: "見える ↔ 見せる",
    reading: "みえる ↔ みせる",
    meanings: ["be visible ↔ show"],
    jlpt: "N4",
    category: "pairs",
    context:
      "見える is special: it's the spontaneous-perception form of 見る ('something is visible'). 見せる is causative-of-見る (cause-to-see = show).",
  }),
  vc({
    word: "聞こえる ↔ 聞く",
    reading: "きこえる ↔ きく",
    meanings: ["be audible ↔ listen / hear / ask"],
    jlpt: "N4",
    category: "pairs",
    context: "Counterpart of the 見える/見せる pattern — 聞こえる = something is audible, vs 聞く = actively listen/ask.",
  }),
  vc({
    word: "止まる ↔ 止める",
    reading: "とまる ↔ とめる",
    meanings: ["stop (intrans.) ↔ stop (trans.)"],
    jlpt: "N5",
    category: "pairs",
  }),
  vc({
    word: "集まる ↔ 集める",
    reading: "あつまる ↔ あつめる",
    meanings: ["gather (intrans.) ↔ collect (trans.)"],
    jlpt: "N4",
    category: "pairs",
    context: "切手を集める = collect stamps. 集まる is everyone gathering on their own.",
  }),
  vc({
    word: "返る ↔ 返す",
    reading: "かえる ↔ かえす",
    meanings: ["return (intrans.) ↔ give back (trans.)"],
    jlpt: "N4",
    category: "pairs",
    context:
      "Note: 帰る (go home) is yet a different かえる. 返る = (something) returns. 返す = give (something) back.",
  }),
];

// ============================================================
// Onomatopoeia (giseigo + gitaigo)
// ============================================================

const onomatopoeia = [
  vc({
    word: "わくわく",
    reading: "わくわく",
    meanings: ["excited (anticipation)"],
    jlpt: "N3",
    category: "feelings",
    context: "Pleasant excitement. Often + する to verb: わくわくする = feel excited.",
  }),
  vc({
    word: "どきどき",
    reading: "どきどき",
    meanings: ["heart pounding (nervousness, infatuation)"],
    jlpt: "N3",
    category: "feelings",
    context: "From the sound of a beating heart. Nervous before a date / interview / scary moment.",
  }),
  vc({
    word: "いらいら",
    reading: "いらいら",
    meanings: ["irritated", "frustrated"],
    jlpt: "N3",
    category: "feelings",
  }),
  vc({
    word: "びっくり",
    reading: "びっくり",
    meanings: ["surprised", "startled"],
    jlpt: "N4",
    category: "feelings",
    context: "びっくりする = be surprised.",
  }),
  vc({
    word: "うとうと",
    reading: "うとうと",
    meanings: ["dozing off"],
    jlpt: "N3",
    category: "states",
    context: "うとうとする = nod off.",
  }),
  vc({
    word: "ぐっすり",
    reading: "ぐっすり",
    meanings: ["sound asleep"],
    jlpt: "N3",
    category: "states",
    context: "ぐっすり寝る = sleep soundly.",
  }),
  vc({
    word: "へとへと",
    reading: "へとへと",
    meanings: ["exhausted", "worn out"],
    jlpt: "N3",
    category: "states",
  }),
  vc({
    word: "ぺこぺこ",
    reading: "ぺこぺこ",
    meanings: ["very hungry"],
    jlpt: "N3",
    category: "states",
    context: "お腹がぺこぺこ = stomach is empty / starving.",
  }),
  vc({
    word: "のんびり",
    reading: "のんびり",
    meanings: ["leisurely", "relaxed"],
    jlpt: "N3",
    category: "states",
  }),
  vc({
    word: "ぼんやり",
    reading: "ぼんやり",
    meanings: ["absent-minded", "blurry"],
    jlpt: "N3",
    category: "states",
    context: "Both for being spaced-out and for things being out-of-focus.",
  }),
  // Sounds (giseigo)
  vc({
    word: "ざあざあ",
    reading: "ざあざあ",
    meanings: ["sound of pouring rain"],
    jlpt: "N3",
    category: "sounds",
    context: "雨がざあざあ降る = it's raining hard.",
  }),
  vc({
    word: "ぱらぱら",
    reading: "ぱらぱら",
    meanings: ["sound of light rain", "scattered"],
    jlpt: "N3",
    category: "sounds",
    context: "Used for light rain (雨がぱらぱら降る) or for things scattered (人がぱらぱら集まる).",
  }),
  vc({
    word: "ごろごろ",
    reading: "ごろごろ",
    meanings: ["thunder rumbling", "lazing around", "rolling"],
    jlpt: "N3",
    category: "sounds",
    context: "Thunder; or 家でごろごろする = lounging at home all day.",
  }),
  vc({
    word: "わんわん",
    reading: "わんわん",
    meanings: ["dog barking", "woof woof"],
    jlpt: "N3",
    category: "sounds",
    context: "Children also call dogs themselves わんわん.",
  }),
  vc({
    word: "にゃーにゃー",
    reading: "にゃーにゃー",
    meanings: ["cat meowing"],
    jlpt: "N3",
    category: "sounds",
  }),
  // Texture / movement (gitaigo)
  vc({
    word: "ふわふわ",
    reading: "ふわふわ",
    meanings: ["fluffy", "soft and airy"],
    jlpt: "N3",
    category: "texture",
    context: "Pancakes, cotton, clouds. Adjective use: ふわふわのパンケーキ.",
  }),
  vc({
    word: "もちもち",
    reading: "もちもち",
    meanings: ["soft & chewy"],
    jlpt: "N3",
    category: "texture",
    context: "From 餅 (mochi). Used for chewy bread, ramen noodles, dumplings, even skin.",
  }),
  vc({
    word: "つるつる",
    reading: "つるつる",
    meanings: ["smooth", "slippery"],
    jlpt: "N3",
    category: "texture",
    context: "Polished surface; also used for slurping noodles.",
  }),
  vc({
    word: "ぴかぴか",
    reading: "ぴかぴか",
    meanings: ["sparkling", "shiny new"],
    jlpt: "N3",
    category: "texture",
    context: "ぴかぴかの一年生 is a famous phrase: a 'shiny new' first-grader (just started school).",
  }),
  vc({
    word: "きらきら",
    reading: "きらきら",
    meanings: ["glittering", "twinkling"],
    jlpt: "N3",
    category: "texture",
    context: "Stars, eyes, water surface in sun.",
  }),
];

// ============================================================
// Emit decks
// ============================================================

const decks = [
  {
    file: "vocab_travel.json",
    deck_id: "vocab-travel",
    deck_name: "Travel (旅行)",
    subtitle: "Trains, hotels, sightseeing — everything for a Japan trip",
    notes:
      "Travel vocabulary you'll meet at the airport, in train stations, at ryokan check-in counters, and on sightseeing days.",
    cards: travel,
  },
  {
    file: "vocab_weather.json",
    deck_id: "vocab-weather",
    deck_name: "Weather & Nature (天気・自然)",
    subtitle: "Seasons · weather · mountains · sea · cherry blossoms",
    notes:
      "The weather small-talk vocabulary plus seasons and core nature words. Notes the homophones 雨 vs 飴 and 鼻 vs 花.",
    cards: weather,
  },
  {
    file: "vocab_office.json",
    deck_id: "vocab-office",
    deck_name: "Office & Business (仕事)",
    subtitle: "会議 · 上司 · お疲れ様 — workplace vocabulary",
    notes:
      "Office vocabulary plus the irreplaceable phrases お疲れ様 and よろしくお願いします that hold Japanese workplace communication together.",
    cards: office,
  },
  {
    file: "vocab_verbs_pairs.json",
    deck_id: "vocab-verbs-pairs",
    deck_name: "Intransitive ↔ Transitive verbs",
    subtitle: "開く/開ける · 閉まる/閉める — the famous verb pairs",
    notes:
      "Japanese verb pairs that English collapses into a single word. The pair pattern is one of the biggest stumbling blocks for learners — 'the door opens' (intrans) vs 'I open the door' (trans). Each card pairs the two and shows both in context.",
    cards: verbsPairs,
  },
  {
    file: "vocab_onomatopoeia.json",
    deck_id: "vocab-onomatopoeia",
    deck_name: "Onomatopoeia (擬音語・擬態語)",
    subtitle: "わくわく · どきどき · ぴかぴか — sound + state words",
    notes:
      "Both giseigo (sound-imitation: わんわん, ざあざあ) and gitaigo (state/feeling words that don't 'sound' like anything: ふわふわ, わくわく). Used everywhere in everyday Japanese, in manga, and in advertising — but underweighted in classroom curricula. This deck is the quickest way to start sounding native-fluent.",
    cards: onomatopoeia,
  },
];

console.log("Writing batch-3 themed vocab decks → agent-files/\n");
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
  console.log(`  ${d.file.padEnd(30)} ${d.cards.length.toString().padStart(3)} cards`);
}
console.log("\n✓ Batch-3 themed vocab decks written.");
