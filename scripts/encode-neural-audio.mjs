import { Mp3Encoder } from "@breezystack/lamejs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const root = resolve(scriptDirectory, "..");
const sourceDirectory = join(root, "work", "neural-audio-wav");
const outputDirectory = join(root, "public", "audio", "zh");
const bitrateKbps = 128;

function readPcmWave(buffer) {
  if (
    buffer.toString("ascii", 0, 4) !== "RIFF" ||
    buffer.toString("ascii", 8, 12) !== "WAVE"
  ) {
    throw new Error("Expected a RIFF/WAVE audio file");
  }

  let offset = 12;
  let format;
  let pcm;
  while (offset + 8 <= buffer.length) {
    const id = buffer.toString("ascii", offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    const dataStart = offset + 8;
    if (id === "fmt ") {
      format = {
        audioFormat: buffer.readUInt16LE(dataStart),
        channels: buffer.readUInt16LE(dataStart + 2),
        sampleRate: buffer.readUInt32LE(dataStart + 4),
        bitsPerSample: buffer.readUInt16LE(dataStart + 14),
      };
    } else if (id === "data") {
      pcm = buffer.subarray(dataStart, dataStart + size);
    }
    offset = dataStart + size + (size % 2);
  }

  if (!format || !pcm) throw new Error("WAVE file is missing format or audio data");
  if (
    format.audioFormat !== 1 ||
    format.channels !== 1 ||
    format.bitsPerSample !== 16
  ) {
    throw new Error("Expected 16-bit mono PCM audio");
  }

  const samples = new Int16Array(pcm.length / 2);
  for (let index = 0; index < samples.length; index += 1) {
    samples[index] = pcm.readInt16LE(index * 2);
  }
  return { sampleRate: format.sampleRate, samples };
}

function encodeMp3({ sampleRate, samples }) {
  const encoder = new Mp3Encoder(1, sampleRate, bitrateKbps);
  const chunks = [];
  for (let offset = 0; offset < samples.length; offset += 1152) {
    const encoded = encoder.encodeBuffer(samples.subarray(offset, offset + 1152));
    if (encoded.length) chunks.push(Buffer.from(encoded));
  }
  const finalChunk = encoder.flush();
  if (finalChunk.length) chunks.push(Buffer.from(finalChunk));
  return Buffer.concat(chunks);
}

await mkdir(outputDirectory, { recursive: true });
const sourceManifest = JSON.parse(
  await readFile(join(sourceDirectory, "manifest.json"), "utf8"),
);
const entries = [];

for (const [index, poem] of sourceManifest.poems.entries()) {
  const pcm = readPcmWave(await readFile(poem.wavPath));
  const mp3 = encodeMp3(pcm);
  const file = `/audio/zh/${poem.slug}.mp3`;
  await writeFile(join(outputDirectory, `${poem.slug}.mp3`), mp3);
  entries.push({
    slug: poem.slug,
    file,
    voice: poem.voice,
    reason: poem.reason,
    characters: poem.characters,
    durationSeconds: poem.durationSeconds,
    bytes: mp3.length,
  });
  if ((index + 1) % 25 === 0 || index + 1 === sourceManifest.poems.length) {
    process.stdout.write(`Encoded ${index + 1}/${sourceManifest.poems.length}\n`);
  }
}

const manifest = {
  model: sourceManifest.model,
  strategy: sourceManifest.strategy,
  locale: "zh_CN",
  sampleRate: 24000,
  bitrateKbps,
  count: entries.length,
  voiceCounts: sourceManifest.voiceCounts,
  totalBytes: entries.reduce((sum, entry) => sum + entry.bytes, 0),
  totalDurationSeconds: Number(
    entries.reduce((sum, entry) => sum + entry.durationSeconds, 0).toFixed(2),
  ),
  poems: entries,
};
await writeFile(
  join(outputDirectory, "manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
);
process.stdout.write(
  `${entries.length} neural readings · ${(manifest.totalBytes / 1024 / 1024).toFixed(1)} MB MP3 · ${(manifest.totalDurationSeconds / 60).toFixed(1)} minutes\n`,
);
