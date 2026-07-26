import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const inputPath = process.argv[2];
const outputPath =
  process.argv[3] ?? path.resolve("content/poems/tang-anthology.ts");

if (!inputPath) {
  throw new Error(
    "Usage: node scripts/import-tang-anthology.mjs <source-html> [output]",
  );
}

const html = await readFile(inputPath, "utf8");
const markers = [
  ...html.matchAll(/<blockquote>\s*(\d{3})\s*<\/blockquote>/gi),
];

const excludedTranslationNumbers = new Set([
  "001",
  "003",
  "039",
  "040",
  "042",
  "083",
  "084",
  "190",
  "191",
  "193",
]);

const existingTitles = new Set([
  "蒹葭",
  "行行重行行",
  "飲酒·其五",
  "春江花月夜",
  "山居秋暝",
  "將進酒",
  "登高",
  "黃鶴樓",
  "琵琶行",
  "錦瑟",
  "靜夜思",
  "鹿柴",
  "江雪",
  "楓橋夜泊",
  "登鸛雀樓",
  "早發白帝城",
  "黃鶴樓送孟浩然之廣陵",
  "送孟浩然之廣陵",
  "春曉",
  "出塞",
  "夏日絕句",
  "九月九日憶山東兄弟",
  "望廬山瀑布",
  "水調歌頭·明月幾時有",
  "梅花",
  "望嶽",
  "江村",
  "夜雨寄北",
  "涼州詞",
]);

const images = [
  "/poems/01-the-reeds.jpg",
  "/poems/02-long-road.jpg",
  "/poems/03-drinking-wine.jpg",
  "/poems/04-spring-river.jpg",
  "/poems/05-autumn-evening.jpg",
  "/poems/06-bring-in-the-wine.jpg",
  "/poems/07-climbing-high.jpg",
  "/poems/08-yellow-crane-tower.jpg",
  "/poems/09-song-of-the-pipa.jpg",
  "/poems/10-jeweled-zither.jpg",
];

const moodRules = {
  stillness: [
    "quiet",
    "still",
    "hermit",
    "temple",
    "meditation",
    "stream",
    "lake",
    "mountain",
    "recluse",
    "dwelling",
  ],
  longing: [
    "parting",
    "farewell",
    "send",
    "remember",
    "dream",
    "wife",
    "friend",
    "letter",
    "love",
    "waiting",
  ],
  solitude: [
    "alone",
    "lonely",
    "solitary",
    "recluse",
    "night",
    "exile",
    "traveller",
    "traveler",
    "lodging",
    "deserted",
  ],
  melancholy: [
    "sorrow",
    "grief",
    "lament",
    "tears",
    "autumn",
    "ruin",
    "old",
    "death",
    "war",
    "sad",
  ],
  joy: [
    "spring",
    "wine",
    "banquet",
    "dance",
    "flower",
    "homecoming",
    "happy",
    "pleasure",
    "feast",
    "song",
  ],
  courage: [
    "army",
    "general",
    "battle",
    "frontier",
    "fortress",
    "soldier",
    "sword",
    "war",
    "horse",
    "campaign",
  ],
  nostalgia: [
    "home",
    "return",
    "remember",
    "ancient",
    "old",
    "capital",
    "palace",
    "native",
    "former",
    "memory",
  ],
  wonder: [
    "moon",
    "mountain",
    "river",
    "sea",
    "sky",
    "star",
    "waterfall",
    "cloud",
    "sunrise",
    "heaven",
  ],
};

const themeRules = {
  moon: ["moon", "月"],
  mountains: ["mountain", "peak", "hill", "山", "峰"],
  rivers: ["river", "stream", "lake", "water", "江", "河", "湖", "溪"],
  night: ["night", "midnight", "夜"],
  friendship: ["friend", "友情", "故人"],
  parting: ["parting", "farewell", "send", "別", "送"],
  home: ["home", "native", "歸", "鄉", "家"],
  war: ["war", "battle", "army", "soldier", "戰", "軍"],
  spring: ["spring", "春"],
  autumn: ["autumn", "秋"],
  rain: ["rain", "雨"],
  wine: ["wine", "酒"],
  travel: ["journey", "travel", "road", "boat", "舟", "船", "行"],
  memory: ["remember", "memory", "dream", "憶", "夢"],
  palace: ["palace", "court", "宮"],
  music: ["music", "flute", "lute", "song", "琴", "笛", "歌"],
  love: ["love", "wife", "bride", "相思", "妾"],
};

const interpretationByMood = {
  stillness:
    "attention slows until landscape and inner life seem to share one breath",
  longing:
    "distance turns memory, friendship, or love into the poem’s quiet center",
  solitude:
    "the solitary figure becomes more vivid against the scale of the world",
  melancholy:
    "beauty is sharpened by change, loss, and the knowledge that time moves on",
  joy: "movement, fellowship, and the living world open into a moment of brightness",
  courage:
    "the poem meets uncertainty with resolve, scale, and forward motion",
  nostalgia:
    "the past remains present through places, names, and remembered journeys",
  wonder:
    "the visible world expands into something larger than a single human life",
};

function decodeEntities(value) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, number) => String.fromCodePoint(Number(number)))
    .replace(/&#x([0-9a-f]+);/gi, (_, number) =>
      String.fromCodePoint(Number.parseInt(number, 16)),
    );
}

function cleanInline(value) {
  return decodeEntities(
    value
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function cleanBody(value) {
  return decodeEntities(
    value
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/[ \t]+/g, " ")
      .replace(/ *\n */g, "\n")
      .trim(),
  );
}

function parsePart(part) {
  const genre =
    part.match(
      /<blockquote>\s*<font[^>]*>([\s\S]*?)<\/font>\s*<\/blockquote>/i,
    )?.[1] ?? "";
  const author =
    part.match(
      /<\/font>\s*<\/blockquote>\s*<blockquote>([\s\S]*?)<\/blockquote>/i,
    )?.[1] ?? "";
  const title =
    part.match(
      /<blockquote>\s*<b>\s*<i>([\s\S]*?)<\/i>\s*<\/b>\s*<\/blockquote>/i,
    )?.[1] ?? "";
  const body =
    part.match(
      /<blockquote>\s*<blockquote>([\s\S]*?)<\/blockquote>\s*<\/blockquote>/i,
    )?.[1] ?? "";

  return {
    genre: cleanInline(genre),
    author: cleanInline(author),
    title: cleanInline(title),
    body: cleanBody(body),
  };
}

function titleCase(value) {
  const stopWords = new Set(["a", "an", "and", "at", "by", "for", "from", "in", "of", "on", "the", "to"]);
  const titled = value
    .toLowerCase()
    .split(/\s+/)
    .map((word, index) =>
      index > 0 && stopWords.has(word)
        ? word
        : word.replace(/^([a-z])/, (letter) => letter.toUpperCase()),
    )
    .join(" ")
    .replace(/\bIi\b/g, "II")
    .replace(/\bIii\b/g, "III")
    .replace(/\bIv\b/g, "IV");
  return titled;
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function toStanzas(lines, size = 4) {
  const stanzas = [];
  for (let index = 0; index < lines.length; index += size) {
    stanzas.push(lines.slice(index, index + size));
  }
  return stanzas;
}

function chineseLines(body) {
  return body
    .replace(/\s+/g, "")
    .split(/[，。；！？]/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function englishLines(body) {
  const normalized = body
    .replace(/-\s*\n\s*/g, "-")
    .replace(/\s*\n\s*/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/\bTHan\b/g, "Than")
    .replace(/\s+/g, " ")
    .trim();

  const lines = (normalized.match(/[^.!?;]+[.!?;]+|[^.!?;]+$/g) ?? [])
    .flatMap((sentence) => {
      const clean = sentence.trim();
      if (clean.length < 125) return [clean];
      return clean
        .split(/(?<=,)\s+/)
        .reduce((chunks, phrase) => {
          const previous = chunks.at(-1);
          if (previous && `${previous} ${phrase}`.length <= 100) {
            chunks[chunks.length - 1] = `${previous} ${phrase}`;
          } else {
            chunks.push(phrase);
          }
          return chunks;
        }, []);
    })
    .filter(Boolean);
  return lines;
}

function containsKeyword(text, keyword) {
  if (/^[a-z ]+$/i.test(keyword)) {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`\\b${escaped}\\b`, "i").test(text);
  }
  return text.includes(keyword);
}

function chooseMoods(text, number) {
  const moodIds = Object.keys(moodRules);
  const scored = moodIds
    .map((mood, index) => {
      const matches = moodRules[mood].reduce(
        (count, keyword) => count + (containsKeyword(text, keyword) ? 1 : 0),
        0,
      );
      const rotation = (Number(number) + index * 3) % moodIds.length;
      return { mood, score: matches * 10 + (moodIds.length - rotation) / 10 };
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, 3);

  return Object.fromEntries(
    scored.map(({ mood }, index) => [mood, [0.94, 0.72, 0.52][index]]),
  );
}

function chooseThemes(text, primaryMood) {
  const matched = Object.entries(themeRules)
    .filter(([, keywords]) =>
      keywords.some((keyword) => containsKeyword(text, keyword)),
    )
    .map(([theme]) => theme)
    .slice(0, 4);

  if (matched.length === 0) matched.push(primaryMood);
  if (!matched.includes("Tang poetry")) matched.push("Tang poetry");
  return matched;
}

const parsed = [];
for (let index = 0; index < markers.length; index += 1) {
  const number = markers[index][1];
  if (excludedTranslationNumbers.has(number)) continue;

  const start = markers[index].index + markers[index][0].length;
  const end = markers[index + 1]?.index ?? html.length;
  const section = html.slice(start, end);
  const parts = section.split(
    /<br>\s*<hr\s+align="left"\s+width="50%"\s*>/i,
  );
  if (parts.length < 2) continue;

  const chinese = parsePart(parts[0]);
  const english = parsePart(parts[1]);
  if (
    !chinese.title ||
    !chinese.author ||
    !chinese.body ||
    !english.title ||
    !english.author ||
    !english.body
  ) {
    continue;
  }
  if (existingTitles.has(chinese.title)) continue;

  const originalLines = chineseLines(chinese.body);
  const translatedLines = englishLines(english.body);
  if (originalLines.length < 2 || translatedLines.length < 2) continue;

  const title = titleCase(english.title);
  const textForClassification =
    `${title} ${english.body} ${chinese.title} ${chinese.body}`.toLowerCase();
  const moods = chooseMoods(textForClassification, number);
  const primaryMood = Object.keys(moods)[0];
  const themes = chooseThemes(textForClassification, primaryMood);
  const poemNumber = Number(number);

  parsed.push({
    slug: `${slugify(`${title}-${english.author}`)}-${number}`,
    title,
    originalTitle: chinese.title,
    poet: english.author,
    poetChinese: chinese.author,
    dynasty: "Tang dynasty",
    approximateDate: "618–907",
    originalChinese: toStanzas(originalLines),
    translation: toStanzas(translatedLines),
    moods,
    themes,
    image: images[(poemNumber - 1) % images.length],
    imageAlt: `An ink-wash landscape accompanying ${title}`,
    introduction: `${title} by ${english.author} belongs to the classic Three Hundred Tang Poems anthology, presented here in its original Chinese with an English rendering.`,
    interpretation: `Its strongest pull is toward ${primaryMood}: ${interpretationByMood[primaryMood]}.`,
    translator: "Witter Bynner",
    license: "Public domain in the United States (1929 edition)",
    source: "https://cti.lib.virginia.edu/tangeng.html",
  });
}

const selected = parsed.slice(0, 272);
if (selected.length !== 272) {
  throw new Error(`Expected 272 usable poems, found ${selected.length}`);
}

const output = `import type { Poem } from "../../lib/types";

/**
 * 272 poems selected from the University of Virginia Chinese Text Initiative's
 * digital edition of Three Hundred Tang Poems. The ten translations identified
 * there as later copyrighted editions are deliberately excluded. Together with
 * the 28 original Moon Mood Tonight entries, this creates a 300-poem collection.
 */
export const tangAnthologyPoems: Poem[] = ${JSON.stringify(selected, null, 2)};
`;

await writeFile(outputPath, output, "utf8");

const moodCounts = Object.fromEntries(
  Object.keys(moodRules).map((mood) => [
    mood,
    selected.filter((poem) => poem.moods[mood] !== undefined).length,
  ]),
);

console.log(
  JSON.stringify(
    {
      parsed: parsed.length,
      selected: selected.length,
      uniqueSlugs: new Set(selected.map((poem) => poem.slug)).size,
      moodCounts,
      outputPath,
    },
    null,
    2,
  ),
);
