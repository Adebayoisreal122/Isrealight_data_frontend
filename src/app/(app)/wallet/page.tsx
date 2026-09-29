'use client';
import { FormEvent, useEffect, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { api, ApiError, LedgerEntry } from '@/lib/api';
import { dateTime, naira } from '@/lib/format';
import { Empty, ErrorText, Field, PageTitle, Spinner } from '@/components/ui';

const PURPOSE: Record<string, string> = { funding: 'Wallet funding', purchase: 'Purchase', refund: 'Refund', admin: 'Adjustment' };

export default function WalletPage() {
  const { user, refresh } = useAuth();
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<LedgerEntry[] | null>(null);

  useEffect(() => {
    refresh();
    api<{ history: LedgerEntry[] }>('/wallet').then((r) => setHistory(r.history)).catch(() => setHistory([]));
  }, [refresh]);

  const fund = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const r = await api<{ authorizationUrl: string }>('/wallet/fund', { body: { amount: Number(amount) } });
      window.location.href = r.authorizationUrl; // Paystack checkout
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not start payment');
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <PageTitle title="Wallet" sub="Fund your wallet to pay for anything instantly." />
      <div className="rounded-2xl bg-gradient-to-br from-brand-700 to-brand-950 p-6 text-white">
        <p className="text-sm text-brand-200">Available balance</p>
        <p className="mt-1 text-4xl font-extrabold text-sun-400">{naira(user?.balance ?? 0)}</p>
      </div>

      <form onSubmit={fund} className="card space-y-4">
        <Field label="Amount to add (₦)">
          <input className="input" type="number" min={100} max={1000000} required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Minimum ₦100" />
          <div className="mt-2 flex flex-wrap gap-2">
            {[1000, 2000, 5000, 10000].map((n) => (
              <button type="button" key={n} onClick={() => setAmount(String(n))} className="btn btn-ghost !px-3 !py-1.5 !text-xs">₦{n.toLocaleString()}</button>
            ))}
          </div>
        </Field>
        <ErrorText msg={error} />
        <button className="btn btn-gold w-full !py-3" disabled={busy}>{busy && <Spinner />} Fund with card / transfer</button>
      </form>

      <div className="card">
        <h2 className="mb-1 font-bold">Wallet history</h2>
        {history === null ? <Empty text="Loading..." /> : history.length === 0 ? <Empty text="Nothing here yet." /> : (
          <div className="divide-y divide-line">
            {history.map((h) => (
              <div key={h._id} className="flex items-center gap-3 py-3">
                <span className={`grid h-9 w-9 place-items-center rounded-full ${h.type === 'credit' ? 'bg-emerald-500/15 text-emerald-600' : 'bg-red-500/15 text-red-500'}`}>
                  {h.type === 'credit' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{PURPOSE[h.purpose] || h.purpose}</p>
                  <p className="text-xs text-muted">{dateTime(h.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${h.type === 'credit' ? 'text-emerald-600' : ''}`}>{h.type === 'credit' ? '+' : '-'}{naira(h.amount)}</p>
                  <p className="text-xs text-muted">Bal {naira(h.balanceAfter)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
