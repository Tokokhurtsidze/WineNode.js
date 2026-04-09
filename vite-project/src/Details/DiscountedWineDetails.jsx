

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useLanguage } from "../context/LanguageContext";
import SeoManager from "../Seo/SeoManager"; // ახალი SEO მენეჯერი

const translations = {
  GE: {
    loading: "იტვირთება...",
    notFound: "ღვინო ვერ მოიძებნა",
    backBtn: "უკან დაბრუნება",
    homeBtn: "მთავარ გვერდზე დაბრუნება",
  },
  EN: {
    loading: "Loading...",
    notFound: "Wine not found",
    backBtn: "Back",
    homeBtn: "Back to Home",
  },
  RU: {
    loading: "Загрузка...",
    notFound: "Вино не найдено",
    backBtn: "Назад",
    homeBtn: "На главную",
  }
};

export default function DiscountedWineDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const t = translations[lang];

  const [wine, setWine] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWine = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "discountedWines", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const oldPriceNum = Number(data.oldPrice);
          const newPriceNum = Number(data.newPrice);
          const discount = oldPriceNum && newPriceNum
              ? Math.round(((oldPriceNum - newPriceNum) / oldPriceNum) * 100)
              : 0;

          setWine({
            ...data,
            oldPrice: oldPriceNum,
            newPrice: newPriceNum,
            discount,
          });
        }
      } catch (error) {
        console.error("Error fetching wine:", error);
      }
      setLoading(false);
    };
    fetchWine();
  }, [id]);

  const getLangValue = (obj, field) => {
    if (!obj) return "";
    if (lang === "EN") return obj[field] || "";
    const langField = `${field}_${lang.toLowerCase()}`;
    return (obj[langField] && obj[langField].trim() !== "") ? obj[langField] : obj[field];
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-[#5b1f1f] font-serif tracking-widest uppercase">
      {t.loading}
    </div>
  );

  if (!wine) return (
    <div className="min-h-screen flex flex-col items-center justify-center font-serif bg-white">
      <p className="text-xl mb-4 text-gray-800">{t.notFound}</p>
      <button 
        onClick={() => navigate("/")} 
        className="px-6 py-2 bg-[#5b1f1f] text-white rounded hover:opacity-90 transition"
      >
        {t.homeBtn}
      </button>
    </div>
  );

  const displayName = getLangValue(wine, "name");
  const displayDesc = getLangValue(wine, "description");
  const displayType = getLangValue(wine, "type");

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: displayName,
    image: wine.img,
    description: displayDesc,
    offers: {
      "@type": "Offer",
      price: wine.newPrice,
      priceCurrency: "GEL",
      availability: "https://schema.org/InStock",
      url: `https://lamiani.ge/discounted/${id}`,
    },
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center py-12 px-4 sm:px-8 font-serif relative">
      {/* SeoManager მართავს დინამიურ Title, Meta და Hreflang ლინკებს */}
      <SeoManager 
        title={`${displayName} - ${wine.discount}% OFF | Lamiani`} 
        description={displayDesc} 
        image={wine.img}
      />

      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>

      <div className="max-w-[800px] w-full flex flex-col items-center mt-12">
        
        {/* სათაური და ტიპი */}
        <div className="flex flex-col items-center text-center mb-10">
          <p className="text-[#5b1f1f] uppercase tracking-[0.3em] text-xs mb-3 font-semibold">
            {displayType}
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold text-[#1a1a1a] uppercase tracking-tight mb-4">
            {displayName}
          </h1>
          <div className="w-12 h-[2px] bg-[#5b1f1f]"></div>
        </div>

        {/* სურათი */}
        <div className="w-full flex justify-center mb-12">
          <img
            src={wine.img}
            alt={displayName}
            className="h-[450px] sm:h-[550px] w-auto object-contain"
          />
        </div>

        {/* ინფორმაცია */}
        <div className="w-full flex flex-col items-center text-center">
          
          {/* ფასი */}
          <div className="flex items-center justify-center gap-5 mb-10">
            <div className="flex flex-col items-end">
               <span className="text-gray-400 line-through text-sm">{wine.oldPrice} ₾</span>
               <span className="text-4xl font-bold text-[#5b1f1f]">{wine.newPrice} ₾</span>
            </div>
            {wine.discount > 0 && (
              <span className="bg-[#5b1f1f] text-white px-3 py-1 text-sm font-bold rounded">
                -{wine.discount}%
              </span>
            )}
          </div>

          {/* აღწერა */}
          <div className="max-w-[650px] border-t border-gray-100 pt-8">
            <p className="text-gray-600 text-lg leading-relaxed font-light whitespace-pre-line">
              {displayDesc}
            </p>
          </div>

          {/* ქვედა ღილაკი */}
          <button
            onClick={() => navigate(-1)}
            className="mt-12 px-10 py-3 border border-[#5b1f1f] text-[#5b1f1f] uppercase tracking-widest text-xs font-bold hover:bg-[#5b1f1f] hover:text-white transition-all duration-300"
          >
            {t.backBtn}
          </button>
        </div>
      </div>
    </div>
  );
}