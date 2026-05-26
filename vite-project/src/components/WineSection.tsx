import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useLanguage } from '../context/LanguageContext';

interface WineImage {
  id: string;
  img: string;
  alt?: string;
}

const translations = {
  GE: {
    badge: 'ბუნების არსი',
    title: "ბუნებრივი <span class='text-[#5b1f1f]'>არომატი</span>",
    heritageTitle: "ჩვენი <span class='italic'>მემკვიდრეობა</span>",
    heritageDesc: 'ყველაფერი დაიწყო მარტივი რწმენით: რომ ღვინო საქართველოს სულია. ჩვენი ისტორია ქვევრის თიხითა და იმ ოჯახების შრომით დაიწერა, რომლებიც ამ ტრადიციებს 8,000 წელია ინახავენ.',
    discoverMore: 'გაიგე მეტი',
    altGallery: 'ქართული ღვინის გალერეა - Wineland',
  },
  EN: {
    badge: "Nature's Essence",
    title: "Natural <span class='text-[#5b1f1f]'>Aroma</span>",
    heritageTitle: "Our <span class='italic'>Heritage</span>",
    heritageDesc: 'Everything started with a simple belief: that wine is the soul of Georgia. Our history is written in the clay of Qvevris and the sweat of hardworking families who have preserved these traditions for 8,000 years.',
    discoverMore: 'Discover More',
    altGallery: 'Georgian Wine Gallery - Wineland',
  },
  RU: {
    badge: 'Сущность природы',
    title: "Натуральный <span class='text-[#5b1f1f]'>аромат</span>",
    heritageTitle: "Наше <span class='italic'>наследие</span>",
    heritageDesc: 'Все началось с простой веры: вино — это душа Грузии. Наша история написана глиной квеври и трудом семей, сохранивших эти традиции на протяжении 8000 лет.',
    discoverMore: 'Узнать больше',
    altGallery: 'Галерея грузинских вин - Wineland',
  },
};

const WineSection = () => {
  const [wineImages, setWineImages] = useState<WineImage[]>([]);
  const { lang } = useLanguage();
  const t = translations[lang as keyof typeof translations] || translations.EN;

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'wineGallery'),
      (snap) => setWineImages(snap.docs.map((d) => ({ id: d.id, ...d.data() } as WineImage))),
      (err) => console.error('Error fetching wine images:', err),
    );
    return unsub;
  }, []);

  return (
    <main className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-6 py-16 sm:py-20 lg:py-24 bg-white dark:bg-[#12151B] text-[#1a1a1a] dark:text-gray-200 font-serif transition-colors duration-300">
      <div className="text-center mb-10 sm:mb-12 md:mb-16 space-y-3 sm:space-y-4">
        <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.4em] sm:tracking-[0.5em] text-[#b38b59] font-bold block animate-fadeIn">
          {t.badge}
        </span>
        <h2
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-[#1a1a1a] tracking-tighter italic"
          dangerouslySetInnerHTML={{ __html: t.title }}
        />
        <div className="w-10 sm:w-12 h-[1px] bg-[#b38b59]/30 mx-auto mt-4 sm:mt-6" />
      </div>

      <div className="md:hidden mb-12">
        <Swiper
          watchSlidesProgress
          centeredSlides
          breakpoints={{
            0:   { slidesPerView: 1.15, spaceBetween: 14 },
            360: { slidesPerView: 1.3,  spaceBetween: 16 },
            420: { slidesPerView: 1.6,  spaceBetween: 18 },
            480: { slidesPerView: 1.9,  spaceBetween: 20 },
            540: { slidesPerView: 2.2,  spaceBetween: 20 },
            600: { slidesPerView: 2.5,  spaceBetween: 22 },
            640: { slidesPerView: 2.8,  spaceBetween: 24 },
            720: { slidesPerView: 3.2,  spaceBetween: 24 },
          }}
        >
          {wineImages.map((wine) => (
            <SwiperSlide key={wine.id}>
              <div className="relative aspect-[3/4] rounded-sm overflow-hidden shadow-xl shadow-black/5 dark:!bg-[#12151B] dark:ring-1 dark:ring-[#B89968]/20 dark:shadow-[0_18px_50px_rgba(0,0,0,0.7),0_0_0_1px_rgba(184,153,104,0.08)_inset]">
                <img
                  src={wine.img}
                  alt={wine.alt || t.altGallery}
                  className="absolute inset-0 w-full h-full object-cover dark:brightness-[0.88] dark:saturate-[1.12] dark:contrast-[1.05] transition-[filter,transform] duration-700"
                  loading="lazy"
                  decoding="async"
                />
                <div className="hidden dark:block absolute inset-0 pointer-events-none [background:radial-gradient(ellipse_at_center,transparent_55%,rgba(11,14,20,0.55)_100%)]" />
                <div className="hidden dark:block absolute inset-x-0 bottom-0 h-1/3 pointer-events-none bg-gradient-to-t from-[#0B0E14]/85 via-[#0B0E14]/30 to-transparent" />
                <div className="hidden dark:block absolute top-0 inset-x-0 h-px pointer-events-none bg-gradient-to-r from-transparent via-[#B89968]/45 to-transparent" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className="hidden md:grid grid-cols-3 gap-6 mb-32">
        {wineImages.map((wine, idx) => (
          <div
            key={wine.id}
            className={`relative group overflow-hidden rounded-sm bg-gray-50 dark:!bg-[#12151B] dark:ring-1 dark:ring-[#B89968]/20 shadow-sm transition-all duration-700 hover:shadow-2xl hover:shadow-[#5b1f1f]/10 ${idx % 2 === 1 ? 'md:translate-y-8' : ''}`}
          >
            <img
              src={wine.img}
              alt={wine.alt || t.altGallery}
              className="w-full h-[400px] object-cover dark:brightness-[0.88] dark:saturate-[1.12] dark:contrast-[1.05] transition-transform duration-[2s] group-hover:scale-110"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="hidden dark:block absolute inset-0 pointer-events-none [background:radial-gradient(ellipse_at_center,transparent_50%,rgba(11,14,20,0.6)_100%)]" />
            <div className="hidden dark:block absolute inset-x-0 bottom-0 h-2/5 pointer-events-none bg-gradient-to-t from-[#0B0E14]/90 via-[#0B0E14]/40 to-transparent" />
            <div className="hidden dark:block absolute top-0 inset-x-0 h-px pointer-events-none bg-gradient-to-r from-transparent via-[#B89968]/45 to-transparent" />
          </div>
        ))}
      </div>

      <section className="flex flex-col items-center text-center max-w-2xl mx-auto mb-16 sm:mb-20 md:mb-32 space-y-5 sm:space-y-6 md:space-y-8 animate-fadeInUp px-2 sm:px-0">
        <h3
          className="text-2xl sm:text-3xl md:text-4xl font-light text-[#1a1a1a] tracking-tight"
          dangerouslySetInnerHTML={{ __html: t.heritageTitle }}
        />
        <p className="text-gray-500 dark:!text-[#D9D2C6]/85 leading-relaxed font-sans text-base sm:text-lg tracking-wide">
          {t.heritageDesc}
        </p>
        <Link to="/about" className="group relative pt-4">
          <span className="text-[11px] uppercase tracking-[0.3em] font-bold text-[#b38b59]">{t.discoverMore}</span>
          <div className="w-full h-[1px] bg-[#b38b59]/30 mt-2 transition-all duration-500 group-hover:bg-[#b38b59]" />
        </Link>
      </section>
    </main>
  );
};

export default WineSection;
