import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useLanguage } from '../context/LanguageContext';
import { useCartStore } from '../stores/useCartStore';

export default function CheckoutSuccessPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { clearCart } = useCartStore();
  const saved = useRef(false);

  useEffect(() => {
    if (saved.current) return;
    saved.current = true;

    const raw = localStorage.getItem('lamiani-pending-order');
    if (!raw) return;

    const order = JSON.parse(raw);
    localStorage.removeItem('lamiani-pending-order');
    clearCart();

    addDoc(collection(db, 'orders'), {
      ...order,
      status: 'Paid',
      createdAt: serverTimestamp(),
    }).catch((err) => console.error('Order save failed:', err));
  }, [clearCart]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#0B0E14] px-4 text-center">
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', damping: 12, stiffness: 200 }}
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
    </div>
  );
}
