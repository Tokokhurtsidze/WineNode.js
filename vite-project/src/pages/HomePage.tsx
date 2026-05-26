import React from 'react';
import Hero from '../components/Hero';
import PopularWines from '../components/PopularWines';
import Partners from '../components/Partners';
import DiscountSection from '../components/DiscountSection';
import WineSection from '../components/WineSection';
import { FullImageOne, FullImageThree, FullImageTwo } from '../ImgFull/AllFullImages';
import SeoManager from '../Seo/SeoManager';
import { useLanguage } from '../context/LanguageContext';

const translations = {
  GE: {
    title: 'Lamiani - პრემიუმ ქართული ღვინის მარკეტპლეისი',
    description: 'აღმოაჩინეთ საუკეთესო ქართული ღვინოები საოჯახო მარნებიდან. Lamiani - თქვენი გზამკვლევი ავთენტური ღვინის სამყაროში.',
  },
  EN: {
    title: 'Lamiani - Premium Georgian Wine Marketplace',
    description: 'Discover the finest Georgian wines from family wineries. Explore Lamiani, your gateway to authentic wine experiences.',
  },
  RU: {
    title: 'Lamiani - Маркетплейс премиальных грузинских вин',
    description: 'Откройте для себя лучшие грузинские вина из семейных погребов. Lamiani - ваш путеводитель в мире аутентичного вина.',
  },
};

export default function HomePage() {
  const { lang } = useLanguage();
  const t = translations[lang as keyof typeof translations] || translations.EN;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Lamiani',
    url: 'https://lamiani.ge/',
    logo: 'https://lamiani.ge/new.png',
    description: t.description,
    address: { '@type': 'PostalAddress', streetAddress: 'David Gamrekeli Street 3', addressLocality: 'Tbilisi', addressCountry: 'GE' },
    contactPoint: { '@type': 'ContactPoint', telephone: '+995-599-47-20-67', email: 'rklamiani@gmail.com', contactType: 'Customer Service' },
    sameAs: ['https://www.facebook.com/Lamiani', 'https://www.instagram.com/Lamiani'],
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'LAMIANI',
    url: 'https://lamiani.ge/',
    inLanguage: ['ka-GE', 'en-US', 'ru-RU'],
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://lamiani.ge/wines?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <div className="w-full overflow-x-hidden">
      <SeoManager
        title={t.title}
        description={t.description}
        image="https://lamiani.ge/preview-image.jpg"
        keywords="LAMIANI, Georgian wine, premium wine, Saperavi, Rkatsiteli, Kindzmarauli, qvevri, winery Tbilisi, ქართული ღვინო, ლამიანი"
      />
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      <script type="application/ld+json">{JSON.stringify(websiteSchema)}</script>
      <Hero />
      <PopularWines />
      <FullImageOne />
      <Partners />
      <FullImageTwo />
      <DiscountSection />
      <FullImageThree />
      <WineSection />
    </div>
  );
}
