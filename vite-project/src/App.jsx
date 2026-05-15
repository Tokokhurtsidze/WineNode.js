import { Routes, Route } from "react-router-dom";
import { HeadProvider } from "react-head";
import { Analytics } from "@vercel/analytics/react"; 
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import ContactUs from "./pages/ContactUs";
import AboutUs from "./pages/AboutUs";
import PartnerGallery from "./pages/PartnerGallery";
import WineDetails from "./Details/WineDetails";
import DiscountedWineDetails from "./Details/DiscountedWineDetails";
import AllWines from "./pages/AllWines";
import PartnerDetails from "./Details/PartnerDetails";
import { LanguageProvider, useLanguage } from "./context/LanguageContext";
import { ThemeProvider } from "./context/ThemeContext";

import ScrollToTop from "./components/ScrollToTop";
import LocaleSync from "./components/LocaleSync";

function AppContent() {
  const { lang } = useLanguage();

  return (
    <HeadProvider>
      <div className="min-h-screen flex flex-col bg-white dark:bg-[#0B0E14] text-[#1a1a1a] dark:text-gray-200 transition-colors duration-300">
        <ScrollToTop />
        
        <Header />
        <main className="flex-grow">
          <Routes>
            {/* Default locale routes (no prefix = Georgian) */}
            <Route path="/" element={<HomePage lang={lang} />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/partners" element={<PartnerGallery />} />
            <Route path="/partner/:id" element={<PartnerDetails />} />
            <Route path="/wines" element={<AllWines />} />
            <Route path="/wine/:id" element={<WineDetails />} />
            <Route path="/discounted/:id" element={<DiscountedWineDetails />} />

            {/* Locale-prefixed routes (ka/en/ru) — auto-syncs Language context.
                Three explicit roots because RR7 doesn't accept inline regex paths. */}
            {["ka", "en", "ru"].map((loc) => (
              <Route key={loc} path={`/${loc}`} element={<LocaleSync />}>
                <Route index element={<HomePage lang={lang} />} />
                <Route path="contact" element={<ContactUs />} />
                <Route path="about" element={<AboutUs />} />
                <Route path="partners" element={<PartnerGallery />} />
                <Route path="partner/:id" element={<PartnerDetails />} />
                <Route path="wines" element={<AllWines />} />
                <Route path="wine/:id" element={<WineDetails />} />
                <Route path="discounted/:id" element={<DiscountedWineDetails />} />
              </Route>
            ))}
          </Routes>
        </main>
        <Footer />
        
        {/* 2. ანალიტიკის კომპონენტი */}
        <Analytics /> 
      </div>
    </HeadProvider>
  );
}

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;