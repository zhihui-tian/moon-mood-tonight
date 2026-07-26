import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MoodRecommendationButton } from "../../../components/MoodRecommendationButton";
import { SiteFooter } from "../../../components/SiteFooter";
import { SiteHeader } from "../../../components/SiteHeader";
import { getMood, moods } from "../../../lib/moods";
import { getPoemsForMood } from "../../../lib/poems";

export function generateStaticParams() {
  return moods.map((mood) => ({ mood: mood.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ mood: string }>;
}): Promise<Metadata> {
  const { mood: moodId } = await params;
  const mood = getMood(moodId);
  if (!mood) return {};

  return {
    title: `Poems for ${mood.name}`,
    description: mood.description,
  };
}

export default async function MoodPage({
  params,
}: {
  params: Promise<{ mood: string }>;
}) {
  const { mood: moodId } = await params;
  const mood = getMood(moodId);
  if (!mood) notFound();

  const matching = getPoemsForMood(mood.id);
  const style = {
    "--mood-accent": mood.accent,
    "--mood-glow": mood.glow,
  } as CSSProperties;

  return (
    <>
      <SiteHeader transparent />
      <main className="mood-page" style={style}>
        <section className="mood-hero">
          <div className="mood-hero-art" aria-hidden="true">
            <img src={mood.image} alt="" />
          </div>
          <div className="mood-hero-overlay" />
          <div className="mood-hero-copy">
            <p className="eyebrow">Tonight feels like</p>
            <span className="mood-page-chinese">{mood.chineseName}</span>
            <h1>{mood.name}</h1>
            <p>{mood.description}</p>
            <MoodRecommendationButton
              mood={mood.id}
              candidates={matching.map((poem) => ({
                slug: poem.slug,
                title: poem.title,
                weight: poem.moods[mood.id] ?? 0,
              }))}
            />
          </div>
        </section>

        <section className="mood-collection">
          <header className="section-heading">
            <div>
              <p className="section-label">The {mood.name} constellation</p>
              <h2>{matching.length} poems resonate here.</h2>
            </div>
            <p>
              The recommendation is weighted by editorial resonance and avoids
              the poems you have just read.
            </p>
          </header>
          <div className="mood-poem-list">
            {matching.map((poem, index) => (
              <Link
                href={`/poems/${poem.slug}?mood=${mood.id}`}
                key={poem.slug}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <p>
                    {poem.poet} · {poem.dynasty}
                  </p>
                  <h3>{poem.title}</h3>
                </div>
                <em lang="zh-Hans">{poem.originalTitle}</em>
                <small>
                  {Math.round((poem.moods[mood.id] ?? 0) * 100)}%
                </small>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
