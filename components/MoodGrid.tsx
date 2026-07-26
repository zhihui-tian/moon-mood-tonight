"use client";

import type { CSSProperties } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { moods } from "../lib/moods";
import { getPoemsForMood } from "../lib/poems";
import { choosePoemForMood, historyKey } from "../lib/random-poem";
import type { MoodId } from "../lib/types";

function readHistory(mood: MoodId): string[] {
  try {
    const saved = window.localStorage.getItem(historyKey(mood));
    return saved ? (JSON.parse(saved) as string[]).slice(0, 5) : [];
  } catch {
    return [];
  }
}

function saveHistory(mood: MoodId, slug: string, previous: string[]) {
  try {
    const next = [slug, ...previous.filter((item) => item !== slug)].slice(0, 5);
    window.localStorage.setItem(historyKey(mood), JSON.stringify(next));
  } catch {
    // Recommendations still work when storage is unavailable.
  }
}

export function MoodGrid({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [choosing, setChoosing] = useState<MoodId | null>(null);

  function choose(mood: MoodId) {
    setChoosing(mood);
    const history = readHistory(mood);
    const candidates = getPoemsForMood(mood).map((poem) => ({
      slug: poem.slug,
      title: poem.title,
      weight: poem.moods[mood] ?? 0,
    }));
    const selected = choosePoemForMood(candidates, history);

    if (!selected) {
      router.push(`/mood/${mood}`);
      return;
    }

    saveHistory(mood, selected.slug, history);
    router.push(`/poems/${selected.slug}?mood=${mood}`);
  }

  return (
    <div className={`mood-grid ${compact ? "mood-grid-compact" : ""}`}>
      {moods.map((mood, index) => {
        const style = {
          "--mood-accent": mood.accent,
          "--mood-glow": mood.glow,
          "--mood-image": `url("${mood.image}")`,
        } as CSSProperties;

        return (
          <article
            className="mood-card"
            data-mood={mood.id}
            key={mood.id}
            style={style}
          >
            <button
              type="button"
              onClick={() => choose(mood.id)}
              aria-label={`Receive a poem for ${mood.name}`}
            >
              <span className="mood-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="mood-chinese" aria-hidden="true">
                {mood.chineseName}
              </span>
              <span className="mood-card-copy">
                <strong>{mood.name}</strong>
                <em>
                  {choosing === mood.id ? "Finding your poem…" : mood.prompt}
                </em>
              </span>
              <span className="mood-arrow" aria-hidden="true">
                ↗
              </span>
            </button>
          </article>
        );
      })}
    </div>
  );
}
