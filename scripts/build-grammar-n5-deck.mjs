#!/usr/bin/env node
/**
 * Grammar: JLPT N5 Essentials deck.
 *
 * Output: agent-files/vocab_grammar_n5.json (Pro, grammar kind)
 *
 * The ~45 grammar points an N5 candidate must produce, framed for an
 * English-speaking learner: every pattern gets the structural recipe in
 * `context` and a natural example using only N5-range kanji and grammar
 * (skill rule: examples for an N5 card use ≤N4 material).
 *
 * Deliberately complements the existing grammar decks: particles already
 * have their own deck (grammar-particles), conjugation tables their own
 * (grammar-conjugations) — this deck covers the sentence-level patterns
 * and constructions in the N5 syllabus.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(dirname(HERE), "agent-files");
mkdirSync(OUT_DIR, { recursive: true });

function gp({ word, reading, meanings, category, context, ex }) {
  return {
    word,
    reading,
    meanings,
    jlpt: "N5",
    category: category ?? "",
    context: context ?? "",
    example_sentence: ex?.jp ?? "",
    example_reading: ex?.kana ?? "",
    example_meaning: ex?.en ?? "",
  };
}

const cards = [
  gp({
    word: "～です／～ます",
    reading: "desu / masu",
    meanings: ["polite sentence endings"],
    category: "politeness",
    context:
      "The polite register's backbone. です follows nouns and adjectives; ます attaches to the verb stem. Default to this register with strangers; plain form with friends.",
    ex: {
      jp: "私は学生です。毎日学校へ行きます。",
      kana: "わたし は がくせい です。まいにち がっこう へ いきます。",
      en: "I'm a student. I go to school every day.",
    },
  }),
  gp({
    word: "～ではありません",
    reading: "dewa arimasen",
    meanings: ["is not (polite negative of です)"],
    category: "politeness",
    context:
      "Spoken Japanese almost always contracts to じゃありません or じゃないです. All three are correct; the では form is the most formal/written.",
    ex: {
      jp: "彼は先生じゃありません。",
      kana: "かれ は せんせい じゃ ありません。",
      en: "He is not a teacher.",
    },
  }),
  gp({
    word: "～ました／～ませんでした",
    reading: "mashita / masen deshita",
    meanings: ["polite past / polite past negative"],
    category: "tense",
    context: "Verb stem + ました (did) / ませんでした (didn't). Japanese has no separate future tense — 行きます covers both 'I go' and 'I will go'.",
    ex: {
      jp: "昨日は雨でしたから、出かけませんでした。",
      kana: "きのう は あめ でした から、でかけません でした。",
      en: "It rained yesterday, so I didn't go out.",
    },
  }),
  gp({
    word: "～ています",
    reading: "te imasu",
    meanings: ["is doing (progressive)", "state resulting from action"],
    category: "aspect",
    context:
      "Two jobs: ongoing action (食べています = is eating) AND resulting state (結婚しています = is married, NOT 'is marrying'). 知っています 'I know' is the classic state example.",
    ex: {
      jp: "兄は今、音楽を聞いています。",
      kana: "あに は いま、おんがく を きいています。",
      en: "My brother is listening to music right now.",
    },
  }),
  gp({
    word: "～てください",
    reading: "te kudasai",
    meanings: ["please do ~"],
    category: "requests",
    context:
      "Te-form + ください. Politer softeners exist (～てくださいませんか), but てください is the everyday workhorse. Negative request: ～ないでください.",
    ex: {
      jp: "ここに名前を書いてください。",
      kana: "ここ に なまえ を かいて ください。",
      en: "Please write your name here.",
    },
  }),
  gp({
    word: "～ないでください",
    reading: "naide kudasai",
    meanings: ["please don't ~"],
    category: "requests",
    context: "Nai-form + でください. 心配しないでください = please don't worry.",
    ex: {
      jp: "ここで写真を撮らないでください。",
      kana: "ここ で しゃしん を とらないで ください。",
      en: "Please don't take photos here.",
    },
  }),
  gp({
    word: "～てもいいです",
    reading: "te mo ii desu",
    meanings: ["it's okay to ~", "may I ~? (in question form)"],
    category: "permission",
    context:
      "Te-form + もいいです. As a question it asks permission: 入ってもいいですか. Granting: いいですよ. The も is droppable in casual speech (見ていい？).",
    ex: {
      jp: "この椅子を使ってもいいですか。",
      kana: "この いす を つかって も いい です か。",
      en: "May I use this chair?",
    },
  }),
  gp({
    word: "～てはいけません",
    reading: "te wa ikemasen",
    meanings: ["must not ~", "it's forbidden to ~"],
    category: "permission",
    context:
      "Te-form + はいけません. Strong prohibition — rules and signs. Spoken contraction: ～ちゃいけない／～じゃいけない (飲んじゃいけない).",
    ex: {
      jp: "ここでタバコを吸ってはいけません。",
      kana: "ここ で タバコ を すって は いけません。",
      en: "You must not smoke here.",
    },
  }),
  gp({
    word: "～なければなりません",
    reading: "nakereba narimasen",
    meanings: ["must ~", "have to ~"],
    category: "obligation",
    context:
      "Nai-stem + ければなりません. Long but essential. Casual contractions: ～なきゃ／～ないと (行かなきゃ = gotta go). Double negative logic: 'if not done, it won't do'.",
    ex: {
      jp: "明日は早く起きなければなりません。",
      kana: "あした は はやく おきなければ なりません。",
      en: "I have to get up early tomorrow.",
    },
  }),
  gp({
    word: "～なくてもいいです",
    reading: "nakute mo ii desu",
    meanings: ["don't have to ~"],
    category: "obligation",
    context: "The release valve for なければなりません: 急がなくてもいいです = you don't have to hurry.",
    ex: {
      jp: "全部食べなくてもいいですよ。",
      kana: "ぜんぶ たべなくて も いい です よ。",
      en: "You don't have to eat everything.",
    },
  }),
  gp({
    word: "～たいです",
    reading: "tai desu",
    meanings: ["want to ~"],
    category: "desire",
    context:
      "Verb stem + たい conjugates like an i-adjective: 行きたくない, 行きたかった. The object can take が or を. For OTHERS' desires use ～たがっている — you can't directly assert another person's inner state.",
    ex: {
      jp: "日本へ行きたいです。",
      kana: "にほん へ いきたい です。",
      en: "I want to go to Japan.",
    },
  }),
  gp({
    word: "～がほしいです",
    reading: "ga hoshii desu",
    meanings: ["want (a thing)"],
    category: "desire",
    context:
      "Nouns take ほしい (with が); actions take たい. 'I want water' = 水がほしい; 'I want to drink' = 飲みたい. For others: ほしがっている.",
    ex: {
      jp: "新しい自転車がほしいです。",
      kana: "あたらしい じてんしゃ が ほしい です。",
      en: "I want a new bicycle.",
    },
  }),
  gp({
    word: "～ましょう",
    reading: "mashou",
    meanings: ["let's ~", "shall we ~ (in question)"],
    category: "invitation",
    context: "Verb stem + ましょう. 行きましょう = let's go. ましょうか offers help: 手伝いましょうか = shall I help?",
    ex: {
      jp: "一緒に昼ご飯を食べましょう。",
      kana: "いっしょ に ひるごはん を たべましょう。",
      en: "Let's have lunch together.",
    },
  }),
  gp({
    word: "～ませんか",
    reading: "masen ka",
    meanings: ["won't you ~?", "how about ~ing?"],
    category: "invitation",
    context:
      "The polite invitation — negative question form softens it, exactly like English 'won't you join us?'. More considerate than ましょう because it leaves room to decline.",
    ex: {
      jp: "今度の週末、映画を見ませんか。",
      kana: "こんど の しゅうまつ、えいが を みません か。",
      en: "Want to see a movie this weekend?",
    },
  }),
  gp({
    word: "～ことができます",
    reading: "koto ga dekimasu",
    meanings: ["can ~", "be able to ~"],
    category: "ability",
    context:
      "Dictionary form + ことができます. The analytic 'can'; short potential forms (飲める, 行ける) arrive at N4. 日本語を話すことができます = I can speak Japanese.",
    ex: {
      jp: "私は漢字を読むことができます。",
      kana: "わたし は かんじ を よむ こと が できます。",
      en: "I can read kanji.",
    },
  }),
  gp({
    word: "～が好きです",
    reading: "ga suki desu",
    meanings: ["like ~"],
    category: "preference",
    context:
      "好き is a na-adjective, not a verb — the liked thing takes が, not を. 犬が好きです. Dislike: 嫌い (same pattern). Love: 大好き.",
    ex: {
      jp: "私は猫が好きです。",
      kana: "わたし は ねこ が すき です。",
      en: "I like cats.",
    },
  }),
  gp({
    word: "～が上手です／下手です",
    reading: "ga jouzu / heta desu",
    meanings: ["good at ~ / bad at ~"],
    category: "preference",
    context:
      "Same が-pattern as 好き. Pitfall: don't praise yourself with 上手 — for your own skills use 得意 (とくい). 上手ですね is the compliment everyone gives your Japanese.",
    ex: {
      jp: "妹は歌が上手です。",
      kana: "いもうと は うた が じょうず です。",
      en: "My little sister is good at singing.",
    },
  }),
  gp({
    word: "～たことがあります",
    reading: "ta koto ga arimasu",
    meanings: ["have ~ed (experience)"],
    category: "experience",
    context:
      "Ta-form + ことがあります marks life experience: 富士山に登ったことがあります = I've climbed Mt. Fuji. Plain past 登りました just reports an event.",
    ex: {
      jp: "日本へ行ったことがありますか。",
      kana: "にほん へ いった こと が あります か。",
      en: "Have you ever been to Japan?",
    },
  }),
  gp({
    word: "～たり～たりします",
    reading: "tari tari shimasu",
    meanings: ["do things like ~ and ~"],
    category: "listing",
    context:
      "Non-exhaustive activity list: 週末は買い物したり、映画を見たりします. Implies 'among other things' — unlike て-form chains, which list everything in order.",
    ex: {
      jp: "休みの日は本を読んだり、料理をしたりします。",
      kana: "やすみ の ひ は ほん を よんだり、りょうり を したり します。",
      en: "On days off I do things like reading and cooking.",
    },
  }),
  gp({
    word: "～ながら",
    reading: "nagara",
    meanings: ["while ~ing"],
    category: "simultaneity",
    context:
      "Verb stem + ながら; the MAIN action comes second. 音楽を聞きながら勉強する = study while listening to music (studying is the point).",
    ex: {
      jp: "テレビを見ながらご飯を食べます。",
      kana: "テレビ を みながら ごはん を たべます。",
      en: "I eat while watching TV.",
    },
  }),
  gp({
    word: "～前に／～後で",
    reading: "mae ni / ato de",
    meanings: ["before ~ / after ~"],
    category: "sequence",
    context:
      "前に takes the DICTIONARY form even for past events (寝る前に = before sleeping); 後で takes the ta-form (食べた後で = after eating). The tense mismatch trips everyone.",
    ex: {
      jp: "寝る前に歯を磨きます。",
      kana: "ねる まえ に は を みがきます。",
      en: "I brush my teeth before going to bed.",
    },
  }),
  gp({
    word: "～てから",
    reading: "te kara",
    meanings: ["after ~, and then"],
    category: "sequence",
    context:
      "Te-form + から chains a strict sequence: 宿題をしてから遊ぶ = play AFTER homework. Don't confuse with reason-から (which follows a full clause).",
    ex: {
      jp: "手を洗ってから食べてください。",
      kana: "て を あらって から たべて ください。",
      en: "Please wash your hands before eating (eat after washing).",
    },
  }),
  gp({
    word: "～とき",
    reading: "toki",
    meanings: ["when ~"],
    category: "sequence",
    context:
      "Clause + とき. The tense before とき is relative to the main clause: 日本へ行くとき (when going — before arrival) vs 日本へ行ったとき (when I went — after arrival).",
    ex: {
      jp: "子供のとき、よく川で泳ぎました。",
      kana: "こども の とき、よく かわ で およぎました。",
      en: "When I was a child, I often swam in the river.",
    },
  }),
  gp({
    word: "～から（理由）",
    reading: "kara (reason)",
    meanings: ["because ~, so ~"],
    category: "reason",
    context:
      "Reason clause + から + result: 暑いから窓を開けた. The reason comes FIRST — backwards from English 'because'. Politer/softer alternative: ので.",
    ex: {
      jp: "時間がないから、急ぎましょう。",
      kana: "じかん が ない から、いそぎましょう。",
      en: "We don't have time, so let's hurry.",
    },
  }),
  gp({
    word: "～でしょう",
    reading: "deshou",
    meanings: ["probably ~", "right? (rising tone)"],
    category: "conjecture",
    context:
      "Falling intonation = probability (明日は晴れるでしょう — weather-forecast speak). Rising = seeking agreement (おいしいでしょう？). Casual: だろう.",
    ex: {
      jp: "午後は雨が降るでしょう。",
      kana: "ごご は あめ が ふる でしょう。",
      en: "It will probably rain in the afternoon.",
    },
  }),
  gp({
    word: "あります／います",
    reading: "arimasu / imasu",
    meanings: ["there is / exists"],
    category: "existence",
    context:
      "The animacy split English lacks: あります for inanimate things and plants, います for people and animals. 机の上に本があります but 部屋に猫がいます. Mixing them up sounds genuinely wrong, not just foreign.",
    ex: {
      jp: "公園に子供がたくさんいます。",
      kana: "こうえん に こども が たくさん います。",
      en: "There are many children in the park.",
    },
  }),
  gp({
    word: "～は～より",
    reading: "wa ~ yori",
    meanings: ["~ is more ... than ~"],
    category: "comparison",
    context:
      "AはBより + adjective: 東京は大阪より大きい. No adjective inflection needed — the comparison lives entirely in より. Question form: AとBとどちらが～?",
    ex: {
      jp: "新幹線はバスより速いです。",
      kana: "しんかんせん は バス より はやい です。",
      en: "The bullet train is faster than the bus.",
    },
  }),
  gp({
    word: "～の中で～が一番",
    reading: "no naka de ~ ga ichiban",
    meanings: ["~ is the most ... among ~"],
    category: "comparison",
    context: "Superlative recipe: グループの中でAが一番 + adjective. 果物の中で何が一番好きですか = what fruit do you like best?",
    ex: {
      jp: "季節の中で春が一番好きです。",
      kana: "きせつ の なか で はる が いちばん すき です。",
      en: "Spring is my favorite season.",
    },
  }),
  gp({
    word: "～になります／～くなります",
    reading: "ni narimasu / ku narimasu",
    meanings: ["become ~"],
    category: "change",
    context:
      "Nouns/na-adj + になる (先生になる, 元気になる); i-adjectives drop い and take くなる (寒くなる). The all-purpose change-of-state verb.",
    ex: {
      jp: "最近、日が短くなりましたね。",
      kana: "さいきん、ひ が みじかく なりました ね。",
      en: "The days have gotten shorter lately, haven't they.",
    },
  }),
  gp({
    word: "～がります（〜たがる）",
    reading: "tagaru",
    meanings: ["(someone else) wants to ~"],
    category: "desire",
    context:
      "Japanese won't let you assert another's inner state directly: 弟は外で遊びたがっています (my brother shows signs of wanting to play). Your own desire stays ～たい.",
    ex: {
      jp: "娘は犬を飼いたがっています。",
      kana: "むすめ は いぬ を かいたがっています。",
      en: "My daughter wants to get a dog.",
    },
  }),
  gp({
    word: "もう／まだ",
    reading: "mou / mada",
    meanings: ["already / still, not yet"],
    category: "adverbs",
    context:
      "もう食べました = already ate. まだ食べていません = haven't eaten YET (uses ています, not ませんでした — a classic N5 exam point).",
    ex: {
      jp: "もう宿題をしましたか。— いいえ、まだしていません。",
      kana: "もう しゅくだい を しました か。— いいえ、まだ していません。",
      en: "Have you done your homework yet? — No, not yet.",
    },
  }),
  gp({
    word: "～ぐらい／～ごろ",
    reading: "gurai / goro",
    meanings: ["about (amount) / about (time point)"],
    category: "adverbs",
    context:
      "ごろ only for points in time (三時ごろ = around 3:00); ぐらい for quantities and durations (三時間ぐらい = about 3 hours). Mixing them is instantly noticeable.",
    ex: {
      jp: "駅まで十分ぐらいかかります。",
      kana: "えき まで じゅっぷん ぐらい かかります。",
      en: "It takes about ten minutes to the station.",
    },
  }),
  gp({
    word: "～すぎます",
    reading: "sugimasu",
    meanings: ["too much ~", "overly ~"],
    category: "degree",
    context:
      "Verb stem or adjective stem + すぎる: 食べすぎた (ate too much), 高すぎる (too expensive). Conjugates as a regular ru-verb.",
    ex: {
      jp: "昨日の夜、飲みすぎました。",
      kana: "きのう の よる、のみすぎました。",
      en: "I drank too much last night.",
    },
  }),
  gp({
    word: "～ほうがいいです",
    reading: "hou ga ii desu",
    meanings: ["it's better to ~", "you should ~"],
    category: "advice",
    context:
      "Advice TO do: ta-form + ほうがいい (休んだほうがいい). Advice NOT to: nai-form + ほうがいい (行かないほうがいい). The ta/nai asymmetry is the exam trap.",
    ex: {
      jp: "熱があるなら、早く寝たほうがいいですよ。",
      kana: "ねつ が ある なら、はやく ねた ほう が いい です よ。",
      en: "If you have a fever, you should go to bed early.",
    },
  }),
  gp({
    word: "～つもりです",
    reading: "tsumori desu",
    meanings: ["intend to ~", "plan to ~"],
    category: "intention",
    context:
      "Dictionary form + つもり for firm personal plans: 来年留学するつもりです. Negative: 行かないつもり (intend not to) ≠ 行くつもりはない (have no intention — stronger).",
    ex: {
      jp: "夏休みに国へ帰るつもりです。",
      kana: "なつやすみ に くに へ かえる つもり です。",
      en: "I plan to go back to my country for summer vacation.",
    },
  }),
  gp({
    word: "～でしょう？／～ね／～よ",
    reading: "ne / yo (sentence enders)",
    meanings: ["agreement-seeking / informing particles"],
    category: "particles_final",
    context:
      "ね seeks agreement on shared info (いい天気ですね); よ asserts info the listener lacks (財布、落としましたよ). よ at the wrong moment sounds pushy — when unsure, ね.",
    ex: {
      jp: "この店のラーメン、おいしいですね。",
      kana: "この みせ の ラーメン、おいしい です ね。",
      en: "This shop's ramen is great, isn't it.",
    },
  }),
  gp({
    word: "疑問詞＋か／も",
    reading: "question word + ka / mo",
    meanings: ["some- / every- / no- compounds"],
    category: "indefinites",
    context:
      "何か = something, 何も(+neg) = nothing, 誰か = someone, 誰も(+neg) = no one, どこかへ = somewhere. か-compounds pair with affirmatives, も-compounds with negatives.",
    ex: {
      jp: "何か食べましたか。— いいえ、何も食べていません。",
      kana: "なにか たべました か。— いいえ、なにも たべていません。",
      en: "Did you eat something? — No, I haven't eaten anything.",
    },
  }),
  gp({
    word: "～や～など",
    reading: "ya ~ nado",
    meanings: ["~ and ~, among others"],
    category: "listing",
    context:
      "Non-exhaustive noun list: 机の上にペンや本などがあります. Contrast と, which is exhaustive — AとB means exactly A and B, nothing else.",
    ex: {
      jp: "かばんの中に財布や鍵などが入っています。",
      kana: "かばん の なか に さいふ や かぎ など が はいっています。",
      en: "There's a wallet, keys, and such in the bag.",
    },
  }),
  gp({
    word: "～ましょうか（申し出）",
    reading: "mashou ka (offering)",
    meanings: ["shall I ~? (offering help)"],
    category: "invitation",
    context: "荷物を持ちましょうか = shall I carry your bags? Decline politely with 大丈夫です.",
    ex: {
      jp: "窓を開けましょうか。",
      kana: "まど を あけましょう か。",
      en: "Shall I open the window?",
    },
  }),
  gp({
    word: "～という～",
    reading: "to iu",
    meanings: ["called ~", "named ~"],
    category: "naming",
    context:
      "Introduces names the listener may not know: 「君の名は」という映画 = the movie called 'Your Name'. Indispensable for asking about words: これは何という意味ですか.",
    ex: {
      jp: "田中さんという人から電話がありました。",
      kana: "たなかさん という ひと から でんわ が ありました。",
      en: "There was a call from a person called Tanaka.",
    },
  }),
  gp({
    word: "～のが好き／～のは～",
    reading: "no (nominalizer)",
    meanings: ["~ing (turning verbs into nouns)"],
    category: "nominalization",
    context:
      "の turns a verb clause into a noun: 泳ぐのが好きです = I like swimming. こと does the same job slightly more formally; at N5, の is the spoken default.",
    ex: {
      jp: "音楽を聞くのが好きです。",
      kana: "おんがく を きく の が すき です。",
      en: "I like listening to music.",
    },
  }),
  gp({
    word: "～にします",
    reading: "ni shimasu",
    meanings: ["decide on ~", "I'll have ~ (ordering)"],
    category: "decisions",
    context: "The ordering phrase: コーヒーにします = I'll have the coffee. Literally 'make it into ~' — a decision verb.",
    ex: {
      jp: "私はカレーにします。",
      kana: "わたし は カレー に します。",
      en: "I'll have the curry.",
    },
  }),
  gp({
    word: "～をください",
    reading: "o kudasai",
    meanings: ["please give me ~"],
    category: "requests",
    context:
      "Noun + をください for requesting THINGS (これをください). For actions use ～てください. Counting in orders: りんごを三つください.",
    ex: {
      jp: "すみません、水をください。",
      kana: "すみません、みず を ください。",
      en: "Excuse me, some water please.",
    },
  }),
  gp({
    word: "～へ行く／～に行く",
    reading: "e iku / ni iku",
    meanings: ["go to ~ (direction)"],
    category: "movement",
    context:
      "へ and に are both fine for destinations; に is more common in speech, へ emphasizes direction. Purpose-of-motion uses the verb stem: 買い物に行く, 泳ぎに行く.",
    ex: {
      jp: "週末、友達と海へ泳ぎに行きます。",
      kana: "しゅうまつ、ともだち と うみ へ およぎ に いきます。",
      en: "This weekend I'm going to the sea with friends to swim.",
    },
  }),
  gp({
    word: "あまり～ません",
    reading: "amari ~ masen",
    meanings: ["not very ~", "not much ~"],
    category: "adverbs",
    context:
      "あまり demands a negative ending: あまり高くないです = not very expensive. Its stronger sibling 全然 (+neg) = not at all. Using あまり with a positive is the give-away mistake.",
    ex: {
      jp: "私はあまりテレビを見ません。",
      kana: "わたし は あまり テレビ を みません。",
      en: "I don't watch TV much.",
    },
  }),
];

const seen = new Set();
for (const c of cards) {
  if (seen.has(c.word)) throw new Error(`Duplicate grammar point: ${c.word}`);
  seen.add(c.word);
}

const deck = {
  deck_id: "grammar-n5",
  deck_name: "Grammar: JLPT N5 Essentials",
  subtitle: "～てください · ～たい · ～たことがある — the N5 syllabus",
  version: "1.0",
  card_count: cards.length,
  notes:
    "The sentence-level patterns of the N5 syllabus with structural recipes and exam-trap notes (まだ＋ています, ごろ vs ぐらい, ta/nai asymmetry in ほうがいい). Complements the particles and conjugation decks.",
  source: "Hand-authored for Kanjido v1 (factual common-knowledge Japanese grammar).",
  cards,
};

writeFileSync(join(OUT_DIR, "vocab_grammar_n5.json"), JSON.stringify(deck, null, 2) + "\n");
console.log(`✓ vocab_grammar_n5.json — ${cards.length} grammar points`);
