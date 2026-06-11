import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useLanguage } from '../context/LanguageContext';
import SeoManager from '../Seo/SeoManager';
import { useCartStore } from '../stores/useCartStore';
import { ShoppingBag, Plus, Minus } from 'lucide-react';

interface WineData {
  id: string;
  name: string;
  img: string;
  price?: string | number;
  description?: string;
  type?: string;
  [key: string]: unknown;
}

const translations = {
  GE: { loading: 'იტვირთება...', notFound: 'ღვინო ვერ მოიძებნა', homeBtn: 'მთავარ გვერდზე დაბრუნება', aboutTitle: 'ღვინის შესახებ', home: 'მთავარი', popular: 'პოპულარული ღვინოები', addToCart: 'კალათში დამატება', added: 'დამატებულია!', volume: 'მოცულობა: 750 მლ' },
  EN: { loading: 'Loading...', notFound: 'Wine not found', homeBtn: 'Back to Home', aboutTitle: 'About the Wine', home: 'Home', popular: 'Popular Wines', addToCart: 'Add to Cart', added: 'Added!', volume: 'Volume: 750ml' },
  RU: { loading: 'Загрузка...', notFound: 'Вино не найдено', homeBtn: 'На главную', aboutTitle: 'О вине', home: 'Главная', popular: 'Популярные вина', addToCart: 'В корзину', added: 'Добавлено!', volume: 'Объём: 750 мл' },
};

export default function WineDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const t = translations[lang as keyof typeof translations] || translations.EN;
  const [wine, setWine] = useState<WineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [usdRate, setUsdRate] = useState(0.37);
  const { addItem, openCart } = useCartStore();

  useEffect(() => {
    fetch('https://open.er-api.com/v6/latest/GEL')
      .then(r => r.json())
      .then((data: { rates?: { USD?: number } }) => { if (data?.rates?.USD) setUsdRate(data.rates.USD); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const fetchWine = async () => {
      try {
        const snap = await getDoc(doc(db, 'popularWines', id!));
        if (snap.exists()) setWine({ id: snap.id, ...snap.data() } as WineData);
      } catch (e) { console.error('Error fetching wine:', e); }
      finally { setLoading(false); }
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
    const priceNum = parseFloat(String(wine.price || '0').replace(/[^0-9.]/g, ''));
    addItem({ id: wine.id, name: getLangValue('name'), price: priceNum, image: wine.img as string, collection: 'popularWines' }, qty);
    setAdded(true);
    openCart();
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-serif">{t.loading}</div>;
  if (!wine) return (
    <div className="min-h-screen flex flex-col items-center justify-center font-serif bg-white text-center px-4">
      <p className="text-xl text-[#5b1f1f] mb-4">{t.notFound}</p>
      <button onClick={() => navigate('/')} className="px-6 py-2 bg-[#5b1f1f] text-white rounded hover:bg-[#3e1414] transition">{t.homeBtn}</button>
    </div>
  );

  const displayName = getLangValue('name');
  const displayDesc = getLangValue('description');
  const displayType = getLangValue('type');
  const priceNumeric = wine.price ? String(wine.price).replace(/[^0-9.]/g, '') : null;
  const usdPrice = priceNumeric ? (parseFloat(priceNumeric) * usdRate).toFixed(2) : null;
  const priceValidUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const productSchema = {
    name: displayName, image: wine.img, description: displayDesc, sku: wine.id, mpn: wine.id,
    category: displayType || 'Wine',
    brand: { '@type': 'Brand', name: 'LAMIANI' },
    manufacturer: { '@type': 'Organization', name: 'LAMIANI' },
    countryOfOrigin: { '@type': 'Country', name: 'Georgia' },
    ...(priceNumeric && { offers: { '@type': 'Offer', price: priceNumeric, priceCurrency: 'GEL', availability: 'https://schema.org/InStock', itemCondition: 'https://schema.org/NewCondition', priceValidUntil, url: `https://lamiani.ge/wine/${wine.id}`, seller: { '@type': 'Organization', name: 'LAMIANI' } } }),
  };

  const imgSrc = typeof wine.img === 'string' && wine.img.includes('cloudinary.com')
    ? wine.img.replace('/upload/', '/upload/e_trim/w_800,h_1200,c_pad,b_transparent/') : wine.img as string;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0E14] text-[#1a1a1a] dark:text-gray-200 flex flex-col items-center py-12 px-4 sm:px-8 font-serif relative transition-colors duration-300">
      <SeoManager
        title={`${displayName} | LAMIANI Wines`}
        description={displayDesc || `${displayName} — premium Georgian wine from LAMIANI.`}
        image={wine.img as string}
        ogType="product"
        productSchema={productSchema}
        breadcrumbs={[{ name: t.home, url: '/' }, { name: t.popular, url: '/wines' }, { name: displayName, url: `/wine/${wine.id}` }]}
        keywords={`${displayName}, ${displayType || 'wine'}, Georgian wine, LAMIANI, ${wine.id}`}
      />

      <div className="max-w-[800px] w-full flex flex-col items-center mt-12">
        <div className="flex flex-col items-center text-center mb-10">
          <h1 className="text-3xl sm:text-5xl font-bold text-[#1a1a1a] uppercase tracking-tight mb-4">{displayName}</h1>
          <div className="w-12 h-[2px] bg-[#5b1f1f] mb-4" />
          {wine.price && (
            <div className="flex flex-col items-center gap-1">
              <p className="text-3xl font-bold text-[#5b1f1f]">{wine.price}</p>
              {usdPrice && <p className="text-sm text-gray-400 dark:text-[#666]">≈ ${usdPrice} USD</p>}
            </div>
          )}
        </div>

        <div className="w-full flex justify-center mb-12">
          <img src={imgSrc} alt={`${displayName} — premium Georgian wine bottle`} width="400" height="550" loading="eager" decoding="async" className="h-[450px] sm:h-[550px] w-auto object-contain transition-transform duration-700 hover:scale-105" />
        </div>

        <div className="flex items-center gap-2 mb-6 text-xs uppercase tracking-widest text-gray-400 dark:text-[#666]">
          <span className="w-4 h-px bg-gray-300 dark:bg-[#444]" />
          {t.volume}
          <span className="w-4 h-px bg-gray-300 dark:bg-[#444]" />
        </div>

        {wine.price && (
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
        )}

        <div className="w-full flex flex-col items-center text-center">
          <div className="max-w-[650px] border-t border-gray-100 pt-8">
            <h3 className="text-lg font-bold text-[#1a1a1a] mb-6 uppercase tracking-widest">{t.aboutTitle}</h3>
            <p className="text-gray-600 text-lg leading-relaxed font-light whitespace-pre-line">{displayDesc}</p>
          </div>
          <button onClick={() => navigate('/')} className="mt-12 px-10 py-3 border border-[#5b1f1f] text-[#5b1f1f] uppercase tracking-widest text-xs font-bold hover:bg-[#5b1f1f] hover:text-white transition-all duration-300">
            {t.homeBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
