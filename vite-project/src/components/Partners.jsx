

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // დავამატეთ ლინკი
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useLanguage } from "../context/LanguageContext";

const translations = {
  GE: { badge: "სანდო მეურნეობები", title: "პარტნიორი <span class='text-[#5b1f1f]'>მარნები</span>" },
  EN: { badge: "Trusted Estates", title: "Partner <span class='text-[#5b1f1f]'>Wineries</span>" },
  RU: { badge: "Надежные хозяйства", title: "Винодельни-<span class='text-[#5b1f1f]'>партнеры</span>" }
};

const Partners = () => {
  const [partners, setPartners] = useState([]);
  const { lang } = useLanguage();
  const t = translations[lang];

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "partners"));
        const partnersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPartners(partnersData);
      } catch (error) {
        console.error("Error fetching partners:", error);
      }
    };
    fetchPartners();
  }, []);

  if (partners.length === 0) return null;

  return (
    <section className="py-24 bg-white dark:bg-[#0B0E14] text-[#1a1a1a] dark:text-gray-200 overflow-hidden font-serif transition-colors duration-300">
      <div className="max-w-[1440px] mx-auto px-6 mb-16 text-center">
        <span className="text-[10px] uppercase tracking-[0.5em] text-[#5b1f1f] font-bold mb-4 block animate-fadeIn">
          {t.badge}
        </span>
        <h2 className="text-4xl md:text-5xl font-light text-[#1a1a1a] tracking-tighter italic"
            dangerouslySetInnerHTML={{ __html: t.title }}>
        </h2>
        <div className="w-10 h-[1px] bg-[#5b1f1f]/20 mx-auto mt-8"></div>
      </div>

      {/* INFINITE SLIDER CONTAINER */}
      <div className="relative flex overflow-hidden group">
        <div className="flex gap-12 animate-scroll group-hover:pause-animation py-4">
          {/* ვამრავლებთ მასივს უწყვეტი სკროლისთვის */}
          {[...partners, ...partners, ...partners].map((partner, index) => {
            const displayName = lang === "EN" ? partner.name : partner[`name_${lang.toLowerCase()}`] || partner.name;

            return (
              <Link
                to={`/partner/${partner.id}`} // გადამისამართება დეტალურ გვერდზე
                key={`${partner.id}-${index}`}
                className="flex-shrink-0 w-[200px] md:w-[280px] group/item cursor-pointer block"
              >
                <div className="relative aspect-[4/3] bg-[#fdfdfd] border border-gray-100/50 rounded-sm overflow-hidden transition-all duration-700 group-hover/item:shadow-xl group-hover/item:shadow-[#5b1f1f]/5">
                  <img
                    src={partner.img}
                    alt={displayName}
                    loading="lazy"
                    className="w-full h-full object-contain p-8 grayscale group-hover/item:grayscale-0 transition-all duration-700"
                  />
                  
                  <div className="absolute inset-0 bg-[#5b1f1f]/5 opacity-0 group-hover/item:opacity-100 transition-opacity duration-500 flex items-end p-6">
                    <p className="text-[#5b1f1f] text-[10px] uppercase tracking-widest font-bold border-b border-[#5b1f1f]/30 pb-1">
                      {displayName}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* CSS ანიმაცია */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-200px * ${partners.length} - 3rem * ${partners.length})); }
        }
        @media (min-width: 768px) {
          @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(calc(-280px * ${partners.length} - 3rem * ${partners.length})); }
          }
        }
        .animate-scroll {
          animation: scroll 40s linear infinite; /* სიჩქარე ოდნავ შევანელეთ უკეთესი კითხვადობისთვის */
        }
        .pause-animation {
          animation-play-state: paused;
        }
      `}} />
    </section>
  );
};

export default Partners;