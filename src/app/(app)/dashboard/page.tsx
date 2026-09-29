'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Plus, Smartphone, Tv, Wifi, Zap } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { api, Tx } from '@/lib/api';
import { naira } from '@/lib/format';
import { Empty, TxRow } from '@/components/ui';

const tiles = [
  { href: '/buy/airtime', label: 'Airtime', icon: Smartphone },
  { href: '/buy/data', label: 'Data', icon: Wifi },
  { href: '/buy/cable', label: 'Cable TV', icon: Tv },
  { href: '/buy/electricity', label: 'Electricity', icon: Zap },
];

export default function Dashboard() {
  const { user, refresh } = useAuth();
  const [recent, setRecent] = useState<Tx[] | null>(null);

  useEffect(() => {
    refresh();
    api<{ items: Tx[] }>('/transactions?limit=5').then((r) => setRecent(r.items)).catch(() => setRecent([]));
  }, [refresh]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-br from-brand-700 to-brand-950 p-6 text-white shadow-lg">
        <p className="text-sm text-brand-200">Wallet balance</p>
        <p className="mt-1 text-4xl font-extrabold text-sun-400">{naira(user?.balance ?? 0)}</p>
        <div className="mt-5 flex items-center justify-between">
          <Link href="/wallet" className="btn btn-gold"><Plus size={16} /> Fund wallet</Link>
          {user?.role === 'agent' && <span className="rounded-full bg-gold/25 px-3 py-1 text-xs font-bold text-gold-light">AGENT</span>}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {tiles.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className="card flex flex-col items-center gap-2 !p-3 text-center transition hover:border-brand-500">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-600 text-sun-400"><Icon size={20} /></span>
            <span className="text-xs font-semibold sm:text-sm">{label}</span>
          </Link>
        ))}
      </div>

      <div className="card">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="font-bold">Recent transactions</h2>
          <Link href="/transactions" className="text-sm font-semibold text-brand-600 dark:text-sun-300">View all</Link>
        </div>
        {recent === null ? <Empty text="Loading..." /> : recent.length === 0 ? <Empty text="No transactions yet." /> : (
          <div className="divide-y divide-line">{recent.map((t) => <TxRow key={t._id} tx={t} />)}</div>
        )}
      </div>
    </div>
  );
}
