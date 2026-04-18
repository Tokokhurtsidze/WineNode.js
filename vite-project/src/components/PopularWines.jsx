import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useLanguage } from "../context/LanguageContext";

const translations = {
  GE: { 
    badge: "არჩევანი", 
    title: "პოპულარული <span class='italic'>ღვინოები</span>", 
    empty: "პოპულარული ღვინოები ჯერ არ არის დამატებული." 
  },
  EN: { 
    badge: "Selection", 
    title: "Popular <span class='italic'>Wines</span>", 
    empty: "No popular wines added yet." 
  },
  RU: { 
    badge: "Выбор", 
    title: "Популярные <span class='italic'>вина</span>", 
    empty: "Популярные вина еще не добавлены." 
  }
};

export default function PopularWines() {
  const navigate = useNavigate();
  const [slides, setSlides] = useState([]);
  const { lang } = useLanguage();
  const t = translations[lang];

  useEffect(() => {
    const fetchPopularWines = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "popularWines"));
        if (!querySnapshot.empty) {
          const winesData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setSlides(winesData);
          localStorage.setItem("popularWines", JSON.stringify(winesData));
        } else {
          const saved = JSON.parse(localStorage.getItem("popularWines")) || [];
          setSlides(saved);
        }
      } catch (error) {
        console.error("Error fetching popular wines:", error);
        const saved = JSON.parse(localStorage.getItem("popularWines")) || [];
        setSlides(saved);
      }
    };
    fetchPopularWines();
  }, []);

  return (
    <section className="w-full bg-[#fdfdfd] py-24 px-4 sm:px-8 font-serif">
      <div className="flex flex-col items-center mb-20">
        <span className="text-[#5b1f1f] text-xs uppercase tracking-[0.5em] mb-4 font-semibold opacity-80">
          {t.badge}
        </span>
        <h2 className="text-3xl md:text-5xl font-light text-[#1a1a1a] uppercase tracking-[0.1em] text-center"
            dangerouslySetInnerHTML={{ __html: t.title }}>
        </h2>
        <div className="w-16 h-[1px] bg-[#5b1f1f]/30 mt-8"></div>
      </div>

      {/* grid-cols-2 მობილურისთვის, lg:grid-cols-5 კომპიუტერისთვის */}
      <div className="max-w-[1240px] mx-auto grid grid-cols-2 lg:grid-cols-5 gap-y-16 gap-x-4 lg:gap-x-6 justify-items-center justify-center">
        {slides.length === 0 && (
          <p className="text-gray-400 italic col-span-full">{t.empty}</p>
        )}

        {slides.map((slide) => {
          const displayName = lang === "EN" ? slide.name : slide[`name_${lang.toLowerCase()}`] || slide.name;

          return (
            <article
              key={slide.id}
              onClick={() => navigate(`/wine/${slide.id}`)}
              className="group cursor-pointer flex flex-col items-center w-full max-w-[240px]"
            >
              <div className="relative w-full aspect-[2/3] bg-white flex items-center justify-center p-6 
                              border border-transparent transition-all duration-700 ease-in-out
                              group-hover:border-[#5b1f1f]/20 group-hover:shadow-sm overflow-hidden">
                
                <div className="absolute inset-0 bg-[#5b1f1f]/[0.01] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                
                <img
                  src={slide.img.includes('cloudinary.com') 
                    ? slide.img.replace('/upload/', '/upload/e_trim/w_600,h_900,c_pad,b_transparent/') 
                    : slide.img}
                  alt={displayName}
                  loading="lazy"
                  className="h-[85%] object-contain transition-transform duration-1000 ease-out 
                             group-hover:scale-105 drop-shadow-xl"
                />
              </div>

              <div className="mt-8 text-center px-2 flex flex-col items-center gap-3">
                <h3 className="text-[#1a1a1a] text-sm md:text-base font-medium tracking-tight leading-tight 
                               group-hover:text-[#5b1f1f] transition-colors duration-500 min-h-[40px] flex items-center">
                  {displayName}
                </h3>
                
                <div className="w-8 h-[1px] bg-gray-200 transition-all duration-500 group-hover:w-16 group-hover:bg-[#5b1f1f]/40"></div>
                
                {slide.price && (
                  <p className="text-sm text-gray-400 font-sans tracking-widest mt-1 italic">
                    {slide.price} ₾
                  </p>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}