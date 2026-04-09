
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useLanguage } from "../context/LanguageContext";
import SeoManager from "../Seo/SeoManager";

const translations = {
  GE: {
    title: "ჩვენი კოლექცია | Lamiani",
    description: "აღმოაჩინეთ საუკეთესო ქართული ღვინოები ჩვენს კოლექციაში.",
    popularTitle: "პოპულარული ღვინოები",
    discountTitle: "სპეციალური შეთავაზებები",
    explore: "დათვალიერება",
    collectionLabel: "კოლექცია",
    specialLabel: "სპეციალური"
  },
  EN: {
    title: "Our Collection | Lamiani",
    description: "Discover the best Georgian wines in our collection.",
    popularTitle: "Popular Wines",
    discountTitle: "Special Offers",
    explore: "Explore",
    collectionLabel: "Collection",
    specialLabel: "Special"
  },
  RU: {
    title: "Наша коллекция | Lamiani",
    description: "Откройте для себя лучшие грузинские вина в нашей коллекции.",
    popularTitle: "Популярные Вина",
    discountTitle: "Специальные Предложения",
    explore: "Посмотреть",
    collectionLabel: "Коллекция",
    specialLabel: "Спецпредложение"
  }
};

export default function AllWines() {
  const [popularWines, setPopularWines] = useState([]);
  const [discountedWines, setDiscountedWines] = useState([]);
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const t = translations[lang] || translations["EN"];

  useEffect(() => {
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal-active");
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll(".reveal");
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [popularWines, discountedWines]);

  useEffect(() => {
    const fetchWines = async () => {
      try {
        const popSnap = await getDocs(collection(db, "popularWines"));
        setPopularWines(popSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const discSnap = await getDocs(collection(db, "discountedWines"));
        setDiscountedWines(discSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching wines:", error);
      }
    };
    fetchWines();
  }, []);

  const getLangValue = (obj, field) => {
    if (lang === "EN") return obj[field];
    const langField = `${field}_${lang.toLowerCase()}`;
    return (obj[langField] && obj[langField].trim() !== "") ? obj[langField] : obj[field];
  };

  const renderSplitTitle = (text) => {
    const words = text.split(' ');
    const firstWord = words[0];
    const restOfWords = words.slice(1).join(' ');
    return (
      <>
        {firstWord} <span className="italic text-[#5b1f1f]">{restOfWords}</span>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-white font-serif pt-24 pb-20 px-6">
      <SeoManager title={t.title} description={t.description} />

      <div className="max-w-[1200px] mx-auto flex flex-col gap-24">
        
        {/* პოპულარული ღვინოების სექცია */}
        <section>
          <div className="flex flex-col items-center mb-16 reveal">
            <span className="text-[10px] uppercase tracking-[0.4em] text-[#5b1f1f] font-bold mb-3 block opacity-80">
              {t.collectionLabel}
            </span>
            <h2 className="text-4xl md:text-5xl font-light text-[#1a1a1a] tracking-tighter">
              {renderSplitTitle(t.popularTitle)}
            </h2>
            <div className="w-12 h-[1px] bg-[#5b1f1f]/20 mx-auto mt-6"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-16">
            {popularWines.map((wine, index) => (
              <div
                key={wine.id}
                onClick={() => navigate(`/wine/${wine.id}`)}
                className="reveal group flex flex-col items-center cursor-pointer"
                style={{ transitionDelay: `${(index % 4) * 150}ms` }}
              >
                <div className="relative w-full aspect-[2/3] bg-[#fdfdfd] border border-gray-100/50 flex items-center justify-center p-8 overflow-hidden transition-all duration-700 group-hover:shadow-2xl group-hover:shadow-[#5b1f1f]/5">
                  <img
                    src={wine.img}
                    alt={getLangValue(wine, "name")}
                    className="h-full object-contain transition-transform duration-1000 cubic-bezier group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                    <span className="text-[#1a1a1a] text-[10px] uppercase tracking-widest font-bold border-b border-[#1a1a1a] pb-1">
                      {t.explore}
                    </span>
                  </div>
                </div>
                <div className="mt-6 text-center">
                  {/* ფასი ამოღებულია დიზაინის მოთხოვნისამებრ */}
                  <h3 className="text-base text-[#1a1a1a] font-medium tracking-tight group-hover:text-[#5b1f1f] transition-colors duration-300">
                    {getLangValue(wine, "name")}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ფასდაკლებული ღვინოების სექცია */}
        <section>
          <div className="flex flex-col items-center mb-16 reveal">
            <span className="text-[10px] uppercase tracking-[0.4em] text-[#5b1f1f] font-bold mb-3 block opacity-80">
              {t.specialLabel}
            </span>
            <h2 className="text-4xl md:text-5xl font-light text-[#1a1a1a] tracking-tighter">
              {renderSplitTitle(t.discountTitle)}
            </h2>
            <div className="w-12 h-[1px] bg-[#5b1f1f]/20 mx-auto mt-6"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-16">
            {discountedWines.map((wine, index) => {
              const oldPrice = Number(wine.oldPrice);
              const newPrice = Number(wine.newPrice);
              const discount = oldPrice > 0 ? Math.round(((oldPrice - newPrice) / oldPrice) * 100) : 0;

              return (
                <div
                  key={wine.id}
                  onClick={() => navigate(`/discounted/${wine.id}`)}
                  className="reveal group flex flex-col items-center cursor-pointer"
                  style={{ transitionDelay: `${(index % 4) * 150}ms` }}
                >
                  <div className="relative w-full aspect-[2/3] bg-[#fdfdfd] border border-gray-100/50 flex items-center justify-center p-8 overflow-hidden transition-all duration-700 group-hover:shadow-2xl group-hover:shadow-[#5b1f1f]/5">
                    {discount > 0 && (
                      <div className="absolute top-4 right-4 bg-[#5b1f1f] text-white text-[10px] font-bold px-2 py-1 z-10">
                        -{discount}%
                      </div>
                    )}
                    <img
                      src={wine.img}
                      alt={getLangValue(wine, "name")}
                      className="h-full object-contain transition-transform duration-1000 group-hover:scale-110"
                    />
                  </div>
                  <div className="mt-6 text-center">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <span className="text-xs text-gray-400 line-through">{wine.oldPrice} ₾</span>
                      <span className="text-sm font-bold text-[#5b1f1f]">{wine.newPrice} ₾</span>
                    </div>
                    <h3 className="text-base text-[#1a1a1a] font-medium tracking-tight">
                      {getLangValue(wine, "name")}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .reveal {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.9s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal-active {
          opacity: 1;
          transform: translateY(0);
        }
        .cubic-bezier {
          transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}} />
    </div>
  );
}