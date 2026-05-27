import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ShoppingBag, Lock, Wifi } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useCartStore } from '../stores/useCartStore';
import type { ShippingDetails } from '../types/order';

type CheckoutStep = 'form' | 'processing' | 'success';

const INITIAL_SHIPPING: ShippingDetails = {
  firstName: '', lastName: '', email: '', phone: '', address: '', city: '',
};

function InputField({ label, name, type = 'text', value, onChange, required = true }: {
  label: string; name: keyof ShippingDetails; type?: string;
  value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-widest text-gray-400 dark:text-[#888880] mb-1.5">{label}</label>
      <input
        name={name} type={type} value={value} onChange={onChange} required={required}
        className="w-full bg-gray-50 dark:bg-[#0B0E14]/60 border border-gray-200 dark:border-[#B89968]/20 rounded-xl px-4 py-3 text-sm text-[#1a1a1a] dark:text-[#D9D2C6] outline-none focus:border-[#5b1f1f]/60 dark:focus:border-[#B89968]/50 transition-colors placeholder:text-gray-300 dark:placeholder:text-[#444]"
      />
    </div>
  );
}

function VisualCard({ number, name, expiry, cvv, flipped }: {
  number: string; name: string; expiry: string; cvv: string; flipped: boolean;
}) {
  const displayNumber = (number.replace(/\s/g, '') + '················').slice(0, 16);
  const groups = [displayNumber.slice(0, 4), displayNumber.slice(4, 8), displayNumber.slice(8, 12), displayNumber.slice(12, 16)];

  return (
    <div className="w-full max-w-[340px] mx-auto" style={{ perspective: '1000px' }}>
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d', position: 'relative', height: '200px' }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-2xl p-6 flex flex-col justify-between"
          style={{
            backfaceVisibility: 'hidden',
            background: 'linear-gradient(135deg, #5b1f1f 0%, #8b3a3a 40%, #3d1010 100%)',
            boxShadow: '0 25px 50px rgba(91,31,31,0.4)',
          }}
        >
          <div className="flex items-center justify-between">
            <Wifi size={28} className="text-white/60 rotate-90" />
            <div className="flex gap-1">
              <div className="w-7 h-7 rounded-full bg-[#eb9c2d]/80" />
              <div className="w-7 h-7 rounded-full bg-[#f5c518]/60 -ml-3" />
            </div>
          </div>

          <div className="flex gap-3 font-mono text-lg tracking-[0.2em] text-white/90">
            {groups.map((g, i) => (
              <span key={i}>{g}</span>
            ))}
          </div>

          <div className="flex items-end justify-between">
            <div>
              <p className="text-[9px] uppercase tracking-widest text-white/40 mb-0.5">Card Holder</p>
              <p className="text-sm font-medium text-white tracking-wider truncate max-w-[180px]">
                {name || 'FULL NAME'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[9px] uppercase tracking-widest text-white/40 mb-0.5">Expires</p>
              <p className="text-sm font-medium text-white font-mono">{expiry || 'MM/YY'}</p>
            </div>
          </div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 rounded-2xl flex flex-col justify-center"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'linear-gradient(135deg, #3d1010 0%, #5b1f1f 60%, #8b3a3a 100%)',
            boxShadow: '0 25px 50px rgba(91,31,31,0.4)',
          }}
        >
          <div className="w-full h-10 bg-black/40 mb-5" />
          <div className="px-6 flex items-center justify-between">
            <div className="flex-1 h-8 bg-white/10 rounded mr-3" />
            <div className="bg-white/90 rounded px-3 py-1.5 min-w-[50px] text-center">
              <p className="text-[10px] text-gray-400 mb-0.5">CVV</p>
              <p className="font-mono text-sm font-bold text-[#1a1a1a] tracking-widest">
                {cvv ? '•'.repeat(cvv.length) : '•••'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
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
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [cvvFocused, setCvvFocused] = useState(false);
  const [step, setStep] = useState<CheckoutStep>('form');
  const [error, setError] = useState('');

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShipping((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCardNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = digits.replace(/(.{4})/g, '$1 ').trim();
    setCard((prev) => ({ ...prev, number: formatted }));
  };

  const handleExpiry = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
    const formatted = digits.length >= 3 ? digits.slice(0, 2) + '/' + digits.slice(2) : digits;
    setCard((prev) => ({ ...prev, expiry: formatted }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || items.length === 0) return;

    setStep('processing');
    setError('');
    await new Promise((resolve) => setTimeout(resolve, 2800));

    try {
      await addDoc(collection(db, 'orders'), {
        userId: user.uid,
        userEmail: user.email,
        shippingDetails: shipping,
        items: items.map((item) => ({
          id: item.id, name: item.name, price: item.price,
          originalPrice: item.originalPrice ?? null,
          image: item.image, quantity: item.quantity, collection: item.collection,
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
        {/* Processing overlay */}
        {step === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 dark:bg-[#0B0E14]/90 backdrop-blur-xl"
          >
            <div className="flex flex-col items-center gap-6">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 rounded-full border-2 border-[#5b1f1f]/10 dark:border-[#B89968]/10" />
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#5b1f1f] dark:border-t-[#B89968]"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Lock size={22} className="text-[#5b1f1f] dark:text-[#B89968]" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-[#1a1a1a] dark:text-[#D9D2C6] mb-1">{t('processing')}</p>
                <p className="text-xs text-gray-400 dark:text-[#555]">Secure 256-bit SSL connection</p>
              </div>
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-[#5b1f1f] dark:bg-[#B89968]"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Success screen */}
        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4"
          >
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.1 }}
              className="w-24 h-24 rounded-full bg-[#5b1f1f]/8 dark:bg-[#A04848]/15 flex items-center justify-center mb-6"
            >
              <CheckCircle size={48} className="text-[#5b1f1f] dark:text-[#A04848]" />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <p className="text-[10px] uppercase tracking-[0.4em] text-[#5b1f1f] dark:text-[#A04848] font-semibold mb-2">LAMIANI.</p>
              <h2 className="text-3xl font-serif font-light text-[#1a1a1a] dark:text-[#D9D2C6] mb-3">{t('order_success')}</h2>
              <p className="text-sm text-gray-400 dark:text-[#666] max-w-sm mb-8">{t('order_success_msg')}</p>
              <button
                onClick={() => navigate('/')}
                className="px-8 py-3.5 bg-[#5b1f1f] text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-[#6e2626] transition-all duration-300 shadow-lg shadow-[#5b1f1f]/20"
              >
                {t('back_to_home')}
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* Checkout form */}
        {step === 'form' && (
          <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">
            <div className="mb-10">
              <span className="text-[10px] uppercase tracking-[0.4em] text-[#5b1f1f] dark:text-[#A04848] font-semibold">LAMIANI.</span>
              <h1 className="text-3xl font-serif font-light text-[#1a1a1a] dark:text-[#D9D2C6] mt-1">{t('checkout_title')}</h1>
              <div className="w-12 h-px bg-[#5b1f1f]/30 mt-3" />
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 rounded-xl text-xs text-red-500">{error}</div>
            )}

            <div className="grid lg:grid-cols-[1fr_380px] gap-8">
              <form onSubmit={handleSubmit} id="checkout-form" className="flex flex-col gap-6">

                {/* Shipping */}
                <div className="rounded-2xl border border-gray-100 dark:border-[#B89968]/15 bg-white/80 dark:bg-[#12151D]/80 backdrop-blur-sm p-8" style={{ boxShadow: '0 24px 60px rgba(0,0,0,0.08)' }}>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-[#666] mb-6">{t('shipping_details')}</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <InputField label={t('first_name')} name="firstName" value={shipping.firstName} onChange={handleShippingChange} />
                    <InputField label={t('last_name')} name="lastName" value={shipping.lastName} onChange={handleShippingChange} />
                    <InputField label={t('email')} name="email" type="email" value={shipping.email} onChange={handleShippingChange} />
                    <InputField label={t('phone')} name="phone" type="tel" value={shipping.phone} onChange={handleShippingChange} />
                    <div className="sm:col-span-2">
                      <InputField label={t('address')} name="address" value={shipping.address} onChange={handleShippingChange} />
                    </div>
                    <InputField label={t('city')} name="city" value={shipping.city} onChange={handleShippingChange} />
                  </div>
                </div>

                {/* Card payment */}
                <div className="rounded-2xl border border-gray-100 dark:border-[#B89968]/15 bg-white/80 dark:bg-[#12151D]/80 backdrop-blur-sm p-8" style={{ boxShadow: '0 24px 60px rgba(0,0,0,0.08)' }}>
                  <div className="flex items-center gap-2 mb-6">
                    <Lock size={13} className="text-[#5b1f1f] dark:text-[#B89968]" />
                    <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-[#666]">Card Details</h2>
                  </div>

                  {/* Visual card */}
                  <div className="mb-8">
                    <VisualCard number={card.number} name={card.name} expiry={card.expiry} cvv={card.cvv} flipped={cvvFocused} />
                  </div>

                  <div className="flex flex-col gap-4">
                    {/* Card number */}
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-gray-400 dark:text-[#888880] mb-1.5">Card Number</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={card.number}
                        onChange={handleCardNumber}
                        placeholder="1234 5678 9012 3456"
                        required
                        maxLength={19}
                        className="w-full bg-gray-50 dark:bg-[#0B0E14]/60 border border-gray-200 dark:border-[#B89968]/20 rounded-xl px-4 py-3 text-sm font-mono text-[#1a1a1a] dark:text-[#D9D2C6] outline-none focus:border-[#5b1f1f]/60 dark:focus:border-[#B89968]/50 transition-colors tracking-widest placeholder:text-gray-300 dark:placeholder:text-[#444] placeholder:font-sans placeholder:tracking-normal"
                      />
                    </div>

                    {/* Cardholder name */}
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-gray-400 dark:text-[#888880] mb-1.5">Cardholder Name</label>
                      <input
                        type="text"
                        value={card.name}
                        onChange={(e) => setCard((prev) => ({ ...prev, name: e.target.value.toUpperCase() }))}
                        placeholder="JOHN DOE"
                        required
                        className="w-full bg-gray-50 dark:bg-[#0B0E14]/60 border border-gray-200 dark:border-[#B89968]/20 rounded-xl px-4 py-3 text-sm text-[#1a1a1a] dark:text-[#D9D2C6] outline-none focus:border-[#5b1f1f]/60 dark:focus:border-[#B89968]/50 transition-colors placeholder:text-gray-300 dark:placeholder:text-[#444] uppercase tracking-wider"
                      />
                    </div>

                    {/* Expiry + CVV */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-gray-400 dark:text-[#888880] mb-1.5">Expiry Date</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={card.expiry}
                          onChange={handleExpiry}
                          placeholder="MM/YY"
                          required
                          maxLength={5}
                          className="w-full bg-gray-50 dark:bg-[#0B0E14]/60 border border-gray-200 dark:border-[#B89968]/20 rounded-xl px-4 py-3 text-sm font-mono text-[#1a1a1a] dark:text-[#D9D2C6] outline-none focus:border-[#5b1f1f]/60 dark:focus:border-[#B89968]/50 transition-colors tracking-widest placeholder:text-gray-300 dark:placeholder:text-[#444] placeholder:font-sans placeholder:tracking-normal"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-gray-400 dark:text-[#888880] mb-1.5">CVV</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={card.cvv}
                          onChange={(e) => setCard((prev) => ({ ...prev, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                          onFocus={() => setCvvFocused(true)}
                          onBlur={() => setCvvFocused(false)}
                          placeholder="•••"
                          required
                          maxLength={4}
                          className="w-full bg-gray-50 dark:bg-[#0B0E14]/60 border border-gray-200 dark:border-[#B89968]/20 rounded-xl px-4 py-3 text-sm font-mono text-[#1a1a1a] dark:text-[#D9D2C6] outline-none focus:border-[#5b1f1f]/60 dark:focus:border-[#B89968]/50 transition-colors tracking-widest placeholder:text-gray-300 dark:placeholder:text-[#444] placeholder:font-sans placeholder:tracking-normal"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </form>

              {/* Order summary */}
              <div>
                <div className="rounded-2xl border border-gray-100 dark:border-[#B89968]/15 bg-white/80 dark:bg-[#12151D]/80 backdrop-blur-sm p-6 sticky top-28" style={{ boxShadow: '0 24px 60px rgba(0,0,0,0.08)' }}>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-[#666] mb-5">{t('order_summary')}</h2>

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

                  <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 dark:bg-[#0B0E14]/40 rounded-xl border border-gray-100 dark:border-[#B89968]/10">
                    <Lock size={12} className="text-[#5b1f1f] dark:text-[#B89968] shrink-0" />
                    <span className="text-[10px] text-gray-400 dark:text-[#555]">256-bit SSL encrypted payment</span>
                  </div>

                  <button
                    type="submit"
                    form="checkout-form"
                    className="w-full py-3.5 bg-[#5b1f1f] text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-[#6e2626] transition-all duration-300 shadow-lg shadow-[#5b1f1f]/20 flex items-center justify-center gap-2"
                  >
                    <Lock size={12} />
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
