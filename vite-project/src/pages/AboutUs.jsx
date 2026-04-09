
import React from "react";
import { useLanguage } from "../context/LanguageContext";
import SeoManager from "../Seo/SeoManager";

import { Link } from "react-router-dom";

const translations = {
  GE: {
    seoTitle: "ჩვენს შესახებ | Lamiani Winery",
    badge: "ჩვენი ისტორია",
    title: "ფესვები <span class='italic'>მემკვიდრეობაში</span>",
    p1: "მოგესალმებით ლამიანში — სივრცეში, რომელიც დაიბადა ქართული ღვინისა და მის უკან მდგარი ადამიანების სიყვარულით. ჩვენ ვთანამშრომლობთ მარნებთან, დაწყებული კახეთის პატარა საოჯახო მეურნეობებიდან, დიდ მამულებამდე.",
    p2: "საქართველო არ არის მხოლოდ კიდევ ერთი მეღვინეობის ქვეყანა. ეს არის მეღვინეობის სამშობლო — 8000 წლიანი ისტორიით, ქვევრებითა და თითოეულ ბოთლში დადუღებული ამბებით.",
    quote: '"ყველა კარგი ღვინო იწყება კარგი ისტორიით. ჩვენი მისიაა, ეს ისტორიები მთელმა მსოფლიომ მოისმინოს."',
    stats: [{ l: "ისტორია", v: "8000 წელი" }, { l: "მარნები", v: "50+" }, { l: "ტრადიცია", v: "ქვევრი" }, { l: "ხარისხი", v: "პრემიუმი" }],
    cta: "მზად ხართ ჩვენი მარნის დასათვალიერებლად?",
    btn: "კოლექციის ნახვა"
  },
  EN: {
    seoTitle: "About Us | Lamiani Winery",
    badge: "Our Story",
    title: "Rooted in <span class='italic'>Heritage</span>",
    p1: "Welcome to Lamiani — a space born out of love for Georgian wine and the people behind it. We work directly with wineries, from tiny family cellars tucked away in the valleys of Kakheti to larger estates.",
    p2: "Georgia isn't just another wine country. It's the birthplace of winemaking — 8,000 years in the making, with qvevris buried in clay and stories fermented into every bottle.",
    quote: '"Every good wine starts with a good story. Our mission is to make sure those stories are heard across the globe."',
    stats: [{ l: "History", v: "8000 yrs" }, { l: "Wineries", v: "50+" }, { l: "Tradition", v: "Qvevri" }, { l: "Quality", v: "Premium" }],
    cta: "Ready to explore our cellar?",
    btn: "View Collections"
  },
  RU: {
    seoTitle: "О нас | Lamiani Winery",
    badge: "Наша история",
    title: "Корни в <span class='italic'>Наследии</span>",
    p1: "Добро пожаловать в Ламиани — пространство, рожденное любовью к грузинскому вину и людям, стоящим за ним. Мы работаем напрямую с винодельнями, от крошечных семейных погребов до крупных поместий.",
    p2: "Грузия — это не просто еще одна винная страна. Это родина виноделия с 8000-летней историей, квеври, зарытыми в глину, и историями, бродящими в каждой бутылке.",
    quote: '"Каждое хорошее вино начинается с хорошей истории. Наша миссия — сделать так, чтобы эти истории были услышаны во всем мире."',
    stats: [{ l: "История", v: "8000 лет" }, { l: "Винодельни", v: "50+" }, { l: "Традиции", v: "Квеври" }, { l: "Качество", v: "Премиум" }],
    cta: "Готовы изучить наш погреб?",
    btn: "Посмотреть коллекции"
  }
};

export default function AboutUs() {
  const { lang } = useLanguage();
  const t = translations[lang];

  return (
    <div className="min-h-screen bg-white font-serif">
      {/* აქ ჩაჯდა SeoManager, რომელიც Title-საც მიხედავს და Hreflang-საც */}
      <SeoManager
        title={t.seoTitle} 
        description={t.p1} 
      />
      
      <section className="relative pt-32 pb-20 px-6 max-w-[1200px] mx-auto overflow-hidden">
        <div className="flex flex-col items-center mb-16">
          <span className="text-[10px] uppercase tracking-[0.5em] text-[#5b1f1f] font-bold mb-4 animate-fadeIn">{t.badge}</span>
          <h1 className="text-5xl md:text-7xl font-light text-[#1a1a1a] tracking-tighter text-center" dangerouslySetInnerHTML={{ __html: t.title }}></h1>
          <div className="w-12 h-[1px] bg-[#5b1f1f]/30 mt-8"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="relative group overflow-hidden rounded-sm animate-fadeInLeft">
             <div className="absolute inset-0 bg-[#5b1f1f]/5 group-hover:bg-transparent transition-colors duration-700 z-10"></div>
             <img src="https://cdn.pixabay.com/photo/2019/08/13/09/37/village-4402925_640.png" alt="Vineyard" className="w-full h-[500px] object-cover transition-transform duration-[2s] group-hover:scale-105" />
          </div>

          <div className="space-y-8 text-gray-600 leading-relaxed text-lg animate-fadeInRight">
            <p className="first-letter:text-5xl first-letter:text-[#5b1f1f] first-letter:font-bold first-letter:mr-3 first-letter:float-left">{t.p1}</p>
            <p>{t.p2}</p>
            <p className="italic font-light border-l-2 border-[#5b1f1f]/20 pl-6 py-2">{t.quote}</p>
          </div>
        </div>
      </section>

      {/* დანარჩენი სექციები უცვლელია */}
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-[1000px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          {t.stats.map((stat, i) => (
            <div key={i} className="flex flex-col gap-2">
              <span className="text-[#5b1f1f] text-2xl font-light italic">{stat.v}</span>
              <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">{stat.l}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="py-32 text-center px-6">
          <h3 className="text-3xl font-light text-[#1a1a1a] mb-8">{t.cta}</h3>
         <Link 
  to="/wines" 
  className="px-12 py-4 border border-[#5b1f1f] text-[#5b1f1f] uppercase text-[11px] tracking-[0.3em] font-bold hover:bg-[#5b1f1f] hover:text-white transition-all duration-500 inline-block text-center"
>
  {t.btn}
</Link>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeInRight { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
        .animate-fadeIn { animation: fadeIn 1.5s ease-out forwards; }
        .animate-fadeInLeft { animation: fadeInLeft 1.2s ease-out forwards; }
        .animate-fadeInRight { animation: fadeInRight 1.2s ease-out forwards; }
      `}} />
    </div>
  );
}