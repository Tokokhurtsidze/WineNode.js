import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useLanguage } from '../context/LanguageContext';
import SeoManager from '../Seo/SeoManager';
import { useCartStore } from '../stores/useCartStore';
import { ShoppingBag, Plus, Minus } from 'lucide-react';

interface DiscountedWine {
  img: string;
  oldPrice: number;
  newPrice: number;
  discount: number;
  [key: string]: unknown;
}

const translations = {
  GE: { loading: 'იტვირთება...', notFound: 'ღვინო ვერ მოიძებნა', backBtn: 'უკან დაბრუნება', homeBtn: 'მთავარ გვერდზე დაბრუნება', addToCart: 'კალათში დამატება', added: 'დამატებულია!' },
  EN: { loading: 'Loading...', notFound: 'Wine not found', backBtn: 'Back', homeBtn: 'Back to Home', addToCart: 'Add to Cart', added: 'Added!' },
  RU: { loading: 'Загрузка...', notFound: 'Вино не найдено', backBtn: 'Назад', homeBtn: 'На главную', addToCart: 'В корзину', added: 'Добавлено!' },
};

export default function DiscountedWineDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const t = translations[lang as keyof typeof translations] || translations.EN;
  const [wine, setWine] = useState<DiscountedWine | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem, openCart } = useCartStore();

  useEffect(() => {
    const fetchWine = async () => {
      try {
        const snap = await getDoc(doc(db, 'discountedWines', id!));
        if (snap.exists()) {
          const data = snap.data();
          const oldPriceNum = Number(data.oldPrice);
          const newPriceNum = Number(data.newPrice);
          setWine({ ...data, oldPrice: oldPriceNum, newPrice: newPriceNum, discount: oldPriceNum && newPriceNum ? Math.round(((oldPriceNum - newPriceNum) / oldPriceNum) * 100) : 0 } as DiscountedWine);
        }
      } catch (e) { console.error('Error fetching wine:', e); }
      setLoading(false);
    };
    fetchWine();
  }, [id]);

  const getLangValue = (field: string): string => {
    if (!wine) return '';
    if (lang === 'EN') return (wine[field] as string) || '';
    const langField = `${field}_${lang.toLowerCase()}`;
    const val = wine[langField] as string;
    return val?.trim() ? val : ((wine[field] as string) || '');
  };

  const handleAddToCart = () => {
    if (!wine) return;
    addItem({ id: id!, name: getLangValue('name'), price: wine.newPrice, originalPrice: wine.oldPrice, image: wine.img, collection: 'discountedWines' }, qty);
    setAdded(true);
    openCart();
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[#5b1f1f] font-serif tracking-widest uppercase">{t.loading}</div>;
  if (!wine) return (
    <div className="min-h-screen flex flex-col items-center justify-center font-serif bg-white">
      <p className="text-xl mb-4 text-gray-800">{t.notFound}</p>
      <button onClick={() => navigate('/')} className="px-6 py-2 bg-[#5b1f1f] text-white rounded hover:opacity-90 transition">{t.homeBtn}</button>
    </div>
  );

  const displayName = getLangValue('name');
  const displayDesc = getLangValue('description');
  const displayType = getLangValue('type');
  const priceValidUntil = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const productSchema = {
    name: displayName, image: wine.img, description: displayDesc, sku: id, mpn: id,
    category: displayType || 'Wine',
    brand: { '@type': 'Brand', name: 'LAMIANI' },
    countryOfOrigin: { '@type': 'Country', name: 'Georgia' },
    offers: {
      '@type': 'Offer', price: String(wine.newPrice), priceCurrency: 'GEL',
      availability: 'https://schema.org/InStock', itemCondition: 'https://schema.org/NewCondition',
      priceValidUntil, url: `https://lamiani.ge/discounted/${id}`,
      seller: { '@type': 'Organization', name: 'LAMIANI' },
      ...(wine.oldPrice && { priceSpecification: { '@type': 'UnitPriceSpecification', priceType: 'https://schema.org/ListPrice', price: String(wine.oldPrice), priceCurrency: 'GEL' } }),
    },
  };

  const imgSrc = wine.img?.includes('cloudinary.com')
    ? wine.img.replace('/upload/', '/upload/e_trim/w_800,h_1200,c_pad,b_transparent/') : wine.img;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0E14] text-[#1a1a1a] dark:text-gray-200 flex flex-col items-center py-12 px-4 sm:px-8 font-serif relative transition-colors duration-300">
      <SeoManager
        title={`${displayName} — ${wine.discount}% OFF | LAMIANI Wines`}
        description={displayDesc || `${displayName} on sale at LAMIANI — ${wine.discount}% off premium Georgian wine.`}
        image={wine.img}
        ogType="product"
        productSchema={productSchema}
        breadcrumbs={[{ name: 'Home', url: '/' }, { name: 'Wines', url: '/wines' }, { name: displayName, url: `/discounted/${id}` }]}
        keywords={`${displayName}, discount, sale, ${displayType || 'wine'}, Georgian wine, LAMIANI`}
      />

      <div className="max-w-[800px] w-full flex flex-col items-center mt-12">
        <div className="flex flex-col items-center text-center mb-10">
          <p className="text-[#5b1f1f] uppercase tracking-[0.3em] text-xs mb-3 font-semibold">{displayType}</p>
          <h1 className="text-3xl sm:text-5xl font-bold text-[#1a1a1a] uppercase tracking-tight mb-4">{displayName}</h1>
          <div className="w-12 h-[2px] bg-[#5b1f1f]" />
        </div>

        <div className="w-full flex justify-center mb-12">
          <img src={imgSrc} alt={`${displayName} — ${wine.discount}% off premium Georgian wine`} width="400" height="550" loading="eager" decoding="async" className="h-[450px] sm:h-[550px] w-auto object-contain" />
        </div>

        <div className="w-full flex flex-col items-center text-center">
          <div className="flex items-center justify-center gap-5 mb-8">
            <div className="flex flex-col items-end">
              <span className="text-gray-400 line-through text-sm">{wine.oldPrice} ₾</span>
              <span className="text-4xl font-bold text-[#5b1f1f]">{wine.newPrice} ₾</span>
            </div>
            {wine.discount > 0 && <span className="bg-[#5b1f1f] text-white px-3 py-1 text-sm font-bold rounded">-{wine.discount}%</span>}
          </div>

          <div className="flex items-center gap-4 mb-10">
            <div className="flex items-center border border-[#5b1f1f]/30 rounded">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 hover:bg-[#5b1f1f]/5 transition-colors"><Minus size={14} /></button>
              <span className="px-4 py-2 text-sm font-medium min-w-[2.5rem] text-center">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="px-3 py-2 hover:bg-[#5b1f1f]/5 transition-colors"><Plus size={14} /></button>
            </div>
            <button
              onClick={handleAddToCart}
              className={`flex items-center gap-2 px-8 py-3 text-[11px] uppercase tracking-[0.2em] font-bold transition-all duration-300 ${added ? 'bg-green-700 text-white border border-green-700' : 'bg-[#5b1f1f] text-white hover:bg-[#7a2a2a]'}`}
            >
              <ShoppingBag size={14} />
              {added ? t.added : t.addToCart}
            </button>
          </div>

          <div className="max-w-[650px] border-t border-gray-100 pt-8">
            <p className="text-gray-600 text-lg leading-relaxed font-light whitespace-pre-line">{displayDesc}</p>
          </div>

          <button onClick={() => navigate(-1)} className="mt-12 px-10 py-3 border border-[#5b1f1f] text-[#5b1f1f] uppercase tracking-widest text-xs font-bold hover:bg-[#5b1f1f] hover:text-white transition-all duration-300">
            {t.backBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
