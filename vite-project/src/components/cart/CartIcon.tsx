import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { useCartStore } from '../../stores/useCartStore';

interface CartIconProps {
  isLight: boolean;
  isScrolled: boolean;
}

export default function CartIcon({ isLight, isScrolled }: CartIconProps) {
  const itemCount = useCartStore((s) => s.itemCount());
  const openCart = useCartStore((s) => s.openCart);

  return (
    <button
      onClick={openCart}
      aria-label="Open cart"
      className={`relative p-1.5 rounded-full transition-all duration-500 ${
        isScrolled
          ? 'text-[#5b1f1f] dark:text-[#D9D2C6] hover:bg-gray-100 dark:hover:bg-white/10'
          : 'text-white group-hover:text-[#5b1f1f] dark:group-hover:text-[#D9D2C6] hover:bg-white/10 dark:group-hover:hover:bg-white/10'
      }`}
    >
      <ShoppingBag size={18} />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#5b1f1f] dark:bg-[#A04848] text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
          {itemCount > 9 ? '9+' : itemCount}
        </span>
      )}
    </button>
  );
}
