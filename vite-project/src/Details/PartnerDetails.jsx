

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useLanguage } from "../context/LanguageContext";
import SeoManager from "../Seo/SeoManager";


const translations = {
  GE: {
    loading: "იტვირთება...",
    home: "მთავარი",
    partners: "პარტნიორები",
    backBtn: "უკან დაბრუნება"
  },
  EN: {
    loading: "Loading...",
    home: "Home",
    partners: "Partners",
    backBtn: "Back"
  },
  RU: {
    loading: "Загрузка...",
    home: "Главная",
    partners: "Партнеры",
    backBtn: "Назад"
  }
};

export default function PartnerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const t = translations[lang];
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPartner = async () => {
      try {
        const docRef = doc(db, "partners", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPartner({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error("Error fetching partner:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPartner();
  }, [id]);

  const getLangValue = (obj, field) => {
    if (!obj) return "";
    if (lang === "EN") return obj[field] || "";
    const langField = `${field}_${lang.toLowerCase()}`;
    return (obj[langField] && obj[langField].trim() !== "") ? obj[langField] : obj[field];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-medium text-[#2d0a0a]">
        {t.loading}
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-serif">
        <p className="text-[#5b1f1f] mb-4">Partner not found</p>
        <button onClick={() => navigate("/")} className="text-[#5b1f1f] underline">Back Home</button>
      </div>
    );
  }

  const displayName = getLangValue(partner, "name");
  const displayDesc = getLangValue(partner, "description");

  const breadcrumbs = [
    { name: t.home, url: "/" },
    { name: t.partners, url: "/partners" },
    { name: displayName, url: `/partner/${partner.id}` },
  ];

  const articleSchema = {
    headline: displayName,
    description: displayDesc,
    image: partner.img,
    author: { "@type": "Organization", name: "LAMIANI" },
    publisher: {
      "@type": "Organization",
      name: "LAMIANI",
      logo: { "@type": "ImageObject", url: "https://lamiani.ge/new.png" },
    },
    mainEntityOfPage: `https://lamiani.ge/partner/${partner.id}`,
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0E14] text-[#1a1a1a] dark:text-gray-200 flex flex-col items-center py-10 px-4 sm:px-8 font-serif relative transition-colors duration-300">
      <SeoManager
        title={`${displayName} | LAMIANI Partner Estates`}
        description={displayDesc || `${displayName} — partner estate of LAMIANI, premium Georgian winery.`}
        image={partner.img}
        ogType="article"
        breadcrumbs={breadcrumbs}
        articleSchema={articleSchema}
        keywords={`${displayName}, partner, winery, Georgian wine, LAMIANI`}
      />

      <div className="max-w-[1000px] w-full flex flex-col gap-12 mt-16">
        
        {/* ზედა სექცია: ლოგო და სათაური */}
        <div className="flex flex-col items-center text-center">
          <div className="w-48 mb-6">
             <img
               src={partner.img}
               alt={`${displayName} winery logo`}
               width="200"
               height="200"
               fetchpriority="high"
               decoding="async"
               className="w-full h-auto object-contain transition-transform duration-500 hover:scale-110"
             />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-[#1a1a1a] uppercase tracking-[0.2em] mb-4">
            {displayName}
          </h1>
          <div className="w-16 h-[2px] bg-[#5b1f1f]"></div>
        </div>

        {/* ქვედა სექცია: ტექსტური ბლოკი */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-12 items-start py-10 border-t border-gray-200">
          
          <div className="hidden md:flex justify-center opacity-30">
            <img 
              src="https://media.qnarigroup.com/bAeRwOH-zYHVTACFcIybTwkmwLrDAmxVqyRmSr11CGk/s:768:480:t/f:webp/aHR0cHM6Ly93aW5lbGFuZC5nZS9fbmV4dC9zdGF0aWMvbWVkaWEvZ3JhcGVzLjFiOTY1MTc0LnBuZw" 
              alt="Decoration" 
              className="w-40 grayscale"
            />
          </div>

          <div className="flex flex-col gap-6 text-left">
            <h2 className="text-3xl font-bold text-[#1a1a1a] leading-tight">
             {displayName}
            </h2>
            <div className="w-20 h-1 bg-[#5b1f1f] rounded-full"></div>
            <div className="space-y-6">
              <p className="text-[#333] text-lg leading-[1.8] font-light whitespace-pre-line">
                {displayDesc}
              </p>
            </div>
            
            <div className="mt-4">
               <button className="px-8 py-3 border border-[#5b1f1f] text-[#5b1f1f] hover:bg-[#5b1f1f] hover:text-white transition-all duration-300 uppercase tracking-widest text-sm"
                onClick={() => navigate(-1)}
               >
                 {t.backBtn}
               </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}