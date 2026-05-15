
// // უცნაური ჰედერი
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { Sun, Moon } from "lucide-react";
import { db } from "../firebase";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";

const translations = {
  GE: { search: "ძიება (დასახელება, ტიპი...)", nav: ["ჩვენს შესახებ", "ღვინოები", "პარტნიორები", "კონტაქტი"], mobileLang: "ენა", home: "მთავარი", darkMode: "მუქი რეჟიმი", lightMode: "ღია რეჟიმი" },
  EN: { search: "Search (name, type...)", nav: ["About", "Wines", "Partners", "Contact"], mobileLang: "Language", home: "Home", darkMode: "Dark mode", lightMode: "Light mode" },
  RU: { search: "Поиск (имя, тип...)", nav: ["О нас", "Вина", "Партнеры", "Контакт"], mobileLang: "Язык", home: "Главная", darkMode: "Тёмный режим", lightMode: "Светлый режим" }
};

function Header() {
  const { lang, setLang } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const t = translations[lang];
  const isDark = theme === "dark";
  const isGE = lang === "GE";
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isPressed, setIsPressed] = useState(false); // ახალი სტეიტი თითის დაჭერისთვის

  const debounceRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setSearch("");
    setResults([]);
  }, [location.pathname]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [winesSnap, discountSnap, partnersSnap] = await Promise.all([
          getDocs(collection(db, "popularWines")),
          getDocs(collection(db, "discountedWines")),
          getDocs(collection(db, "partners"))
        ]);

        const wines = winesSnap.docs.map(doc => ({ id: doc.id, category: "wine", ...doc.data() }));
        const discounted = discountSnap.docs.map(doc => ({ id: doc.id, category: "discounted", ...doc.data() }));
        const partners = partnersSnap.docs.map(doc => ({ id: doc.id, category: "partner", ...doc.data() }));

        setAllItems([...wines, ...discounted, ...partners]);
      } catch (error) { console.error("Error fetching data:", error); }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      if (!value.trim()) return setResults([]);

      const filtered = allItems.filter(item => {
        const name = (item[`name_${lang.toLowerCase()}`] || item.name || "").toLowerCase();
        const type = (item[`type_${lang.toLowerCase()}`] || item.type || "").toLowerCase();
        const searchTerm = value.toLowerCase();

        return name.includes(searchTerm) || type.includes(searchTerm);
      });
      setResults(filtered);
    }, 300);
  };

  const handleNavigate = (item) => {
    setIsOpen(false);
    setSearch("");
    setResults([]);
    navigate(`/${item.category}/${item.id}`);
  };

  // ჰედერი ხდება "თეთრი" თუ: დასქროლილია, მენიუ ღიაა, ან თითი აქვს დაჭერილი (Mobile)
  const isLight = isScrolled || isOpen || isPressed;
  const burgerLineColor = `${isLight ? "bg-black" : "bg-white group-hover:bg-black"} dark:!bg-white`;

  return (
    <header
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      className={`fixed top-0 w-full z-[200] transition-all duration-500 group ${
        isLight
          ? "bg-white/95 dark:bg-[#0B0E14]/75 backdrop-blur-xl border-b border-gray-100 dark:border-[#B89968]/10 h-20 shadow-sm dark:shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
          : "bg-transparent border-b border-transparent h-24 lg:hover:bg-white dark:lg:hover:bg-[#0B0E14]/85 lg:hover:h-20 lg:hover:border-gray-100 dark:lg:hover:border-[#B89968]/10 lg:hover:shadow-sm lg:hover:backdrop-blur-xl"
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 h-full flex items-center justify-between relative z-[210]">

        {/* LOGO */}
        <div className="shrink-0">
          <Link to="/" className={`text-2xl font-serif font-bold tracking-tighter transition-colors duration-500 ${
            isLight
              ? "text-[#1a1a1a] dark:text-[#D9D2C6]"
              : "text-white group-hover:text-[#1a1a1a] dark:group-hover:text-[#D9D2C6]"
          }`}>
            LAMIANI<span className={isLight
              ? "text-[#5b1f1f] dark:text-[#A04848] dark:[text-shadow:0_0_14px_rgba(160,72,72,0.5)]"
              : "text-white/50 group-hover:text-[#5b1f1f] dark:group-hover:text-[#A04848]"}>.</span>
          </Link>
        </div>

        {/* DESKTOP SEARCH */}
        <div className="hidden lg:block flex-1 min-w-[180px] max-w-[260px] xl:max-w-xs 2xl:max-w-sm relative mx-4 xl:mx-6 2xl:mx-10">
          <div className={`flex items-center rounded-full px-4 py-2 transition-all border ${
            isScrolled
              ? "bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10 focus-within:bg-white dark:focus-within:bg-white/10 focus-within:border-[#5b1f1f]/30"
              : "bg-white/10 border-white/20 group-hover:bg-gray-50 dark:group-hover:bg-white/5 group-hover:border-gray-100 dark:group-hover:border-white/10 focus-within:bg-white dark:focus-within:bg-white/10"
          }`}>
            <span className={`transition-colors duration-500 ${isScrolled ? "text-gray-400 dark:text-gray-500" : "text-white/70 group-hover:text-gray-400 dark:group-hover:text-gray-500"}`}>⌕</span>
            <input
              type="search"
              value={search}
              onChange={handleChange}
              placeholder={t.search}
              className={`bg-transparent outline-none ${isGE ? "text-[12px]" : "text-[13px]"} w-full ml-3 font-serif italic transition-colors duration-500 ${
                isScrolled
                  ? "text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  : "text-white placeholder:text-white/60 group-hover:text-gray-800 dark:group-hover:text-gray-100 group-hover:placeholder:text-gray-400 dark:group-hover:placeholder:text-gray-500"
              }`}
            />
          </div>
          {results.length > 0 && (
            <div className="absolute top-[120%] left-0 w-full bg-white dark:bg-[#181C25] shadow-2xl border border-gray-100 dark:border-white/10 rounded-xl py-2 z-[250] max-h-96 overflow-y-auto text-black dark:text-gray-100">
              {results.map(item => (
                <button key={item.id} onClick={() => handleNavigate(item)} className="w-full flex items-center gap-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 text-left">
                  <img src={item.img} alt="" className="w-10 h-10 object-contain" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{item[`name_${lang.toLowerCase()}`] || item.name}</span>
                    <span className="text-[9px] uppercase tracking-widest text-[#5b1f1f] dark:text-[#D9D2C6] font-bold">{item[`type_${lang.toLowerCase()}`] || item.category}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* DESKTOP NAV */}
        <nav className={`hidden lg:flex items-center shrink-0 ${isGE ? "gap-3 xl:gap-5 2xl:gap-7" : "gap-4 xl:gap-7 2xl:gap-10"}`}>
          <ul className={`flex items-center ${isGE ? "gap-3 xl:gap-5 2xl:gap-7" : "gap-4 xl:gap-7 2xl:gap-10"}`}>
            {t.nav.map((item, idx) => (
              <li key={idx}>
                <Link to={`/${["about", "wines", "partners", "contact"][idx]}`} className={`${isGE ? "text-[11px] xl:text-[12px] tracking-[0.05em] xl:tracking-[0.08em]" : "text-[10px] xl:text-[11px] uppercase tracking-[0.18em] xl:tracking-[0.25em]"} font-bold whitespace-nowrap transition-all duration-500 ${
                  isScrolled
                    ? "text-gray-500 dark:text-gray-400 hover:text-[#5b1f1f] dark:hover:text-[#D9D2C6]"
                    : "text-white/80 group-hover:text-gray-500 dark:group-hover:text-gray-400 hover:!text-[#5b1f1f] dark:hover:!text-[#D9D2C6]"
                }`}>
                  {item}
                </Link>
              </li>
            ))}
          </ul>
          <div className={`flex items-center gap-2 xl:gap-3 ml-2 xl:ml-4 border-l pl-3 xl:pl-6 transition-colors duration-500 ${isScrolled ? "border-gray-100 dark:border-white/10" : "border-white/20 group-hover:border-gray-100 dark:group-hover:border-white/10"}`}>
            {["GE", "EN", "RU"].map((l) => (
              <button key={l} onClick={() => setLang(l)} className={`text-[10px] font-bold transition-all duration-500 ${
                lang === l
                  ? (isScrolled
                      ? "text-[#5b1f1f] dark:text-[#D9D2C6] scale-110"
                      : "text-white group-hover:text-[#5b1f1f] dark:group-hover:text-[#D9D2C6] scale-110")
                  : (isScrolled
                      ? "text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400"
                      : "text-white/40 group-hover:text-gray-300 dark:group-hover:text-gray-600")
              }`}>
                {l}
              </button>
            ))}
            <button
              onClick={toggleTheme}
              aria-label={isDark ? t.lightMode : t.darkMode}
              title={isDark ? t.lightMode : t.darkMode}
              className={`ml-2 p-1.5 rounded-full transition-all duration-500 ${
                isScrolled
                  ? "text-[#5b1f1f] dark:text-[#D9D2C6] hover:bg-gray-100 dark:hover:bg-white/10"
                  : "text-white group-hover:text-[#5b1f1f] dark:group-hover:text-[#D9D2C6] hover:bg-white/10 dark:group-hover:hover:bg-white/10"
              }`}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </nav>

        {/* MOBILE BURGER + THEME TOGGLE */}
        <div className="flex items-center gap-1 lg:hidden">
          <button
            onClick={toggleTheme}
            aria-label={isDark ? t.lightMode : t.darkMode}
            className={`p-2 rounded-full transition-colors ${
              isLight
                ? "text-[#5b1f1f] dark:text-[#D9D2C6]"
                : "text-white group-hover:text-[#5b1f1f] dark:group-hover:text-[#D9D2C6]"
            }`}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={() => setIsOpen(!isOpen)} className="p-2 flex flex-col gap-1.5 z-[210]">
            <div className={`w-6 h-0.5 transition-all duration-300 ${isOpen ? "rotate-45 translate-y-2" : ""} ${burgerLineColor}`}></div>
            <div className={`w-6 h-0.5 transition-all duration-300 ${isOpen ? "opacity-0" : ""} ${burgerLineColor}`}></div>
            <div className={`w-6 h-0.5 transition-all duration-300 ${isOpen ? "-rotate-45 -translate-y-2" : ""} ${burgerLineColor}`}></div>
          </button>
        </div>
      </div>

      {/* --- MOBILE / TABLET MENU (glassmorphism via portal, escapes header stacking context) --- */}
      {createPortal(
      <div
        className={`fixed inset-0 top-20 z-[190] lg:hidden transition-opacity duration-500 ease-in-out ${
          isOpen ? "opacity-100 visible pointer-events-auto" : "opacity-0 invisible pointer-events-none"
        }`}
      >
        {/* GLASS LAYER — NO transform on ancestor so backdrop-filter sees page content */}
        <div
          aria-hidden="true"
          className="absolute inset-0 border-t border-white/40 dark:border-[#B89968]/20"
          style={{
            backdropFilter: "blur(28px) saturate(180%)",
            WebkitBackdropFilter: "blur(28px) saturate(180%)",
            backgroundColor: isDark ? "rgba(11, 14, 20, 0.55)" : "rgba(255, 255, 255, 0.35)",
            boxShadow: isDark
              ? "inset 0 1px 0 rgba(184, 153, 104, 0.18), 0 16px 60px rgba(0, 0, 0, 0.4)"
              : "inset 0 1px 0 rgba(255, 255, 255, 0.55), 0 16px 60px rgba(0, 0, 0, 0.08)",
          }}
        ></div>
        {/* Refraction highlight + ambient color wash */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background: isDark
              ? "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(184,153,104,0.14), transparent 60%), radial-gradient(ellipse 80% 50% at 50% 100%, rgba(139,0,0,0.08), transparent 70%)"
              : "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(255,255,255,0.4), transparent 60%), radial-gradient(ellipse 80% 50% at 50% 100%, rgba(91,31,31,0.05), transparent 70%)",
          }}
        ></div>
        <div className={`relative flex flex-col p-8 h-[calc(100vh-80px)] overflow-y-auto transition-transform duration-500 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
          {/* SEARCH */}
          <div className="relative mb-6">
            <div className="flex items-center bg-gray-50 dark:bg-[#181C25] border border-gray-200 dark:border-[#B89968]/20 rounded-xl px-4 py-3 text-black dark:text-[#D9D2C6] focus-within:border-gray-300 focus-within:dark:border-[#B89968]/40 transition-colors">
              <input type="search" value={search} onChange={handleChange} placeholder={t.search} className="bg-transparent outline-none text-base w-full font-serif italic placeholder:text-gray-400 dark:placeholder:text-[#888880]" />
            </div>
            {results.length > 0 && (
              <div className="absolute top-full left-0 w-full bg-white dark:bg-[#181C25] shadow-2xl border border-gray-200 dark:border-[#B89968]/20 rounded-xl mt-2 z-[210] max-h-[40vh] overflow-y-auto text-black dark:text-[#D9D2C6]">
                {results.map(item => (
                  <button key={item.id} onClick={() => handleNavigate(item)} className="w-full p-4 border-b border-gray-50 dark:border-white/5 flex items-center gap-4 text-left active:bg-gray-100 dark:active:bg-white/10">
                    <img src={item.img} alt="" className="w-12 h-12 object-contain" />
                    <div>
                      <p className="text-sm font-medium">{item[`name_${lang.toLowerCase()}`] || item.name}</p>
                      <p className="text-[9px] text-[#5b1f1f] dark:text-[#D9D2C6] uppercase tracking-tighter font-bold">{item.category}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* NAVIGATION */}
          <div className="flex-1 flex flex-col justify-center gap-8">
            <nav>
              <ul className="flex flex-col gap-5">
                {[t.home, ...t.nav].map((item, idx) => (
                  <li key={idx}>
                    <Link to={idx === 0 ? "/" : `/${["about", "wines", "partners", "contact"][idx-1]}`} onClick={() => setIsOpen(false)} className="text-3xl font-serif italic text-[#5b1f1f] dark:!text-[#5b1f1f] flex items-center justify-between transition-colors">
                      {item} <span className="text-[#5b1f1f] dark:!text-[#5b1f1f] opacity-30 text-xl">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* THEME TOGGLE ROW */}
          <div className="pt-6">
            <button
              onClick={toggleTheme}
              className="w-full py-4 rounded-xl border border-gray-200 dark:border-[#B89968]/20 bg-white dark:bg-[#181C25] text-sm font-bold flex items-center justify-center gap-3 text-[#1a1a1a] dark:text-[#D9D2C6] transition-all hover:border-gray-300 hover:dark:border-[#B89968]/40"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
              <span>{isDark ? t.lightMode : t.darkMode}</span>
            </button>
          </div>

          {/* LANGUAGES */}
          <div className="mt-4 pt-2">
            <div className="flex gap-2">
              {[{c:"GE", f:"🇬🇪"}, {c:"EN", f:"🇺🇸"}, {c:"RU", f:"🇷🇺"}].map((l) => (
                <button key={l.c} onClick={() => setLang(l.c)} className={`flex-1 py-4 rounded-xl border text-sm font-bold transition-all flex items-center justify-center gap-3 ${
                  lang === l.c
                    ? "border-[#5b1f1f] dark:border-[#B89968]/50 bg-[#5b1f1f]/5 dark:bg-[#B89968]/10 text-[#5b1f1f] dark:text-[#D9D2C6]"
                    : "border-gray-100 dark:border-[#B89968]/15 bg-white dark:bg-[#181C25] text-gray-400 dark:text-[#888880] hover:dark:border-[#B89968]/30"
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

export default Header;
