import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("ships a substantial, uniquely addressed poem collection", async () => {
  const catalog = await readFile(new URL("content/poems/catalog.ts", root), "utf8");
  const slugs = [...catalog.matchAll(/^\s+slug: "([^"]+)"/gm)].map(
    (match) => match[1],
  );

  assert.ok(slugs.length >= 24, `expected at least 24 poems, found ${slugs.length}`);
  assert.equal(new Set(slugs).size, slugs.length, "poem slugs must be unique");
  assert.match(catalog, /originalChinese:/);
  assert.match(catalog, /translation:/);
  assert.match(catalog, /interpretation:/);
});

test("defines all eight editorial moods and stable route surfaces", async () => {
  const [moods, home, poemPage, moodPage, explorePage] = await Promise.all([
    readFile(new URL("lib/moods.ts", root), "utf8"),
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("app/poems/[slug]/page.tsx", root), "utf8"),
    readFile(new URL("app/mood/[mood]/page.tsx", root), "utf8"),
    readFile(new URL("app/explore/page.tsx", root), "utf8"),
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
});

test("includes every reused ink-wash landscape", async () => {
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
});
