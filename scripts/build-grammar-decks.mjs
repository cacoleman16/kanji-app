#!/usr/bin/env node
/**
 * Hand-authored Japanese grammar decks for Kanjido.
 *
 * Three decks:
 *   - Particles  (は, が, を, に, で, へ, から, …)
 *   - Patterns & phrases  (〜ばかり, 〜ところ, 〜つもり, 〜はず, …)
 *   - Verb conjugations  (passive, causative, potential, conditional, …)
 *
 * Each card uses the existing vocab schema; the pattern goes in `word`,
 * a short English gloss in `meanings`, the explanation in `context`, and
 * a real example sentence in `example_sentence` / `example_reading` /
 * `example_meaning`. Pro tier (intermediate+ content).
 *
 * Output:
 *   agent-files/vocab_grammar_particles.json
 *   agent-files/vocab_grammar_patterns.json
 *   agent-files/vocab_grammar_conjugations.json
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(dirname(HERE), "agent-files");
mkdirSync(OUT_DIR, { recursive: true });

function gc({ word, reading, meanings, jlpt, category, context, ex, table }) {
  const card = {
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
  if (table) card.conjugation_table = table;
  return card;
}

// ============================================================
// Particles
// ============================================================

const particles = [
  gc({
    word: "は",
    reading: "wa",
    meanings: ["topic marker"],
    jlpt: "N5",
    category: "core",
    context:
      "Marks the topic — what the sentence is about. Pronounced 'wa' even though written with the kana for 'ha'. Compare with が (subject marker): は frames the topic; が answers 'who/what'.",
    ex: {
      jp: "私は学生です。",
      kana: "わたし は がくせい です。",
      en: "I am a student. (As for me, [I'm] a student.)",
    },
  }),
  gc({
    word: "が",
    reading: "ga",
    meanings: ["subject marker"],
    jlpt: "N5",
    category: "core",
    context:
      "Marks the grammatical subject. Used to introduce new info or to answer questions like 'who/what?'. With existence verbs ある/いる, it's the default. With 好き/嫌い it's mandatory.",
    ex: {
      jp: "犬がいます。",
      kana: "いぬ が います。",
      en: "There is a dog.",
    },
  }),
  gc({
    word: "を",
    reading: "o",
    meanings: ["direct-object marker"],
    jlpt: "N5",
    category: "core",
    context:
      "Marks the direct object of a transitive verb. Pronounced 'o' (the obsolete 'wo' is hyper-archaic).",
    ex: {
      jp: "本を読みます。",
      kana: "ほん を よみます。",
      en: "I read a book.",
    },
  }),
  gc({
    word: "に",
    reading: "ni",
    meanings: ["destination", "indirect object", "time"],
    jlpt: "N5",
    category: "core",
    context:
      "Several uses sharing a 'precise location/target' feel: destination (学校に行く), indirect object (友達に話す), specific time (3時に), state existence (机にある).",
    ex: {
      jp: "学校に行きます。",
      kana: "がっこう に いきます。",
      en: "I go to school.",
    },
  }),
  gc({
    word: "で",
    reading: "de",
    meanings: ["location of action", "means"],
    jlpt: "N5",
    category: "core",
    context:
      "Where an ACTION happens (vs に for static existence): 図書館で勉強する = study AT the library. Also 'by means of': バスで来た = came by bus.",
    ex: {
      jp: "図書館で勉強します。",
      kana: "としょかん で べんきょう します。",
      en: "I study at the library.",
    },
  }),
  gc({
    word: "へ",
    reading: "e",
    meanings: ["direction", "toward"],
    jlpt: "N5",
    category: "core",
    context:
      "Direction/destination, like に but emphasizes the direction of movement rather than the precise endpoint. Pronounced 'e'. Often interchangeable with に for movement verbs.",
    ex: {
      jp: "東京へ行きます。",
      kana: "とうきょう へ いきます。",
      en: "I'm going toward Tokyo.",
    },
  }),
  gc({
    word: "と",
    reading: "to",
    meanings: ["with", "and (exhaustive)", "quotation"],
    jlpt: "N5",
    category: "core",
    context:
      "Three meanings: 'with someone' (友達と行く = go with a friend), exhaustive 'and' connecting nouns (本とペン = a book and pen), and quotation marker (〜と思う = think that ~).",
    ex: {
      jp: "友達と映画を見ました。",
      kana: "ともだち と えいが を みました。",
      en: "I watched a movie with a friend.",
    },
  }),
  gc({
    word: "や",
    reading: "ya",
    meanings: ["and (non-exhaustive)"],
    jlpt: "N5",
    category: "core",
    context:
      "Lists examples without claiming to cover everything. Compare to と: 本とペン = exactly a book and pen; 本やペン = things like a book and pen (and other stuff). Often paired with など (etc.).",
    ex: {
      jp: "りんごやみかんを買いました。",
      kana: "りんご や みかん を かいました。",
      en: "I bought apples, mandarin oranges, etc.",
    },
  }),
  gc({
    word: "から",
    reading: "kara",
    meanings: ["from", "because"],
    jlpt: "N5",
    category: "core",
    context:
      "Starting point in space, time, or causation. 9時から = from 9 o'clock. As a sentence-final connector: 寒いから家にいる = I'm at home because it's cold.",
    ex: {
      jp: "9時から働きます。",
      kana: "くじ から はたらきます。",
      en: "I work from 9 o'clock.",
    },
  }),
  gc({
    word: "まで",
    reading: "made",
    meanings: ["until", "as far as"],
    jlpt: "N5",
    category: "core",
    context: "End-point complement to から. 9時から5時まで = from 9 to 5. 駅まで歩く = walk as far as the station.",
    ex: {
      jp: "5時まで働きます。",
      kana: "ごじ まで はたらきます。",
      en: "I work until 5 o'clock.",
    },
  }),
  gc({
    word: "も",
    reading: "mo",
    meanings: ["also", "even"],
    jlpt: "N5",
    category: "core",
    context:
      "Replaces は or を: 私も学生です = I'm also a student. With numbers, means 'as much as' (10人も来た = as many as 10 people came). With negative + interrogative: 何も = nothing at all.",
    ex: {
      jp: "私も行きます。",
      kana: "わたし も いきます。",
      en: "I'll go too.",
    },
  }),
  gc({
    word: "の",
    reading: "no",
    meanings: ["possessive", "of", "explanation marker"],
    jlpt: "N5",
    category: "core",
    context:
      "Connects nouns: 私の本 = my book, 日本の文化 = Japanese culture. Sentence-final の/んです softens explanations. Also nominalizes verbs: 本を読むのが好き = I like reading books.",
    ex: {
      jp: "これは私の本です。",
      kana: "これ は わたし の ほん です。",
      en: "This is my book.",
    },
  }),
  gc({
    word: "よ",
    reading: "yo",
    meanings: ["sentence-final emphasis"],
    jlpt: "N5",
    category: "sentence-final",
    context:
      "Asserts new information to the listener — 'I'm telling you'. Compare ね (I'm checking with you). Mostly speech, rarely formal writing.",
    ex: {
      jp: "明日は雨ですよ。",
      kana: "あした は あめ です よ。",
      en: "It's going to rain tomorrow, you know.",
    },
  }),
  gc({
    word: "ね",
    reading: "ne",
    meanings: ["sentence-final agreement seeker"],
    jlpt: "N5",
    category: "sentence-final",
    context:
      "Seeks agreement from the listener — 'right?' / 'isn't it?'. Softens statements. Heavy use is conversational.",
    ex: {
      jp: "今日は寒いですね。",
      kana: "きょう は さむい です ね。",
      en: "It's cold today, isn't it?",
    },
  }),
  gc({
    word: "ばかり",
    reading: "bakari",
    meanings: ["only", "just (did)"],
    jlpt: "N3",
    category: "intensifier",
    context:
      "Two distinct uses: (1) attached to nouns/verbs = 'only / nothing but' (テレビばかり見る = does nothing but watch TV); (2) past + ばかり = 'just (did)' (食べたばかり = just ate).",
    ex: {
      jp: "起きたばかりです。",
      kana: "おきた ばかり です。",
      en: "I just woke up.",
    },
  }),
  gc({
    word: "だけ",
    reading: "dake",
    meanings: ["only", "just"],
    jlpt: "N4",
    category: "intensifier",
    context:
      "'Only' / 'just' — limits to exactly the amount stated. Compare to しか (which requires negative): 一つだけ買った = I bought just one (positive). 一つしか買わなかった = I bought only one (with neg, more emphatic).",
    ex: {
      jp: "水だけください。",
      kana: "みず だけ ください。",
      en: "Just water, please.",
    },
  }),
  gc({
    word: "しか",
    reading: "shika",
    meanings: ["only (with negative)"],
    jlpt: "N4",
    category: "intensifier",
    context:
      "Always pairs with a negative verb. Stronger than だけ — emphasizes scarcity / not-much-ness. 千円しかない = I only have 1,000 yen (and that's not much).",
    ex: {
      jp: "一つしかありません。",
      kana: "ひとつ しか ありません。",
      en: "There's only one.",
    },
  }),
];

// ============================================================
// Patterns & phrases
// ============================================================

const patterns = [
  gc({
    word: "～と思う",
    reading: "to omou",
    meanings: ["I think (that)…"],
    jlpt: "N5",
    category: "opinion",
    context:
      "Quote+omou. Plain form before と思う: 行くと思う = I think (someone) will go. For polite speech the と思う itself stays plain — politeness is in the surrounding context.",
    ex: {
      jp: "彼は来ると思います。",
      kana: "かれ は くる と おもいます。",
      en: "I think he'll come.",
    },
  }),
  gc({
    word: "～たい",
    reading: "tai",
    meanings: ["want to ~"],
    jlpt: "N5",
    category: "desire",
    context:
      "Replaces ます on the verb stem to express the speaker's desire. Conjugates like an い-adjective (たくない, たかった). For others' desires use ～たがる instead.",
    ex: {
      jp: "寿司を食べたいです。",
      kana: "すし を たべたい です。",
      en: "I want to eat sushi.",
    },
  }),
  gc({
    word: "～ことがある",
    reading: "koto ga aru",
    meanings: ["have done", "experience"],
    jlpt: "N4",
    category: "experience",
    context:
      "Past form + ことがある = 'I have (the experience of) doing'. 日本に行ったことがある = I have been to Japan. Negative: ～ことがない = have never.",
    ex: {
      jp: "日本に行ったことがあります。",
      kana: "にほん に いった こと が あります。",
      en: "I have been to Japan.",
    },
  }),
  gc({
    word: "～ことができる",
    reading: "koto ga dekiru",
    meanings: ["can ~", "be able to ~"],
    jlpt: "N5",
    category: "ability",
    context:
      "Plain form + ことができる = ability. More formal than the potential form (食べられる). Both work, ことができる is common in writing.",
    ex: {
      jp: "日本語を話すことができます。",
      kana: "にほんご を はなす こと が できます。",
      en: "I can speak Japanese.",
    },
  }),
  gc({
    word: "～つもり",
    reading: "tsumori",
    meanings: ["intend to ~"],
    jlpt: "N4",
    category: "intention",
    context:
      "Plain form + つもり = an intention you've already formed. Stronger commitment than ～たい (want). Negative: ～ないつもり = intend not to.",
    ex: {
      jp: "明日勉強するつもりです。",
      kana: "あした べんきょう する つもり です。",
      en: "I plan to study tomorrow.",
    },
  }),
  gc({
    word: "～はず",
    reading: "hazu",
    meanings: ["should", "ought to (logical inference)"],
    jlpt: "N4",
    category: "inference",
    context:
      "Logical expectation based on evidence — not 'should' as in advice (that's べき). 彼は来るはず = I expect he'll come (because he said so).",
    ex: {
      jp: "彼はもう着いたはずです。",
      kana: "かれ は もう ついた はず です。",
      en: "He should have arrived by now.",
    },
  }),
  gc({
    word: "～べき",
    reading: "beki",
    meanings: ["should (moral / advice)"],
    jlpt: "N3",
    category: "obligation",
    context:
      "Moral or advisory 'should' — what someone OUGHT to do. Stronger than ～たほうがいい. With する: するべき or すべき (both fine).",
    ex: {
      jp: "毎日運動するべきです。",
      kana: "まいにち うんどう する べき です。",
      en: "You should exercise every day.",
    },
  }),
  gc({
    word: "～なければならない",
    reading: "nakereba naranai",
    meanings: ["must ~", "have to ~"],
    jlpt: "N4",
    category: "obligation",
    context:
      "External obligation/necessity. Casual contractions: ～なきゃ, ～ないと. Don't confuse with べき (moral 'should'). 行かなければならない = I have to go.",
    ex: {
      jp: "薬を飲まなければなりません。",
      kana: "くすり を のま なければ なりません。",
      en: "I have to take the medicine.",
    },
  }),
  gc({
    word: "～てもいい",
    reading: "te mo ii",
    meanings: ["may ~", "is it ok if ~"],
    jlpt: "N5",
    category: "permission",
    context: "Te-form + もいい/もよい = permission. Question form is the standard 'may I?' construction.",
    ex: {
      jp: "ここで食べてもいいですか。",
      kana: "ここ で たべて も いい です か。",
      en: "May I eat here?",
    },
  }),
  gc({
    word: "～てはいけない",
    reading: "te wa ikenai",
    meanings: ["must not ~", "can't ~"],
    jlpt: "N5",
    category: "prohibition",
    context:
      "Te-form + はいけない = prohibition. Casual: ～ちゃいけない / ～ちゃだめ. Stronger ban than ない方がいい (you'd better not).",
    ex: {
      jp: "ここで吸ってはいけません。",
      kana: "ここ で すって は いけません。",
      en: "You must not smoke here.",
    },
  }),
  gc({
    word: "～ながら",
    reading: "nagara",
    meanings: ["while ~ing", "at the same time"],
    jlpt: "N4",
    category: "simultaneous",
    context:
      "Verb stem + ながら = doing two things at once. The main verb is the primary action; ながら-clause is the backdrop. 音楽を聞きながら勉強する = study while listening to music.",
    ex: {
      jp: "音楽を聞きながら勉強します。",
      kana: "おんがく を ききながら べんきょう します。",
      en: "I study while listening to music.",
    },
  }),
  gc({
    word: "～たら",
    reading: "tara",
    meanings: ["if ~", "when ~"],
    jlpt: "N4",
    category: "conditional",
    context:
      "Past form + ら = the most flexible conditional. Works for hypothetical (if), temporal (when ~ happens), and even past sequences (when ~ happened). Less formal than ～と or ～ば.",
    ex: {
      jp: "雨が降ったら、行きません。",
      kana: "あめ が ふったら、 いきません。",
      en: "If it rains, I won't go.",
    },
  }),
  gc({
    word: "～ば",
    reading: "ba",
    meanings: ["if ~ (conditional)"],
    jlpt: "N4",
    category: "conditional",
    context:
      "More general/abstract conditional than ～たら. Verb stem + え-row + ば. い-adj: drop い + ければ. な-adj/noun + なら(ば).",
    ex: {
      jp: "時間があれば来てください。",
      kana: "じかん が あれば きて ください。",
      en: "Please come if you have time.",
    },
  }),
  gc({
    word: "～ようになる",
    reading: "you ni naru",
    meanings: ["become able to ~", "come to (do)"],
    jlpt: "N4",
    category: "change",
    context:
      "Plain form + ようになる = a gradual change of state. 食べられるようになった = (I) became able to eat (it). Compare with ～ようにする (consciously start doing).",
    ex: {
      jp: "日本語が話せるようになりました。",
      kana: "にほんご が はなせる ように なりました。",
      en: "I've become able to speak Japanese.",
    },
  }),
  gc({
    word: "～かもしれない",
    reading: "kamo shirenai",
    meanings: ["might ~", "maybe ~"],
    jlpt: "N4",
    category: "uncertainty",
    context:
      "Plain form + かもしれない = possibility ('might'). Casual: ～かも. Less certain than ～でしょう (probably) and far less certain than ～はず (should).",
    ex: {
      jp: "雨が降るかもしれません。",
      kana: "あめ が ふる かも しれません。",
      en: "It might rain.",
    },
  }),
  gc({
    word: "～でしょう",
    reading: "deshou",
    meanings: ["probably", "right?"],
    jlpt: "N5",
    category: "uncertainty",
    context:
      "Speaker's guess based on some evidence. Rising intonation = 'right?' (seeking agreement). Casual form: ～だろう. Stronger than かもしれない, weaker than はず.",
    ex: {
      jp: "明日は晴れでしょう。",
      kana: "あした は はれ でしょう。",
      en: "Tomorrow will probably be sunny.",
    },
  }),
  gc({
    word: "～ところ",
    reading: "tokoro",
    meanings: ["just about to / just (did) / in the middle of"],
    jlpt: "N4",
    category: "aspect",
    context:
      "Tense before ところ pinpoints the moment: 食べるところ = about to eat; 食べているところ = in the middle of eating; 食べたところ = just ate. Same trio as English progressive aspect.",
    ex: {
      jp: "今、食べているところです。",
      kana: "いま、 たべて いる ところ です。",
      en: "I'm in the middle of eating right now.",
    },
  }),
  gc({
    word: "～ようだ / ～みたい",
    reading: "you da / mitai",
    meanings: ["seems like ~"],
    jlpt: "N4",
    category: "appearance",
    context:
      "Subjective impression based on observation. ～ようだ is more formal/literary; ～みたい is casual and very common in speech. Both follow plain form.",
    ex: {
      jp: "雨が降っているようです。",
      kana: "あめ が ふって いる よう です。",
      en: "It seems to be raining.",
    },
  }),
  gc({
    word: "～らしい",
    reading: "rashii",
    meanings: ["seems / I hear (hearsay)"],
    jlpt: "N4",
    category: "appearance",
    context:
      "Hearsay or inference based on external information (vs ～ようだ which is your own observation). 雨らしい = I hear it's raining (someone told me).",
    ex: {
      jp: "彼は来ないらしいです。",
      kana: "かれ は こない らしい です。",
      en: "Apparently he's not coming.",
    },
  }),
  gc({
    word: "～そうだ (hearsay)",
    reading: "sou da",
    meanings: ["I hear that ~"],
    jlpt: "N4",
    category: "hearsay",
    context:
      "Plain form + そうだ = direct quote-like hearsay ('I heard that ~'). Distinct from the appearance ～そう (verb-stem そう = 'looks like ~').",
    ex: {
      jp: "彼は結婚するそうです。",
      kana: "かれ は けっこん する そう です。",
      en: "I hear he's getting married.",
    },
  }),
  gc({
    word: "～ても",
    reading: "te mo",
    meanings: ["even if / even though"],
    jlpt: "N4",
    category: "concessive",
    context: "Te-form + も = concession. 雨が降っても行く = I'll go even if it rains.",
    ex: {
      jp: "高くても買います。",
      kana: "たかくて も かいます。",
      en: "I'll buy it even if it's expensive.",
    },
  }),
];

// ============================================================
// Verb conjugations
// ============================================================

const conjugations = [
  gc({
    word: "Passive (受け身)",
    reading: "ukemi",
    meanings: ["passive form", "got -ed by"],
    jlpt: "N4",
    category: "form",
    context:
      "Also used for the 'suffering passive' (something happened to me, often negatively). The agent is marked with に: 雨に降られた = lit. 'I was rained on'.",
    table: {
      caption: "How to form the passive",
      headers: ["Group", "Rule", "Example"],
      rows: [
        ["Group 1 (u-verb)", "-u → -areru", "書く → 書かれる"],
        ["", "", "飲む → 飲まれる"],
        ["", "", "話す → 話される"],
        ["Group 2 (ru-verb)", "-ru → -rareru", "食べる → 食べられる"],
        ["", "", "見る → 見られる"],
        ["Irregular", "—", "する → される"],
        ["", "", "来る → 来られる (こられる)"],
      ],
    },
    ex: {
      jp: "先生に褒められました。",
      kana: "せんせい に ほめられました。",
      en: "I was praised by the teacher.",
    },
  }),
  gc({
    word: "Causative (使役)",
    reading: "shieki",
    meanings: ["causative form", "make/let X do Y"],
    jlpt: "N4",
    category: "form",
    context:
      "The agent (the one being made/let to do) is marked with に for 'let' (permission) or を for 'make' (force).",
    table: {
      caption: "How to form the causative",
      headers: ["Group", "Rule", "Example"],
      rows: [
        ["Group 1 (u-verb)", "-u → -aseru", "書く → 書かせる"],
        ["", "", "飲む → 飲ませる"],
        ["", "", "話す → 話させる"],
        ["Group 2 (ru-verb)", "-ru → -saseru", "食べる → 食べさせる"],
        ["", "", "見る → 見させる"],
        ["Irregular", "—", "する → させる"],
        ["", "", "来る → 来させる (こさせる)"],
      ],
    },
    ex: {
      jp: "母は弟に野菜を食べさせました。",
      kana: "はは は おとうと に やさい を たべさせました。",
      en: "Mother made my younger brother eat vegetables.",
    },
  }),
  gc({
    word: "Causative-passive",
    reading: "shieki ukemi",
    meanings: ["was made to ~"],
    jlpt: "N3",
    category: "form",
    context:
      "Stack causative + passive. Conveys 'I was made to do X (and it was unpleasant)'. Group 1 has a casual contraction: -aserareru → -asareru (飲まされる).",
    table: {
      caption: "Stacking causative + passive",
      headers: ["Group", "Stack", "Example"],
      rows: [
        ["Group 1", "-aseru + -rareru → -aserareru", "飲む → 飲ませられる"],
        ["", "(or contracted -asareru)", "→ 飲まされる"],
        ["Group 2", "-saseru + -rareru → -saserareru", "食べる → 食べさせられる"],
        ["Irregular", "—", "する → させられる"],
        ["", "", "来る → 来させられる"],
      ],
    },
    ex: {
      jp: "宿題をさせられました。",
      kana: "しゅくだい を させられました。",
      en: "I was made to do homework.",
    },
  }),
  gc({
    word: "Potential (可能形)",
    reading: "kanou-kei",
    meanings: ["can ~", "be able to"],
    jlpt: "N4",
    category: "form",
    context:
      "Particle shifts to が (not を): 寿司が食べられる = I can eat sushi. The Group 2 short form 食べれる (called ら抜き 'ra-drop') is colloquial — fine in speech, avoid in writing.",
    table: {
      caption: "How to form the potential",
      headers: ["Group", "Rule", "Example"],
      rows: [
        ["Group 1 (u-verb)", "-u → -eru", "書く → 書ける"],
        ["", "", "話す → 話せる"],
        ["", "", "飲む → 飲める"],
        ["Group 2 (ru-verb)", "-ru → -rareru", "食べる → 食べられる"],
        ["", "(casual: -reru)", "→ 食べれる (ら抜き)"],
        ["Irregular", "—", "する → できる"],
        ["", "", "来る → 来られる (こられる)"],
      ],
    },
    ex: {
      jp: "日本語が話せます。",
      kana: "にほんご が はなせます。",
      en: "I can speak Japanese.",
    },
  }),
  gc({
    word: "Volitional (意向形)",
    reading: "ikou-kei",
    meanings: ["let's ~", "I think I'll ~"],
    jlpt: "N4",
    category: "form",
    context:
      "Polite form: ～ましょう. Used for 'let's', invitations (行こう = let's go), and one's own intention with ～と思う (行こうと思う = I'm thinking of going).",
    table: {
      caption: "How to form the volitional",
      headers: ["Group", "Rule", "Example"],
      rows: [
        ["Group 1 (u-verb)", "-u → -ou", "書く → 書こう"],
        ["", "", "飲む → 飲もう"],
        ["", "", "話す → 話そう"],
        ["Group 2 (ru-verb)", "-ru → -you", "食べる → 食べよう"],
        ["", "", "見る → 見よう"],
        ["Irregular", "—", "する → しよう"],
        ["", "", "来る → 来よう (こよう)"],
      ],
    },
    ex: {
      jp: "映画を見に行こう。",
      kana: "えいが を み に いこう。",
      en: "Let's go see a movie.",
    },
  }),
  gc({
    word: "Imperative (命令形)",
    reading: "meirei-kei",
    meanings: ["command form"],
    jlpt: "N4",
    category: "form",
    context:
      "Direct, blunt command. Sounds rude in everyday settings — use ～てください for polite requests. You'll see imperative on traffic signs, in anime/manga, and in martial-arts shouts.",
    table: {
      caption: "How to form the imperative",
      headers: ["Group", "Rule", "Example"],
      rows: [
        ["Group 1 (u-verb)", "-u → -e", "書く → 書け"],
        ["", "", "飲む → 飲め"],
        ["", "", "立つ → 立て"],
        ["Group 2 (ru-verb)", "-ru → -ro", "食べる → 食べろ"],
        ["", "(or formal -yo)", "→ 食べよ"],
        ["Irregular", "—", "する → しろ / せよ"],
        ["", "", "来る → 来い (こい)"],
      ],
    },
    ex: {
      jp: "立て！",
      kana: "たて！",
      en: "Stand up!",
    },
  }),
  gc({
    word: "Te-form (て形)",
    reading: "te-kei",
    meanings: ["te-form (connector)"],
    jlpt: "N5",
    category: "form",
    context:
      "The connector form. Joins clauses ('and then'), forms requests (～てください), forms continuous (～ている), and many compound expressions. Group 1 transformations depend on the final consonant — the table is essential.",
    table: {
      caption: "Te-form by ending",
      headers: ["Ending", "Te-form", "Example"],
      rows: [
        ["う / つ / る (G1)", "→ って", "言う → 言って, 待つ → 待って, 取る → 取って"],
        ["ぬ / ぶ / む", "→ んで", "死ぬ → 死んで, 遊ぶ → 遊んで, 飲む → 飲んで"],
        ["く", "→ いて", "書く → 書いて"],
        ["", "(except 行く)", "行く → 行って ⚠"],
        ["ぐ", "→ いで", "泳ぐ → 泳いで"],
        ["す", "→ して", "話す → 話して"],
        ["-る (Group 2)", "→ て", "食べる → 食べて, 見る → 見て"],
        ["Irregular", "—", "する → して, 来る → 来て (きて)"],
      ],
    },
    ex: {
      jp: "朝ご飯を食べて、出かけました。",
      kana: "あさごはん を たべて、 でかけました。",
      en: "I ate breakfast and then went out.",
    },
  }),
  gc({
    word: "～ている",
    reading: "te iru",
    meanings: ["progressive", "resultant state"],
    jlpt: "N5",
    category: "aspect",
    context: "Casual contraction: ～てる. Whether it means 'is X-ing' or 'is in the X-ed state' depends on whether the verb is durative (continuous action) or punctual (instant change).",
    table: {
      caption: "Two senses depending on verb type",
      headers: ["Sense", "Verb type", "Example"],
      rows: [
        ["Progressive ('-ing')", "Durative", "食べている = is eating"],
        ["", "(continuous action)", "走っている = is running"],
        ["Resultant state", "Punctual", "結婚している = is married"],
        ["", "(instant change)", "知っている = knows"],
        ["", "", "死んでいる = is dead"],
      ],
    },
    ex: {
      jp: "今、食べています。",
      kana: "いま、 たべて います。",
      en: "I'm eating now.",
    },
  }),
  gc({
    word: "～てある",
    reading: "te aru",
    meanings: ["resultant state (intentional)"],
    jlpt: "N4",
    category: "aspect",
    context:
      "Implies someone deliberately did the action and the result remains. Compare with ～ている (state), ～ておく (preparation).",
    table: {
      caption: "～てある vs siblings",
      headers: ["Pattern", "Implies", "Example"],
      rows: [
        ["～てある", "Done on purpose, result remains", "ドアが開けてある = door has been opened"],
        ["～ている", "State (no implied agent)", "ドアが開いている = door is open"],
        ["～ておく", "Doing in advance for later", "ドアを開けておく = open the door (in advance)"],
      ],
    },
    ex: {
      jp: "窓が開けてあります。",
      kana: "まど が あけて あります。",
      en: "The window has been opened (and is open now).",
    },
  }),
  gc({
    word: "～ておく",
    reading: "te oku",
    meanings: ["do in advance", "leave in a state"],
    jlpt: "N4",
    category: "aspect",
    context:
      "Te-form + おく = preparation, foresight. Casual contraction is ～とく (買っとく for 買っておく). Past: ～ておいた / ～といた.",
    table: {
      caption: "Common uses",
      headers: ["Use", "Example", "Translation"],
      rows: [
        ["Prepare ahead", "ビールを冷やしておく", "chill the beer (in advance)"],
        ["", "宿題をしておく", "do the homework (ahead of time)"],
        ["Leave as-is", "そのままにしておいて", "leave it as it is"],
        ["Casual (とく)", "買っとく", "I'll buy it (ahead of time)"],
      ],
    },
    ex: {
      jp: "ビールを冷やしておきます。",
      kana: "びーる を ひやして おきます。",
      en: "I'll chill the beer in advance.",
    },
  }),
  gc({
    word: "～てしまう",
    reading: "te shimau",
    meanings: ["finish completely", "do unfortunately"],
    jlpt: "N4",
    category: "aspect",
    context:
      "Two senses depending on tone: completion ('finish up') or regret ('oh no, I did it'). Casual contractions: ～ちゃう (for て) and ～じゃう (for で).",
    table: {
      caption: "Two senses",
      headers: ["Sense", "Example", "Translation"],
      rows: [
        ["Completion", "ケーキを食べてしまう", "eat the whole cake"],
        ["", "本を読んでしまった", "finished reading the book"],
        ["Regret / 'oh no'", "忘れてしまった", "I (regrettably) forgot"],
        ["Casual (ちゃう)", "やっちゃった", "oh, I went and did it"],
      ],
    },
    ex: {
      jp: "ケーキを食べてしまいました。",
      kana: "けーき を たべて しまいました。",
      en: "I ended up eating the whole cake.",
    },
  }),
  gc({
    word: "～ていく / ～てくる",
    reading: "te iku / te kuru",
    meanings: ["go on ~ing", "come to ~ (continuous)"],
    jlpt: "N4",
    category: "aspect",
    context:
      "About direction of change in time/space. ～ていく moves AWAY (future, departing); ～てくる moves TOWARD (past-to-present, approaching).",
    table: {
      caption: "Direction of change",
      headers: ["Pattern", "Direction", "Example"],
      rows: [
        ["～ていく", "Away / forward", "寒くなっていく = it's getting colder (going forward)"],
        ["", "", "出ていく = leave / depart"],
        ["～てくる", "Up to now", "寒くなってきた = it's gotten colder"],
        ["", "", "走ってくる = come running"],
      ],
    },
    ex: {
      jp: "だんだん寒くなってきました。",
      kana: "だんだん さむく なって きました。",
      en: "It's gradually getting colder.",
    },
  }),
  gc({
    word: "Honorific (尊敬語)",
    reading: "sonkeigo",
    meanings: ["respectful form (about others)"],
    jlpt: "N3",
    category: "keigo",
    context:
      "Elevates the listener or subject — never used about yourself. Patterns: special verbs (table) OR お+verb-stem+になる (お読みになる) OR the passive form ～られる (mild honorific).",
    table: {
      caption: "Common verbs in honorific form",
      headers: ["Plain", "Honorific", "Meaning"],
      rows: [
        ["行く / 来る / いる", "いらっしゃる", "go / come / be"],
        ["食べる / 飲む", "召し上がる", "eat / drink"],
        ["する", "なさる", "do"],
        ["言う", "おっしゃる", "say"],
        ["見る", "ご覧になる", "look / watch"],
        ["くれる", "くださる", "give (to me)"],
        ["知る", "ご存じだ", "know"],
      ],
    },
    ex: {
      jp: "先生は何時にいらっしゃいますか。",
      kana: "せんせい は なんじ に いらっしゃいます か。",
      en: "What time is the teacher coming?",
    },
  }),
  gc({
    word: "Humble (謙譲語)",
    reading: "kenjougo",
    meanings: ["humble form (about oneself)"],
    jlpt: "N3",
    category: "keigo",
    context:
      "Lowers the speaker — used for your own actions when addressing someone of higher status. Patterns: special verbs (table) OR お+verb-stem+する (お持ちする = humbly carry).",
    table: {
      caption: "Common verbs in humble form",
      headers: ["Plain", "Humble", "Meaning"],
      rows: [
        ["行く / 来る", "参る (まいる)", "go / come"],
        ["いる", "おる", "be"],
        ["食べる / 飲む", "いただく", "eat / drink"],
        ["もらう", "いただく", "receive"],
        ["する", "いたす", "do"],
        ["言う", "申す (もうす)", "say"],
        ["見る", "拝見する", "look / view"],
        ["あげる", "差し上げる", "give"],
      ],
    },
    ex: {
      jp: "明日、お電話いたします。",
      kana: "あした、 おでんわ いたします。",
      en: "I will (humbly) call you tomorrow.",
    },
  }),
];

// ============================================================
// Emit decks
// ============================================================

const decks = [
  {
    file: "vocab_grammar_particles.json",
    deck_id: "grammar-particles",
    deck_name: "Grammar: Particles (助詞)",
    subtitle: "は が を に で へ · the connective tissue of Japanese",
    notes:
      "The core particles every Japanese sentence is built from. Each card explains the role, contrasts with similar particles, and gives a real-use example. Includes the trickier intensifiers (ばかり, だけ, しか) and sentence-final mood markers (よ, ね).",
    cards: particles,
  },
  {
    file: "vocab_grammar_patterns.json",
    deck_id: "grammar-patterns",
    deck_name: "Grammar: Patterns & phrases",
    subtitle: "～と思う · ～ばかり · ～ところ · ～はず — sentence patterns",
    notes:
      "Common sentence patterns and grammatical phrases — the kind of multi-word constructions that turn isolated verbs into fluent expressions. Calls out the distinctions native speakers make: ～かもしれない vs ～でしょう vs ～はず, ～ようだ vs ～らしい, ～たら vs ～ば, etc.",
    cards: patterns,
  },
  {
    file: "vocab_grammar_conjugations.json",
    deck_id: "grammar-conjugations",
    deck_name: "Grammar: Verb conjugations (活用)",
    subtitle: "Passive · causative · potential · te-form · keigo",
    notes:
      "The major verb conjugation forms: passive (受け身), causative (使役), causative-passive, potential (可能形), volitional (意向形), imperative (命令形), te-form (て形), and the aspect compounds (～ている, ～てある, ～ておく, ～てしまう, ～ていく/くる). Plus a starter for keigo (尊敬語 / 謙譲語).",
    cards: conjugations,
  },
];

console.log("Writing grammar decks → agent-files/\n");
for (const d of decks) {
  const payload = {
    deck_id: d.deck_id,
    deck_name: d.deck_name,
    subtitle: d.subtitle,
    version: "1.0",
    card_count: d.cards.length,
    notes: d.notes,
    source: "Hand-authored for Kanjido v1 (factual common-knowledge Japanese grammar).",
    cards: d.cards,
  };
  writeFileSync(join(OUT_DIR, d.file), JSON.stringify(payload, null, 2) + "\n");
  console.log(`  ${d.file.padEnd(40)} ${d.cards.length.toString().padStart(3)} cards`);
}
console.log("\n✓ Grammar decks written.");
