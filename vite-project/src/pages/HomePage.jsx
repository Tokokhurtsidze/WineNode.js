
import React from "react";
import Hero from "../components/Hero";
import PopularWines from "../components/PopularWines";
import Partners from "../components/Partners";
import DiscountSection from "../components/DiscountSection";
import WineSection from "../components/WineSection";
import { FullImageOne, FullImageThree, FullImageTwo } from "../ImgFull/AllFullImages";
import SeoManager from "../Seo/SeoManager"; // ახალი SEO მენეჯერი

const translations = {
  GE: {
    title: "Lamiani - პრემიუმ ქართული ღვინის მარკეტპლეისი",
    description: "აღმოაჩინეთ საუკეთესო ქართული ღვინოები საოჯახო მარნებიდან. Lamiani - თქვენი გზამკვლევი ავთენტური ღვინის სამყაროში."
  },
  EN: {
    title: "Lamiani - Premium Georgian Wine Marketplace",
    description: "Discover the finest Georgian wines from family wineries. Explore Lamiani, your gateway to authentic wine experiences."
  },
  RU: {
    title: "Lamiani - Маркетплейс премиальных грузинских вин",
    description: "Откройте для себя лучшие грузинские вина из семейных погребов. Lamiani - ваш путеводитель в мире аутентичного вина."
  }
};

export default function HomePage({ lang }) {
  // ვირჩევთ თარგმანს ენის მიხედვით (თუ lang არ არის, ვიყენებთ EN-ს)
  const t = translations[lang] || translations.EN;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Lamiani",
    "url": "https://lamiani.ge/",
    "logo": "https://cdn.pixabay.com/photo/2019/08/13/09/37/village-4402925_640.png",
    "sameAs": [
      "https://www.facebook.com/Lamiani",
      "https://www.instagram.com/Lamiani",
      "https://twitter.com/Lamiani"
    ],
    "description": t.description,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+995 555 123456",
      "contactType": "Customer Service",
      "areaServed": "GE"
    }
  };

  return (
    <div className="w-full overflow-x-hidden">
      {/* SeoManager მართავს Title, Meta, Canonical და Hreflang ლინკებს */}
      <SeoManager 
        title={t.title} 
        description={t.description}
        image="https://cdn.pixabay.com/photo/2019/08/13/09/37/village-4402925_640.png"
      />

      {/* JSON-LD Structured Data - ვტოვებთ ორგანიზაციისთვის */}
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>

      {/* Page Content */}
      <Hero/>
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