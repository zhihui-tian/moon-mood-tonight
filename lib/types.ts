export const moodIds = [
  "stillness",
  "longing",
  "solitude",
  "melancholy",
  "joy",
  "courage",
  "nostalgia",
  "wonder",
] as const;

export type MoodId = (typeof moodIds)[number];

export type Poem = {
  slug: string;
  title: string;
  originalTitle: string;
  poet: string;
  poetChinese: string;
  dynasty: string;
  approximateDate?: string;
  originalChinese: string[][];
  translation: string[][];
  moods: Partial<Record<MoodId, number>>;
  themes: string[];
  image: string;
  imageAlt: string;
  introduction: string;
  interpretation: string;
  translator: string;
  license: string;
  source?: string;
  excerpt?: boolean;
  audio?: string;
};

export type Mood = {
  id: MoodId;
  name: string;
  chineseName: string;
  prompt: string;
  description: string;
  invitation: string;
  image: string;
  accent: string;
  glow: string;
};
