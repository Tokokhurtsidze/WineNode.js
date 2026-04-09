// გაფრთხილებით
// import { useState, useEffect, useRef } from "react";
// import { Link, useNavigate, useLocation } from "react-router-dom";
// import { collection, getDocs } from "firebase/firestore";
// import { db } from "../firebase";
// import { useLanguage } from "../context/LanguageContext";

// const translations = {
//   GE: { search: "ძიება (დასახელება, ტიპი...)", nav: ["ჩვენს შესახებ", "ღვინოები", "პარტნიორები", "კონტაქტი"], mobileLang: "ენა", home: "მთავარი" },
//   EN: { search: "Search (name, type...)", nav: ["About", "Wines", "Partners", "Contact"], mobileLang: "Language", home: "Home" },
//   RU: { search: "Поиск (имя, тип...)", nav: ["О нас", "Вина", "Партнеры", "Контакт"], mobileLang: "Язык", home: "Главная" }
// };

// function Header() {
//   const { lang, setLang } = useLanguage();
//   const t = translations[lang];
//   const [isOpen, setIsOpen] = useState(false);
//   const [search, setSearch] = useState("");
//   const [results, setResults] = useState([]);
//   const [allItems, setAllItems] = useState([]);
//   const debounceRef = useRef(null);
//   const navigate = useNavigate();
//   const location = useLocation();

//   useEffect(() => {
//     setIsOpen(false);
//     setSearch("");
//     setResults([]);
//   }, [location.pathname]);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [winesSnap, discountSnap, partnersSnap] = await Promise.all([
//           getDocs(collection(db, "popularWines")),
//           getDocs(collection(db, "discountedWines")),
//           getDocs(collection(db, "partners"))
//         ]);

//         const wines = winesSnap.docs.map(doc => ({ id: doc.id, category: "wine", ...doc.data() }));
//         const discounted = discountSnap.docs.map(doc => ({ id: doc.id, category: "discounted", ...doc.data() }));
//         const partners = partnersSnap.docs.map(doc => ({ id: doc.id, category: "partner", ...doc.data() }));
        
//         setAllItems([...wines, ...discounted, ...partners]);
//       } catch (error) { console.error("Error fetching data:", error); }
//     };
//     fetchData();
//   }, []);

//   const handleChange = (e) => {
//     const value = e.target.value;
//     setSearch(value);
//     clearTimeout(debounceRef.current);
    
//     debounceRef.current = setTimeout(() => {
//       if (!value.trim()) return setResults([]);
      
//       const filtered = allItems.filter(item => {
//         const name = (item[`name_${lang.toLowerCase()}`] || item.name || "").toLowerCase();
//         const type = (item[`type_${lang.toLowerCase()}`] || item.type || "").toLowerCase();
//         const searchTerm = value.toLowerCase();
        
//         return name.includes(searchTerm) || type.includes(searchTerm);
//       });
//       setResults(filtered);
//     }, 300);
//   };

//   const handleNavigate = (item) => {
//     setIsOpen(false);
//     setSearch("");
//     setResults([]);
//     navigate(`/${item.category}/${item.id}`);
//   };

//   return (
//     <header className="fixed top-0 w-full bg-white/95 backdrop-blur-md z-[200] border-b border-gray-100" role="banner">
//       <div className="max-w-[1440px] mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
        
//         <div className="shrink-0">
//           <Link to="/" className="text-2xl font-serif font-bold tracking-tighter text-[#1a1a1a]" aria-label="Lamiani Home">
//             LAMIANI<span className="text-[#1a1a1a]">.</span>
//           </Link>
//         </div>

//         {/* DESKTOP SEARCH */}
//         <div className="hidden lg:block flex-1 max-w-md relative mx-8" role="search">
//           <div className="flex items-center bg-gray-50 border border-gray-100 rounded-full px-4 py-2 focus-within:bg-white focus-within:border-[#5b1f1f]/30 transition-all">
//             <span className="text-gray-400" aria-hidden="true">⌕</span>
//             <input 
//               type="search" 
//               value={search} 
//               onChange={handleChange} 
//               placeholder={t.search} 
//               className="bg-transparent outline-none text-[13px] w-full ml-3 font-serif italic"
//               aria-label="Search wines and partners"
//             />
//           </div>
//           {results.length > 0 && (
//             <div className="absolute top-[110%] left-0 w-full bg-white shadow-2xl border border-gray-100 rounded-xl py-2 z-[250] max-h-96 overflow-y-auto">
//               {results.map(item => (
//                 <button 
//                   key={item.id} 
//                   onClick={() => handleNavigate(item)} 
//                   className="w-full flex items-center gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors text-left"
//                 >
//                   <img 
//                     src={item.img} 
              
//                     alt={`${item[`name_${lang.toLowerCase()}`] || item.name} - ${item[`type_${lang.toLowerCase()}`] || item.category}`} 
//                     className="w-10 h-10 object-contain" 
//                     loading="lazy" 
//                   />
//                   <div className="flex flex-col">
//                     <span className="text-sm font-medium text-gray-800">{item[`name_${lang.toLowerCase()}`] || item.name}</span>
//                     <span className="text-[9px] uppercase tracking-widest text-[#5b1f1f] font-bold">
//                       {item[`type_${lang.toLowerCase()}`] || item.category}
//                     </span>
//                   </div>
//                 </button>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* DESKTOP NAV */}
//         <nav className="hidden lg:flex items-center gap-8" role="navigation" aria-label="Main Menu">
//           <ul className="flex items-center gap-8">
//             {t.nav.map((item, idx) => (
//               <li key={idx}>
//                 <Link to={`/${["about", "wines", "partners", "contact"][idx]}`} className="text-[11px] uppercase tracking-[0.25em] font-bold text-gray-500 hover:text-[#5b1f1f] transition-all">
//                   {item}
//                 </Link>
//               </li>
//             ))}
//           </ul>
//           <div className="flex gap-3 ml-4 border-l pl-6 border-gray-100">
//             {["GE", "EN", "RU"].map((l) => (
//               <button 
//                 key={l} 
//                 onClick={() => setLang(l)} 
//                 aria-label={`Switch to ${l}`}
//                 className={`text-[10px] font-bold transition-all ${lang === l ? "text-[#5b1f1f] scale-110" : "text-gray-300 hover:text-gray-500"}`}
//               >
//                 {l}
//               </button>
//             ))}
//           </div>
//         </nav>

//         {/* MOBILE BURGER */}
//         <button 
//           onClick={() => setIsOpen(!isOpen)} 
//           className="lg:hidden p-2 flex flex-col gap-1.5 z-[210]"
//           aria-expanded={isOpen}
//           aria-label="Toggle Navigation Menu"
//         >
//           <div className={`w-6 h-0.5 bg-black transition-all duration-300 ${isOpen ? "rotate-45 translate-y-2" : ""}`}></div>
//           <div className={`w-6 h-0.5 bg-black transition-all duration-300 ${isOpen ? "opacity-0" : ""}`}></div>
//           <div className={`w-6 h-0.5 bg-black transition-all duration-300 ${isOpen ? "-rotate-45 -translate-y-2" : ""}`}></div>
//         </button>
//       </div>

//       {/* MOBILE MENU */}
//       <div className={`fixed inset-0 top-20 bg-white z-[190] lg:hidden transition-transform duration-500 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`} aria-hidden={!isOpen}>
//         <div className="flex flex-col p-8 h-[calc(100vh-80px)]">
          
//           <div className="relative mb-6" role="search">
//             <p className="text-[10px] tracking-[0.4em] text-gray-400 uppercase font-bold border-b pb-2 mb-4">Search</p>
//             <div className="flex items-center bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
//               <input 
//                 type="search" 
//                 value={search} 
//                 onChange={handleChange} 
//                 placeholder={t.search} 
//                 className="bg-transparent outline-none text-base w-full font-serif italic"
//                 aria-label="Search wines mobile"
//               />
//             </div>
//             {results.length > 0 && (
//               <div className="absolute top-full left-0 w-full bg-white shadow-2xl border border-gray-100 rounded-xl mt-2 z-[210] max-h-[40vh] overflow-y-auto">
//                 {results.map(item => (
//                   <button key={item.id} onClick={() => handleNavigate(item)} className="w-full p-4 border-b border-gray-50 flex items-center gap-4 active:bg-gray-50 text-left">
//                     <img 
//                       src={item.img} 
               
//                       alt={`${item[`name_${lang.toLowerCase()}`] || item.name} - ${item[`type_${lang.toLowerCase()}`] || item.category}`} 
//                       className="w-12 h-12 object-contain" 
//                       loading="lazy" 
//                     />
//                     <div>
//                       <p className="text-sm font-medium">{item[`name_${lang.toLowerCase()}`] || item.name}</p>
//                       <p className="text-[9px] text-[#5b1f1f] uppercase tracking-tighter font-bold">{item[`type_${lang.toLowerCase()}`] || item.category}</p>
//                     </div>
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>

//           <div className="flex-1 flex flex-col justify-center gap-8">
//             <p className="text-[10px] tracking-[0.4em] text-gray-400 uppercase font-bold border-b pb-2">Navigation</p>
//             <nav>
//               <ul className="flex flex-col gap-5">
//                 {[t.home, ...t.nav].map((item, idx) => (
//                   <li key={idx}>
//                     <Link 
//                       to={idx === 0 ? "/" : `/${["about", "wines", "partners", "contact"][idx-1]}`} 
//                       className="text-3xl font-serif italic text-gray-800 flex items-center justify-between hover:text-[#5b1f1f] "
//                     >
//                       {item}
//                       <span className="text-[#5b1f1f] opacity-30 text-xl" aria-hidden="true">→</span>
//                     </Link>
//                   </li>
//                 ))}
//               </ul>
//             </nav>
//           </div>

//           <div className="mt-auto pt-8">
//             <p className="text-[10px] tracking-[0.4em] text-gray-400 uppercase font-bold border-b pb-2 mb-4 uppercase">{t.mobileLang}</p>
//             <div className="flex gap-2">
//               {[{c:"GE", f:"🇬🇪"}, {c:"EN", f:"🇺🇸"}, {c:"RU", f:"🇷🇺"}].map((l) => (
//                 <button 
//                   key={l.c} 
//                   onClick={() => setLang(l.c)} 
//                   className={`flex-1 py-4 rounded-xl border text-sm font-bold transition-all flex items-center justify-center gap-3 ${lang === l.c ? "border-[#5b1f1f] bg-[#5b1f1f]/5 text-[#5b1f1f]" : "border-gray-100 text-gray-400"}`}
//                 >
//                   <span className="text-xl" aria-hidden="true">{l.f}</span> {l.c}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// }

// export default Header;




// გაფრთხილების გარეშე
// import { useState, useEffect, useRef } from "react";
// import { Link, useNavigate, useLocation } from "react-router-dom";
// import { collection, getDocs } from "firebase/firestore";
// import { db } from "../firebase";
// import { useLanguage } from "../context/LanguageContext";

// const translations = {
//   GE: { search: "ძიება (დასახელება, ტიპი...)", nav: ["ჩვენს შესახებ", "ღვინოები", "პარტნიორები", "კონტაქტი"], mobileLang: "ენა", home: "მთავარი" },
//   EN: { search: "Search (name, type...)", nav: ["About", "Wines", "Partners", "Contact"], mobileLang: "Language", home: "Home" },
//   RU: { search: "Поиск (имя, тип...)", nav: ["О нас", "Вина", "Партнеры", "Контакт"], mobileLang: "Язык", home: "Главная" }
// };

// function Header() {
//   const { lang, setLang } = useLanguage();
//   const t = translations[lang];
//   const [isOpen, setIsOpen] = useState(false);
//   const [search, setSearch] = useState("");
//   const [results, setResults] = useState([]);
//   const [allItems, setAllItems] = useState([]);
//   const debounceRef = useRef(null);
//   const navigate = useNavigate();
//   const location = useLocation();

//   useEffect(() => {
//     setIsOpen(false);
//     setSearch("");
//     setResults([]);
//   }, [location.pathname]);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [winesSnap, discountSnap, partnersSnap] = await Promise.all([
//           getDocs(collection(db, "popularWines")),
//           getDocs(collection(db, "discountedWines")),
//           getDocs(collection(db, "partners"))
//         ]);

//         const wines = winesSnap.docs.map(doc => ({ id: doc.id, category: "wine", ...doc.data() }));
//         const discounted = discountSnap.docs.map(doc => ({ id: doc.id, category: "discounted", ...doc.data() }));
//         const partners = partnersSnap.docs.map(doc => ({ id: doc.id, category: "partner", ...doc.data() }));
        
//         setAllItems([...wines, ...discounted, ...partners]);
//       } catch (error) { console.error("Error fetching data:", error); }
//     };
//     fetchData();
//   }, []);

//   const handleChange = (e) => {
//     const value = e.target.value;
//     setSearch(value);
//     clearTimeout(debounceRef.current);
    
//     debounceRef.current = setTimeout(() => {
//       if (!value.trim()) return setResults([]);
      
//       const filtered = allItems.filter(item => {
//         const name = (item[`name_${lang.toLowerCase()}`] || item.name || "").toLowerCase();
//         const type = (item[`type_${lang.toLowerCase()}`] || item.type || "").toLowerCase();
//         const searchTerm = value.toLowerCase();
        
//         return name.includes(searchTerm) || type.includes(searchTerm);
//       });
//       setResults(filtered);
//     }, 300);
//   };

//   const handleNavigate = (item) => {
//     setIsOpen(false);
//     setSearch("");
//     setResults([]);
//     navigate(`/${item.category}/${item.id}`);
//   };

//   return (
//     <header className="fixed top-0 w-full bg-white/95 backdrop-blur-md z-[200] border-b border-gray-100">
//       <div className="max-w-[1440px] mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
        
//         <div className="shrink-0">
//           <Link to="/" className="text-2xl font-serif font-bold tracking-tighter text-[#1a1a1a]">
//             LAMIANI<span className="text-[#1a1a1a]">.</span>
//           </Link>
//         </div>

//         {/* DESKTOP SEARCH */}
//         <div className="hidden lg:block flex-1 max-w-md relative mx-8">
//           <div className="flex items-center bg-gray-50 border border-gray-100 rounded-full px-4 py-2 focus-within:bg-white focus-within:border-[#5b1f1f]/30 transition-all">
//             <span className="text-gray-400">⌕</span>
//             <input 
//               type="search" 
//               value={search} 
//               onChange={handleChange} 
//               placeholder={t.search} 
//               className="bg-transparent outline-none text-[13px] w-full ml-3 font-serif italic"
//             />
//           </div>
//           {results.length > 0 && (
//             <div className="absolute top-[110%] left-0 w-full bg-white shadow-2xl border border-gray-100 rounded-xl py-2 z-[250] max-h-96 overflow-y-auto">
//               {results.map(item => (
//                 <button key={item.id} onClick={() => handleNavigate(item)} className="w-full flex items-center gap-4 px-4 py-3 hover:bg-gray-50 text-left">
//                   <img src={item.img} alt="" className="w-10 h-10 object-contain" />
//                   <div className="flex flex-col">
//                     <span className="text-sm font-medium text-gray-800">{item[`name_${lang.toLowerCase()}`] || item.name}</span>
//                     <span className="text-[9px] uppercase tracking-widest text-[#5b1f1f] font-bold">{item[`type_${lang.toLowerCase()}`] || item.category}</span>
//                   </div>
//                 </button>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* DESKTOP NAV */}
//         <nav className="hidden lg:flex items-center gap-8">
//           <ul className="flex items-center gap-8">
//             {t.nav.map((item, idx) => (
//               <li key={idx}>
//                 <Link to={`/${["about", "wines", "partners", "contact"][idx]}`} className="text-[11px] uppercase tracking-[0.25em] font-bold text-gray-500 hover:text-[#5b1f1f] transition-all">
//                   {item}
//                 </Link>
//               </li>
//             ))}
//           </ul>
//           <div className="flex gap-3 ml-4 border-l pl-6 border-gray-100">
//             {["GE", "EN", "RU"].map((l) => (
//               <button 
//                 key={l} 
//                 onClick={() => setLang(l)} 
//                 className={`text-[10px] font-bold transition-all ${lang === l ? "text-[#5b1f1f] scale-110" : "text-gray-300 hover:text-gray-500"}`}
//               >
//                 {l}
//               </button>
//             ))}
//           </div>
//         </nav>

//         {/* MOBILE BURGER */}
//         <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-2 flex flex-col gap-1.5 z-[210]">
//           <div className={`w-6 h-0.5 bg-black transition-all duration-300 ${isOpen ? "rotate-45 translate-y-2" : ""}`}></div>
//           <div className={`w-6 h-0.5 bg-black transition-all duration-300 ${isOpen ? "opacity-0" : ""}`}></div>
//           <div className={`w-6 h-0.5 bg-black transition-all duration-300 ${isOpen ? "-rotate-45 -translate-y-2" : ""}`}></div>
//         </button>
//       </div>

//       {/* MOBILE MENU - CLEAN VERSION (NO INERT) */}
//       <div 
//         className={`fixed inset-0 top-20 bg-white z-[190] lg:hidden transition-all duration-500 ease-in-out ${
//           isOpen ? "translate-x-0 opacity-100 visible" : "translate-x-full opacity-0 invisible"
//         }`}
//       >
//         <div className="flex flex-col p-8 h-[calc(100vh-80px)] overflow-y-auto">
//           {/* SEARCH */}
//           <div className="relative mb-6">
//             <div className="flex items-center bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
//               <input 
//                 type="search" 
//                 value={search} 
//                 onChange={handleChange} 
//                 placeholder={t.search} 
//                 className="bg-transparent outline-none text-base w-full font-serif italic"
//               />
//             </div>
//             {results.length > 0 && (
//               <div className="absolute top-full left-0 w-full bg-white shadow-2xl border border-gray-100 rounded-xl mt-2 z-[210] max-h-[40vh] overflow-y-auto">
//                 {results.map(item => (
//                   <button key={item.id} onClick={() => handleNavigate(item)} className="w-full p-4 border-b border-gray-50 flex items-center gap-4 text-left">
//                     <img src={item.img} alt="" className="w-12 h-12 object-contain" />
//                     <div>
//                       <p className="text-sm font-medium">{item[`name_${lang.toLowerCase()}`] || item.name}</p>
//                       <p className="text-[9px] text-[#5b1f1f] uppercase tracking-tighter font-bold">{item[`type_${lang.toLowerCase()}`] || item.category}</p>
//                     </div>
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* NAVIGATION */}
//           <div className="flex-1 flex flex-col justify-center gap-8">
//             <nav>
//               <ul className="flex flex-col gap-5">
//                 {[t.home, ...t.nav].map((item, idx) => (
//                   <li key={idx}>
//                     <Link 
//                       to={idx === 0 ? "/" : `/${["about", "wines", "partners", "contact"][idx-1]}`} 
//                       onClick={() => setIsOpen(false)}
//                       className="text-3xl font-serif italic text-gray-800 flex items-center justify-between"
//                     >
//                       {item} <span className="text-[#5b1f1f] opacity-30 text-xl">→</span>
//                     </Link>
//                   </li>
//                 ))}
//               </ul>
//             </nav>
//           </div>

//           {/* LANGUAGES */}
//           <div className="mt-auto pt-8">
//             <div className="flex gap-2">
//               {[{c:"GE", f:"🇬🇪"}, {c:"EN", f:"🇺🇸"}, {c:"RU", f:"🇷🇺"}].map((l) => (
//                 <button 
//                   key={l.c} 
//                   onClick={() => setLang(l.c)} 
//                   className={`flex-1 py-4 rounded-xl border text-sm font-bold transition-all flex items-center justify-center gap-3 ${
//                     lang === l.c ? "border-[#5b1f1f] bg-[#5b1f1f]/5 text-[#5b1f1f]" : "border-gray-100 text-gray-400"
//                   }`}
//                 >
//                   <span className="text-xl">{l.f}</span> {l.c}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// }

// export default Header;


// გამჭრივალე ჰედერი
// import { useState, useEffect, useRef } from "react";
// import { Link, useNavigate, useLocation } from "react-router-dom";
// import { collection, getDocs } from "firebase/firestore";
// import { db } from "../firebase";
// import { useLanguage } from "../context/LanguageContext";

// const translations = {
//   GE: { search: "ძიება (დასახელება, ტიპი...)", nav: ["ჩვენს შესახებ", "ღვინოები", "პარტნიორები", "კონტაქტი"], mobileLang: "ენა", home: "მთავარი" },
//   EN: { search: "Search (name, type...)", nav: ["About", "Wines", "Partners", "Contact"], mobileLang: "Language", home: "Home" },
//   RU: { search: "Поиск (имя, тип...)", nav: ["О нас", "Вина", "Партнеры", "Контакт"], mobileLang: "Язык", home: "Главная" }
// };

// function Header() {
//   const { lang, setLang } = useLanguage();
//   const t = translations[lang];
//   const [isOpen, setIsOpen] = useState(false);
//   const [search, setSearch] = useState("");
//   const [results, setResults] = useState([]);
//   const [allItems, setAllItems] = useState([]);
//   const [isScrolled, setIsScrolled] = useState(false);
  
//   const debounceRef = useRef(null);
//   const navigate = useNavigate();
//   const location = useLocation();

//   useEffect(() => {
//     const handleScroll = () => {
//       setIsScrolled(window.scrollY > 50);
//     };
//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   useEffect(() => {
//     setIsOpen(false);
//     setSearch("");
//     setResults([]);
//   }, [location.pathname]);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [winesSnap, discountSnap, partnersSnap] = await Promise.all([
//           getDocs(collection(db, "popularWines")),
//           getDocs(collection(db, "discountedWines")),
//           getDocs(collection(db, "partners"))
//         ]);

//         const wines = winesSnap.docs.map(doc => ({ id: doc.id, category: "wine", ...doc.data() }));
//         const discounted = discountSnap.docs.map(doc => ({ id: doc.id, category: "discounted", ...doc.data() }));
//         const partners = partnersSnap.docs.map(doc => ({ id: doc.id, category: "partner", ...doc.data() }));
        
//         setAllItems([...wines, ...discounted, ...partners]);
//       } catch (error) { console.error("Error fetching data:", error); }
//     };
//     fetchData();
//   }, []);

//   const handleChange = (e) => {
//     const value = e.target.value;
//     setSearch(value);
//     clearTimeout(debounceRef.current);
    
//     debounceRef.current = setTimeout(() => {
//       if (!value.trim()) return setResults([]);
      
//       const filtered = allItems.filter(item => {
//         const name = (item[`name_${lang.toLowerCase()}`] || item.name || "").toLowerCase();
//         const type = (item[`type_${lang.toLowerCase()}`] || item.type || "").toLowerCase();
//         const searchTerm = value.toLowerCase();
        
//         return name.includes(searchTerm) || type.includes(searchTerm);
//       });
//       setResults(filtered);
//     }, 300);
//   };

//   const handleNavigate = (item) => {
//     setIsOpen(false);
//     setSearch("");
//     setResults([]);
//     navigate(`/${item.category}/${item.id}`);
//   };

//   // ბურგერის ხაზების ფერის განსაზღვრა
//   const burgerLineColor = isScrolled || isOpen ? "bg-black" : "bg-white group-hover:bg-black";

//   return (
//     <header className={`fixed top-0 w-full z-[200] transition-all duration-500 group ${
//       isScrolled || isOpen 
//         ? "bg-white/95 backdrop-blur-md border-b border-gray-100 h-20 shadow-sm" 
//         : "bg-transparent border-b border-transparent h-24 hover:bg-white hover:h-20 hover:border-gray-100 hover:shadow-sm"
//     }`}>
//       <div className="max-w-[1440px] mx-auto px-6 md:px-12 h-full flex items-center justify-between relative z-[210]">
        
//         {/* LOGO */}
//         <div className="shrink-0">
//           <Link to="/" className={`text-2xl font-serif font-bold tracking-tighter transition-colors duration-500 ${
//             isScrolled || isOpen ? "text-[#1a1a1a]" : "text-white group-hover:text-[#1a1a1a]"
//           }`}>
//             LAMIANI<span className={isScrolled || isOpen ? "text-[#5b1f1f]" : "text-white/50 group-hover:text-[#5b1f1f]"}>.</span>
//           </Link>
//         </div>

//         {/* DESKTOP SEARCH */}
//         <div className="hidden lg:block flex-1 max-w-md relative mx-8">
//           <div className={`flex items-center rounded-full px-4 py-2 transition-all border ${
//             isScrolled 
//               ? "bg-gray-50 border-gray-100 focus-within:bg-white focus-within:border-[#5b1f1f]/30" 
//               : "bg-white/10 border-white/20 group-hover:bg-gray-50 group-hover:border-gray-100 focus-within:bg-white"
//           }`}>
//             <span className={`transition-colors duration-500 ${isScrolled ? "text-gray-400" : "text-white/70 group-hover:text-gray-400"}`}>⌕</span>
//             <input 
//               type="search" 
//               value={search} 
//               onChange={handleChange} 
//               placeholder={t.search} 
//               className={`bg-transparent outline-none text-[13px] w-full ml-3 font-serif italic transition-colors duration-500 ${
//                 isScrolled ? "text-gray-800" : "text-white placeholder:text-white/60 group-hover:text-gray-800 group-hover:placeholder:text-gray-400"
//               }`}
//             />
//           </div>
//           {results.length > 0 && (
//             <div className="absolute top-[120%] left-0 w-full bg-white shadow-2xl border border-gray-100 rounded-xl py-2 z-[250] max-h-96 overflow-y-auto text-black">
//               {results.map(item => (
//                 <button key={item.id} onClick={() => handleNavigate(item)} className="w-full flex items-center gap-4 px-4 py-3 hover:bg-gray-50 text-left">
//                   <img src={item.img} alt="" className="w-10 h-10 object-contain" />
//                   <div className="flex flex-col">
//                     <span className="text-sm font-medium text-gray-800">{item[`name_${lang.toLowerCase()}`] || item.name}</span>
//                     <span className="text-[9px] uppercase tracking-widest text-[#5b1f1f] font-bold">{item[`type_${lang.toLowerCase()}`] || item.category}</span>
//                   </div>
//                 </button>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* DESKTOP NAV */}
//         <nav className="hidden lg:flex items-center gap-8">
//           <ul className="flex items-center gap-8">
//             {t.nav.map((item, idx) => (
//               <li key={idx}>
//                 <Link to={`/${["about", "wines", "partners", "contact"][idx]}`} className={`text-[11px] uppercase tracking-[0.25em] font-bold transition-all duration-500 ${
//                   isScrolled ? "text-gray-500 hover:text-[#5b1f1f]" : "text-white/80 group-hover:text-gray-500 hover:!text-[#5b1f1f]"
//                 }`}>
//                   {item}
//                 </Link>
//               </li>
//             ))}
//           </ul>
//           <div className={`flex gap-3 ml-4 border-l pl-6 transition-colors duration-500 ${isScrolled ? "border-gray-100" : "border-white/20 group-hover:border-gray-100"}`}>
//             {["GE", "EN", "RU"].map((l) => (
//               <button key={l} onClick={() => setLang(l)} className={`text-[10px] font-bold transition-all duration-500 ${
//                 lang === l ? (isScrolled ? "text-[#5b1f1f] scale-110" : "text-white group-hover:text-[#5b1f1f] scale-110") : (isScrolled ? "text-gray-300 hover:text-gray-500" : "text-white/40 group-hover:text-gray-300")
//               }`}>
//                 {l}
//               </button>
//             ))}
//           </div>
//         </nav>

//         {/* MOBILE BURGER */}
//         <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-2 flex flex-col gap-1.5 z-[210]">
//           <div className={`w-6 h-0.5 transition-all duration-300 ${isOpen ? "rotate-45 translate-y-2" : ""} ${burgerLineColor}`}></div>
//           <div className={`w-6 h-0.5 transition-all duration-300 ${isOpen ? "opacity-0" : ""} ${burgerLineColor}`}></div>
//           <div className={`w-6 h-0.5 transition-all duration-300 ${isOpen ? "-rotate-45 -translate-y-2" : ""} ${burgerLineColor}`}></div>
//         </button>
//       </div>

//       {/* --- ORIGINAL MOBILE MENU --- */}
//       <div className={`fixed inset-0 top-20 bg-white z-[190] lg:hidden transition-all duration-500 ease-in-out ${
//         isOpen ? "translate-x-0 opacity-100 visible" : "translate-x-full opacity-0 invisible"
//       }`}>
//         <div className="flex flex-col p-8 h-[calc(100vh-80px)] overflow-y-auto">
//           {/* SEARCH */}
//           <div className="relative mb-6">
//             <div className="flex items-center bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-black">
//               <input type="search" value={search} onChange={handleChange} placeholder={t.search} className="bg-transparent outline-none text-base w-full font-serif italic" />
//             </div>
//             {results.length > 0 && (
//               <div className="absolute top-full left-0 w-full bg-white shadow-2xl border border-gray-100 rounded-xl mt-2 z-[210] max-h-[40vh] overflow-y-auto text-black">
//                 {results.map(item => (
//                   <button key={item.id} onClick={() => handleNavigate(item)} className="w-full p-4 border-b border-gray-50 flex items-center gap-4 text-left">
//                     <img src={item.img} alt="" className="w-12 h-12 object-contain" />
//                     <div>
//                       <p className="text-sm font-medium">{item[`name_${lang.toLowerCase()}`] || item.name}</p>
//                       <p className="text-[9px] text-[#5b1f1f] uppercase tracking-tighter font-bold">{item.category}</p>
//                     </div>
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* NAVIGATION */}
//           <div className="flex-1 flex flex-col justify-center gap-8">
//             <nav>
//               <ul className="flex flex-col gap-5">
//                 {[t.home, ...t.nav].map((item, idx) => (
//                   <li key={idx}>
//                     <Link to={idx === 0 ? "/" : `/${["about", "wines", "partners", "contact"][idx-1]}`} onClick={() => setIsOpen(false)} className="text-3xl font-serif italic text-gray-800 flex items-center justify-between">
//                       {item} <span className="text-[#5b1f1f] opacity-30 text-xl">→</span>
//                     </Link>
//                   </li>
//                 ))}
//               </ul>
//             </nav>
//           </div>

//           {/* LANGUAGES */}
//           <div className="mt-auto pt-8">
//             <div className="flex gap-2">
//               {[{c:"GE", f:"🇬🇪"}, {c:"EN", f:"🇺🇸"}, {c:"RU", f:"🇷🇺"}].map((l) => (
//                 <button key={l.c} onClick={() => setLang(l.c)} className={`flex-1 py-4 rounded-xl border text-sm font-bold transition-all flex items-center justify-center gap-3 ${
//                   lang === l.c ? "border-[#5b1f1f] bg-[#5b1f1f]/5 text-[#5b1f1f]" : "border-gray-100 text-gray-400"
//                 }`}>
//                   <span className="text-xl">{l.f}</span> {l.c}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// }

// export default Header;


// // უცნაური ჰედერი
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useLanguage } from "../context/LanguageContext";

const translations = {
  GE: { search: "ძიება (დასახელება, ტიპი...)", nav: ["ჩვენს შესახებ", "ღვინოები", "პარტნიორები", "კონტაქტი"], mobileLang: "ენა", home: "მთავარი" },
  EN: { search: "Search (name, type...)", nav: ["About", "Wines", "Partners", "Contact"], mobileLang: "Language", home: "Home" },
  RU: { search: "Поиск (имя, тип...)", nav: ["О нас", "Вина", "Партнеры", "Контакт"], mobileLang: "Язык", home: "Главная" }
};

function Header() {
  const { lang, setLang } = useLanguage();
  const t = translations[lang];
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
  const burgerLineColor = isLight ? "bg-black" : "bg-white group-hover:bg-black";

  return (
    <header 
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      className={`fixed top-0 w-full z-[200] transition-all duration-500 group ${
        isLight 
          ? "bg-white/95 backdrop-blur-md border-b border-gray-100 h-20 shadow-sm" 
          : "bg-transparent border-b border-transparent h-24 lg:hover:bg-white lg:hover:h-20 lg:hover:border-gray-100 lg:hover:shadow-sm"
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 h-full flex items-center justify-between relative z-[210]">
        
        {/* LOGO */}
        <div className="shrink-0">
          <Link to="/" className={`text-2xl font-serif font-bold tracking-tighter transition-colors duration-500 ${
            isLight ? "text-[#1a1a1a]" : "text-white group-hover:text-[#1a1a1a]"
          }`}>
            LAMIANI<span className={isLight ? "text-[#5b1f1f]" : "text-white/50 group-hover:text-[#5b1f1f]"}>.</span>
          </Link>
        </div>

        {/* DESKTOP SEARCH */}
        <div className="hidden lg:block flex-1 max-w-md relative mx-8">
          <div className={`flex items-center rounded-full px-4 py-2 transition-all border ${
            isScrolled 
              ? "bg-gray-50 border-gray-100 focus-within:bg-white focus-within:border-[#5b1f1f]/30" 
              : "bg-white/10 border-white/20 group-hover:bg-gray-50 group-hover:border-gray-100 focus-within:bg-white"
          }`}>
            <span className={`transition-colors duration-500 ${isScrolled ? "text-gray-400" : "text-white/70 group-hover:text-gray-400"}`}>⌕</span>
            <input 
              type="search" 
              value={search} 
              onChange={handleChange} 
              placeholder={t.search} 
              className={`bg-transparent outline-none text-[13px] w-full ml-3 font-serif italic transition-colors duration-500 ${
                isScrolled ? "text-gray-800" : "text-white placeholder:text-white/60 group-hover:text-gray-800 group-hover:placeholder:text-gray-400"
              }`}
            />
          </div>
          {results.length > 0 && (
            <div className="absolute top-[120%] left-0 w-full bg-white shadow-2xl border border-gray-100 rounded-xl py-2 z-[250] max-h-96 overflow-y-auto text-black">
              {results.map(item => (
                <button key={item.id} onClick={() => handleNavigate(item)} className="w-full flex items-center gap-4 px-4 py-3 hover:bg-gray-50 text-left">
                  <img src={item.img} alt="" className="w-10 h-10 object-contain" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-800">{item[`name_${lang.toLowerCase()}`] || item.name}</span>
                    <span className="text-[9px] uppercase tracking-widest text-[#5b1f1f] font-bold">{item[`type_${lang.toLowerCase()}`] || item.category}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* DESKTOP NAV */}
        <nav className="hidden lg:flex items-center gap-8">
          <ul className="flex items-center gap-8">
            {t.nav.map((item, idx) => (
              <li key={idx}>
                <Link to={`/${["about", "wines", "partners", "contact"][idx]}`} className={`text-[11px] uppercase tracking-[0.25em] font-bold transition-all duration-500 ${
                  isScrolled ? "text-gray-500 hover:text-[#5b1f1f]" : "text-white/80 group-hover:text-gray-500 hover:!text-[#5b1f1f]"
                }`}>
                  {item}
                </Link>
              </li>
            ))}
          </ul>
          <div className={`flex gap-3 ml-4 border-l pl-6 transition-colors duration-500 ${isScrolled ? "border-gray-100" : "border-white/20 group-hover:border-gray-100"}`}>
            {["GE", "EN", "RU"].map((l) => (
              <button key={l} onClick={() => setLang(l)} className={`text-[10px] font-bold transition-all duration-500 ${
                lang === l ? (isScrolled ? "text-[#5b1f1f] scale-110" : "text-white group-hover:text-[#5b1f1f] scale-110") : (isScrolled ? "text-gray-300 hover:text-gray-500" : "text-white/40 group-hover:text-gray-300")
              }`}>
                {l}
              </button>
            ))}
          </div>
        </nav>

        {/* MOBILE BURGER */}
        <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-2 flex flex-col gap-1.5 z-[210]">
          <div className={`w-6 h-0.5 transition-all duration-300 ${isOpen ? "rotate-45 translate-y-2" : ""} ${burgerLineColor}`}></div>
          <div className={`w-6 h-0.5 transition-all duration-300 ${isOpen ? "opacity-0" : ""} ${burgerLineColor}`}></div>
          <div className={`w-6 h-0.5 transition-all duration-300 ${isOpen ? "-rotate-45 -translate-y-2" : ""} ${burgerLineColor}`}></div>
        </button>
      </div>

      {/* --- MOBILE MENU --- */}
      <div className={`fixed inset-0 top-20 bg-white z-[190] lg:hidden transition-all duration-500 ease-in-out ${
        isOpen ? "translate-x-0 opacity-100 visible" : "translate-x-full opacity-0 invisible"
      }`}>
        <div className="flex flex-col p-8 h-[calc(100vh-80px)] overflow-y-auto">
          {/* SEARCH */}
          <div className="relative mb-6">
            <div className="flex items-center bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-black">
              <input type="search" value={search} onChange={handleChange} placeholder={t.search} className="bg-transparent outline-none text-base w-full font-serif italic" />
            </div>
            {results.length > 0 && (
              <div className="absolute top-full left-0 w-full bg-white shadow-2xl border border-gray-100 rounded-xl mt-2 z-[210] max-h-[40vh] overflow-y-auto text-black">
                {results.map(item => (
                  <button key={item.id} onClick={() => handleNavigate(item)} className="w-full p-4 border-b border-gray-50 flex items-center gap-4 text-left active:bg-gray-100">
                    <img src={item.img} alt="" className="w-12 h-12 object-contain" />
                    <div>
                      <p className="text-sm font-medium">{item[`name_${lang.toLowerCase()}`] || item.name}</p>
                      <p className="text-[9px] text-[#5b1f1f] uppercase tracking-tighter font-bold">{item.category}</p>
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
                    <Link to={idx === 0 ? "/" : `/${["about", "wines", "partners", "contact"][idx-1]}`} onClick={() => setIsOpen(false)} className="text-3xl font-serif italic text-gray-800 flex items-center justify-between ">
                      {item} <span className="text-[#5b1f1f] opacity-30 text-xl">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* LANGUAGES */}
          <div className="mt-auto pt-8">
            <div className="flex gap-2">
              {[{c:"GE", f:"🇬🇪"}, {c:"EN", f:"🇺🇸"}, {c:"RU", f:"🇷🇺"}].map((l) => (
                <button key={l.c} onClick={() => setLang(l.c)} className={`flex-1 py-4 rounded-xl border text-sm font-bold transition-all flex items-center justify-center gap-3 ${
                  lang === l.c ? "border-[#5b1f1f] bg-[#5b1f1f]/5 text-[#5b1f1f]" : "border-gray-100 text-gray-400"
                }`}>
                  <span className="text-xl">{l.f}</span> {l.c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;








































// ლოგოთი ჰედერი
// import { useState, useEffect, useRef } from "react";
// import { Link, useNavigate, useLocation } from "react-router-dom";
// import { collection, getDocs } from "firebase/firestore";
// import { db } from "../firebase";
// import { useLanguage } from "../context/LanguageContext";

// // 1. შემოიტანეთ თქვენი ლოგოს სურათი.
// // დარწმუნდით, რომ გზა (path) სწორია თქვენი ფაილური სტრუქტურის მიხედვით.
// // მაგალითად, თუ სურათი არის src/assets/logo.png
// import logo from "../assets/LamianiLogo.png"; 

// const translations = {
//   GE: { search: "ძიება (დასახელება, ტიპი...)", nav: ["ჩვენს შესახებ", "ღვინოები", "პარტნიორები", "კონტაქტი"], mobileLang: "ენა", home: "მთავარი" },
//   EN: { search: "Search (name, type...)", nav: ["About", "Wines", "Partners", "Contact"], mobileLang: "Language", home: "Home" },
//   RU: { search: "Поиск (имя, тип...)", nav: ["О нас", "Вина", "Партнеры", "Контакт"], mobileLang: "Язык", home: "Главная" }
// };

// function Header() {
//   const { lang, setLang } = useLanguage();
//   const t = translations[lang];
//   const [isOpen, setIsOpen] = useState(false);
//   const [search, setSearch] = useState("");
//   const [results, setResults] = useState([]);
//   const [allItems, setAllItems] = useState([]);
//   const debounceRef = useRef(null);
//   const navigate = useNavigate();
//   const location = useLocation();

//   useEffect(() => {
//     setIsOpen(false);
//     setSearch("");
//     setResults([]);
//   }, [location.pathname]);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [winesSnap, discountSnap, partnersSnap] = await Promise.all([
//           getDocs(collection(db, "popularWines")),
//           getDocs(collection(db, "discountedWines")),
//           getDocs(collection(db, "partners"))
//         ]);

//         const wines = winesSnap.docs.map(doc => ({ id: doc.id, category: "wine", ...doc.data() }));
//         const discounted = discountSnap.docs.map(doc => ({ id: doc.id, category: "discounted", ...doc.data() }));
//         const partners = partnersSnap.docs.map(doc => ({ id: doc.id, category: "partner", ...doc.data() }));
        
//         setAllItems([...wines, ...discounted, ...partners]);
//       } catch (error) { console.error("Error fetching data:", error); }
//     };
//     fetchData();
//   }, []);

//   const handleChange = (e) => {
//     const value = e.target.value;
//     setSearch(value);
//     clearTimeout(debounceRef.current);
    
//     debounceRef.current = setTimeout(() => {
//       if (!value.trim()) return setResults([]);
      
//       const filtered = allItems.filter(item => {
//         const name = (item[`name_${lang.toLowerCase()}`] || item.name || "").toLowerCase();
//         const type = (item[`type_${lang.toLowerCase()}`] || item.type || "").toLowerCase();
//         const searchTerm = value.toLowerCase();
        
//         return name.includes(searchTerm) || type.includes(searchTerm);
//       });
//       setResults(filtered);
//     }, 300);
//   };

//   const handleNavigate = (item) => {
//     setIsOpen(false);
//     setSearch("");
//     setResults([]);
//     navigate(`/${item.category}/${item.id}`);
//   };

//   return (
//     <header className="fixed top-0 w-full bg-white/95 backdrop-blur-md z-[200] border-b border-gray-100" role="banner">
//       <div className="max-w-[1440px] mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
        
//         {/* ლოგოს სექცია - განახლებული ტექსტიდან სურათზე */}
//         <div className="shrink-0">
//           <Link to="/" className="block" aria-label="Lamiani Home">
//             {/* 2. გამოიყენეთ <img> თეგი იმპორტირებული სურათით */}
//             <img 
//               src={logo} // იმპორტირებული ცვლადი
//               alt="Lamiani Logo" 
//               // h-12 (48px) ან h-16 (64px) კარგად მოერგება h-20 (80px) ჰედერს.
//               // w-auto უზრუნველყოფს პროპორციების შენარჩუნებას.
//               className="h-12 md:h-14 w-auto object-contain transition-transform duration-300 hover:scale-105" 
//             />
//           </Link>
//         </div>

//         {/* DESKTOP SEARCH */}
//         <div className="hidden lg:block flex-1 max-w-md relative mx-8" role="search">
//           <div className="flex items-center bg-gray-50 border border-gray-100 rounded-full px-4 py-2 focus-within:bg-white focus-within:border-[#5b1f1f]/30 transition-all">
//             <span className="text-gray-400" aria-hidden="true">⌕</span>
//             <input 
//               type="search" 
//               value={search} 
//               onChange={handleChange} 
//               placeholder={t.search} 
//               className="bg-transparent outline-none text-[13px] w-full ml-3 font-serif italic"
//               aria-label="Search wines and partners"
//             />
//           </div>
//           {results.length > 0 && (
//             <div className="absolute top-[110%] left-0 w-full bg-white shadow-2xl border border-gray-100 rounded-xl py-2 z-[250] max-h-96 overflow-y-auto">
//               {results.map(item => (
//                 <button 
//                   key={item.id} 
//                   onClick={() => handleNavigate(item)} 
//                   className="w-full flex items-center gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors text-left"
//                 >
//                   <img 
//                     src={item.img} 
//                     alt={`${item[`name_${lang.toLowerCase()}`] || item.name} - ${item[`type_${lang.toLowerCase()}`] || item.category}`} 
//                     className="w-10 h-10 object-contain" 
//                     loading="lazy" 
//                   />
//                   <div className="flex flex-col">
//                     <span className="text-sm font-medium text-gray-800">{item[`name_${lang.toLowerCase()}`] || item.name}</span>
//                     <span className="text-[9px] uppercase tracking-widest text-[#5b1f1f] font-bold">
//                       {item[`type_${lang.toLowerCase()}`] || item.category}
//                     </span>
//                   </div>
//                 </button>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* DESKTOP NAV */}
//         <nav className="hidden lg:flex items-center gap-8" role="navigation" aria-label="Main Menu">
//           <ul className="flex items-center gap-8">
//             {t.nav.map((item, idx) => (
//               <li key={idx}>
//                 <Link to={`/${["about", "wines", "partners", "contact"][idx]}`} className="text-[11px] uppercase tracking-[0.25em] font-bold text-gray-500 hover:text-[#5b1f1f] transition-all">
//                   {item}
//                 </Link>
//               </li>
//             ))}
//           </ul>
//           <div className="flex gap-3 ml-4 border-l pl-6 border-gray-100">
//             {["GE", "EN", "RU"].map((l) => (
//               <button 
//                 key={l} 
//                 onClick={() => setLang(l)} 
//                 aria-label={`Switch to ${l}`}
//                 className={`text-[10px] font-bold transition-all ${lang === l ? "text-[#5b1f1f] scale-110" : "text-gray-300 hover:text-gray-500"}`}
//               >
//                 {l}
//               </button>
//             ))}
//           </div>
//         </nav>

//         {/* MOBILE BURGER */}
//         <button 
//           onClick={() => setIsOpen(!isOpen)} 
//           className="lg:hidden p-2 flex flex-col gap-1.5 z-[210]"
//           aria-expanded={isOpen}
//           aria-label="Toggle Navigation Menu"
//         >
//           <div className={`w-6 h-0.5 bg-black transition-all duration-300 ${isOpen ? "rotate-45 translate-y-2" : ""}`}></div>
//           <div className={`w-6 h-0.5 bg-black transition-all duration-300 ${isOpen ? "opacity-0" : ""}`}></div>
//           <div className={`w-6 h-0.5 bg-black transition-all duration-300 ${isOpen ? "-rotate-45 -translate-y-2" : ""}`}></div>
//         </button>
//       </div>

//       {/* MOBILE MENU */}
//       <div className={`fixed inset-0 top-20 bg-white z-[190] lg:hidden transition-transform duration-500 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`} aria-hidden={!isOpen}>
//         <div className="flex flex-col p-8 h-[calc(100vh-80px)]">
          
//           <div className="relative mb-6" role="search">
//             <p className="text-[10px] tracking-[0.4em] text-gray-400 uppercase font-bold border-b pb-2 mb-4">Search</p>
//             <div className="flex items-center bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
//               <input 
//                 type="search" 
//                 value={search} 
//                 onChange={handleChange} 
//                 placeholder={t.search} 
//                 className="bg-transparent outline-none text-base w-full font-serif italic"
//                 aria-label="Search wines mobile"
//               />
//             </div>
//             {results.length > 0 && (
//               <div className="absolute top-full left-0 w-full bg-white shadow-2xl border border-gray-100 rounded-xl mt-2 z-[210] max-h-[40vh] overflow-y-auto">
//                 {results.map(item => (
//                   <button key={item.id} onClick={() => handleNavigate(item)} className="w-full p-4 border-b border-gray-50 flex items-center gap-4 active:bg-gray-50 text-left">
//                     <img 
//                       src={item.img} 
//                       alt={`${item[`name_${lang.toLowerCase()}`] || item.name} - ${item[`type_${lang.toLowerCase()}`] || item.category}`} 
//                       className="w-12 h-12 object-contain" 
//                       loading="lazy" 
//                     />
//                     <div>
//                       <p className="text-sm font-medium">{item[`name_${lang.toLowerCase()}`] || item.name}</p>
//                       <p className="text-[9px] text-[#5b1f1f] uppercase tracking-tighter font-bold">{item[`type_${lang.toLowerCase()}`] || item.category}</p>
//                     </div>
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>

//           <div className="flex-1 flex flex-col justify-center gap-8">
//             <p className="text-[10px] tracking-[0.4em] text-gray-400 uppercase font-bold border-b pb-2">Navigation</p>
//             <nav>
//               <ul className="flex flex-col gap-5">
//                 {[t.home, ...t.nav].map((item, idx) => (
//                   <li key={idx}>
//                     <Link 
//                       to={idx === 0 ? "/" : `/${["about", "wines", "partners", "contact"][idx-1]}`} 
//                       className="text-3xl font-serif italic text-gray-800 flex items-center justify-between hover:text-[#5b1f1f] "
//                     >
//                       {item}
//                       <span className="text-[#5b1f1f] opacity-30 text-xl" aria-hidden="true">→</span>
//                     </Link>
//                   </li>
//                 ))}
//               </ul>
//             </nav>
//           </div>

//           <div className="mt-auto pt-8">
//             <p className="text-[10px] tracking-[0.4em] text-gray-400 uppercase font-bold border-b pb-2 mb-4 uppercase">{t.mobileLang}</p>
//             <div className="flex gap-2">
//               {[{c:"GE", f:"🇬🇪"}, {c:"EN", f:"🇺🇸"}, {c:"RU", f:"🇷🇺"}].map((l) => (
//                 <button 
//                   key={l.c} 
//                   onClick={() => setLang(l.c)} 
//                   className={`flex-1 py-4 rounded-xl border text-sm font-bold transition-all flex items-center justify-center gap-3 ${lang === l.c ? "border-[#5b1f1f] bg-[#5b1f1f]/5 text-[#5b1f1f]" : "border-gray-100 text-gray-400"}`}
//                 >
//                   <span className="text-xl" aria-hidden="true">{l.f}</span> {l.c}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// }

// export default Header;