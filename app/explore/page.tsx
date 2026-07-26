import type { Metadata } from "next";
import { ExploreCollection } from "../../components/ExploreCollection";
import { SiteFooter } from "../../components/SiteFooter";
import { SiteHeader } from "../../components/SiteHeader";
import { poems } from "../../lib/poems";

export const metadata: Metadata = {
  title: "Explore the collection",
  description:
    "Explore classical Chinese poems by mood, poet, dynasty, and theme.",
};

export default function ExplorePage() {
  return (
    <>
      <SiteHeader />
      <main className="explore-page">
        <header className="page-intro">
          <p className="eyebrow">The collection</p>
          <h1>
            Find a poem
            <br />
            another way.
          </h1>
          <p>
            Browse {poems.length} works by feeling, poet, dynasty, or theme.
            Every page holds the Chinese original beside an attributed English
            rendering.
          </p>
        </header>
        <ExploreCollection poems={poems} />
      </main>
      <SiteFooter />
    </>
  );
}
