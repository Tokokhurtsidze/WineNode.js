import React from 'react';
import { Title, Meta, Link } from 'react-head';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

interface Breadcrumb { name: string; url: string; }

interface SeoManagerProps {
  title: string;
  description: string;
  image?: string;
  keywords?: string;
  noindex?: boolean;
  ogType?: string;
  productSchema?: Record<string, unknown>;
  breadcrumbs?: Breadcrumb[];
  articleSchema?: Record<string, unknown>;
}

const BASE_URL = 'https://lamiani.ge';
const LOCALE_MAP = {
  GE: { ogLocale: 'ka_GE', urlPrefix: '' },
  EN: { ogLocale: 'en_US', urlPrefix: '/en' },
  RU: { ogLocale: 'ru_RU', urlPrefix: '/ru' },
} as const;
const LOCALE_PREFIXES = ['/en', '/ru', '/ka'];

function stripLocalePrefix(p: string) {
  for (const pre of LOCALE_PREFIXES) {
    if (p === pre) return '/';
    if (p.startsWith(pre + '/')) return p.slice(pre.length);
  }
  return p;
}

export default function SeoManager({
  title, description, image, keywords,
  noindex = false, ogType = 'website',
  productSchema, breadcrumbs, articleSchema,
}: SeoManagerProps) {
  const location = useLocation();
  const { lang } = useLanguage();
  const canonicalPath = stripLocalePrefix(location.pathname);
  const currentLocale = LOCALE_MAP[lang as keyof typeof LOCALE_MAP] || LOCALE_MAP.GE;
  const altPath = canonicalPath === '/' ? '' : canonicalPath;
  const canonicalUrl = `${BASE_URL}${currentLocale.urlPrefix}${canonicalPath === '/' ? '' : canonicalPath}` || `${BASE_URL}/`;
  const ogImage = image || `${BASE_URL}/preview-image.jpg`;

  return (
    <>
      <Title>{title}</Title>
      <Meta name="description" content={description} />
      {keywords && <Meta name="keywords" content={keywords} />}
      <Meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1'} />
      <Link rel="canonical" href={canonicalUrl} />
      <Link rel="alternate" hrefLang="ka" href={`${BASE_URL}${altPath || '/'}`} />
      <Link rel="alternate" hrefLang="en" href={`${BASE_URL}/en${altPath}`} />
      <Link rel="alternate" hrefLang="ru" href={`${BASE_URL}/ru${altPath}`} />
      <Link rel="alternate" hrefLang="x-default" href={`${BASE_URL}${altPath || '/'}`} />
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
      {Object.entries(LOCALE_MAP).filter(([k]) => k !== lang).map(([k, v]) => (
        <Meta key={k} property="og:locale:alternate" content={v.ogLocale} />
      ))}
      <Meta name="twitter:card" content="summary_large_image" />
      <Meta name="twitter:site" content="@lamiani" />
      <Meta name="twitter:title" content={title} />
      <Meta name="twitter:description" content={description} />
      <Meta name="twitter:image" content={ogImage} />
      <Meta name="twitter:image:alt" content={title} />
      <Meta name="twitter:url" content={canonicalUrl} />
      {Array.isArray(breadcrumbs) && breadcrumbs.length > 0 && (
        <script type="application/ld+json">{JSON.stringify({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: breadcrumbs.map((b, idx) => ({ '@type': 'ListItem', position: idx + 1, name: b.name, item: b.url?.startsWith('http') ? b.url : `${BASE_URL}${b.url || ''}` })) })}</script>
      )}
      {productSchema && (
        <script type="application/ld+json">{JSON.stringify({ '@context': 'https://schema.org', '@type': 'Product', ...productSchema })}</script>
      )}
      {articleSchema && (
        <script type="application/ld+json">{JSON.stringify({ '@context': 'https://schema.org', '@type': 'Article', ...articleSchema })}</script>
      )}
    </>
  );
}
