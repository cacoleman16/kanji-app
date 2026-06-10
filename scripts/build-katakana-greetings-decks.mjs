#!/usr/bin/env node
/**
 * Katakana loanwords + Greetings & set phrases decks.
 *
 * Output:
 *   agent-files/vocab_katakana_words.json     (Pro)
 *   agent-files/vocab_phrases_greetings.json  (Pro)
 *
 * The katakana deck doubles as katakana reading practice AND a
 * false-friend minefield map: マンション is not a mansion, スマート is
 * not smart, クレーム is not a claim. Every false friend gets an explicit
 * pitfall note in `context` — these never self-correct with exposure
 * because the learner's English keeps "confirming" the wrong meaning.
 *
 * The greetings deck covers the set phrases textbooks romanize on page 1
 * and never test: aisatsu, mealtime pairs, leaving/returning home pairs,
 * shop Japanese, and apology/thanks register levels.
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
// Katakana loanwords
// ============================================================

const katakana = [
  // ---- False friends (the headline content) ----
  vc({
    word: "マンション",
    reading: "マンション",
    meanings: ["condominium", "apartment building (concrete)"],
    jlpt: "N4",
    category: "false_friend",
    context:
      "FALSE FRIEND: not a mansion. A mid/high-rise concrete apartment. A wooden low-rise is アパート; an actual mansion is 豪邸 (ごうてい).",
    ex: {
      jp: "駅の近くのマンションに住んでいます。",
      kana: "えき の ちかく の マンション に すんでいます。",
      en: "I live in a condo near the station.",
    },
  }),
  vc({
    word: "スマート",
    reading: "スマート",
    meanings: ["slim", "stylish"],
    jlpt: "N3",
    category: "false_friend",
    context:
      "FALSE FRIEND: describes a slim figure or sleek style, not intelligence. 'Smart person' = 頭がいい人.",
  }),
  vc({
    word: "ナイーブ",
    reading: "ナイーブ",
    meanings: ["sensitive", "delicate (emotionally)"],
    jlpt: "N2",
    category: "false_friend",
    context:
      "FALSE FRIEND: means emotionally sensitive/fragile, often sympathetically. English 'naive' (gullible) is 世間知らず or 甘い.",
  }),
  vc({
    word: "クレーム",
    reading: "クレーム",
    meanings: ["complaint"],
    jlpt: "N2",
    category: "false_friend",
    context:
      "FALSE FRIEND: a customer complaint, not an insurance claim. クレームをつける = to complain. A claim (assertion) is 主張.",
    ex: {
      jp: "お客様からクレームが来た。",
      kana: "おきゃくさま から クレーム が きた。",
      en: "A complaint came in from a customer.",
    },
  }),
  vc({
    word: "サービス",
    reading: "サービス",
    meanings: ["service", "free of charge", "on the house"],
    jlpt: "N4",
    category: "false_friend",
    context:
      "Partly false friend: besides 'service', it commonly means a freebie. これはサービスです = this one's on the house.",
  }),
  vc({
    word: "テンション",
    reading: "テンション",
    meanings: ["mood", "energy level"],
    jlpt: "N2",
    category: "false_friend",
    context:
      "FALSE FRIEND: emotional energy, not physical tension. テンションが高い = hyped/excited. テンションが低い = low-energy. Stress/tension is 緊張.",
    ex: {
      jp: "今日はテンションが高いね。",
      kana: "きょう は テンション が たかい ね。",
      en: "You're in high spirits today, huh.",
    },
  }),
  vc({
    word: "ハンサム",
    reading: "ハンサム",
    meanings: ["handsome (men only)"],
    jlpt: "N4",
    category: "false_friend",
    context:
      "Only describes men, and sounds slightly dated — かっこいい is the everyday word. Never used for objects or salaries the way English uses 'handsome'.",
  }),
  vc({
    word: "ユニーク",
    reading: "ユニーク",
    meanings: ["quirky", "unusual", "one of a kind"],
    jlpt: "N2",
    category: "false_friend",
    context:
      "Leans 'amusingly odd' more than English 'unique'. ユニークな人 may mean a weirdo (affectionately). Strictly one-of-a-kind = 唯一の.",
  }),
  vc({
    word: "バイキング",
    reading: "バイキング",
    meanings: ["buffet", "all-you-can-eat"],
    jlpt: "N3",
    category: "false_friend",
    context:
      "FALSE FRIEND: 'Viking' means a buffet — named after a 1958 Tokyo restaurant inspired by smörgåsbord. 食べ放題 is the native synonym.",
  }),
  vc({
    word: "カンニング",
    reading: "カンニング",
    meanings: ["cheating (on a test)"],
    jlpt: "N2",
    category: "false_friend",
    context: "FALSE FRIEND: from 'cunning' but means exam cheating. カンニングする = to cheat on a test.",
  }),
  vc({
    word: "アルバイト",
    reading: "アルバイト",
    meanings: ["part-time job"],
    jlpt: "N5",
    category: "loanword_german",
    context:
      "From German 'Arbeit' (work), not English. Usually shortened to バイト. A full-time job is 仕事 or 正社員 status.",
    ex: {
      jp: "コンビニでアルバイトをしています。",
      kana: "コンビニ で アルバイト を しています。",
      en: "I work part-time at a convenience store.",
    },
  }),
  vc({
    word: "ホッチキス",
    reading: "ホッチキス",
    meanings: ["stapler"],
    jlpt: "N2",
    category: "false_friend",
    context: "From the Hotchkiss brand name. No English speaker will guess this one — just memorize it.",
  }),
  vc({
    word: "シャープペンシル",
    reading: "シャープペンシル",
    meanings: ["mechanical pencil"],
    jlpt: "N3",
    category: "false_friend",
    context: "Wasei-eigo (made-in-Japan English). Always shortened to シャーペン in real life.",
  }),
  vc({
    word: "ペットボトル",
    reading: "ペットボトル",
    meanings: ["plastic bottle"],
    jlpt: "N3",
    category: "false_friend",
    context: "From PET (polyethylene terephthalate), nothing to do with pets.",
  }),
  vc({
    word: "コンセント",
    reading: "コンセント",
    meanings: ["electrical outlet"],
    jlpt: "N3",
    category: "false_friend",
    context: "FALSE FRIEND: a wall socket, not consent. Consent is 同意.",
    ex: {
      jp: "コンセントはどこにありますか。",
      kana: "コンセント は どこ に あります か。",
      en: "Where is there an outlet?",
    },
  }),
  vc({
    word: "リフォーム",
    reading: "リフォーム",
    meanings: ["renovation", "remodeling"],
    jlpt: "N2",
    category: "false_friend",
    context: "Home renovation, not personal/political reform. Reform is 改革.",
  }),
  vc({
    word: "マイペース",
    reading: "マイペース",
    meanings: ["doing things one's own way", "at one's own pace"],
    jlpt: "N2",
    category: "wasei_eigo",
    context:
      "Wasei-eigo. Describes a personality: unhurried, unaffected by others. Can be a gentle criticism (oblivious) or praise (steady).",
  }),
  vc({
    word: "サラリーマン",
    reading: "サラリーマン",
    meanings: ["male office worker", "company employee"],
    jlpt: "N4",
    category: "wasei_eigo",
    context: "Wasei-eigo: salary + man. Female equivalent is OL (オーエル, 'office lady').",
  }),
  vc({
    word: "ガソリンスタンド",
    reading: "ガソリンスタンド",
    meanings: ["gas station"],
    jlpt: "N3",
    category: "wasei_eigo",
    context: "Wasei-eigo — English says 'gas station', not 'gasoline stand'.",
  }),
  vc({
    word: "フライドポテト",
    reading: "フライドポテト",
    meanings: ["french fries"],
    jlpt: "N3",
    category: "wasei_eigo",
    context: "Wasei-eigo — fries, not a whole fried potato. ポテト alone usually means fries too.",
  }),
  // ---- Everyday high-frequency loanwords ----
  vc({
    word: "コンビニ",
    reading: "コンビニ",
    meanings: ["convenience store"],
    jlpt: "N4",
    category: "daily_life",
    context: "Clipped from コンビニエンスストア. Japanese clips long loanwords aggressively — learn the clipped forms.",
  }),
  vc({
    word: "スーパー",
    reading: "スーパー",
    meanings: ["supermarket"],
    jlpt: "N5",
    category: "daily_life",
  }),
  vc({
    word: "デパート",
    reading: "デパート",
    meanings: ["department store"],
    jlpt: "N5",
    category: "daily_life",
  }),
  vc({
    word: "エアコン",
    reading: "エアコン",
    meanings: ["air conditioner"],
    jlpt: "N4",
    category: "daily_life",
    context: "Clipped from エアーコンディショナー. Covers both cooling and heating modes.",
  }),
  vc({
    word: "テレビ",
    reading: "テレビ",
    meanings: ["TV", "television"],
    jlpt: "N5",
    category: "daily_life",
  }),
  vc({
    word: "パソコン",
    reading: "パソコン",
    meanings: ["computer", "PC"],
    jlpt: "N4",
    category: "technology",
    context: "Clipped from パーソナルコンピューター. A laptop specifically is ノートパソコン.",
  }),
  vc({
    word: "スマホ",
    reading: "スマホ",
    meanings: ["smartphone"],
    jlpt: "N3",
    category: "technology",
    context: "Clipped from スマートフォン. 携帯 (けいたい) is the older general word for mobile phone.",
    ex: {
      jp: "スマホの充電が切れた。",
      kana: "スマホ の じゅうでん が きれた。",
      en: "My phone's battery died.",
    },
  }),
  vc({
    word: "メール",
    reading: "メール",
    meanings: ["email", "text message"],
    jlpt: "N4",
    category: "technology",
    context: "Covers both email and SMS. Postal mail is 郵便 — never メール.",
  }),
  vc({
    word: "アプリ",
    reading: "アプリ",
    meanings: ["app"],
    jlpt: "N3",
    category: "technology",
  }),
  vc({
    word: "ニュース",
    reading: "ニュース",
    meanings: ["news"],
    jlpt: "N5",
    category: "media",
  }),
  vc({
    word: "アニメ",
    reading: "アニメ",
    meanings: ["animation", "anime"],
    jlpt: "N4",
    category: "media",
  }),
  vc({
    word: "ドラマ",
    reading: "ドラマ",
    meanings: ["TV drama", "series"],
    jlpt: "N4",
    category: "media",
    context: "Primarily a TV series, not theatrical drama (演劇).",
  }),
  vc({
    word: "ゲーム",
    reading: "ゲーム",
    meanings: ["video game", "game"],
    jlpt: "N5",
    category: "media",
  }),
  vc({
    word: "カラオケ",
    reading: "カラオケ",
    meanings: ["karaoke"],
    jlpt: "N4",
    category: "leisure",
    context: "空 (から, empty) + オケ (orchestra) — a rare kana-kanji hybrid that went global.",
  }),
  vc({
    word: "レストラン",
    reading: "レストラン",
    meanings: ["restaurant"],
    jlpt: "N5",
    category: "food",
    context: "Implies Western-style or upscale; a casual eatery is 食堂, a Japanese restaurant is 和食屋 or 料理屋.",
  }),
  vc({
    word: "ラーメン",
    reading: "ラーメン",
    meanings: ["ramen"],
    jlpt: "N5",
    category: "food",
  }),
  vc({
    word: "パン",
    reading: "パン",
    meanings: ["bread"],
    jlpt: "N5",
    category: "food",
    context: "From Portuguese 'pão' (16th century). Not all katakana words come from English.",
  }),
  vc({
    word: "コーヒー",
    reading: "コーヒー",
    meanings: ["coffee"],
    jlpt: "N5",
    category: "food",
    ex: {
      jp: "コーヒーをもう一杯ください。",
      kana: "コーヒー を もう いっぱい ください。",
      en: "One more coffee, please.",
    },
  }),
  vc({
    word: "ビール",
    reading: "ビール",
    meanings: ["beer"],
    jlpt: "N5",
    category: "food",
    context: "From Dutch 'bier'. とりあえずビール = 'beer for now' — the classic first order.",
  }),
  vc({
    word: "ジュース",
    reading: "ジュース",
    meanings: ["juice", "soft drink"],
    jlpt: "N5",
    category: "food",
    context: "Broader than English: any sweet soft drink can be ジュース, not just fruit juice.",
  }),
  vc({
    word: "サラダ",
    reading: "サラダ",
    meanings: ["salad"],
    jlpt: "N5",
    category: "food",
  }),
  vc({
    word: "デザート",
    reading: "デザート",
    meanings: ["dessert"],
    jlpt: "N4",
    category: "food",
    context: "Watch the vowels vs デザイン (design) and 砂漠 (desert, the dry kind).",
  }),
  vc({
    word: "アイスクリーム",
    reading: "アイスクリーム",
    meanings: ["ice cream"],
    jlpt: "N5",
    category: "food",
    context: "Usually clipped to アイス, which covers popsicles too.",
  }),
  vc({
    word: "ホテル",
    reading: "ホテル",
    meanings: ["hotel"],
    jlpt: "N5",
    category: "travel",
    context: "Western-style. A traditional inn is 旅館 (りょかん).",
  }),
  vc({
    word: "バス",
    reading: "バス",
    meanings: ["bus"],
    jlpt: "N5",
    category: "travel",
    context: "Same katakana as 'bath' in バスルーム — context decides.",
  }),
  vc({
    word: "タクシー",
    reading: "タクシー",
    meanings: ["taxi"],
    jlpt: "N5",
    category: "travel",
  }),
  vc({
    word: "ホーム",
    reading: "ホーム",
    meanings: ["train platform"],
    jlpt: "N4",
    category: "travel",
    context: "Clipped from プラットホーム — so 'home' on station signs means the platform, not home.",
    ex: {
      jp: "三番ホームから出発します。",
      kana: "さんばん ホーム から しゅっぱつ します。",
      en: "Departing from platform 3.",
    },
  }),
  vc({
    word: "チケット",
    reading: "チケット",
    meanings: ["ticket"],
    jlpt: "N4",
    category: "travel",
    context: "Event/plane tickets. Train tickets are usually 切符 (きっぷ).",
  }),
  vc({
    word: "パスポート",
    reading: "パスポート",
    meanings: ["passport"],
    jlpt: "N4",
    category: "travel",
  }),
  vc({
    word: "カメラ",
    reading: "カメラ",
    meanings: ["camera"],
    jlpt: "N5",
    category: "objects",
  }),
  vc({
    word: "プレゼント",
    reading: "プレゼント",
    meanings: ["present", "gift"],
    jlpt: "N5",
    category: "objects",
    context: "Casual gifts. Formal/seasonal gift-giving uses 贈り物 or 御中元/御歳暮.",
  }),
  vc({
    word: "ドア",
    reading: "ドア",
    meanings: ["door (Western-style)"],
    jlpt: "N5",
    category: "objects",
    context: "Hinged Western doors. Sliding doors are 戸 (と) or 引き戸; the generic kanji word is 扉 (とびら).",
  }),
  vc({
    word: "ベッド",
    reading: "ベッド",
    meanings: ["bed"],
    jlpt: "N5",
    category: "objects",
    context: "Watch the voicing: ベッド (bed) vs ペット (pet). Dakuten discipline matters.",
  }),
  vc({
    word: "シャワー",
    reading: "シャワー",
    meanings: ["shower"],
    jlpt: "N5",
    category: "objects",
    ex: {
      jp: "シャワーを浴びてから寝ます。",
      kana: "シャワー を あびて から ねます。",
      en: "I take a shower and then go to bed.",
    },
  }),
  vc({
    word: "トイレ",
    reading: "トイレ",
    meanings: ["toilet", "bathroom"],
    jlpt: "N5",
    category: "objects",
    context: "The room itself. Politer: お手洗い (おてあらい). Asking for the 'bathroom' (バスルーム) will get you a bath.",
  }),
  vc({
    word: "エレベーター",
    reading: "エレベーター",
    meanings: ["elevator"],
    jlpt: "N4",
    category: "objects",
  }),
  vc({
    word: "エスカレーター",
    reading: "エスカレーター",
    meanings: ["escalator"],
    jlpt: "N4",
    category: "objects",
  }),
  vc({
    word: "ボタン",
    reading: "ボタン",
    meanings: ["button"],
    jlpt: "N4",
    category: "objects",
    context: "From Portuguese 'botão'. Both clothing buttons and push buttons.",
  }),
  vc({
    word: "ポケット",
    reading: "ポケット",
    meanings: ["pocket"],
    jlpt: "N4",
    category: "objects",
  }),
  vc({
    word: "ネクタイ",
    reading: "ネクタイ",
    meanings: ["necktie"],
    jlpt: "N4",
    category: "clothing",
  }),
  vc({
    word: "シャツ",
    reading: "シャツ",
    meanings: ["shirt"],
    jlpt: "N5",
    category: "clothing",
    context: "ワイシャツ (dress shirt) comes from 'white shirt' — regardless of its color.",
  }),
  vc({
    word: "ズボン",
    reading: "ズボン",
    meanings: ["trousers", "pants"],
    jlpt: "N5",
    category: "clothing",
    context: "Likely from French 'jupon'. パンツ increasingly means trousers too — but classically means underwear. Tread carefully.",
  }),
  vc({
    word: "コート",
    reading: "コート",
    meanings: ["coat", "court (sports)"],
    jlpt: "N5",
    category: "clothing",
    context: "Same katakana for a winter coat and a tennis court.",
  }),
  vc({
    word: "スカート",
    reading: "スカート",
    meanings: ["skirt"],
    jlpt: "N5",
    category: "clothing",
  }),
  vc({
    word: "セーター",
    reading: "セーター",
    meanings: ["sweater"],
    jlpt: "N5",
    category: "clothing",
  }),
  vc({
    word: "ハイキング",
    reading: "ハイキング",
    meanings: ["hiking"],
    jlpt: "N4",
    category: "leisure",
  }),
  vc({
    word: "ジョギング",
    reading: "ジョギング",
    meanings: ["jogging"],
    jlpt: "N3",
    category: "leisure",
  }),
  vc({
    word: "プール",
    reading: "プール",
    meanings: ["swimming pool"],
    jlpt: "N5",
    category: "leisure",
  }),
  vc({
    word: "スポーツ",
    reading: "スポーツ",
    meanings: ["sports"],
    jlpt: "N5",
    category: "leisure",
  }),
  vc({
    word: "サッカー",
    reading: "サッカー",
    meanings: ["soccer", "football"],
    jlpt: "N5",
    category: "leisure",
  }),
  vc({
    word: "テニス",
    reading: "テニス",
    meanings: ["tennis"],
    jlpt: "N5",
    category: "leisure",
  }),
  vc({
    word: "ピアノ",
    reading: "ピアノ",
    meanings: ["piano"],
    jlpt: "N5",
    category: "leisure",
  }),
  vc({
    word: "ギター",
    reading: "ギター",
    meanings: ["guitar"],
    jlpt: "N5",
    category: "leisure",
  }),
  vc({
    word: "コンサート",
    reading: "コンサート",
    meanings: ["concert"],
    jlpt: "N4",
    category: "leisure",
  }),
  vc({
    word: "パーティー",
    reading: "パーティー",
    meanings: ["party"],
    jlpt: "N5",
    category: "leisure",
    context: "Social parties only — political parties are 政党, and the RPG kind is パーティ (often without the long vowel).",
  }),
  vc({
    word: "レポート",
    reading: "レポート",
    meanings: ["report", "school paper"],
    jlpt: "N4",
    category: "school_work",
    context: "The standard word for a university assignment paper.",
    ex: {
      jp: "明日までにレポートを出さなければならない。",
      kana: "あした まで に レポート を ださなければ ならない。",
      en: "I have to turn in my paper by tomorrow.",
    },
  }),
  vc({
    word: "テスト",
    reading: "テスト",
    meanings: ["test", "exam"],
    jlpt: "N5",
    category: "school_work",
    context: "Interchangeable with 試験 for school tests; 試験 sounds more formal/official.",
  }),
  vc({
    word: "クラス",
    reading: "クラス",
    meanings: ["class (group)"],
    jlpt: "N5",
    category: "school_work",
    context: "The group of students, not the lesson — a lesson is 授業 (じゅぎょう).",
  }),
  vc({
    word: "ノート",
    reading: "ノート",
    meanings: ["notebook"],
    jlpt: "N5",
    category: "school_work",
    context: "A physical notebook. A laptop is ノートパソコン. A memo/note is メモ.",
  }),
  vc({
    word: "ペン",
    reading: "ペン",
    meanings: ["pen"],
    jlpt: "N5",
    category: "school_work",
  }),
  vc({
    word: "ミーティング",
    reading: "ミーティング",
    meanings: ["meeting"],
    jlpt: "N3",
    category: "school_work",
    context: "Casual work meetings. Formal meetings are 会議 (かいぎ); a quick stand-up is 打ち合わせ.",
  }),
  vc({
    word: "スケジュール",
    reading: "スケジュール",
    meanings: ["schedule"],
    jlpt: "N3",
    category: "school_work",
  }),
  vc({
    word: "アイデア",
    reading: "アイデア",
    meanings: ["idea"],
    jlpt: "N3",
    category: "abstract",
    context: "Also spelled アイディア. Both common.",
  }),
  vc({
    word: "チャンス",
    reading: "チャンス",
    meanings: ["chance", "opportunity"],
    jlpt: "N3",
    category: "abstract",
    context: "Only the opportunity sense. Probability-chance is 可能性, and 'by chance' is 偶然.",
  }),
  vc({
    word: "イメージ",
    reading: "イメージ",
    meanings: ["image", "mental picture", "impression"],
    jlpt: "N3",
    category: "abstract",
    context:
      "Mental image or public impression, not a picture file (that's 画像). イメージと違う = it's different from what I pictured.",
  }),
  vc({
    word: "ストレス",
    reading: "ストレス",
    meanings: ["stress"],
    jlpt: "N3",
    category: "abstract",
    ex: {
      jp: "仕事のストレスがたまっている。",
      kana: "しごと の ストレス が たまっている。",
      en: "Work stress is piling up.",
    },
  }),
  vc({
    word: "ルール",
    reading: "ルール",
    meanings: ["rule"],
    jlpt: "N3",
    category: "abstract",
    context: "Casual rules (games, etiquette). Laws and regulations are 規則 or 法律.",
  }),
  vc({
    word: "タイプ",
    reading: "タイプ",
    meanings: ["type", "one's type (romantically)"],
    jlpt: "N4",
    category: "abstract",
    context: "タイプです = you're my type. Bland in English, loaded in Japanese.",
  }),
  vc({
    word: "デート",
    reading: "デート",
    meanings: ["date (romantic)"],
    jlpt: "N4",
    category: "social",
    context: "Only romantic dates. Calendar dates are 日付 (ひづけ).",
  }),
  vc({
    word: "キス",
    reading: "キス",
    meanings: ["kiss"],
    jlpt: "N3",
    category: "social",
  }),
  vc({
    word: "ペット",
    reading: "ペット",
    meanings: ["pet"],
    jlpt: "N4",
    category: "social",
    context: "Unvoiced ペ — compare ベッド (bed). Minimal pairs like this are why the katakana deck exists.",
  }),
  vc({
    word: "ドライブ",
    reading: "ドライブ",
    meanings: ["a drive (for pleasure)"],
    jlpt: "N4",
    category: "leisure",
    context: "A leisure drive, not commuting. ドライブに行く = go for a drive.",
  }),
  vc({
    word: "バーゲン",
    reading: "バーゲン",
    meanings: ["sale (in a shop)"],
    jlpt: "N3",
    category: "shopping",
    context: "From 'bargain' but means the sale event itself. セール is interchangeable.",
  }),
  vc({
    word: "レジ",
    reading: "レジ",
    meanings: ["cash register", "checkout"],
    jlpt: "N4",
    category: "shopping",
    context: "Clipped from レジスター. レジでお願いします = please pay at the register.",
    ex: {
      jp: "レジに並んでください。",
      kana: "レジ に ならんで ください。",
      en: "Please line up at the register.",
    },
  }),
  vc({
    word: "ポイント",
    reading: "ポイント",
    meanings: ["points (loyalty)", "key point"],
    jlpt: "N3",
    category: "shopping",
    context: "Loyalty-card points are a national obsession — ポイントカードはお持ちですか is heard at every register.",
  }),
];

// ============================================================
// Greetings & set phrases
// ============================================================

const greetings = [
  vc({
    word: "おはようございます",
    reading: "おはようございます",
    meanings: ["good morning (polite)"],
    jlpt: "N5",
    category: "daily_greetings",
    context:
      "Drop ございます with friends/family: おはよう. In workplaces it greets the FIRST meeting of the day even at night — service industry uses it at 8 PM.",
  }),
  vc({
    word: "こんにちは",
    reading: "こんにちは",
    meanings: ["hello", "good afternoon"],
    jlpt: "N5",
    category: "daily_greetings",
    context:
      "Written with は (the particle), pronounced わ. Daytime only, and NOT used with your own in-group (family, close coworkers) — it has built-in distance.",
  }),
  vc({
    word: "こんばんは",
    reading: "こんばんは",
    meanings: ["good evening"],
    jlpt: "N5",
    category: "daily_greetings",
    context: "Same は-spelling trap as こんにちは.",
  }),
  vc({
    word: "おやすみなさい",
    reading: "おやすみなさい",
    meanings: ["good night"],
    jlpt: "N5",
    category: "daily_greetings",
    context: "Casual: おやすみ. Said when someone is going to bed OR when parting at night.",
  }),
  vc({
    word: "さようなら",
    reading: "さようなら",
    meanings: ["goodbye (formal/final)"],
    jlpt: "N5",
    category: "daily_greetings",
    context:
      "Heavier than textbooks suggest — can imply long/permanent separation. Everyday partings: じゃあね, またね, お先に失礼します (work).",
  }),
  vc({
    word: "じゃあね",
    reading: "じゃあね",
    meanings: ["see you", "bye (casual)"],
    jlpt: "N5",
    category: "daily_greetings",
    context: "The actual everyday goodbye between friends. Variants: じゃ、また / またね / バイバイ.",
  }),
  vc({
    word: "ただいま",
    reading: "ただいま",
    meanings: ["I'm home"],
    jlpt: "N5",
    category: "home_pairs",
    context: "Pairs with おかえりなさい. Literally 'just now (returned)'.",
  }),
  vc({
    word: "おかえりなさい",
    reading: "おかえりなさい",
    meanings: ["welcome home"],
    jlpt: "N5",
    category: "home_pairs",
    context: "Response to ただいま. Casual: おかえり.",
  }),
  vc({
    word: "いってきます",
    reading: "いってきます",
    meanings: ["I'm off (and coming back)"],
    jlpt: "N5",
    category: "home_pairs",
    context: "Said when leaving home/office. Literally 'I'll go and come back' — the coming-back is built into the grammar.",
  }),
  vc({
    word: "いってらっしゃい",
    reading: "いってらっしゃい",
    meanings: ["take care", "see you later (to someone leaving)"],
    jlpt: "N5",
    category: "home_pairs",
    context: "Response to いってきます.",
  }),
  vc({
    word: "いただきます",
    reading: "いただきます",
    meanings: ["(said before eating)"],
    jlpt: "N5",
    category: "meals",
    context:
      "Humble 'I receive'. Thanks everyone and everything that produced the meal. No English equivalent — 'bon appétit' is said TO others; this is said by the eater.",
  }),
  vc({
    word: "ごちそうさまでした",
    reading: "ごちそうさまでした",
    meanings: ["(said after eating)", "thanks for the meal"],
    jlpt: "N5",
    category: "meals",
    context:
      "Closes the いただきます pair. Said to hosts, restaurant staff on leaving, or whoever paid. Casual: ごちそうさま.",
  }),
  vc({
    word: "ありがとうございます",
    reading: "ありがとうございます",
    meanings: ["thank you (polite)"],
    jlpt: "N5",
    category: "thanks_apology",
    context:
      "Past tense ありがとうございました thanks a COMPLETED favor. Present tense for ongoing/just-now ones. Casual: ありがとう.",
  }),
  vc({
    word: "すみません",
    reading: "すみません",
    meanings: ["excuse me", "sorry", "thank you (for trouble taken)"],
    jlpt: "N5",
    category: "thanks_apology",
    context:
      "Triple duty: getting attention, light apology, AND thanks-with-apology (someone holds the door → すみません). The single most useful word in spoken Japanese.",
    ex: {
      jp: "すみません、駅はどこですか。",
      kana: "すみません、えき は どこ です か。",
      en: "Excuse me, where is the station?",
    },
  }),
  vc({
    word: "ごめんなさい",
    reading: "ごめんなさい",
    meanings: ["I'm sorry"],
    jlpt: "N5",
    category: "thanks_apology",
    context:
      "More personal than すみません, used with people close to you. Casual: ごめん／ごめんね. For serious/business apologies: 申し訳ありません.",
  }),
  vc({
    word: "申し訳ありません",
    reading: "もうしわけありません",
    meanings: ["I sincerely apologize"],
    jlpt: "N3",
    category: "thanks_apology",
    context:
      "Business-grade apology — literally 'there is no excuse'. The escalation ladder: ごめん → すみません → 申し訳ありません → 申し訳ございません.",
  }),
  vc({
    word: "お願いします",
    reading: "おねがいします",
    meanings: ["please (requesting)"],
    jlpt: "N5",
    category: "requests",
    context:
      "Attach to anything you're requesting: これ、お願いします (this one, please). よろしくお願いします is its own separate beast — see that card.",
  }),
  vc({
    word: "よろしくお願いします",
    reading: "よろしくおねがいします",
    meanings: ["nice to meet you", "I'm counting on you", "best regards"],
    jlpt: "N5",
    category: "requests",
    context:
      "Untranslatable glue phrase: ends self-introductions, requests, emails, year-end greetings. Means roughly 'please treat the relationship/task well'. Just learn the situations, not a translation.",
  }),
  vc({
    word: "はじめまして",
    reading: "はじめまして",
    meanings: ["nice to meet you (first time)"],
    jlpt: "N5",
    category: "introductions",
    context: "Only at FIRST meetings. Standard set: はじめまして。[name]です。よろしくお願いします。",
  }),
  vc({
    word: "お疲れ様です",
    reading: "おつかれさまです",
    meanings: ["good work", "hello/bye (workplace)"],
    jlpt: "N4",
    category: "workplace",
    context:
      "The workplace everything-greeting: passing coworkers, starting calls, ending meetings, leaving (お疲れ様でした). Never to customers — that's ありがとうございました.",
    ex: {
      jp: "お先に失礼します。— お疲れ様でした。",
      kana: "おさき に しつれい します。— おつかれさまでした。",
      en: "I'm heading out first. — Good work today.",
    },
  }),
  vc({
    word: "お先に失礼します",
    reading: "おさきにしつれいします",
    meanings: ["excuse me for leaving first (work)"],
    jlpt: "N3",
    category: "workplace",
    context: "Said when leaving the office while others are still working. The reply is お疲れ様でした.",
  }),
  vc({
    word: "失礼します",
    reading: "しつれいします",
    meanings: ["excuse me (entering/leaving/interrupting)"],
    jlpt: "N4",
    category: "workplace",
    context:
      "Entering an office or someone's room, hanging up a phone, leaving a meeting. Literally 'I commit a rudeness'. Past tense 失礼しました doubles as a light apology.",
  }),
  vc({
    word: "いらっしゃいませ",
    reading: "いらっしゃいませ",
    meanings: ["welcome (to a shop)"],
    jlpt: "N5",
    category: "shop_japanese",
    context:
      "You HEAR this constantly but never say it (staff only). No response needed — a nod is fine. Don't reply こんにちは.",
  }),
  vc({
    word: "かしこまりました",
    reading: "かしこまりました",
    meanings: ["certainly (formal acknowledgment)"],
    jlpt: "N2",
    category: "shop_japanese",
    context: "Staff-speak for 'understood'. The politeness ladder: 分かった → 分かりました → 承知しました → かしこまりました.",
  }),
  vc({
    word: "少々お待ちください",
    reading: "しょうしょうおまちください",
    meanings: ["please wait a moment (formal)"],
    jlpt: "N3",
    category: "shop_japanese",
    context: "Shop and phone staple. Casual version: ちょっと待って(ね).",
  }),
  vc({
    word: "お待たせしました",
    reading: "おまたせしました",
    meanings: ["sorry to keep you waiting"],
    jlpt: "N3",
    category: "shop_japanese",
    context: "Said when returning to a customer/friend after any wait — even a short one. Restaurant servers say it delivering food.",
  }),
  vc({
    word: "どうぞ",
    reading: "どうぞ",
    meanings: ["go ahead", "here you are", "please (offering)"],
    jlpt: "N5",
    category: "requests",
    context:
      "The offering word: handing things over, yielding a seat, inviting someone in. Pairs with どうも as the reply.",
  }),
  vc({
    word: "どうも",
    reading: "どうも",
    meanings: ["thanks (light)", "hi (casual nod)"],
    jlpt: "N5",
    category: "thanks_apology",
    context:
      "Swiss-army filler: light thanks, casual hello, soft acknowledgment. どうもどうも from a middle-aged man can be an entire conversation.",
  }),
  vc({
    word: "お久しぶりです",
    reading: "おひさしぶりです",
    meanings: ["long time no see"],
    jlpt: "N4",
    category: "social",
    context: "Casual: 久しぶり！ Roughly after a month or more apart.",
  }),
  vc({
    word: "お元気ですか",
    reading: "おげんきですか",
    meanings: ["how are you?"],
    jlpt: "N5",
    category: "social",
    context:
      "NOT a daily greeting like English 'how are you' — only for people you haven't seen in a while. Reply: はい、元気です or おかげさまで.",
  }),
  vc({
    word: "おかげさまで",
    reading: "おかげさまで",
    meanings: ["thanks to you", "fortunately"],
    jlpt: "N3",
    category: "social",
    context:
      "The graceful answer to お元気ですか — credits your wellbeing to others' kindness. Standalone: おかげさまで、元気です。",
  }),
  vc({
    word: "お大事に",
    reading: "おだいじに",
    meanings: ["get well soon", "take care (to the sick)"],
    jlpt: "N4",
    category: "care",
    context: "To anyone ill or leaving a hospital/pharmacy. Full: お大事になさってください.",
  }),
  vc({
    word: "気をつけて",
    reading: "きをつけて",
    meanings: ["take care", "be careful", "safe travels"],
    jlpt: "N5",
    category: "care",
    context: "Seeing someone off: (お)気をつけて(ください). Also literal 'watch out!'.",
  }),
  vc({
    word: "頑張ってください",
    reading: "がんばってください",
    meanings: ["good luck", "do your best"],
    jlpt: "N5",
    category: "care",
    context:
      "Encouragement before exams/games/work. Casual: 頑張って／頑張れ. Reply: 頑張ります. To someone already struggling hard, 無理しないで (don't overdo it) is kinder.",
    ex: {
      jp: "明日の試験、頑張ってください。",
      kana: "あした の しけん、がんばって ください。",
      en: "Good luck on tomorrow's exam.",
    },
  }),
  vc({
    word: "おめでとうございます",
    reading: "おめでとうございます",
    meanings: ["congratulations"],
    jlpt: "N5",
    category: "celebrations",
    context: "誕生日おめでとう (birthday), 合格おめでとう (passing an exam), 明けましておめでとう (New Year).",
  }),
  vc({
    word: "明けましておめでとうございます",
    reading: "あけましておめでとうございます",
    meanings: ["happy New Year"],
    jlpt: "N4",
    category: "celebrations",
    context:
      "Only AFTER midnight on Jan 1. Before year-end you say よいお年を. Followed by 今年もよろしくお願いします.",
  }),
  vc({
    word: "よいお年を",
    reading: "よいおとしを",
    meanings: ["have a good New Year (said in December)"],
    jlpt: "N3",
    category: "celebrations",
    context: "The BEFORE-new-year farewell — don't mix up with 明けまして (after).",
  }),
  vc({
    word: "もしもし",
    reading: "もしもし",
    meanings: ["hello (on the phone)"],
    jlpt: "N5",
    category: "phone",
    context: "Phone-only. Business calls open with お電話ありがとうございます or 「会社名」でございます instead.",
  }),
  vc({
    word: "お邪魔します",
    reading: "おじゃまします",
    meanings: ["pardon the intrusion (entering a home)"],
    jlpt: "N4",
    category: "visiting",
    context:
      "Said stepping into someone's home — literally 'I will disturb you'. Leaving: お邪魔しました.",
  }),
  vc({
    word: "ようこそ",
    reading: "ようこそ",
    meanings: ["welcome"],
    jlpt: "N4",
    category: "visiting",
    context: "Welcoming guests/visitors: 日本へようこそ = Welcome to Japan.",
  }),
  vc({
    word: "とんでもないです",
    reading: "とんでもないです",
    meanings: ["not at all", "don't mention it"],
    jlpt: "N3",
    category: "humility",
    context: "Deflects praise or thanks. Politer than いいえいいえ; the natural reply when a compliment lands.",
  }),
  vc({
    word: "こちらこそ",
    reading: "こちらこそ",
    meanings: ["likewise", "the pleasure is mine"],
    jlpt: "N4",
    category: "humility",
    context: "Returns a thanks or greeting: ありがとう → こちらこそ (no, thank YOU).",
  }),
  vc({
    word: "大丈夫です",
    reading: "だいじょうぶです",
    meanings: ["it's okay", "no thank you", "I'm fine"],
    jlpt: "N5",
    category: "social",
    context:
      "Modern double duty: 'I'm fine' AND a soft 'no thanks' (レジ袋は？→ 大丈夫です). Context and tone decide — a major listening-comprehension trap.",
    ex: {
      jp: "袋はご利用ですか。— 大丈夫です。",
      kana: "ふくろ は ごりよう です か。— だいじょうぶ です。",
      en: "Do you need a bag? — No, I'm fine.",
    },
  }),
  vc({
    word: "お世話になっております",
    reading: "おせわになっております",
    meanings: ["thank you for your continued support (business)"],
    jlpt: "N2",
    category: "workplace",
    context:
      "Opens nearly every business email and call between companies. There is no English equivalent; treat it as 'Dear sir/madam' that also does gratitude.",
  }),
  vc({
    word: "いいえ",
    reading: "いいえ",
    meanings: ["no", "not at all"],
    jlpt: "N5",
    category: "basic",
    context:
      "Textbook 'no', but real speech softens: いや、ちょっと…, うーん, or just trailing off. Blunt いいえ can sound stiff. As a reply to thanks it means 'don't mention it'.",
  }),
  vc({
    word: "はい",
    reading: "はい",
    meanings: ["yes", "here (roll call)", "I'm listening"],
    jlpt: "N5",
    category: "basic",
    context:
      "Also the aizuchi 'uh-huh' — はい during your speech means 'I'm following', NOT 'I agree'. Contract negotiations have gone wrong over this.",
  }),
];

function writeDeck(filename, deck) {
  writeFileSync(join(OUT_DIR, filename), JSON.stringify(deck, null, 2) + "\n");
  console.log(`✓ ${filename} — ${deck.cards.length} cards`);
}

// Uniqueness guards.
for (const [name, cards] of [
  ["katakana", katakana],
  ["greetings", greetings],
]) {
  const seen = new Set();
  for (const c of cards) {
    if (seen.has(c.word)) throw new Error(`Duplicate in ${name}: ${c.word}`);
    seen.add(c.word);
  }
}

writeDeck("vocab_katakana_words.json", {
  deck_id: "vocab-katakana-words",
  deck_name: "Katakana Words (カタカナ語)",
  subtitle: "Loanwords, false friends & wasei-eigo traps",
  version: "1.0",
  card_count: katakana.length,
  notes:
    "Doubles as katakana reading practice and a false-friend map: マンション, スマート, クレーム, テンション and friends all carry explicit pitfall notes. Sources of loans flagged (Portuguese パン, German アルバイト, brand-name ホッチキス).",
  source: "Hand-authored for Kanjido v1 (factual common-knowledge Japanese vocabulary).",
  cards: katakana,
});

writeDeck("vocab_phrases_greetings.json", {
  deck_id: "vocab-phrases-greetings",
  deck_name: "Greetings & Set Phrases (あいさつ)",
  subtitle: "The social glue — aisatsu, register ladders, untranslatables",
  version: "1.0",
  card_count: greetings.length,
  notes:
    "The set phrases textbooks romanize on page one and never drill: home/leaving pairs, meal pairs, the すみません triple-duty, the お疲れ様 workplace economy, and politeness escalation ladders.",
  source: "Hand-authored for Kanjido v1 (factual common-knowledge Japanese expressions).",
  cards: greetings,
});
