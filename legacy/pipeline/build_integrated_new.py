#!/usr/bin/env python3
"""
Generates Integrated Approach Ch.6, 8, 9, 10, 11, 12, 13, 14, 15
from the kanji-list screenshots.

Each chapter's card list is the 書くのを覚える漢字 section only.
"""
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__))

# Bootstrap K dict from build_decks
import io
_old_stdout = sys.stdout
sys.stdout = io.StringIO()
try:
    exec_code = open(os.path.join(os.path.dirname(__file__), "build_decks.py")).read()
    exec(exec_code.split("\ndecks_to_build")[0])   # stops before the deck-emit section
finally:
    sys.stdout = _old_stdout

def ex(w, r, m): return {"kanji": w, "kana": r, "meaning": m}

# ─────────────────────────────────────────────────────────────────────────────
# NEW KANJI not yet in K
# compact: k(char, [meanings], [on], [kun], [ex1,ex2,ex3], kw, etym, strokes, jlpt, grade)
# ─────────────────────────────────────────────────────────────────────────────

# ── Ch.6 new ─────────────────────────────────────────────────────────────────
k("勤",["work hard","serve","be employed"],["キン","ゴン"],["つと(める)","つと(まる)"],
  [ex("勤める","つとめる","to work, to serve"),ex("勤務","きんむ","duty, work"),ex("通勤","つうきん","commuting")],
  "work hard","Strength (力) applied to a plant (堇) — steadily tending, working hard.",12,"N3",0)
k("実",["fruit","truth","reality"],["ジツ"],["み","みの(る)"],
  [ex("実物","じつぶつ","real thing"),ex("実際","じっさい","in reality"),ex("事実","じじつ","fact")],
  "reality","A roof (宀) filled with coins (貫) — the real, substantial fruit.",8,"N3",3)
k("員",["member","employee"],["イン"],[],
  [ex("店員","てんいん","shop clerk"),ex("社員","しゃいん","company employee"),ex("全員","ぜんいん","all members")],
  "member","A mouth (口) over a shell/coin (貝) — a counted person, a member.",10,"N4",3)
k("面",["face","surface","mask"],["メン","ミン"],["おも","おもて","つら"],
  [ex("面白い","おもしろい","interesting"),ex("面接","めんせつ","interview"),ex("場面","ばめん","scene")],
  "face","A face framed by hair — the outline of a human face.",9,"N3",3)
k("茶",["tea","brown"],["チャ","サ"],[],
  [ex("お茶","おちゃ","tea"),ex("茶色","ちゃいろ","brown"),ex("茶道","さどう","tea ceremony")],
  "tea","Grass (艹) over wood and earth — a tea plant growing.",9,"N4",2)
k("売",["sell"],["バイ"],["う(る)","う(れる)"],
  [ex("売る","うる","to sell"),ex("売り場","うりば","sales floor"),ex("発売","はつばい","release, going on sale")],
  "sell","A crown (士) over net (罒) over shell/money (貝) — displaying goods to sell.",7,"N4",2)
k("限",["limit","boundary"],["ゲン"],["かぎ(る)"],
  [ex("限る","かぎる","to limit"),ex("限界","げんかい","limit, boundary"),ex("制限","せいげん","restriction")],
  "limit","Hill/boundary (阝) + eye looking (艮) — seeing the edge, a limit.",9,"N4",5)
k("慣",["accustom","be used to"],["カン"],["な(れる)","な(らす)"],
  [ex("慣れる","なれる","to get used to"),ex("習慣","しゅうかん","habit, custom"),ex("慣用","かんよう","conventional use")],
  "accustom","Heart (忄) + penetrate (貫) — the heart that has gone through it, accustomed.",14,"N3",5)
k("感",["feeling","sense","emotion"],["カン"],[],
  [ex("感じる","かんじる","to feel"),ex("感動","かんどう","be moved, touched"),ex("感謝","かんしゃ","gratitude")],
  "feeling","All (咸) over heart (心) — the heart receiving everything, a feeling.",13,"N4",3)
k("渡",["cross","hand over"],["ト"],["わた(る)","わた(す)"],
  [ex("渡す","わたす","to hand over"),ex("渡る","わたる","to cross"),ex("渡航","とこう","voyage, crossing")],
  "cross","Water (氵) + degrees (度) — measuring the water to cross it.",12,"N3",0)
k("呼",["call","breathe"],["コ"],["よ(ぶ)"],
  [ex("呼ぶ","よぶ","to call"),ex("呼吸","こきゅう","breathing"),ex("呼び出す","よびだす","to call out")],
  "call","Mouth (口) + breath (乎) — the mouth calling out with breath.",8,"N3",6)
k("館",["building","hall"],["カン"],["やかた"],
  [ex("旅館","りょかん","Japanese inn"),ex("図書館","としょかん","library"),ex("映画館","えいがかん","cinema")],
  "hall","Food (食) + official (官) — a large building that feeds officials.",16,"N4",3)
k("級",["class","rank","level"],["キュウ"],[],
  [ex("高級","こうきゅう","high-class"),ex("同級生","どうきゅうせい","classmate"),ex("初級","しょきゅう","beginner level")],
  "rank","Thread (糸) + reach (及) — threads sorted to a level, a rank.",9,"N4",3)
k("必",["certain","necessarily"],["ヒツ"],["かなら(ず)"],
  [ex("必要","ひつよう","necessary"),ex("必ず","かならず","certainly"),ex("必死","ひっし","desperate")],
  "certain","A heart (心) pierced by a spear — what must certainly happen.",5,"N4",4)
k("要",["need","important","main"],["ヨウ"],["い(る)","かなめ"],
  [ex("必要","ひつよう","necessary"),ex("重要","じゅうよう","important"),ex("要求","ようきゅう","demand, request")],
  "need","A woman (女) at the waist — the essential, central part.",9,"N4",4)
k("比",["compare","ratio"],["ヒ"],["くら(べる)"],
  [ex("比べる","くらべる","to compare"),ex("比率","ひりつ","ratio, rate"),ex("比較","ひかく","comparison")],
  "compare","Two people (人+人) standing side by side — comparing.",4,"N4",5)
k("価",["value","price"],["カ"],["あたい"],
  [ex("物価","ぶっか","prices"),ex("価値","かち","value, worth"),ex("評価","ひょうか","evaluation")],
  "value","Person (亻) + goods (賈 simplified) — the price a person assigns to goods.",8,"N4",5)

# ── Ch.8 new ─────────────────────────────────────────────────────────────────
k("探",["search","look for"],["タン"],["さが(す)","さぐ(る)"],
  [ex("探す","さがす","to look for"),ex("探偵","たんてい","detective"),ex("探検","たんけん","exploration")],
  "search","Hand (扌) + forest/deep (深 partial) — a hand reaching deep to find.",11,"N3",0)
k("師",["teacher","master","expert"],["シ"],[],
  [ex("教師","きょうし","teacher"),ex("医師","いし","physician"),ex("師匠","ししょう","master, mentor")],
  "master","Hill/troops (阝) + cloth wrap (巾) + ten (十) — a leader commanding troops.",10,"N4",6)
k("係",["person in charge","relation"],["ケイ"],["かか(る)","かかり"],
  [ex("係","かかり","person in charge"),ex("関係","かんけい","relationship"),ex("係員","かかりいん","staff member")],
  "relation","Person (亻) + thread/connect (系) — a person connected to a role.",9,"N4",5)
k("主",["master","main","owner"],["シュ","ス"],["ぬし","おも"],
  [ex("主人","しゅじん","husband, master"),ex("主張","しゅちょう","assertion"),ex("主に","おもに","mainly")],
  "master","A lamp with a flame — the one whose light guides, the master.",5,"N3",3)
k("任",["responsibility","entrust"],["ニン"],["まか(せる)"],
  [ex("任せる","まかせる","to entrust"),ex("責任","せきにん","responsibility"),ex("任務","にんむ","mission, duty")],
  "entrust","Person (亻) + pregnant (壬) — carrying the weight, entrusting.",6,"N4",5)
k("然",["so","nature","like that"],["ゼン","ネン"],[],
  [ex("全然","ぜんぜん","not at all"),ex("当然","とうぜん","naturally"),ex("自然","しぜん","nature")],
  "so","Flesh (月) + dog (犬) + fire (灬) — roasting meat, then 'so it is.'",12,"N4",4)
k("個",["individual","counter for objects"],["コ"],[],
  [ex("個人","こじん","individual, personal"),ex("個性","こせい","individuality"),ex("一個","いっこ","one piece")],
  "individual","Person (亻) + solid/hard (固) — one solid individual.",10,"N4",5)
k("技",["skill","technique"],["ギ"],["わざ"],
  [ex("技術","ぎじゅつ","technology, technique"),ex("特技","とくぎ","special skill"),ex("技能","ぎのう","technical skill")],
  "skill","Hand (扌) + branch/diverge (支) — a hand that branches into skills.",7,"N4",5)
k("許",["permit","allow","forgive"],["キョ"],["ゆる(す)"],
  [ex("許す","ゆるす","to permit, forgive"),ex("許可","きょか","permission"),ex("免許","めんきょ","license")],
  "permit","Words (言) + noon (午) — speaking at noon to allow something.",11,"N4",5)
k("迎",["welcome","meet","receive"],["ゲイ"],["むか(える)"],
  [ex("迎える","むかえる","to welcome, to meet"),ex("歓迎","かんげい","welcome"),ex("出迎え","でむかえ","meeting someone")],
  "welcome","Walking (辶) + raised figure (卬) — going out to meet someone.",7,"N4",0)
k("決",["decide","determine"],["ケツ"],["き(める)","き(まる)"],
  [ex("決める","きめる","to decide"),ex("決定","けってい","decision"),ex("解決","かいけつ","resolution")],
  "decide","Water (氵) + cut/incise (夬) — cutting through the water, deciding.",7,"N4",3)
k("法",["law","method","way"],["ホウ","ハッ","ホッ"],["のり"],
  [ex("方法","ほうほう","method"),ex("法律","ほうりつ","law"),ex("文法","ぶんぽう","grammar")],
  "law","Water (氵) + going away (去) — the flow that orders all things, the law.",8,"N4",4)
k("幸",["happiness","fortune","luck"],["コウ"],["しあわ(せ)","さいわ(い)"],
  [ex("幸せ","しあわせ","happiness"),ex("幸運","こううん","good fortune"),ex("不幸","ふこう","misfortune")],
  "happiness","Handcuffs avoided (reversed 辛) — escaping bitterness, happiness.",8,"N4",3)
k("定",["decide","fixed","determined"],["テイ","ジョウ"],["さだ(める)"],
  [ex("決定","けってい","decision"),ex("定期","ていき","regular, fixed-term"),ex("定員","ていいん","capacity")],
  "fixed","Roof (宀) + foot walking correctly (正) — settling in place, fixed.",8,"N4",3)
k("彼",["he","that (over there)"],["ヒ"],["かれ","かの"],
  [ex("彼","かれ","he, boyfriend"),ex("彼女","かのじょ","she, girlfriend"),ex("彼ら","かれら","they")],
  "he","Walking (彳) + skin (皮) — the one walking away, over there.",8,"N4",0)
k("現",["appear","present","current"],["ゲン"],["あらわ(れる)","あらわ(す)"],
  [ex("現れる","あらわれる","to appear"),ex("現在","げんざい","currently"),ex("現実","げんじつ","reality")],
  "appear","King (王) + see (見) — what appears before the king, the present.",11,"N4",5)
k("通",["pass through","traffic","communicate"],["ツウ","ツ"],["とお(る)","かよ(う)"],
  [ex("通る","とおる","to pass through"),ex("交通","こうつう","traffic"),ex("通訳","つうやく","interpretation")],
  "pass through","Walking (辶) + barrel/hollow (甬) — passing through a hollow channel.",10,"N4",2)
k("訳",["reason","translation"],["ヤク"],["わけ"],
  [ex("通訳","つうやく","interpretation"),ex("翻訳","ほんやく","translation"),ex("言い訳","いいわけ","excuse")],
  "reason","Words (言) + release (尺+丿) — words that release and explain.",11,"N4",0)
k("不",["not","un-","negative prefix"],["フ","ブ"],[],
  [ex("不便","ふべん","inconvenient"),ex("不安","ふあん","anxiety"),ex("不思議","ふしぎ","mysterious")],
  "not","A bird that cannot reach the sky — negation, not.",4,"N4",4)
k("便",["convenient","mail","stool"],["ベン","ビン"],["たよ(り)"],
  [ex("便利","べんり","convenient"),ex("不便","ふべん","inconvenient"),ex("郵便","ゆうびん","mail")],
  "convenient","Person (亻) + to change (更) — adapting to others, convenient.",9,"N4",4)
k("才",["talent","age (counter)"],["サイ"],[],
  [ex("天才","てんさい","genius"),ex("才能","さいのう","talent"),ex("二十才","はたち","age 20")],
  "talent","A hand measure — the smallest unit of skill, a talent.",3,"N4",2)
k("江",["bay","inlet","creek"],["コウ"],["え"],
  [ex("江戸","えど","Edo (old Tokyo)"),ex("江川","えがわ","(surname)"),ex("入江","いりえ","inlet, cove")],
  "inlet","Water (氵) + work (工) — water shaped by work, a carved inlet.",6,"N4",0)
k("戸",["door","household"],["コ"],["と"],
  [ex("江戸","えど","Edo (old Tokyo)"),ex("戸棚","とだな","cupboard"),ex("一戸建て","いっこだて","detached house")],
  "door","A swinging one-panel door — a household door.",4,"N4",2)

# ── Ch.9 new ─────────────────────────────────────────────────────────────────
k("喜",["rejoice","glad","happy"],["キ"],["よろこ(ぶ)"],
  [ex("喜ぶ","よろこぶ","to be happy"),ex("喜び","よろこび","joy"),ex("大喜び","おおよろこび","great joy")],
  "rejoice","A drum (壴) with a mouth (口) — beating the drum with joy.",12,"N4",4)
k("結",["tie","connect","conclude"],["ケツ"],["むす(ぶ)","ゆ(う)"],
  [ex("結婚","けっこん","marriage"),ex("結果","けっか","result"),ex("結ぶ","むすぶ","to tie, to connect")],
  "tie","Thread (糸) + luck (吉) — tying lucky threads together.",12,"N4",4)
k("婚",["marriage"],["コン"],[],
  [ex("結婚","けっこん","marriage"),ex("婚約","こんやく","engagement"),ex("婚礼","こんれい","wedding")],
  "marriage","Woman (女) + dusk/evening (昏) — a woman at dusk, taking a husband.",11,"N4",0)
k("京",["capital city","Kyoto","Tokyo"],["キョウ","ケイ"],["みやこ"],
  [ex("東京","とうきょう","Tokyo"),ex("京都","きょうと","Kyoto"),ex("上京","じょうきょう","going to Tokyo")],
  "capital","A tall building on a hill — a tower marking the capital.",8,"N4",2)
k("元",["origin","former","healthy"],["ゲン","ガン"],["もと"],
  [ex("元気","げんき","healthy, fine"),ex("元々","もともと","originally"),ex("正月","しょうがつ","New Year")],
  "origin","A person (人) with the head emphasized — the source, the origin.",4,"N5",2)
k("届",["deliver","reach","notify"],[""],["とど(ける)","とど(く)"],
  [ex("届ける","とどける","to deliver"),ex("届く","とどく","to reach"),ex("届け出","とどけで","notification")],
  "deliver","Body/corpse (尸) + by (由) — reaching to the very end.",8,"N4",0)
k("正",["correct","proper","straight"],["セイ","ショウ"],["ただ(しい)","まさ"],
  [ex("正しい","ただしい","correct"),ex("正月","しょうがつ","New Year"),ex("正直","しょうじき","honest")],
  "correct","A foot (止) walking toward a mark (一) — walking straight toward the goal.",5,"N4",1)
k("玉",["ball","jewel","gem"],["ギョク"],["たま"],
  [ex("お年玉","おとしだま","New Year money gift"),ex("玉ねぎ","たまねぎ","onion"),ex("宝玉","ほうぎょく","jewel")],
  "jewel","A king (王) with a dot — a precious jewel marked for royalty.",5,"N4",1)
k("訪",["visit"],["ホウ"],["おとず(れる)","たず(ねる)"],
  [ex("訪ねる","たずねる","to visit"),ex("訪問","ほうもん","visit"),ex("来訪","らいほう","visit, coming")],
  "visit","Words (言) + square/upright (方) — formally announcing a visit.",11,"N4",0)
k("郎",["young man","(name suffix)"],["ロウ"],[],
  [ex("新郎","しんろう","groom"),ex("太郎","たろう","(male name)"),ex("野郎","やろう","guy (rude)")],
  "young man","Good (良) + city (阝) — a fine young man of the city.",9,"N4",0)
k("婦",["woman","wife","housewife"],["フ"],[],
  [ex("新婦","しんぷ","bride"),ex("夫婦","ふうふ","married couple"),ex("主婦","しゅふ","housewife")],
  "wife","Woman (女) + broom (帚) — a woman of the household.",11,"N4",0)
k("招",["invite","beckon"],["ショウ"],["まね(く)"],
  [ex("招く","まねく","to invite, to beckon"),ex("招待","しょうたい","invitation"),ex("招集","しょうしゅう","summoning")],
  "invite","Hand (扌) + calling out (召) — a hand calling someone to come.",8,"N4",0)
k("恋",["love","romance"],["レン"],["こい","こい(しい)"],
  [ex("恋人","こいびと","lover, sweetheart"),ex("恋愛","れんあい","romantic love"),ex("失恋","しつれん","heartbreak")],
  "love","Two hearts (亦+心) — two hearts yearning for each other.",10,"N4",0)
k("司",["officer","govern"],["シ"],["つかさ"],
  [ex("上司","じょうし","boss, superior"),ex("司会","しかい","MC, moderator"),ex("司令","しれい","command")],
  "officer","A mouth (口) with a flowing banner — the one who commands and governs.",5,"N4",4)

# ── Ch.10 new ─────────────────────────────────────────────────────────────────
k("予",["beforehand","in advance"],["ヨ"],[],
  [ex("予約","よやく","reservation"),ex("予定","よてい","schedule, plan"),ex("天気予報","てんきよほう","weather forecast")],
  "beforehand","A curved line before — anticipating what comes.",4,"N4",3)
k("約",["approximately","promise","contract"],["ヤク"],[],
  [ex("予約","よやく","reservation"),ex("約束","やくそく","promise"),ex("約一時間","やくいちじかん","about one hour")],
  "promise","Thread (糸) + ladle/spoon (勺) — threads bound by a promise.",9,"N4",4)
k("符",["sign","mark","ticket"],["フ"],[],
  [ex("切符","きっぷ","ticket"),ex("符号","ふごう","symbol, sign"),ex("音符","おんぷ","musical note")],
  "ticket","Bamboo (竹) + a match/companion (付) — a bamboo strip matching its pair, a ticket.",11,"N4",0)
k("机",["desk","table"],["キ"],["つくえ"],
  [ex("机","つくえ","desk"),ex("勉強机","べんきょうづくえ","study desk"),ex("机上","きじょう","on the desk (figurative)")],
  "desk","Wood (木) + nearly (几) — a wooden surface for work.",6,"N4",6)
k("用",["use","task","errand"],["ヨウ"],["もち(いる)"],
  [ex("用意","ようい","preparation"),ex("用事","ようじ","errand, business"),ex("利用","りよう","use, utilization")],
  "use","A fence with a stake — something put to purposeful use.",5,"N4",2)
k("紙",["paper"],["シ"],["かみ"],
  [ex("手紙","てがみ","letter"),ex("新聞紙","しんぶんし","newspaper"),ex("用紙","ようし","form, paper")],
  "paper","Thread (糸) + clan/family (氏) — threads woven into sheets, paper.",10,"N4",2)
k("座",["sit","seat","theater"],["ザ"],["すわ(る)"],
  [ex("座る","すわる","to sit"),ex("座席","ざせき","seat"),ex("銀座","ぎんざ","Ginza")],
  "sit","Building (广) + two earths (土+土) — sitting on the ground under a roof.",10,"N4",6)
k("席",["seat","place"],["セキ"],[],
  [ex("座席","ざせき","seat"),ex("出席","しゅっせき","attendance"),ex("指定席","していせき","reserved seat")],
  "seat","Shelter (广) + a towel/cloth (巾) laid down — a cloth spread on the ground, a seat.",10,"N4",4)
k("券",["ticket","bond"],["ケン"],[],
  [ex("乗車券","じょうしゃけん","train ticket"),ex("食券","しょっけん","meal ticket"),ex("入場券","にゅうじょうけん","admission ticket")],
  "ticket","Knife (刀) cutting a roll (卷) — a cut piece, a ticket.",8,"N4",0)
k("札",["bill","card","tag"],["サツ"],["ふだ"],
  [ex("一万円札","いちまんえんさつ","10,000 yen bill"),ex("名札","なふだ","name tag"),ex("お札","おふだ","amulet, bill")],
  "bill","Tree (木) + a mark (乙) — a wooden slip with a mark, a tag or bill.",5,"N4",0)
k("張",["stretch","spread","tension"],["チョウ"],["は(る)"],
  [ex("出張","しゅっちょう","business trip"),ex("緊張","きんちょう","tension, nerves"),ex("張る","はる","to stretch, to stick")],
  "stretch","Bow (弓) + long (長) — a bow drawn to full stretch.",11,"N4",5)
k("調",["investigate","tone","adjust"],["チョウ"],["しら(べる)","ととの(える)"],
  [ex("調べる","しらべる","to investigate"),ex("調子","ちょうし","condition, tone"),ex("強調","きょうちょう","emphasis")],
  "investigate","Words (言) + encircle (周) — circling with words to investigate.",15,"N4",3)
k("民",["people","nation","civilian"],["ミン"],["たみ"],
  [ex("民宿","みんしゅく","family-run inn"),ex("市民","しみん","citizen"),ex("民族","みんぞく","ethnic group")],
  "people","An eye with a piercing tool — formerly blinded slaves, now the common people.",5,"N4",4)
k("遊",["play","enjoy","wander"],["ユウ"],["あそ(ぶ)"],
  [ex("遊ぶ","あそぶ","to play"),ex("遊園地","ゆうえんち","amusement park"),ex("遊び","あそび","play, game")],
  "play","Walk (辶) + a child with a flag (斿) — a child wandering and playing.",12,"N3",3)
k("建",["build","construct"],["ケン"],["た(てる)","た(つ)"],
  [ex("建てる","たてる","to build"),ex("建物","たてもの","building"),ex("建築","けんちく","architecture")],
  "build","A brush (聿) moving forward (廴) — writing a plan, then building.",9,"N4",4)
k("残",["remain","leftover","cruel"],["ザン"],["のこ(る)","のこ(す)"],
  [ex("残る","のこる","to remain"),ex("残業","ざんぎょう","overtime work"),ex("残念","ざんねん","regrettable")],
  "remain","Water/bones (歹) + two spears (戋) — what is left after battle.",10,"N4",4)
k("牛",["cow","bull","cattle"],["ギュウ"],["うし"],
  [ex("牛","うし","cow"),ex("牛乳","ぎゅうにゅう","milk"),ex("牛肉","ぎゅうにく","beef")],
  "cow","The horns and body of a cow — seen from the front.",4,"N4",2)
k("馬",["horse"],["バ","マ"],["うま","ま"],
  [ex("馬","うま","horse"),ex("馬力","ばりき","horsepower"),ex("乗馬","じょうば","horse riding")],
  "horse","A horse with mane and four legs — the side view of a horse.",10,"N4",2)
k("政",["politics","government"],["セイ","ショウ"],["まつりごと"],
  [ex("政治","せいじ","politics"),ex("政府","せいふ","government"),ex("政策","せいさく","policy")],
  "politics","Correct (正) + strike/govern (攴) — striking to make things correct, governance.",9,"N4",5)
k("治",["govern","cure","fix"],["チ","ジ"],["おさ(める)","なお(る)"],
  [ex("政治","せいじ","politics"),ex("治る","なおる","to heal"),ex("治療","ちりょう","treatment, cure")],
  "govern","Water (氵) + platform (台) — managing the water, governing.",8,"N4",4)
k("経",["pass through","manage","sutra"],["ケイ","キョウ"],["へ(る)","た(つ)"],
  [ex("経済","けいざい","economy"),ex("経験","けいけん","experience"),ex("経営","けいえい","management")],
  "pass through","Thread (糸) + underground stream (巠) — threads running through, a sutra.",11,"N4",5)
k("済",["finish","manage","economy"],["サイ","セイ"],["す(む)","す(ます)"],
  [ex("経済","けいざい","economy"),ex("済む","すむ","to be finished"),ex("返済","へんさい","repayment")],
  "finish","Water (氵) + an able person (斉) — the waters that sustain the able, economy.",11,"N4",0)
k("商",["commerce","trade","merchant"],["ショウ"],["あきな(う)"],
  [ex("商業","しょうぎょう","commerce"),ex("商品","しょうひん","merchandise"),ex("商店","しょうてん","shop")],
  "trade","A shelter with a mouth and a dividing frame — a trader speaking under a sign.",11,"N4",3)
k("業",["business","industry","karma"],["ギョウ","ゴウ"],["なりわい"],
  [ex("商業","しょうぎょう","commerce"),ex("業務","ぎょうむ","business, operations"),ex("卒業","そつぎょう","graduation")],
  "business","A wooden music rack with bells — a large structure, a business.",13,"N4",3)
k("絶",["extinct","cut off","absolute"],["ゼツ"],["た(える)","た(つ)"],
  [ex("絶えず","たえず","constantly"),ex("絶対","ぜったい","absolutely"),ex("絶滅","ぜつめつ","extinction")],
  "extinct","Thread (糸) + color/knife (色刀) — a thread cut, extinguished.",12,"N3",5)
k("第",["ordinal number prefix","rank"],["ダイ"],[],
  [ex("第一","だいいち","number one, first"),ex("第二次大戦","だいにじたいせん","World War II"),ex("次第に","しだいに","gradually")],
  "number","Bamboo (竹) + younger brother (弟) — arranged by order, a number.",11,"N4",3)
k("戦",["war","battle","fight"],["セン"],["たたか(う)","いくさ"],
  [ex("戦争","せんそう","war"),ex("大戦","たいせん","great war"),ex("挑戦","ちょうせん","challenge")],
  "battle","Single (単) + spear (戈) — a spear used alone in battle.",13,"N4",4)
k("各",["each","every","respective"],["カク"],["おのおの"],
  [ex("各地","かくち","various places"),ex("各自","かくじ","each person"),ex("各国","かっこく","each country")],
  "each","A foot (夂) at a mouth (口) — each one speaking for themselves.",6,"N4",4)

# ── Ch.11 new ─────────────────────────────────────────────────────────────────
k("娘",["daughter","young woman"],["ジョウ"],["むすめ"],
  [ex("娘","むすめ","daughter"),ex("一人娘","ひとりむすめ","only daughter"),ex("娘さん","むすめさん","your daughter")],
  "daughter","Woman (女) + good (良) — a good young woman.",10,"N3",0)
k("独",["alone","single","Germany"],["ドク"],["ひと(り)"],
  [ex("独立","どくりつ","independence"),ex("独身","どくしん","single, unmarried"),ex("独自","どくじ","unique, original")],
  "alone","Dog (犭) + insect/worm (虫) — like a dog following a scent alone.",9,"N4",5)
k("立",["stand","establish"],["リツ","リュウ"],["た(つ)","た(てる)"],
  [ex("立つ","たつ","to stand"),ex("独立","どくりつ","independence"),ex("立場","たちば","standpoint")],
  "stand","A person standing upright on the ground.",5,"N4",1)
k("間",["interval","between","room"],["カン","ケン"],["あいだ","ま"],
  [ex("人間","にんげん","human being"),ex("時間","じかん","time"),ex("間に合う","まにあう","to be in time")],
  "between","Sunlight (日) shining through a gate (門) — the gap between.",12,"N4",2)
k("似",["resemble","be similar"],["ジ"],["に(る)"],
  [ex("似る","にる","to resemble"),ex("似合う","にあう","to suit"),ex("似ている","にている","looks like")],
  "resemble","Person (亻) + correct/以 — a person who looks the same as another.",7,"N4",5)
k("相",["mutual","phase","minister"],["ソウ","ショウ"],["あい"],
  [ex("相談","そうだん","consultation"),ex("相手","あいて","partner, opponent"),ex("首相","しゅしょう","prime minister")],
  "mutual","Tree (木) + eye (目) — an eye looking at a tree, observing mutually.",9,"N4",4)
k("違",["differ","wrong","be off"],["イ"],["ちが(う)","ちが(い)"],
  [ex("違う","ちがう","to differ, to be wrong"),ex("相違","そうい","difference"),ex("間違い","まちがい","mistake")],
  "differ","Walking (辶) + bent (韋) — going a different way.",13,"N3",0)
k("葉",["leaf","word","petal"],["ヨウ"],["は"],
  [ex("言葉","ことば","word, language"),ex("葉っぱ","はっぱ","leaf"),ex("紅葉","こうよう","autumn leaves")],
  "leaf","Grass (艹) + generation (世) + tree (木) — leaves growing from a tree's generations.",12,"N4",3)
k("求",["request","seek","demand"],["キュウ"],["もと(める)"],
  [ex("求める","もとめる","to seek, to demand"),ex("要求","ようきゅう","demand"),ex("求人","きゅうじん","job offer")],
  "seek","A coat with a belt — stretching out to grasp what one seeks.",7,"N4",4)
k("単",["single","simple","unit"],["タン"],[],
  [ex("単語","たんご","vocabulary word"),ex("単純","たんじゅん","simple"),ex("簡単","かんたん","easy")],
  "single","A bug with a large head — single, simple, one unit.",9,"N4",4)
k("常",["usual","always","ordinary"],["ジョウ"],["つね","とこ"],
  [ex("常に","つねに","always"),ex("日常","にちじょう","daily life"),ex("通常","つうじょう","normally")],
  "usual","Cloth (巾) hanging from a shelf (尚) — a household cloth, always there.",11,"N4",5)
k("打",["hit","strike","do"],["ダ"],["う(つ)"],
  [ex("打つ","うつ","to hit, to strike"),ex("打ち合わせ","うちあわせ","meeting, briefing"),ex("打者","だしゃ","batter")],
  "strike","Hand (扌) + nail (丁) — a hand striking a nail.",5,"N4",4)
k("余",["excess","surplus","remaining"],["ヨ"],["あま(る)","あま(り)"],
  [ex("余る","あまる","to be left over"),ex("余裕","よゆう","leeway, composure"),ex("余計","よけい","unnecessary, excess")],
  "excess","Food (食 simplified) + a person (人) — food remaining after eating, excess.",7,"N4",5)
k("助",["help","rescue","assist"],["ジョ"],["たす(ける)","たす(かる)"],
  [ex("助ける","たすける","to help, to rescue"),ex("助言","じょげん","advice"),ex("助手","じょしゅ","assistant")],
  "help","Strength (力) + a ladle (且) — using strength to help lift.",7,"N4",3)
k("与",["give","bestow"],["ヨ"],["あた(える)"],
  [ex("与える","あたえる","to give"),ex("関与","かんよ","involvement"),ex("給与","きゅうよ","salary, pay")],
  "give","A hand passing something upward — giving from above.",3,"N4",5)
k("甘",["sweet","indulgent","naive"],["カン"],["あま(い)"],
  [ex("甘い","あまい","sweet, lenient"),ex("甘える","あまえる","to depend on, to act spoiled"),ex("甘口","あまくち","sweet taste")],
  "sweet","A mouth (口) with something held inside — tasting something sweet.",5,"N4",0)
k("失",["lose","miss","mistake"],["シツ"],["うしな(う)"],
  [ex("失敗","しっぱい","failure"),ex("失礼","しつれい","rudeness, excuse me"),ex("失う","うしなう","to lose")],
  "lose","A hand letting go of something — a hand that drops and loses.",5,"N4",4)
k("敗",["defeat","fail","rot"],["ハイ"],["やぶ(れる)"],
  [ex("失敗","しっぱい","failure"),ex("敗北","はいぼく","defeat"),ex("勝敗","しょうはい","victory or defeat")],
  "defeat","Shell/money (貝) + strike (攴) — striking down wealth, defeat.",11,"N4",5)
k("果",["fruit","result","end"],["カ"],["は(たす)","くだ(もの)"],
  [ex("結果","けっか","result"),ex("果物","くだもの","fruit"),ex("効果","こうか","effect")],
  "fruit","A tree (木) with a crown of fruit — the fruit at the top.",8,"N4",4)
k("汁",["juice","soup","broth"],["ジュウ"],["しる"],
  [ex("みそ汁","みそしる","miso soup"),ex("果汁","かじゅう","fruit juice"),ex("肉汁","にくじゅう","meat broth")],
  "juice","Water (氵) + ten (十) — ten parts water, a diluted juice.",5,"N4",0)
k("精",["spirit","energy","refined"],["セイ","ショウ"],[],
  [ex("精神","せいしん","spirit, mind"),ex("精一杯","せいいっぱい","with all one's might"),ex("精米","せいまい","polished rice")],
  "spirit","Rice (米) + blue-green (青) — the pure refined spirit in polished rice.",14,"N3",5)
k("涙",["tear (eye)"],["ルイ"],["なみだ"],
  [ex("涙","なみだ","tear"),ex("涙ぐむ","なみだぐむ","to be moved to tears"),ex("感涙","かんるい","tears of emotion")],
  "tear","Water (氵) + 戻 — water falling like rain, a tear.",11,"N4",0)
k("流",["flow","stream","style"],["リュウ","ル"],["なが(れる)","なが(す)"],
  [ex("流れる","ながれる","to flow"),ex("一流","いちりゅう","first-class"),ex("流行","りゅうこう","trend, fashion")],
  "flow","Water (氵) + a child born (㐬) — water flowing like birth, a stream.",10,"N4",3)
k("成",["become","succeed","form"],["セイ","ジョウ"],["な(る)","な(す)"],
  [ex("成功","せいこう","success"),ex("完成","かんせい","completion"),ex("成長","せいちょう","growth")],
  "become","A halberd (戊) with a mark — a weapon that makes things happen.",6,"N4",4)

k("関",["barrier","gateway","related","concern"],["カン"],["せき","かか(わる)"],
  [ex("関係","かんけい","relationship, connection"),ex("関心","かんしん","interest, concern"),ex("関わる","かかわる","to be related to")],
  "gateway","A gate (門) with a bolt (𢇍) — a gate with a bar, a checkpoint.",14,"N3",4)

# ── Ch.12 new ─────────────────────────────────────────────────────────────────
k("状",["state","condition","letter"],["ジョウ"],[],
  [ex("病状","びょうじょう","medical condition"),ex("状況","じょうきょう","situation"),ex("症状","しょうじょう","symptom")],
  "condition","Dog (犬) + general form (爿) — describing the state of things.",7,"N4",4)
k("熱",["heat","fever","enthusiasm"],["ネツ"],["あつ(い)"],
  [ex("熱","ねつ","fever, heat"),ex("熱心","ねっしん","enthusiastic"),ex("情熱","じょうねつ","passion")],
  "heat","A clay vessel (執) over fire (灬) — fired up with heat.",15,"N4",4)
k("欲",["desire","want","greed"],["ヨク"],["ほ(しい)","ほっ(する)"],
  [ex("食欲","しょくよく","appetite"),ex("欲しい","ほしい","to want"),ex("欲望","よくぼう","desire, craving")],
  "desire","A valley (谷) + yawning mouth (欠) — mouth open wanting to fill the valley.",11,"N4",0)
k("功",["merit","achievement","success"],["コウ","ク"],[],
  [ex("成功","せいこう","success"),ex("功績","こうせき","achievement"),ex("成功者","せいこうしゃ","successful person")],
  "achievement","Work (工) + strength (力) — applying strength to work, achieving.",5,"N4",4)
k("具",["tool","equipped","ingredient"],["グ"],["そな(える)"],
  [ex("具合","ぐあい","condition, how things are going"),ex("道具","どうぐ","tool"),ex("具体的","ぐたいてき","concrete, specific")],
  "tool","Three eyes (目+目) and a stand — seeing tools laid out on a table.",8,"N4",3)
k("症",["symptom","illness"],["ショウ"],[],
  [ex("症状","しょうじょう","symptom"),ex("炎症","えんしょう","inflammation"),ex("後遺症","こういしょう","after-effects")],
  "symptom","Illness (疒) + correct/proof (正) — a certified sickness sign.",10,"N3",0)
k("在",["exist","reside","be present"],["ザイ"],["あ(る)"],
  [ex("現在","げんざい","currently"),ex("存在","そんざい","existence"),ex("在宅","ざいたく","at home")],
  "exist","Earth (土) + a cutting stroke (才) — planted in the earth, existing.",6,"N4",5)
k("胃",["stomach"],["イ"],[],
  [ex("胃","い","stomach"),ex("胃腸","いちょう","stomach and intestines"),ex("胃痛","いつう","stomachache")],
  "stomach","A field (田) over flesh (月) — the organ that processes what is harvested.",9,"N4",0)
k("苦",["suffering","bitter","hardship"],["ク"],["くる(しい)","にが(い)"],
  [ex("苦しい","くるしい","painful, suffering"),ex("苦手","にがて","weak point, dislike"),ex("苦労","くろう","hardship")],
  "suffering","Grass (艹) over old (古) — old bitter herbs, suffering.",8,"N4",3)
k("浴",["bathe","bask"],["ヨク"],["あ(びる)","あ(びせる)"],
  [ex("浴びる","あびる","to bathe, to be showered with"),ex("入浴","にゅうよく","taking a bath"),ex("浴室","よくしつ","bathroom")],
  "bathe","Water (氵) + valley (谷) — bathing in a valley stream.",10,"N4",0)
k("腹",["stomach","abdomen","belly"],["フク"],["はら"],
  [ex("腹","はら","stomach, belly"),ex("腹痛","ふくつう","stomachache"),ex("空腹","くうふく","hunger")],
  "belly","Flesh (月) + repeat/duplicate (複 simplified) — the full belly.",13,"N4",0)

# ── Ch.13 new ─────────────────────────────────────────────────────────────────
k("紹",["introduce"],["ショウ"],[],
  [ex("紹介","しょうかい","introduction"),ex("自己紹介","じこしょうかい","self-introduction"),ex("紹介状","しょうかいじょう","letter of introduction")],
  "introduce","Thread (糸) + beckoning (召) — drawing the thread of connection, introducing.",11,"N4",0)
k("介",["mediate","introduce","shellfish"],["カイ"],[],
  [ex("紹介","しょうかい","introduction"),ex("介護","かいご","nursing care"),ex("仲介","ちゅうかい","intermediary")],
  "mediate","A person (人) with something between them (介) — standing between two people.",4,"N4",0)
k("僚",["colleague","official"],["リョウ"],[],
  [ex("同僚","どうりょう","colleague"),ex("官僚","かんりょう","bureaucrat"),ex("幕僚","ばくりょう","staff officer")],
  "colleague","Person (亻) + bright fire (尞) — a person who shares your fire (office).",14,"N3",0)
k("笑",["laugh","smile"],["ショウ"],["わら(う)","え(む)"],
  [ex("笑う","わらう","to laugh"),ex("笑顔","えがお","smiling face"),ex("微笑む","ほほえむ","to smile gently")],
  "laugh","Bamboo (竹) + a waving person (夭) — bamboo swaying like a laughing person.",10,"N4",4)
k("反",["oppose","reverse","anti-"],["ハン","タン"],["そ(る)","かえ(す)"],
  [ex("反対","はんたい","opposition, opposite"),ex("反省","はんせい","reflection, regret"),ex("違反","いはん","violation")],
  "oppose","A cliff (厂) with a hand pulling back (又) — pulling against, reversing.",4,"N4",3)
k("対",["pair","against","toward"],["タイ","ツイ"],[],
  [ex("反対","はんたい","opposition"),ex("対話","たいわ","dialogue"),ex("絶対","ぜったい","absolute")],
  "pair","A person standing upright (丵) with a measurement — two things paired.",7,"N4",3)
k("直",["direct","fix","honest"],["チョク","ジキ"],["なお(す)","ただ(ちに)"],
  [ex("直す","なおす","to fix, to correct"),ex("正直","しょうじき","honest"),ex("直接","ちょくせつ","direct")],
  "direct","Eye (目) with a vertical stroke — looking straight, direct.",8,"N4",2)
k("敬",["respect","revere"],["ケイ"],["うやま(う)"],
  [ex("敬語","けいご","honorific language"),ex("尊敬","そんけい","respect"),ex("敬意","けいい","respect, reverence")],
  "respect","A teacher figure (苟) + striking rod (攴) — drilling respect into students.",12,"N4",6)
k("練",["practice","knead","refine"],["レン"],["ね(る)"],
  [ex("練習","れんしゅう","practice"),ex("訓練","くんれん","training"),ex("熟練","じゅくれん","skill, expertise")],
  "practice","Thread (糸) + east/bundle (東) — twisting threads into rope, practicing.",14,"N4",5)
k("式",["ceremony","formula","style"],["シキ"],[],
  [ex("正式","せいしき","formal, official"),ex("結婚式","けっこんしき","wedding ceremony"),ex("方程式","ほうていしき","equation")],
  "ceremony","A carpenter's tool (工) + the right action (弋) — the correct form, ceremony.",6,"N4",5)
k("板",["board","plank","sign"],["ハン","バン"],["いた"],
  [ex("黒板","こくばん","blackboard"),ex("板","いた","board, plank"),ex("掲示板","けいじばん","bulletin board")],
  "board","Tree (木) + anti/slice (反) — a tree sliced flat, a board.",8,"N4",3)
k("詩",["poem","poetry"],["シ"],[],
  [ex("詩","し","poem"),ex("詩人","しじん","poet"),ex("詩歌","しいか","poetry")],
  "poem","Words (言) + temple/time (寺) — words measured in time, a poem.",13,"N4",0)
k("誘",["invite","tempt","lure"],["ユウ"],["さそ(う)"],
  [ex("誘う","さそう","to invite"),ex("誘惑","ゆうわく","temptation"),ex("勧誘","かんゆう","solicitation")],
  "tempt","Words (言) + through (秀) — words that draw someone through, tempting.",14,"N3",0)
k("応",["respond","apply","suit"],["オウ"],["こた(える)","おう(じる)"],
  [ex("応じる","おうじる","to respond, to comply"),ex("応用","おうよう","application, practical use"),ex("反応","はんのう","reaction")],
  "respond","Shelter (广) + heart (心) — a heart sheltered and ready to respond.",7,"N4",4)
k("片",["one side","scrap","fragment"],["ヘン"],["かた"],
  [ex("片言","かたこと","broken language"),ex("片方","かたほう","one side"),ex("片付ける","かたづける","to clean up")],
  "one side","Half a tree (木 split) — just one half, one side.",4,"N4",0)
k("励",["encourage","strive"],["レイ"],["はげ(む)","はげ(ます)"],
  [ex("励ます","はげます","to encourage"),ex("励む","はげむ","to strive"),ex("激励","げきれい","encouragement")],
  "encourage","Strength (力) + many (万) — many strengths multiplying, encouraging.",7,"N3",0)
k("情",["feeling","emotion","circumstance"],["ジョウ","セイ"],["なさ(け)"],
  [ex("感情","かんじょう","emotion"),ex("情報","じょうほう","information"),ex("同情","どうじょう","sympathy")],
  "emotion","Heart (忄) + blue-green/clear (青) — a clear, vivid feeling.",11,"N4",5)
k("恥",["shame","embarrassment"],["チ"],["は(じ)","は(ずかしい)"],
  [ex("恥ずかしい","はずかしい","embarrassing, shy"),ex("恥","はじ","shame"),ex("恥じる","はじる","to be ashamed")],
  "shame","Ear (耳) + heart (心) — the heart that hears and turns red with shame.",10,"N4",0)
k("最",["most","extreme","best"],["サイ"],["もっと(も)"],
  [ex("最初","さいしょ","first"),ex("最高","さいこう","best, highest"),ex("最近","さいきん","recently")],
  "most","Sun (日) + take (取) — taking the sun, the utmost.",12,"N4",4)
k("記",["record","note","write down"],["キ"],["し(る)"],
  [ex("記念","きねん","commemoration"),ex("日記","にっき","diary"),ex("記録","きろく","record")],
  "record","Words (言) + self (己) — writing down oneself, a record.",10,"N4",3)
k("念",["thought","feeling","religious devotion"],["ネン"],[],
  [ex("記念","きねん","commemoration"),ex("念のため","ねんのため","just to be sure"),ex("残念","ざんねん","regrettable")],
  "thought","Now (今) over heart (心) — what is in the heart right now, a thought.",8,"N4",4)
k("珍",["rare","unusual","curious"],["チン"],["めずら(しい)"],
  [ex("珍しい","めずらしい","rare, unusual"),ex("珍品","ちんぴん","rare item"),ex("珍しがる","めずらしがる","to find something rare")],
  "rare","Jewel (王) + a dividing line (彡) — a jewel so marked it is rare.",9,"N3",0)
k("科",["department","subject","branch"],["カ"],[],
  [ex("教科書","きょうかしょ","textbook"),ex("科学","かがく","science"),ex("外科","げか","surgery department")],
  "department","Grain (禾) + a measure (斗) — sorting grain by measure, classifying.",9,"N4",2)
k("倍",["double","times"],["バイ"],[],
  [ex("二倍","にばい","twice"),ex("倍増","ばいぞう","doubling"),ex("何倍","なんばい","how many times")],
  "double","Person (亻) + a folded shape (咅) — a person folded, doubled.",10,"N4",4)
k("難",["difficult","hard","suffering"],["ナン"],["むずか(しい)","かた(い)"],
  [ex("難しい","むずかしい","difficult"),ex("困難","こんなん","difficulty"),ex("難民","なんみん","refugee")],
  "difficult","Bird in thorn bushes (𦰩) + right side (隹) — a bird trapped, difficult to free.",18,"N4",6)
k("解",["solve","understand","undo"],["カイ","ゲ"],["と(く)","ほど(く)"],
  [ex("理解","りかい","understanding"),ex("解決","かいけつ","resolution"),ex("解説","かいせつ","explanation")],
  "solve","Horn (角) + knife (刀) + cow (牛) — butchering, taking apart to understand.",13,"N4",5)
k("興",["interest","prosper","rise"],["コウ","キョウ"],["おこ(る)","おこ(す)"],
  [ex("興味","きょうみ","interest"),ex("興奮","こうふん","excitement"),ex("復興","ふっこう","reconstruction")],
  "interest","Two hands (廾) carrying a vessel (同) — raising up something, interested.",16,"N3",5)
k("戻",["return","go back","restore"],[""],["もど(る)","もど(す)"],
  [ex("戻る","もどる","to return"),ex("取り戻す","とりもどす","to recover"),ex("引き戻す","ひきもどす","to pull back")],
  "return","Door (戸) + dog (犬) — a dog returning to its door.",7,"N4",0)

# ── Ch.14 new ─────────────────────────────────────────────────────────────────
k("妻",["wife"],["サイ"],["つま"],
  [ex("妻","つま","wife"),ex("夫妻","ふさい","husband and wife"),ex("愛妻","あいさい","beloved wife")],
  "wife","A woman (女) holding a grain stalk — the wife who manages the household.",8,"N4",4)
k("夫",["husband","man"],["フ","フウ"],["おっと","おとこ"],
  [ex("夫","おっと","husband"),ex("夫婦","ふうふ","married couple"),ex("夫人","ふじん","Mrs., madam")],
  "husband","A large man (大) with a pin — a full-grown man.",4,"N4",4)
k("想",["think","idea","imagine"],["ソウ","ソ"],[],
  [ex("理想","りそう","ideal"),ex("思想","しそう","thought, ideology"),ex("予想","よそう","prediction")],
  "imagine","Tree (木) + eye (目) + heart (心) — the heart's eye looking through a tree, imagining.",13,"N4",4)
k("身",["body","oneself","status"],["シン"],["み"],
  [ex("身長","しんちょう","height"),ex("自身","じしん","oneself"),ex("身分","みぶん","social status")],
  "body","A pregnant silhouette — a body with something inside.",7,"N4",3)
k("収",["income","collect","harvest"],["シュウ"],["おさ(める)","おさ(まる)"],
  [ex("収入","しゅうにゅう","income"),ex("収める","おさめる","to collect"),ex("回収","かいしゅう","collection, recovery")],
  "collect","A rope coiled and a hand — hands gathering and coiling in.",4,"N4",0)
k("歴",["history","career","experience"],["レキ"],[],
  [ex("学歴","がくれき","educational background"),ex("歴史","れきし","history"),ex("経歴","けいれき","career history")],
  "history","Stop (止) + cliff (厂) + trees (林) — footsteps passing through forests over time.",14,"N3",4)
k("性",["nature","sex","character"],["セイ","ショウ"],["さが"],
  [ex("性格","せいかく","personality"),ex("女性","じょせい","woman, female"),ex("可能性","かのうせい","possibility")],
  "nature","Heart (忄) + life/birth (生) — the nature one is born with.",8,"N4",5)
k("格",["rank","standard","character"],["カク","コウ"],[],
  [ex("性格","せいかく","personality"),ex("資格","しかく","qualification"),ex("格好","かっこう","appearance, cool")],
  "standard","Tree (木) + each/respective (各) — each tree measured to standard.",10,"N4",5)
k("力",["power","force","strength"],["リョク","リキ"],["ちから"],
  [ex("力","ちから","strength, power"),ex("努力","どりょく","effort"),ex("電力","でんりょく","electric power")],
  "power","The shape of a flexed arm — muscular power.",2,"N4",1)
k("類",["type","sort","category"],["ルイ"],[],
  [ex("書類","しょるい","documents"),ex("種類","しゅるい","type, kind"),ex("人類","じんるい","humanity")],
  "type","Rice (米) + dog (犬) + page (頁) — sorting grain by heading, classifying.",18,"N4",4)
k("順",["order","sequence","obedient"],["ジュン"],[],
  [ex("順番","じゅんばん","order, turn"),ex("手順","てじゅん","procedure"),ex("順調","じゅんちょう","going smoothly")],
  "order","River (川) + page/head (頁) — following the current, in order.",12,"N4",4)
k("雇",["hire","employ"],["コ"],["やと(う)"],
  [ex("雇う","やとう","to hire"),ex("雇用","こよう","employment"),ex("被雇用者","ひこようしゃ","employee")],
  "hire","Door (戸) + bird (隹) — a bird kept behind a door, employed.",13,"N3",0)
k("企",["plan","scheme","undertake"],["キ"],["くわだ(てる)"],
  [ex("企業","きぎょう","enterprise, company"),ex("企画","きかく","project, plan"),ex("企てる","くわだてる","to plan, to scheme")],
  "plan","A person (人) standing on tiptoe — stretching forward to plan.",6,"N3",0)
k("増",["increase","grow"],["ゾウ"],["ふ(える)","ふ(やす)"],
  [ex("増える","ふえる","to increase"),ex("増加","ぞうか","increase"),ex("急増","きゅうぞう","rapid increase")],
  "increase","Earth (土) + layer/multiple (曾) — earth piling up in layers, increasing.",14,"N4",5)
k("加",["add","increase","join"],["カ"],["くわ(える)","くわ(わる)"],
  [ex("増加","ぞうか","increase"),ex("参加","さんか","participation"),ex("加える","くわえる","to add")],
  "add","Strength (力) + mouth (口) — adding one's voice and strength.",5,"N4",4)
k("既",["already","previously"],["キ"],["すで(に)"],
  [ex("既婚","きこん","married"),ex("既に","すでに","already"),ex("既存","きそん","existing")],
  "already","A person (人) turning away from food (旡) — having already eaten.",10,"N3",0)
k("昇",["rise","ascend"],["ショウ"],["のぼ(る)"],
  [ex("上昇","じょうしょう","rise, ascent"),ex("昇進","しょうしん","promotion"),ex("昇る","のぼる","to rise (sun)")],
  "rise","Sun (日) + rising stroke (升) — the sun rising above the horizon.",8,"N4",0)
k("未",["not yet","future"],["ミ"],["いま(だ)"],
  [ex("未婚","みこん","unmarried"),ex("未来","みらい","the future"),ex("未定","みてい","undecided")],
  "not yet","A tree (木) with a mark near the top — not quite full-grown, not yet.",5,"N4",4)
k("育",["raise","nurture","grow"],["イク"],["そだ(てる)","そだ(つ)"],
  [ex("育てる","そだてる","to raise"),ex("教育","きょういく","education"),ex("育児","いくじ","child-rearing")],
  "raise","A child (子) born from flesh (月) — flesh that raises children.",8,"N4",3)
k("児",["child","infant"],["ジ","ニ"],["こ"],
  [ex("育児","いくじ","child-rearing"),ex("児童","じどう","children"),ex("幼児","ようじ","young child")],
  "child","A newborn with a large head — an infant.",7,"N4",4)
k("減",["decrease","reduce"],["ゲン"],["へ(る)","へ(らす)"],
  [ex("減る","へる","to decrease"),ex("削減","さくげん","reduction, cut"),ex("減少","げんしょう","decrease")],
  "decrease","Water (氵) + a cutting weapon (减) — water cut down, decreasing.",12,"N4",5)
k("際",["edge","occasion","when"],["サイ"],["きわ"],
  [ex("実際","じっさい","in reality"),ex("国際","こくさい","international"),ex("この際","このさい","on this occasion")],
  "edge","Hill (阝) + sacrifice (祭) — the edge where the ritual meets the sacred.",14,"N4",5)
k("産",["produce","birth","property"],["サン"],["う(む)","う(まれる)"],
  [ex("産む","うむ","to give birth"),ex("生産","せいさん","production"),ex("不動産","ふどうさん","real estate")],
  "produce","Standing (立) on a cliff (厂) over life (生) — giving birth, producing.",11,"N4",4)
k("共",["together","common","both"],["キョウ"],["とも"],
  [ex("共に","ともに","together with"),ex("公共","こうきょう","public"),ex("共働き","ともばたらき","dual income")],
  "together","Two hands (廾) holding a shared vessel — holding together.",6,"N4",4)
k("努",["endeavor","strive","effort"],["ド"],["つと(める)"],
  [ex("努力","どりょく","effort"),ex("努める","つとめる","to strive"),ex("努力家","どりょくか","hard worker")],
  "strive","Woman slave (奴) + strength (力) — exerting strength like a slave, striving.",7,"N4",5)
k("公",["public","official","fair"],["コウ"],["おおやけ"],
  [ex("公共","こうきょう","public"),ex("公園","こうえん","park"),ex("公平","こうへい","fairness")],
  "public","Eight (八) + private (ム) — the opposite of private, public.",4,"N4",2)
k("否",["no","deny","reject"],["ヒ"],["いな","いな(む)"],
  [ex("否定","ひてい","negation, denial"),ex("否","いな","no"),ex("賛否","さんぴ","approval or rejection")],
  "deny","Not (不) + mouth (口) — a mouth saying no.",7,"N4",5)
k("損",["loss","damage","harm"],["ソン"],["そこ(なう)","そん(する)"],
  [ex("損","そん","loss"),ex("損害","そんがい","damage"),ex("損する","そんする","to lose out")],
  "loss","Hand (扌) + inspect/scratch (員) — a hand that scratches away, losing.",13,"N4",0)
k("期",["period","time","expect"],["キ","ゴ"],[],
  [ex("期待","きたい","expectation"),ex("時期","じき","time, period"),ex("期間","きかん","period, term")],
  "period","Moon (月) + a standing figure (其) — lunar periods, a cycle of time.",12,"N4",3)
k("由",["reason","from","freedom"],["ユ","ユウ","ユイ"],["よし"],
  [ex("自由","じゆう","freedom"),ex("理由","りゆう","reason"),ex("由来","ゆらい","origin, derivation")],
  "reason","A container with something flowing out — the source, the reason.",5,"N4",3)
k("労",["labor","toil","trouble"],["ロウ"],[],
  [ex("労働","ろうどう","labor"),ex("努力","どりょく","effort"),ex("苦労","くろう","hardship")],
  "labor","Fire (灬) under a shelter (冖) + strength (力) — burning work, labor.",7,"N4",5)

# ── Ch.15 new ─────────────────────────────────────────────────────────────────
k("協",["cooperate","work together"],["キョウ"],[],
  [ex("協力","きょうりょく","cooperation"),ex("協議","きょうぎ","conference"),ex("協定","きょうてい","agreement")],
  "cooperate","Ten (十) + three strengths (力×3) — many strengths combined.",8,"N4",4)
k("積",["accumulate","pile up","load"],["セキ"],["つ(む)","つ(もる)"],
  [ex("積極的","せっきょくてき","positive, proactive"),ex("積む","つむ","to stack"),ex("面積","めんせき","area")],
  "accumulate","Grain (禾) + weave/bind (責) — grain bound in sheaves, piled up.",16,"N4",5)
k("極",["extreme","pole","utmost"],["キョク","ゴク"],["きわ(める)"],
  [ex("積極的","せっきょくてき","proactive"),ex("極端","きょくたん","extreme"),ex("南極","なんきょく","South Pole")],
  "extreme","Tree (木) + reaching arms (亟) — a tree stretched to its farthest reach.",12,"N4",4)
k("的",["target","-like","adjectival suffix"],["テキ"],["まと"],
  [ex("目的","もくてき","purpose, goal"),ex("的確","てきかく","accurate, precise"),ex("積極的","せっきょくてき","positive")],
  "target","White (白) + spoon/ladle (勺) — a bright white target.",8,"N4",4)
k("術",["art","technique","method"],["ジュツ"],[],
  [ex("技術","ぎじゅつ","technology"),ex("手術","しゅじゅつ","surgery"),ex("芸術","げいじゅつ","art")],
  "technique","Walk/go (行) + growing plant (朮) — the way of cultivating a skill.",11,"N4",5)
k("印",["stamp","mark","sign"],["イン"],["しるし"],
  [ex("印象","いんしょう","impression"),ex("印鑑","いんかん","personal seal"),ex("目印","めじるし","landmark, mark")],
  "mark","A kneeling person under a hand — pressing down a seal, making a mark.",6,"N4",4)
k("象",["elephant","phenomenon","image"],["ゾウ","ショウ"],[],
  [ex("印象","いんしょう","impression"),ex("対象","たいしょう","target, subject"),ex("象","ぞう","elephant")],
  "elephant","The side view of an elephant — its trunk, body, and legs.",12,"N4",4)
k("替",["exchange","replace","substitute"],["タイ"],["か(える)","か(わる)"],
  [ex("替える","かえる","to replace"),ex("両替","りょうがえ","currency exchange"),ex("入れ替える","いれかえる","to swap")],
  "exchange","Two people (夫+夫) over sun (日) — two people switching places.",12,"N4",0)
k("製",["manufacture","made of"],["セイ"],[],
  [ex("製品","せいひん","product"),ex("日本製","にほんせい","made in Japan"),ex("製造","せいぞう","manufacturing")],
  "manufacture","Clothes (衣) cut and shaped (制) — cloth worked into a product.",14,"N4",5)
k("耳",["ear"],["ジ"],["みみ"],
  [ex("耳","みみ","ear"),ex("耳鼻科","じびか","ENT department"),ex("耳打ち","みみうち","whispering")],
  "ear","The shape of a human ear.",6,"N4",1)
k("辞",["resign","word","farewell"],["ジ"],["や(める)"],
  [ex("辞書","じしょ","dictionary"),ex("辞める","やめる","to quit"),ex("辞典","じてん","dictionary")],
  "resign","Tongue/bitter (辛+口) + words (辞 right) — words that cut and end things.",13,"N4",4)
k("判",["judge","distinguish","seal"],["ハン","バン"],["わか(る)"],
  [ex("判断","はんだん","judgment, decision"),ex("裁判","さいばん","trial, judgment"),ex("判明","はんめい","becoming clear")],
  "judge","Half (半) + knife (刂) — cutting in half to judge which side is correct.",7,"N4",5)
k("断",["cut off","refuse","decide"],["ダン"],["た(つ)","ことわ(る)"],
  [ex("判断","はんだん","judgment"),ex("断る","ことわる","to refuse"),ex("中断","ちゅうだん","interruption")],
  "cut off","An axe (斤) cutting through silk (斷 simplified) — cutting clean through.",11,"N4",4)
k("幅",["width","breadth"],["フク"],["はば"],
  [ex("幅広い","はばひろい","wide, broad"),ex("幅","はば","width"),ex("大幅に","おおはばに","greatly, significantly")],
  "width","Cloth (巾) + gourd/full (畐) — a full cloth width.",12,"N3",0)
k("登",["climb","register","appear"],["トウ","ト"],["のぼ(る)"],
  [ex("登場","とうじょう","appearance, entry"),ex("登山","とざん","mountain climbing"),ex("登録","とうろく","registration")],
  "climb","Two feet (癶) over a vessel (豆) — stepping up onto something.",12,"N4",3)
k("値",["value","price","worth"],["チ"],["ね","あたい"],
  [ex("価値","かち","value"),ex("値段","ねだん","price"),ex("値上がり","ねあがり","price rise")],
  "value","Person (亻) + straight (直) — a person who is straightforward, honest value.",10,"N4",5)
k("著",["author","remarkable","write"],["チョ","チャク"],["いちじる(しい)"],
  [ex("著者","ちょしゃ","author"),ex("著作","ちょさく","literary work"),ex("顕著","けんちょ","remarkable")],
  "author","Grass (艹) + old person (者) — an elder whose words grow like plants.",11,"N4",0)
k("原",["original","field","plain"],["ゲン"],["はら"],
  [ex("原因","げんいん","cause"),ex("原料","げんりょう","raw material"),ex("高原","こうげん","plateau")],
  "original","A spring (泉) at a cliff (厂) — the source on the plain.",10,"N4",2)
k("表",["surface","express","table"],["ヒョウ"],["おもて","あらわ(す)"],
  [ex("表す","あらわす","to express"),ex("発表","はっぴょう","announcement"),ex("表面","ひょうめん","surface")],
  "surface","A garment (衣) with the marking pattern outside — the outer surface.",8,"N4",3)
k("論",["argument","theory","essay"],["ロン"],[],
  [ex("理論","りろん","theory"),ex("議論","ぎろん","argument, debate"),ex("論文","ろんぶん","thesis, essay")],
  "theory","Words (言) + logical (侖) — words in logical order, a theory.",15,"N4",5)
k("築",["build","construct"],["チク"],["きず(く)"],
  [ex("建築","けんちく","architecture"),ex("築く","きずく","to build, to establish"),ex("新築","しんちく","newly built")],
  "construct","Bamboo (竹) + wood (木) + work (工) — building with bamboo and wood.",16,"N4",0)
k("変",["change","strange","odd"],["ヘン"],["か(わる)","か(える)"],
  [ex("変わる","かわる","to change"),ex("変化","へんか","change"),ex("大変","たいへん","difficult, very")],
  "change","Thread (糸) wound differently (攵) — a thread twisted into something else.",9,"N4",4)
k("識",["knowledge","discern","acquaintance"],["シキ"],[],
  [ex("常識","じょうしき","common sense"),ex("意識","いしき","consciousness"),ex("認識","にんしき","recognition")],
  "discern","Words (言) + woven/measured (戠) — words that distinguish and recognize.",19,"N4",5)
k("確",["certain","confirm","firm"],["カク"],["たし(か)","たし(かめる)"],
  [ex("確認","かくにん","confirmation"),ex("確かめる","たしかめる","to confirm"),ex("正確","せいかく","accurate")],
  "certain","Stone (石) + bird (隹) — solid as stone, certain.",15,"N4",5)
k("信",["trust","believe","message"],["シン"],["しん(じる)"],
  [ex("信じる","しんじる","to believe"),ex("自信","じしん","confidence"),ex("信頼","しんらい","trust")],
  "trust","Person (亻) + words (言) — a person whose words are trusted.",9,"N4",4)
k("暖",["warm (weather)","mild"],["ダン"],["あたた(かい)","あたた(める)"],
  [ex("暖かい","あたたかい","warm"),ex("暖房","だんぼう","heating"),ex("温暖化","おんだんか","global warming")],
  "warm","Sun (日) + relaxed figure (爰) — the sun relaxing everything, warmth.",13,"N4",0)
k("房",["room","chamber","cluster"],["ボウ"],["ふさ"],
  [ex("暖房","だんぼう","heating"),ex("冷房","れいぼう","air conditioning"),ex("文房具","ぶんぼうぐ","stationery")],
  "chamber","Door (戶) + a square room (方) — a room off to the side.",8,"N4",0)
k("冷",["cold","cool","chill"],["レイ"],["つめ(たい)","さ(める)","ひ(える)"],
  [ex("冷たい","つめたい","cold (to touch)"),ex("冷房","れいぼう","air conditioning"),ex("冷蔵庫","れいぞうこ","refrigerator")],
  "cold","Ice (冫) + a command (令) — ordered to be cold, chilled.",7,"N4",4)
k("消",["extinguish","disappear","erase"],["ショウ"],["き(える)","け(す)"],
  [ex("消す","けす","to erase, to turn off"),ex("消える","きえる","to disappear"),ex("消費","しょうひ","consumption")],
  "extinguish","Water (氵) + a small shape (肖) — water dousing something small, extinguishing.",10,"N4",3)
k("満",["full","satisfy","complete"],["マン","バン"],["み(ちる)","み(たす)"],
  [ex("満足","まんぞく","satisfaction"),ex("不満","ふまん","dissatisfaction"),ex("満員","まんいん","full capacity")],
  "full","Water (氵) + both sides (両) — water filling both banks, full.",12,"N4",4)
k("可",["possible","allow","approve"],["カ","コ"],[],
  [ex("可能","かのう","possible"),ex("許可","きょか","permission"),ex("不可能","ふかのう","impossible")],
  "possible","A mouth (口) with a bent stroke — bending to allow something.",5,"N4",4)
k("能",["ability","talent","Noh theater"],["ノウ"],[],
  [ex("能力","のうりょく","ability"),ex("可能","かのう","possible"),ex("技能","ぎのう","skill, competence")],
  "ability","A bear (能 original) — the powerful natural ability of a bear.",10,"N4",5)
k("材",["material","timber","talent"],["ザイ"],[],
  [ex("材料","ざいりょう","material, ingredient"),ex("人材","じんざい","human resources"),ex("素材","そざい","raw material")],
  "material","Tree (木) + rule/inch (才) — wood measured and sorted, raw material.",7,"N4",5)
k("展",["unfold","exhibit","develop"],["テン"],[],
  [ex("発展","はってん","development"),ex("展覧会","てんらんかい","exhibition"),ex("展示","てんじ","display, exhibit")],
  "unfold","Corpse/body (尸) + open wide (展 inner) — a body laid out and displayed.",10,"N4",5)

print(f"Total in K after extensions: {len(K)}")

# ─────────────────────────────────────────────────────────────────────────────
# Chapter card lists  (書くのを覚える漢字 only — primary new kanji per item)
# ─────────────────────────────────────────────────────────────────────────────

# Ch.6  p.109  ぎょうにんべん 彳
CH6 = [
    "注","勤","店","飯","親","実","員","面","茶","昼",
    "様","売","席","限","習","旅","感","空","渡","呼",
    "館","宿","高","料","必","要","慣","比","価",
]

# Ch.8  p.151  のぎへん 禾
CH8 = [
    "探","師","係","主","任","経","然","個","足","技",
    "速","感","許","迎","決","法","幸","向","定","彼",
    "現","通","訳","不","便","学","返","死","才","江","戸",
]

# Ch.9  ~p.169  (国、荷物...26 items)
CH9 = [
    "国","荷","開","色","赤","動","着","喜","結","婚",
    "京","週","元","世","届","正","玉","訪","土","不",
    "郎","婦","招","明","恋","司",
]

# Ch.10  p.187  いとへん 糸
CH10 = [
    "予","約","窓","机","用","紙","発","座","席","券",
    "乗","札","張","泊","調","少","和","住","民","疲",
    "着","洗","遊","鉄","南","走","建","残","牛","馬",
    "村","世","界","政","治","経","済","商","業","夜",
    "絶","都","第","戦","寺","神","各",
]

# Ch.11  p.207  うかんむり 宀
CH11 = [
    "遅","関","両","紙","娘","独","立","間","足","降",
    "短","似","明","彼","弟","相","違","葉","言","求",
    "単","常","打","余","助","与","甘","失","使","結",
    "汁","全","精","真","涙","流","平","成",
]

# Ch.12  p.225  もんがまえ 門
CH12 = [
    "病","顔","医","地","熱","寒","欲","薬","治","起",
    "面","朝","空","運","成","功","具","症","現","在",
    "胃","重","苦","浴","腹","無","主","張",
]

# Ch.13  p.245  しんにゅう 辶
CH13 = [
    "紹","介","同","手","笑","反","対","直","済","敬",
    "苦","練","正","当","黒","板","写","詩","誘","応",
    "片","招","励","感","情","恥","最","初","記","念",
    "珍","学","科","書","倍","難","解","興","戻","主",
]

# Ch.14  p.268  まだれ 广
CH14 = [
    "妻","間","夫","理","身","収","学","性","格","家",
    "入","力","書","類","順","雇","一","流","企","画",
    "続","働","増","加","既","婚","両","立","労","前",
    "昇","未","低","育","児","減","実","際","産","共",
    "努","公","比","否","定","損","生","自","由","期","待",
]

# Ch.15  p.290  くさかんむり 艹
CH15 = [
    "協","力","都","教","積","極","的","面","任","意",
    "技","術","印","象","替","発","製","耳","辞","飛",
    "風","判","断","幅","必","登","価","値","収","著",
    "原","表","理","論","自","建","築","変","首","常",
    "識","確","信","暖","房","冷","消","不","満","可",
    "能","語","材","料","発","展",
]

CHAPTERS = [
    ("integrated-intermediate-ch6",  "An Integrated Approach — Ch.6 Kanji",  6,  CH6),
    ("integrated-intermediate-ch8",  "An Integrated Approach — Ch.8 Kanji",  8,  CH8),
    ("integrated-intermediate-ch9",  "An Integrated Approach — Ch.9 Kanji",  9,  CH9),
    ("integrated-intermediate-ch10", "An Integrated Approach — Ch.10 Kanji", 10, CH10),
    ("integrated-intermediate-ch11", "An Integrated Approach — Ch.11 Kanji", 11, CH11),
    ("integrated-intermediate-ch12", "An Integrated Approach — Ch.12 Kanji", 12, CH12),
    ("integrated-intermediate-ch13", "An Integrated Approach — Ch.13 Kanji", 13, CH13),
    ("integrated-intermediate-ch14", "An Integrated Approach — Ch.14 Kanji", 14, CH14),
    ("integrated-intermediate-ch15", "An Integrated Approach — Ch.15 Kanji", 15, CH15),
]

OUT = os.path.join(os.path.dirname(__file__), "..", "mnt", "Kanji-App", "agent-files")
os.makedirs(OUT, exist_ok=True)

total_cards = 0
for deck_id, deck_name, ch_num, kanji_list in CHAPTERS:
    cards = []
    missing = []
    seen = set()
    for ch in kanji_list:
        if ch in seen:
            continue
        seen.add(ch)
        if ch not in K:
            missing.append(ch)
            continue
        d = dict(K[ch])
        d["kanji"] = ch
        d["decks"] = [deck_name, f"JLPT {d.get('jlpt','')}"]
        cards.append(d)
    if missing:
        print(f"  [ch{ch_num}] missing data for: {''.join(missing)}")
    deck = {
        "deck_id": deck_id,
        "deck_name": deck_name,
        "version": "1.0",
        "card_count": len(cards),
        "cards": cards,
    }
    path = os.path.join(OUT, f"integrated_ch{ch_num}_kanji.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(deck, f, ensure_ascii=False, indent=2)
    total_cards += len(cards)
    print(f"  ✓ Ch.{ch_num}: {len(cards)} cards → {path}")

print(f"\nTotal new cards: {total_cards}")
