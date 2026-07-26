import type { MoodId, Poem } from "./types";

export type WeightedPoem = Pick<Poem, "slug" | "title"> & {
  weight: number;
};

export function choosePoemForMood(
  poems: WeightedPoem[],
  recentlySeen: string[],
  randomValue = Math.random(),
): WeightedPoem | null {
  const eligible = poems.filter((poem) => !recentlySeen.includes(poem.slug));
  const pool = eligible.length > 0 ? eligible : poems;

  if (pool.length === 0) {
    return null;
  }

  const totalWeight = pool.reduce(
    (sum, poem) => sum + Math.max(poem.weight, 0),
    0,
  );

  if (totalWeight <= 0) {
    return pool[0];
  }

  let cursor = Math.min(Math.max(randomValue, 0), 0.999999) * totalWeight;

  for (const poem of pool) {
    cursor -= Math.max(poem.weight, 0);
    if (cursor <= 0) {
      return poem;
    }
  }

  return pool[pool.length - 1];
}

export function historyKey(mood: MoodId): string {
  return `moon-mood-history:${mood}`;
}
