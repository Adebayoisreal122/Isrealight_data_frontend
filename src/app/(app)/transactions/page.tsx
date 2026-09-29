'use client';
import { useCallback, useEffect, useState } from 'react';
import { Copy } from 'lucide-react';
import { api, ApiError, Tx } from '@/lib/api';
import { dateTime, naira } from '@/lib/format';
import { Empty, PageTitle, Spinner, TxRow } from '@/components/ui';

export default function TransactionsPage() {
  const [items, setItems] = useState<Tx[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<string | null>(null);
  const [checking, setChecking] = useState('');
  const [note, setNote] = useState('');

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const r = await api<{ items: Tx[]; total: number }>(`/transactions?page=${p}&limit=20`);
      setItems((prev) => (p === 1 ? r.items : [...prev, ...r.items]));
      setTotal(r.total);
      setPage(p);
    } catch {} finally { setLoading(false); }
  }, []);
  useEffect(() => { load(1); }, [load]);

  const recheck = async (ref: string) => {
    setChecking(ref);
    setNote('');
    try {
      const r = await api<{ transaction: Tx }>(`/transactions/${ref}/requery`, { method: 'POST' });
      setItems((prev) => prev.map((t) => (t.reference === ref ? r.transaction : t)));
    } catch (e) { setNote(e instanceof ApiError ? e.message : 'Could not check status'); }
    setChecking('');
  };

  return (
    <div>
      <PageTitle title="Transaction history" />
      <div className="card">
        {!loading && items.length === 0 ? <Empty text="No transactions yet." /> : (
          <div className="divide-y divide-line">
            {items.map((t) => (
              <div key={t._id}>
                <TxRow tx={t} onClick={() => setOpen(open === t._id ? null : t._id)} />
                {open === t._id && (
                  <div className="mb-3 space-y-1.5 rounded-xl bg-surface p-3 text-sm">
                    <p><span className="text-muted">Reference:</span> <span className="break-all font-mono">{t.reference}</span></p>
                    <p><span className="text-muted">Date:</span> {dateTime(t.createdAt)}</p>
                    <p><span className="text-muted">Amount:</span> {naira(t.amount)}</p>
                    {t.refunded && <p className="font-semibold text-emerald-600">Refunded to your wallet</p>}
                    {t.token && (
                      <p className="flex items-center gap-2"><span className="text-muted">Token:</span> <span className="font-mono font-bold">{t.token}</span>
                        <button aria-label="Copy token" onClick={() => navigator.clipboard.writeText(t.token!.replace(/\D/g, ''))}><Copy size={14} /></button></p>
                    )}
                    {t.status === 'pending' && (
                      <button className="btn btn-primary !py-2" disabled={checking === t.reference} onClick={() => recheck(t.reference)}>
                        {checking === t.reference && <Spinner size={14} />} Check status
                      </button>
                    )}
                    {note && <p className="text-red-500">{note}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {loading && <div className="flex justify-center py-6 text-brand-600"><Spinner size={24} /></div>}
        {!loading && items.length < total && (
          <button className="btn btn-ghost mt-3 w-full" onClick={() => load(page + 1)}>Load more</button>
        )}
      </div>
    </div>
  );
}
