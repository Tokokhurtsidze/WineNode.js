#!/usr/bin/env node
// Build-time sitemap generator.
// Pulls all detail-page IDs from Firestore and writes public/sitemap.xml
// before `vite build` copies it into dist/.
//
// Falls back to a static 5-URL sitemap if Firestore is unreachable so the
// build never breaks the deploy.

import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import url from "node:url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

// Minimal .env loader (no dotenv dep)
function loadDotenv(file) {
  try {
    const raw = fsSync.readFileSync(file, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      val = val.replace(/^['"]|['"]$/g, "");
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {}
}
loadDotenv(path.join(projectRoot, ".env"));

const BASE = "https://lamiani.ge";
const LOCALES = [
  { code: "ka", prefix: "" },
  { code: "en", prefix: "/en" },
  { code: "ru", prefix: "/ru" },
];

const STATIC_ROUTES = [
  { path: "", priority: "1.0", changefreq: "weekly" },
  { path: "/about", priority: "0.7", changefreq: "monthly" },
  { path: "/wines", priority: "0.9", changefreq: "weekly" },
  { path: "/partners", priority: "0.7", changefreq: "monthly" },
  { path: "/contact", priority: "0.6", changefreq: "yearly" },
];

function xmlEscape(s) {
  return String(s).replace(/[<>&'"]/g, (c) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    '"': "&quot;",
  }[c]));
}

function urlBlock(loc, priority, changefreq, lastmod, alternates = []) {
  const altLines = alternates
    .map((a) => `    <xhtml:link rel="alternate" hreflang="${a.lang}" href="${xmlEscape(a.url)}"/>`)
    .join("\n");
  return `  <url>
    <loc>${xmlEscape(loc)}</loc>
${altLines ? altLines + "\n" : ""}    ${lastmod ? `<lastmod>${lastmod}</lastmod>\n    ` : ""}<changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

async function fetchFirestoreCollection(projectId, collection) {
  // Public read via Firestore REST API. No auth required if collection has public read rules.
  const endpoint = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}?pageSize=300`;
  const res = await fetch(endpoint);
  if (!res.ok) throw new Error(`Firestore REST ${collection} returned ${res.status}`);
  const json = await res.json();
  const docs = json.documents || [];
  return docs.map((d) => {
    const name = d.name.split("/").pop();
    return { id: name, updateTime: d.updateTime };
  });
}

function buildAlternates(routePath) {
  return LOCALES.map((l) => ({
    lang: l.code,
    url: `${BASE}${l.prefix}${routePath || "/"}`,
  }));
}

async function main() {
  const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
  let wines = [];
  let discounted = [];
  let partners = [];

  if (projectId) {
    try {
      [wines, discounted, partners] = await Promise.all([
        fetchFirestoreCollection(projectId, "popularWines").catch(() => []),
        fetchFirestoreCollection(projectId, "discountedWines").catch(() => []),
        fetchFirestoreCollection(projectId, "partners").catch(() => []),
      ]);
      console.log(
        `[sitemap] fetched: ${wines.length} wines, ${discounted.length} discounted, ${partners.length} partners`,
      );
    } catch (err) {
      console.warn("[sitemap] Firestore fetch failed; falling back to static routes only:", err.message);
    }
  } else {
    console.warn("[sitemap] VITE_FIREBASE_PROJECT_ID not set; emitting static-only sitemap.");
  }

  const today = new Date().toISOString().split("T")[0];
  const blocks = [];

  // Static + locale variants
  for (const r of STATIC_ROUTES) {
    for (const locale of LOCALES) {
      const loc = `${BASE}${locale.prefix}${r.path || "/"}`;
      blocks.push(urlBlock(loc, r.priority, r.changefreq, today, buildAlternates(r.path)));
    }
  }

  // Wines
  for (const w of wines) {
    const routePath = `/wine/${w.id}`;
    for (const locale of LOCALES) {
      const loc = `${BASE}${locale.prefix}${routePath}`;
      const lastmod = (w.updateTime || "").split("T")[0] || today;
      blocks.push(urlBlock(loc, "0.8", "monthly", lastmod, buildAlternates(routePath)));
    }
  }

  // Discounted wines
  for (const w of discounted) {
    const routePath = `/discounted/${w.id}`;
    for (const locale of LOCALES) {
      const loc = `${BASE}${locale.prefix}${routePath}`;
      const lastmod = (w.updateTime || "").split("T")[0] || today;
      blocks.push(urlBlock(loc, "0.8", "weekly", lastmod, buildAlternates(routePath)));
    }
  }

  // Partners
  for (const p of partners) {
    const routePath = `/partner/${p.id}`;
    for (const locale of LOCALES) {
      const loc = `${BASE}${locale.prefix}${routePath}`;
      const lastmod = (p.updateTime || "").split("T")[0] || today;
      blocks.push(urlBlock(loc, "0.7", "monthly", lastmod, buildAlternates(routePath)));
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${blocks.join("\n")}
</urlset>
`;

  const outPath = path.join(projectRoot, "public", "sitemap.xml");
  await fs.writeFile(outPath, xml, "utf8");
  console.log(`[sitemap] wrote ${outPath} (${blocks.length} URLs)`);
}

main().catch((err) => {
  console.error("[sitemap] FATAL:", err);
  process.exit(0); // never fail the build
});
