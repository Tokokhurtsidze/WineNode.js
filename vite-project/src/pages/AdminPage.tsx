import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { LayoutDashboard, Package, TrendingUp, Users } from 'lucide-react';
import { db } from '../firebase';
import { useLanguage } from '../context/LanguageContext';
import type { Order } from '../types/order';

function StatCard({ icon: Icon, label, value, accent = false }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-5 ${accent
      ? 'border-[#5b1f1f]/20 dark:border-[#B89968]/20 bg-[#5b1f1f]/5 dark:bg-[#B89968]/5'
      : 'border-gray-100 dark:border-[#B89968]/10 bg-white dark:bg-[#12151D]'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <Icon size={16} className={accent ? 'text-[#5b1f1f] dark:text-[#B89968]' : 'text-gray-300 dark:text-[#333]'} />
      </div>
      <p className="text-2xl font-bold text-[#1a1a1a] dark:text-[#D9D2C6]">{value}</p>
      <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-[#555] mt-1">{label}</p>
    </div>
  );
}

function OrderRow({ order, index }: { order: Order; index: number }) {
  const { t } = useLanguage();
  const date = order.createdAt?.toDate?.()?.toLocaleDateString() ?? '—';
  const time = order.createdAt?.toDate?.()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) ?? '';

  return (
    <motion.tr
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="border-b border-gray-50 dark:border-[#B89968]/8 hover:bg-gray-50/50 dark:hover:bg-white/2 transition-colors"
    >
      <td className="px-5 py-4">
        <p className="text-[10px] font-mono text-gray-400 dark:text-[#555] truncate max-w-[120px]">{order.id}</p>
      </td>
      <td className="px-5 py-4">
        <p className="text-xs font-medium text-[#1a1a1a] dark:text-[#D9D2C6]">
          {order.shippingDetails?.firstName} {order.shippingDetails?.lastName}
        </p>
        <p className="text-[10px] text-gray-400 dark:text-[#555]">{order.userEmail}</p>
      </td>
      <td className="px-5 py-4">
        <div className="flex flex-col gap-0.5">
          {order.items.slice(0, 2).map((item, i) => (
            <p key={i} className="text-[10px] text-gray-500 dark:text-[#666] truncate max-w-[160px]">
              {item.name} ×{item.quantity}
            </p>
          ))}
          {order.items.length > 2 && (
            <p className="text-[9px] text-gray-400 dark:text-[#444]">+{order.items.length - 2} more</p>
          )}
        </div>
      </td>
      <td className="px-5 py-4">
        <p className="text-sm font-bold text-[#5b1f1f] dark:text-[#A04848]">
          {order.totalAmount?.toFixed(2)} ₾
        </p>
      </td>
      <td className="px-5 py-4">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
          {t('paid')}
        </span>
      </td>
      <td className="px-5 py-4 text-right">
        <p className="text-[10px] text-gray-400 dark:text-[#555]">{date}</p>
        <p className="text-[9px] text-gray-300 dark:text-[#444]">{time}</p>
      </td>
    </motion.tr>
  );
}

export default function AdminPage() {
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order)));
      setLoading(false);
    });
    return unsub;
  }, []);

  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const uniqueCustomers = new Set(orders.map((o) => o.userId)).size;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0E14] pt-28 pb-20 px-4">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
        style={{ background: 'radial-gradient(ellipse 50% 40% at 50% 0%, rgba(184,153,104,0.05), transparent 70%)' }}
      />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10 flex items-center gap-3">
          <LayoutDashboard size={20} className="text-[#5b1f1f] dark:text-[#B89968]" />
          <div>
            <span className="text-[10px] uppercase tracking-[0.4em] text-[#5b1f1f] dark:text-[#A04848] font-semibold">LAMIANI.</span>
            <h1 className="text-3xl font-serif font-light text-[#1a1a1a] dark:text-[#D9D2C6] mt-0.5">{t('admin_dashboard')}</h1>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard icon={Package} label={t('all_orders')} value={orders.length} accent />
          <StatCard icon={TrendingUp} label="Revenue" value={`${totalRevenue.toFixed(2)} ₾`} accent />
          <StatCard icon={Users} label="Customers" value={uniqueCustomers} />
          <StatCard icon={Package} label="Avg Order" value={orders.length ? `${(totalRevenue / orders.length).toFixed(2)} ₾` : '—'} />
        </div>

        {/* Orders table */}
        <div
          className="rounded-2xl border border-gray-100 dark:border-[#B89968]/15 bg-white/80 dark:bg-[#12151D]/80 backdrop-blur-sm overflow-hidden"
          style={{ boxShadow: '0 24px 60px rgba(0,0,0,0.08)' }}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50 dark:border-[#B89968]/8">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-[#666]">{t('all_orders')}</h2>
            <span className="text-[10px] text-gray-300 dark:text-[#444]">Real-time</span>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-6 h-6 border-2 border-[#B89968] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 text-gray-400 dark:text-[#555] text-sm">{t('no_orders')}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-50 dark:border-[#B89968]/8">
                    {[t('order_id'), t('customer'), t('items'), t('order_total'), t('order_status'), t('order_date')].map((h) => (
                      <th key={h} className="px-5 py-3 text-[9px] uppercase tracking-widest text-gray-300 dark:text-[#444] font-bold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, i) => (
                    <OrderRow key={order.id} order={order} index={i} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
