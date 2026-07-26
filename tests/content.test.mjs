import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("ships exactly 300 uniquely addressed poems", async () => {
  const [catalog, anthology] = await Promise.all([
    readFile(new URL("content/poems/catalog.ts", root), "utf8"),
    readFile(new URL("content/poems/tang-anthology.ts", root), "utf8"),
  ]);
  const slugs = [...`${catalog}\n${anthology}`.matchAll(/^\s+"?slug"?: "([^"]+)"/gm)].map(
    (match) => match[1],
  );
  const anthologyPoems = JSON.parse(
    anthology.slice(anthology.indexOf("= [") + 2, anthology.lastIndexOf("]") + 1),
  );

  assert.equal(slugs.length, 300, `expected 300 poems, found ${slugs.length}`);
  assert.equal(new Set(slugs).size, slugs.length, "poem slugs must be unique");
  assert.equal(anthologyPoems.length, 272);
  for (const poem of anthologyPoems) {
    assert.ok(poem.originalChinese.flat().length >= 2, `${poem.slug} needs Chinese text`);
    assert.ok(poem.translation.flat().length >= 2, `${poem.slug} needs English text`);
    assert.ok(Object.keys(poem.moods).length >= 2, `${poem.slug} needs overlapping moods`);
    assert.ok(poem.themes.length >= 2, `${poem.slug} needs themes`);
    assert.ok(poem.source.startsWith("https://"), `${poem.slug} needs source attribution`);
  }
  assert.match(anthology, /"originalChinese":/);
  assert.match(anthology, /"translation":/);
  assert.match(anthology, /"interpretation":/);
  assert.doesNotMatch(
    anthology,
    /"slug": "[^"]+-(001|003|039|040|042|083|084|190|191|193)"/,
    "later copyrighted translation exceptions must remain excluded",
  );
});

test("defines all eight editorial moods and stable route surfaces", async () => {
  const [
    moods,
    home,
    poemPage,
    poemExperience,
    sectionImages,
    moodPage,
    explorePage,
    styles,
  ] = await Promise.all([
    readFile(new URL("lib/moods.ts", root), "utf8"),
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("app/poems/[slug]/page.tsx", root), "utf8"),
    readFile(new URL("components/PoemExperience.tsx", root), "utf8"),
    readFile(new URL("lib/poem-section-images.ts", root), "utf8"),
    readFile(new URL("app/mood/[mood]/page.tsx", root), "utf8"),
    readFile(new URL("app/explore/page.tsx", root), "utf8"),
    readFile(new URL("app/globals.css", root), "utf8"),
  ]);

  for (const mood of [
    "stillness",
    "longing",
    "solitude",
    "melancholy",
    "joy",
    "courage",
    "nostalgia",
    "wonder",
  ]) {
    assert.match(moods, new RegExp(`id: "${mood}"`));
  }

  assert.match(home, /<MoodGrid/);
  assert.match(poemPage, /generateStaticParams/);
  assert.match(moodPage, /MoodRecommendationButton/);
  assert.match(explorePage, /ExploreCollection/);
  for (const image of [
    "--reading-image",
    "--context-image",
    "--moods-image",
    "--actions-image",
  ]) {
    assert.match(poemExperience, new RegExp(`"${image}": \\\`url`));
  }
  assert.match(moodPage, /className="mood-poem-art"/);
  assert.match(moodPage, /"--mood-image": `url/);
  assert.match(styles, /var\(--reading-image\) center \/ cover/);
  assert.match(styles, /var\(--context-image\) center \/ cover/);
  assert.match(styles, /var\(--moods-image\) center 62% \/ cover/);
  assert.match(styles, /var\(--actions-image\) center 74% \/ cover/);
  assert.match(styles, /var\(--mood-image\) center \/ cover/);
  assert.match(sectionImages, /artwork\.src === poem\.image/);
  assert.match(sectionImages, /\.slice\(0, 4\)/);
});

test("includes every reused ink-wash landscape and six poem-specific pilots", async () => {
  await Promise.all(
    Array.from({ length: 10 }, (_, index) => {
      const number = String(index + 1).padStart(2, "0");
      const names = [
        "the-reeds",
        "long-road",
        "drinking-wine",
        "spring-river",
        "autumn-evening",
        "bring-in-the-wine",
        "climbing-high",
        "yellow-crane-tower",
        "song-of-the-pipa",
        "jeweled-zither",
      ];
      return access(new URL(`public/poems/${number}-${names[index]}.jpg`, root));
    }),
  );

  const pilotImages = [
    "11-frontier-song.png",
    "12-liangzhou-song.png",
    "13-spring-morning.png",
    "14-mount-lu-waterfall.png",
    "15-quiet-night-thought.png",
    "16-the-reeds.png",
  ];
  await Promise.all(
    pilotImages.map(async (name) => {
      const image = new URL(`public/poems/${name}`, root);
      await access(image);
      const file = await stat(image);
      assert.ok(file.size > 1_000_000, `${name} should retain full artwork detail`);
    }),
  );
});

test("ships one content-directed neural Mandarin narration for every poem", async () => {
  const [manifestSource, voiceEditionSource, player, catalog] = await Promise.all([
    readFile(new URL("public/audio/zh/manifest.json", root), "utf8"),
    readFile(new URL("content/poems/audio-voices.json", root), "utf8"),
    readFile(new URL("components/PoemNarration.tsx", root), "utf8"),
    readFile(new URL("content/poems/catalog.ts", root), "utf8"),
  ]);
  const manifest = JSON.parse(manifestSource);
  const voiceEdition = JSON.parse(voiceEditionSource);
  const slugs = manifest.poems.map((poem) => poem.slug);
  const allowedVoices = new Set(["Serena", "Vivian", "Uncle_Fu"]);

  assert.equal(manifest.count, 300);
  assert.equal(slugs.length, 300);
  assert.equal(new Set(slugs).size, 300);
  assert.match(manifest.model, /Qwen3-TTS-12Hz-1\.7B-CustomVoice/);
  assert.equal(manifest.locale, "zh_CN");
  assert.equal(manifest.sampleRate, 24_000);
  assert.deepEqual(manifest.voiceCounts, {
    Serena: 155,
    Vivian: 75,
    Uncle_Fu: 70,
  });
  assert.equal(Object.keys(voiceEdition.voices).length, 300);
  assert.ok(manifest.totalDurationSeconds > 8_000);
  assert.ok(manifest.totalBytes > 120_000_000);
  assert.match(catalog, /audio: `\/audio\/zh\/\$\{poem\.slug\}\.mp3`/);
  assert.match(catalog, /audioVoice: audioVoices\[poem\.slug\]\?\.voice/);
  assert.match(player, /<audio/);
  assert.match(player, /const playbackRates = \[0\.8, 1, 1\.2\]/);
  assert.match(player, /onActiveLineChange/);
  assert.match(player, /voice\.replaceAll/);

  await Promise.all(
    manifest.poems.map(async (poem) => {
      const audio = new URL(`public${poem.file}`, root);
      const file = await stat(audio);
      assert.ok(file.size > 4_096, `${poem.slug} narration is incomplete`);
      assert.equal(file.size, poem.bytes, `${poem.slug} byte count drifted`);
      assert.ok(poem.durationSeconds > 1, `${poem.slug} duration is invalid`);
      assert.ok(allowedVoices.has(poem.voice), `${poem.slug} has unknown voice`);
      assert.equal(
        poem.voice,
        voiceEdition.voices[poem.slug].voice,
        `${poem.slug} voice assignment drifted`,
      );
    }),
  );
});
