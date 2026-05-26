import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ShoppingBag, CreditCard } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useCartStore } from '../stores/useCartStore';
import type { ShippingDetails } from '../types/order';

type CheckoutStep = 'form' | 'processing' | 'success';

const INITIAL_SHIPPING: ShippingDetails = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
};

function InputField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  required = true,
}: {
  label: string;
  name: keyof ShippingDetails;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-widest text-gray-400 dark:text-[#888880] mb-1.5">
        {label}
      </label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full bg-gray-50 dark:bg-[#0B0E14]/60 border border-gray-200 dark:border-[#B89968]/20 rounded-xl px-4 py-3 text-sm text-[#1a1a1a] dark:text-[#D9D2C6] outline-none focus:border-[#5b1f1f]/60 dark:focus:border-[#B89968]/50 transition-colors placeholder:text-gray-300 dark:placeholder:text-[#444]"
      />
    </div>
  );
}

export default function CheckoutPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { items, total, clearCart } = useCartStore();
  const cartTotal = total();

  const [shipping, setShipping] = useState<ShippingDetails>(INITIAL_SHIPPING);
  const [step, setStep] = useState<CheckoutStep>('form');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShipping((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || items.length === 0) return;

    setStep('processing');
    setError('');

    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 3000));

    try {
      await addDoc(collection(db, 'orders'), {
        userId: user.uid,
        userEmail: user.email,
        shippingDetails: shipping,
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          originalPrice: item.originalPrice ?? null,
          image: item.image,
          quantity: item.quantity,
          collection: item.collection,
        })),
        totalAmount: cartTotal,
        status: 'Paid',
        createdAt: serverTimestamp(),
      });

      clearCart();
      setStep('success');
    } catch (err) {
      console.error('Order write failed:', err);
      setError(t('error'));
      setStep('form');
    }
  };

  if (items.length === 0 && step === 'form') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0B0E14] pt-24">
        <div className="text-center">
          <ShoppingBag size={48} className="mx-auto text-gray-200 dark:text-[#2a2d35] mb-4" />
          <p className="text-gray-400 dark:text-[#555] mb-4">{t('empty_cart')}</p>
          <button onClick={() => navigate('/')} className="text-xs font-bold text-[#5b1f1f] dark:text-[#B89968] uppercase tracking-widest hover:underline">
            {t('continue_shopping')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0E14] pt-28 pb-20 px-4">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
        style={{ background: 'radial-gradient(ellipse 50% 40% at 50% 0%, rgba(91,31,31,0.06), transparent 70%)' }}
      />

      <AnimatePresence mode="wait">
        {step === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 dark:bg-[#0B0E14]/90 backdrop-blur-xl"
          >
            <div className="relative">
              <div className="w-20 h-20 border-2 border-[#5b1f1f]/20 dark:border-[#B89968]/20 rounded-full" />
              <div className="absolute inset-0 w-20 h-20 border-2 border-[#5b1f1f] dark:border-[#B89968] border-t-transparent rounded-full animate-spin" />
              <CreditCard className="absolute inset-0 m-auto text-[#5b1f1f] dark:text-[#B89968]" size={22} />
            </div>
            <p className="mt-6 text-sm font-medium text-gray-600 dark:text-[#888880] tracking-wider">{t('processing')}</p>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 14, stiffness: 180, delay: 0.1 }}
            >
              <CheckCircle size={64} className="text-[#5b1f1f] dark:text-[#A04848] mx-auto mb-6" />
            </motion.div>
            <h2 className="text-2xl font-serif font-light text-[#1a1a1a] dark:text-[#D9D2C6] mb-3">
              {t('order_success')}
            </h2>
            <p className="text-sm text-gray-400 dark:text-[#666] max-w-sm mb-8">
              {t('order_success_msg')}
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-8 py-3 bg-[#5b1f1f] text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-[#6e2626] transition-all shadow-lg shadow-[#5b1f1f]/20"
            >
              {t('back_to_home')}
            </button>
          </motion.div>
        )}

        {step === 'form' && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl mx-auto"
          >
            <div className="mb-10">
              <span className="text-[10px] uppercase tracking-[0.4em] text-[#5b1f1f] dark:text-[#A04848] font-semibold">LAMIANI.</span>
              <h1 className="text-3xl font-serif font-light text-[#1a1a1a] dark:text-[#D9D2C6] mt-1">
                {t('checkout_title')}
              </h1>
              <div className="w-12 h-px bg-[#5b1f1f]/30 mt-3" />
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 rounded-xl text-xs text-red-500">
                {error}
              </div>
            )}

            <div className="grid lg:grid-cols-[1fr_380px] gap-8">
              {/* Shipping form */}
              <form onSubmit={handleSubmit} id="checkout-form">
                <div
                  className="rounded-2xl border border-gray-100 dark:border-[#B89968]/15 bg-white/80 dark:bg-[#12151D]/80 backdrop-blur-sm p-8"
                  style={{ boxShadow: '0 24px 60px rgba(0,0,0,0.08)' }}
                >
                  <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-[#666] mb-6">
                    {t('shipping_details')}
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <InputField label={t('first_name')} name="firstName" value={shipping.firstName} onChange={handleChange} />
                    <InputField label={t('last_name')} name="lastName" value={shipping.lastName} onChange={handleChange} />
                    <InputField label={t('email')} name="email" type="email" value={shipping.email} onChange={handleChange} />
                    <InputField label={t('phone')} name="phone" type="tel" value={shipping.phone} onChange={handleChange} />
                    <div className="sm:col-span-2">
                      <InputField label={t('address')} name="address" value={shipping.address} onChange={handleChange} />
                    </div>
                    <InputField label={t('city')} name="city" value={shipping.city} onChange={handleChange} />
                  </div>
                </div>
              </form>

              {/* Order summary */}
              <div>
                <div
                  className="rounded-2xl border border-gray-100 dark:border-[#B89968]/15 bg-white/80 dark:bg-[#12151D]/80 backdrop-blur-sm p-6 sticky top-28"
                  style={{ boxShadow: '0 24px 60px rgba(0,0,0,0.08)' }}
                >
                  <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-[#666] mb-5">
                    {t('order_summary')}
                  </h2>

                  <div className="flex flex-col gap-3 mb-5">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-50 dark:bg-[#181C25] rounded-lg flex items-center justify-center shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-contain p-0.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-[#1a1a1a] dark:text-[#D9D2C6] truncate">{item.name}</p>
                          <p className="text-[10px] text-gray-400 dark:text-[#555]">×{item.quantity}</p>
                        </div>
                        <span className="text-sm font-bold text-[#5b1f1f] dark:text-[#A04848] shrink-0">
                          {(item.price * item.quantity).toFixed(2)} ₾
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-100 dark:border-[#B89968]/10 pt-4 mb-5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-widest text-gray-400 dark:text-[#666]">{t('total')}</span>
                      <span className="text-xl font-bold text-[#1a1a1a] dark:text-[#D9D2C6]">{cartTotal.toFixed(2)} ₾</span>
                    </div>
                  </div>

                  {/* Mock secure payment notice */}
                  <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 dark:bg-[#0B0E14]/40 rounded-xl border border-gray-100 dark:border-[#B89968]/10">
                    <CreditCard size={14} className="text-[#5b1f1f] dark:text-[#B89968] shrink-0" />
                    <span className="text-[10px] text-gray-400 dark:text-[#555]">256-bit SSL encrypted payment</span>
                  </div>

                  <button
                    type="submit"
                    form="checkout-form"
                    className="w-full py-3.5 bg-[#5b1f1f] text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-[#6e2626] transition-all duration-300 shadow-lg shadow-[#5b1f1f]/20"
                  >
                    {t('pay_now')} — {cartTotal.toFixed(2)} ₾
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
