import type { Metadata } from "next";
import Link from "next/link";
import { MoodGrid } from "../components/MoodGrid";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { VoicePreviewGallery } from "../components/VoicePreviewGallery";
import { moods } from "../lib/moods";
import { narrationPreviewSlugs, poems } from "../lib/poems";

export const metadata: Metadata = {
  title: "Classical Chinese poetry for the way you feel tonight",
  description:
    "Choose from eight states of mind and receive one of 300 classical Chinese poems in a bilingual reading.",
};

const featuredSlugs = [
  "spring-river-flower-moon-night",
  "river-snow",
  "prelude-to-water-melody",
];

export default function Home() {
  const featured = featuredSlugs
    .map((slug) => poems.find((poem) => poem.slug === slug))
    .filter((poem) => poem !== undefined);
  const voicePreviews = narrationPreviewSlugs
    .map((slug) => poems.find((poem) => poem.slug === slug))
    .filter(
      (poem): poem is (typeof poems)[number] & {
        audio: string;
        audioVoice: string;
      } => Boolean(poem?.audio && poem.audioVoice),
    )
    .map((poem) => ({
      audio: poem.audio,
      firstLine: poem.originalChinese[0]?.[0] ?? poem.originalTitle,
      originalTitle: poem.originalTitle,
      poetChinese: poem.poetChinese,
      slug: poem.slug,
      title: poem.title,
      voice: poem.audioVoice,
    }));

  return (
    <>
      <SiteHeader transparent />
      <main>
        <section className="home-hero">
          <div className="home-moon" aria-hidden="true">
            <span />
          </div>
          <div className="home-hero-copy">
            <p className="eyebrow">Classical Chinese poetry · Curated by feeling</p>
            <h1>
              How does
              <br />
              tonight feel?
            </h1>
            <p>
              Choose a state of mind,
              <br />
              and receive a poem.
            </p>
            <a className="begin-link" href="#moods">
              Find your poem <span aria-hidden="true">↓</span>
            </a>
          </div>
          <p className="hero-side-note">
            {poems.length} poems · {moods.length} moods · one shared moon
          </p>
        </section>

        <section className="mood-section" id="moods">
          <header className="section-heading">
            <div>
              <p className="section-label">Choose your mood</p>
              <h2>What is moving through you?</h2>
            </div>
            <p>
              There is no wrong choice. A poem may belong to more than one
              feeling—just as you do.
            </p>
          </header>
          <MoodGrid />
        </section>

        <section className="editorial-section">
          <div className="editorial-image" aria-hidden="true">
            <img src="/poems/04-spring-river.jpg" alt="" />
          </div>
          <div className="editorial-copy">
            <p className="section-label">Under one moon</p>
            <h2>
              A poem is not an answer.
              <br />
              It is company.
            </h2>
            <p>
              These poems were written across two thousand years, yet their
              weather is still familiar: waiting, wonder, homesickness, resolve,
              and the quiet after rain.
            </p>
            <Link className="text-link" href="/about">
              How this collection is made <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>

        <section className="voice-preview-section" id="listen">
          <header className="section-heading">
            <div>
              <p className="section-label">先听六首 · Neural voice preview</p>
              <h2>让声音跟着诗走。</h2>
            </div>
            <p>
              边塞诗用浑厚苍劲的声音，春景用清亮灵动的声音，思乡与怀人则更温柔克制。
              先试听这六首，再决定其余诗的声音。
            </p>
          </header>
          <VoicePreviewGallery previews={voicePreviews} />
        </section>

        <section className="featured-section">
          <header className="section-heading">
            <div>
              <p className="section-label">Three ways into the night</p>
              <h2>Begin anywhere.</h2>
            </div>
            <Link className="text-link" href="/explore">
              Explore all {poems.length} poems <span aria-hidden="true">→</span>
            </Link>
          </header>
          <div className="featured-poems">
            {featured.map((poem, index) => (
              <Link href={`/poems/${poem.slug}`} key={poem.slug}>
                <div>
                  <img alt="" loading="lazy" src={poem.image} />
                </div>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>
                  {poem.poet} · {poem.dynasty}
                </p>
                <h3>{poem.title}</h3>
                <em lang="zh">{poem.originalTitle}</em>
              </Link>
            ))}
          </div>
        </section>

        <section className="closing-invitation">
          <div className="closing-orbit" aria-hidden="true" />
          <p className="section-label">The night is listening</p>
          <h2>Choose what you feel now.</h2>
          <a href="#moods">
            Return to the moods <span aria-hidden="true">↑</span>
          </a>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
