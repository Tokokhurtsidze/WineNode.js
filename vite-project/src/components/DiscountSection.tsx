import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { Navigation, Pagination, Virtual } from 'swiper/modules';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { Minus, Plus, ShoppingBag, Check } from 'lucide-react';
import { db } from '../firebase';
import { useLanguage } from '../context/LanguageContext';
import { useCartStore } from '../stores/useCartStore';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface DiscountedWine {
  id: string;
  name?: string;
  name_ge?: string;
  name_en?: string;
  name_ru?: string;
  type?: string;
  type_ge?: string;
  type_en?: string;
  type_ru?: string;
  oldPrice?: number | string;
  newPrice?: number | string;
  img?: string;
  stock?: number;
}

const translations = {
  GE: { badge: 'სპეციალური შეთავაზებები', title: "ფასდაკლებული <span class='italic'>ღვინოები</span>", off: 'აკლდება' },
  EN: { badge: 'Special Offers', title: "Discounted <span class='italic'>Wines</span>", off: 'OFF' },
  RU: { badge: 'Спецпредложения', title: "Вина со <span class='italic'>скидкой</span>", off: 'СКИДКА' },
} as const;

function WineCard({ slide, lang }: { slide: DiscountedWine; lang: string }) {
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const t = translations[lang as keyof typeof translations];

  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const oldPrice = Number(slide.oldPrice ?? 0);
  const newPrice = Number(slide.newPrice ?? 0);
  const discount = oldPrice && newPrice ? Math.round(((oldPrice - newPrice) / oldPrice) * 100) : 0;

  const langKey = lang.toLowerCase() as 'ge' | 'en' | 'ru';
  const displayName = (slide[`name_${langKey}` as keyof DiscountedWine] as string) || slide.name || '';
  const displayType = (slide[`type_${langKey}` as keyof DiscountedWine] as string) || slide.type || 'Wine';

  const imgSrc = slide.img
    ? slide.img.includes('cloudinary.com')
      ? slide.img.replace('/upload/', '/upload/e_trim/w_600,h_900,c_pad,b_transparent/')
      : slide.img
    : '';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({
      id: slide.id,
      name: displayName,
      price: newPrice || oldPrice,
      originalPrice: oldPrice || undefined,
      image: slide.img || '',
      collection: 'discountedWines',
    }, qty);
    setAdded(true);
    openCart();
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <article className="group flex flex-col w-full h-[460px] min-[440px]:h-[480px] sm:h-[520px] md:h-[540px] bg-white dark:bg-[#0F1117] border border-transparent dark:border-[#B89968]/5 hover:border-[#5b1f1f]/10 dark:hover:border-[#B89968]/15 transition-all duration-500">
      {/* Image area */}
      <div
        onClick={() => navigate(`/discounted/${slide.id}`)}
        className="relative w-full h-[240px] min-[440px]:h-[260px] sm:h-[300px] bg-[#f9f9f9] dark:bg-[#181C25] flex items-center justify-center p-4 sm:p-6 overflow-hidden cursor-pointer"
      >
        {discount > 0 && (
          <div className="absolute top-4 left-4 bg-[#5b1f1f] text-white text-[10px] font-bold px-2 py-1 uppercase z-10">
            {discount}% {t.off}
          </div>
        )}
        {imgSrc && (
          <img
            src={imgSrc}
            alt={displayName}
            loading="lazy"
            className="h-full w-full object-contain transition-transform duration-1000 group-hover:scale-105"
          />
        )}
      </div>

      {/* Info area */}
      <div className="flex-1 flex flex-col px-4 py-4">
        <p className="text-[10px] text-gray-400 dark:text-[#555] uppercase tracking-widest mb-1.5">{displayType}</p>
        <h3
          onClick={() => navigate(`/discounted/${slide.id}`)}
          className="text-[#1a1a1a] dark:text-[#D9D2C6] text-sm font-medium leading-tight mb-3 line-clamp-2 cursor-pointer hover:text-[#5b1f1f] dark:hover:text-[#B89968] transition-colors"
        >
          {displayName}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-[#5b1f1f] dark:text-[#A04848] font-bold text-base">{newPrice} ₾</span>
          {oldPrice > 0 && <span className="text-gray-400 dark:text-[#444] line-through text-xs italic">{oldPrice} ₾</span>}
        </div>

        {/* Quantity + Add to cart */}
        <div className="mt-auto flex items-center gap-2">
          {/* Qty selector */}
          <div className="flex items-center border border-gray-200 dark:border-[#B89968]/20 rounded-lg overflow-hidden">
            <button
              onClick={(e) => { e.stopPropagation(); setQty((q) => Math.max(1, q - 1)); }}
              className="px-2.5 py-2 text-gray-500 dark:text-[#666] hover:text-[#5b1f1f] dark:hover:text-[#B89968] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              <Minus size={12} />
            </button>
            <span className="px-3 py-2 text-xs font-bold text-[#1a1a1a] dark:text-[#D9D2C6] min-w-[28px] text-center border-x border-gray-200 dark:border-[#B89968]/20">
              {qty}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); setQty((q) => q + 1); }}
              className="px-2.5 py-2 text-gray-500 dark:text-[#666] hover:text-[#5b1f1f] dark:hover:text-[#B89968] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              <Plus size={12} />
            </button>
          </div>

          {/* Add to cart button */}
          <button
            onClick={handleAddToCart}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all duration-300 ${
              added
                ? 'bg-emerald-500 text-white'
                : 'bg-[#5b1f1f] text-white hover:bg-[#6e2626] shadow-sm shadow-[#5b1f1f]/20'
            }`}
          >
            {added ? (
              <>
                <Check size={12} /> Added
              </>
            ) : (
              <>
                <ShoppingBag size={12} />
                {lang === 'GE' ? 'დამატება' : lang === 'RU' ? 'В корзину' : 'Add'}
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

export default function DiscountedWinesSwiper() {
  const { lang } = useLanguage();
  const t = translations[lang as keyof typeof translations];
  const [swiperRef, setSwiperRef] = useState<SwiperType | null>(null);
  const [slides, setSlides] = useState<DiscountedWine[]>([]);

  useEffect(() => {
    getDocs(collection(db, 'discountedWines'))
      .then((snap) => {
        setSlides(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as DiscountedWine)));
      })
      .catch(console.error);
  }, []);

  return (
    <section className="w-full px-4 max-w-[1250px] mx-auto relative my-28 font-serif">
      <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-6">
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <span className="text-[#5b1f1f] text-xs uppercase tracking-[0.4em] mb-2 font-semibold opacity-80">{t.badge}</span>
          <h2
            className="text-3xl md:text-4xl font-light text-[#1a1a1a] dark:text-[#D9D2C6] uppercase tracking-wider"
            dangerouslySetInnerHTML={{ __html: t.title }}
          />
          <div className="w-16 h-[1px] bg-[#5b1f1f]/30 mt-4" />
        </div>
        <div className="flex gap-4">
          <button
            aria-label="Previous slide"
            onClick={() => swiperRef?.slidePrev()}
            className="w-12 h-12 flex items-center justify-center border border-gray-200 dark:border-[#B89968]/20 rounded-full hover:border-[#5b1f1f] dark:hover:border-[#B89968]/50 transition-all bg-white dark:bg-[#12151D] text-gray-600 dark:text-gray-400"
          >
            ←
          </button>
          <button
            aria-label="Next slide"
            onClick={() => swiperRef?.slideNext()}
            className="w-12 h-12 flex items-center justify-center border border-gray-200 dark:border-[#B89968]/20 rounded-full hover:border-[#5b1f1f] dark:hover:border-[#B89968]/50 transition-all bg-white dark:bg-[#12151D] text-gray-600 dark:text-gray-400"
          >
            →
          </button>
        </div>
      </div>

      <Swiper
        modules={[Virtual, Navigation, Pagination]}
        onSwiper={setSwiperRef}
        spaceBetween={25}
        virtual
        breakpoints={{
          0:    { slidesPerView: 1.2, spaceBetween: 14 },
          380:  { slidesPerView: 1.4, spaceBetween: 14 },
          440:  { slidesPerView: 1.6, spaceBetween: 16 },
          520:  { slidesPerView: 1.9, spaceBetween: 18 },
          600:  { slidesPerView: 2.1, spaceBetween: 18 },
          640:  { slidesPerView: 2.2, spaceBetween: 20 },
          1024: { slidesPerView: 3,   spaceBetween: 25 },
          1280: { slidesPerView: 4,   spaceBetween: 25 },
        }}
        className="pb-12"
      >
        {slides.map((slide, i) => (
          <SwiperSlide key={slide.id} virtualIndex={i}>
            <WineCard slide={slide} lang={lang} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
