import { narrationPreviewSlugs, poems } from "../content/poems/catalog";
import type { MoodId } from "./types";

export { narrationPreviewSlugs, poems };

export function getPoem(slug: string | undefined) {
  return poems.find((poem) => poem.slug === slug);
}

export function getPoemsForMood(mood: MoodId) {
  return poems
    .filter((poem) => poem.moods[mood] !== undefined)
    .sort((a, b) => (b.moods[mood] ?? 0) - (a.moods[mood] ?? 0));
}

export const poets = [...new Set(poems.map((poem) => poem.poet))].sort();
export const dynasties = [...new Set(poems.map((poem) => poem.dynasty))].sort();
export const themes = [...new Set(poems.flatMap((poem) => poem.themes))].sort();
