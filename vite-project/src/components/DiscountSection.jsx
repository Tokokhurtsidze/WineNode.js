

import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Virtual } from "swiper/modules";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useLanguage } from "../context/LanguageContext";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const translations = {
  GE: { badge: "სპეციალური შეთავაზებები", title: "ფასდაკლებული <span class='italic'>ღვინოები</span>", off: "აკლდება" },
  EN: { badge: "Special Offers", title: "Discounted <span class='italic'>Wines</span>", off: "OFF" },
  RU: { badge: "Спецпредложения", title: "Вина со <span class='italic'>скидкой</span>", off: "СКИДКА" }
};

export default function DiscountedWinesSwiper() {
  const { lang } = useLanguage();
  const t = translations[lang];
  const [swiperRef, setSwiperRef] = useState(null);
  const [slides, setSlides] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDiscountedWines = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "discountedWines"));
        if (!querySnapshot.empty) {
          const winesData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setSlides(winesData);
        }
      } catch (error) {
        console.error("Error fetching discounted wines:", error);
      }
    };
    fetchDiscountedWines();
  }, []);

  return (
    <section className="w-full px-4 max-w-[1250px] mx-auto relative my-28 font-serif">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-6">
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <span className="text-[#5b1f1f] text-xs uppercase tracking-[0.4em] mb-2 font-semibold opacity-80">{t.badge}</span>
          <h2 className="text-3xl md:text-4xl font-light text-[#1a1a1a] uppercase tracking-wider" 
              dangerouslySetInnerHTML={{ __html: t.title }}>
          </h2>
          <div className="w-16 h-[1px] bg-[#5b1f1f]/30 mt-4"></div>
        </div>

        {/* Custom Navigation */}
        <div className="flex gap-4">
          <button 
            aria-label="Previous slide"
            onClick={() => swiperRef?.slidePrev()} 
            className="w-12 h-12 flex items-center justify-center border border-gray-200 rounded-full hover:border-[#5b1f1f] transition-all bg-white shadow-sm"
          >
            ←
          </button>
          <button 
            aria-label="Next slide"
            onClick={() => swiperRef?.slideNext()} 
            className="w-12 h-12 flex items-center justify-center border border-gray-200 rounded-full hover:border-[#5b1f1f] transition-all bg-white shadow-sm"
          >
            →
          </button>
        </div>
      </div>

      <Swiper
        modules={[Virtual, Navigation, Pagination]}
        onSwiper={setSwiperRef}
        spaceBetween={25}
        virtual
        breakpoints={{
          0: { slidesPerView: 1.2, spaceBetween: 15 },
          640: { slidesPerView: 2.2, spaceBetween: 20 },
          1024: { slidesPerView: 3, spaceBetween: 25 },
          1280: { slidesPerView: 4, spaceBetween: 25 },
        }}
        className="pb-12"
      >
        {slides.map((slide) => {
          const oldPrice = Number(slide.oldPrice);
          const newPrice = Number(slide.newPrice);
          const discount = oldPrice && newPrice ? Math.round(((oldPrice - newPrice) / oldPrice) * 100) : 0;

          const displayName = lang === "EN" ? slide.name : slide[`name_${lang.toLowerCase()}`] || slide.name;
          const displayType = lang === "EN" ? slide.type : slide[`type_${lang.toLowerCase()}`] || slide.type;

          return (
            <SwiperSlide key={slide.id} virtualIndex={slide.id}>
              <article 
                onClick={() => navigate(`/discounted/${slide.id}`)}
                className="group flex flex-col w-full h-[480px] cursor-pointer bg-white"
              >
                <div className="relative w-full h-[320px] bg-[#f9f9f9] flex items-center justify-center p-8 border border-gray-100 transition-all duration-700 group-hover:border-[#5b1f1f]/20 overflow-hidden">
                  {discount > 0 && (
                    <div className="absolute top-4 left-4 bg-[#5b1f1f] text-white text-[10px] font-bold px-2 py-1 uppercase z-10">
                      {discount}% {t.off}
                    </div>
                  )}
                <img 
  // ეს ხაზი ავტომატურად ამუშავებს Cloudinary-ს ლინკს
  src={slide.img.includes('cloudinary.com') 
    ? slide.img.replace('/upload/', '/upload/e_trim/w_600,h_900,c_pad,b_transparent/') 
    : slide.img} 
  alt={displayName} 
  loading="lazy"
  className="h-full w-full object-contain transition-transform duration-1000 group-hover:scale-105" 
/>
                </div>

                <div className="flex-1 flex flex-col text-center px-4 py-6 items-center">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-2">{displayType || "Wine"}</p>
                  <h3 className="text-[#1a1a1a] text-base font-medium leading-tight h-10 flex items-center justify-center group-hover:text-[#5b1f1f] transition-colors line-clamp-2">
                    {displayName}
                  </h3>
                  
                  <div className="mt-auto flex flex-col items-center">
                    <div className="flex items-center gap-3">
                      <span className="text-[#5b1f1f] font-bold text-lg">{newPrice} ₾</span>
                      {oldPrice > 0 && <span className="text-gray-400 line-through text-sm italic">{oldPrice} ₾</span>}
                    </div>
                    <div className="w-0 h-[1px] bg-[#5b1f1f]/30 transition-all duration-700 group-hover:w-16 mt-3"></div>
                  </div>
                </div>
              </article>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </section>
  );
}