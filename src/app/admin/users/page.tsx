'use client';
import { FormEvent, Fragment, useCallback, useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { api, AdminUser, ApiError, Role } from '@/lib/api';
import { dateTime, naira } from '@/lib/format';
import { Empty, ErrorText, PageTitle, Spinner } from '@/components/ui';

function AdjustForm({ user, onDone }: { user: AdminUser; onDone: (balance: number) => void }) {
  const [type, setType] = useState<'credit' | 'debit'>('credit');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const go = async (e: FormEvent) => {
    e.preventDefault();
    if (!confirm(`${type === 'credit' ? 'Credit' : 'Debit'} ₦${amount} ${type === 'credit' ? 'to' : 'from'} ${user.name}?`)) return;
    setBusy(true); setError('');
    try {
      const r = await api<{ balance: number }>('/admin/wallet/adjust', { body: { userId: user._id, type, amount: Number(amount), note } });
      onDone(r.balance);
      setAmount(''); setNote('');
    } catch (err) { setError(err instanceof ApiError ? err.message : 'Failed'); }
    setBusy(false);
  };

  return (
    <form onSubmit={go} className="flex flex-wrap items-end gap-2 p-3">
      <select className="input !w-28" value={type} onChange={(e) => setType(e.target.value as 'credit' | 'debit')}><option value="credit">Credit</option><option value="debit">Debit</option></select>
      <input className="input !w-32" type="number" min={1} required placeholder="Amount ₦" value={amount} onChange={(e) => setAmount(e.target.value)} />
      <input className="input min-w-[200px] flex-1" required minLength={3} placeholder="Reason (kept in the ledger)" value={note} onChange={(e) => setNote(e.target.value)} />
      <button className="btn btn-primary" disabled={busy}>{busy && <Spinner size={14} />} Apply</button>
      <div className="w-full"><ErrorText msg={error} /></div>
    </form>
  );
}

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<string | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async (query = '') => {
    setLoading(true);
    try { setUsers((await api<{ users: AdminUser[] }>(`/admin/users?q=${encodeURIComponent(query)}`)).users); } catch {}
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const patch = async (id: string, body: { role?: Role; isActive?: boolean }) => {
    setError('');
    try {
      const r = await api<{ user: AdminUser }>(`/admin/users/${id}`, { method: 'PATCH', body });
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, ...r.user } : u)));
    } catch (e) { setError(e instanceof ApiError ? e.message : 'Update failed'); }
  };

  return (
    <div className="space-y-4">
      <PageTitle title="Users" sub="Search, promote to agent, deactivate, or adjust a wallet." />
      <form onSubmit={(e) => { e.preventDefault(); load(q); }} className="flex gap-2">
        <input className="input" placeholder="Search name, email or phone" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="btn btn-primary" aria-label="Search"><Search size={16} /></button>
      </form>
      <ErrorText msg={error} />
      <div className="card overflow-x-auto !p-0">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-line text-xs uppercase text-muted">
            <tr><th className="p-3">User</th><th>Role</th><th>Balance</th><th>Joined</th><th>Active</th><th /></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <Fragment key={u._id}>
                <tr className="border-b border-line">
                  <td className="p-3"><p className="font-medium">{u.name}</p><p className="text-xs text-muted">{u.email} · {u.phone}</p></td>
                  <td>
                    <select className="input !w-28 !py-1.5" value={u.role} onChange={(e) => patch(u._id, { role: e.target.value as Role })}>
                      <option value="user">User</option><option value="agent">Agent</option><option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="font-semibold">{naira(u.balance)}</td>
                  <td className="text-muted">{dateTime(u.createdAt)}</td>
                  <td><input type="checkbox" className="h-5 w-5" checked={u.isActive} onChange={(e) => patch(u._id, { isActive: e.target.checked })} /></td>
                  <td className="pr-3"><button className="btn btn-ghost !py-1.5" onClick={() => setOpen(open === u._id ? null : u._id)}>Wallet</button></td>
                </tr>
                {open === u._id && (
                  <tr className="border-b border-line bg-surface">
                    <td colSpan={6}><AdjustForm user={u} onDone={(b) => setUsers((prev) => prev.map((x) => (x._id === u._id ? { ...x, balance: b } : x)))} /></td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
        {loading ? <div className="flex justify-center p-6 text-brand-600"><Spinner size={24} /></div> : users.length === 0 && <Empty text="No users found." />}
      </div>
    </div>
  );
}
