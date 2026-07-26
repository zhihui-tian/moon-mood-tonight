import type { Mood, MoodId } from "./types";

export const moods: Mood[] = [
  {
    id: "stillness",
    name: "Stillness",
    chineseName: "静",
    prompt: "A quieter mind",
    description: "For moments of inward calm, clear water, and uncluttered air.",
    invitation: "Let the noise fall away.",
    image: "/poems/05-autumn-evening.jpg",
    accent: "#a8c2bd",
    glow: "#668e87",
  },
  {
    id: "longing",
    name: "Longing",
    chineseName: "思",
    prompt: "Someone absent",
    description: "For distance, waiting, and the person carried in your thoughts.",
    invitation: "Follow the moon across the distance.",
    image: "/poems/04-spring-river.jpg",
    accent: "#d6c5bb",
    glow: "#816e84",
  },
  {
    id: "solitude",
    name: "Solitude",
    chineseName: "独",
    prompt: "Alone, awake",
    description: "For quiet separateness, wandering, and a room with one lamp.",
    invitation: "Stay with the silence awhile.",
    image: "/poems/07-climbing-high.jpg",
    accent: "#b1bac4",
    glow: "#526476",
  },
  {
    id: "melancholy",
    name: "Melancholy",
    chineseName: "愁",
    prompt: "A tender ache",
    description: "For autumn light, what has passed, and feelings without a name.",
    invitation: "Give sorrow a beautiful form.",
    image: "/poems/10-jeweled-zither.jpg",
    accent: "#b9afca",
    glow: "#5d526f",
  },
  {
    id: "joy",
    name: "Joy",
    chineseName: "悦",
    prompt: "Life opening",
    description: "For friendship, spring, wine, laughter, and the quickness of light.",
    invitation: "Raise the cup while the moon is here.",
    image: "/poems/06-bring-in-the-wine.jpg",
    accent: "#e2bd73",
    glow: "#a56e35",
  },
  {
    id: "courage",
    name: "Courage",
    chineseName: "勇",
    prompt: "Fire within",
    description: "For resolve, open horizons, and the strength to move forward.",
    invitation: "Meet the wind without lowering your eyes.",
    image: "/poems/06-bring-in-the-wine.jpg",
    accent: "#d7a760",
    glow: "#984c2d",
  },
  {
    id: "nostalgia",
    name: "Nostalgia",
    chineseName: "忆",
    prompt: "Home, remembered",
    description: "For old rooms, faraway roads, and the places time keeps returning to.",
    invitation: "Let memory find its way home.",
    image: "/poems/08-yellow-crane-tower.jpg",
    accent: "#c8aa8a",
    glow: "#765643",
  },
  {
    id: "wonder",
    name: "Wonder",
    chineseName: "观",
    prompt: "Beyond the known",
    description: "For moonlight, mountains, rivers, and questions larger than a lifetime.",
    invitation: "Look until the familiar becomes immense.",
    image: "/poems/04-spring-river.jpg",
    accent: "#b9ccdc",
    glow: "#486b88",
  },
];

export function isMoodId(value: string | undefined): value is MoodId {
  return moods.some((mood) => mood.id === value);
}

export function getMood(id: string | undefined): Mood | undefined {
  return moods.find((mood) => mood.id === id);
}
