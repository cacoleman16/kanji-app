#!/usr/bin/env python3
"""
Kanji App — Data Pipeline
Generates deck JSON files from embedded language knowledge.
Output schema matches genki2-preview.json exactly.
"""
import json, os

OUT = os.path.join(os.path.dirname(__file__), "out")
os.makedirs(OUT, exist_ok=True)

# ─────────────────────────────────────────────────────────────────────────────
# Master kanji data dict  { kanji: { ...card fields (no "kanji", no "decks") } }
# ─────────────────────────────────────────────────────────────────────────────
K = {}

def k(ch, meanings, on, kun, ex, keyword, etymology, strokes, jlpt, grade):
    K[ch] = dict(meanings=meanings, on_yomi=on, kun_yomi=kun, examples=ex,
                 keyword=keyword, etymology=etymology,
                 stroke_count=strokes, jlpt=jlpt, grade=grade)

def ex(w, r, m): return {"kanji": w, "kana": r, "meaning": m}

# ── JLPT N5 ──────────────────────────────────────────────────────────────────
k("一",["one"],["イチ","イツ"],["ひと(つ)"],
  [ex("一つ","ひとつ","one thing"),ex("一番","いちばん","number one"),ex("一週間","いっしゅうかん","one week")],
  "one","A single horizontal stroke — the simplest unit.",1,"N5",1)
k("二",["two"],["ニ"],["ふた(つ)"],
  [ex("二つ","ふたつ","two things"),ex("二月","にがつ","February"),ex("二人","ふたり","two people")],
  "two","Two horizontal strokes stacked — two counts.",2,"N5",1)
k("三",["three"],["サン"],["みっ(つ)"],
  [ex("三つ","みっつ","three things"),ex("三月","さんがつ","March"),ex("三人","さんにん","three people")],
  "three","Three horizontal strokes — three counts.",3,"N5",1)
k("四",["four"],["シ"],["よっ(つ)","よん"],
  [ex("四つ","よっつ","four things"),ex("四月","しがつ","April"),ex("四人","よにん","four people")],
  "four","A mouth (口) divided — four sections.",5,"N5",1)
k("五",["five"],["ゴ"],["いつ(つ)"],
  [ex("五つ","いつつ","five things"),ex("五月","ごがつ","May"),ex("五人","ごにん","five people")],
  "five","Two strokes crossed with a hook — an ancient tally mark for five.",4,"N5",1)
k("六",["six"],["ロク"],["むっ(つ)"],
  [ex("六つ","むっつ","six things"),ex("六月","ろくがつ","June"),ex("六人","ろくにん","six people")],
  "six","A roof with two legs — a house split six ways.",4,"N5",1)
k("七",["seven"],["シチ"],["なな(つ)"],
  [ex("七つ","ななつ","seven things"),ex("七月","しちがつ","July"),ex("七夕","たなばた","Tanabata festival")],
  "seven","A horizontal stroke with a hook — an old tally mark.",2,"N5",1)
k("八",["eight"],["ハチ"],["やっ(つ)"],
  [ex("八つ","やっつ","eight things"),ex("八月","はちがつ","August"),ex("八百屋","やおや","greengrocer")],
  "eight","Two strokes spreading outward — diverging, spreading wide.",2,"N5",1)
k("九",["nine"],["ク","キュウ"],["ここの(つ)"],
  [ex("九つ","ここのつ","nine things"),ex("九月","くがつ","September"),ex("九州","きゅうしゅう","Kyushu")],
  "nine","A curved stroke with a hook — nearly a full circle, one away from ten.",2,"N5",1)
k("十",["ten"],["ジュウ","ジッ"],["とお"],
  [ex("十","じゅう","ten"),ex("十月","じゅうがつ","October"),ex("二十","はたち","twenty / age 20")],
  "ten","A vertical stroke crossed by a horizontal — a plus sign, ten directions.",2,"N5",1)
k("百",["hundred"],["ヒャク"],["もも"],
  [ex("百","ひゃく","one hundred"),ex("百円","ひゃくえん","100 yen"),ex("三百","さんびゃく","three hundred")],
  "hundred","One (一) above a white (白) — a hundred white hairs on an elder's head.",6,"N5",1)
k("千",["thousand"],["セン"],["ち"],
  [ex("千","せん","one thousand"),ex("千円","せんえん","1000 yen"),ex("三千","さんぜん","three thousand")],
  "thousand","Ten (十) with a slanted stroke — a thousand-fold magnification of ten.",3,"N5",1)
k("万",["ten thousand","myriad"],["マン","バン"],[],
  [ex("一万","いちまん","ten thousand"),ex("万年筆","まんねんひつ","fountain pen"),ex("万が一","まんがいち","one in ten thousand")],
  "myriad","A swirling stroke — so many it can't be counted, a myriad.",3,"N5",2)
k("円",["yen","circle","round"],["エン"],["まる(い)"],
  [ex("円","えん","yen"),ex("円い","まるい","round, circular"),ex("千円","せんえん","1000 yen")],
  "yen","A frame enclosing strokes — a rounded coin shape.",4,"N5",1)
k("年",["year"],["ネン"],["とし"],
  [ex("今年","ことし","this year"),ex("毎年","まいとし","every year"),ex("去年","きょねん","last year")],
  "year","Grain (禾) stalks bent at harvest — one full harvest cycle, a year.",6,"N5",1)
k("月",["month","moon"],["ゲツ","ガツ"],["つき"],
  [ex("月曜日","げつようび","Monday"),ex("今月","こんげつ","this month"),ex("月見","つきみ","moon-viewing")],
  "moon","The crescent moon in simplified form.",4,"N5",1)
k("日",["day","sun","Japan"],["ニチ","ジツ"],["ひ","か"],
  [ex("今日","きょう","today"),ex("日曜日","にちようび","Sunday"),ex("毎日","まいにち","every day")],
  "sun","A circle with a center dot — the sun.",4,"N5",1)
k("時",["time","hour","o'clock"],["ジ"],["とき"],
  [ex("時間","じかん","time, hour"),ex("何時","なんじ","what time"),ex("時々","ときどき","sometimes")],
  "time","Sun (日) + temple (寺) — when the temple bell marks the sun's position.",10,"N5",2)
k("分",["minute","part","understand"],["フン","ブン"],["わ(かる)","わ(ける)"],
  [ex("五分","ごふん","five minutes"),ex("自分","じぶん","oneself"),ex("分かる","わかる","to understand")],
  "minute","A knife (刀) dividing (八) — splitting into parts.",4,"N5",2)
k("半",["half"],["ハン"],["なか(ば)"],
  [ex("半分","はんぶん","half"),ex("一時半","いちじはん","one thirty"),ex("半年","はんとし","half a year")],
  "half","A vertical stroke splitting a horizontal — cut in half.",5,"N5",2)
k("今",["now","present"],["コン","キン"],["いま"],
  [ex("今","いま","now"),ex("今日","きょう","today"),ex("今年","ことし","this year")],
  "now","A cover pressing down — pinning the present moment.",4,"N5",2)
k("何",["what","how many"],["カ"],["なに","なん"],
  [ex("何","なに","what"),ex("何時","なんじ","what time"),ex("何人","なんにん","how many people")],
  "what","Person (亻) by a burdensome load (可) — asking 'what is this?'",7,"N5",2)
k("人",["person","people"],["ジン","ニン"],["ひと"],
  [ex("人","ひと","person"),ex("日本人","にほんじん","Japanese person"),ex("三人","さんにん","three people")],
  "person","Two strokes — a person leaning against another, supporting each other.",2,"N5",1)
k("大",["big","large","great"],["ダイ","タイ"],["おお(きい)"],
  [ex("大きい","おおきい","big"),ex("大学","だいがく","university"),ex("大人","おとな","adult")],
  "big","A person (人) with arms spread wide — as big as you can get.",3,"N5",1)
k("小",["small","little"],["ショウ"],["ちい(さい)","こ","お"],
  [ex("小さい","ちいさい","small"),ex("小学校","しょうがっこう","elementary school"),ex("小説","しょうせつ","novel")],
  "small","A vertical stroke splitting two tiny dots — something small, divided.",3,"N5",1)
k("中",["middle","inside","China"],["チュウ"],["なか"],
  [ex("中","なか","inside, middle"),ex("中学校","ちゅうがっこう","middle school"),ex("中国","ちゅうごく","China")],
  "middle","A vertical stroke through the center of a rectangle — right in the middle.",4,"N5",1)
k("上",["above","up","top"],["ジョウ","ショウ"],["うえ","あ(がる)","のぼ(る)"],
  [ex("上","うえ","above, top"),ex("上手","じょうず","skilled"),ex("上がる","あがる","to rise")],
  "above","A short stroke above a line — pointing up.",3,"N5",1)
k("下",["below","down","bottom"],["カ","ゲ"],["した","さ(がる)","くだ(さい)"],
  [ex("下","した","below"),ex("下手","へた","unskilled"),ex("地下","ちか","underground")],
  "below","A short stroke hanging below a line — pointing down.",3,"N5",1)
k("左",["left"],["サ"],["ひだり"],
  [ex("左","ひだり","left"),ex("左手","ひだりて","left hand"),ex("左側","ひだりがわ","left side")],
  "left","A hand (ナ) holding a carpenter's tool (工) — the left hand at work.",5,"N5",1)
k("右",["right"],["ウ","ユウ"],["みぎ"],
  [ex("右","みぎ","right"),ex("右手","みぎて","right hand"),ex("右側","みぎがわ","right side")],
  "right","A hand (ナ) bringing food to the mouth (口) — the right hand eats.",5,"N5",1)
k("前",["front","before","ago"],["ゼン"],["まえ"],
  [ex("前","まえ","front, before"),ex("午前","ごぜん","morning, AM"),ex("名前","なまえ","name")],
  "front","A boat (舟) stopped by a knife (刂) — halted out front.",9,"N5",2)
k("後",["behind","after","later"],["ゴ","コウ"],["あと","うし(ろ)","のち"],
  [ex("後","あと","after, later"),ex("午後","ごご","afternoon, PM"),ex("後ろ","うしろ","behind")],
  "behind","Walking (彳) slowly (幺) with a foot (夂) — lagging behind.",9,"N5",2)
k("北",["north"],["ホク"],["きた"],
  [ex("北","きた","north"),ex("北海道","ほっかいどう","Hokkaido"),ex("北口","きたぐち","north exit")],
  "north","Two people (比) sitting back to back — turned away from the cold north.",5,"N5",2)
k("南",["south"],["ナン"],["みなみ"],
  [ex("南","みなみ","south"),ex("南口","みなみぐち","south exit"),ex("東南アジア","とうなんアジア","Southeast Asia")],
  "south","A shelter with hanging tendrils — a warm southern vine-covered hut.",9,"N5",2)
k("東",["east"],["トウ"],["ひがし"],
  [ex("東","ひがし","east"),ex("東京","とうきょう","Tokyo"),ex("東口","ひがしぐち","east exit")],
  "east","The sun (日) rising behind a tree (木) — the east at dawn.",8,"N5",1)
k("西",["west"],["セイ","サイ"],["にし"],
  [ex("西","にし","west"),ex("関西","かんさい","Kansai region"),ex("西口","にしぐち","west exit")],
  "west","A bird settling into its nest — birds roost at sunset in the west.",6,"N5",2)
k("外",["outside","foreign"],["ガイ","ゲ"],["そと","はず(れる)"],
  [ex("外","そと","outside"),ex("外国","がいこく","foreign country"),ex("外出","がいしゅつ","going out")],
  "outside","Evening (夕) + divination (卜) — reading omens outside at dusk.",5,"N5",2)
k("本",["book","origin","main"],["ホン"],["もと"],
  [ex("本","ほん","book"),ex("日本","にほん","Japan"),ex("本当","ほんとう","truth, really")],
  "origin","A tree (木) with a mark at the root — the origin point.",5,"N5",1)
k("山",["mountain"],["サン"],["やま"],
  [ex("山","やま","mountain"),ex("富士山","ふじさん","Mt. Fuji"),ex("山登り","やまのぼり","mountain climbing")],
  "mountain","Three peaks — a mountain range viewed from afar.",3,"N5",1)
k("川",["river"],["セン"],["かわ"],
  [ex("川","かわ","river"),ex("川沿い","かわぞい","along the river"),ex("小川","おがわ","stream, brook")],
  "river","Three vertical strokes — water flowing between banks.",3,"N5",1)
k("水",["water"],["スイ"],["みず"],
  [ex("水","みず","water"),ex("水曜日","すいようび","Wednesday"),ex("水泳","すいえい","swimming")],
  "water","A stream with droplets splashing — water in motion.",4,"N5",1)
k("火",["fire"],["カ"],["ひ"],
  [ex("火","ひ","fire"),ex("火曜日","かようび","Tuesday"),ex("花火","はなび","fireworks")],
  "fire","Flames rising from a central point — a bonfire.",4,"N5",1)
k("木",["tree","wood"],["モク","ボク"],["き","こ"],
  [ex("木","き","tree"),ex("木曜日","もくようび","Thursday"),ex("木村","きむら","(surname Kimura)")],
  "tree","A trunk with roots below and branches above.",4,"N5",1)
k("金",["gold","money","Friday"],["キン","コン"],["かね","かな"],
  [ex("お金","おかね","money"),ex("金曜日","きんようび","Friday"),ex("金色","きんいろ","golden color")],
  "gold","Metal nuggets (王) in the ground — buried gold.",8,"N5",1)
k("土",["earth","soil","Saturday"],["ド","ト"],["つち"],
  [ex("土","つち","earth, soil"),ex("土曜日","どようび","Saturday"),ex("土地","とち","land, soil")],
  "earth","A seedling sprouting from the ground — earth.",3,"N5",1)
k("天",["sky","heaven"],["テン"],["あめ","あま"],
  [ex("天気","てんき","weather"),ex("天ぷら","てんぷら","tempura"),ex("天井","てんじょう","ceiling")],
  "heaven","Great (大) with a stroke above — what is above the great man, the sky.",4,"N5",1)
k("電",["electricity","electric"],["デン"],[],
  [ex("電車","でんしゃ","train"),ex("電話","でんわ","telephone"),ex("電気","でんき","electricity")],
  "electricity","Rain (雨) with lightning bolt — electric storm.",13,"N5",2)
k("車",["car","vehicle"],["シャ"],["くるま"],
  [ex("電車","でんしゃ","train"),ex("車","くるま","car"),ex("自転車","じてんしゃ","bicycle")],
  "vehicle","Spokes of a wheel seen from above.",7,"N5",1)
k("駅",["station"],["エキ"],[],
  [ex("駅","えき","station"),ex("駅前","えきまえ","in front of station"),ex("終点駅","しゅうてんえき","terminal station")],
  "station","Horse (馬) + post exchange (尺) — where horses were exchanged on a route.",14,"N5",3)
k("国",["country","nation"],["コク"],["くに"],
  [ex("国","くに","country"),ex("外国","がいこく","foreign country"),ex("国際","こくさい","international")],
  "country","A jewel (玉) enclosed by borders — a nation guarding its treasure.",8,"N5",2)
k("校",["school"],["コウ"],[],
  [ex("学校","がっこう","school"),ex("高校","こうこう","high school"),ex("校長","こうちょう","principal")],
  "school","Wood (木) building +交 (exchange) — a place of wooden structures where learning is exchanged.",10,"N5",1)
k("先",["ahead","previous","tip"],["セン"],["さき"],
  [ex("先生","せんせい","teacher"),ex("先週","せんしゅう","last week"),ex("先輩","せんぱい","senior")],
  "ahead","Legs walking (先) past others — going ahead.",6,"N5",1)
k("生",["life","birth","student"],["セイ","ショウ"],["い(きる)","う(まれる)","なま"],
  [ex("学生","がくせい","student"),ex("先生","せんせい","teacher"),ex("生まれる","うまれる","to be born")],
  "life","A seedling (屮) sprouting from the earth (土) — new life.",5,"N5",1)
k("学",["study","learning"],["ガク"],["まな(ぶ)"],
  [ex("学校","がっこう","school"),ex("大学","だいがく","university"),ex("学ぶ","まなぶ","to learn")],
  "study","Hands (爻) guiding a child (子) under a roof — learning.",8,"N5",1)
k("気",["spirit","feeling","air","energy"],["キ","ケ"],["いき"],
  [ex("天気","てんき","weather"),ex("気持ち","きもち","feeling"),ex("元気","げんき","healthy, fine")],
  "spirit","Rice steam (米 + 气) — the vital energy rising like steam.",6,"N5",1)
k("雨",["rain"],["ウ"],["あめ","あま"],
  [ex("雨","あめ","rain"),ex("大雨","おおあめ","heavy rain"),ex("雨季","うき","rainy season")],
  "rain","Drops (冫冫) falling from a cloud under the sky (一).",8,"N5",1)
k("空",["sky","empty","air"],["クウ"],["そら","あ(く)","から"],
  [ex("空","そら","sky"),ex("空港","くうこう","airport"),ex("空気","くうき","air")],
  "sky","A cave (穴) where work (工) is done — hollowed out, empty sky.",8,"N5",1)
k("花",["flower"],["カ"],["はな"],
  [ex("花","はな","flower"),ex("花火","はなび","fireworks"),ex("桜の花","さくらのはな","cherry blossom")],
  "flower","Grass (艹) changing (化) — plants transforming into bloom.",7,"N5",1)
k("手",["hand"],["シュ"],["て"],
  [ex("手","て","hand"),ex("上手","じょうず","skilled"),ex("手紙","てがみ","letter")],
  "hand","Five fingers and a wrist — the shape of a hand.",4,"N5",1)
k("足",["foot","leg","enough"],["ソク"],["あし","た(りる)"],
  [ex("足","あし","foot, leg"),ex("足りる","たりる","to be enough"),ex("土足","どそく","wearing shoes indoors")],
  "foot","A knee and foot — the lower leg.",7,"N5",1)
k("目",["eye"],["モク","ボク"],["め"],
  [ex("目","め","eye"),ex("目的","もくてき","purpose, goal"),ex("注目","ちゅうもく","attention")],
  "eye","An eye turned on its side — the almond shape of an eye.",5,"N5",1)
k("口",["mouth"],["コウ","ク"],["くち"],
  [ex("口","くち","mouth"),ex("入口","いりぐち","entrance"),ex("出口","でぐち","exit")],
  "mouth","A square opening — the shape of an open mouth.",3,"N5",1)
k("女",["woman","female"],["ジョ","ニョ"],["おんな","め"],
  [ex("女性","じょせい","woman, female"),ex("女の人","おんなのひと","woman"),ex("女子","じょし","girl, female")],
  "woman","A figure seated gracefully — a woman.",3,"N5",1)
k("男",["man","male"],["ダン","ナン"],["おとこ"],
  [ex("男性","だんせい","man, male"),ex("男の人","おとこのひと","man"),ex("男子","だんし","boy, male")],
  "man","A rice field (田) plus strength (力) — a man working the field.",7,"N5",1)
k("子",["child"],["シ","ス"],["こ"],
  [ex("子供","こども","child"),ex("女子","じょし","girl"),ex("椅子","いす","chair")],
  "child","A swaddled baby with arms outstretched.",3,"N5",1)
k("母",["mother"],["ボ"],["はは"],
  [ex("母","はは","(my) mother"),ex("お母さん","おかあさん","mother (polite)"),ex("母国","ぼこく","mother country")],
  "mother","A woman (女) with two dots marking her breast — a nursing mother.",5,"N5",2)
k("父",["father"],["フ"],["ちち"],
  [ex("父","ちち","(my) father"),ex("お父さん","おとうさん","father (polite)"),ex("父親","ちちおや","father")],
  "father","A hand wielding an axe — the father providing and protecting.",4,"N5",2)
k("友",["friend"],["ユウ"],["とも"],
  [ex("友達","ともだち","friend"),ex("友人","ゆうじん","friend (formal)"),ex("親友","しんゆう","close friend")],
  "friend","Two right hands (又) clasped — hands joined in friendship.",4,"N5",2)
k("行",["go","conduct"],["コウ","ギョウ"],["い(く)","おこな(う)"],
  [ex("行く","いく","to go"),ex("旅行","りょこう","travel"),ex("銀行","ぎんこう","bank")],
  "go","A crossroads — moving through an intersection.",6,"N5",2)
k("来",["come","next"],["ライ"],["く(る)","きた(る)"],
  [ex("来る","くる","to come"),ex("来年","らいねん","next year"),ex("来週","らいしゅう","next week")],
  "come","Grain (木) with people clustering underneath — people coming to harvest.",7,"N5",2)
k("帰",["return","go home"],["キ"],["かえ(る)"],
  [ex("帰る","かえる","to return home"),ex("帰国","きこく","returning to one's country"),ex("帰宅","きたく","returning home")],
  "return","A broom sweeping toward a figure — sweeping the path home.",10,"N5",2)
k("食",["eat","food"],["ショク","ジキ"],["た(べる)","く(う)"],
  [ex("食べる","たべる","to eat"),ex("食事","しょくじ","meal"),ex("食堂","しょくどう","cafeteria")],
  "eat","Gathered food (良) under a roof — food ready to eat.",9,"N5",2)
k("飲",["drink"],["イン"],["の(む)"],
  [ex("飲む","のむ","to drink"),ex("飲み物","のみもの","beverage"),ex("飲食","いんしょく","eating and drinking")],
  "drink","Food (食) with a yawning mouth (欠) — opening wide to drink.",12,"N5",3)
k("見",["see","look"],["ケン"],["み(る)","み(える)"],
  [ex("見る","みる","to see"),ex("意見","いけん","opinion"),ex("見える","みえる","to be visible")],
  "see","An eye (目) on legs — walking around looking.",7,"N5",1)
k("書",["write"],["ショ"],["か(く)"],
  [ex("書く","かく","to write"),ex("図書館","としょかん","library"),ex("教科書","きょうかしょ","textbook")],
  "write","A brush (聿) drawing — writing with a brush.",10,"N5",2)
k("読",["read"],["ドク","トク"],["よ(む)"],
  [ex("読む","よむ","to read"),ex("読書","どくしょ","reading (books)"),ex("読み方","よみかた","how to read")],
  "read","Words (言) + sold (売) — reading what is sold as text.",14,"N5",2)
k("話",["talk","speak","story"],["ワ"],["はな(す)","はなし"],
  [ex("話す","はなす","to speak"),ex("電話","でんわ","telephone"),ex("話し合い","はなしあい","discussion")],
  "talk","Words (言) + tongue (舌) — the tongue speaking words.",13,"N5",2)
k("語",["language","word"],["ゴ"],["かた(る)"],
  [ex("日本語","にほんご","Japanese language"),ex("英語","えいご","English"),ex("語る","かたる","to narrate")],
  "language","Words (言) + I/me (吾) — the words I speak, a language.",14,"N5",2)
k("聞",["listen","hear","ask"],["ブン","モン"],["き(く)"],
  [ex("聞く","きく","to listen, to ask"),ex("新聞","しんぶん","newspaper"),ex("聞こえる","きこえる","to be audible")],
  "listen","An ear (耳) at a gate (門) — listening at the door.",14,"N5",2)
k("入",["enter","put in"],["ニュウ"],["い(る)","はい(る)"],
  [ex("入る","はいる","to enter"),ex("入口","いりぐち","entrance"),ex("入学","にゅうがく","school enrollment")],
  "enter","Two strokes converging inward — entering a point.",2,"N5",1)

# ── JLPT N4 (kanji not already in N5) ────────────────────────────────────────
k("会",["meet","meeting","association"],["カイ","エ"],["あ(う)"],
  [ex("会う","あう","to meet"),ex("会社","かいしゃ","company"),ex("会議","かいぎ","meeting")],
  "meeting","Gathering (合) under a roof — people meeting inside.",6,"N4",2)
k("社",["company","shrine"],["シャ"],["やしろ"],
  [ex("会社","かいしゃ","company"),ex("神社","じんじゃ","Shinto shrine"),ex("社長","しゃちょう","company president")],
  "company","Land god (示) on earth (土) — the shrine, then by extension a company.",7,"N4",2)
k("仕",["serve","do"],["シ","ジ"],["つか(える)"],
  [ex("仕事","しごと","work, job"),ex("仕方","しかた","way of doing"),ex("仕える","つかえる","to serve")],
  "serve","Person (亻) + samurai/official (士) — to serve as an official.",5,"N4",3)
k("事",["thing","matter","fact"],["ジ","ズ"],["こと"],
  [ex("仕事","しごと","work"),ex("大事","だいじ","important"),ex("事件","じけん","incident")],
  "matter","A hand (又) working within (中) — a matter being dealt with.",8,"N4",3)
k("自",["self","oneself"],["ジ","シ"],["みずか(ら)"],
  [ex("自分","じぶん","oneself"),ex("自転車","じてんしゃ","bicycle"),ex("自由","じゆう","freedom")],
  "self","The shape of a nose — in Japan one points to the nose to mean 'me'.",6,"N4",2)
k("転",["roll","turn","fall"],["テン"],["ころ(がる)","まろ(ぶ)"],
  [ex("自転車","じてんしゃ","bicycle"),ex("転ぶ","ころぶ","to fall over"),ex("転校","てんこう","school transfer")],
  "roll","Cart (車) rotating (専) — wheels rolling.",11,"N4",3)
k("乗",["ride","get on"],["ジョウ"],["の(る)"],
  [ex("乗る","のる","to ride"),ex("乗り物","のりもの","vehicle"),ex("乗り換え","のりかえ","transfer (train)")],
  "ride","A person atop a tree — climbing up and riding.",9,"N4",3)
k("運",["carry","luck","move"],["ウン"],["はこ(ぶ)"],
  [ex("運動","うんどう","exercise"),ex("運転","うんてん","driving"),ex("運ぶ","はこぶ","to carry")],
  "luck","Move (辶) with a soldier (軍) — moving things around, luck depends on movement.",12,"N4",3)
k("世",["world","generation","age"],["セイ","セ"],["よ"],
  [ex("世界","せかい","world"),ex("世話","せわ","care, looking after"),ex("世紀","せいき","century")],
  "world","Three tens (十×3) — thirty years, a generation; the whole world.",5,"N4",3)
k("界",["world","boundary","border"],["カイ"],[],
  [ex("世界","せかい","world"),ex("限界","げんかい","limit"),ex("業界","ぎょうかい","industry")],
  "boundary","A rice field (田) with distinct borders (介) — marked-off territory.",9,"N4",3)
k("地",["ground","earth","place"],["チ","ジ"],["つち"],
  [ex("地図","ちず","map"),ex("地下","ちか","underground"),ex("土地","とち","land")],
  "ground","Earth (土) spread out — the ground.",6,"N4",2)
k("図",["diagram","map","plan"],["ズ","ト"],["はか(る)"],
  [ex("地図","ちず","map"),ex("図書館","としょかん","library"),ex("図形","ずけい","figure, shape")],
  "diagram","An enclosure with a plan inside — a diagram.",7,"N4",2)
k("場",["place","location"],["ジョウ"],["ば"],
  [ex("場所","ばしょ","place"),ex("広場","ひろば","plaza"),ex("駐車場","ちゅうしゃじょう","parking lot")],
  "place","Earth (土) + sun rising (昜) — a sun-lit open place.",12,"N4",3)
k("道",["road","way","path"],["ドウ","トウ"],["みち"],
  [ex("道","みち","road, path"),ex("柔道","じゅうどう","judo"),ex("道路","どうろ","road")],
  "way","Walking (辶) with a leader's head (首) — leading the way on the road.",12,"N4",2)
k("橋",["bridge"],["キョウ"],["はし"],
  [ex("橋","はし","bridge"),ex("橋本","はしもと","(surname)"),ex("歩道橋","ほどうきょう","pedestrian bridge")],
  "bridge","Wood (木) supporting a high arch (喬) — a wooden bridge.",16,"N4",3)
k("駐",["park (vehicle)","stay"],["チュウ"],[],
  [ex("駐車","ちゅうしゃ","parking"),ex("駐車場","ちゅうしゃじょう","parking lot"),ex("駐在","ちゅうざい","stationed at")],
  "park","Horse (馬) standing still (主) — a horse tied in place.",15,"N4",0)
k("近",["near","close"],["キン"],["ちか(い)"],
  [ex("近い","ちかい","near"),ex("近所","きんじょ","neighborhood"),ex("最近","さいきん","recently")],
  "near","Walking (辶) with an axe (斤) — approaching to chop nearby trees.",7,"N4",2)
k("遠",["far","distant"],["エン","オン"],["とお(い)"],
  [ex("遠い","とおい","far"),ex("遠足","えんそく","field trip"),ex("永遠","えいえん","eternity")],
  "far","Walking (辶) a long swirling (袁) road — going far away.",13,"N4",2)
k("速",["fast","speed"],["ソク"],["はや(い)","はや(める)"],
  [ex("速い","はやい","fast"),ex("速度","そくど","speed"),ex("高速","こうそく","high speed")],
  "fast","Walking (辶) with efficiency (束) — moving quickly along a path.",10,"N4",3)
k("遅",["slow","late"],["チ"],["おそ(い)","おく(れる)"],
  [ex("遅い","おそい","slow, late"),ex("遅刻","ちこく","being late"),ex("遅れる","おくれる","to be delayed")],
  "late","Walking (辶) with a sheep stuck (尾) behind — lagging slow.",12,"N4",4)
k("早",["early","fast"],["ソウ","サッ"],["はや(い)"],
  [ex("早い","はやい","early"),ex("早起き","はやおき","early rising"),ex("早速","さっそく","right away")],
  "early","The sun (日) above a ten (十) — the sun just barely risen, early morning.",6,"N4",1)
k("重",["heavy","important","layer"],["ジュウ","チョウ"],["おも(い)","かさ(ねる)"],
  [ex("重い","おもい","heavy"),ex("重要","じゅうよう","important"),ex("体重","たいじゅう","body weight")],
  "heavy","A person (人) carrying a heavy load (里) — weighed down.",9,"N4",3)
k("軽",["light (weight)","easy"],["ケイ"],["かる(い)"],
  [ex("軽い","かるい","light"),ex("軽食","けいしょく","light meal"),ex("気軽","きがる","casual, easygoing")],
  "light","Cart (車) + channels (巠) — a cart with smooth wheels, light to pull.",12,"N4",3)
k("暑",["hot (weather)"],["ショ"],["あつ(い)"],
  [ex("暑い","あつい","hot (weather)"),ex("暑さ","あつさ","heat"),ex("猛暑","もうしょ","intense heat")],
  "hot weather","Sun (日) + many (者) — the sun bearing down on everyone.",12,"N4",3)
k("寒",["cold (weather)"],["カン"],["さむ(い)"],
  [ex("寒い","さむい","cold"),ex("寒さ","さむさ","cold, coldness"),ex("寒波","かんぱ","cold wave")],
  "cold","A person under a roof (宀) covered in ice (冫) — shivering with cold.",12,"N4",3)
k("暗",["dark","gloomy"],["アン"],["くら(い)"],
  [ex("暗い","くらい","dark"),ex("暗記","あんき","memorization"),ex("暗号","あんごう","code, cipher")],
  "dark","Sun (日) blocked by a sound/seal (音) — the sun hidden, darkness.",13,"N4",3)
k("広",["wide","spacious"],["コウ"],["ひろ(い)","ひろ(がる)"],
  [ex("広い","ひろい","wide, spacious"),ex("広場","ひろば","plaza"),ex("広告","こうこく","advertisement")],
  "wide","A shelter (广) with nothing inside — wide open space.",5,"N4",2)
k("発",["departure","emit","start"],["ハツ","ホツ"],[],
  [ex("出発","しゅっぱつ","departure"),ex("発音","はつおん","pronunciation"),ex("発見","はっけん","discovery")],
  "depart","Feet (癶) and a bow releasing (弓) — launching forward.",9,"N4",3)
k("着",["arrive","wear","attach"],["チャク"],["き(る)","つ(く)"],
  [ex("着る","きる","to wear"),ex("到着","とうちゃく","arrival"),ex("着く","つく","to arrive")],
  "arrive","A sheep (羊) with eyes (目) at the bottom — settling down on arrival.",12,"N4",3)
k("住",["live","reside"],["ジュウ"],["す(む)"],
  [ex("住む","すむ","to live in"),ex("住所","じゅうしょ","address"),ex("住民","じゅうみん","resident")],
  "reside","Person (亻) + master (主) — a person established as master of a place.",7,"N4",3)
k("所",["place","location"],["ショ"],["ところ"],
  [ex("場所","ばしょ","place"),ex("台所","だいどころ","kitchen"),ex("近所","きんじょ","neighborhood")],
  "place","A door (戸) and an axe (斤) — the place where work is done.",8,"N4",3)
k("家",["house","home","family"],["カ","ケ"],["いえ","や"],
  [ex("家","いえ","house, home"),ex("家族","かぞく","family"),ex("家庭","かてい","household")],
  "house","A pig (豕) under a roof (宀) — a house with livestock.",10,"N4",2)
k("族",["family","tribe","group"],["ゾク"],[],
  [ex("家族","かぞく","family"),ex("民族","みんぞく","ethnic group"),ex("水族館","すいぞくかん","aquarium")],
  "clan","A banner (方) with arrows (矢) — a tribe rallying under their banner.",11,"N4",3)
k("兄",["older brother"],["ケイ","キョウ"],["あに"],
  [ex("兄","あに","older brother"),ex("お兄さん","おにいさん","older brother (polite)"),ex("兄弟","きょうだい","siblings")],
  "elder brother","A mouth (口) on a person (儿) — the one who speaks first, the older brother.",5,"N4",2)
k("姉",["older sister"],["シ"],["あね"],
  [ex("姉","あね","older sister"),ex("お姉さん","おねえさん","older sister (polite)"),ex("姉妹","しまい","sisters")],
  "elder sister","Woman (女) + market (市) — a woman mature enough to go to market.",8,"N4",2)
k("弟",["younger brother"],["ダイ","テイ"],["おとうと"],
  [ex("弟","おとうと","younger brother"),ex("兄弟","きょうだい","siblings"),ex("弟子","でし","disciple")],
  "younger brother","Strands wound around a stake — the younger one who follows the elder.",7,"N4",2)
k("妹",["younger sister"],["マイ"],["いもうと"],
  [ex("妹","いもうと","younger sister"),ex("姉妹","しまい","sisters"),ex("義妹","ぎまい","sister-in-law")],
  "younger sister","Woman (女) + not yet ripe (未) — the younger sister.",8,"N4",2)
k("親",["parent","intimate","close"],["シン"],["おや","した(しい)"],
  [ex("親","おや","parent"),ex("両親","りょうしん","both parents"),ex("親切","しんせつ","kindness")],
  "parent","Standing (立) + tree (木) + see (見) — a parent watching from atop the tree.",16,"N4",2)
k("強",["strong","force"],["キョウ","ゴウ"],["つよ(い)","し(いる)"],
  [ex("強い","つよい","strong"),ex("勉強","べんきょう","studying"),ex("強調","きょうちょう","emphasis")],
  "strong","A bow (弓) + silkworm (虫) with a reinforcing stroke — reinforced, strong.",11,"N4",2)
k("弱",["weak"],["ジャク"],["よわ(い)"],
  [ex("弱い","よわい","weak"),ex("弱点","じゃくてん","weak point"),ex("弱気","よわき","timid, bearish")],
  "weak","Two bows (弓×2) with decorative endings — ornamental bows, not functional, weak.",10,"N4",2)
k("忘",["forget"],["ボウ"],["わす(れる)"],
  [ex("忘れる","わすれる","to forget"),ex("忘れ物","わすれもの","forgotten item"),ex("忘年会","ぼうねんかい","year-end party")],
  "forget","Dying/lost (亡) + heart (心) — a heart that has lost something, forgetting.",7,"N4",4)
k("洗",["wash"],["セン"],["あら(う)"],
  [ex("洗う","あらう","to wash"),ex("洗濯","せんたく","laundry"),ex("洗面所","せんめんじょ","washroom")],
  "wash","Water (氵) + first/fresh (先) — rinsing clean with fresh water.",9,"N4",6)
k("起",["wake up","rise","happen"],["キ"],["お(きる)","お(こる)"],
  [ex("起きる","おきる","to wake up"),ex("起こる","おこる","to happen"),ex("早起き","はやおき","early rising")],
  "rise","Run (走) + self (己) — yourself getting up and running.",10,"N4",3)
k("寝",["sleep","lie down"],["シン"],["ね(る)"],
  [ex("寝る","ねる","to sleep"),ex("寝室","しんしつ","bedroom"),ex("昼寝","ひるね","nap")],
  "sleep","Roof (宀) + a person lying on a bed (爿) with a broom — retiring to bed.",13,"N4",0)
k("待",["wait"],["タイ"],["ま(つ)"],
  [ex("待つ","まつ","to wait"),ex("待合室","まちあいしつ","waiting room"),ex("期待","きたい","expectation")],
  "wait","Walking (彳) + temple (寺) — walking to the temple and waiting there.",9,"N4",3)
k("持",["hold","carry","have"],["ジ"],["も(つ)"],
  [ex("持つ","もつ","to hold"),ex("気持ち","きもち","feeling"),ex("持ち物","もちもの","belongings")],
  "hold","Hand (扌) + temple (寺) — a hand holding steady like a temple.",9,"N4",3)
k("使",["use","employ"],["シ"],["つか(う)"],
  [ex("使う","つかう","to use"),ex("大使館","たいしかん","embassy"),ex("使い方","つかいかた","how to use")],
  "use","Person (亻) + official (吏) — a person put to official use.",8,"N4",3)
k("貸",["lend"],["タイ"],["か(す)"],
  [ex("貸す","かす","to lend"),ex("貸し出し","かしだし","lending out"),ex("貸借","たいしゃく","lending and borrowing")],
  "lend","Shell/money (貝) + generation (代) — passing money to the next generation.",12,"N4",0)
k("借",["borrow"],["シャク"],["か(りる)"],
  [ex("借りる","かりる","to borrow"),ex("借金","しゃっきん","debt"),ex("借り物","かりもの","borrowed item")],
  "borrow","Person (亻) + former (昔) — using someone else's old thing.",10,"N4",4)
k("返",["return","give back"],["ヘン"],["かえ(す)"],
  [ex("返す","かえす","to return"),ex("返事","へんじ","reply"),ex("返却","へんきゃく","returning an item")],
  "return","Walking (辶) + overturn (反) — turning back to return something.",7,"N4",3)
k("送",["send"],["ソウ"],["おく(る)"],
  [ex("送る","おくる","to send"),ex("見送り","みおくり","seeing off"),ex("放送","ほうそう","broadcast")],
  "send","Walking (辶) + born/offer (关) — carrying something along to send.",9,"N4",3)
k("受",["receive","accept"],["ジュ"],["う(ける)"],
  [ex("受ける","うける","to receive"),ex("受付","うけつけ","reception"),ex("受験","じゅけん","taking an exam")],
  "receive","A hand (爪) passing to another hand — handing over and receiving.",8,"N4",3)
k("教",["teach","religion"],["キョウ"],["おし(える)"],
  [ex("教える","おしえる","to teach"),ex("教師","きょうし","teacher"),ex("教室","きょうしつ","classroom")],
  "teach","Old knowledge (孝) with a stick (攴) — beating the lesson in, teaching.",11,"N4",2)
k("習",["practice","learn"],["シュウ"],["なら(う)"],
  [ex("習う","ならう","to learn"),ex("練習","れんしゅう","practice"),ex("予習","よしゅう","preview study")],
  "practice","Wings (羽) over white (白) — a bird practicing flying again and again.",11,"N4",3)
k("研",["polish","research"],["ケン"],["と(ぐ)"],
  [ex("研究","けんきゅう","research"),ex("研究所","けんきゅうじょ","research institute"),ex("研修","けんしゅう","training")],
  "research","Stone (石) + open (开) — grinding stone open to find the truth.",9,"N4",0)
k("究",["investigate","study"],["キュウ"],["きわ(める)"],
  [ex("研究","けんきゅう","research"),ex("究める","きわめる","to master"),ex("追究","ついきゅう","pursuit")],
  "investigate","A cave (穴) + bent (九) — digging deep into a cave to find answers.",7,"N4",0)
k("試",["test","try"],["シ"],["こころ(みる)","ため(す)"],
  [ex("試験","しけん","exam"),ex("試合","しあい","match, game"),ex("試す","ためす","to try out")],
  "try","Words (言) + style (式) — putting words to the test.",13,"N4",4)
k("験",["experience","exam"],["ケン","ゲン"],[],
  [ex("試験","しけん","exam"),ex("経験","けいけん","experience"),ex("実験","じっけん","experiment")],
  "exam","Horse (馬) + sigil (僉) — testing a horse's mettle.",18,"N4",4)
k("答",["answer","reply"],["トウ"],["こた(える)","こたえ"],
  [ex("答える","こたえる","to answer"),ex("答え","こたえ","answer"),ex("回答","かいとう","response")],
  "answer","Bamboo (竹) + together (合) — gathering bamboo strips with the answer written.",12,"N4",2)
k("質",["quality","nature","question"],["シツ","シチ"],["たち"],
  [ex("質問","しつもん","question"),ex("品質","ひんしつ","product quality"),ex("性質","せいしつ","nature, character")],
  "quality","Two axes (斤×2) over money (貝) — testing the quality of goods.",15,"N4",5)
k("問",["question","problem"],["モン"],["と(う)","とい"],
  [ex("質問","しつもん","question"),ex("問題","もんだい","problem"),ex("問い合わせ","といあわせ","inquiry")],
  "question","A gate (門) with a mouth (口) — a mouth calling at the gate with questions.",11,"N4",3)
k("題",["topic","title","problem"],["ダイ"],[],
  [ex("問題","もんだい","problem"),ex("題名","だいめい","title"),ex("宿題","しゅくだい","homework")],
  "topic","Is (是) + page/head (頁) — the leading idea on the page.",18,"N4",3)
k("宿",["lodging","homework"],["シュク"],["やど"],
  [ex("宿題","しゅくだい","homework"),ex("宿泊","しゅくはく","accommodation"),ex("宿屋","やどや","inn")],
  "lodge","Roof (宀) + a hundred (百) people — many people under one roof, an inn.",11,"N4",3)
k("泊",["stay overnight","anchor"],["ハク"],["と(まる)"],
  [ex("泊まる","とまる","to stay overnight"),ex("宿泊","しゅくはく","accommodation"),ex("一泊","いっぱく","one night stay")],
  "stay overnight","Water (氵) + white (白) — drifting like white foam, coming to rest.",8,"N4",0)
k("映",["reflect","project","film"],["エイ"],["うつ(す)","は(える)"],
  [ex("映画","えいが","movie"),ex("映す","うつす","to reflect"),ex("上映","じょうえい","showing a film")],
  "reflect","Sun (日) + center (央) — light at the center, projecting.",9,"N4",0)
k("画",["picture","painting","plan"],["ガ","カク"],["えが(く)"],
  [ex("映画","えいが","movie"),ex("絵画","かいが","painting"),ex("計画","けいかく","plan")],
  "picture","A brush tracing a field (田) border — drawing a plan.",8,"N4",2)
k("歌",["song","sing"],["カ"],["うた","うた(う)"],
  [ex("歌う","うたう","to sing"),ex("歌手","かしゅ","singer"),ex("歌詞","かし","song lyrics")],
  "song","A person (可) yawning (欠) with breath — exhaling in song.",14,"N4",2)
k("字",["character","letter","writing"],["ジ"],["あざ"],
  [ex("漢字","かんじ","kanji"),ex("文字","もじ","character, letter"),ex("数字","すうじ","numeral")],
  "character","A child (子) under a roof — a child learning letters at home.",6,"N4",1)
k("文",["sentence","writing","culture"],["ブン","モン"],["ふみ"],
  [ex("文章","ぶんしょう","sentence, text"),ex("文化","ぶんか","culture"),ex("作文","さくぶん","composition")],
  "sentence","Crossed strokes forming a pattern — a decorative mark, then writing.",4,"N4",1)
k("意",["meaning","intention","mind"],["イ"],[],
  [ex("意味","いみ","meaning"),ex("意見","いけん","opinion"),ex("注意","ちゅうい","caution")],
  "intention","Sound (音) over heart (心) — what the heart sounds like, intention.",13,"N4",3)
k("味",["taste","flavor","meaning"],["ミ"],["あじ"],
  [ex("意味","いみ","meaning"),ex("味","あじ","taste"),ex("趣味","しゅみ","hobby")],
  "flavor","Mouth (口) + not yet ripe (未) — savoring something not yet familiar.",8,"N4",3)
k("思",["think"],["シ"],["おも(う)"],
  [ex("思う","おもう","to think, feel"),ex("思い出","おもいで","memory"),ex("思想","しそう","thought, ideology")],
  "think","Field (田) over heart (心) — seeds of thought planted in the heart.",9,"N4",2)
k("考",["think","consider"],["コウ"],["かんが(える)"],
  [ex("考える","かんがえる","to think"),ex("参考","さんこう","reference"),ex("考え方","かんがえかた","way of thinking")],
  "consider","Old man (耂) bending — an elder stooping in deep thought.",6,"N4",2)
k("知",["know"],["チ"],["し(る)"],
  [ex("知る","しる","to know"),ex("知識","ちしき","knowledge"),ex("知人","ちじん","acquaintance")],
  "know","Arrow (矢) + mouth (口) — shooting straight words, knowing.",8,"N4",2)
k("覚",["memorize","awaken","feel"],["カク"],["おぼ(える)","さ(める)"],
  [ex("覚える","おぼえる","to memorize"),ex("目が覚める","めがさめる","to wake up"),ex("感覚","かんかく","sense, feeling")],
  "memorize","Studying hands (学 top) over see (見) — seeing to learn and remember.",12,"N4",4)
k("忙",["busy"],["ボウ","モウ"],["いそが(しい)"],
  [ex("忙しい","いそがしい","busy"),ex("多忙","たぼう","very busy"),ex("繁忙","はんぼう","busy period")],
  "busy","Heart (忄) + lost/die (亡) — heart overwhelmed, too busy to think.",6,"N4",0)
k("疲",["tired"],["ヒ"],["つか(れる)"],
  [ex("疲れる","つかれる","to get tired"),ex("疲労","ひろう","fatigue"),ex("疲れた","つかれた","I'm tired")],
  "tired","Illness (疒) + skin/hide (皮) — worn down to the skin, tired.",10,"N4",0)
k("困",["troubled","困る"],["コン"],["こま(る)"],
  [ex("困る","こまる","to be troubled"),ex("困難","こんなん","difficulty"),ex("困惑","こんわく","perplexed")],
  "troubled","A tree (木) boxed in (囗) — a tree trapped, in trouble.",7,"N4",0)
k("急",["urgent","hurry","sudden"],["キュウ"],["いそ(ぐ)"],
  [ex("急ぐ","いそぐ","to hurry"),ex("急行","きゅうこう","express train"),ex("急に","きゅうに","suddenly")],
  "urgent","Hand gripping a heart (心) — squeezing the heart in urgency.",9,"N4",3)
k("楽",["fun","music","ease"],["ガク","ラク"],["たの(しい)"],
  [ex("楽しい","たのしい","fun"),ex("音楽","おんがく","music"),ex("気楽","きらく","relaxed")],
  "fun","A tree (木) with bells (白×2) — a musical tree, joyful.",13,"N4",2)
k("悲",["sad","grief"],["ヒ"],["かな(しい)"],
  [ex("悲しい","かなしい","sad"),ex("悲劇","ひげき","tragedy"),ex("悲しみ","かなしみ","sadness")],
  "sad","Not (非) in the heart (心) — the heart saying 'no more,' sad.",12,"N4",0)
k("怒",["angry","anger"],["ド","ヌ"],["おこ(る)","いか(る)"],
  [ex("怒る","おこる","to get angry"),ex("怒り","いかり","anger"),ex("激怒","げきど","fury")],
  "angry","A woman (女) + heart (心) enslaved (奴) — enslaved emotions, anger.",9,"N4",0)
k("心",["heart","mind","spirit"],["シン"],["こころ"],
  [ex("心","こころ","heart, mind"),ex("心配","しんぱい","worry"),ex("安心","あんしん","relief")],
  "heart","The shape of a human heart — the seat of emotions.",4,"N4",2)
k("配",["distribute","worry"],["ハイ"],["くば(る)"],
  [ex("配る","くばる","to distribute"),ex("心配","しんぱい","worry"),ex("配達","はいたつ","delivery")],
  "distribute","Wine jar (酉) + a kneeling person (己) — serving wine, distributing.",10,"N4",0)
k("注",["pour","note","caution"],["チュウ"],["そそ(ぐ)","つ(ぐ)"],
  [ex("注意","ちゅうい","caution"),ex("注文","ちゅうもん","order"),ex("注射","ちゅうしゃ","injection")],
  "pour","Water (氵) + master (主) — the master pouring, directing attention.",8,"N4",3)
k("号",["number","issue","name"],["ゴウ"],[],
  [ex("番号","ばんごう","number"),ex("号外","ごうがい","special edition"),ex("信号","しんごう","traffic signal")],
  "number","A mouth (口) calling out with a long breath — calling a number.",5,"N4",3)
k("番",["number","turn","guard"],["バン"],[],
  [ex("番号","ばんごう","number"),ex("一番","いちばん","number one"),ex("番組","ばんぐみ","TV program")],
  "turn","Fields (番) with feet — fields taken in turns.",12,"N4",2)
k("線",["line"],["セン"],[],
  [ex("電車の線","でんしゃのせん","train line"),ex("新幹線","しんかんせん","Shinkansen"),ex("線路","せんろ","railroad track")],
  "line","Thread (糸) + spring water (泉) — a thread flowing like a line.",15,"N4",2)
k("鉄",["iron","rail"],["テツ"],[],
  [ex("地下鉄","ちかてつ","subway"),ex("鉄道","てつどう","railroad"),ex("鉄橋","てっきょう","iron bridge")],
  "iron","Metal (金) + lose (失) — metal that rusts and is lost, iron.",13,"N4",3)
k("港",["harbor","port"],["コウ"],["みなと"],
  [ex("空港","くうこう","airport"),ex("港","みなと","harbor, port"),ex("横浜港","よこはまこう","Yokohama port")],
  "harbor","Water (氵) + common (巷) — where all vessels commonly gather.",12,"N4",3)
k("旅",["travel","trip"],["リョ"],["たび"],
  [ex("旅行","りょこう","travel"),ex("旅館","りょかん","Japanese inn"),ex("旅人","たびびと","traveler")],
  "travel","A banner (方) with a person following — marching on a journey.",10,"N4",3)
k("荷",["luggage","load"],["カ"],["に"],
  [ex("荷物","にもつ","luggage"),ex("入荷","にゅうか","receiving goods"),ex("出荷","しゅっか","shipping out")],
  "luggage","Grass (艹) + what/burden (何) — plants bundled for carrying.",10,"N4",0)
k("物",["thing","object","matter"],["ブツ","モツ"],["もの"],
  [ex("動物","どうぶつ","animal"),ex("食べ物","たべもの","food"),ex("荷物","にもつ","luggage")],
  "thing","Cow (牛) + a waving banner (勿) — a cow marked as a distinct thing.",8,"N4",3)
k("品",["goods","item","quality"],["ヒン","ホン"],["しな"],
  [ex("品物","しなもの","goods, item"),ex("品質","ひんしつ","quality"),ex("作品","さくひん","work, piece")],
  "goods","Three mouths (口×3) — multiple items calling for attention.",9,"N4",3)
k("屋",["shop","roof","person"],["オク"],["や"],
  [ex("部屋","へや","room"),ex("肉屋","にくや","butcher shop"),ex("本屋","ほんや","bookstore")],
  "shop","Corpse/roof (尸) + at (至) — where one arrives under a roof, a shop.",9,"N4",3)
k("店",["shop","store"],["テン"],["みせ"],
  [ex("お店","おみせ","shop"),ex("本店","ほんてん","main store"),ex("喫茶店","きっさてん","café")],
  "store","Shelter (广) + to divine (占) — choosing a spot under a roof for a store.",8,"N4",2)
k("市",["city","market"],["シ"],["いち"],
  [ex("東京都","とうきょうと","Tokyo Metropolis"),ex("市場","いちば","market"),ex("市民","しみん","citizen")],
  "city","A cloth banner (巾) on a stem — a banner marking a market.",5,"N4",2)
k("町",["town","city block"],["チョウ"],["まち"],
  [ex("町","まち","town"),ex("下町","したまち","downtown"),ex("町内会","ちょうないかい","neighborhood association")],
  "town","A rice field (田) + nail/boundary (丁) — a bounded farming settlement.",7,"N4",1)
k("村",["village"],["ソン"],["むら"],
  [ex("村","むら","village"),ex("農村","のうそん","farming village"),ex("村人","むらびと","villager")],
  "village","Tree (木) + inch/measurement (寸) — a measured wood settlement.",7,"N4",1)
k("県",["prefecture"],["ケン"],[],
  [ex("都道府県","とどうふけん","prefectures"),ex("県庁","けんちょう","prefectural office"),ex("他県","たけん","another prefecture")],
  "prefecture","A vertical thread (系) hanging down — a hanging display of a region.",9,"N4",3)
k("都",["capital","metropolitan"],["ト","ツ"],["みやこ"],
  [ex("東京都","とうきょうと","Tokyo Metropolis"),ex("都心","としん","city center"),ex("都合","つごう","convenience")],
  "capital","Many people (者) + city (阝) — many people at the capital city.",11,"N4",3)
k("番",["number","turn"],["バン"],[],
  [ex("番号","ばんごう","number"),ex("一番","いちばん","number one"),ex("番組","ばんぐみ","TV program")],
  "number","A field (田) and feet — taking turns in the field.",12,"N4",2)
k("週",["week"],["シュウ"],[],
  [ex("今週","こんしゅう","this week"),ex("先週","せんしゅう","last week"),ex("毎週","まいしゅう","every week")],
  "week","Walk (辶) + cycle (周) — cycling through the days of the week.",11,"N4",2)
k("曜",["day of the week"],["ヨウ"],[],
  [ex("月曜日","げつようび","Monday"),ex("曜日","ようび","day of the week"),ex("日曜日","にちようび","Sunday")],
  "weekday","Sun (日) + feathered wings (翟) — the sun cycling on its wings.",18,"N4",2)
k("朝",["morning"],["チョウ"],["あさ"],
  [ex("朝","あさ","morning"),ex("毎朝","まいあさ","every morning"),ex("朝ご飯","あさごはん","breakfast")],
  "morning","The sun rising between the reeds — early morning.",12,"N4",2)
k("昼",["noon","daytime"],["チュウ"],["ひる"],
  [ex("昼","ひる","noon, daytime"),ex("昼ご飯","ひるごはん","lunch"),ex("昼間","ひるま","daytime")],
  "noon","A finger pointing to the sun at its peak — high noon.",9,"N4",2)
k("夜",["night"],["ヤ"],["よる","よ"],
  [ex("夜","よる","night"),ex("今夜","こんや","tonight"),ex("夜中","よなか","midnight")],
  "night","Evening (夕) with a person and a cover — tucked in for the night.",8,"N4",2)
k("昨",["yesterday","previous"],["サク"],[],
  [ex("昨日","きのう","yesterday"),ex("昨年","さくねん","last year"),ex("昨夜","さくや","last night")],
  "yesterday","Sun (日) + cut/made (乍) — the day that was cut off.",9,"N4",4)
k("末",["end","tip"],["マツ","バツ"],["すえ"],
  [ex("週末","しゅうまつ","weekend"),ex("月末","げつまつ","end of the month"),ex("年末","ねんまつ","year-end")],
  "end","A tree (木) with a mark at the top — the end, the tip.",5,"N4",4)
k("初",["first","beginning"],["ショ"],["はじ(め)","はつ"],
  [ex("初めて","はじめて","for the first time"),ex("最初","さいしょ","the very first"),ex("初日","はつひ","first day")],
  "first","Clothing (衤) beside a knife (刀) — cutting cloth is the first step in sewing.",7,"N4",4)
k("以",["by means of","because"],["イ"],[],
  [ex("以上","いじょう","more than, above"),ex("以下","いか","below, less than"),ex("以外","いがい","other than")],
  "by means of","A plow (耒 simplified) with a person — using a tool, by means of.",5,"N4",4)
k("特",["special"],["トク"],[],
  [ex("特別","とくべつ","special"),ex("特急","とっきゅう","limited express"),ex("特に","とくに","especially")],
  "special","Cow (牛) + temple (寺) — a bull kept at the temple for special ceremonies.",10,"N4",4)
k("別",["separate","different","another"],["ベツ"],["わか(れる)"],
  [ex("別れる","わかれる","to part ways"),ex("特別","とくべつ","special"),ex("別々","べつべつ","separately")],
  "separate","Another piece (刂) cut by a knife — divided and separate.",7,"N4",4)
k("同",["same","together"],["ドウ"],["おな(じ)"],
  [ex("同じ","おなじ","same"),ex("同僚","どうりょう","colleague"),ex("共同","きょうどう","joint, cooperative")],
  "same","A mouth (口) inside a shared enclosure (冂) — all saying the same thing.",6,"N4",2)
k("以",["by means of"],["イ"],[],
  [ex("以上","いじょう","above, more than"),ex("以下","いか","below"),ex("以外","いがい","except for")],
  "by means of","Person (人) + plow (耒 simplified) — using a person as a means.",5,"N4",4)
k("両",["both"],["リョウ"],[],
  [ex("両方","りょうほう","both sides"),ex("両親","りょうしん","both parents"),ex("両手","りょうて","both hands")],
  "both","A scale bar with weights on each side — both sides balanced.",6,"N4",3)
k("有",["exist","have","exist"],["ユウ","ウ"],["あ(る)"],
  [ex("有名","ゆうめい","famous"),ex("有る","ある","to exist"),ex("所有","しょゆう","ownership")],
  "have","A hand (ナ) holding meat (月) — having something in hand.",6,"N4",3)
k("無",["nothing","without","nothingness"],["ム","ブ"],["な(い)"],
  [ex("無理","むり","unreasonable, impossible"),ex("無駄","むだ","waste"),ex("無料","むりょう","free of charge")],
  "nothing","Flames consuming (灬) a figure — burning away to nothing.",12,"N4",4)
k("多",["many","much"],["タ"],["おお(い)"],
  [ex("多い","おおい","many, much"),ex("多分","たぶん","probably"),ex("多くの","おおくの","many")],
  "many","Two moons (夕×2) — when the moon appears twice, time passes, things accumulate.",6,"N4",2)
k("少",["few","little"],["ショウ"],["すく(ない)","すこ(し)"],
  [ex("少ない","すくない","few"),ex("少し","すこし","a little"),ex("少年","しょうねん","boy, youth")],
  "few","Small (小) + a tilting stroke — something small made smaller.",4,"N4",2)
k("安",["cheap","peaceful","safe"],["アン"],["やす(い)","やす(らか)"],
  [ex("安い","やすい","cheap"),ex("安心","あんしん","peace of mind"),ex("安全","あんぜん","safety")],
  "peaceful","A woman (女) under a roof (宀) — a woman safe at home.",6,"N4",3)
k("高",["high","tall","expensive"],["コウ"],["たか(い)"],
  [ex("高い","たかい","high, expensive"),ex("高校","こうこう","high school"),ex("最高","さいこう","the best")],
  "high","A tall tower on a base — towering high.",10,"N4",2)
k("低",["low","short"],["テイ"],["ひく(い)"],
  [ex("低い","ひくい","low"),ex("低温","ていおん","low temperature"),ex("最低","さいてい","the worst, minimum")],
  "low","Person (亻) crouching with a stick — bowing down low.",7,"N4",0)
k("長",["long","leader","chief"],["チョウ"],["なが(い)"],
  [ex("長い","ながい","long"),ex("校長","こうちょう","principal"),ex("社長","しゃちょう","company president")],
  "long","Long hair flowing — an elder with long hair.",8,"N4",2)
k("短",["short"],["タン"],["みじか(い)"],
  [ex("短い","みじかい","short"),ex("短所","たんしょ","shortcoming"),ex("短期","たんき","short-term")],
  "short","Arrow (矢) + bean/small (豆) — a short arrow that hits nearby.",12,"N4",3)
k("新",["new"],["シン"],["あたら(しい)","にい"],
  [ex("新しい","あたらしい","new"),ex("新幹線","しんかんせん","Shinkansen"),ex("新聞","しんぶん","newspaper")],
  "new","Standing timber (立木) + axe (斤) — freshly chopped wood, new.",13,"N4",2)
k("古",["old"],["コ"],["ふる(い)"],
  [ex("古い","ふるい","old"),ex("古典","こてん","classic"),ex("古着","ふるぎ","secondhand clothing")],
  "old","Ten (十) mouths (口) — ten generations of mouths passing stories, old.",5,"N4",2)
k("明",["bright","clear","next"],["メイ","ミョウ"],["あか(るい)","あ(ける)"],
  [ex("明るい","あかるい","bright"),ex("明日","あした","tomorrow"),ex("説明","せつめい","explanation")],
  "bright","Sun (日) + moon (月) — both luminaries together, very bright.",8,"N4",2)
k("暗",["dark"],["アン"],["くら(い)"],
  [ex("暗い","くらい","dark"),ex("暗記","あんき","memorization"),ex("暗号","あんごう","cipher")],
  "dark","Sun (日) + sound barrier (音) — the sun blocked, darkness.",13,"N4",3)
k("太",["fat","thick"],["タイ","タ"],["ふと(い)"],
  [ex("太い","ふとい","thick, fat"),ex("太陽","たいよう","the sun"),ex("太平洋","たいへいよう","Pacific Ocean")],
  "fat","Big (大) with an extra dot — just a bit bigger, thick.",4,"N4",4)
k("細",["thin","fine","detailed"],["サイ"],["ほそ(い)","こま(かい)"],
  [ex("細い","ほそい","thin"),ex("詳細","しょうさい","details"),ex("細かい","こまかい","detailed, fine")],
  "thin","Thread (糸) + a field (田) — threads thin as a hairline.",11,"N4",4)
k("平",["flat","peace","ordinary"],["ヘイ","ビョウ"],["たい(ら)","ひら"],
  [ex("平和","へいわ","peace"),ex("平日","へいじつ","weekday"),ex("平ら","たいら","flat")],
  "flat","A scale beam perfectly level — flat and balanced.",5,"N4",3)
k("和",["harmony","Japan","sum"],["ワ","オ"],["やわ(らぐ)"],
  [ex("平和","へいわ","peace"),ex("和食","わしょく","Japanese food"),ex("和室","わしつ","Japanese-style room")],
  "harmony","Grain stalk (禾) + mouth (口) — all mouths fed, harmony.",8,"N4",3)
k("様",["manner","Mr./Ms.","appearance"],["ヨウ"],["さま"],
  [ex("お客様","おきゃくさま","customer (honorific)"),ex("様子","ようす","situation, appearance"),ex("神様","かみさま","god (honorific)")],
  "manner","Tree (木) + sheep (羊) + water (氵) — layered beauty, an elegant appearance.",14,"N4",4)
k("方",["direction","person","way"],["ホウ"],["かた","ほう"],
  [ex("方法","ほうほう","method"),ex("方向","ほうこう","direction"),ex("一方","いっぽう","one side")],
  "direction","A handle on a rod pointing in a direction.",4,"N4",2)
k("代",["generation","substitute","cost"],["ダイ","タイ"],["か(わる)","よ"],
  [ex("時代","じだい","era, period"),ex("代わる","かわる","to substitute"),ex("代金","だいきん","price, fee")],
  "generation","Person (亻) + weapon/change (弋) — replacing one generation with the next.",5,"N4",3)
k("回",["times","rotate","return"],["カイ","エ"],["まわ(る)"],
  [ex("一回","いっかい","one time"),ex("回る","まわる","to turn"),ex("今回","こんかい","this time")],
  "rotate","A swirl inside a square — rotating, going around.",6,"N4",2)
k("話",["speak","story"],["ワ"],["はな(す)"],
  [ex("話す","はなす","to speak"),ex("電話","でんわ","telephone"),ex("話し合い","はなしあい","discussion")],
  "speak","Words (言) + tongue (舌) — the tongue making words.",13,"N5",2)
k("当",["hit","this","apt"],["トウ"],["あ(たる)","あ(てる)"],
  [ex("当たる","あたる","to hit"),ex("当然","とうぜん","natural, obvious"),ex("本当","ほんとう","truth")],
  "hit","A hand aiming at (⺌) over a field (田) — hitting the target.",6,"N4",2)
k("点",["point","dot","score"],["テン"],[],
  [ex("点数","てんすう","score"),ex("欠点","けってん","fault"),ex("出発点","しゅっぱつてん","starting point")],
  "point","A fire (灬) + black dot (占) — a burning point, a mark.",9,"N4",3)
k("活",["lively","live","activity"],["カツ"],[],
  [ex("生活","せいかつ","daily life"),ex("活動","かつどう","activity"),ex("活発","かっぱつ","lively, active")],
  "lively","Water (氵) + tongue (舌) — water flowing freely, full of life.",9,"N4",4)
k("動",["move"],["ドウ"],["うご(く)","うご(かす)"],
  [ex("動く","うごく","to move"),ex("運動","うんどう","exercise"),ex("自動","じどう","automatic")],
  "move","Heavy (重) + strength/force (力) — applying force to move something heavy.",11,"N4",3)
k("働",["work","labor"],["ドウ"],["はたら(く)"],
  [ex("働く","はたらく","to work"),ex("労働","ろうどう","labor"),ex("共働き","ともばたらき","dual income")],
  "work","Person (亻) who moves (動) — one who moves is one who works.",13,"N4",4)
k("始",["begin","start"],["シ"],["はじ(める)","はじ(まる)"],
  [ex("始まる","はじまる","to begin"),ex("始める","はじめる","to start"),ex("開始","かいし","commencement")],
  "begin","Woman (女) + platform (台) — a woman standing on a platform to begin.",8,"N4",3)
k("終",["end","finish"],["シュウ"],["お(わる)","お(える)"],
  [ex("終わる","おわる","to end"),ex("最終","さいしゅう","last, final"),ex("終了","しゅうりょう","completion")],
  "end","Thread (糸) + winter/end (冬) — thread running out at winter's end.",11,"N4",3)
k("続",["continue"],["ゾク"],["つづ(く)","つづ(ける)"],
  [ex("続く","つづく","to continue"),ex("続ける","つづける","to keep doing"),ex("手続き","てつづき","procedure")],
  "continue","Thread (糸) + sell (売) — selling thread continuously.",13,"N4",4)
k("切",["cut"],["セツ","サイ"],["き(る)","き(れる)"],
  [ex("切る","きる","to cut"),ex("大切","たいせつ","important"),ex("切符","きっぷ","ticket")],
  "cut","Seven (七) + knife (刀) — seven strokes of the knife.",4,"N4",2)
k("死",["die","death"],["シ"],["し(ぬ)"],
  [ex("死ぬ","しぬ","to die"),ex("死亡","しぼう","death"),ex("必死","ひっし","desperate")],
  "death","Bones (歹) + person kneeling (匕) — a person bowing before death.",6,"N4",3)
k("医",["medicine","doctor"],["イ"],[],
  [ex("医者","いしゃ","doctor"),ex("医学","いがく","medicine (study)"),ex("医院","いいん","clinic")],
  "medicine","Quiver (匸) of arrows + a hand — reaching into the quiver of remedies.",7,"N4",3)
k("病",["illness","sick"],["ビョウ","ヘイ"],["や(む)","やまい"],
  [ex("病気","びょうき","illness"),ex("病院","びょういん","hospital"),ex("看病","かんびょう","nursing")],
  "illness","Illness radical (疒) + ice (丙) — fever with chills, illness.",10,"N4",3)
k("院",["institution","hospital"],["イン"],[],
  [ex("病院","びょういん","hospital"),ex("大学院","だいがくいん","graduate school"),ex("美容院","びよういん","beauty salon")],
  "institution","Hill/wall (阝) + complete (完) — a walled complete establishment.",10,"N4",3)
k("薬",["medicine","drug"],["ヤク"],["くすり"],
  [ex("薬","くすり","medicine"),ex("薬局","やっきょく","pharmacy"),ex("薬品","やくひん","chemical")],
  "medicine","Grass (艹) + music/pleasure (楽) — healing herbs that bring pleasure.",16,"N4",3)
k("痛",["pain","hurt","ache"],["ツウ"],["いた(い)","いた(む)"],
  [ex("痛い","いたい","painful"),ex("頭痛","ずつう","headache"),ex("腹痛","ふくつう","stomachache")],
  "pain","Illness (疒) + pass through (甬) — pain shooting through.",12,"N4",0)
k("頭",["head"],["ズ","トウ"],["あたま"],
  [ex("頭","あたま","head"),ex("頭痛","ずつう","headache"),ex("先頭","せんとう","lead, front")],
  "head","A bean (豆) + page/head (頁) — the roundness of a head.",16,"N4",2)
k("顔",["face"],["ガン"],["かお"],
  [ex("顔","かお","face"),ex("笑顔","えがお","smiling face"),ex("顔色","かおいろ","complexion")],
  "face","Standing figure (彦) + page/head (頁) — the distinguished markings of a face.",18,"N4",4)
k("体",["body"],["タイ","テイ"],["からだ"],
  [ex("体","からだ","body"),ex("体育","たいいく","physical education"),ex("体重","たいじゅう","body weight")],
  "body","Person (亻) + root/main (本) — the main substance of a person.",7,"N4",2)
k("歯",["tooth"],["シ"],["は"],
  [ex("歯","は","tooth"),ex("歯医者","はいしゃ","dentist"),ex("歯ブラシ","はブラシ","toothbrush")],
  "tooth","Stop (止) + rice/molar (米) — the molars that stop food from moving.",12,"N4",3)
k("首",["neck","head (of org.)"],["シュ"],["くび"],
  [ex("首","くび","neck"),ex("首都","しゅと","capital city"),ex("首相","しゅしょう","prime minister")],
  "neck","A head with hair — the neck and head.",9,"N4",2)
k("声",["voice","sound"],["セイ","ショウ"],["こえ"],
  [ex("声","こえ","voice"),ex("大声","おおごえ","loud voice"),ex("声優","せいゆう","voice actor")],
  "voice","A musical instrument (殸) simplified — the sound a person makes.",7,"N4",2)
k("色",["color"],["ショク","シキ"],["いろ"],
  [ex("色","いろ","color"),ex("景色","けしき","scenery"),ex("色々","いろいろ","various")],
  "color","A person (人) kneeling with a cover — blushing, showing one's colors.",6,"N4",2)
k("形",["shape","form"],["ケイ","ギョウ"],["かたち","かた"],
  [ex("形","かたち","shape"),ex("人形","にんぎょう","doll"),ex("図形","ずけい","geometric figure")],
  "shape","Three flowing strokes + page — a decorative, formed shape.",7,"N4",2)
k("向",["face","direction"],["コウ"],["む(く)","む(ける)"],
  [ex("方向","ほうこう","direction"),ex("向かう","むかう","to face"),ex("向こう","むこう","over there")],
  "face toward","A window (囗) with an opening (口) — turned to face out.",6,"N4",3)
k("歩",["walk","step"],["ホ","ブ"],["ある(く)","あゆ(む)"],
  [ex("歩く","あるく","to walk"),ex("散歩","さんぽ","walk, stroll"),ex("歩道","ほどう","sidewalk")],
  "walk","Stop (止) + a trailing foot — footsteps, walking.",8,"N4",2)
k("走",["run"],["ソウ"],["はし(る)"],
  [ex("走る","はしる","to run"),ex("走り回る","はしりまわる","to run around"),ex("競走","きょうそう","race")],
  "run","A person (土 shape) with feet striding — running.",7,"N4",2)
k("泳",["swim"],["エイ"],["およ(ぐ)"],
  [ex("泳ぐ","およぐ","to swim"),ex("水泳","すいえい","swimming"),ex("背泳ぎ","せおよぎ","backstroke")],
  "swim","Water (氵) + eternal/long (永) — moving through water at length.",8,"N4",0)
k("飛",["fly"],["ヒ"],["と(ぶ)"],
  [ex("飛ぶ","とぶ","to fly"),ex("飛行機","ひこうき","airplane"),ex("飛行場","ひこうじょう","airfield")],
  "fly","Wings spread wide — a bird in flight.",9,"N4",4)
k("降",["descend","fall","get off"],["コウ"],["お(りる)","ふ(る)"],
  [ex("降りる","おりる","to get off"),ex("雨が降る","あめがふる","it rains"),ex("下降","かこう","descent")],
  "descend","Hill (阝) + a footprint heading down — stepping down from a hill.",10,"N4",3)
k("乗",["ride","board"],["ジョウ"],["の(る)","の(せる)"],
  [ex("乗る","のる","to ride"),ex("乗り物","のりもの","vehicle"),ex("乗り換え","のりかえ","transfer")],
  "ride","A person (大) on top of a tree (木) — riding high.",9,"N4",3)
k("引",["pull","attract"],["イン"],["ひ(く)"],
  [ex("引く","ひく","to pull"),ex("引越し","ひっこし","moving house"),ex("割引","わりびき","discount")],
  "pull","A bow (弓) with an arrow — drawing back a bowstring.",4,"N4",2)
k("押",["push"],["オウ"],["お(す)"],
  [ex("押す","おす","to push"),ex("押し入れ","おしいれ","closet"),ex("押収","おうしゅう","seizure")],
  "push","Hand (扌) + a figure pressed against a wall (甲) — pushing hard.",8,"N4",0)
k("開",["open"],["カイ"],["あ(ける)","ひら(く)"],
  [ex("開ける","あける","to open"),ex("開店","かいてん","store opening"),ex("公開","こうかい","public release")],
  "open","Two hands (廾) opening a gate bar (门) — opening a gate.",12,"N4",3)
k("閉",["close","shut"],["ヘイ"],["し(める)","と(じる)"],
  [ex("閉める","しめる","to close"),ex("閉店","へいてん","store closing"),ex("密閉","みっぺい","airtight seal")],
  "close","A gate (門) with a bolt (才) — bolting the gate shut.",11,"N4",3)
k("作",["make","create"],["サク","サ"],["つく(る)"],
  [ex("作る","つくる","to make"),ex("作品","さくひん","work, piece"),ex("作業","さぎょう","work, task")],
  "make","Person (亻) + cutting (乍) — a person cutting and shaping things.",7,"N4",2)
k("集",["gather","collect"],["シュウ"],["あつ(まる)","あつ(める)"],
  [ex("集まる","あつまる","to gather"),ex("集める","あつめる","to collect"),ex("文集","ぶんしゅう","anthology")],
  "gather","Birds (隹×3) in a tree — many birds gathering in one tree.",12,"N4",3)
k("合",["combine","suit","agree"],["ゴウ","ガッ"],["あ(う)"],
  [ex("合う","あう","to suit, to match"),ex("場合","ばあい","case, situation"),ex("試合","しあい","match, game")],
  "combine","A lid fitting over a mouth (口) — fitting together, combining.",6,"N4",2)
k("入",["enter","put in"],["ニュウ"],["い(る)","はい(る)"],
  [ex("入る","はいる","to enter"),ex("入口","いりぐち","entrance"),ex("入学","にゅうがく","enrollment")],
  "enter","Two strokes converging inward — pointing into an opening.",2,"N5",1)
k("出",["exit","go out","come out"],["シュツ","スイ"],["で(る)","だ(す)"],
  [ex("出る","でる","to come out"),ex("出口","でぐち","exit"),ex("出発","しゅっぱつ","departure")],
  "exit","A foot stepping over a threshold — going out.",5,"N4",1)
k("教",["teach","doctrine"],["キョウ"],["おし(える)","おそ(わる)"],
  [ex("教える","おしえる","to teach"),ex("教室","きょうしつ","classroom"),ex("宗教","しゅうきょう","religion")],
  "teach","Filial piety (孝) with a striking rod — using force to instill lessons.",11,"N4",2)
k("室",["room"],["シツ"],["むろ"],
  [ex("教室","きょうしつ","classroom"),ex("洋室","ようしつ","Western-style room"),ex("室内","しつない","indoors")],
  "room","Roof (宀) + arrive (至) — reaching the shelter, a room.",9,"N4",3)
k("広",["wide","spacious"],["コウ"],["ひろ(い)"],
  [ex("広い","ひろい","wide"),ex("広場","ひろば","plaza, square"),ex("広告","こうこく","advertisement")],
  "wide","A shelter (广) with only space inside — wide open.",5,"N4",2)
k("台",["stand","platform","counter for machines"],["ダイ","タイ"],["うてな"],
  [ex("台所","だいどころ","kitchen"),ex("台風","たいふう","typhoon"),ex("舞台","ぶたい","stage")],
  "platform","A mouth (口) on legs — a stand someone speaks from.",5,"N4",2)
k("全",["all","complete","whole"],["ゼン"],["すべ(て)","まった(く)"],
  [ex("全部","ぜんぶ","all"),ex("全員","ぜんいん","all members"),ex("完全","かんぜん","perfect")],
  "whole","A king (王) under a roof — completing the whole domain.",6,"N4",3)
k("半",["half"],["ハン"],["なか(ば)"],
  [ex("半分","はんぶん","half"),ex("一時半","いちじはん","one thirty"),ex("前半","ぜんはん","first half")],
  "half","A vertical stroke splitting a horizontal in two — cut in half.",5,"N5",2)
k("曲",["music","bend","melody"],["キョク"],["ま(がる)"],
  [ex("音楽","おんがく","music"),ex("曲がる","まがる","to turn, bend"),ex("作曲","さっきょく","musical composition")],
  "melody","A ruler bent at both ends — a bent form, a melody.",6,"N4",3)
k("言",["say","word","speech"],["ゲン","ゴン"],["い(う)","こと"],
  [ex("言う","いう","to say"),ex("言葉","ことば","word, language"),ex("言語","げんご","language")],
  "say","A mouth (口) with two strokes of speech — speaking.",7,"N4",2)
k("聞",["hear","ask"],["ブン","モン"],["き(く)"],
  [ex("聞く","きく","to hear, ask"),ex("新聞","しんぶん","newspaper"),ex("聞こえる","きこえる","audible")],
  "hear","Ear (耳) at a gate (門) — listening at the door.",14,"N5",2)
k("読",["read"],["ドク"],["よ(む)"],
  [ex("読む","よむ","to read"),ex("読書","どくしょ","reading"),ex("読み物","よみもの","reading material")],
  "read","Words (言) + sold (売) — paying attention to what is written.",14,"N5",2)
k("英",["England","excellent","hero"],["エイ"],[],
  [ex("英語","えいご","English"),ex("英国","えいこく","United Kingdom"),ex("英雄","えいゆう","hero")],
  "England","Grass (艹) + center (央) — a brilliant flower at the center.",8,"N4",4)
k("語",["language","word","tell"],["ゴ"],["かた(る)"],
  [ex("日本語","にほんご","Japanese"),ex("物語","ものがたり","story, tale"),ex("語る","かたる","to narrate")],
  "language","Words (言) + I/myself (吾) — the words that express myself.",14,"N5",2)
k("漢",["Chinese character","Han"],["カン"],[],
  [ex("漢字","かんじ","kanji"),ex("漢方","かんぽう","Chinese medicine"),ex("漢文","かんぶん","classical Chinese")],
  "Chinese","Water (氵) + a Han warrior (𦰩) — the Han river, the Han people.",13,"N4",0)
k("習",["learn","practice"],["シュウ"],["なら(う)"],
  [ex("習う","ならう","to learn"),ex("練習","れんしゅう","practice"),ex("自習","じしゅう","self-study")],
  "learn","Wings (羽) over white (白) — practicing flapping, drilling.",11,"N4",3)

print(f"Loaded {len(K)} kanji entries")

# ── Extra kanji needed for Genki 2 existing 82 ────────────────────────────────
k("鳥",["bird"],["チョウ"],["とり"],
  [ex("鳥","とり","bird"),ex("小鳥","ことり","small bird"),ex("野鳥","やちょう","wild bird")],
  "bird","A bird perched on a branch — the profile of a bird.",11,"N4",2)
k("料",["fee","material","ingredient"],["リョウ"],[],
  [ex("料理","りょうり","cooking, dish"),ex("料金","りょうきん","fee, charge"),ex("無料","むりょう","free of charge")],
  "fee","Grain (米) measured with a ladle (斗) — measured ingredients, a fee.",10,"N4",4)
k("理",["reason","logic","manage"],["リ"],[],
  [ex("料理","りょうり","cooking"),ex("理由","りゆう","reason"),ex("管理","かんり","management")],
  "reason","King (王) + village (里) — the king's orderly management of the village.",11,"N4",2)
k("飯",["cooked rice","meal"],["ハン"],["めし"],
  [ex("ご飯","ごはん","cooked rice, meal"),ex("夕飯","ゆうはん","dinner"),ex("朝ご飯","あさごはん","breakfast")],
  "meal","Food (食) + return/turn (反) — food that is turned/worked over, cooked rice.",12,"N4",3)
k("肉",["meat","flesh"],["ニク"],[],
  [ex("肉","にく","meat"),ex("肉体","にくたい","body, flesh"),ex("牛肉","ぎゅうにく","beef")],
  "meat","A cut of meat on ribs — the shape of a piece of meat.",6,"N4",2)
k("悪",["bad","evil"],["アク","オ"],["わる(い)"],
  [ex("悪い","わるい","bad"),ex("悪魔","あくま","devil"),ex("最悪","さいあく","worst")],
  "bad","A heart (心) trapped under a cover (亜) — a heart in a bad place.",11,"N4",3)
k("海",["sea","ocean"],["カイ"],["うみ"],
  [ex("海","うみ","sea"),ex("海外","かいがい","overseas"),ex("日本海","にほんかい","Sea of Japan")],
  "sea","Water (氵) + mother (毎) — the mother of all waters, the sea.",9,"N4",2)
k("昔",["long ago","the past"],["セキ","シャク"],["むかし"],
  [ex("昔","むかし","long ago"),ex("昔話","むかしばなし","old tale"),ex("大昔","おおむかし","ancient times")],
  "long ago","Twenty days (廿) above the sun (日) — twenty days have passed, it was long ago.",8,"N3",3)
k("神",["god","deity","spirit"],["シン","ジン"],["かみ","かん"],
  [ex("神社","じんじゃ","Shinto shrine"),ex("神様","かみさま","god"),ex("精神","せいしん","spirit, mind")],
  "god","Altar (礻) beside lightning from the sky (申) — where the divine appears.",9,"N3",3)
k("度",["degree","time","counter for occurrences"],["ド","タク"],["たび"],
  [ex("一度","いちど","once"),ex("今度","こんど","this time"),ex("温度","おんど","temperature")],
  "degree","Under a shelter (广), a hand (又) measuring — a measured degree.",9,"N3",3)
k("赤",["red"],["セキ","シャク"],["あか","あか(い)"],
  [ex("赤い","あかい","red"),ex("赤ちゃん","あかちゃん","baby"),ex("赤外線","せきがいせん","infrared")],
  "red","Big person (大) + fire (灬) — a person in firelight, flushed red.",7,"N5",1)
k("青",["blue","green"],["セイ","ショウ"],["あお","あお(い)"],
  [ex("青い","あおい","blue"),ex("青春","せいしゅん","youth"),ex("青信号","あおしんごう","green light")],
  "blue","Growing plants (生) beneath the moon (月) — the blue-green of nature.",8,"N5",1)
k("白",["white"],["ハク","ビャク"],["しろ","しろ(い)"],
  [ex("白い","しろい","white"),ex("白紙","はくし","blank paper"),ex("白黒","しろくろ","black and white")],
  "white","The sun (日) with a ray — the first ray of white dawn.",5,"N5",1)
k("黒",["black"],["コク"],["くろ","くろ(い)"],
  [ex("黒い","くろい","black"),ex("黒板","こくばん","blackboard"),ex("白黒","しろくろ","black and white")],
  "black","Fire (灬) blackening a window (里) — soot-blackened darkness.",11,"N5",1)
k("去",["past","to leave","to go away"],["キョ","コ"],["さ(る)"],
  [ex("去年","きょねん","last year"),ex("過去","かこ","the past"),ex("去る","さる","to leave")],
  "past","A person (大) with a hiding lid — gone away, in the past.",5,"N4",3)
k("音",["sound","noise"],["オン","イン"],["おと","ね"],
  [ex("音楽","おんがく","music"),ex("音声","おんせい","voice, audio"),ex("音読み","おんよみ","on-reading")],
  "sound","The sun (日) rising — a standing (立) sun creates the sound of day.",9,"N4",1)
k("者",["person","one who"],["シャ"],["もの"],
  [ex("医者","いしゃ","doctor"),ex("記者","きしゃ","journalist"),ex("学者","がくしゃ","scholar")],
  "person (who)","Old person (老) simplified — a marked person, someone defined by a role.",8,"N4",3)
k("夏",["summer"],["カ","ゲ"],["なつ"],
  [ex("夏","なつ","summer"),ex("夏休み","なつやすみ","summer vacation"),ex("真夏","まなつ","midsummer")],
  "summer","A person (頁) with elaborate headdress dancing in the heat.",10,"N4",2)
k("魚",["fish"],["ギョ"],["さかな","うお"],
  [ex("魚","さかな","fish"),ex("金魚","きんぎょ","goldfish"),ex("魚屋","さかなや","fish shop")],
  "fish","A complete fish shape — head, body, fins, tail.",11,"N4",2)
k("寺",["temple"],["ジ"],["てら"],
  [ex("お寺","おてら","temple"),ex("寺院","じいん","temple"),ex("東大寺","とうだいじ","Todaiji Temple")],
  "temple","Ground (土) + a hand with measuring stick (寸) — a measured ground, a temple.",6,"N4",2)
k("風",["wind","style","appearance"],["フウ","フ"],["かぜ","かざ"],
  [ex("風","かぜ","wind"),ex("台風","たいふう","typhoon"),ex("風景","ふうけい","scenery")],
  "wind","A phoenix (鳳 simplified) — the wind like a great bird in motion.",9,"N4",2)
k("船",["ship","boat"],["セン"],["ふね","ふな"],
  [ex("船","ふね","ship, boat"),ex("船乗り","ふなのり","sailor"),ex("汽船","きせん","steamship")],
  "ship","A boat (舟) + lead (鉛 partial) — a large vessel.",11,"N4",2)
k("森",["forest","woods"],["シン"],["もり"],
  [ex("森","もり","forest"),ex("森林","しんりん","forest, woods"),ex("深い森","ふかいもり","deep forest")],
  "forest","Three trees (木×3) — many trees together, a forest.",12,"N4",1)
k("林",["grove","forest"],["リン"],["はやし"],
  [ex("林","はやし","woods, grove"),ex("森林","しんりん","forest"),ex("林道","りんどう","forest path")],
  "grove","Two trees (木×2) side by side — a small grove.",8,"N4",1)

# ── Additional Genki 2 kanji (beyond the 82 already in the app) ──────────────
k("映",["reflect","project","film"],["エイ"],["うつ(す)","は(える)"],
  [ex("映画","えいが","movie"),ex("映す","うつす","to reflect"),ex("上映","じょうえい","screening")],
  "reflect","Sun (日) + center (央) — light at the center, projecting outward.",9,"N4",0)
k("画",["picture","plan","stroke"],["ガ","カク"],["えが(く)"],
  [ex("映画","えいが","movie"),ex("計画","けいかく","plan"),ex("絵画","かいが","painting")],
  "picture","A brush tracing a field border — drawing a picture.",8,"N4",2)
k("歌",["song","sing"],["カ"],["うた","うた(う)"],
  [ex("歌う","うたう","to sing"),ex("歌手","かしゅ","singer"),ex("国歌","こっか","national anthem")],
  "song","A possible yawn (可) + exhale (欠) — opening wide to sing.",14,"N4",2)
k("写",["copy","photograph"],["シャ"],["うつ(す)"],
  [ex("写真","しゃしん","photograph"),ex("写す","うつす","to copy"),ex("書き写す","かきうつす","to copy by writing")],
  "copy","A roof (宀) + give (与) — under a roof, transferring an image.",5,"N4",3)
k("真",["truth","real","genuine"],["シン"],["ま"],
  [ex("写真","しゃしん","photograph"),ex("真剣","しんけん","serious"),ex("本当","ほんとう","truth")],
  "truth","A spoon filling a frame — seeing things truly, as they are.",10,"N4",3)
k("部",["part","section","club"],["ブ"],["べ"],
  [ex("部屋","へや","room"),ex("部分","ぶぶん","part"),ex("部活","ぶかつ","club activity")],
  "section","A mound (阝) + a city quarter (咅) — a section of the city.",11,"N4",3)
k("窓",["window"],["ソウ"],["まど"],
  [ex("窓","まど","window"),ex("窓口","まどぐち","window counter"),ex("車窓","しゃそう","car window")],
  "window","Roof (宀) + hole (穴) + heart (心) — a hole in the roof that lets light into the heart.",11,"N4",0)
k("洋",["ocean","Western"],["ヨウ"],[],
  [ex("洋食","ようしょく","Western food"),ex("太平洋","たいへいよう","Pacific Ocean"),ex("洋室","ようしつ","Western-style room")],
  "Western","Water (氵) + sheep (羊) — foreign sheep from across the water.",9,"N4",3)
k("洗",["wash"],["セン"],["あら(う)"],
  [ex("洗う","あらう","to wash"),ex("洗濯","せんたく","laundry"),ex("洗面台","せんめんだい","sink")],
  "wash","Water (氵) + fresh/first (先) — rinsing fresh with water.",9,"N4",6)
k("寝",["sleep"],["シン"],["ね(る)"],
  [ex("寝る","ねる","to sleep"),ex("寝室","しんしつ","bedroom"),ex("昼寝","ひるね","nap")],
  "sleep","Roof (宀) + broom (帚) + lying figure — sweeping into bed for sleep.",13,"N4",0)
k("忙",["busy"],["ボウ"],["いそが(しい)"],
  [ex("忙しい","いそがしい","busy"),ex("多忙","たぼう","very busy"),ex("忙しさ","いそがしさ","busyness")],
  "busy","Heart (忄) + lost (亡) — the heart gone, too busy to think.",6,"N4",0)
k("疲",["tired"],["ヒ"],["つか(れる)"],
  [ex("疲れる","つかれる","to tire"),ex("疲労","ひろう","fatigue"),ex("お疲れ様","おつかれさま","good work")],
  "tired","Illness (疒) + skin (皮) — worn to the skin, exhausted.",10,"N4",0)
k("困",["troubled","困る"],["コン"],["こま(る)"],
  [ex("困る","こまる","to be in trouble"),ex("困難","こんなん","difficulty"),ex("困惑","こんわく","perplexity")],
  "troubled","A tree (木) boxed in — trapped, in trouble.",7,"N4",0)
k("住",["live","reside"],["ジュウ"],["す(む)"],
  [ex("住む","すむ","to live"),ex("住所","じゅうしょ","address"),ex("住民","じゅうみん","resident")],
  "reside","Person (亻) + master (主) — a person established as master of a home.",7,"N4",3)
k("世",["world","generation"],["セイ","セ"],["よ"],
  [ex("世界","せかい","world"),ex("世話","せわ","care"),ex("世紀","せいき","century")],
  "world","Three tens — thirty years, a generation, the whole world.",5,"N4",3)
k("界",["boundary","world"],["カイ"],[],
  [ex("世界","せかい","world"),ex("限界","げんかい","limit"),ex("業界","ぎょうかい","industry")],
  "boundary","A rice field (田) with bordered divisions (介) — marked territory.",9,"N4",3)
k("強",["strong"],["キョウ"],["つよ(い)"],
  [ex("強い","つよい","strong"),ex("勉強","べんきょう","study"),ex("強調","きょうちょう","emphasis")],
  "strong","Bow (弓) + silkworm (虫) + reinforcing stroke — reinforced, strong.",11,"N4",2)
k("弱",["weak"],["ジャク"],["よわ(い)"],
  [ex("弱い","よわい","weak"),ex("弱点","じゃくてん","weak point"),ex("弱気","よわき","timid")],
  "weak","Two bows (弓) with ornamental endings — decorative bows, not for battle, weak.",10,"N4",2)
k("心",["heart","mind"],["シン"],["こころ"],
  [ex("心配","しんぱい","worry"),ex("安心","あんしん","relief"),ex("心","こころ","heart")],
  "heart","The shape of a human heart — the seat of feeling.",4,"N4",2)
k("思",["think","feel"],["シ"],["おも(う)"],
  [ex("思う","おもう","to think"),ex("思い出","おもいで","memory"),ex("思想","しそう","ideology")],
  "think","A field (田) over a heart (心) — seeds of thought planted in the heart.",9,"N4",2)
k("忘",["forget"],["ボウ"],["わす(れる)"],
  [ex("忘れる","わすれる","to forget"),ex("忘れ物","わすれもの","forgotten item"),ex("忘年会","ぼうねんかい","year-end party")],
  "forget","Death/gone (亡) + heart (心) — the heart has lost something.",7,"N4",4)
k("覚",["memorize","awaken"],["カク"],["おぼ(える)","さ(める)"],
  [ex("覚える","おぼえる","to memorize"),ex("目覚める","めざめる","to wake up"),ex("感覚","かんかく","sense")],
  "memorize","Studying hands (学-top) + see (見) — watching carefully to remember.",12,"N4",4)
k("歯",["tooth"],["シ"],["は"],
  [ex("歯","は","tooth"),ex("歯医者","はいしゃ","dentist"),ex("虫歯","むしば","cavity")],
  "tooth","Stop (止) + rice (米) arranged as molars — the teeth that stop food.",12,"N4",3)
k("顔",["face"],["ガン"],["かお"],
  [ex("顔","かお","face"),ex("笑顔","えがお","smile"),ex("顔色","かおいろ","complexion")],
  "face","A graceful figure (彦) + head (頁) — the distinguished markings of a face.",18,"N4",4)
k("首",["neck","head"],["シュ"],["くび"],
  [ex("首","くび","neck"),ex("首相","しゅしょう","prime minister"),ex("首都","しゅと","capital")],
  "neck","Hair (巛) above a head — a head with long hair, the neck.",9,"N4",2)
k("頭",["head","mind"],["ズ","トウ"],["あたま"],
  [ex("頭","あたま","head"),ex("頭痛","ずつう","headache"),ex("頭脳","ずのう","brains, intellect")],
  "head","Beans (豆) + page/head (頁) — the roundness of a head.",16,"N4",2)
k("病",["illness","sick"],["ビョウ"],["や(む)"],
  [ex("病気","びょうき","illness"),ex("病院","びょういん","hospital"),ex("病人","びょうにん","sick person")],
  "illness","Illness (疒) + ice (丙) — feverish chills of sickness.",10,"N4",3)
k("痛",["pain","hurt"],["ツウ"],["いた(い)"],
  [ex("痛い","いたい","painful"),ex("頭痛","ずつう","headache"),ex("痛み","いたみ","pain")],
  "pain","Illness (疒) + pass through (甬) — pain shooting through the body.",12,"N4",0)
k("薬",["medicine","drug"],["ヤク"],["くすり"],
  [ex("薬","くすり","medicine"),ex("薬局","やっきょく","pharmacy"),ex("薬品","やくひん","chemical")],
  "medicine","Grass (艹) above pleasure (楽) — healing herbs that relieve pain.",16,"N4",3)
k("走",["run"],["ソウ"],["はし(る)"],
  [ex("走る","はしる","to run"),ex("競走","きょうそう","race"),ex("走り回る","はしりまわる","to run around")],
  "run","A person in motion with striding feet — running.",7,"N4",2)
k("泳",["swim"],["エイ"],["およ(ぐ)"],
  [ex("泳ぐ","およぐ","to swim"),ex("水泳","すいえい","swimming"),ex("背泳ぎ","せおよぎ","backstroke")],
  "swim","Water (氵) + eternal (永) — cutting through water at length.",8,"N4",0)
k("引",["pull","attract"],["イン"],["ひ(く)"],
  [ex("引く","ひく","to pull"),ex("引越し","ひっこし","moving house"),ex("割引","わりびき","discount")],
  "pull","A bow (弓) with an arrow — drawing a bowstring.",4,"N4",2)
k("押",["push"],["オウ"],["お(す)"],
  [ex("押す","おす","to push"),ex("押し入れ","おしいれ","closet"),ex("押収","おうしゅう","confiscation")],
  "push","Hand (扌) + pressed figure (甲) — pushing hard with the hand.",8,"N4",0)
k("開",["open"],["カイ"],["あ(ける)","ひら(く)"],
  [ex("開ける","あける","to open"),ex("開店","かいてん","store opening"),ex("公開","こうかい","public release")],
  "open","Two hands (廾) lifting the gate bar (门) — opening a gate.",12,"N4",3)
k("閉",["close","shut"],["ヘイ"],["し(める)","と(じる)"],
  [ex("閉める","しめる","to close"),ex("閉店","へいてん","closing time"),ex("密閉","みっぺい","sealed")],
  "close","A gate (門) with a fastening bolt — bolting the gate shut.",11,"N4",3)

k("毎",["every","each"],["マイ"],[],
  [ex("毎日","まいにち","every day"),ex("毎週","まいしゅう","every week"),ex("毎朝","まいあさ","every morning")],
  "every","A woman (母 modified) — recurring like a mother, every time.",6,"N4",2)

print(f"\nTotal kanji in K: {len(K)}")

# ─────────────────────────────────────────────────────────────────────────────
# Deck lists
# ─────────────────────────────────────────────────────────────────────────────

JLPT_N5 = [
    "一","二","三","四","五","六","七","八","九","十",
    "百","千","万","円","年","月","日","時","分","半",
    "今","何","人","大","小","中","上","下","左","右",
    "前","後","北","南","東","西","外","本","山","川",
    "水","火","木","金","土","天","電","車","駅","国",
    "校","先","生","学","気","雨","空","花","手","足",
    "目","口","女","男","子","母","父","友","行","来",
    "帰","食","飲","見","書","読","話","語","聞","入",
]

JLPT_N4 = [
    "会","社","仕","事","自","転","乗","運","世","界",
    "地","図","場","道","橋","近","遠","速","遅","早",
    "重","軽","暑","寒","暗","広","発","着","住","所",
    "家","族","兄","姉","弟","妹","親","強","弱","忘",
    "洗","起","寝","待","持","使","借","返","送","受",
    "教","習","研","究","試","験","答","質","問","題",
    "宿","泊","映","画","歌","字","文","意","味","思",
    "考","知","覚","忙","疲","困","急","楽","悲","怒",
    "心","配","注","号","番","線","鉄","港","旅","荷",
    "物","品","屋","店","市","町","村","県","都","週",
    "曜","朝","昼","夜","昨","末","初","以","特","別",
    "同","両","有","無","多","少","安","高","低","長",
    "短","新","古","明","太","細","平","和","様","方",
    "代","回","当","点","活","動","働","始","終","続",
    "切","死","医","病","院","薬","痛","頭","顔","体",
    "歯","首","声","色","形","向","歩","走","泳","飛",
    "降","引","押","開","閉","作","集","合","出","教",
    "室","台","全","鳥","料","理","飯","肉","悪","海",
    "昔","神","度","赤","青","白","黒","去","音","者",
    "夏","魚","寺","風","船","森","林","写","真","部",
    "洋","忘","強","弱","覚","世","界","住","思","心",
]

# Genki 2 — chapters 13–23 (~172 kanji)
# Built from the 82 already in the app + the additional ones above
GENKI2 = [
    # From the existing 82 inline cards
    "物","鳥","料","理","特","安","飯","肉","悪","体",
    "同","着","空","港","昼","海","昔","神","早","起",
    "使","働","別","度","赤","青","色","白","黒","動",
    "運","教","室","有","旅","親","切","英","店","去",
    "急","乗","降","待","持","音","楽","医","者","死",
    "意","味","注","夏","魚","寺","広","足","転","借",
    "返","宿","題","軽","暗","風","場","発","近","遠",
    "速","遅","重","暑","寒","飛","船","道","森","林",
    "花","声",
    # Additional Genki 2 kanji
    "映","画","歌","写","真","部","窓","洋",
    "洗","寝","忙","疲","困","住","世","界",
    "強","弱","心","思","忘","覚","歯","顔",
    "首","頭","病","痛","薬","走","泳","引",
    "押","開","閉","兄","姉","弟","妹","家",
    "族","朝","夜","番","号","文","字","語",
    "漢","曲","形","向","始","終","作","台",
    "当","全","方","新","明","高","長","様",
]
# deduplicate while preserving order
seen = set()
GENKI2 = [c for c in GENKI2 if not (c in seen or seen.add(c))]

# Genki 1 — chapters 3–12 (~145 kanji, the standard N5+early N4 set)
GENKI1 = [
    "一","二","三","四","五","六","七","八","九","十",
    "百","千","円","年","月","日","時","分","半","今",
    "何","人","大","小","中","上","下","左","右","前",
    "後","北","南","東","西","外","本","山","川","水",
    "火","木","金","土","天","電","車","駅","国","校",
    "先","生","学","気","雨","空","花","手","足","目",
    "口","女","男","子","母","父","友","行","来","帰",
    "食","飲","見","書","読","話","語","聞","入","出",
    "高","安","古","新","長","短","太","細","多","少",
    "早","速","遅","重","軽","暗","広","近","遠","強",
    "弱","毎","今","昨","朝","昼","夜","週","末","曜",
    "会","社","仕","事","世","家","住","所","部","屋",
    "台","道","店","市","町","村","医","院","病","薬",
    "体","頭","顔","歯","声","心","思","知","始","終",
    "作","集","合","開","閉","切","使","持","待","乗",
]
seen2 = set()
GENKI1 = [c for c in GENKI1 if not (c in seen2 or seen2.add(c))]

# ─────────────────────────────────────────────────────────────────────────────
# Build JSON for a deck from the kanji list
# ─────────────────────────────────────────────────────────────────────────────
def make_deck(deck_id, deck_name, kanji_list, extra_deck_tags=None):
    cards = []
    missing = []
    for ch in kanji_list:
        if ch not in K:
            missing.append(ch)
            continue
        d = dict(K[ch])
        d["kanji"] = ch
        jlpt = d.get("jlpt","")
        deck_tags = [deck_name]
        if jlpt:
            deck_tags.append(f"JLPT {jlpt}")
        if extra_deck_tags:
            deck_tags += extra_deck_tags
        d["decks"] = deck_tags
        cards.append(d)
    if missing:
        print(f"  [{deck_id}] missing kanji data: {''.join(missing)}")
    return {
        "deck_id": deck_id,
        "deck_name": deck_name,
        "version": "1.0",
        "card_count": len(cards),
        "cards": cards,
    }

# ─────────────────────────────────────────────────────────────────────────────
# Emit decks
# ─────────────────────────────────────────────────────────────────────────────
decks_to_build = [
    ("jlpt-n5",   "JLPT N5",   JLPT_N5),
    ("jlpt-n4",   "JLPT N4",   JLPT_N4),
    ("genki1",    "Genki 1",   GENKI1),
    ("genki2",    "Genki 2",   GENKI2),
]

for deck_id, deck_name, kanji_list in decks_to_build:
    deck = make_deck(deck_id, deck_name, kanji_list)
    path = os.path.join(OUT, f"{deck_id}.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(deck, f, ensure_ascii=False, indent=2)
    print(f"  ✓ {deck_name}: {deck['card_count']} cards → {path}")

print("\nDone.")
