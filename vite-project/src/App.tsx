import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { HeadProvider } from 'react-head';
import { Analytics } from '@vercel/analytics/react';

import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import LocaleSync from './components/LocaleSync';
import CartDrawer from './components/cart/CartDrawer';
import ChatBot from './components/ChatBot';

import HomePage from './pages/HomePage';
import ContactUs from './pages/ContactUs';
import AboutUs from './pages/AboutUs';
import PartnerGallery from './pages/PartnerGallery';
import AllWines from './pages/AllWines';
import AuthPage from './pages/AuthPage';
import CheckoutPage from './pages/CheckoutPage';
import CheckoutSuccessPage from './pages/CheckoutSuccessPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';

import WineDetails from './Details/WineDetails';
import DiscountedWineDetails from './Details/DiscountedWineDetails';
import PartnerDetails from './Details/PartnerDetails';

import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, AdminRoute } from './components/ui/ProtectedRoute';

const LOCALES = ['ka', 'en', 'ru'] as const;

function AppContent() {
  useLanguage();

  return (
    <HeadProvider>
      <div className="min-h-screen flex flex-col bg-white dark:bg-[#0B0E14] text-[#1a1a1a] dark:text-gray-200 transition-colors duration-300">
        <ScrollToTop />
        <Header />
        <CartDrawer />
        <ChatBot />

        <main className="flex-grow">
          <Routes>
            {/* ── Non-prefixed routes (default Georgian) ── */}
            <Route path="/" element={<HomePage />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/partners" element={<PartnerGallery />} />
            <Route path="/partner/:id" element={<PartnerDetails />} />
            <Route path="/wines" element={<AllWines />} />
            <Route path="/wine/:id" element={<WineDetails />} />
            <Route path="/discounted/:id" element={<DiscountedWineDetails />} />

            {/* ── Auth routes ── */}
            <Route path="/auth/login" element={<AuthPage mode="login" />} />
            <Route path="/auth/register" element={<AuthPage mode="register" />} />

            {/* ── Protected routes ── */}
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
            </Route>
            <Route path="/checkout/success" element={<CheckoutSuccessPage />} />

            {/* ── Admin routes ── */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminPage />} />
            </Route>

            {/* ── Locale-prefixed routes (ka / en / ru) ── */}
            {LOCALES.map((loc) => (
              <Route key={loc} path={`/${loc}`} element={<LocaleSync />}>
                <Route index element={<HomePage />} />
                <Route path="contact" element={<ContactUs />} />
                <Route path="about" element={<AboutUs />} />
                <Route path="partners" element={<PartnerGallery />} />
                <Route path="partner/:id" element={<PartnerDetails />} />
                <Route path="wines" element={<AllWines />} />
                <Route path="wine/:id" element={<WineDetails />} />
                <Route path="discounted/:id" element={<DiscountedWineDetails />} />

                <Route path="auth/login" element={<AuthPage mode="login" />} />
                <Route path="auth/register" element={<AuthPage mode="register" />} />

                <Route element={<ProtectedRoute />}>
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="checkout" element={<CheckoutPage />} />
                </Route>
                <Route path="checkout/success" element={<CheckoutSuccessPage />} />

                <Route element={<AdminRoute />}>
                  <Route path="admin" element={<AdminPage />} />
                </Route>
              </Route>
            ))}
          </Routes>
        </main>

        <Footer />
        <Analytics />
      </div>
    </HeadProvider>
  );
}

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
