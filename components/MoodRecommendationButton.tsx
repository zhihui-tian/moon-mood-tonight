"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { choosePoemForMood, historyKey } from "../lib/random-poem";
import type { MoodId } from "../lib/types";

type Candidate = {
  slug: string;
  title: string;
  weight: number;
};

export function MoodRecommendationButton({
  mood,
  candidates,
  label = "Receive a poem",
}: {
  mood: MoodId;
  candidates: Candidate[];
  label?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  function choose() {
    setLoading(true);
    let history: string[] = [];

    try {
      const saved = window.localStorage.getItem(historyKey(mood));
      history = saved ? (JSON.parse(saved) as string[]).slice(0, 5) : [];
    } catch {
      history = [];
    }

    const selected = choosePoemForMood(candidates, history);
    if (!selected) return;

    try {
      const next = [
        selected.slug,
        ...history.filter((slug) => slug !== selected.slug),
      ].slice(0, 5);
      window.localStorage.setItem(historyKey(mood), JSON.stringify(next));
    } catch {
      // Keep navigation available without browser storage.
    }

    router.push(`/poems/${selected.slug}?mood=${mood}`);
  }

  return (
    <button className="primary-action" type="button" onClick={choose}>
      {loading ? "Listening to the night…" : label}
      <span aria-hidden="true">→</span>
    </button>
  );
}
