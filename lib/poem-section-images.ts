import type { MoodId, Poem } from "./types";

type VisualArtwork = {
  src: string;
  moods: MoodId[];
  families: SubjectFamily[];
  keywords: string[];
};

type SubjectFamily =
  | "frontier"
  | "history"
  | "home"
  | "journey"
  | "love"
  | "mountain"
  | "music"
  | "nature"
  | "night"
  | "water"
  | "wine";

export type PoemSectionImages = {
  reading: string;
  context: string;
  moods: string;
  actions: string;
};

const visualLibrary: VisualArtwork[] = [
  {
    src: "/poems/01-the-reeds.jpg",
    moods: ["longing", "stillness", "wonder"],
    families: ["water", "nature", "love"],
    keywords: [
      "reed",
      "water",
      "river",
      "shore",
      "dew",
      "frost",
      "distance",
      "蒹葭",
      "水",
      "露",
    ],
  },
  {
    src: "/poems/02-long-road.jpg",
    moods: ["longing", "solitude", "nostalgia", "melancholy"],
    families: ["journey", "home", "love"],
    keywords: [
      "road",
      "travel",
      "journey",
      "separation",
      "wanderer",
      "exile",
      "home",
      "行",
      "归",
      "客",
    ],
  },
  {
    src: "/poems/03-drinking-wine.jpg",
    moods: ["stillness", "joy", "wonder"],
    families: ["nature", "wine"],
    keywords: [
      "garden",
      "field",
      "village",
      "flower",
      "bird",
      "wine",
      "hermit",
      "田",
      "花",
      "鸟",
    ],
  },
  {
    src: "/poems/04-spring-river.jpg",
    moods: ["wonder", "longing", "stillness"],
    families: ["water", "nature", "night", "love"],
    keywords: [
      "moon",
      "river",
      "spring",
      "sea",
      "tide",
      "night",
      "sky",
      "star",
      "月",
      "江",
      "海",
    ],
  },
  {
    src: "/poems/05-autumn-evening.jpg",
    moods: ["stillness", "solitude", "nostalgia"],
    families: ["nature", "mountain", "night"],
    keywords: [
      "autumn",
      "mountain",
      "evening",
      "rain",
      "pine",
      "stream",
      "dusk",
      "秋",
      "山",
      "雨",
    ],
  },
  {
    src: "/poems/06-bring-in-the-wine.jpg",
    moods: ["courage", "joy", "melancholy"],
    families: ["wine", "frontier"],
    keywords: [
      "wine",
      "banquet",
      "heroic",
      "revelry",
      "horse",
      "friend",
      "酒",
      "宴",
      "马",
    ],
  },
  {
    src: "/poems/07-climbing-high.jpg",
    moods: ["courage", "solitude", "melancholy", "nostalgia"],
    families: ["mountain", "frontier", "history"],
    keywords: [
      "mountain",
      "height",
      "wind",
      "autumn",
      "history",
      "tower",
      "climb",
      "山",
      "风",
      "登",
    ],
  },
  {
    src: "/poems/08-yellow-crane-tower.jpg",
    moods: ["nostalgia", "solitude", "longing", "wonder"],
    families: ["water", "journey", "history"],
    keywords: [
      "tower",
      "river",
      "journey",
      "departure",
      "city",
      "history",
      "sunset",
      "楼",
      "江",
      "送",
    ],
  },
  {
    src: "/poems/09-song-of-the-pipa.jpg",
    moods: ["melancholy", "longing", "nostalgia"],
    families: ["music", "water", "love"],
    keywords: [
      "music",
      "pipa",
      "farewell",
      "river",
      "boat",
      "performance",
      "琵琶",
      "歌",
      "舟",
    ],
  },
  {
    src: "/poems/10-jeweled-zither.jpg",
    moods: ["melancholy", "longing", "nostalgia", "solitude"],
    families: ["night", "music", "home", "love"],
    keywords: [
      "rain",
      "night",
      "chamber",
      "dream",
      "window",
      "zither",
      "雨",
      "夜",
      "梦",
    ],
  },
  {
    src: "/poems/11-frontier-song.png",
    moods: ["courage", "nostalgia", "melancholy"],
    families: ["frontier", "mountain", "night", "history"],
    keywords: [
      "frontier",
      "war",
      "battle",
      "soldier",
      "guard",
      "pass",
      "horse",
      "边",
      "塞",
      "战",
    ],
  },
  {
    src: "/poems/12-liangzhou-song.png",
    moods: ["courage", "joy", "melancholy"],
    families: ["frontier", "wine", "music", "night"],
    keywords: [
      "frontier",
      "wine",
      "pipa",
      "battle",
      "horse",
      "desert",
      "feast",
      "凉州",
      "酒",
      "沙场",
    ],
  },
  {
    src: "/poems/13-spring-morning.png",
    moods: ["joy", "stillness", "wonder"],
    families: ["nature", "home"],
    keywords: [
      "spring",
      "blossom",
      "flower",
      "bird",
      "rain",
      "morning",
      "garden",
      "春",
      "花",
      "晓",
    ],
  },
  {
    src: "/poems/14-mount-lu-waterfall.png",
    moods: ["wonder", "courage", "joy"],
    families: ["nature", "water", "mountain"],
    keywords: [
      "waterfall",
      "mountain",
      "river",
      "sky",
      "cloud",
      "sun",
      "庐山",
      "瀑布",
      "云",
    ],
  },
  {
    src: "/poems/15-quiet-night-thought.png",
    moods: ["nostalgia", "longing", "solitude"],
    families: ["night", "home", "love"],
    keywords: [
      "moon",
      "home",
      "homesick",
      "night",
      "room",
      "bed",
      "traveler",
      "月",
      "夜",
      "乡",
    ],
  },
  {
    src: "/poems/16-the-reeds.png",
    moods: ["longing", "stillness", "melancholy"],
    families: ["water", "nature", "love"],
    keywords: [
      "reed",
      "water",
      "river",
      "frost",
      "shore",
      "search",
      "beloved",
      "蒹葭",
      "霜",
      "伊人",
    ],
  },
];

const familyTerms: Record<SubjectFamily, string[]> = {
  frontier: [
    "frontier",
    "war",
    "battle",
    "soldier",
    "guard",
    "army",
    "horse",
    "desert",
    "defense",
    "边",
    "塞",
    "战",
    "军",
  ],
  history: [
    "history",
    "ancient",
    "memory",
    "tower",
    "city",
    "kingdom",
    "general",
    "dynasty",
    "怀古",
    "楼",
    "城",
  ],
  home: [
    "home",
    "homesick",
    "family",
    "brother",
    "return",
    "room",
    "window",
    "bed",
    "归",
    "乡",
    "家",
  ],
  journey: [
    "journey",
    "travel",
    "road",
    "departure",
    "farewell",
    "exile",
    "wanderer",
    "distance",
    "行",
    "送",
    "客",
  ],
  love: [
    "love",
    "beloved",
    "longing",
    "separation",
    "desire",
    "waiting",
    "相思",
    "别",
    "伊人",
  ],
  mountain: [
    "mountain",
    "peak",
    "climb",
    "cliff",
    "temple",
    "waterfall",
    "山",
    "峰",
    "登",
  ],
  music: [
    "music",
    "pipa",
    "flute",
    "zither",
    "instrument",
    "琵琶",
    "琴",
    "歌",
  ],
  nature: [
    "spring",
    "autumn",
    "flower",
    "bird",
    "garden",
    "forest",
    "tree",
    "wind",
    "rain",
    "cloud",
    "春",
    "秋",
    "花",
    "鸟",
    "风",
  ],
  night: [
    "night",
    "moon",
    "evening",
    "dusk",
    "dream",
    "candle",
    "star",
    "夜",
    "月",
    "夕",
    "梦",
  ],
  water: [
    "water",
    "river",
    "lake",
    "sea",
    "tide",
    "waterfall",
    "shore",
    "boat",
    "reed",
    "江",
    "河",
    "湖",
    "海",
    "水",
  ],
  wine: [
    "wine",
    "banquet",
    "feast",
    "drunk",
    "revelry",
    "酒",
    "宴",
    "醉",
  ],
};

function poemSearchableText(poem: Poem) {
  return [
    poem.title,
    poem.originalTitle,
    poem.poet,
    poem.poetChinese,
    ...poem.themes,
  ]
    .join(" ")
    .toLowerCase();
}

function poemFamilies(searchable: string) {
  return new Set(
    (Object.entries(familyTerms) as [SubjectFamily, string[]][])
      .filter(([, terms]) =>
        terms.some((term) => searchable.includes(term.toLowerCase())),
      )
      .map(([family]) => family),
  );
}

function artworkScore(
  poem: Poem,
  searchable: string,
  subjects: Set<SubjectFamily>,
  artwork: VisualArtwork,
) {
  if (artwork.src === poem.image) return Number.NEGATIVE_INFINITY;

  let score = 0;

  for (const family of artwork.families) {
    if (subjects.has(family)) score += 5;
  }

  for (const mood of artwork.moods) {
    score += (poem.moods[mood] ?? 0) * 2;
  }

  for (const keyword of artwork.keywords) {
    if (searchable.includes(keyword.toLowerCase())) {
      score += keyword.length === 1 ? 2 : 7;
    }
  }

  return score;
}

export function getPoemSectionImages(poem: Poem): PoemSectionImages {
  const searchable = poemSearchableText(poem);
  const subjects = poemFamilies(searchable);
  const selected = visualLibrary
    .map((artwork) => ({
      ...artwork,
      score: artworkScore(poem, searchable, subjects, artwork),
    }))
    .filter((artwork) => Number.isFinite(artwork.score))
    .sort(
      (left, right) =>
        right.score - left.score || left.src.localeCompare(right.src),
    )
    .slice(0, 4)
    .map((artwork) => artwork.src);

  const [reading, context, moods, actions] = selected;
  if (!reading || !context || !moods || !actions) {
    throw new Error(`Not enough distinct artwork for ${poem.slug}`);
  }

  return {
    reading,
    context,
    moods,
    actions,
  };
}
