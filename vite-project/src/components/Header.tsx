import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { Sun, Moon, User, LogOut, ShoppingBag } from 'lucide-react';
import { db } from '../firebase';
import { useLanguage, type Lang } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useCartStore } from '../stores/useCartStore';

interface SearchItem {
  id: string;
  category: string;
  img?: string;
  name?: string;
  name_ge?: string;
  name_en?: string;
  name_ru?: string;
  type?: string;
  type_ge?: string;
  type_en?: string;
  type_ru?: string;
}

const translations = {
  GE: {
    search: 'ძიება...',
    nav: ['ჩვენს შესახებ', 'ღვინოები', 'პარტნიორები', 'კონტაქტი'],
    navDesktop: ['ჩვენს შესახებ', 'ღვინოები', 'პარტნიორები', 'კონტაქტი'],
    mobileLang: 'ენა',
    home: 'მთავარი',
    darkMode: 'მუქი რეჟიმი',
    lightMode: 'ღია რეჟიმი',
    login: 'შესვლა',
    myAccount: 'ჩემი ანგარიში',
    logout: 'გამოსვლა',
  },
  EN: {
    search: 'Search (name, type...)',
    nav: ['About', 'Wines', 'Partners', 'Contact'],
    navDesktop: ['About', 'Wines', 'Partners', 'Contact'],
    mobileLang: 'Language',
    home: 'Home',
    darkMode: 'Dark mode',
    lightMode: 'Light mode',
    login: 'Login',
    myAccount: 'My Account',
    logout: 'Logout',
  },
  RU: {
    search: 'Поиск (имя, тип...)',
    nav: ['О нас', 'Вина', 'Партнеры', 'Контакт'],
    navDesktop: ['О нас', 'Вина', 'Партнеры', 'Контакт'],
    mobileLang: 'Язык',
    home: 'Главная',
    darkMode: 'Тёмный режим',
    lightMode: 'Светлый режим',
    login: 'Войти',
    myAccount: 'Мой аккаунт',
    logout: 'Выйти',
  },
} as const;

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
  return dp[m][n];
}

function fuzzyMatch(text: string, query: string): boolean {
  if (!query) return false;
  if (text.includes(query)) return true;
  if (query.length < 3) return false;
  const maxErrors = query.length <= 5 ? 1 : 2;
  for (let i = 0; i <= text.length - query.length + maxErrors; i++) {
    if (levenshtein(text.slice(i, i + query.length), query) <= maxErrors) return true;
  }
  return false;
}

export default function Header() {
  const { lang, setLang } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const t = translations[lang as Lang];
  const isDark = theme === 'dark';
  const isGE = lang === 'GE';

  const { items: cartItems, openCart } = useCartStore();
  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  const [isOpen, setIsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<SearchItem[]>([]);
  const [allItems, setAllItems] = useState<SearchItem[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setSearch('');
    setResults([]);
    setAccountOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [winesSnap, discountSnap, partnersSnap] = await Promise.all([
          getDocs(collection(db, 'popularWines')),
          getDocs(collection(db, 'discountedWines')),
          getDocs(collection(db, 'partners')),
        ]);
        const wines = winesSnap.docs.map((doc) => ({ id: doc.id, category: 'wine', ...doc.data() } as SearchItem));
        const discounted = discountSnap.docs.map((doc) => ({ id: doc.id, category: 'discounted', ...doc.data() } as SearchItem));
        const partners = partnersSnap.docs.map((doc) => ({ id: doc.id, category: 'partner', ...doc.data() } as SearchItem));
        setAllItems([...wines, ...discounted, ...partners]);
      } catch (err) {
        console.error('Error fetching search data:', err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (!value.trim()) return setResults([]);
      const lv = value.toLowerCase();
      const langKey = lang.toLowerCase() as 'ge' | 'en' | 'ru';
      const filtered = allItems.filter((item) => {
        const name = (item[`name_${langKey}` as keyof SearchItem] as string || item.name || '').toLowerCase();
        const type = (item[`type_${langKey}` as keyof SearchItem] as string || item.type || '').toLowerCase();
        return fuzzyMatch(name, lv) || fuzzyMatch(type, lv);
      });
      setResults(filtered);
    }, 300);
  };

  const handleNavigate = (item: SearchItem) => {
    setIsOpen(false);
    setSearch('');
    setResults([]);
    navigate(`/${item.category}/${item.id}`);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isLight = isScrolled || isOpen || isPressed;
  const burgerLineColor = `${isLight ? 'bg-black' : 'bg-white group-hover:bg-black'} dark:!bg-white`;

  const searchResultName = (item: SearchItem) => {
    const langKey = lang.toLowerCase() as 'ge' | 'en' | 'ru';
    return (item[`name_${langKey}` as keyof SearchItem] as string) || item.name || '';
  };

  return (
    <header
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      className={`fixed top-0 w-full z-[200] transition-all duration-500 group ${
        isLight
          ? 'bg-white/95 dark:bg-[#0B0E14]/75 backdrop-blur-xl border-b border-gray-100 dark:border-[#B89968]/10 h-20 shadow-sm dark:shadow-[0_8px_24px_rgba(0,0,0,0.5)]'
          : 'bg-transparent border-b border-transparent h-24 lg:hover:bg-white dark:lg:hover:bg-[#0B0E14]/85 lg:hover:h-20 lg:hover:border-gray-100 dark:lg:hover:border-[#B89968]/10 lg:hover:shadow-sm lg:hover:backdrop-blur-xl'
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 h-full flex items-center justify-between relative z-[210]">

        {/* LOGO */}
        <div className="shrink-0">
          <Link to="/" className={`text-2xl font-serif font-bold tracking-tighter transition-colors duration-500 ${
            isLight ? 'text-[#1a1a1a] dark:text-[#D9D2C6]' : 'text-white group-hover:text-[#1a1a1a] dark:group-hover:text-[#D9D2C6]'
          }`}>
            LAMIANI<span className={isLight
              ? 'text-[#5b1f1f] dark:text-[#A04848] dark:[text-shadow:0_0_14px_rgba(160,72,72,0.5)]'
              : 'text-white/50 group-hover:text-[#5b1f1f] dark:group-hover:text-[#A04848]'}>.</span>
          </Link>
        </div>

        {/* DESKTOP SEARCH */}
        <div className="hidden lg:block w-[220px] xl:w-[280px] 2xl:w-[340px] shrink-0 relative mx-3 xl:mx-6 2xl:mx-10">
          <div className={`flex items-center rounded-full px-4 py-2 transition-all border ${
            isScrolled
              ? 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10 focus-within:bg-white dark:focus-within:bg-white/10 focus-within:border-[#5b1f1f]/30'
              : 'bg-white/10 border-white/20 group-hover:bg-gray-50 dark:group-hover:bg-white/5 group-hover:border-gray-100 dark:group-hover:border-white/10 focus-within:bg-white dark:focus-within:bg-white/10'
          }`}>
            <span className={`transition-colors duration-500 ${isScrolled ? 'text-gray-400 dark:text-gray-500' : 'text-white/70 group-hover:text-gray-400 dark:group-hover:text-gray-500'}`}>⌕</span>
            <input
              type="search"
              value={search}
              onChange={handleChange}
              placeholder={t.search}
              className={`bg-transparent outline-none ${isGE ? 'text-[12px]' : 'text-[13px]'} w-full ml-3 font-serif italic transition-colors duration-500 ${
                isScrolled
                  ? 'text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500'
                  : 'text-white placeholder:text-white/60 group-hover:text-gray-800 dark:group-hover:text-gray-100 group-hover:placeholder:text-gray-400 dark:group-hover:placeholder:text-gray-500'
              }`}
            />
          </div>
          {results.length > 0 && (
            <div className="absolute top-[120%] left-0 w-full bg-white dark:bg-[#181C25] shadow-2xl border border-gray-100 dark:border-white/10 rounded-xl py-2 z-[250] max-h-96 overflow-y-auto text-black dark:text-gray-100">
              {results.map((item) => (
                <button key={item.id} onClick={() => handleNavigate(item)} className="w-full flex items-center gap-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 text-left">
                  <img src={item.img} alt="" className="w-10 h-10 object-contain" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{searchResultName(item)}</span>
                    <span className="text-[9px] uppercase tracking-widest text-[#5b1f1f] dark:text-[#D9D2C6] font-bold">{item.category}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* DESKTOP NAV */}
        <nav className={`hidden lg:flex items-center shrink-0 ${isGE ? 'gap-2 xl:gap-4 2xl:gap-7' : 'gap-4 xl:gap-7 2xl:gap-10'}`}>
          <ul className={`flex items-center ${isGE ? 'gap-2 xl:gap-4 2xl:gap-7' : 'gap-4 xl:gap-7 2xl:gap-10'}`}>
            {t.navDesktop.map((item, idx) => (
              <li key={idx}>
                <Link to={`/${['about', 'wines', 'partners', 'contact'][idx]}`} className={`${isGE ? 'text-[11px] xl:text-[12px] tracking-[0.05em] xl:tracking-[0.08em]' : 'text-[10px] xl:text-[11px] uppercase tracking-[0.18em] xl:tracking-[0.25em]'} font-bold whitespace-nowrap transition-all duration-500 ${
                  isScrolled
                    ? 'text-gray-500 dark:text-gray-400 hover:text-[#5b1f1f] dark:hover:text-[#D9D2C6]'
                    : 'text-white/80 group-hover:text-gray-500 dark:group-hover:text-gray-400 hover:!text-[#5b1f1f] dark:hover:!text-[#D9D2C6]'
                }`}>
                  {item}
                </Link>
              </li>
            ))}
          </ul>

          {/* Controls */}
          <div className={`flex items-center gap-2 xl:gap-3 ml-2 xl:ml-4 border-l pl-3 xl:pl-6 transition-colors duration-500 ${isScrolled ? 'border-gray-100 dark:border-white/10' : 'border-white/20 group-hover:border-gray-100 dark:group-hover:border-white/10'}`}>
            <button
              onClick={() => {
                const cycle: Lang[] = ['GE', 'EN', 'RU'];
                setLang(cycle[(cycle.indexOf(lang as Lang) + 1) % 3]);
              }}
              title="Change language"
              className={`text-[10px] font-bold tracking-widest transition-all duration-300 px-2 py-0.5 rounded border ${
                isScrolled
                  ? 'text-[#5b1f1f] dark:text-[#D9D2C6] border-[#5b1f1f]/25 dark:border-[#B89968]/25 hover:bg-[#5b1f1f]/5'
                  : 'text-white group-hover:text-[#5b1f1f] dark:group-hover:text-[#D9D2C6] border-white/30 group-hover:border-[#5b1f1f]/25 dark:group-hover:border-[#B89968]/25'
              }`}
            >
              {lang}
            </button>

            <button
              onClick={toggleTheme}
              aria-label={isDark ? t.lightMode : t.darkMode}
              className={`p-1.5 rounded-full transition-all duration-500 ${
                isScrolled
                  ? 'text-[#5b1f1f] dark:text-[#D9D2C6] hover:bg-gray-100 dark:hover:bg-white/10'
                  : 'text-white group-hover:text-[#5b1f1f] dark:group-hover:text-[#D9D2C6] hover:bg-white/10'
              }`}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Account dropdown */}
            <div ref={accountRef} className="relative">
              <button
                onClick={() => setAccountOpen((v) => !v)}
                aria-label="Account menu"
                className={`relative p-1.5 rounded-full transition-all duration-500 ${
                  isScrolled
                    ? 'text-[#5b1f1f] dark:text-[#D9D2C6] hover:bg-gray-100 dark:hover:bg-white/10'
                    : 'text-white group-hover:text-[#5b1f1f] dark:group-hover:text-[#D9D2C6] hover:bg-white/10'
                }`}
              >
                <User size={17} />
                {cartCount > 0 && (
                  <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#5b1f1f] text-white text-[9px] font-bold flex items-center justify-center leading-none transition-opacity duration-500 ${isLight ? 'opacity-100' : 'opacity-0'}`}>
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </button>

              {accountOpen && (
                <div className="absolute right-0 top-[calc(100%+10px)] w-44 bg-white dark:bg-[#181C25] border border-gray-100 dark:border-[#B89968]/15 rounded-xl shadow-2xl py-1.5 z-[300]">
                  <button
                    onClick={() => { openCart(); setAccountOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#1a1a1a] dark:text-[#D9D2C6] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <ShoppingBag size={15} className="text-[#5b1f1f] dark:text-[#B89968]" />
                    <span className="flex-1 text-left font-medium">Cart</span>
                    {cartCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-[#5b1f1f] text-white text-[10px] font-bold flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </button>
                  <div className="h-px bg-gray-100 dark:bg-[#B89968]/10 mx-3 my-1" />
                  {user ? (
                    <>
                      <Link
                        to="/profile"
                        onClick={() => setAccountOpen(false)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#1a1a1a] dark:text-[#D9D2C6] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                      >
                        <User size={15} className="text-[#5b1f1f] dark:text-[#B89968]" />
                        <span className="font-medium">{t.myAccount}</span>
                      </Link>
                      <button
                        onClick={() => { handleLogout(); setAccountOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                      >
                        <LogOut size={15} />
                        <span className="font-medium">{t.logout}</span>
                      </button>
                    </>
                  ) : (
                    <Link
                      to="/auth/login"
                      onClick={() => setAccountOpen(false)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#1a1a1a] dark:text-[#D9D2C6] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      <User size={15} className="text-[#5b1f1f] dark:text-[#B89968]" />
                      <span className="font-medium">{t.login}</span>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* MOBILE — CART + BURGER */}
        <div className="flex items-center gap-1 lg:hidden">
          <button
            onClick={openCart}
            aria-label="Open cart"
            className={`relative p-2 rounded-full transition-colors ${isLight ? 'text-[#5b1f1f] dark:text-[#D9D2C6]' : 'text-white group-hover:text-[#5b1f1f] dark:group-hover:text-[#D9D2C6]'}`}
          >
            <ShoppingBag size={18} />
            {cartCount > 0 && (
              <span className={`absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#5b1f1f] text-white text-[9px] font-bold flex items-center justify-center transition-opacity duration-500 ${isLight ? 'opacity-100' : 'opacity-0'}`}>
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </button>
          <button onClick={toggleTheme} aria-label={isDark ? t.lightMode : t.darkMode} className={`p-2 rounded-full transition-colors ${isLight ? 'text-[#5b1f1f] dark:text-[#D9D2C6]' : 'text-white group-hover:text-[#5b1f1f] dark:group-hover:text-[#D9D2C6]'}`}>
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={() => setIsOpen(!isOpen)} className="p-2 flex flex-col gap-1.5 z-[210]">
            <div className={`w-6 h-0.5 transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''} ${burgerLineColor}`} />
            <div className={`w-6 h-0.5 transition-all duration-300 ${isOpen ? 'opacity-0' : ''} ${burgerLineColor}`} />
            <div className={`w-6 h-0.5 transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''} ${burgerLineColor}`} />
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {createPortal(
        <div className={`fixed inset-0 top-20 z-[190] lg:hidden transition-opacity duration-500 ease-in-out ${isOpen ? 'opacity-100 visible pointer-events-auto' : 'opacity-0 invisible pointer-events-none'}`}>
          <div
            aria-hidden="true"
            className="absolute inset-0 border-t border-white/40 dark:border-[#B89968]/20"
            style={{
              backdropFilter: 'blur(28px) saturate(180%)',
              WebkitBackdropFilter: 'blur(28px) saturate(180%)',
              backgroundColor: isDark ? 'rgba(11, 14, 20, 0.55)' : 'rgba(255, 255, 255, 0.35)',
              boxShadow: isDark
                ? 'inset 0 1px 0 rgba(184, 153, 104, 0.18), 0 16px 60px rgba(0, 0, 0, 0.4)'
                : 'inset 0 1px 0 rgba(255, 255, 255, 0.55), 0 16px 60px rgba(0, 0, 0, 0.08)',
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background: isDark
                ? 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(184,153,104,0.14), transparent 60%)'
                : 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(255,255,255,0.4), transparent 60%)',
            }}
          />
          <div className={`relative flex flex-col p-8 h-[calc(100vh-80px)] overflow-y-auto transition-transform duration-500 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            {/* Mobile search */}
            <div className="relative mb-6">
              <div className="flex items-center bg-gray-50 dark:bg-[#181C25] border border-gray-200 dark:border-[#B89968]/20 rounded-xl px-4 py-3 text-black dark:text-[#D9D2C6]">
                <input type="search" value={search} onChange={handleChange} placeholder={t.search} className="bg-transparent outline-none text-base w-full font-serif italic placeholder:text-gray-400 dark:placeholder:text-[#888880]" />
              </div>
              {results.length > 0 && (
                <div className="absolute top-full left-0 w-full bg-white dark:bg-[#181C25] shadow-2xl border border-gray-200 dark:border-[#B89968]/20 rounded-xl mt-2 z-[210] max-h-[40vh] overflow-y-auto">
                  {results.map((item) => (
                    <button key={item.id} onClick={() => handleNavigate(item)} className="w-full p-4 border-b border-gray-50 dark:border-white/5 flex items-center gap-4 text-left">
                      <img src={item.img} alt="" className="w-12 h-12 object-contain" />
                      <div>
                        <p className="text-sm font-medium text-[#1a1a1a] dark:text-[#D9D2C6]">{searchResultName(item)}</p>
                        <p className="text-[9px] text-[#5b1f1f] uppercase tracking-tighter font-bold">{item.category}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile nav */}
            <div className="flex-1 flex flex-col justify-center gap-8">
              <nav>
                <ul className="flex flex-col gap-5">
                  {[t.home, ...t.nav].map((item, idx) => (
                    <li key={idx}>
                      <Link
                        to={idx === 0 ? '/' : `/${['about', 'wines', 'partners', 'contact'][idx - 1]}`}
                        onClick={() => setIsOpen(false)}
                        className="text-3xl font-serif italic text-[#5b1f1f] flex items-center justify-between"
                      >
                        {item} <span className="text-[#5b1f1f] opacity-30 text-xl">→</span>
                      </Link>
                    </li>
                  ))}
                  {user && (
                    <li>
                      <Link to="/profile" onClick={() => setIsOpen(false)} className="text-3xl font-serif italic text-[#5b1f1f] flex items-center justify-between">
                        {t.myAccount} <span className="text-[#5b1f1f] opacity-30 text-xl">→</span>
                      </Link>
                    </li>
                  )}
                </ul>
              </nav>
            </div>

            {/* Auth + theme row */}
            <div className="pt-6 flex flex-col gap-3">
              {user ? (
                <button
                  onClick={() => { handleLogout(); setIsOpen(false); }}
                  className="w-full py-4 rounded-xl border border-gray-200 dark:border-[#B89968]/20 bg-white dark:bg-[#181C25] text-sm font-bold flex items-center justify-center gap-3 text-red-500 transition-all"
                >
                  <LogOut size={18} />
                  {t.logout}
                </button>
              ) : (
                <Link
                  to="/auth/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full py-4 rounded-xl border border-[#5b1f1f]/30 bg-[#5b1f1f]/5 text-sm font-bold flex items-center justify-center gap-3 text-[#5b1f1f] dark:text-[#D9D2C6]"
                >
                  <User size={18} />
                  {t.login}
                </Link>
              )}
              <button
                onClick={toggleTheme}
                className="w-full py-4 rounded-xl border border-gray-200 dark:border-[#B89968]/20 bg-white dark:bg-[#181C25] text-sm font-bold flex items-center justify-center gap-3 text-[#1a1a1a] dark:text-[#D9D2C6]"
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
                {isDark ? t.lightMode : t.darkMode}
              </button>
              <div className="flex gap-2 mt-1">
                {([{ c: 'GE', f: '🇬🇪' }, { c: 'EN', f: '🇺🇸' }, { c: 'RU', f: '🇷🇺' }] as { c: Lang; f: string }[]).map((l) => (
                  <button key={l.c} onClick={() => setLang(l.c)} className={`flex-1 py-4 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                    lang === l.c
                      ? 'border-[#5b1f1f] dark:border-[#B89968]/50 bg-[#5b1f1f]/5 dark:bg-[#B89968]/10 text-[#5b1f1f] dark:text-[#D9D2C6]'
                      : 'border-gray-100 dark:border-[#B89968]/15 bg-white dark:bg-[#181C25] text-gray-400 dark:text-[#888880]'
                  }`}>
                    <span className="text-xl">{l.f}</span> {l.c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}
