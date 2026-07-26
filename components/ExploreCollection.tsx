"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { moods } from "../lib/moods";
import type { MoodId, Poem } from "../lib/types";

export function ExploreCollection({ poems }: { poems: Poem[] }) {
  const [query, setQuery] = useState("");
  const [mood, setMood] = useState<"all" | MoodId>("all");
  const [dynasty, setDynasty] = useState("all");
  const [poet, setPoet] = useState("all");
  const [theme, setTheme] = useState("all");

  const dynasties = useMemo(
    () => [...new Set(poems.map((item) => item.dynasty))].sort(),
    [poems],
  );
  const poets = useMemo(
    () => [...new Set(poems.map((item) => item.poet))].sort(),
    [poems],
  );
  const themes = useMemo(
    () => [...new Set(poems.flatMap((item) => item.themes))].sort(),
    [poems],
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return poems.filter((item) => {
      const matchesQuery =
        !normalized ||
        [
          item.title,
          item.originalTitle,
          item.poet,
          item.poetChinese,
          ...item.themes,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalized);
      const matchesMood = mood === "all" || item.moods[mood] !== undefined;
      const matchesDynasty = dynasty === "all" || item.dynasty === dynasty;
      const matchesPoet = poet === "all" || item.poet === poet;
      const matchesTheme = theme === "all" || item.themes.includes(theme);

      return (
        matchesQuery &&
        matchesMood &&
        matchesDynasty &&
        matchesPoet &&
        matchesTheme
      );
    });
  }, [dynasty, mood, poet, poems, query, theme]);

  function clearFilters() {
    setQuery("");
    setMood("all");
    setDynasty("all");
    setPoet("all");
    setTheme("all");
  }

  return (
    <>
      <section className="explore-controls" aria-label="Filter poems">
        <label className="search-field">
          <span>Search the collection</span>
          <input
            type="search"
            placeholder="A title, poet, theme, or 中文…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <div className="mood-filters" role="group" aria-label="Filter by mood">
          <button
            aria-pressed={mood === "all"}
            onClick={() => setMood("all")}
            type="button"
          >
            All moods
          </button>
          {moods.map((item) => (
            <button
              aria-pressed={mood === item.id}
              key={item.id}
              onClick={() => setMood(item.id)}
              type="button"
            >
              {item.name}
            </button>
          ))}
        </div>
        <div className="select-filters">
          <label>
            <span>Dynasty</span>
            <select
              value={dynasty}
              onChange={(event) => setDynasty(event.target.value)}
            >
              <option value="all">All dynasties</option>
              {dynasties.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Poet</span>
            <select value={poet} onChange={(event) => setPoet(event.target.value)}>
              <option value="all">All poets</option>
              {poets.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Theme</span>
            <select
              value={theme}
              onChange={(event) => setTheme(event.target.value)}
            >
              <option value="all">All themes</option>
              {themes.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <button className="clear-filters" onClick={clearFilters} type="button">
            Clear
          </button>
        </div>
      </section>

      <div className="collection-meta" aria-live="polite">
        <p>
          {filtered.length} {filtered.length === 1 ? "poem" : "poems"}
        </p>
        <span>Every poem has a stable page you can share.</span>
      </div>

      <section className="poem-grid" aria-label="Poem collection">
        {filtered.map((item, index) => {
          const primaryMood = moods
            .filter((candidate) => item.moods[candidate.id] !== undefined)
            .sort(
              (left, right) =>
                (item.moods[right.id] ?? 0) -
                (item.moods[left.id] ?? 0),
            )[0];

          return (
            <Link className="poem-tile" href={`/poems/${item.slug}`} key={item.slug}>
              <div className="poem-tile-art">
                <img alt="" loading="lazy" src={item.image} />
              </div>
              <span className="poem-tile-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="poem-tile-copy">
                <p>
                  {item.poet} · {item.dynasty}
                </p>
                <h2>{item.title}</h2>
                <span lang="zh-Hans">{item.originalTitle}</span>
              </div>
              {primaryMood && (
                <small>
                  {primaryMood.chineseName} {primaryMood.name}
                </small>
              )}
            </Link>
          );
        })}
      </section>

      {filtered.length === 0 && (
        <section className="empty-state">
          <p>No poem is waiting at this exact crossing—yet.</p>
          <button onClick={clearFilters} type="button">
            Return to the full collection
          </button>
        </section>
      )}
    </>
  );
}
