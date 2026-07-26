"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const playbackRates = [0.8, 1, 1.2] as const;

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

export function PoemNarration({
  audio,
  lines,
  title,
  onActiveLineChange,
}: {
  audio: string;
  lines: string[][];
  title: string;
  onActiveLineChange: (line: number | null) => void;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<(typeof playbackRates)[number]>(
    1,
  );
  const [hasError, setHasError] = useState(false);
  const flattenedLines = useMemo(() => lines.flat(), [lines]);
  const lineWeights = useMemo(
    () =>
      flattenedLines.map(
        (line) => Math.max(2, [...line.replace(/\s/gu, "")].length) + 2.25,
      ),
    [flattenedLines],
  );
  const activeLine = useMemo(() => {
    if (!duration || !flattenedLines.length) return null;
    const totalWeight = lineWeights.reduce((sum, weight) => sum + weight, 0);
    const position = Math.min(0.9999, currentTime / duration) * totalWeight;
    let accumulated = 0;

    for (let index = 0; index < lineWeights.length; index += 1) {
      accumulated += lineWeights[index];
      if (position < accumulated) return index;
    }

    return flattenedLines.length - 1;
  }, [currentTime, duration, flattenedLines.length, lineWeights]);

  useEffect(() => {
    onActiveLineChange(activeLine);
    return () => onActiveLineChange(null);
  }, [activeLine, onActiveLineChange]);

  async function togglePlayback() {
    const player = audioRef.current;
    if (!player) return;

    if (player.paused) {
      try {
        await player.play();
      } catch {
        setHasError(true);
      }
    } else {
      player.pause();
    }
  }

  async function restart() {
    const player = audioRef.current;
    if (!player) return;
    player.currentTime = 0;
    setCurrentTime(0);
    try {
      await player.play();
    } catch {
      setHasError(true);
    }
  }

  function changePlaybackRate(rate: (typeof playbackRates)[number]) {
    setPlaybackRate(rate);
    if (audioRef.current) audioRef.current.playbackRate = rate;
  }

  function seek(value: number) {
    const player = audioRef.current;
    if (!player) return;
    player.currentTime = value;
    setCurrentTime(value);
  }

  return (
    <section className="narration-player" aria-label={`Chinese reading of ${title}`}>
      <audio
        onDurationChange={(event) => setDuration(event.currentTarget.duration)}
        onEnded={() => {
          setIsPlaying(false);
          onActiveLineChange(null);
        }}
        onError={() => setHasError(true)}
        onPause={() => setIsPlaying(false)}
        onPlay={() => {
          setHasError(false);
          setIsPlaying(true);
        }}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        preload="metadata"
        ref={audioRef}
        src={audio}
      />

      <div className="narration-heading">
        <div>
          <p className="section-label">Listen in Mandarin</p>
          <p className="narration-current" aria-live="polite" lang="zh">
            {hasError
              ? "朗读暂时无法播放"
              : flattenedLines[activeLine ?? 0] ?? "点击播放，慢慢听诗"}
          </p>
        </div>
        <span>{isPlaying ? "Reading" : "Ready"}</span>
      </div>

      <div className="narration-controls">
        <button
          className="narration-primary"
          disabled={hasError}
          onClick={togglePlayback}
          type="button"
        >
          <span aria-hidden="true">{isPlaying ? "Ⅱ" : "▶"}</span>
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button
          className="narration-restart"
          disabled={hasError}
          onClick={restart}
          type="button"
        >
          <span aria-hidden="true">↺</span>
          Restart
        </button>
        <label className="narration-progress">
          <span className="sr-only">Reading position</span>
          <input
            aria-label="Reading position"
            disabled={hasError || !duration}
            max={duration || 0}
            min="0"
            onChange={(event) => seek(Number(event.currentTarget.value))}
            step="0.1"
            type="range"
            value={Math.min(currentTime, duration || 0)}
          />
          <span>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </label>
        <div className="narration-speed" aria-label="Reading speed" role="group">
          {playbackRates.map((rate) => (
            <button
              aria-pressed={playbackRate === rate}
              key={rate}
              onClick={() => changePlaybackRate(rate)}
              type="button"
            >
              {rate}×
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
