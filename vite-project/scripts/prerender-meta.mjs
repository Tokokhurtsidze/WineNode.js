#!/usr/bin/env node
// Post-build SEO injector.
// For each static + locale route, clone dist/index.html and rewrite the
// route-specific <title>, <meta description>, og/twitter tags, canonical,
// hreflang alternates, and JSON-LD before serving.
//
// This is NOT full SSR — body is still hydrated by the SPA after JS loads.
// But crawlers (Google, Bing, Yandex, Twitter/Facebook scrapers) see the
// correct per-route metadata in the initial HTML, fixing the biggest
// SPA SEO blocker without changing the runtime.

import fs from "node:fs/promises";
import path from "node:path";
import url from "node:url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const distDir = path.join(projectRoot, "dist");

const BASE = "https://lamiani.ge";
const LOCALES = [
  { code: "ka", prefix: "", ogLocale: "ka_GE" },
  { code: "en", prefix: "/en", ogLocale: "en_US" },
  { code: "ru", prefix: "/ru", ogLocale: "ru_RU" },
];

// Route SEO catalog. Localized title + description per route.
const ROUTE_SEO = {
  "/": {
    ka: {
      title: "LAMIANI | საუკეთესო ქართული ღვინოების პრემიუმ კოლექცია",
      description:
        "აღმოაჩინეთ უნიკალური ქართული ღვინოები LAMIANI-სგან. პრემიუმ ხარისხის მარნები, სპეციალური შეთავაზებები და საუკეთესო ვენახების ისტორია.",
    },
    en: {
      title: "LAMIANI | Premium Georgian Wine Selection",
      description:
        "Discover unique Georgian wines at LAMIANI. Premium-quality cellars, special offers, and the heritage of Georgia's finest vineyards.",
    },
    ru: {
      title: "LAMIANI | Премиум коллекция грузинских вин",
      description:
        "Откройте для себя уникальные грузинские вина от LAMIANI. Премиальные погреба, специальные предложения и история лучших виноградников.",
    },
  },
  "/about": {
    ka: {
      title: "ჩვენი ისტორია | LAMIANI",
      description: "გაიცანი LAMIANI-ის მემკვიდრეობა — 8000-წლიანი ქართული ღვინის ტრადიცია.",
    },
    en: {
      title: "Our Heritage | LAMIANI",
      description: "Meet LAMIANI — 8,000 years of Georgian wine tradition served in every bottle.",
    },
    ru: {
      title: "Наша история | LAMIANI",
      description: "Откройте наследие LAMIANI — 8000-летнюю традицию грузинского виноделия.",
    },
  },
  "/wines": {
    ka: {
      title: "ჩვენი კოლექცია | LAMIANI",
      description: "აღმოაჩინეთ პოპულარული და ფასდაკლებული ქართული ღვინოები LAMIANI-სგან.",
    },
    en: {
      title: "Wine Collection | LAMIANI",
      description: "Browse LAMIANI's popular and discounted Georgian wines — Saperavi, Rkatsiteli, Kindzmarauli & more.",
    },
    ru: {
      title: "Коллекция вин | LAMIANI",
      description: "Популярные и со скидкой грузинские вина LAMIANI — Саперави, Ркацители, Киндзмараули и др.",
    },
  },
  "/partners": {
    ka: {
      title: "ჩვენი მეურნეობები | LAMIANI",
      description: "გაიცანი LAMIANI-ის პარტნიორი მეურნეები — საუკეთესო ქართული მარნები.",
    },
    en: {
      title: "Partner Estates | LAMIANI",
      description: "Discover LAMIANI's partner estates — Georgia's finest family wineries.",
    },
    ru: {
      title: "Наши поместья | LAMIANI",
      description: "Партнерские винодельни LAMIANI — лучшие семейные погреба Грузии.",
    },
  },
  "/contact": {
    ka: {
      title: "კონტაქტი | LAMIANI",
      description: "დაუკავშირდით LAMIANI-ს Tbilisi-ში. შეკვეთები, თანამშრომლობა, კონსულტაცია.",
    },
    en: {
      title: "Contact Us | LAMIANI",
      description: "Reach LAMIANI in Tbilisi. Orders, partnerships, sommelier advice.",
    },
    ru: {
      title: "Контакты | LAMIANI",
      description: "Свяжитесь с LAMIANI в Тбилиси. Заказы, партнерство, консультации.",
    },
  },
};

function buildHead(routePath, locale) {
  const localeData = ROUTE_SEO[routePath]?.[locale.code] || ROUTE_SEO["/"][locale.code];
  const title = localeData.title;
  const description = localeData.description;
  const canonical = `${BASE}${locale.prefix}${routePath === "/" ? "" : routePath}` || `${BASE}/`;

  const alternates = LOCALES.map(
    (l) =>
      `<link rel="alternate" hreflang="${l.code}" href="${BASE}${l.prefix}${
        routePath === "/" ? "" : routePath
      }" />`,
  ).join("\n    ");

  return {
    title,
    description,
    canonical,
    alternates,
    ogLocale: locale.ogLocale,
    locale: locale.code,
  };
}

function patchHtml(template, head) {
  let html = template;

  // <title>
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(head.title)}</title>`);

  // meta name="title"
  html = html.replace(
    /<meta\s+name="title"[^>]*\/>/,
    `<meta name="title" content="${escapeAttr(head.title)}" />`,
  );

  // meta description
  html = html.replace(
    /<meta\s+name="description"[^>]*\/>/,
    `<meta name="description" content="${escapeAttr(head.description)}" />`,
  );

  // canonical
  html = html.replace(
    /<link\s+rel="canonical"[^>]*\/>/,
    `<link rel="canonical" href="${escapeAttr(head.canonical)}" />`,
  );

  // hreflang block — remove existing alternates then inject
  html = html.replace(/\n\s*<link rel="alternate" href="[^"]*" hreflang="[^"]*" \/>/g, "");
  html = html.replace(/\n\s*<link rel="alternate" hreflang="[^"]*" href="[^"]*" \/>/g, "");
  html = html.replace(
    /<link rel="canonical"[^>]*\/>/,
    (m) => `${m}\n    ${head.alternates}`,
  );

  // og:title
  html = html.replace(
    /<meta\s+property="og:title"[^>]*\/>/,
    `<meta property="og:title" content="${escapeAttr(head.title)}" />`,
  );
  // og:description
  html = html.replace(
    /<meta\s+property="og:description"[^>]*\/>/,
    `<meta property="og:description" content="${escapeAttr(head.description)}" />`,
  );
  // og:url
  html = html.replace(
    /<meta\s+property="og:url"[^>]*\/>/,
    `<meta property="og:url" content="${escapeAttr(head.canonical)}" />`,
  );
  // og:locale (primary)
  html = html.replace(
    /<meta\s+property="og:locale"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:locale" content="${head.ogLocale}" />`,
  );

  // twitter:title
  html = html.replace(
    /<meta\s+name="twitter:title"[^>]*\/>/,
    `<meta name="twitter:title" content="${escapeAttr(head.title)}" />`,
  );
  html = html.replace(
    /<meta\s+name="twitter:description"[^>]*\/>/,
    `<meta name="twitter:description" content="${escapeAttr(head.description)}" />`,
  );
  html = html.replace(
    /<meta\s+name="twitter:url"[^>]*\/>/,
    `<meta name="twitter:url" content="${escapeAttr(head.canonical)}" />`,
  );

  // <html lang="...">
  html = html.replace(/<html\s+lang="[^"]*"/, `<html lang="${head.locale}"`);

  return html;
}

function escapeAttr(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

async function writeRoute(template, routePath, locale) {
  const head = buildHead(routePath, locale);
  const patched = patchHtml(template, head);

  // Output path: dist/<locale.prefix><routePath>/index.html
  let outDir;
  if (routePath === "/" && locale.prefix === "") {
    // Skip: that's just dist/index.html — but we still want it patched
    outDir = distDir;
  } else if (routePath === "/") {
    outDir = path.join(distDir, locale.prefix.slice(1)); // dist/en, dist/ru
  } else {
    outDir = path.join(distDir, locale.prefix.slice(1), ...routePath.split("/").filter(Boolean));
  }

  await ensureDir(outDir);
  const outFile = path.join(outDir, "index.html");
  await fs.writeFile(outFile, patched, "utf8");
  return outFile;
}

async function main() {
  const indexPath = path.join(distDir, "index.html");
  let template;
  try {
    template = await fs.readFile(indexPath, "utf8");
  } catch (err) {
    console.error("[prerender] dist/index.html missing. Run `vite build` first.");
    process.exit(1);
  }

  const routes = Object.keys(ROUTE_SEO);
  let written = 0;
  for (const r of routes) {
    for (const locale of LOCALES) {
      const out = await writeRoute(template, r, locale);
      written++;
      console.log(`[prerender] ${out}`);
    }
  }
  console.log(`[prerender] wrote ${written} route HTMLs`);
}

main().catch((err) => {
  console.error("[prerender] FATAL:", err);
  // Don't fail the build — site still works without per-route HTML, just less optimal SEO.
  process.exit(0);
});
