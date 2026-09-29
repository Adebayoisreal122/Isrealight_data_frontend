'use client';
import { useEffect, useState } from 'react';
import { AlertTriangle, Banknote, Clock, TrendingUp, Users, Wallet } from 'lucide-react';
import { api, Tx } from '@/lib/api';
import { naira } from '@/lib/format';
import { PageTitle, TxRow } from '@/components/ui';

interface Stats {
  users: number; walletTotal: number; pending: number;
  last24h: { success: { count: number; amount: number; profit: number }; failed: number };
}

function Stat({ icon: Icon, label, value, tone = 'brand' }: { icon: any; label: string; value: string; tone?: 'brand' | 'gold' | 'red' }) {
  const tones = { brand: 'bg-brand-600 text-sun-400', gold: 'bg-gold text-white', red: 'bg-red-500 text-white' };
  return (
    <div className="card flex items-center gap-4">
      <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${tones[tone]}`}><Icon size={22} /></span>
      <div><p className="text-xs text-muted">{label}</p><p className="text-lg font-bold">{value}</p></div>
    </div>
  );
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [provider, setProvider] = useState<string>('...');
  const [recent, setRecent] = useState<Tx[]>([]);

  useEffect(() => {
    api<Stats>('/admin/stats').then(setStats).catch(() => {});
    api('/admin/provider-balance')
      .then((r) => {
        const b = r.data?.contents?.balance ?? r.data?.content?.balance;
        setProvider(b != null ? `₦${Number(b).toLocaleString()}` : 'Unavailable');
      })
      .catch(() => setProvider('Unavailable'));
    api<{ items: Tx[] }>('/admin/transactions').then((r) => setRecent(r.items.slice(0, 8))).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <PageTitle title="Overview" sub="Last 24 hours unless stated." />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Stat icon={Banknote} label="VTpass wallet (your stock)" value={provider} />
        <Stat icon={Wallet} label="Customer wallets (you owe)" value={stats ? naira(stats.walletTotal) : '...'} tone="gold" />
        <Stat icon={TrendingUp} label="Sales (successful)" value={stats ? `${naira(stats.last24h.success.amount)} · ${stats.last24h.success.count}` : '...'} />
        <Stat icon={TrendingUp} label="Estimated profit" value={stats ? naira(stats.last24h.success.profit) : '...'} tone="gold" />
        <Stat icon={Clock} label="Pending now" value={stats ? String(stats.pending) : '...'} />
        <Stat icon={AlertTriangle} label="Failed (24h)" value={stats ? String(stats.last24h.failed) : '...'} tone="red" />
        <Stat icon={Users} label="Registered users" value={stats ? String(stats.users) : '...'} />
      </div>
      <p className="text-xs text-muted">Keep your VTpass wallet above what you expect to sell. Profit only counts sales where VTpass reported the cost.</p>
      <div className="card">
        <h2 className="mb-1 font-bold">Latest transactions</h2>
        <div className="divide-y divide-line">{recent.map((t) => <TxRow key={t._id} tx={t} />)}</div>
      </div>
    </div>
  );
}
