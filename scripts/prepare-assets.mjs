import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { SLICES } from "./slices.config.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const ASSETS = path.join(ROOT, "public/assets");
const OUT = path.join(ASSETS, "slices");

async function cutSlices() {
  await mkdir(OUT, { recursive: true });
  const manifest = {};
  for (const [id, s] of Object.entries(SLICES)) {
    const file = `${id}.jpg`;
    await sharp(path.join(ASSETS, s.src))
      .extract({ left: s.x, top: s.y, width: s.w, height: s.h })
      .jpeg({ quality: 92, mozjpeg: true })
      .toFile(path.join(OUT, file));
    manifest[id] = { src: `/assets/slices/${file}`, w: s.w, h: s.h };
  }
  return manifest;
}

// Logo artwork is burgundy ink on cream card stock; rebuild it as ink-only
// alpha so it sits on any paper tone without a visible box.
async function buildLogoMark() {
  const { data, info } = await sharp(path.join(ASSETS, "logo.jpg"))
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const out = Buffer.alloc(width * height * 4);
  const ink = [104, 22, 36];
  const paperLum = 212;
  const inkLum = 60;
  let minX = width, minY = height, maxX = 0, maxY = 0;

  for (let i = 0; i < width * height; i++) {
    const r = data[i * channels];
    const g = data[i * channels + 1];
    const b = data[i * channels + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    let a = (paperLum - lum) / (paperLum - inkLum);
    a = Math.max(0, Math.min(1, a));
    a = Math.pow(a, 0.85);
    out[i * 4] = ink[0];
    out[i * 4 + 1] = ink[1];
    out[i * 4 + 2] = ink[2];
    out[i * 4 + 3] = Math.round(a * 255);
    if (a > 0.35) {
      const x = i % width;
      const y = Math.floor(i / width);
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }

  const pad = 12;
  const left = Math.max(0, minX - pad);
  const top = Math.max(0, minY - pad);
  const w = Math.min(width, maxX + pad) - left;
  const h = Math.min(height, maxY + pad) - top;

  await sharp(out, { raw: { width, height, channels: 4 } })
    .extract({ left, top, width: w, height: h })
    .png({ compressionLevel: 9 })
    .toFile(path.join(ASSETS, "logo-mark.png"));

  return { src: "/assets/logo-mark.png", w, h };
}

const POSTERS = {
  mercimek: "menu-mercimek-corbasi.jpg",
  pilav: "menu-pilav-ustu-doner.jpg",
  guytu: "menu-guytu.jpg",
  kayik: "menu-guytu-kayik-yakinda.jpg",
  icecek: "menu-icecek.jpg",
};
const PAPER_BOTTOM = 660;
const EDGE_COLS = 6;

async function readRaw(file) {
  const { data, info } = await sharp(path.join(ASSETS, file))
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data, ...info };
}

function columnAverage(img, x0, rows) {
  const out = [];
  for (let y = 0; y < rows; y++) {
    let r = 0, g = 0, b = 0;
    for (let x = x0; x < x0 + EDGE_COLS; x++) {
      const i = (y * img.width + x) * img.channels;
      r += img.data[i];
      g += img.data[i + 1];
      b += img.data[i + 2];
    }
    out.push([r / EDGE_COLS, g / EDGE_COLS, b / EDGE_COLS]);
  }
  return out;
}

function isPaperPixel(r, g, b) {
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  return lum > 185 && r - b < 85 && r >= g && g >= b - 4;
}

// Per row, average only paper-coloured pixels inside a few horizontal bands,
// so food and lettering never tint the generated sheet.
function paperFromPoster(img) {
  const bands = 6;
  const h = PAPER_BOTTOM;
  const w = 96;
  const bandW = img.width / bands;
  const grid = [];

  for (let y = 0; y < h; y++) {
    const row = [];
    for (let bnd = 0; bnd < bands; bnd++) {
      let r = 0, g = 0, b = 0, n = 0;
      for (let dy = -3; dy <= 3; dy++) {
        const yy = Math.min(img.height - 1, Math.max(0, y + dy));
        for (let x = Math.floor(bnd * bandW); x < (bnd + 1) * bandW; x += 2) {
          const i = (yy * img.width + x) * img.channels;
          const pr = img.data[i], pg = img.data[i + 1], pb = img.data[i + 2];
          if (isPaperPixel(pr, pg, pb)) {
            r += pr; g += pg; b += pb; n++;
          }
        }
      }
      row.push(n > 20 ? [r / n, g / n, b / n] : null);
    }
    grid.push(row);
  }

  // fill gaps (bands fully covered by food) from nearest rows
  for (let bnd = 0; bnd < bands; bnd++) {
    let last = null;
    for (let y = 0; y < h; y++) {
      if (grid[y][bnd]) last = grid[y][bnd];
      else if (last) grid[y][bnd] = last;
    }
    last = null;
    for (let y = h - 1; y >= 0; y--) {
      if (grid[y][bnd]) last = grid[y][bnd];
      else if (last) grid[y][bnd] = last;
    }
  }

  const buf = Buffer.alloc(w * h * 3);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const f = (x / (w - 1)) * (bands - 1);
      const i0 = Math.floor(f);
      const i1 = Math.min(bands - 1, i0 + 1);
      const t = f - i0;
      const a = grid[y][i0] ?? [240, 214, 190];
      const c = grid[y][i1] ?? a;
      const i = (y * w + x) * 3;
      for (let k = 0; k < 3; k++) buf[i + k] = a[k] * (1 - t) + c[k] * t;
    }
  }
  return { buf, w, h };
}

async function writeRgb(buf, width, height, file, blur) {
  let img = sharp(buf, { raw: { width, height, channels: 3 } });
  if (blur) img = img.blur(blur);
  await img.jpeg({ quality: 90 }).toFile(file);
}

// Edge strips extend a full poster sideways in landscape, and the paper
// texture backs portrait pages; both come from the poster's own outer columns
// so the seam colour is identical.
async function buildEdgesAndPaper() {
  const dir = path.join(ASSETS, "paper");
  await mkdir(dir, { recursive: true });
  const manifest = {};

  for (const [key, file] of Object.entries(POSTERS)) {
    const img = await readRaw(file);
    const left = columnAverage(img, 0, img.height);
    const right = columnAverage(img, img.width - EDGE_COLS, img.height);

    for (const [side, col] of [["l", left], ["r", right]]) {
      const w = 8;
      const buf = Buffer.alloc(w * img.height * 3);
      for (let y = 0; y < img.height; y++) {
        for (let x = 0; x < w; x++) {
          const i = (y * w + x) * 3;
          buf[i] = col[y][0];
          buf[i + 1] = col[y][1];
          buf[i + 2] = col[y][2];
        }
      }
      await writeRgb(buf, w, img.height, path.join(dir, `${key}-${side}.jpg`), 1.2);
    }

    const paper = paperFromPoster(img);
    await writeRgb(paper.buf, paper.w, paper.h, path.join(dir, `${key}-paper.jpg`), 9);

    manifest[key] = {
      poster: `/assets/${file}`,
      edgeLeft: `/assets/paper/${key}-l.jpg`,
      edgeRight: `/assets/paper/${key}-r.jpg`,
      paper: `/assets/paper/${key}-paper.jpg`,
    };
  }
  return manifest;
}

async function samplePaper(file, points) {
  const { data, info } = await sharp(path.join(ASSETS, file))
    .raw()
    .toBuffer({ resolveWithObject: true });
  return points.map(([px, py]) => {
    let r = 0, g = 0, b = 0, n = 0;
    for (let dy = -6; dy <= 6; dy++) {
      for (let dx = -6; dx <= 6; dx++) {
        const x = px + dx;
        const y = py + dy;
        const i = (y * info.width + x) * info.channels;
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        n++;
      }
    }
    const hex = (v) => Math.round(v / n).toString(16).padStart(2, "0");
    return `#${hex(r)}${hex(g)}${hex(b)}`;
  });
}

const slices = await cutSlices();
const logo = await buildLogoMark();
const posters = await buildEdgesAndPaper();
const paper = {
  icecekTop: await samplePaper("menu-icecek.jpg", [[60, 40], [512, 120], [960, 60]]),
  icecekMid: await samplePaper("menu-icecek.jpg", [[40, 400], [990, 400], [512, 680]]),
  guytuMid: await samplePaper("menu-guytu.jpg", [[20, 420], [1005, 420], [512, 400]]),
  pilav: await samplePaper("menu-pilav-ustu-doner.jpg", [[40, 60], [40, 400], [40, 640]]),
  mercimek: await samplePaper("menu-mercimek-corbasi.jpg", [[40, 60], [40, 560], [200, 640]]),
  wave: await samplePaper("menu-pilav-ustu-doner.jpg", [[200, 750], [800, 750]]),
};

await writeFile(
  path.join(ROOT, "src/data/slices.generated.json"),
  JSON.stringify({ slices, logo, posters }, null, 2) + "\n",
);
console.log(JSON.stringify(paper, null, 2));
