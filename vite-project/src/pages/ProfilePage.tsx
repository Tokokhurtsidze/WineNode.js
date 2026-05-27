import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { User, Package, Calendar } from 'lucide-react';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import type { Order } from '../types/order';

function OrderCard({ order }: { order: Order }) {
  const { t } = useLanguage();
  const date = order.createdAt?.toDate?.()?.toLocaleDateString() ?? '—';

  return (
    <div className="rounded-xl border border-gray-100 dark:border-[#B89968]/15 bg-white dark:bg-[#12151D] p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-[#666] mb-1">{t('order_id')}</p>
          <p className="text-xs font-mono text-[#1a1a1a] dark:text-[#D9D2C6]">{order.id}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
            {t('paid')}
          </span>
          <p className="text-[10px] text-gray-400 dark:text-[#555] flex items-center gap-1">
            <Calendar size={10} /> {date}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-gray-50 dark:border-[#B89968]/8 pt-3">
        {order.items.map((item, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <span className="text-gray-600 dark:text-[#888880] truncate max-w-[60%]">
              {item.name} <span className="text-gray-400">×{item.quantity}</span>
            </span>
            <span className="font-bold text-[#5b1f1f] dark:text-[#A04848]">
              {(item.price * item.quantity).toFixed(2)} ₾
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50 dark:border-[#B89968]/8">
        <span className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-[#666]">Total</span>
        <span className="text-base font-bold text-[#1a1a1a] dark:text-[#D9D2C6]">
          {order.totalAmount.toFixed(2)} ₾
        </span>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, userProfile } = useAuth();
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order)));
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const joinDate = userProfile?.createdAt?.toDate?.()?.toLocaleDateString() ?? '—';

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0E14] pt-28 pb-20 px-4">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
        style={{ background: 'radial-gradient(ellipse 50% 40% at 50% 0%, rgba(91,31,31,0.05), transparent 70%)' }}
      />

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <span className="text-[10px] uppercase tracking-[0.4em] text-[#5b1f1f] dark:text-[#A04848] font-semibold">LAMIANI.</span>
          <h1 className="text-3xl font-serif font-light text-[#1a1a1a] dark:text-[#D9D2C6] mt-1">{t('profile')}</h1>
          <div className="w-12 h-px bg-[#5b1f1f]/30 mt-3" />
        </div>

        {/* Account overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-gray-100 dark:border-[#B89968]/15 bg-white/80 dark:bg-[#12151D]/80 backdrop-blur-sm p-8 mb-8"
          style={{ boxShadow: '0 24px 60px rgba(0,0,0,0.07)' }}
        >
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-[#666] mb-6">{t('account_overview')}</h2>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#5b1f1f]/8 dark:bg-[#A04848]/15 border border-[#5b1f1f]/15 dark:border-[#A04848]/25 flex items-center justify-center shrink-0">
              <User size={22} className="text-[#5b1f1f] dark:text-[#A04848]" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-serif font-medium text-[#1a1a1a] dark:text-[#D9D2C6] break-words">
                {userProfile?.displayName || user?.email}
              </p>
              <p className="text-xs text-gray-400 dark:text-[#555] mt-0.5 break-all">{user?.email}</p>
              <p className="text-[10px] text-gray-300 dark:text-[#444] mt-1">{t('member_since')} {joinDate}</p>
            </div>
          </div>
        </motion.div>

        {/* Order history */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-5">
            <Package size={16} className="text-[#5b1f1f] dark:text-[#A04848]" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-[#666]">{t('order_history')}</h2>
            {orders.length > 0 && (
              <span className="text-[10px] font-bold text-[#5b1f1f] dark:text-[#A04848] bg-[#5b1f1f]/8 dark:bg-[#A04848]/15 px-2 py-0.5 rounded-full">
                {orders.length}
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-[#5b1f1f] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-gray-400 dark:text-[#555] text-sm">
              {t('no_orders')}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
