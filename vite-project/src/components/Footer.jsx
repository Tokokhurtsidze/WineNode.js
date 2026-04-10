

import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone } from 'lucide-react';
import { useLanguage } from "../context/LanguageContext";

const translations = {
  GE: {
    desc: "ქართული მემკვიდრეობის საუკეთესო ღვინოების შერჩევა. უძველესი მარნებიდან თქვენს თანამედროვე სუფრამდე.",
    navTitle: "ნავიგაცია",
    nav: ["ჩვენი ისტორია", "კოლექცია", "პარტნიორი მამულები", "კონტაქტი"],
    contactTitle: "კითხვები",
    locationTitle: "ლოკაცია",
    address: "დავით გამრეკელის ქუჩა 3, თბილისი, საქართველო",
    hours: "ორშ — კვირ: 11:00 - 23:00",
    rights: "ყველა უფლება დაცულია",
    policy: "კონფიდენციალურობა",
    terms: "წესები და პირობები"
  },
  EN: {
    desc: "Curating the finest selection of Georgian heritage wines. From ancient cellars to your contemporary table.",
    navTitle: "Navigation",
    nav: ["Our Story", "The Collection", "Partner Estates", "Get in Touch"],
    contactTitle: "Inquiries",
    locationTitle: "Location",
    address: "David Gamrekeli Street 3, Tbilisi, Georgia",
    hours: "Mon — Sun: 11:00 - 23:00",
    rights: "ALL RIGHTS RESERVED",
    policy: "Privacy Policy",
    terms: "Terms of Service"
  },
  RU: {
    desc: "Лучшие вина грузинского наследия. Из древних погребов к вашему современному столу.",
    navTitle: "Навигация",
    nav: ["Наша история", "Коллекция", "Партнеры", "Контакты"],
    contactTitle: "Вопросы",
    locationTitle: "Локация",
    address: "Ул. Давида Гамрекели 3, Тбилиси, Грузия",
    hours: "Пн — Вс: 11:00 - 23:00",
    rights: "ВСЕ ПРАВА ЗАЩИЩЕНЫ",
    policy: "Конфиденциальность",
    terms: "Условия использования"
  }
};

const Footer = () => {
  const { lang } = useLanguage();
  const t = translations[lang];

  const businessSchema = {
    "@context": "https://schema.org",
    "@type": "Winery", // WineEstablishment-ის ნაცვლად Winery უფრო სპეციფიკურია SEO-სთვის
    "name": "LAMIANI",
    "image": "https://lamiani.ge/logo.png",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "David Gamrekeli Street 3",
      "addressLocality": "Tbilisi",
      "addressCountry": "GE"
    },
    "telephone": "+995599472067",
    "email": "rklamiani@gmail.com",
    "url": "https://lamiani.ge",
    "openingHours": "Mo-Su 11:00-23:00"
  };

  return (
    <footer className="bg-[#1a1a1a] text-white pt-20 pb-10 px-6 md:px-12 border-t border-white/5 font-serif" role="contentinfo">
      <script type="application/ld+json">
        {JSON.stringify(businessSchema)}
      </script>
      
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          
          {/* BRAND SECTION */}
          <div className="space-y-6">
            <Link to="/" className="text-3xl font-bold tracking-tighter italic" aria-label="LAMIANI Home">
              LAMIANI<span className="text-[#5b1f1f]">.</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed font-sans tracking-wide max-w-xs">
              {t.desc}
            </p>
            <div className="flex gap-5 pt-2">
              <SocialLink icon={<Facebook size={18} />} href="https://facebook.com/lamiani" ariaLabel="Follow us on Facebook" />
              <SocialLink icon={<Instagram size={18} />} href="https://instagram.com/lamiani" ariaLabel="Follow us on Instagram" />
              <SocialLink icon={<Twitter size={18} />} href="#" ariaLabel="Follow us on Twitter" />
            </div>
          </div>

          {/* QUICK LINKS */}
          <div className="space-y-6">
            <h4 className="text-[10px] uppercase tracking-[0.4em] text-[#5b1f1f] font-bold">{t.navTitle}</h4>
            <nav className="flex flex-col gap-3 font-sans text-sm" aria-label="Footer Navigation">
              <FooterLink to="/about">{t.nav[0]}</FooterLink>
              <FooterLink to="/wines">{t.nav[1]}</FooterLink>
              <FooterLink to="/partners">{t.nav[2]}</FooterLink>
              <FooterLink to="/contact">{t.nav[3]}</FooterLink>
            </nav>
          </div>

          {/* CONTACT INFO */}
          <div className="space-y-6">
            <h4 className="text-[10px] uppercase tracking-[0.4em] text-[#5b1f1f] font-bold">{t.contactTitle}</h4>
            <div className="flex flex-col gap-4 font-sans text-sm text-gray-400">
              <a href="mailto:rklamiani@gmail.com" className="flex items-center gap-3 hover:text-white transition-all group" aria-label="Send us an email">
                <Mail size={14} className="text-[#5b1f1f] group-hover:scale-110 transition-transform" /> rklamiani@gmail.com
              </a>
              <a href="tel:+995599472067" className="flex items-center gap-3 hover:text-white transition-all group" aria-label="Call us">
                <Phone size={14} className="text-[#5b1f1f] group-hover:scale-110 transition-transform" /> +995 599 47 20 67
              </a>
            </div>
          </div>

          {/* LOCATION */}
          <div className="space-y-6">
            <h4 className="text-[10px] uppercase tracking-[0.4em] text-[#5b1f1f] font-bold">{t.locationTitle}</h4>
            <address className="not-italic font-sans text-sm text-gray-400 leading-relaxed">
              {t.address}
            </address>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              <p className="font-sans text-[10px] text-gray-500 italic uppercase tracking-wider">
                {t.hours}
              </p>
            </div>
          </div>
        </div>

        {/* BOTTOM LINE */}
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] tracking-[0.2em] text-gray-500 font-sans uppercase">
          <p>© 2026 LAMIANI — {t.rights}</p>
          <div className="flex gap-8">
            <Link to="/privacy" className="hover:text-white transition-colors underline-offset-4 hover:underline">{t.policy}</Link>
            <Link to="/terms" className="hover:text-white transition-colors underline-offset-4 hover:underline">{t.terms}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

// დამხმარე კომპონენტები უცვლელია, მაგრამ SocialLink-ში დამატებულია rel ატრიბუტები
const FooterLink = ({ to, children }) => (
  <Link to={to} className="text-gray-400 hover:text-white hover:translate-x-1 transition-all duration-300 inline-block underline-offset-4 hover:underline">
    {children}
  </Link>
);

const SocialLink = ({ icon, href, ariaLabel }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer" // მნიშვნელოვანია SEO და უსაფრთხოებისთვის
    aria-label={ariaLabel}
    className="w-9 h-9 border border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:bg-[#5b1f1f] hover:border-[#5b1f1f] hover:text-white transition-all duration-500 shadow-sm"
  >
    {icon}
  </a>
);

export default Footer;