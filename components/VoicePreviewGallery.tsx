"use client";

import Link from "next/link";
import { useRef, useState } from "react";

type VoicePreview = {
  audio: string;
  firstLine: string;
  originalTitle: string;
  poetChinese: string;
  slug: string;
  title: string;
  voice: string;
};

const voiceDescriptions: Record<string, string> = {
  Serena: "温柔 · 含蓄",
  Vivian: "清亮 · 灵动",
  Uncle_Fu: "浑厚 · 苍劲",
};

export function VoicePreviewGallery({
  previews,
}: {
  previews: VoicePreview[];
}) {
  const players = useRef(new Map<string, HTMLAudioElement>());
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [failedSlug, setFailedSlug] = useState<string | null>(null);

  async function toggle(slug: string) {
    const selected = players.current.get(slug);
    if (!selected) return;

    for (const [otherSlug, player] of players.current) {
      if (otherSlug !== slug) player.pause();
    }

    if (selected.paused) {
      try {
        setFailedSlug(null);
        await selected.play();
        setActiveSlug(slug);
      } catch {
        setFailedSlug(slug);
        setActiveSlug(null);
      }
    } else {
      selected.pause();
      setActiveSlug(null);
    }
  }

  return (
    <div className="voice-preview-grid">
      {previews.map((preview, index) => {
        const voiceLabel = preview.voice.replaceAll("_", " ");
        const isPlaying = activeSlug === preview.slug;
        const hasFailed = failedSlug === preview.slug;

        return (
          <article className="voice-preview-card" key={preview.slug}>
            <audio
              onEnded={() => setActiveSlug(null)}
              onError={() => {
                setFailedSlug(preview.slug);
                setActiveSlug(null);
              }}
              onPause={() => {
                if (activeSlug === preview.slug) setActiveSlug(null);
              }}
              preload="metadata"
              ref={(node) => {
                if (node) players.current.set(preview.slug, node);
                else players.current.delete(preview.slug);
              }}
              src={preview.audio}
            />

            <div className="voice-preview-number">
              {String(index + 1).padStart(2, "0")}
            </div>
            <div className="voice-preview-title">
              <p>
                {preview.poetChinese} · {voiceLabel}
              </p>
              <h3 lang="zh">{preview.originalTitle}</h3>
              <span>{preview.title}</span>
            </div>
            <blockquote lang="zh">“{preview.firstLine}”</blockquote>
            <p className="voice-preview-character">
              {voiceDescriptions[preview.voice] ?? "自然 · 从容"}
            </p>
            <div className="voice-preview-actions">
              <button
                aria-label={`${isPlaying ? "暂停" : "试听"}《${preview.originalTitle}》`}
                disabled={hasFailed}
                onClick={() => toggle(preview.slug)}
                type="button"
              >
                <span aria-hidden="true">{isPlaying ? "Ⅱ" : "▶"}</span>
                {hasFailed ? "暂时无法播放" : isPlaying ? "暂停" : "试听"}
              </button>
              <Link href={`/poems/${preview.slug}#read`}>
                打开全诗 <span aria-hidden="true">→</span>
              </Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}
