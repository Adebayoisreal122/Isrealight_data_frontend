'use client';
import { FormEvent, Fragment, useCallback, useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { api, ApiError, Tx, TxStatus } from '@/lib/api';
import { dateTime, naira } from '@/lib/format';
import { Empty, PageTitle, Spinner, StatusBadge, TYPE_LABEL } from '@/components/ui';

export default function AdminTransactions() {
  const [status, setStatus] = useState<'' | TxStatus>('');
  const [q, setQ] = useState('');
  const [items, setItems] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<string | null>(null);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async (s = status, query = q) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (s) params.set('status', s);
    if (query.trim()) params.set('q', query.trim());
    try { setItems((await api<{ items: Tx[] }>(`/admin/transactions?${params}`)).items); } catch {}
    setLoading(false);
  }, [status, q]);
  useEffect(() => { load(status, q); /* eslint-disable-next-line */ }, [status]);

  const requery = async (ref: string) => {
    setBusy(ref);
    setError('');
    try {
      const r = await api<{ transaction: Tx }>(`/admin/transactions/${ref}/requery`, { method: 'POST' });
      setItems((prev) => prev.map((t) => (t.reference === ref ? r.transaction : t)));
    } catch (e) { setError(e instanceof ApiError ? e.message : 'Requery failed'); }
    setBusy('');
  };

  const search = (e: FormEvent) => { e.preventDefault(); load(); };

  return (
    <div className="space-y-4">
      <PageTitle title="Transactions" sub="Latest 100. Search by exact reference or phone/meter/smartcard." />
      <div className="flex flex-wrap gap-2">
        {(['', 'pending', 'success', 'failed'] as const).map((s) => (
          <button key={s || 'all'} onClick={() => setStatus(s)}
            className={`rounded-xl border px-4 py-2 text-sm font-semibold capitalize ${status === s ? 'border-brand-600 bg-brand-600 text-white' : 'border-line bg-card'}`}>
            {s || 'All'}
          </button>
        ))}
        <form onSubmit={search} className="flex min-w-[220px] flex-1 gap-2">
          <input className="input" placeholder="Reference or recipient" value={q} onChange={(e) => setQ(e.target.value)} />
          <button className="btn btn-primary" aria-label="Search"><Search size={16} /></button>
        </form>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="card overflow-x-auto !p-0">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="border-b border-line text-xs uppercase text-muted">
            <tr><th className="p-3">Customer</th><th>Service</th><th>Recipient</th><th>Amount</th><th>Status</th><th>Date</th></tr>
          </thead>
          <tbody>
            {items.map((t) => (
              <Fragment key={t._id}>
                <tr onClick={() => setOpen(open === t._id ? null : t._id)} className="cursor-pointer border-b border-line hover:bg-surface">
                  <td className="p-3"><p className="font-medium">{t.user?.name}</p><p className="text-xs text-muted">{t.user?.phone}</p></td>
                  <td>{TYPE_LABEL[t.type]}<p className="text-xs text-muted">{t.serviceID}</p></td>
                  <td>{t.recipient}</td>
                  <td className="font-semibold">{naira(t.amount)}</td>
                  <td><StatusBadge status={t.status} /></td>
                  <td className="text-muted">{dateTime(t.createdAt)}</td>
                </tr>
                {open === t._id && (
                  <tr className="border-b border-line bg-surface">
                    <td colSpan={6} className="space-y-2 p-3">
                      <p className="break-all text-xs"><span className="text-muted">Reference:</span> <span className="font-mono">{t.reference}</span> {t.refunded && <b className="ml-2 text-emerald-600">REFUNDED</b>}</p>
                      {t.note && <p className="text-xs text-muted">Note: {t.note}</p>}
                      {t.status === 'pending' && (
                        <button className="btn btn-primary !py-2" disabled={busy === t.reference} onClick={() => requery(t.reference)}>
                          {busy === t.reference && <Spinner size={14} />} Requery provider
                        </button>
                      )}
                      <pre className="max-h-64 overflow-auto rounded-lg bg-bg p-3 text-xs">{JSON.stringify(t.providerResponse ?? {}, null, 2)}</pre>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
        {loading ? <div className="flex justify-center p-6 text-brand-600"><Spinner size={24} /></div> : items.length === 0 && <Empty text="No transactions found." />}
      </div>
    </div>
  );
}
