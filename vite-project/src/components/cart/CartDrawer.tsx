import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ShoppingBag, Minus, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../stores/useCartStore';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import type { CartItem } from '../../types/cart';

function CartItemRow({ item }: { item: CartItem }) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const { t } = useLanguage();

  return (
    <div className="flex items-center gap-3 py-4 border-b border-gray-100 dark:border-[#B89968]/10">
      <div className="w-14 h-14 bg-gray-50 dark:bg-[#181C25] rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
        <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-[#1a1a1a] dark:text-[#D9D2C6] truncate leading-snug">
          {item.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-sm font-bold text-[#5b1f1f] dark:text-[#A04848]">
            {item.price} ₾
          </span>
          {item.originalPrice && item.originalPrice > item.price && (
            <span className="text-xs text-gray-400 line-through">{item.originalPrice} ₾</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => updateQuantity(item.id, item.quantity - 1)}
          className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-200 dark:border-[#B89968]/20 hover:border-[#5b1f1f] dark:hover:border-[#B89968]/50 text-gray-600 dark:text-gray-400 transition-colors"
        >
          <Minus size={12} />
        </button>
        <span className="w-6 text-center text-xs font-bold text-[#1a1a1a] dark:text-[#D9D2C6]">
          {item.quantity}
        </span>
        <button
          onClick={() => updateQuantity(item.id, item.quantity + 1)}
          className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-200 dark:border-[#B89968]/20 hover:border-[#5b1f1f] dark:hover:border-[#B89968]/50 text-gray-600 dark:text-gray-400 transition-colors"
        >
          <Plus size={12} />
        </button>
        <button
          onClick={() => removeItem(item.id)}
          aria-label={t('remove')}
          className="ml-1 w-7 h-7 flex items-center justify-center text-gray-300 dark:text-[#444] hover:text-red-400 dark:hover:text-red-400 transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

export default function CartDrawer() {
  const { items, isOpen, closeCart, total, clearCart } = useCartStore();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const isDark = theme === 'dark';
  const cartTotal = total();

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-[300] bg-black/40 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed top-0 right-0 h-full w-full max-w-[400px] z-[310] flex flex-col"
            style={{
              background: isDark
                ? 'rgba(18, 21, 29, 0.97)'
                : 'rgba(255, 255, 255, 0.97)',
              backdropFilter: 'blur(20px)',
              borderLeft: isDark
                ? '1px solid rgba(184, 153, 104, 0.12)'
                : '1px solid rgba(0,0,0,0.07)',
              boxShadow: '-24px 0 80px rgba(0,0,0,0.25)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-[#B89968]/10">
              <div className="flex items-center gap-2">
                <ShoppingBag size={16} className="text-[#5b1f1f] dark:text-[#A04848]" />
                <h2 className="font-serif text-base font-medium text-[#1a1a1a] dark:text-[#D9D2C6]">
                  {t('cart')}
                </h2>
                {items.length > 0 && (
                  <span className="text-[10px] font-bold text-[#5b1f1f] dark:text-[#A04848] bg-[#5b1f1f]/8 dark:bg-[#A04848]/15 px-2 py-0.5 rounded-full">
                    {items.length}
                  </span>
                )}
              </div>
              <button
                onClick={closeCart}
                className="p-1.5 rounded-full text-gray-400 dark:text-[#555] hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <ShoppingBag size={40} className="text-gray-200 dark:text-[#2a2d35]" />
                  <p className="text-sm text-gray-400 dark:text-[#555]">{t('empty_cart')}</p>
                  <button
                    onClick={closeCart}
                    className="text-xs font-bold text-[#5b1f1f] dark:text-[#B89968] uppercase tracking-widest hover:underline"
                  >
                    {t('continue_shopping')}
                  </button>
                </div>
              ) : (
                items.map((item) => <CartItemRow key={item.id} item={item} />)
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-6 py-5 border-t border-gray-100 dark:border-[#B89968]/10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs uppercase tracking-widest text-gray-400 dark:text-[#666]">
                    {t('subtotal')}
                  </span>
                  <span className="text-lg font-bold text-[#1a1a1a] dark:text-[#D9D2C6]">
                    {cartTotal.toFixed(2)} ₾
                  </span>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full py-3.5 bg-[#5b1f1f] dark:bg-[#5b1f1f] text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-[#6e2626] transition-all duration-300 shadow-lg shadow-[#5b1f1f]/20 mb-2"
                >
                  {t('checkout')}
                </button>
                <button
                  onClick={clearCart}
                  className="w-full py-2.5 text-xs text-gray-400 dark:text-[#555] hover:text-red-400 dark:hover:text-red-400 transition-colors"
                >
                  Clear cart
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
