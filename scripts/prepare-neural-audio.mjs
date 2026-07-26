import { createRequire } from "node:module";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const root = resolve(scriptDirectory, "..");
const model = "mlx-community/Qwen3-TTS-12Hz-1.7B-CustomVoice-bf16";
const voices = {
  Serena: {
    style:
      "使用标准普通话，以温润、成熟、细腻而克制的声音朗诵古典诗词。语速舒缓，句内连贯自然，句末轻停；让思念、离别、月夜与幽微情绪自然流动。避免逐字顿读、夸张表演、新闻播音腔和过长停顿。",
  },
  Vivian: {
    style:
      "使用标准普通话，以清澈、灵动、明亮而不稚嫩的声音朗诵古典诗词。语速从容，句内流畅，句末轻停；让春日、山水、喜悦与惊奇保持轻盈生气。避免逐字顿读、夸张表演、新闻播音腔和过长停顿。",
  },
  Uncle_Fu: {
    style:
      "使用标准普通话，以沉稳、浑厚、克制而有力量的中年男声朗诵古典诗词。语速从容，句内连贯，句末稳稳收住；呈现边塞、征战、历史、山河与豪迈气象。不要喊叫，不要过度悲壮，避免逐字顿读、新闻播音腔和过长停顿。",
  },
};

const forcedVoices = new Map(
  Object.entries({
    "frontier-song": "Uncle_Fu",
    "summer-quatrain": "Uncle_Fu",
    "bring-in-the-wine": "Uncle_Fu",
    "climbing-high": "Uncle_Fu",
    "liangzhou-song": "Uncle_Fu",
    "view-of-mount-tai": "Uncle_Fu",
    "drinking-wine-v": "Uncle_Fu",
    "river-snow": "Uncle_Fu",
    "on-a-gate-tower-at-yuzhou-chen-ziang-046": "Uncle_Fu",
    "the-reeds": "Serena",
    "song-of-the-pipa": "Serena",
    "quiet-night-thought": "Serena",
    "a-song-of-an-autumn-midnight-li-bai-041": "Serena",
    "endless-yearning-i-li-bai-080": "Serena",
    "endless-yearning-ii-li-bai-081": "Serena",
    "a-song-of-unending-sorrow-bai-juyi-071": "Serena",
    "the-song-of-a-guitar-bai-chuyi-072": "Serena",
    "a-song-of-fair-women-du-fu-087": "Serena",
    "drinking-alone-with-the-moon-li-bai-006": "Serena",
    "spring-morning": "Vivian",
    "mount-lu-waterfall": "Vivian",
  }),
);
const briskPacePoems = new Set([
  "a-message-to-meng-haoran-li-bai-100",
  "a-green-stream-wang-wei-015",
]);

const martialPattern =
  /\b(?:frontier|border|war|battle|trooper|soldier|army|general|fortress|campaign|chariot|military|hero|defiance)\b|(?:边塞|邊塞|边关|邊關|边城|邊城|戍边|戍邊)|[塞军軍战戰兵剑劍戎烽阵陣侠俠旌甲戍虏虜寇]/u;
const grandPattern =
  /\b(?:mountain|river|history|empire|monument|horse|eagle|wine|state)\b|[山河岳江酒古碑帝国國龙龍虎]/u;
const luminousPattern =
  /\b(?:spring|blossom|flower|bird|butterfly|waterfall|sunrise|clear sky|garden|village|festival|orchid|peach|bamboo)\b|[春花鸟鳥莺鶯蝶桃柳晴日瀑竹]/u;
const tenderPattern =
  /\b(?:farewell|parting|moon|night|home|memory|love|dream|rain|autumn|grief|wife|bride|palace|lute|pipa|zither)\b|[别別月夜归歸乡鄉思梦夢雨秋愁泪淚闺閨宫宮琴]/u;

function transpile(source) {
  return ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
}

async function loadPoems(temporaryDirectory) {
  const anthologySource = await readFile(
    join(root, "content", "poems", "tang-anthology.ts"),
    "utf8",
  );
  const catalogSource = await readFile(
    join(root, "content", "poems", "catalog.ts"),
    "utf8",
  );
  const anthologyModule = join(temporaryDirectory, "tang-anthology.js");
  const catalogModule = join(temporaryDirectory, "catalog.js");

  await Promise.all([
    writeFile(anthologyModule, transpile(anthologySource)),
    writeFile(catalogModule, transpile(catalogSource)),
  ]);
  return createRequire(import.meta.url)(catalogModule).poems;
}

function moodWeight(poem, mood) {
  return poem.moods[mood] ?? 0;
}

function chooseVoice(poem) {
  const forced = forcedVoices.get(poem.slug);
  if (forced) {
    return { voice: forced, reason: "Editorial assignment for this poem" };
  }

  const searchable = [
    poem.title,
    poem.originalTitle,
    poem.themes.join(" "),
    poem.originalChinese.flat().join(""),
  ].join(" ");
  if (martialPattern.test(searchable)) {
    return {
      voice: "Uncle_Fu",
      reason: "Frontier, martial, heroic, or historical imagery",
    };
  }

  const scores = {
    Serena:
      0.7 +
      moodWeight(poem, "longing") * 2.1 +
      moodWeight(poem, "melancholy") * 1.9 +
      moodWeight(poem, "nostalgia") * 1.7 +
      moodWeight(poem, "solitude") * 1.2 +
      moodWeight(poem, "stillness") * 0.55,
    Vivian:
      0.45 +
      moodWeight(poem, "joy") * 2.15 +
      moodWeight(poem, "wonder") * 1.75 +
      moodWeight(poem, "stillness") * 0.55,
    Uncle_Fu:
      0.25 +
      moodWeight(poem, "courage") * 2.2 +
      moodWeight(poem, "wonder") * 0.45 +
      moodWeight(poem, "solitude") * 0.25,
  };

  if (grandPattern.test(searchable)) scores.Uncle_Fu += 0.85;
  if (luminousPattern.test(searchable)) scores.Vivian += 1.5;
  if (tenderPattern.test(searchable)) scores.Serena += 1.45;

  const voice = Object.entries(scores).sort(([, left], [, right]) => right - left)[0][0];
  const dominantMood =
    Object.entries(poem.moods).sort(([, left], [, right]) => right - left)[0]?.[0] ??
    "editorial tone";
  return {
    voice,
    reason: `Content and ${dominantMood} mood profile`,
  };
}

function punctuateStanza(stanza) {
  return stanza
    .map((line, index) => {
      const cleaned = line.trim();
      if (/[，。！？；：、,.!?;:]$/u.test(cleaned)) return cleaned;
      return `${cleaned}${index === stanza.length - 1 ? "。" : "，"}`;
    })
    .join("");
}

function splitIntoChunks(poem, maximumCharacters = 220) {
  const chunks = [];
  let current = "";

  for (const stanza of poem.originalChinese) {
    const sentence = punctuateStanza(stanza);
    if (current && [...`${current}${sentence}`].length > maximumCharacters) {
      chunks.push(current);
      current = "";
    }

    if ([...sentence].length <= maximumCharacters) {
      current += sentence;
      continue;
    }

    for (const line of stanza) {
      const punctuated = /[，。！？；：、,.!?;:]$/u.test(line)
        ? line
        : `${line}，`;
      if (current && [...`${current}${punctuated}`].length > maximumCharacters) {
        chunks.push(current.replace(/，$/u, "。"));
        current = "";
      }
      current += punctuated;
    }
  }

  if (current) chunks.push(current.replace(/，$/u, "。"));
  return chunks;
}

const temporaryDirectory = await mkdtemp(join(tmpdir(), "moon-mood-neural-plan-"));

try {
  const poems = await loadPoems(temporaryDirectory);
  const entries = poems.map((poem) => {
    const assignment = chooseVoice(poem);
    return {
      slug: poem.slug,
      title: poem.title,
      originalTitle: poem.originalTitle,
      voice: assignment.voice,
      reason: assignment.reason,
      style: `${voices[assignment.voice].style}${
        briskPacePoems.has(poem.slug)
          ? "整体语速自然略快，不要拖长尾音或在句中留出额外停顿。"
          : ""
      }`,
      characters: poem.originalChinese
        .flat()
        .join("")
        .replace(/\s/gu, "").length,
      chunks: splitIntoChunks(poem),
    };
  });
  const voiceCounts = Object.fromEntries(
    Object.keys(voices).map((voice) => [
      voice,
      entries.filter((entry) => entry.voice === voice).length,
    ]),
  );
  const edition = {
    model,
    strategy: "Content-led editorial voice assignment",
    voiceCounts,
    voices: Object.fromEntries(
      entries.map(({ slug, voice, reason }) => [slug, { voice, reason }]),
    ),
  };
  const plan = {
    model,
    strategy: edition.strategy,
    voiceCounts,
    entries,
  };

  await Promise.all([
    writeFile(
      join(root, "content", "poems", "audio-voices.json"),
      `${JSON.stringify(edition, null, 2)}\n`,
    ),
    writeFile(
      join(root, "work", "neural-audio-plan.json"),
      `${JSON.stringify(plan, null, 2)}\n`,
    ),
  ]);

  process.stdout.write(
    `${entries.length} poems · ${JSON.stringify(voiceCounts)} · ${entries.reduce((sum, entry) => sum + entry.chunks.length, 0)} generation chunks\n`,
  );
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}
