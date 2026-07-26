from __future__ import annotations

import argparse
import json
import os
import re
import time
from pathlib import Path

import numpy as np
from mlx_audio.tts.utils import load_model
from scipy.io import wavfile


ROOT = Path(__file__).resolve().parent.parent
PLAN_PATH = ROOT / "work" / "neural-audio-plan.json"
CHUNK_DIRECTORY = ROOT / "work" / "neural-audio-chunks"
OUTPUT_DIRECTORY = ROOT / "work" / "neural-audio-wav"
TARGET_RMS = 0.085
MAX_PEAK = 0.95
CHUNK_PAUSE_SECONDS = 0.42


def parse_arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate content-directed Qwen3-TTS readings."
    )
    parser.add_argument("--batch-size", type=int, default=8)
    parser.add_argument("--limit", type=int)
    parser.add_argument("--force", action="store_true")
    return parser.parse_args()


def normalize_audio(audio: np.ndarray) -> np.ndarray:
    flattened = np.asarray(audio, dtype=np.float32).reshape(-1)
    rms = float(np.sqrt(np.mean(flattened**2))) if flattened.size else 0.0
    if rms:
        flattened = flattened * min(TARGET_RMS / rms, 3.0)
    peak = float(np.max(np.abs(flattened))) if flattened.size else 0.0
    if peak > MAX_PEAK:
        flattened = flattened * (MAX_PEAK / peak)
    return flattened


def save_pcm16(path: Path, audio: np.ndarray, sample_rate: int) -> None:
    normalized = normalize_audio(audio)
    pcm = np.round(np.clip(normalized, -1.0, 1.0) * 32767).astype(np.int16)
    wavfile.write(path, sample_rate, pcm)


def chunk_path(task: dict) -> Path:
    return CHUNK_DIRECTORY / f"{task['slug']}--{task['chunkIndex']:02d}.wav"


def valid_wav(path: Path) -> bool:
    if not path.exists() or path.stat().st_size < 4096:
        return False
    try:
        sample_rate, audio = wavfile.read(path)
        return sample_rate == 24000 and audio.size > sample_rate
    except Exception:
        return False


def text_characters(text: str) -> int:
    return len(re.sub(r"[\s，。！？；：、,.!?;:]", "", text))


def duration_is_suspicious(text: str, duration: float) -> bool:
    characters = max(1, text_characters(text))
    characters_per_second = characters / max(duration, 0.01)
    return characters_per_second < 1.35 or characters_per_second > 4.5


def generate_individually(model, task: dict):
    results = list(
        model.generate(
            text=task["text"],
            voice=task["voice"],
            instruct=task["style"],
            lang_code="Chinese",
            temperature=0.75,
            top_p=0.9,
            repetition_penalty=1.1,
            max_tokens=4096,
        )
    )
    if not results:
        raise RuntimeError(f"No audio returned for {task['id']}")
    sample_rate = results[0].sample_rate
    return np.concatenate([np.asarray(result.audio) for result in results]), sample_rate


def generate_batch(model, batch: list[dict]) -> dict[int, tuple[np.ndarray, int]]:
    generated = {}
    for result in model.batch_generate(
        texts=[task["text"] for task in batch],
        voices=[task["voice"] for task in batch],
        instructs=[task["style"] for task in batch],
        lang_code="Chinese",
        temperature=0.75,
        top_p=0.9,
        repetition_penalty=1.1,
        max_tokens=4096,
    ):
        generated[result.sequence_idx] = (
            np.asarray(result.audio),
            result.sample_rate,
        )
    return generated


def build_tasks(entries: list[dict]) -> list[dict]:
    tasks = []
    for entry in entries:
        for chunk_index, text in enumerate(entry["chunks"]):
            tasks.append(
                {
                    "id": f"{entry['slug']}--{chunk_index:02d}",
                    "slug": entry["slug"],
                    "chunkIndex": chunk_index,
                    "text": text,
                    "voice": entry["voice"],
                    "style": entry["style"],
                }
            )
    return tasks


def assemble_poem(entry: dict) -> dict:
    parts = []
    sample_rate = None
    for chunk_index, _text in enumerate(entry["chunks"]):
        path = CHUNK_DIRECTORY / f"{entry['slug']}--{chunk_index:02d}.wav"
        current_rate, audio = wavfile.read(path)
        if sample_rate is None:
            sample_rate = current_rate
        elif sample_rate != current_rate:
            raise RuntimeError(f"Sample-rate mismatch for {entry['slug']}")
        if parts:
            parts.append(np.zeros(round(sample_rate * CHUNK_PAUSE_SECONDS), dtype=np.int16))
        parts.append(np.asarray(audio, dtype=np.int16))

    joined = np.concatenate(parts)
    target = OUTPUT_DIRECTORY / f"{entry['slug']}.wav"
    wavfile.write(target, sample_rate, joined)
    return {
        "slug": entry["slug"],
        "voice": entry["voice"],
        "reason": entry["reason"],
        "characters": entry["characters"],
        "chunks": len(entry["chunks"]),
        "wavPath": str(target.resolve()),
        "sampleRate": sample_rate,
        "durationSeconds": round(joined.size / sample_rate, 2),
        "bytes": target.stat().st_size,
    }


def main() -> None:
    arguments = parse_arguments()
    plan = json.loads(PLAN_PATH.read_text(encoding="utf-8"))
    entries = plan["entries"]
    if arguments.limit is not None:
        entries = entries[: max(0, arguments.limit)]

    CHUNK_DIRECTORY.mkdir(parents=True, exist_ok=True)
    OUTPUT_DIRECTORY.mkdir(parents=True, exist_ok=True)
    tasks = build_tasks(entries)
    pending = [
        task
        for task in tasks
        if arguments.force or not valid_wav(chunk_path(task))
    ]
    pending.sort(key=lambda task: len(task["text"]))

    print(
        f"Loading {plan['model']} · {len(entries)} poems · "
        f"{len(tasks)} chunks · {len(pending)} pending",
        flush=True,
    )
    model = load_model(plan["model"]) if pending else None
    suspicious = []
    completed = len(tasks) - len(pending)
    started = time.perf_counter()

    for batch_start in range(0, len(pending), max(1, arguments.batch_size)):
        batch = pending[batch_start : batch_start + max(1, arguments.batch_size)]
        try:
            generated = generate_batch(model, batch)
        except Exception as batch_error:
            print(
                f"Batch fallback after {type(batch_error).__name__}: {batch_error}",
                flush=True,
            )
            generated = {}

        for index, task in enumerate(batch):
            result = generated.get(index)
            if result is None:
                result = generate_individually(model, task)
            audio, sample_rate = result
            target = chunk_path(task)
            save_pcm16(target, audio, sample_rate)
            duration = np.asarray(audio).size / sample_rate
            if duration_is_suspicious(task["text"], duration):
                suspicious.append(
                    {
                        "id": task["id"],
                        "characters": text_characters(task["text"]),
                        "durationSeconds": round(duration, 2),
                    }
                )

        completed += len(batch)
        elapsed = time.perf_counter() - started
        print(
            f"Chunks {completed}/{len(tasks)} · "
            f"batch {len(batch)} · elapsed {elapsed / 60:.1f} min",
            flush=True,
        )

    poem_entries = [assemble_poem(entry) for entry in entries]
    manifest = {
        "model": plan["model"],
        "strategy": plan["strategy"],
        "voiceCounts": {
            voice: sum(1 for entry in poem_entries if entry["voice"] == voice)
            for voice in ("Serena", "Vivian", "Uncle_Fu")
        },
        "count": len(poem_entries),
        "totalDurationSeconds": round(
            sum(entry["durationSeconds"] for entry in poem_entries), 2
        ),
        "totalBytes": sum(entry["bytes"] for entry in poem_entries),
        "suspiciousChunks": suspicious,
        "poems": poem_entries,
    }
    manifest_path = OUTPUT_DIRECTORY / "manifest.json"
    manifest_path.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(
        f"Completed {len(poem_entries)} poems · "
        f"{manifest['totalDurationSeconds'] / 60:.1f} minutes · "
        f"{manifest['totalBytes'] / 1024 / 1024:.1f} MB WAV · "
        f"{len(suspicious)} suspicious chunks",
        flush=True,
    )


if __name__ == "__main__":
    main()
