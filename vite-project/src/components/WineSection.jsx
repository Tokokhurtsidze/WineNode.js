import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useLanguage } from "../context/LanguageContext";

const translations = {
  GE: {
    badge: "ბუნების არსი",
    title: "ბუნებრივი <span class='text-[#5b1f1f]'>არომატი</span>",
    heritageTitle: "ჩვენი <span class='italic'>მემკვიდრეობა</span>",
    heritageDesc: "ყველაფერი დაიწყო მარტივი რწმენით: რომ ღვინო საქართველოს სულია. ჩვენი ისტორია ქვევრის თიხითა და იმ ოჯახების შრომით დაიწერა, რომლებიც ამ ტრადიციებს 8,000 წელია ინახავენ.",
    discoverMore: "გაიგე მეტი",
    terroir: "ტერუარი",
    terroirQuote: "სადაც მიწა ხვდება სულს",
    altGallery: "ქართული ღვინის გალერეა - Wineland",
    altVineyard: "ვენახის პეიზაჟი მზის ჩასვლისას"
  },
  EN: {
    badge: "Nature's Essence",
    title: "Natural <span class='text-[#5b1f1f]'>Aroma</span>",
    heritageTitle: "Our <span class='italic'>Heritage</span>",
    heritageDesc: "Everything started with a simple belief: that wine is the soul of Georgia. Our history is written in the clay of Qvevris and the sweat of hardworking families who have preserved these traditions for 8,000 years.",
    discoverMore: "Discover More",
    terroir: "The Terroir",
    terroirQuote: "Where Earth meets Soul",
    altGallery: "Georgian Wine Gallery - Wineland",
    altVineyard: "Vineyard landscape at sunset"
  },
  RU: {
    badge: "Сущность природы",
    title: "Натуральный <span class='text-[#5b1f1f]'>аромат</span>",
    heritageTitle: "Наше <span class='italic'>наследие</span>",
    heritageDesc: "Все началось с простой веры: вино — это душа Грузии. Наша история написана глиной квеври и трудом семей, сохранивших эти традиции на протяжении 8000 лет.",
    discoverMore: "Узнать больше",
    terroir: "Терруар",
    terroirQuote: "Где земля встречается с душой",
    altGallery: "Галерея грузинских вин - Wineland",
    altVineyard: "Пейзаж виноградника на закате"
  }
};

const WineSection = () => {
  const [wineImages, setWineImages] = useState([]);
  const { lang } = useLanguage();
  const t = translations[lang];

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "wineGallery"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setWineImages(data);
      },
      (error) => console.error("Error fetching wine images:", error)
    );
    return () => unsubscribe();
  }, []);

  return (
    <main className="max-w-[1300px] mx-auto px-6 py-24 bg-white font-serif">
      
      {/* HEADER */}
      <div className="text-center mb-16 space-y-4">
        <span className="text-[10px] uppercase tracking-[0.5em] text-[#b38b59] font-bold block animate-fadeIn">
          {t.badge}
        </span>
        <h2 className="text-4xl md:text-6xl font-light text-[#1a1a1a] tracking-tighter italic"
            dangerouslySetInnerHTML={{ __html: t.title }}>
        </h2>
        <div className="w-12 h-[1px] bg-[#b38b59]/30 mx-auto mt-6"></div>
      </div>

      {/* MOBILE SWIPER */}
      <div className="sm:hidden mb-20">
        <Swiper 
          watchSlidesProgress={true} 
          slidesPerView={1.3} 
          spaceBetween={20}
          centeredSlides={true}
        >
          {wineImages.map((wine) => (
            <SwiperSlide key={wine.id}>
              <div className="relative aspect-[3/4] rounded-sm overflow-hidden shadow-xl shadow-black/5">
                <img
                  src={wine.img}
                  alt={wine.alt || t.altGallery} // ვიყენებთ დინამიურ Alt-ს
                  className="w-full h-full object-cover"
                  loading="lazy" // SEO: Lazy loading რესურსების დასაზოგად
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* TABLET & DESKTOP GRID */}
      <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 gap-6 mb-32">
        {wineImages.map((wine, idx) => (
          <div 
            key={wine.id} 
            className={`relative group overflow-hidden rounded-sm bg-gray-50 shadow-sm transition-all duration-700 hover:shadow-2xl hover:shadow-[#5b1f1f]/10 ${
              idx % 2 === 1 ? "md:translate-y-8" : ""
            }`}
          >
            <img
              src={wine.img}
              alt={wine.alt || t.altGallery}
              className="w-full h-[300px] md:h-[400px] object-cover transition-transform duration-[2s] group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>
        ))}
      </div>

      {/* OUR HISTORY SECTION */}
      <section className="flex flex-col items-center text-center max-w-2xl mx-auto mb-32 space-y-8 animate-fadeInUp">
        <h3 className="text-3xl md:text-4xl font-light text-[#1a1a1a] tracking-tight"
            dangerouslySetInnerHTML={{ __html: t.heritageTitle }}>
        </h3>
        <p className="text-gray-500 leading-relaxed font-sans text-lg tracking-wide">
          {t.heritageDesc}
        </p>
        <Link to="/about" className="group relative pt-4">
          <span className="text-[11px] uppercase tracking-[0.3em] font-bold text-[#b38b59]">{t.discoverMore}</span>
          <div className="w-full h-[1px] bg-[#b38b59]/30 mt-2 transition-all duration-500 group-hover:bg-[#b38b59] group-hover:w-full"></div>
        </Link>
      </section>

      {/* VINEYARD IMAGE */}
      <div className="relative h-[450px] w-full overflow-hidden rounded-sm group shadow-2xl">
        <img
          src="https://static.vecteezy.com/system/resources/thumbnails/073/305/489/small/red-wine-bottle-and-glass-placed-on-rustic-wooden-barrel-in-vineyard-during-sunset-showcasing-serene-landscape-and-inviting-atmosphere-for-relaxation-and-enjoyment-photo.jpeg"
          alt={t.altVineyard}
          className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="border border-white/30 backdrop-blur-sm p-10 text-white text-center">
            <h4 className="text-[10px] uppercase tracking-[0.5em] mb-4">{t.terroir}</h4>
            <p className="text-3xl font-light italic">{t.terroirQuote}</p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default WineSection;