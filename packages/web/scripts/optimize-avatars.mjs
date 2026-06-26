import sharp from "sharp";
import { mkdir, stat } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const SIZE = 96;
const QUALITY = 82;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function makeAvatar(inputPath, outputPath) {
  const circle = Buffer.from(
    `<svg width="${SIZE}" height="${SIZE}"><circle cx="${SIZE / 2}" cy="${SIZE / 2}" r="${SIZE / 2}"/></svg>`,
  );

  await sharp(inputPath)
    .resize(SIZE, SIZE, { fit: "cover", position: "centre" })
    .composite([{ input: circle, blend: "dest-in" }])
    .webp({ quality: QUALITY, effort: 6 })
    .toFile(outputPath);

  const { size } = await stat(outputPath);
  console.log(`${path.basename(outputPath)}: ${size} bytes`);
}

const outDir = path.resolve(__dirname, "../public/avatars");
await mkdir(outDir, { recursive: true });

await makeAvatar("C:/Users/trulo/Desktop/boss.png", path.join(outDir, "interviewer.webp"));
await makeAvatar("C:/Users/trulo/Desktop/cat.png", path.join(outDir, "candidate.webp"));
