
import React, { useEffect, useRef, useState } from "react";
import { Mail, Phone, MapPin, Clock } from "lucide-react"; 
import { useLanguage } from "../context/LanguageContext";
import SeoManager from "../Seo/SeoManager"; // ახალი SEO მენეჯერი

const translations = {
  GE: {
    seoTitle: "კონტაქტი | Lamiani Winery",
    seoDesc: "დაუკავშირდით Lamiani-ს. ჩვენ აქ ვართ, რათა დაგეხმაროთ შეკვეთებსა და კითხვებთან დაკავშირებით.",
    badge: "დაგვიკავშირდით",
    mainTitle: "ჩვენ სიამოვნებით <span class='italic'>მოგისმენთ</span>",
    intro: "გაქვთ შეკითხვა შეკვეთაზე, გსურთ ჩვენთან თანამშრომლობა თუ უბრალოდ დახმარება გჭირდებათ სწორი ღვინის შერჩევაში – ჩვენი გუნდი თქვენს სამსახურშია.",
    email: "მოგვწერეთ",
    call: "დაგვირეკეთ",
    visit: "გვეწვიეთ",
    hours: "სამუშაო საათები",
    address: "დავით გამრეკელის ქ. 3, თბილისი",
    time: "11:00 - 23:00 ყოველ დღე"
  },
  EN: {
    seoTitle: "Contact Us | Lamiani Winery",
    seoDesc: "Get in touch with Lamiani. We are here to help with your orders and inquiries.",
    badge: "Get in Touch",
    mainTitle: "We’d Love to <span class='italic'>Hear from You</span>",
    intro: "Whether you have a question about an order, want to work with us, or just need help picking the right vintage – our team is at your service.",
    email: "Email Us",
    call: "Call Us",
    visit: "Visit Us",
    hours: "Working Hours",
    address: "David Gamrekeli St 3, Tbilisi",
    time: "11:00 - 23:00 Every Day"
  },
  RU: {
    seoTitle: "Контакты | Lamiani Winery",
    seoDesc: "Свяжитесь с Lamiani. Мы здесь, чтобы помочь вам с вашими заказами и вопросами.",
    badge: "Связаться с нами",
    mainTitle: "Мы будем рады <span class='italic'>услышать вас</span>",
    intro: "Если у вас есть вопросы по заказу, вы хотите сотрудничать с нами или вам просто нужна помощь в выборе вина – наша команда к вашим услугам.",
    email: "Напишите нам",
    call: "Позвоните нам",
    visit: "Посетите нас",
    hours: "Рабочие часы",
    address: "ул. Давида Гамрекели 3, Тбилиси",
    time: "11:00 - 23:00 Каждый день"
  }
};

export default function ContactUs() {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);
  const { lang } = useLanguage();
  const t = translations[lang];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://lamiani.ge/#business",
    "name": "LAMIANI",
    "url": "https://lamiani.ge/contact",
    "image": "https://lamiani.ge/preview-image.jpg",
    "logo": "https://lamiani.ge/new.png",
    "telephone": "+995-599-47-20-67",
    "email": "rklamiani@gmail.com",
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "David Gamrekeli Street 3",
      "addressLocality": "Tbilisi",
      "addressCountry": "GE"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 41.6938,
      "longitude": 44.8015
    },
    "openingHoursSpecification": [{
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
      "opens": "11:00",
      "closes": "23:00"
    }],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+995-599-47-20-67",
      "contactType": "Customer Service",
      "areaServed": "GE",
      "availableLanguage": ["Georgian", "English", "Russian"]
    }
  };

  return (
    <section ref={sectionRef} className="min-h-screen pt-32 pb-24 px-6 bg-white dark:bg-[#0B0E14] text-[#1a1a1a] dark:text-gray-200 font-serif transition-colors duration-300">
      {/* ახალი SEO მენეჯერი - Title, Meta და Hreflang ავტომატიზაცია */}
      <SeoManager
        title={t.seoTitle}
        description={t.seoDesc}
        keywords="LAMIANI contact, Georgian winery contact, Tbilisi wine shop, email, phone"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Contact", url: "/contact" },
        ]}
      />
      
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>

      <div className={`max-w-[1200px] mx-auto transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
        
        {/* HEADER */}
        <div className="text-center mb-20">
          <span className="text-[10px] uppercase tracking-[0.5em] text-[#5b1f1f] font-bold mb-4 block">{t.badge}</span>
          <h2 className="text-5xl md:text-6xl font-light text-[#1a1a1a] tracking-tighter"
              dangerouslySetInnerHTML={{ __html: t.mainTitle }}>
          </h2>
          <div className="w-12 h-[1px] bg-[#5b1f1f]/30 mx-auto mt-8"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          
          {/* CONTACT INFO CARDS */}
          <div className="space-y-8">
            <p className="text-gray-500 text-lg leading-relaxed mb-10">
              {t.intro}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <ContactCard 
                icon={<Mail className="w-5 h-5" />} 
                title={t.email} 
                detail="rklamiani@gmail.com" 
                link="mailto:rklamiani@gmail.com"
              />
              <ContactCard 
                icon={<Phone className="w-5 h-5" />} 
                title={t.call} 
                detail="+995 599 47 20 67" 
                link="tel:+995599472067"
              />
              <ContactCard 
                icon={<MapPin className="w-5 h-5" />} 
                title={t.visit} 
                detail={t.address} 
              />
              <ContactCard 
                icon={<Clock className="w-5 h-5" />} 
                title={t.hours} 
                detail={t.time} 
              />
            </div>
          </div>

          {/* MAP BLOCK */}
          <div className="relative group rounded-2xl overflow-hidden shadow-2xl shadow-[#5b1f1f]/5 border border-gray-100">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2979.123456789!2d44.8016!3d41.6936!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40440cf35804791b%3A0x63346983015a9632!2sFreedom%20Square!5e0!3m2!1sen!2sge!4v1234567890"
              className="w-full h-[450px] grayscale hover:grayscale-0 transition-all duration-700"
              allowFullScreen=""
              loading="lazy"
              title="Lamiani Location"
            ></iframe>
            <div className="absolute inset-0 pointer-events-none border-[15px] border-white/10 backdrop-blur-[1px]"></div>
          </div>

        </div>
      </div>
    </section>
  );
}

function ContactCard({ icon, title, detail, link }) {
  const content = (
    <div className="p-6 bg-gray-50/50 dark:!bg-[#12151B] border border-gray-100 dark:!border-[#B89968]/15 rounded-xl hover:bg-white dark:hover:!bg-[#181C25] hover:shadow-xl hover:shadow-[#5b1f1f]/5 dark:hover:!border-[#B89968]/40 dark:hover:[box-shadow:0_12px_40px_rgba(0,0,0,0.5),0_0_0_1px_rgba(184,153,104,0.12)_inset] transition-all duration-500 group">
      <div className="text-[#5b1f1f] dark:!text-[#5b1f1f] dark:![text-shadow:none] mb-4 group-hover:scale-110 transition-transform duration-500">{icon}</div>
      <h4 className="text-[10px] uppercase tracking-widest text-gray-400 dark:!text-[#888880] font-bold mb-2">{title}</h4>
      <p className="text-[#1a1a1a] dark:!text-[#D9D2C6] font-medium break-words">{detail}</p>
    </div>
  );

  return link ? <a href={link} className="block">{content}</a> : content;
}