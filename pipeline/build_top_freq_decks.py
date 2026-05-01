#!/usr/bin/env python3
"""
build_top_freq_decks.py — Generate two new decks:

  1. agent-files/kanji_top_freq.json
     A frequency-ordered, JLPT-tagged kanji deck drawn from the existing
     JLPT-N5..N1 decks in pipeline/out/. Obvious N5 single-reading kanji
     are filtered out unless they're in OBVIOUS_KEEPLIST_KANJI (items
     English speakers commonly trip over: transitivity pairs, multi-reading
     items, counters, position/temporal nuance kanji, etc.).

  2. agent-files/vocab_top_freq.json
     A curated high-frequency vocab deck (hand-picked words from the
     well-known top-1000-most-frequent vocab range), with the same filter
     rule. Each entry has a frequency_rank and JLPT level.

Both decks are picked up by pipeline/bundle.py automatically:
  - vocab_*.json via the existing glob
  - kanji_top_freq.json after we extend bundle.py with a kanji_*.json glob

Run: python3 pipeline/build_top_freq_decks.py
Then:  python3 pipeline/bundle.py
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from extra_kanji_data import EXTRA_KANJI

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
PIPE_OUT = os.path.join(HERE, "out")
AGENTS = os.path.join(REPO, "agent-files")

# ─────────────────────────────────────────────────────────────────────────────
# 1. KANJI: load existing JLPT decks, dedupe, rank by frequency, filter.
# ─────────────────────────────────────────────────────────────────────────────

# The single-reading, ultra-basic kanji an N3+ learner has long since burned
# in. We drop these UNLESS they're in OBVIOUS_KEEPLIST_KANJI below.
DROP_OBVIOUS_BASE = set(list("一二三四五六七八九十百千万円年月日時分私人男女子目口手足"))

# Items that LOOK obvious but trip up English speakers — we keep these even
# if they're basic JLPT N5. Reasons noted inline.
OBVIOUS_KEEPLIST_KANJI = set(list(
    # transitivity / multiple readings / nuanced compounds
    "入"  # 入る/入れる pair, 入学 vs 入院 reading shifts
    "出"  # 出る/出す pair, 出席/出発
    "上"  # 上手 (じょうず), 上る/上げる, 上がる
    "下"  # 下手 (へた), 下りる/下げる, 下さい
    "中"  # 〜中 (じゅう vs ちゅう) ambiguity
    "間"  # 〜の間, time/space ambiguity, あいだ vs かん
    "前"  # 〜の前 (まえ) vs 午前 (ごぜん)
    "後"  # 〜の後 (あと/うしろ/ご) — three readings
    "見"  # 見る/見える/見せる multi-form
    "聞"  # 聞く/聞こえる/聞かせる
    "言"  # 言う (いう often pronounced ゆう)
    "行"  # 行く (いく/ゆく), 行 vs 銀行 (ぎんこう)
    "来"  # 来る (irregular くる/きます/こない)
    "大"  # 大人 (おとな), 大学 (だいがく) — multiple readings
    "小"  # 小さい vs 小学校 (しょうがっこう)
    "本"  # counter, 日本, 本 (book) — context-shift
    "気"  # 気を付ける, 気持ち, 元気 — abstract usage
    "生"  # 学生, 生まれる, 生きる, 生 (なま) — many readings
    "新"  # 新しい (あたらしい — pronounced atarashii not arata-)
    "今"  # 今 (いま) vs 今日 (きょう) vs 今年 (ことし)
))

# Add the filter-to-keep items back if they were in the drop set.
DROP_OBVIOUS = DROP_OBVIOUS_BASE - OBVIOUS_KEEPLIST_KANJI

# Approximate frequency tiers, used to assign frequency_rank to existing
# JLPT-deck kanji. These are the well-established top of newspaper-corpus
# frequency lists (KANJIDIC2 freq field consensus). Tier 1 = ranks 1–50,
# Tier 2 = 51–150, Tier 3 = 151–350, then by JLPT for the long tail.
FREQ_TIER_1 = list("日一国人年大十二本中長出三同時政事自行社見月分議後前生五間上東西南北")
FREQ_TIER_2 = list("学高新会者場家手力来発成新立気度小手電力下言意者業先父母兄弟姉妹友校")

def load_jlpt_decks():
    """Returns merged dict: {kanji_char: card_dict}, with later entries
    (lower JLPT, more frequent) taking precedence."""
    merged = {}
    # Load N1 first (least frequent), so N5 entries (loaded last) win on dupes.
    for level in ["n1", "n2", "n3", "n4", "n5"]:
        path = os.path.join(PIPE_OUT, f"jlpt-{level}.json")
        with open(path, encoding="utf-8") as f:
            deck = json.load(f)
        for c in deck["cards"]:
            # Normalize: drop the per-card 'decks' bookkeeping field if present.
            c.pop("decks", None)
            # Ensure JLPT is set; older decks might not have it stamped.
            c.setdefault("jlpt", level.upper())
            merged[c["kanji"]] = c
    return merged

def assign_frequency_rank(merged):
    """Assign an integer frequency_rank to each card. Tier 1/2 get explicit
    ranks; everything else gets ranked by (jlpt_order, alpha order) as a
    proxy. The rank is APPROXIMATE — the deck's notes field calls this out."""
    rank = 1
    ranks = {}
    # Tier 1 first
    for k in FREQ_TIER_1:
        if k in merged and k not in ranks:
            ranks[k] = rank
            rank += 1
    # Tier 2 next
    for k in FREQ_TIER_2:
        if k in merged and k not in ranks:
            ranks[k] = rank
            rank += 1
    # Then everything else by JLPT order (N5 most frequent → N1 least).
    jlpt_order = {"N5": 0, "N4": 1, "N3": 2, "N2": 3, "N1": 4}
    remaining = sorted(
        [k for k in merged if k not in ranks],
        key=lambda k: (jlpt_order.get(merged[k].get("jlpt", "N3"), 3), k),
    )
    for k in remaining:
        ranks[k] = rank
        rank += 1
    return ranks

def build_kanji_deck():
    merged = load_jlpt_decks()
    # Add hand-curated extras (high-frequency kanji not in existing JLPT decks).
    extras_added = 0
    for entry in EXTRA_KANJI:
        if entry["kanji"] not in merged:
            merged[entry["kanji"]] = dict(entry)
            extras_added += 1
    print(f"  + {extras_added} extra kanji from extra_kanji_data.py")
    ranks = assign_frequency_rank(merged)
    cards = []
    dropped_obvious = []
    for k, card in merged.items():
        if k in DROP_OBVIOUS:
            dropped_obvious.append(k)
            continue
        new_card = dict(card)
        new_card["frequency_rank"] = ranks[k]
        cards.append(new_card)
    cards.sort(key=lambda c: c["frequency_rank"])

    deck = {
        "deck_id": "kanji-top-freq",
        "deck_name": "Top Frequency Kanji (filtered)",
        "version": "1.0",
        "card_count": len(cards),
        "notes": (
            "High-frequency kanji drawn from the existing JLPT N5–N1 decks, "
            "ordered by approximate frequency (KANJIDIC2 newspaper-corpus "
            "consensus for the top tiers, then by JLPT level for the long "
            "tail). Ultra-basic single-reading N5 kanji are filtered out "
            "(numerals, basic body parts, simple time words) — kept "
            "exceptions are kanji English speakers commonly trip over: "
            "transitive/intransitive pairs, multi-reading items, position/"
            "time nuance, counters. Each card carries a frequency_rank "
            "field; ranks are approximate. Dropped: " + "".join(sorted(dropped_obvious))
        ),
        "cards": cards,
    }
    out_path = os.path.join(AGENTS, "kanji_top_freq.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(deck, f, ensure_ascii=False, indent=2)
    print(f"✓ {out_path}: {len(cards)} cards (dropped {len(dropped_obvious)} obvious)")
    return deck


# ─────────────────────────────────────────────────────────────────────────────
# 2. VOCAB: hand-curated high-frequency vocab list with JLPT tags.
# ─────────────────────────────────────────────────────────────────────────────
#
# This is a curated subset focused on words that:
#   (a) are genuinely high-frequency in modern Japanese (BCCWJ-style corpora),
#   (b) trip up English-speaking learners despite being "basic" — false-friend
#       katakana, transitivity pairs, multi-reading items, nuance pairs,
#       conditionals/connectives, counters with reading shifts, register
#       distinctions.
#
# Each row is a tuple: (frequency_rank, word, reading, jlpt, category,
# context, meanings_csv, ex_jp, ex_kana, ex_en).
#
# Frequency ranks here are LOOSE — they reflect the rough order in which
# these words appear in everyday Japanese, not a strict corpus rank. The
# aim is to give the learner a sensible study order.

VOCAB_ROWS = [
    # ── Transitive/intransitive verb pairs (English-speaker classic stumble)
    (1, "入る", "はいる", "N5", "verb_pair",
     "Intransitive: 'something/someone enters'. Pairs with 入れる (transitive: 'put in'). 入る (はいる) is intransitive — but the kanji 入 also reads いる/いれる in compounds.",
     "to enter, to go in",
     "部屋に入る。", "へや に はいる。", "I enter the room."),
    (2, "入れる", "いれる", "N5", "verb_pair",
     "Transitive: 'put X in'. Pair of 入る. Note the reading shift: 入る=はいる, 入れる=いれる.",
     "to put in, to insert",
     "コーヒーに砂糖を入れる。", "コーヒー に さとう を いれる。", "I put sugar in the coffee."),
    (3, "出る", "でる", "N5", "verb_pair",
     "Intransitive: 'something/someone exits, comes out, attends'. Pairs with 出す.",
     "to leave, to come out, to attend",
     "家を出る。", "いえ を でる。", "I leave the house. (note: を marks the place left)"),
    (4, "出す", "だす", "N5", "verb_pair",
     "Transitive: 'take out, send out, submit'. Pair of 出る. Also a productive suffix: 動き出す 'start moving'.",
     "to take out, to submit, to send",
     "宿題を出す。", "しゅくだい を だす。", "I turn in the homework."),
    (5, "開く", "あく", "N5", "verb_pair",
     "Intransitive: 'opens (by itself)'. Pairs with 開ける. ALSO read ひらく with overlapping meaning — confusing.",
     "to open (intrans.)",
     "ドアが開く。", "ドア が あく。", "The door opens."),
    (6, "開ける", "あける", "N5", "verb_pair",
     "Transitive: 'open something'. Pair of 開く (あく).",
     "to open (trans.)",
     "窓を開ける。", "まど を あける。", "I open the window."),
    (7, "閉まる", "しまる", "N5", "verb_pair",
     "Intransitive: 'closes (by itself)'. Pairs with 閉める.",
     "to close (intrans.)",
     "店が閉まる。", "みせ が しまる。", "The shop closes."),
    (8, "閉める", "しめる", "N5", "verb_pair",
     "Transitive: 'close something'. Pair of 閉まる.",
     "to close (trans.)",
     "ドアを閉める。", "ドア を しめる。", "I close the door."),
    (9, "始まる", "はじまる", "N4", "verb_pair",
     "Intransitive: 'begins'. Pairs with 始める. Used for events, classes, movies.",
     "to begin (intrans.)",
     "授業が始まる。", "じゅぎょう が はじまる。", "Class begins."),
    (10, "始める", "はじめる", "N4", "verb_pair",
     "Transitive: 'begin something'. Also a suffix: 〜始める 'start to ~'.",
     "to begin (trans.)",
     "宿題を始める。", "しゅくだい を はじめる。", "I start the homework."),
    (11, "終わる", "おわる", "N5", "verb_pair",
     "Intransitive: 'ends'. Pairs with 終える / 終わらせる.",
     "to end (intrans.)",
     "映画が終わる。", "えいが が おわる。", "The movie ends."),
    (12, "落ちる", "おちる", "N4", "verb_pair",
     "Intransitive: 'falls, drops, fails (a test)'. Pairs with 落とす. 試験に落ちる = fail an exam.",
     "to fall, to drop, to fail",
     "コップが落ちた。", "コップ が おちた。", "The cup fell."),
    (13, "落とす", "おとす", "N4", "verb_pair",
     "Transitive: 'drop something, lose something'. 財布を落とす = lose your wallet.",
     "to drop, to lose",
     "鍵を落とした。", "かぎ を おとした。", "I dropped my keys."),
    (14, "上がる", "あがる", "N4", "verb_pair",
     "Intransitive: 'rises, goes up'. Pairs with 上げる. Also 'enter (a Japanese house)'.",
     "to rise, to go up",
     "値段が上がる。", "ねだん が あがる。", "Prices rise."),
    (15, "上げる", "あげる", "N5", "verb_pair",
     "Transitive: 'raise, give (to equal/superior)'. Pair of 上がる. Also an auxiliary in giving verbs.",
     "to raise, to give",
     "手を上げる。", "て を あげる。", "I raise my hand."),
    (16, "下がる", "さがる", "N4", "verb_pair",
     "Intransitive: 'goes down, hangs down'. Pairs with 下げる.",
     "to fall, to go down",
     "気温が下がる。", "きおん が さがる。", "The temperature drops."),
    (17, "下げる", "さげる", "N4", "verb_pair",
     "Transitive: 'lower, take down'. Pair of 下がる.",
     "to lower",
     "音量を下げる。", "おんりょう を さげる。", "I lower the volume."),
    (18, "止まる", "とまる", "N4", "verb_pair",
     "Intransitive: 'stops'. Pairs with 止める.",
     "to stop (intrans.)",
     "電車が止まる。", "でんしゃ が とまる。", "The train stops."),
    (19, "止める", "とめる", "N4", "verb_pair",
     "Transitive: 'stop something'. Also written 留める, 泊める (different meanings — kanji choice matters).",
     "to stop (trans.)",
     "車を止める。", "くるま を とめる。", "I stop the car."),
    (20, "決まる", "きまる", "N4", "verb_pair",
     "Intransitive: 'is decided'. Pairs with 決める. もう決まった = it's already decided.",
     "to be decided",
     "予定が決まった。", "よてい が きまった。", "The plan was decided."),
    (21, "決める", "きめる", "N4", "verb_pair",
     "Transitive: 'decide'. Pair of 決まる.",
     "to decide",
     "行く日を決める。", "いく ひ を きめる。", "I decide the day to go."),
    (22, "集まる", "あつまる", "N4", "verb_pair",
     "Intransitive: 'gather (by themselves)'. Pairs with 集める.",
     "to gather (intrans.)",
     "人が集まる。", "ひと が あつまる。", "People gather."),
    (23, "集める", "あつめる", "N4", "verb_pair",
     "Transitive: 'collect, gather'. Pair of 集まる. 切手を集める = collect stamps.",
     "to collect",
     "情報を集める。", "じょうほう を あつめる。", "I collect information."),
    (24, "変わる", "かわる", "N4", "verb_pair",
     "Intransitive: 'change'. Pairs with 変える. 変な (へんな) is unrelated — 'strange'.",
     "to change (intrans.)",
     "天気が変わる。", "てんき が かわる。", "The weather changes."),
    (25, "変える", "かえる", "N4", "verb_pair",
     "Transitive: 'change something'. Homophones to watch: 帰る (return), 買える (can buy), 替える (replace).",
     "to change (trans.)",
     "予定を変える。", "よてい を かえる。", "I change the schedule."),
    (26, "続く", "つづく", "N3", "verb_pair",
     "Intransitive: 'continues'. Pairs with 続ける. Also an auxiliary: 〜と続く 'continue ~ing'.",
     "to continue (intrans.)",
     "雨が続く。", "あめ が つづく。", "The rain continues."),
    (27, "続ける", "つづける", "N3", "verb_pair",
     "Transitive: 'continue something'. Suffix: 〜続ける 'keep ~ing'.",
     "to continue (trans.)",
     "勉強を続ける。", "べんきょう を つづける。", "I continue studying."),
    (28, "残る", "のこる", "N3", "verb_pair",
     "Intransitive: 'remains, is left over'. Pairs with 残す.",
     "to remain",
     "食べ物が残った。", "たべもの が のこった。", "Food was left over."),
    (29, "残す", "のこす", "N3", "verb_pair",
     "Transitive: 'leave behind, save'. Pair of 残る.",
     "to leave behind",
     "メモを残す。", "メモ を のこす。", "I leave a note."),
    (30, "戻る", "もどる", "N4", "verb_pair",
     "Intransitive: 'return, go back (to a place)'. Distinct from 帰る (go home). Pair: 戻す.",
     "to go back, to return",
     "席に戻る。", "せき に もどる。", "I return to my seat."),
    (31, "戻す", "もどす", "N4", "verb_pair",
     "Transitive: 'put back, return something'. Pair of 戻る.",
     "to put back, to return (trans.)",
     "本を棚に戻す。", "ほん を たな に もどす。", "I put the book back on the shelf."),
    (32, "増える", "ふえる", "N3", "verb_pair",
     "Intransitive: 'increases'. Pairs with 増やす.",
     "to increase (intrans.)",
     "人口が増える。", "じんこう が ふえる。", "The population increases."),
    (33, "増やす", "ふやす", "N3", "verb_pair",
     "Transitive: 'increase something'. Pair of 増える.",
     "to increase (trans.)",
     "貯金を増やす。", "ちょきん を ふやす。", "I grow my savings."),
    (34, "減る", "へる", "N3", "verb_pair",
     "Intransitive: 'decreases'. Pairs with 減らす.",
     "to decrease (intrans.)",
     "体重が減った。", "たいじゅう が へった。", "My weight dropped."),
    (35, "減らす", "へらす", "N3", "verb_pair",
     "Transitive: 'decrease something'. Pair of 減る.",
     "to decrease (trans.)",
     "支出を減らす。", "ししゅつ を へらす。", "I cut expenses."),

    # ── False-friend katakana
    (40, "マンション", "マンション", "N4", "false_friend_katakana",
     "False friend: 'apartment / condo', NOT 'mansion'. A 'mansion' in English is 大邸宅 (だいていたく) or 豪邸 (ごうてい).",
     "apartment, condo (mid-rise residential)",
     "新しいマンションに引っ越した。", "あたらしい マンション に ひっこした。", "I moved to a new apartment."),
    (41, "アパート", "アパート", "N5", "false_friend_katakana",
     "Cheaper / smaller / older apartment than マンション. The English-Japanese mapping is reversed from intuition: アパート < マンション.",
     "apartment (typically small, low-rise)",
     "古いアパートに住んでいる。", "ふるい アパート に すんで いる。", "I live in an old apartment."),
    (42, "テンション", "テンション", "N3", "false_friend_katakana",
     "False friend: 'mood / energy level', NOT 'tension/stress'. テンションが高い = energetic/excited. For 'tension/stress', use ストレス or 緊張 (きんちょう).",
     "mood, energy level",
     "今日はテンションが高い。", "きょう は テンション が たかい。", "I'm in high spirits today."),
    (43, "スマート", "スマート", "N3", "false_friend_katakana",
     "False friend: 'slim, slender' (about body), NOT 'intelligent'. For 'smart', use 賢い (かしこい) or 頭がいい.",
     "slim, slender",
     "彼はスマートな体型だ。", "かれ は スマート な たいけい だ。", "He has a slim build."),
    (44, "ナイーブ", "ナイーブ", "N3", "false_friend_katakana",
     "False friend: 'sensitive, delicate' (often positive), NOT 'naive/gullible'. For naive (English sense), use 世間知らず (せけんしらず).",
     "sensitive, delicate",
     "彼はナイーブな人だ。", "かれ は ナイーブ な ひと だ。", "He's a sensitive person."),
    (45, "クレーム", "クレーム", "N2", "false_friend_katakana",
     "False friend: 'complaint', NOT 'claim'. クレームを入れる = file a complaint. For 'claim' in English sense, use 主張 (しゅちょう).",
     "complaint",
     "お客様からクレームが来た。", "おきゃくさま から クレーム が きた。", "We got a complaint from a customer."),
    (46, "サービス", "サービス", "N4", "false_friend_katakana",
     "Often means 'free, on the house', not just 'service'. このコーヒーはサービスです = This coffee is on us.",
     "service; free of charge",
     "デザートはサービスです。", "デザート は サービス です。", "The dessert is on the house."),
    (47, "ハンサム", "ハンサム", "N3", "false_friend_katakana",
     "Used only for men. The female counterpart is 美人 (びじん) or きれい. For 'attractive person' generally, イケメン (m) / 美人 (f).",
     "handsome (men only)",
     "彼はハンサムだ。", "かれ は ハンサム だ。", "He's handsome."),
    (48, "ユニーク", "ユニーク", "N3", "false_friend_katakana",
     "Often slightly negative — 'weird, quirky' rather than 'distinctively excellent'. Be careful complimenting someone with this.",
     "unique, quirky (sometimes slightly negative)",
     "ユニークな考え方だ。", "ユニーク な かんがえかた だ。", "That's a quirky way of thinking."),
    (49, "コンセント", "コンセント", "N3", "false_friend_katakana",
     "False friend: 'electrical outlet', NOT 'consent'. For 'consent', use 同意 (どうい).",
     "electrical outlet, power socket",
     "コンセントに差し込む。", "コンセント に さしこむ。", "I plug it into the outlet."),
    (50, "バイキング", "バイキング", "N3", "false_friend_katakana",
     "Means 'all-you-can-eat buffet', NOT 'Viking'. From the 1958 Imperial Hotel restaurant 'Viking' that introduced the concept.",
     "all-you-can-eat buffet",
     "ホテルでバイキングを食べた。", "ホテル で バイキング を たべた。", "I had buffet at the hotel."),

    # ── Multi-reading items / commonly confused readings
    (60, "上手", "じょうず", "N5", "multi_reading",
     "じょうず = 'skilled at, good at'. Distinguish from 上手 (うわて — 'upper hand') and 上手い (うまい — colloquial 'good at, tasty'). The が-particle pattern: ピアノが上手 'good at piano'.",
     "skilled, good at",
     "彼女は料理が上手だ。", "かのじょ は りょうり が じょうず だ。", "She's good at cooking."),
    (61, "下手", "へた", "N5", "multi_reading",
     "へた = 'unskilled, bad at'. Pair of 上手. Same が-particle pattern: 歌が下手 'bad at singing'. 下手 (したて) is a different word ('lower hand').",
     "unskilled, bad at",
     "私は歌が下手だ。", "わたし は うた が へた だ。", "I'm bad at singing."),
    (62, "今日", "きょう", "N5", "multi_reading",
     "Special reading. The 'expected' reading (こんにち) exists but means 'these days, present-day' — different word.",
     "today",
     "今日は寒い。", "きょう は さむい。", "It's cold today."),
    (63, "明日", "あした", "N5", "multi_reading",
     "Three readings: あした (casual), あす (formal/news), みょうにち (very formal). Same kanji.",
     "tomorrow",
     "明日また来ます。", "あした また きます。", "I'll come again tomorrow."),
    (64, "一日", "ついたち", "N5", "multi_reading",
     "ついたち = 'first of the month'. The 'expected' reading いちにち means 'one day' (a duration). Same kanji, different meaning.",
     "1st of the month (or 'one day' as いちにち)",
     "三月一日に会おう。", "さんがつ ついたち に あおう。", "Let's meet on March 1st."),
    (65, "二十日", "はつか", "N4", "multi_reading",
     "Special reading: はつか = '20th of the month' or '20 days'. Other date readings: 一日 ついたち, 二日 ふつか, 三日 みっか, 四日 よっか, 五日 いつか, 六日 むいか, 七日 なのか, 八日 ようか, 九日 ここのか, 十日 とおか.",
     "20th of the month, 20 days",
     "二十日に出発する。", "はつか に しゅっぱつ する。", "I leave on the 20th."),
    (66, "大人", "おとな", "N5", "multi_reading",
     "おとな = 'adult'. The 'expected' reading だいじん means 'cabinet minister' — different word entirely.",
     "adult",
     "もう大人だから。", "もう おとな だから。", "Because I'm an adult now."),
    (67, "今年", "ことし", "N5", "multi_reading",
     "Special reading. Compare 来年 (らいねん) 'next year', 去年 (きょねん) 'last year' — those use the 'expected' on'yomi.",
     "this year",
     "今年は忙しい。", "ことし は いそがしい。", "This year is busy."),
    (68, "果物", "くだもの", "N5", "multi_reading",
     "Special reading: くだもの = 'fruit'. Don't read it as かぶつ.",
     "fruit",
     "果物が好きだ。", "くだもの が すき だ。", "I like fruit."),
    (69, "一人", "ひとり", "N5", "multi_reading",
     "One person. 二人 ふたり (two people). 三人〜 use さんにん, よにん etc. The first two are irregular.",
     "one person, alone",
     "一人で行く。", "ひとり で いく。", "I'll go alone."),
    (70, "二人", "ふたり", "N5", "multi_reading",
     "Two people. Pairs irregularly with 一人 ひとり. From 三人 onwards uses regular 〜にん counter.",
     "two people",
     "二人で映画を見た。", "ふたり で えいが を みた。", "We watched a movie together (2 people)."),

    # ── Conditionals / connectives English speakers misuse
    (80, "ても", "ても", "N4", "conditional",
     "'Even if' — the conditional that doesn't change the outcome. 雨が降っても行く = I'll go even if it rains. Distinguish from 〜たら (sequence) and 〜ば (general condition).",
     "even if",
     "高くても買う。", "たかくて も かう。", "Even if it's expensive, I'll buy it."),
    (81, "のに", "のに", "N4", "conditional",
     "'Despite, even though' — with a sense of contrary expectation. Different from が/けど (neutral 'but'). 勉強したのに = even though I studied (and yet...).",
     "despite, even though",
     "勉強したのに、できなかった。", "べんきょう した のに、できなかった。", "Even though I studied, I couldn't do it."),
    (82, "なら", "なら", "N4", "conditional",
     "'If (you mean) X, then'. Topic-conditional — picks up the listener's premise. 寿司なら、あの店だ = If you mean sushi, that's the shop.",
     "if (it's the case that)",
     "京都に行くなら、清水寺へ。", "きょうと に いく なら、きよみずでら へ。", "If you're going to Kyoto, go to Kiyomizu-dera."),
    (83, "ば", "ば", "N4", "conditional",
     "General/hypothetical condition. Forms: 食べれば, 行けば, 高ければ. Often translated 'if', but can be 'when' for predictable consequences.",
     "if (general / hypothetical)",
     "安ければ買う。", "やすければ かう。", "If it's cheap, I'll buy it."),
    (84, "たら", "たら", "N4", "conditional",
     "Sequence 'when/if X happens then'. The most general conditional in spoken Japanese. 駅に着いたら電話して = call me when you reach the station.",
     "when / if (sequence)",
     "家に着いたら電話する。", "いえ に ついたら でんわ する。", "I'll call when I get home."),

    # ── Counters with reading shifts
    (90, "個", "こ", "N4", "counter",
     "Generic counter for small objects. Reading shifts: 一個 いっこ, 六個 ろっこ, 十個 じゅっこ — small-tsu before こ.",
     "(counter for small objects)",
     "りんごを三個買った。", "りんご を さんこ かった。", "I bought 3 apples."),
    (91, "本", "ほん", "N5", "counter",
     "Counter for long thin objects. Reading shifts: 一本 いっぽん, 三本 さんぼん, 六本 ろっぽん, 八本 はっぽん.",
     "(counter for long thin objects)",
     "ペンを二本ください。", "ペン を にほん ください。", "Two pens, please."),
    (92, "枚", "まい", "N5", "counter",
     "Counter for flat objects (paper, plates, tickets). Reading is regular 〜まい.",
     "(counter for flat objects)",
     "切手を三枚買った。", "きって を さんまい かった。", "I bought 3 stamps."),
    (93, "匹", "ひき", "N4", "counter",
     "Counter for small animals. Reading shifts: 一匹 いっぴき, 三匹 さんびき, 六匹 ろっぴき.",
     "(counter for small animals)",
     "猫が二匹いる。", "ねこ が にひき いる。", "I have 2 cats."),
    (94, "冊", "さつ", "N4", "counter",
     "Counter for books, notebooks, magazines. Reading shifts: 一冊 いっさつ, 八冊 はっさつ, 十冊 じゅっさつ.",
     "(counter for bound items)",
     "本を三冊読んだ。", "ほん を さんさつ よんだ。", "I read 3 books."),
    (95, "杯", "はい", "N4", "counter",
     "Counter for cupfuls / bowls. Reading shifts: 一杯 いっぱい, 三杯 さんばい, 六杯 ろっぱい. Also 一杯 (いっぱい) means 'full / a lot'.",
     "(counter for cups/bowls)",
     "コーヒーを一杯ください。", "コーヒー を いっぱい ください。", "One cup of coffee, please."),

    # ── Particle / register pitfalls
    (100, "は", "は", "N5", "particle",
     "Topic marker. Pronounced わ as a particle, but written は. Contrast with が (subject/new info). 私は学生です — 'as for me, I'm a student'.",
     "(topic marker)",
     "私は田中です。", "わたし は たなか です。", "I'm Tanaka."),
    (101, "が", "が", "N5", "particle",
     "Subject marker (or marker of new/exclusive info). Used with potentials: 食べられる — sushi が 食べられる.",
     "(subject marker)",
     "雨が降っている。", "あめ が ふって いる。", "It's raining."),
    (102, "に", "に", "N5", "particle",
     "Multi-purpose particle: time (3時に), destination (東京に), indirect object (彼に渡す), passive agent (先生に叱られる). Distinguish from で (action locus).",
     "(time / destination / indirect object)",
     "学校に行く。", "がっこう に いく。", "I go to school."),
    (103, "で", "で", "N5", "particle",
     "Action locus, means/instrument, cause. 学校で勉強する 'study at school' (action). 学校にいる 'be at school' (existence).",
     "(action location / means)",
     "図書館で本を読む。", "としょかん で ほん を よむ。", "I read books at the library."),
    (104, "を", "を", "N5", "particle",
     "Direct object marker. Pronounced お. Also marks the path of motion verbs: 道を歩く 'walk along the road'.",
     "(direct object marker)",
     "本を読む。", "ほん を よむ。", "I read a book."),

    # ── Common N4–N3 verbs (high-frequency, often subtly distinct)
    (110, "思う", "おもう", "N5", "thinking_verb",
     "Subjective/emotional 'think, feel'. Contrast with 考える (deliberate reasoning). Often takes と clause: 〜と思う 'I think that ~'.",
     "to think, to feel (subjective)",
     "彼は来ると思う。", "かれ は くる と おもう。", "I think he'll come."),
    (111, "考える", "かんがえる", "N4", "thinking_verb",
     "Deliberate 'think, consider'. Contrast with 思う (feel). 考えてみる = let me consider/think about it.",
     "to think, to consider (deliberate)",
     "問題を考える。", "もんだい を かんがえる。", "I think about the problem."),
    (112, "知る", "しる", "N4", "knowing",
     "Inchoative 'come to know'. The state 'I know' is 知っている; 知らない = 'I don't know'. NOT 知る.",
     "to (come to) know",
     "彼の名前を知っている。", "かれ の なまえ を しって いる。", "I know his name."),
    (113, "分かる", "わかる", "N5", "knowing",
     "'Understand, be clear'. Takes が, not を: 日本語が分かる 'I understand Japanese'. Distinct from 知る (know facts).",
     "to understand, to be clear",
     "日本語が分かる。", "にほんご が わかる。", "I understand Japanese."),
    (114, "思い出す", "おもいだす", "N4", "thinking_verb",
     "'Recall, remember (suddenly)' — the act of bringing something to mind. Distinct from 覚える (memorize) and 覚えている (remember/have in mind).",
     "to recall, to remember (recall)",
     "急に思い出した。", "きゅう に おもいだした。", "I suddenly remembered."),
    (115, "覚える", "おぼえる", "N4", "thinking_verb",
     "Inchoative 'memorize, learn by heart'. The state 'I remember' is 覚えている. Common bug: using 覚える where English would say 'I remember'.",
     "to memorize, to learn",
     "漢字を覚える。", "かんじ を おぼえる。", "I memorize kanji."),
    (116, "気をつける", "きをつける", "N4", "set_phrase",
     "'Be careful, watch out'. 〜に気をつける = be careful of ~. 体に気をつけて = take care of yourself (a common parting phrase).",
     "to be careful",
     "車に気をつけてください。", "くるま に きを つけて ください。", "Please watch out for cars."),
    (117, "気にする", "きにする", "N3", "set_phrase",
     "'Mind, worry about'. Often imperative 気にしないで = don't worry about it. Distinct from 気になる (be curious about / be on one's mind).",
     "to mind, to worry about",
     "そんなこと気にしないで。", "そんな こと きに しない で。", "Don't worry about that."),
    (118, "気になる", "きになる", "N3", "set_phrase",
     "'Be on one's mind, be curious about, be bothered by'. Different from 気にする (active 'mind'). 気になる is involuntary.",
     "to be on one's mind",
     "結果が気になる。", "けっか が きに なる。", "I'm anxious about the result."),

    # ── N3 vocab — high-frequency abstract nouns
    (130, "経験", "けいけん", "N3", "abstract_noun",
     "Lived/personal experience. Pairs with する as 経験する 'to undergo'. For 'experience' in the sense of 'a single event', use 〜たこと.",
     "experience",
     "海外で働いた経験がある。", "かいがい で はたらいた けいけん が ある。", "I have experience working abroad."),
    (131, "感じ", "かんじ", "N3", "abstract_noun",
     "'Feeling, impression'. Homophone with 漢字 (kanji characters) — context distinguishes. こんな感じ = 'like this'.",
     "feeling, impression",
     "嫌な感じがする。", "いや な かんじ が する。", "I have a bad feeling."),
    (132, "意味", "いみ", "N5", "abstract_noun",
     "'Meaning'. 意味がある = 'has meaning, is meaningful'. 意味がない = pointless.",
     "meaning",
     "この単語の意味は？", "この たんご の いみ は？", "What's the meaning of this word?"),
    (133, "理由", "りゆう", "N4", "abstract_noun",
     "'Reason'. 理由を聞く = ask the reason. 〜の理由で = 'for the reason of ~'. Slightly more formal than わけ.",
     "reason",
     "遅れた理由を教えて。", "おくれた りゆう を おしえて。", "Tell me why you were late."),
    (134, "結果", "けっか", "N3", "abstract_noun",
     "'Result, outcome'. 〜の結果 = 'as a result of ~'. Test results, sports results, etc.",
     "result, outcome",
     "試験の結果が出た。", "しけん の けっか が でた。", "The test results came out."),
    (135, "場合", "ばあい", "N3", "abstract_noun",
     "'Case, situation'. 〜の場合 = 'in the case of ~'. Common conditional substitute: もしもの場合は = 'in case of emergency'.",
     "case, situation",
     "雨の場合は中止です。", "あめ の ばあい は ちゅうし です。", "In case of rain, it's cancelled."),
    (136, "問題", "もんだい", "N5", "abstract_noun",
     "'Problem, question, issue'. Both school 'question' and life 'problem'. 問題ない = 'no problem'.",
     "problem, question",
     "難しい問題だ。", "むずかしい もんだい だ。", "It's a difficult problem."),
    (137, "場所", "ばしょ", "N5", "abstract_noun",
     "'Place, location'. More formal than ところ, especially in spatial/event contexts.",
     "place, location",
     "待ち合わせの場所を決めた。", "まちあわせ の ばしょ を きめた。", "We decided the meeting place."),
    (138, "時間", "じかん", "N5", "abstract_noun",
     "'Time, duration, an hour'. 一時間 'one hour'. Distinct from 時 (とき) 'time/moment' and 時刻 (じこく) 'point in time'.",
     "time, duration, hour",
     "時間がない。", "じかん が ない。", "There's no time."),
    (139, "様子", "ようす", "N3", "abstract_noun",
     "'State, appearance, situation'. 〜の様子 = 'the state/look of ~'. Often translated 'how X is doing/looking'.",
     "state, appearance, situation",
     "彼の様子がおかしい。", "かれ の ようす が おかしい。", "His behavior is odd."),

    # ── More N3-tier verbs / adjectives high-frequency
    (150, "感じる", "かんじる", "N3", "verb",
     "'Feel, sense'. Internal sensation or impression. Contrast with 思う (cognitive).",
     "to feel",
     "寒さを感じる。", "さむさ を かんじる。", "I feel the cold."),
    (151, "進む", "すすむ", "N3", "verb",
     "Intransitive 'advance, progress'. Pairs with 進める. 工事が進む = construction progresses.",
     "to progress, to advance",
     "計画が進んでいる。", "けいかく が すすんで いる。", "The plan is progressing."),
    (152, "進める", "すすめる", "N3", "verb_pair",
     "Transitive 'advance something, push forward'. Distinct from 勧める (recommend) — same reading.",
     "to advance (trans.)",
     "話を進める。", "はなし を すすめる。", "I push the conversation forward."),
    (153, "勧める", "すすめる", "N3", "verb",
     "'Recommend, suggest'. Same reading as 進める but different kanji and meaning. お勧め (おすすめ) = recommendation.",
     "to recommend",
     "この本を勧める。", "この ほん を すすめる。", "I recommend this book."),
    (154, "守る", "まもる", "N3", "verb",
     "'Protect, keep (a promise/rule)'. ルールを守る = follow the rules. 約束を守る = keep a promise.",
     "to protect, to keep",
     "約束を守る。", "やくそく を まもる。", "I keep my promises."),
    (155, "比べる", "くらべる", "N3", "verb",
     "'Compare'. 〜と比べる = 'compare with ~'. 〜に比べて = 'compared to ~'.",
     "to compare",
     "去年に比べて寒い。", "きょねん に くらべて さむい。", "It's cold compared to last year."),
    (156, "選ぶ", "えらぶ", "N4", "verb",
     "'Choose, select'. Direct object with を. 一つ選ぶ = pick one.",
     "to choose, to select",
     "好きなのを選んでください。", "すき な の を えらんで ください。", "Please choose what you like."),
    (157, "答える", "こたえる", "N4", "verb",
     "'Answer, respond'. Indirect object with に: 質問に答える = answer the question. Noun form: 答え (こたえ).",
     "to answer",
     "質問に答えてください。", "しつもん に こたえて ください。", "Please answer the question."),
    (158, "伝える", "つたえる", "N3", "verb",
     "'Convey, tell, pass on (a message)'. Slightly more formal than 言う. 〜と伝えてください = please tell them ~.",
     "to convey, to tell",
     "彼によろしく伝えて。", "かれ に よろしく つたえて。", "Tell him I said hello."),
    (159, "向かう", "むかう", "N3", "verb",
     "'Head toward, face'. 〜に向かう = head toward ~. The verb of motion-toward, more specific than 行く.",
     "to head toward, to face",
     "駅に向かう。", "えき に むかう。", "I head toward the station."),
    (160, "捨てる", "すてる", "N4", "verb",
     "'Throw away, discard, abandon'. ゴミを捨てる = throw out the trash. Also figurative: 夢を捨てる = give up a dream.",
     "to throw away",
     "ごみを捨てる。", "ごみ を すてる。", "I throw out the trash."),

    # ── Adjectives English speakers under-distinguish
    (170, "美しい", "うつくしい", "N3", "adjective",
     "Aesthetic 'beautiful' — landscapes, art, formal contexts. Contrast with きれい (cleaner/more universal beauty word). 美しい is more literary.",
     "beautiful (formal/aesthetic)",
     "美しい景色だ。", "うつくしい けしき だ。", "It's a beautiful view."),
    (171, "きれい", "きれい", "N5", "adjective",
     "Beautiful, clean, neat — multi-purpose. Acts as a な-adjective despite ending in い. きれいな部屋 = a clean room.",
     "pretty, clean (na-adj)",
     "きれいな花だ。", "きれい な はな だ。", "It's a pretty flower."),
    (172, "厳しい", "きびしい", "N3", "adjective",
     "Strict, severe, harsh. People (厳しい先生 strict teacher), conditions (厳しい寒さ harsh cold), criticism.",
     "strict, severe",
     "厳しい先生だ。", "きびしい せんせい だ。", "He's a strict teacher."),
    (173, "懐かしい", "なつかしい", "N3", "adjective",
     "'Nostalgic, brings back memories'. No clean English equivalent — Japanese specific. Common reaction word: 懐かしい！ = 'oh, that takes me back!'",
     "nostalgic, fondly remembered",
     "懐かしい歌だ。", "なつかしい うた だ。", "This song brings back memories."),
    (174, "もったいない", "もったいない", "N3", "adjective",
     "'Wasteful, regrettable to waste'. Cultural concept — used about food, opportunities, talent. No clean English equivalent.",
     "wasteful, too good to waste",
     "捨てるのはもったいない。", "すてる の は もったいない。", "It would be a waste to throw it away."),

    # ── Common N3 nouns
    (190, "気持ち", "きもち", "N5", "noun",
     "'Feeling, mood'. About internal emotional state. Distinct from 気分 (overall mood/condition) and 感じ (impression).",
     "feeling, mood",
     "彼の気持ちが分からない。", "かれ の きもち が わからない。", "I don't understand his feelings."),
    (191, "気分", "きぶん", "N4", "noun",
     "'Mood, how one feels (overall)'. 気分が悪い = feel sick/bad. 気分転換 (きぶんてんかん) = change of pace.",
     "mood, condition",
     "今日は気分がいい。", "きょう は きぶん が いい。", "I feel good today."),
    (192, "予定", "よてい", "N4", "noun",
     "'Plan, schedule'. 予定がある = have plans. 予定通り = as planned.",
     "plan, schedule",
     "明日の予定はある？", "あした の よてい は ある？", "Do you have plans tomorrow?"),
    (193, "都合", "つごう", "N3", "noun",
     "'Convenience, circumstances'. 都合がいい = convenient. 都合がつく = can make it work. Asking 都合はどう？ = is the timing OK?",
     "convenience, circumstances",
     "明日は都合が悪い。", "あした は つごう が わるい。", "Tomorrow is inconvenient."),
    (194, "経済", "けいざい", "N3", "noun",
     "'Economy'. 経済的 (けいざいてき) = economical/financial. Sino-Japanese, formal register.",
     "economy",
     "日本経済について話す。", "にほん けいざい について はなす。", "We talk about the Japanese economy."),
    (195, "政治", "せいじ", "N3", "noun",
     "'Politics'. 政治家 (せいじか) = politician. Sino-Japanese, formal.",
     "politics",
     "政治に興味がある。", "せいじ に きょうみ が ある。", "I'm interested in politics."),
    (196, "社会", "しゃかい", "N3", "noun",
     "'Society'. 社会人 (しゃかいじん) = working adult / member of society — a culturally loaded term in Japan.",
     "society",
     "社会の問題について。", "しゃかい の もんだい について。", "About society's problems."),
    (197, "文化", "ぶんか", "N4", "noun",
     "'Culture'. 文化的 (ぶんかてき) = cultural. 日本文化 = Japanese culture.",
     "culture",
     "日本の文化が好き。", "にほん の ぶんか が すき。", "I like Japanese culture."),
    (198, "歴史", "れきし", "N4", "noun",
     "'History'. 歴史的 (れきしてき) = historical. Used both for 'history (the discipline)' and 'a history (of something)'.",
     "history",
     "日本の歴史を勉強する。", "にほん の れきし を べんきょう する。", "I study Japanese history."),
    (199, "情報", "じょうほう", "N3", "noun",
     "'Information'. 情報を集める = gather information. Common in modern register (IT, news).",
     "information",
     "新しい情報が入った。", "あたらしい じょうほう が はいった。", "New information came in."),

    # ── Set / connective expressions English speakers often miss
    (210, "やっぱり", "やっぱり", "N3", "expression",
     "'After all, as expected, just as I thought'. Highly common in conversation. More formal: やはり.",
     "after all, as expected",
     "やっぱり来なかった。", "やっぱり こなかった。", "Just as I thought, he didn't come."),
    (211, "とにかく", "とにかく", "N3", "expression",
     "'Anyway, in any case'. Used to set aside details and focus. Discourse marker.",
     "anyway, in any case",
     "とにかく行こう。", "とにかく いこう。", "Anyway, let's go."),
    (212, "実は", "じつは", "N3", "expression",
     "'Actually, the truth is'. Confession/revelation marker. More formal: 実のところ.",
     "actually, the truth is",
     "実は知らなかった。", "じつは しらなかった。", "Actually, I didn't know."),
    (213, "確か", "たしか", "N3", "expression",
     "Adverb 'if I recall correctly'. As a な-adjective: 確かな情報 = reliable information.",
     "if I recall correctly; certain",
     "確か昨日だった。", "たしか きのう だった。", "I think it was yesterday."),
    (214, "結局", "けっきょく", "N3", "expression",
     "'In the end, after all'. Wraps up a sequence with the final result. Discourse marker.",
     "in the end",
     "結局行かなかった。", "けっきょく いかなかった。", "In the end, I didn't go."),
    (215, "むしろ", "むしろ", "N3", "expression",
     "'Rather, if anything'. Sets up a counter-expectation: 'not X, but rather Y'.",
     "rather, if anything",
     "嫌いではなく、むしろ好きだ。", "きらい では なく、むしろ すき だ。", "Not that I dislike it — rather, I like it."),

    # ── Time / sequence expressions
    (230, "最近", "さいきん", "N4", "time",
     "'Recently, these days'. Wide-window 'recent past' (weeks-months). 最近忙しい = I've been busy lately.",
     "recently, lately",
     "最近忙しい。", "さいきん いそがしい。", "I've been busy lately."),
    (231, "急に", "きゅうに", "N3", "time",
     "'Suddenly, unexpectedly'. Adverb. 急に変わった = changed suddenly.",
     "suddenly",
     "急に雨が降ってきた。", "きゅう に あめ が ふって きた。", "Suddenly it started raining."),
    (232, "そろそろ", "そろそろ", "N3", "time",
     "'It's about time, soon'. Soft suggestive timing. そろそろ帰ろう = it's about time we head home.",
     "it's about time, soon",
     "そろそろ寝よう。", "そろそろ ねよう。", "Let's get to bed soon."),
    (233, "ずっと", "ずっと", "N4", "time",
     "'Continuously, the whole time, by far'. Two senses: duration ('the entire time') and degree ('by far': ずっといい = much better).",
     "all along; by far",
     "ずっと待っていた。", "ずっと まって いた。", "I was waiting the whole time."),
    (234, "やっと", "やっと", "N3", "time",
     "'Finally, at last' — with an undertone of 'after long effort/wait'. やっと終わった = it's finally over.",
     "finally, at last",
     "やっと宿題が終わった。", "やっと しゅくだい が おわった。", "I finally finished the homework."),
]

def build_vocab_deck():
    cards = []
    for row in VOCAB_ROWS:
        rank, word, reading, jlpt, category, context, meanings_csv, ex_jp, ex_kana, ex_en = row
        meanings = [m.strip() for m in meanings_csv.split(",")]
        cards.append({
            "word": word,
            "reading": reading,
            "meanings": meanings,
            "jlpt": jlpt,
            "category": category,
            "context": context,
            "example_sentence": ex_jp,
            "example_reading": ex_kana,
            "example_meaning": ex_en,
            "frequency_rank": rank,
        })
    cards.sort(key=lambda c: c["frequency_rank"])
    deck = {
        "deck_id": "vocab-top-freq",
        "deck_name": "Top Frequency Vocab (filtered)",
        "version": "1.0",
        "source": "Hand-curated from BCCWJ-style modern Japanese frequency, "
                  "filtered for English-speaker pitfalls.",
        "learner_level": "N3",
        "notes": (
            "High-frequency vocab curated for an N3-level English-speaking "
            "learner. Coverage emphasizes items that English speakers "
            "commonly trip up on even at this level: transitive/intransitive "
            "verb pairs, false-friend katakana, multi-reading items, "
            "conditionals, counters with reading shifts, particle/register "
            "pitfalls. Truly trivial N5 entries (numerals, basic family "
            "words, 行く/来る etc.) are intentionally omitted. Each card "
            "carries a frequency_rank (loose; reflects suggested study "
            "order, not a strict corpus rank). The deck can be grown via "
            "the japanese-coauthor skill — ask 'add more N3 vocab in the "
            "X category' to extend incrementally."
        ),
        "card_count": len(cards),
        "cards": cards,
    }
    out_path = os.path.join(AGENTS, "vocab_top_freq.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(deck, f, ensure_ascii=False, indent=2)
    print(f"✓ {out_path}: {len(cards)} cards")
    return deck


if __name__ == "__main__":
    print("Building Top Frequency Kanji deck…")
    build_kanji_deck()
    print("\nBuilding Top Frequency Vocab deck…")
    build_vocab_deck()
    print("\nNext: python3 pipeline/bundle.py")
