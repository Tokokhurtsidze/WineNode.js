import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useLanguage } from '../context/LanguageContext';

interface FullImageData {
  section: string;
  img: string;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  [key: string]: string | undefined;
}

const useFullImage = (sectionName: string): FullImageData | null => {
  const [data, setData] = useState<FullImageData | null>(null);
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'fullImages'), (snap) => {
      const found = snap.docs.find((d) => d.data().section === sectionName);
      if (found) setData(found.data() as FullImageData);
    });
    return unsub;
  }, [sectionName]);
  return data;
};

export function FullImageOne() {
  const data = useFullImage('one');
  const { lang } = useLanguage();
  if (!data) return null;
  const altText = data[`title_${lang.toLowerCase()}`] || data.title || 'Vineyard Panorama';
  return (
    <section className="relative h-[60vh] md:h-[80vh] w-full overflow-hidden border-y border-gray-100 dark:border-white/10">
      <div className="absolute inset-0 scale-110">
        <img
          src={data.img}
          alt={altText}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-[10s] ease-out hover:scale-105"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/5" />
    </section>
  );
}

export function FullImageTwo() {
  const data = useFullImage('two');
  const { lang } = useLanguage();
  if (!data) return null;
  const altText = data[`title_${lang.toLowerCase()}`] || data.title || 'Winery Atmosphere';
  return (
    <section className="relative h-[50vh] md:h-[65vh] w-full overflow-hidden flex items-center justify-center">
      <img
        src={data.img}
        alt={altText}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover grayscale-[0.2] contrast-[1.1]"
      />
      <div className="absolute inset-0 bg-black/10" />
      <div className="w-[80%] h-[1px] bg-white/30 relative z-10" />
    </section>
  );
}

export function FullImageThree() {
  const data = useFullImage('three');
  const { lang } = useLanguage();
  if (!data) return null;

  const content = {
    badge: lang === 'GE' ? 'კახური მემკვიდრეობა' : lang === 'RU' ? 'Наследие Кахетии' : 'The Heritage of Kakheti',
    title: data[`title_${lang.toLowerCase()}`] || data.title,
    subtitle: data[`subtitle_${lang.toLowerCase()}`] || data.subtitle,
    button: data[`button_${lang.toLowerCase()}`] || data.buttonText,
  };

  return (
    <section
      className="relative h-[70vh] md:h-[85vh] w-full overflow-hidden flex items-center justify-center font-serif"
      aria-labelledby="hero-title"
    >
      <div className="absolute inset-0">
        <img src={data.img} alt={content.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-[#1a1a1a]/40 backdrop-brightness-[0.85]" />
      </div>
      <div className="relative z-10 text-center px-6 max-w-4xl space-y-6">
        <span className="text-[10px] md:text-[12px] uppercase tracking-[0.6em] text-white/80 font-bold block animate-fadeIn">
          {content.badge}
        </span>
        <h2
          id="hero-title"
          className="text-4xl md:text-8xl font-light text-white tracking-tighter leading-none italic animate-fadeInUp"
        >
          {content.title}
        </h2>
        <div className="w-16 h-[1px] bg-white/40 mx-auto my-8" />
        <p className="text-white/90 text-lg md:text-xl font-sans tracking-wide leading-relaxed max-w-2xl mx-auto opacity-0 animate-fadeInUp delay-300 fill-mode-forwards">
          {content.subtitle}
        </p>
        {content.button && (
          <button
            className="mt-10 px-10 py-4 border border-white/30 text-white text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-white hover:text-black transition-all duration-500 backdrop-blur-sm"
            aria-label={content.button}
          >
            {content.button}
          </button>
        )}
      </div>
    </section>
  );
}
