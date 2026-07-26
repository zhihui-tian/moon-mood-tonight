import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PoemExperience } from "../../../components/PoemExperience";
import { SiteFooter } from "../../../components/SiteFooter";
import { SiteHeader } from "../../../components/SiteHeader";
import { moodIds } from "../../../lib/types";
import { getPoem, getPoemsForMood, poems } from "../../../lib/poems";

export function generateStaticParams() {
  return poems.map((poem) => ({ slug: poem.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const poem = getPoem(slug);
  if (!poem) return {};

  return {
    title: `${poem.title} by ${poem.poet}`,
    description: poem.introduction,
  };
}

export default async function PoemPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ mood?: string }>;
}) {
  const [{ slug }, { mood }] = await Promise.all([params, searchParams]);
  const poem = getPoem(slug);
  if (!poem) notFound();

  const alternatives = moodIds.flatMap((moodId) =>
    getPoemsForMood(moodId).map((candidate) => ({
      mood: moodId,
      slug: candidate.slug,
      title: candidate.title,
      weight: candidate.moods[moodId] ?? 0,
    })),
  );

  return (
    <>
      <SiteHeader transparent />
      <PoemExperience
        alternatives={alternatives}
        poem={poem}
        requestedMood={mood}
      />
      <SiteFooter />
    </>
  );
}
