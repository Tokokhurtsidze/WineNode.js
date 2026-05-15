
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useLanguage } from "../context/LanguageContext";
import SeoManager from "../Seo/SeoManager"; // ახალი SEO მენეჯერი

const translations = {
  GE: {
    seoTitle: "ჩვენი პარტნიორები | Lamiani",
    seoDesc: "აღმოაჩინეთ ჩვენი პარტნიორი მარნები და მათი გამორჩეული ნაწარმი.",
    badge: "პარტნიორები",
    mainTitle: "ჩვენი <span class='italic text-[#5b1f1f]'>მეურნეობები</span>",
    explore: "დათვალიერება",
    winery: "მარანი"
  },
  EN: {
    seoTitle: "Our Partners | Lamiani",
    seoDesc: "Discover our partner wineries and their exceptional products.",
    badge: "Partners",
    mainTitle: "Our <span class='italic text-[#5b1f1f]'>Estates</span>",
    explore: "Explore",
    winery: "Winery"
  },
  RU: {
    seoTitle: "Наши партнеры | Lamiani",
    seoDesc: "Откройте для себя наши партнерские винодельни.",
    badge: "Партнеры",
    mainTitle: "Наши <span class='italic text-[#5b1f1f]'>поместья</span>",
    explore: "Посмотреть",
    winery: "Винодельня"
  }
};

export default function Partners() {
  const [partners, setPartners] = useState([]);
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const t = translations[lang];

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const snap = await getDocs(collection(db, "partners"));
        setPartners(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching partners:", error);
      }
    };
    fetchPartners();
  }, []);

  const getLangValue = (obj, field) => {
    if (lang === "EN") return obj[field];
    const langField = `${field}_${lang.toLowerCase()}`;
    return (obj[langField] && obj[langField].trim() !== "") ? obj[langField] : obj[field];
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0E14] text-[#1a1a1a] dark:text-gray-200 pt-24 pb-20 px-6 font-serif transition-colors duration-300">
      {/* SeoManager მართავს Title, Meta-ს და Hreflang ლინკებს */}
      <SeoManager 
        title={t.seoTitle} 
        description={t.seoDesc} 
      />

      <div className="max-w-[1100px] mx-auto">
        
        {/* HEADER */}
        <div className="text-center mb-16">
          <span className="text-[9px] uppercase tracking-[0.4em] text-[#5b1f1f] font-bold mb-3 block opacity-80">
            {t.badge}
          </span>
          <h2 className="text-4xl md:text-5xl font-light text-[#1a1a1a] tracking-tighter mb-4"
              dangerouslySetInnerHTML={{ __html: t.mainTitle }}>
          </h2>
          <div className="w-8 h-[1px] bg-[#5b1f1f]/20 mx-auto mt-6"></div>
        </div>

        {/* PARTNERS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
          {partners.map((partner, index) => {
            const displayName = getLangValue(partner, "name");
            
            return (
              <div
                key={partner.id}
                onClick={() => navigate(`/partner/${partner.id}`)}
                className="group cursor-pointer flex flex-col items-center animate-fadeInUp"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* IMAGE CONTAINER */}
                <div className="relative w-full aspect-square mb-4 overflow-hidden bg-[#f9f9f9] border border-gray-100/50 transition-all duration-500 group-hover:shadow-lg group-hover:shadow-[#5b1f1f]/5">
                  <img
                    src={partner.img}
                    alt={displayName}
                    className="w-full h-full object-contain p-4 transition-transform duration-700 group-hover:scale-105"
                  />
                  
                  {/* OVERLAY */}
                  <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-[#1a1a1a] text-[8px] uppercase tracking-widest font-bold border-b border-[#1a1a1a] pb-1">
                      {t.explore}
                    </span>
                  </div>
                </div>

                {/* INFO */}
                <div className="text-center px-2">
                  <h3 className="text-sm font-medium text-[#1a1a1a] tracking-tight group-hover:text-[#5b1f1f] transition-colors">
                    {displayName}
                  </h3>
                  <span className="text-[8px] uppercase tracking-widest text-gray-400 mt-1 block">
                    {t.winery}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp { animation: fadeInUp 0.8s ease-out forwards; }
      `}} />
    </div>
  );
}