import React from "react";
import { Title, Meta, Link } from "react-head";
import { useLocation } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

const BASE_URL = "https://lamiani.ge";
const LOCALE_MAP = {
  GE: { ogLocale: "ka_GE", hrefLang: "ka", urlPrefix: "" },
  EN: { ogLocale: "en_US", hrefLang: "en", urlPrefix: "/en" },
  RU: { ogLocale: "ru_RU", hrefLang: "ru", urlPrefix: "/ru" },
};
const LOCALE_PREFIXES = ["/en", "/ru", "/ka"];

function stripLocalePrefix(p) {
  for (const pre of LOCALE_PREFIXES) {
    if (p === pre) return "/";
    if (p.startsWith(pre + "/")) return p.slice(pre.length);
  }
  return p;
}

export default function SeoManager({
  title,
  description,
  image,
  keywords,
  noindex = false,
  ogType = "website",
  productSchema,
  breadcrumbs,
  articleSchema,
}) {
  const location = useLocation();
  const { lang } = useLanguage();
  const currentPath = location.pathname;
  const canonicalPath = stripLocalePrefix(currentPath);
  const fullUrl = `${BASE_URL}${currentPath}`;
  const canonicalUrl = `${BASE_URL}${LOCALE_MAP[lang]?.urlPrefix || ""}${canonicalPath === "/" ? "" : canonicalPath}` || `${BASE_URL}/`;
  const ogImage = image || `${BASE_URL}/preview-image.jpg`;
  const currentLocale = LOCALE_MAP[lang] || LOCALE_MAP.GE;
  const altPath = canonicalPath === "/" ? "" : canonicalPath;

  return (
    <>
      <Title>{title}</Title>
      <Meta name="description" content={description} />
      {keywords && <Meta name="keywords" content={keywords} />}

      <Meta
        name="robots"
        content={
          noindex
            ? "noindex, nofollow"
            : "index, follow, max-image-preview:large, max-snippet:-1"
        }
      />

      <Link rel="canonical" href={canonicalUrl} />

      {/* Hreflang — real locale-prefixed URLs */}
      <Link rel="alternate" hrefLang="ka" href={`${BASE_URL}${altPath || "/"}`} />
      <Link rel="alternate" hrefLang="en" href={`${BASE_URL}/en${altPath}`} />
      <Link rel="alternate" hrefLang="ru" href={`${BASE_URL}/ru${altPath}`} />
      <Link rel="alternate" hrefLang="x-default" href={`${BASE_URL}${altPath || "/"}`} />

      {/* Open Graph */}
      <Meta property="og:type" content={ogType} />
      <Meta property="og:site_name" content="LAMIANI" />
      <Meta property="og:title" content={title} />
      <Meta property="og:description" content={description} />
      <Meta property="og:url" content={canonicalUrl} />
      <Meta property="og:image" content={ogImage} />
      <Meta property="og:image:secure_url" content={ogImage} />
      <Meta property="og:image:alt" content={title} />
      <Meta property="og:image:width" content="1200" />
      <Meta property="og:image:height" content="630" />
      <Meta property="og:locale" content={currentLocale.ogLocale} />
      {Object.entries(LOCALE_MAP)
        .filter(([k]) => k !== lang)
        .map(([k, v]) => (
          <Meta
            key={k}
            property="og:locale:alternate"
            content={v.ogLocale}
          />
        ))}

      {/* Twitter */}
      <Meta name="twitter:card" content="summary_large_image" />
      <Meta name="twitter:site" content="@lamiani" />
      <Meta name="twitter:title" content={title} />
      <Meta name="twitter:description" content={description} />
      <Meta name="twitter:image" content={ogImage} />
      <Meta name="twitter:image:alt" content={title} />
      <Meta name="twitter:url" content={canonicalUrl} />

      {/* BreadcrumbList JSON-LD */}
      {Array.isArray(breadcrumbs) && breadcrumbs.length > 0 && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: breadcrumbs.map((b, idx) => ({
              "@type": "ListItem",
              position: idx + 1,
              name: b.name,
              item: b.url?.startsWith("http") ? b.url : `${BASE_URL}${b.url || ""}`,
            })),
          })}
        </script>
      )}

      {/* Product JSON-LD */}
      {productSchema && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            ...productSchema,
          })}
        </script>
      )}

      {/* Article JSON-LD */}
      {articleSchema && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            ...articleSchema,
          })}
        </script>
      )}
    </>
  );
}
