'use client';
import { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { api, ApiError, Plan } from '@/lib/api';
import { naira } from '@/lib/format';
import { PLAN_SERVICES } from '@/lib/services';
import { Empty, ErrorText, PageTitle, Spinner } from '@/components/ui';

function PlanRow({ plan, onSaved }: { plan: Plan; onSaved: (p: Plan) => void }) {
  const [user, setUser] = useState(String(plan.userPrice / 100));
  const [agent, setAgent] = useState(String(plan.agentPrice / 100));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const dirty = Math.round(Number(user) * 100) !== plan.userPrice || Math.round(Number(agent) * 100) !== plan.agentPrice;

  const save = async (patch: object) => {
    setBusy(true);
    setErr('');
    try { onSaved((await api<{ plan: Plan }>(`/admin/plans/${plan._id}`, { method: 'PATCH', body: patch })).plan); }
    catch (e) { setErr(e instanceof ApiError ? e.message : 'Failed'); }
    setBusy(false);
  };

  return (
    <tr className="border-b border-line align-top">
      <td className="p-3"><p className="font-medium">{plan.name}</p><p className="text-xs text-muted">{plan.variationCode}</p></td>
      <td>{naira(plan.providerPrice)}</td>
      <td><input className="input !w-28 !py-1.5" type="number" value={user} onChange={(e) => setUser(e.target.value)} />
        <p className="mt-1 text-xs text-muted">margin {naira(Math.round(Number(user) * 100) - plan.providerPrice)}</p></td>
      <td><input className="input !w-28 !py-1.5" type="number" value={agent} onChange={(e) => setAgent(e.target.value)} />
        <p className="mt-1 text-xs text-muted">margin {naira(Math.round(Number(agent) * 100) - plan.providerPrice)}</p></td>
      <td><input type="checkbox" className="h-5 w-5" checked={plan.isActive} disabled={busy} onChange={(e) => save({ isActive: e.target.checked })} /></td>
      <td className="pr-3">
        <button className="btn btn-primary !py-1.5" disabled={!dirty || busy} onClick={() => save({ userPrice: Number(user), agentPrice: Number(agent) })}>{busy ? <Spinner size={14} /> : 'Save'}</button>
        {err && <p className="mt-1 text-xs text-red-500">{err}</p>}
      </td>
    </tr>
  );
}

export default function AdminPlans() {
  const [serviceID, setServiceID] = useState(PLAN_SERVICES[0].id);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPct, setUserPct] = useState('3');
  const [agentPct, setAgentPct] = useState('1.5');
  const [syncing, setSyncing] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { setPlans((await api<{ plans: Plan[] }>(`/admin/plans?serviceID=${serviceID}`)).plans); } catch { setPlans([]); }
    setLoading(false);
  }, [serviceID]);
  useEffect(() => { setMsg(''); setError(''); load(); }, [load]);

  const sync = async () => {
    setSyncing(true); setMsg(''); setError('');
    try {
      const r = await api<{ created: number; updated: number; repriced: number }>('/admin/plans/sync', {
        body: { serviceID, userMarkupPercent: Number(userPct), agentMarkupPercent: Number(agentPct) },
      });
      setMsg(`Synced: ${r.created} new, ${r.updated} updated, ${r.repriced} repriced.`);
      await load();
    } catch (e) { setError(e instanceof ApiError ? e.message : 'Sync failed'); }
    setSyncing(false);
  };

  return (
    <div className="space-y-4">
      <PageTitle title="Plans & pricing" sub="Pull plans from VTpass, apply your markup, then fine-tune prices (₦)." />
      <div className="card space-y-3">
        <div className="flex flex-wrap items-end gap-3">
          <div><label className="label">Service</label>
            <select className="input" value={serviceID} onChange={(e) => setServiceID(e.target.value)}>
              {PLAN_SERVICES.map((s) => <option key={s.id} value={s.id}>{s.label} ({s.id})</option>)}
            </select></div>
          <div><label className="label">User markup %</label><input className="input !w-24" type="number" value={userPct} onChange={(e) => setUserPct(e.target.value)} /></div>
          <div><label className="label">Agent markup %</label><input className="input !w-24" type="number" value={agentPct} onChange={(e) => setAgentPct(e.target.value)} /></div>
          <button className="btn btn-gold" disabled={syncing} onClick={sync}>{syncing ? <Spinner /> : <RefreshCw size={16} />} Sync from VTpass</button>
        </div>
        {msg && <p className="text-sm text-emerald-600">{msg}</p>}
        <ErrorText msg={error} />
        <p className="text-xs text-muted">Markup only applies to new plans. Existing prices are kept unless the provider price rises above them.</p>
      </div>

      <div className="card overflow-x-auto !p-0">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-line text-xs uppercase text-muted">
            <tr><th className="p-3">Plan</th><th>Cost (VTpass)</th><th>User price</th><th>Agent price</th><th>Active</th><th /></tr>
          </thead>
          <tbody>{plans.map((p) => <PlanRow key={p._id} plan={p} onSaved={(np) => setPlans((prev) => prev.map((x) => (x._id === np._id ? np : x)))} />)}</tbody>
        </table>
        {loading ? <div className="flex justify-center p-6 text-brand-600"><Spinner size={24} /></div> : plans.length === 0 && <Empty text="No plans yet. Click Sync from VTpass." />}
      </div>
    </div>
  );
}
