import type { Metadata } from "next";
import Link from "next/link";
import { MoodGrid } from "../../components/MoodGrid";
import { SiteFooter } from "../../components/SiteFooter";
import { SiteHeader } from "../../components/SiteHeader";
import { moods } from "../../lib/moods";
import { poems } from "../../lib/poems";

export const metadata: Metadata = {
  title: "About the collection",
  description:
    "How Moon Mood Tonight curates classical Chinese poetry by feeling.",
};

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="about-page">
        <header className="page-intro about-intro">
          <p className="eyebrow">About the collection</p>
          <h1>
            Poetry,
            <br />
            chosen by feeling.
          </h1>
          <p>
            Moon Mood Tonight is a 300-poem bilingual digital exhibition of
            classical Chinese poetry—an invitation to begin with the inner
            weather you already carry.
          </p>
        </header>

        <section className="about-manifesto">
          <p className="section-label">The idea</p>
          <div>
            <h2>
              The first question is not
              <br />
              “What should I read?”
              <br />
              but “How do I feel?”
            </h2>
            <p>
              A poem can belong to Stillness and Wonder, or Longing and
              Nostalgia, at the same time. Each work is therefore assigned a
              set of overlapping, weighted moods rather than one fixed
              category. The expanded anthology uses transparent thematic rules
              that can be refined as the collection grows.
            </p>
          </div>
        </section>

        <section className="about-numbers">
          <div>
            <strong>{poems.length}</strong>
            <span>poems in the first collection</span>
          </div>
          <div>
            <strong>{moods.length}</strong>
            <span>intersecting states of mind</span>
          </div>
          <div>
            <strong>2</strong>
            <span>languages, read alone or together</span>
          </div>
        </section>

        <section className="about-method">
          <div className="about-method-art" aria-hidden="true">
            <img src="/poems/01-the-reeds.jpg" alt="" />
          </div>
          <div>
            <p className="section-label">The editorial method</p>
            <ol>
              <li>
                <span>01</span>
                <div>
                  <h3>Begin with the poem</h3>
                  <p>
                    Read the original closely; preserve its images, movement,
                    pauses, and emotional ambiguity.
                  </p>
                </div>
              </li>
              <li>
                <span>02</span>
                <div>
                  <h3>Present an English rendering</h3>
                  <p>
                    Pair the Chinese text with either a new Moon Mood Tonight
                    rendering or a clearly attributed public-domain translation.
                  </p>
                </div>
              </li>
              <li>
                <span>03</span>
                <div>
                  <h3>Curate emotional resonance</h3>
                  <p>
                    Assign several mood weights through close reading or
                    transparent thematic rules, then explain the strongest
                    relationship.
                  </p>
                </div>
              </li>
              <li>
                <span>04</span>
                <div>
                  <h3>Keep the landscape coherent</h3>
                  <p>
                    Moon-white, ink black, gray-blue, and muted gold form one
                    visual world across the collection.
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </section>

        <section className="legacy-exhibition">
          <p className="section-label">The first exhibition</p>
          <div>
            <h2>Ten Poems Under One Moon</h2>
            <p>
              The original ten-poem journey remains the visual and curatorial
              seed of this larger collection. Moon Mood Tonight changes the
              architecture, not the atmosphere.
            </p>
            <a
              className="text-link"
              href="https://ten-poems-under-one-moon.zhihui2031.chatgpt.site"
            >
              Visit the original exhibition <span aria-hidden="true">↗</span>
            </a>
          </div>
        </section>

        <section className="about-moods">
          <header className="section-heading">
            <div>
              <p className="section-label">Eight entrances</p>
              <h2>Choose the feeling that is present.</h2>
            </div>
            <Link className="text-link" href="/explore">
              Or explore every poem <span aria-hidden="true">→</span>
            </Link>
          </header>
          <MoodGrid compact />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
