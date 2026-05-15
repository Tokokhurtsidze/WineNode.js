
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useLanguage } from "../context/LanguageContext";
import SeoManager from "../Seo/SeoManager";


const translations = {
  GE: {
    loading: "იტვირთება...",
    notFound: "ღვინო ვერ მოიძებნა",
    backBtn: "უკან",
    homeBtn: "მთავარ გვერდზე დაბრუნება",
    aboutTitle: "ღვინის შესახებ",
    home: "მთავარი",
    popular: "პოპულარული ღვინოები"
  },
  EN: {
    loading: "Loading...",
    notFound: "Wine not found",
    backBtn: "Back",
    homeBtn: "Back to Home",
    aboutTitle: "About the Wine",
    home: "Home",
    popular: "Popular Wines"
  },
  RU: {
    loading: "Загрузка...",
    notFound: "Вино не найдено",
    backBtn: "Назад",
    homeBtn: "На главную",
    aboutTitle: "О вине",
    home: "Главная",
    popular: "Популярные вина"
  }
};

export default function WineDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const t = translations[lang];
  const [wine, setWine] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWine = async () => {
      try {
        const docRef = doc(db, "popularWines", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setWine({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error("Error fetching wine:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWine();
  }, [id]);

  const getLangValue = (obj, field) => {
    if (!obj) return "";
    if (lang === "EN") return obj[field] || "";
    const langField = `${field}_${lang.toLowerCase()}`;
    return (obj[langField] && obj[langField].trim() !== "") ? obj[langField] : obj[field];
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-serif">{t.loading}</div>;

  if (!wine)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-serif bg-white text-center px-4">
        <p className="text-xl text-[#5b1f1f] mb-4">{t.notFound}</p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2 bg-[#5b1f1f] text-white rounded hover:bg-[#3e1414] transition"
        >
          {t.homeBtn}
        </button>
      </div>
    );

  const displayName = getLangValue(wine, "name");
  const displayDesc = getLangValue(wine, "description");

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": t.home, "item": "https://lamiani.ge/" },
      { "@type": "ListItem", "position": 2, "name": t.popular, "item": "https://lamiani.ge/all-wines" },
      { "@type": "ListItem", "position": 3, "name": displayName, "item": `https://lamiani.ge/wine/${wine.id}` }
    ]
  };

  const wineStructuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": displayName,
    "image": wine.img,
    "description": displayDesc,
    "offers": wine.price ? {
      "@type": "Offer",
      "price": wine.price.toString().replace(/[^0-9.]/g, ""),
      "priceCurrency": "GEL",
      "availability": "https://schema.org/InStock",
      "url": `https://lamiani.ge/wine/${wine.id}`
    } : undefined
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0E14] text-[#1a1a1a] dark:text-gray-200 flex flex-col items-center py-12 px-4 sm:px-8 font-serif relative transition-colors duration-300">
      {/* SeoManager მართავს დინამიურ Title, Meta და Hreflang ლინკებს ID-ს ჩათვლით */}
      <SeoManager 
        title={`${displayName} - Lamiani`} 
        description={displayDesc}
        image={wine.img}
      />

      <script type="application/ld+json">{JSON.stringify(breadcrumbData)}</script>
      <script type="application/ld+json">{JSON.stringify(wineStructuredData)}</script>

      {/* Back Button */}
      {/* <button
        onClick={() => navigate(-1)}
        className="absolute top-8 left-8 text-[#5b1f1f] border-b border-[#5b1f1f] pb-1 hover:opacity-70 transition-all duration-300 z-10"
      >
        ← {t.backBtn}
      </button> */}

      <div className="max-w-[800px] w-full flex flex-col items-center mt-12">
        <div className="flex flex-col items-center text-center mb-10">
          <h1 className="text-3xl sm:text-5xl font-bold text-[#1a1a1a] uppercase tracking-tight mb-4">
            {displayName}
          </h1>
          <div className="w-12 h-[2px] bg-[#5b1f1f] mb-4"></div>
          {wine.price && <p className="text-3xl font-bold text-[#5b1f1f]">{wine.price}</p>}
        </div>

        <div className="w-full flex justify-center mb-12">
          <img
            src={wine.img}
            alt={displayName}
            className="h-[450px] sm:h-[550px] w-auto object-contain transition-transform duration-700 hover:scale-105"
          />
        </div>

        <div className="w-full flex flex-col items-center text-center">
          <div className="max-w-[650px] border-t border-gray-100 pt-8">
            <h3 className="text-lg font-bold text-[#1a1a1a] mb-6 uppercase tracking-widest">
              {t.aboutTitle}
            </h3>
            <p className="text-gray-600 text-lg leading-relaxed font-light whitespace-pre-line">
              {displayDesc}
            </p>
          </div>

          <button
            onClick={() => navigate("/")}
            className="mt-12 px-10 py-3 border border-[#5b1f1f] text-[#5b1f1f] uppercase tracking-widest text-xs font-bold hover:bg-[#5b1f1f] hover:text-white transition-all duration-300"
          >
            {t.homeBtn}
          </button>
        </div>
      </div>
    </div>
  );
}