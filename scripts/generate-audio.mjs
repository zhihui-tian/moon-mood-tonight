import { Mp3Encoder } from "@breezystack/lamejs";
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import {
  mkdir,
  mkdtemp,
  readFile,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const root = resolve(scriptDirectory, "..");
const outputDirectory = join(root, "public", "audio", "zh");
const voice = "Tingting";
const locale = "zh_CN";
const speechRate = 165;
const bitrateKbps = 128;
const force = process.argv.includes("--force");
const limitArgument = process.argv.find((argument) =>
  argument.startsWith("--limit="),
);
const concurrencyArgument = process.argv.find((argument) =>
  argument.startsWith("--concurrency="),
);
const limit = limitArgument
  ? Number.parseInt(limitArgument.split("=")[1] ?? "", 10)
  : undefined;
const concurrency = Math.max(
  1,
  Number.parseInt(concurrencyArgument?.split("=")[1] ?? "4", 10),
);

function transpile(source) {
  return ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
}

async function loadPoems(temporaryDirectory) {
  const anthologySource = await readFile(
    join(root, "content", "poems", "tang-anthology.ts"),
    "utf8",
  );
  const catalogSource = await readFile(
    join(root, "content", "poems", "catalog.ts"),
    "utf8",
  );
  const anthologyModule = join(temporaryDirectory, "tang-anthology.js");
  const catalogModule = join(temporaryDirectory, "catalog.js");

  await Promise.all([
    writeFile(anthologyModule, transpile(anthologySource)),
    writeFile(catalogModule, transpile(catalogSource)),
  ]);

  return createRequire(import.meta.url)(catalogModule).poems;
}

function narrationText(poem) {
  return poem.originalChinese
    .map((stanza) =>
      stanza
        .map((line, index) => {
          const cleaned = line.trim();
          if (/[，。！？；：、,.!?;:]$/u.test(cleaned)) return cleaned;
          return `${cleaned}${index === stanza.length - 1 ? "。" : "，"}`;
        })
        .join("\n"),
    )
    .join("\n\n");
}

function run(command, argumentsList) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, argumentsList, {
      stdio: ["ignore", "ignore", "pipe"],
    });
    let errorOutput = "";

    child.stderr.setEncoding("utf8");
    child.stderr.on("data", (chunk) => {
      errorOutput += chunk;
    });
    child.on("error", rejectPromise);
    child.on("close", (code) => {
      if (code === 0) {
        resolvePromise();
      } else {
        rejectPromise(
          new Error(
            `${command} exited with ${code}${errorOutput ? `: ${errorOutput.trim()}` : ""}`,
          ),
        );
      }
    });
  });
}

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
    throw new Error(
      `Expected 16-bit mono PCM, received format ${format.audioFormat}, ${format.channels} channel(s), ${format.bitsPerSample}-bit`,
    );
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

async function generatePoemAudio(poem, temporaryDirectory, previousEntry) {
  const target = join(outputDirectory, `${poem.slug}.mp3`);
  if (!force) {
    try {
      const existing = await stat(target);
      if (existing.size > 4096 && previousEntry?.durationSeconds) {
        return {
          slug: poem.slug,
          file: `/audio/zh/${poem.slug}.mp3`,
          characters: narrationText(poem).replace(/\s/gu, "").length,
          durationSeconds: previousEntry.durationSeconds,
          bytes: existing.size,
          skipped: true,
        };
      }
    } catch {
      // Missing or incomplete files are generated below.
    }
  }

  const base = join(temporaryDirectory, poem.slug);
  const textFile = `${base}.txt`;
  const aiffFile = `${base}.aiff`;
  const waveFile = `${base}.wav`;
  await writeFile(textFile, narrationText(poem), "utf8");
  await run("/usr/bin/say", [
    "-v",
    voice,
    "-r",
    String(speechRate),
    "-f",
    textFile,
    "-o",
    aiffFile,
  ]);
  await run("/usr/bin/afconvert", [
    "-f",
    "WAVE",
    "-d",
    "LEI16",
    aiffFile,
    waveFile,
  ]);

  const pcm = readPcmWave(await readFile(waveFile));
  const mp3 = encodeMp3(pcm);
  await writeFile(target, mp3);
  await Promise.all([
    rm(textFile, { force: true }),
    rm(aiffFile, { force: true }),
    rm(waveFile, { force: true }),
  ]);

  return {
    slug: poem.slug,
    file: `/audio/zh/${poem.slug}.mp3`,
    characters: narrationText(poem).replace(/\s/gu, "").length,
    durationSeconds: Number((pcm.samples.length / pcm.sampleRate).toFixed(2)),
    bytes: mp3.length,
    skipped: false,
  };
}

async function mapWithConcurrency(items, worker, workerCount) {
  const results = new Array(items.length);
  let nextIndex = 0;
  let finished = 0;

  async function consume() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await worker(items[index], index);
      finished += 1;
      if (finished % 10 === 0 || finished === items.length) {
        process.stdout.write(`Audio ${finished}/${items.length}\n`);
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(workerCount, items.length) }, () => consume()),
  );
  return results;
}

const temporaryDirectory = await mkdtemp(join(tmpdir(), "moon-mood-audio-"));

try {
  await mkdir(outputDirectory, { recursive: true });
  const allPoems = await loadPoems(temporaryDirectory);
  const selectedPoems =
    limit === undefined ? allPoems : allPoems.slice(0, Math.max(0, limit));
  let previousEntries = new Map();
  try {
    const previousManifest = JSON.parse(
      await readFile(join(outputDirectory, "manifest.json"), "utf8"),
    );
    previousEntries = new Map(
      previousManifest.poems.map((entry) => [entry.slug, entry]),
    );
  } catch {
    // The first run has no earlier manifest to reuse.
  }
  const entries = await mapWithConcurrency(
    selectedPoems,
    (poem) =>
      generatePoemAudio(poem, temporaryDirectory, previousEntries.get(poem.slug)),
    concurrency,
  );
  const knownDurations = entries.filter(
    (entry) => typeof entry.durationSeconds === "number",
  );
  const manifest = {
    voice,
    locale,
    speechRate,
    bitrateKbps,
    count: entries.length,
    totalBytes: entries.reduce((sum, entry) => sum + entry.bytes, 0),
    totalDurationSeconds: Number(
      knownDurations
        .reduce((sum, entry) => sum + entry.durationSeconds, 0)
        .toFixed(2),
    ),
    poems: entries.map(({ skipped: _skipped, ...entry }) => entry),
  };
  await writeFile(
    join(outputDirectory, "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  process.stdout.write(
    `Generated ${entries.filter((entry) => !entry.skipped).length}, reused ${entries.filter((entry) => entry.skipped).length}; ${(manifest.totalBytes / 1024 / 1024).toFixed(1)} MB\n`,
  );
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}
