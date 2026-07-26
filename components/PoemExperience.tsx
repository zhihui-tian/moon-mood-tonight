"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getMood, isMoodId, moods } from "../lib/moods";
import { choosePoemForMood, historyKey } from "../lib/random-poem";
import type { MoodId, Poem } from "../lib/types";

type ReadingMode = "english" | "chinese" | "both";

function strongestMood(poem: Poem): MoodId {
  return (
    (Object.entries(poem.moods).sort(
      ([, left], [, right]) => (right ?? 0) - (left ?? 0),
    )[0]?.[0] as MoodId | undefined) ?? "wonder"
  );
}

export function PoemExperience({
  poem,
  requestedMood,
  alternatives,
}: {
  poem: Poem;
  requestedMood?: string;
  alternatives: { mood: MoodId; slug: string; title: string; weight: number }[];
}) {
  const router = useRouter();
  const [mode, setMode] = useState<ReadingMode>("both");
  const [shareStatus, setShareStatus] = useState("");
  const activeMood = isMoodId(requestedMood)
    ? requestedMood
    : strongestMood(poem);
  const mood = getMood(activeMood)!;
  const moodAlternatives = useMemo(
    () => alternatives.filter((item) => item.mood === activeMood),
    [activeMood, alternatives],
  );

  useEffect(() => {
    try {
      const key = historyKey(activeMood);
      const saved = window.localStorage.getItem(key);
      const history = saved ? (JSON.parse(saved) as string[]) : [];
      const next = [
        poem.slug,
        ...history.filter((slug) => slug !== poem.slug),
      ].slice(0, 5);
      window.localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // Reading does not depend on storage.
    }
  }, [activeMood, poem.slug]);

  function chooseAnother() {
    let history: string[] = [poem.slug];
    try {
      const saved = window.localStorage.getItem(historyKey(activeMood));
      history = saved ? (JSON.parse(saved) as string[]) : history;
    } catch {
      history = [poem.slug];
    }

    const selected = choosePoemForMood(moodAlternatives, history);
    if (!selected) return;
    router.push(`/poems/${selected.slug}?mood=${activeMood}`);
  }

  async function share() {
    const shareData = {
      title: `${poem.title} · Moon Mood Tonight`,
      text: `${poem.title} by ${poem.poet} — a poem for ${mood.name.toLowerCase()}.`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareStatus("Shared");
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShareStatus("Link copied");
      }
    } catch {
      setShareStatus("");
    }
  }

  const style = {
    "--mood-accent": mood.accent,
    "--mood-glow": mood.glow,
  } as CSSProperties;

  return (
    <main className="poem-experience" style={style}>
      <section className="poem-hero">
        <div className="poem-art" aria-hidden="true">
          <img src={poem.image} alt="" />
        </div>
        <div className="poem-hero-overlay" />
        <div className="poem-hero-content">
          <Link className="poem-mood-kicker" href={`/mood/${mood.id}`}>
            <span>{mood.chineseName}</span>
            A poem for {mood.name}
          </Link>
          <p className="poem-dynasty">
            {poem.dynasty}
            {poem.approximateDate ? ` · ${poem.approximateDate}` : ""}
          </p>
          <h1>{poem.title}</h1>
          <p className="original-title">{poem.originalTitle}</p>
          <p className="poem-byline">
            {poem.poet} <span>{poem.poetChinese}</span>
          </p>
          <a className="scroll-to-poem" href="#read">
            Read slowly <span aria-hidden="true">↓</span>
          </a>
        </div>
      </section>

      <section className="reading-room" id="read">
        <div className="reading-toolbar" aria-label="Reading language">
          <p>{poem.excerpt ? "Curated passage" : "Complete poem"}</p>
          <div role="group" aria-label="Choose a reading language">
            {(["english", "chinese", "both"] as ReadingMode[]).map((option) => (
              <button
                aria-pressed={mode === option}
                key={option}
                onClick={() => setMode(option)}
                type="button"
              >
                {option === "english"
                  ? "English"
                  : option === "chinese"
                    ? "中文"
                    : "Both"}
              </button>
            ))}
          </div>
        </div>

        <div className={`poem-reading poem-reading-${mode}`}>
          {mode !== "chinese" && (
            <article className="translation-column">
              <p className="language-label">English rendering</p>
              {poem.translation.map((stanza, stanzaIndex) => (
                <p className="stanza" key={`translation-${stanzaIndex}`}>
                  {stanza.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </p>
              ))}
            </article>
          )}
          {mode !== "english" && (
            <article className="original-column" lang="zh">
              <p className="language-label">中文原文</p>
              {poem.originalChinese.map((stanza, stanzaIndex) => (
                <p className="stanza" key={`original-${stanzaIndex}`}>
                  {stanza.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </p>
              ))}
            </article>
          )}
        </div>
      </section>

      <section className="poem-context">
        <div>
          <p className="section-label">Before you leave the poem</p>
          <h2>A little context</h2>
        </div>
        <div className="context-copy">
          <p>{poem.introduction}</p>
          <blockquote>{poem.interpretation}</blockquote>
          <p className="poem-credit">
            English: {poem.translator} · {poem.license}
            {poem.source ? (
              <>
                {" · "}
                <a href={poem.source} rel="noreferrer" target="_blank">
                  Source collection
                </a>
              </>
            ) : null}
          </p>
        </div>
      </section>

      <section className="poem-moods">
        <p className="section-label">This poem can also meet you in</p>
        <div>
          {moods
            .filter((item) => poem.moods[item.id] !== undefined)
            .sort(
              (left, right) =>
                (poem.moods[right.id] ?? 0) - (poem.moods[left.id] ?? 0),
            )
            .map((item) => (
              <Link href={`/mood/${item.id}`} key={item.id}>
                <span>{item.chineseName}</span>
                {item.name}
                <small>
                  {Math.round((poem.moods[item.id] ?? 0) * 100)}% resonance
                </small>
              </Link>
            ))}
        </div>
      </section>

      <section className="poem-actions">
        <div>
          <p className="section-label">Stay with this feeling</p>
          <h2>{mood.invitation}</h2>
        </div>
        <div className="action-row">
          <button className="primary-action" type="button" onClick={chooseAnother}>
            Another poem
            <span aria-hidden="true">→</span>
          </button>
          <button className="secondary-action" type="button" onClick={share}>
            {shareStatus || "Share this poem"}
          </button>
          <Link className="secondary-action" href="/explore">
            Explore the collection
          </Link>
        </div>
      </section>
    </main>
  );
}
