'use client';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { CheckCircle2, Clock, Copy, ShieldCheck, XCircle } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { api, ApiError, Tx, TxStatus } from '@/lib/api';
import { naira, uuid } from '@/lib/format';
import { AIRTIME_NETWORKS, CABLE_PROVIDERS, DATA_NETWORKS, DISCOS } from '@/lib/services';
import { ErrorText, Field, PageTitle, Spinner, TYPE_LABEL } from '@/components/ui';

interface Result { success: boolean; status: TxStatus; message: string; transaction: Tx }
interface PlanOption { variationCode: string; name: string; price: number }

// ---------- shared hooks ----------
function usePurchase() {
  const { refresh } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const key = useRef(uuid()); // same key on retry after a network drop = no double charge

  const submit = async (body: object) => {
    setBusy(true);
    setError('');
    try {
      const r = await api<Result>('/purchase', { body, headers: { 'Idempotency-Key': key.current } });
      setResult(r);
      key.current = uuid();
      refresh();
    } catch (e) {
      if (e instanceof ApiError && e.status > 0) key.current = uuid(); // server said no: nothing was charged
      setError(e instanceof ApiError ? e.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };
  return { busy, error, result, submit, reset: () => { setResult(null); setError(''); } };
}

function usePlans(serviceID: string) {
  const [plans, setPlans] = useState<PlanOption[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let off = false;
    setLoading(true);
    setPlans([]);
    api<{ plans: PlanOption[] }>(`/plans?serviceID=${serviceID}`)
      .then((r) => !off && setPlans(r.plans))
      .catch(() => {})
      .finally(() => !off && setLoading(false));
    return () => { off = true; };
  }, [serviceID]);
  return { plans, loading };
}

// Smartcard / meter name lookup. `verified` resets whenever the inputs change.
function useVerify(serviceID: string, code: string, type?: string) {
  const [customer, setCustomer] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { setCustomer(''); setError(''); }, [serviceID, code, type]);

  const verify = async () => {
    setBusy(true);
    setError('');
    try {
      const r = await api<{ customer: any }>('/purchase/verify', { body: { serviceID, billersCode: code, ...(type ? { type } : {}) } });
      const name = r.customer?.Customer_Name || r.customer?.name;
      if (name) setCustomer(name);
      else setError(r.customer?.error || 'Could not verify this number. Check it and try again.');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Verification failed');
    } finally {
      setBusy(false);
    }
  };
  return { customer, busy, error, verify };
}

// ---------- shared UI ----------
function ResultCard({ res, onReset }: { res: Result; onReset: () => void }) {
  const tx = res.transaction;
  const cfg = {
    success: { Icon: CheckCircle2, color: 'text-emerald-500', title: 'Successful' },
    pending: { Icon: Clock, color: 'text-amber-500', title: 'Processing' },
    failed: { Icon: XCircle, color: 'text-red-500', title: 'Failed' },
  }[res.status];
  return (
    <div className="card space-y-4 text-center">
      <cfg.Icon size={56} className={`mx-auto ${cfg.color}`} />
      <div>
        <h2 className="text-xl font-bold">{cfg.title}</h2>
        <p className="text-sm text-muted">{res.message}</p>
      </div>
      <div className="rounded-xl bg-surface p-4 text-left text-sm">
        <Row k="Service" v={TYPE_LABEL[tx.type]} />
        <Row k="Recipient" v={tx.recipient} />
        <Row k="Amount" v={naira(tx.amount)} />
        <Row k="Reference" v={tx.reference} />
        {tx.token && (
          <div className="mt-3 flex items-center justify-between gap-2 rounded-lg bg-sun-400/25 p-3">
            <div>
              <p className="text-xs text-muted">Your token</p>
              <p className="break-all font-mono font-bold">{tx.token}</p>
            </div>
            <button className="btn btn-ghost !p-2" aria-label="Copy token" onClick={() => navigator.clipboard.writeText(tx.token!.replace(/\D/g, ''))}><Copy size={16} /></button>
          </div>
        )}
      </div>
      <div className="flex gap-3">
        <button onClick={onReset} className="btn btn-primary flex-1">Buy again</button>
        <Link href="/transactions" className="btn btn-ghost flex-1">History</Link>
      </div>
    </div>
  );
}

const Row = ({ k, v }: { k: string; v: string }) => (
  <div className="flex justify-between gap-4 py-1"><span className="text-muted">{k}</span><span className="break-all text-right font-medium">{v}</span></div>
);

const Choice = ({ options, value, onChange }: { options: { id: string; label: string }[]; value: string; onChange: (v: string) => void }) => (
  <div className="flex flex-wrap gap-2">
    {options.map((o) => (
      <button type="button" key={o.id} onClick={() => onChange(o.id)}
        className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
          value === o.id ? 'border-brand-600 bg-brand-600 text-white' : 'border-line bg-card hover:border-brand-500'}`}>
        {o.label}
      </button>
    ))}
  </div>
);

const Submit = ({ busy, disabled, children }: { busy: boolean; disabled?: boolean; children: React.ReactNode }) => (
  <button className="btn btn-gold w-full !py-3" disabled={busy || disabled}>{busy && <Spinner />} {children}</button>
);

const PlanSelect = ({ plans, loading, value, onChange }: { plans: PlanOption[]; loading: boolean; value: string; onChange: (v: string) => void }) => (
  <select className="input" required value={value} onChange={(e) => onChange(e.target.value)}>
    <option value="">{loading ? 'Loading plans...' : plans.length ? 'Select a plan' : 'No plans available yet'}</option>
    {plans.map((p) => <option key={p.variationCode} value={p.variationCode}>{p.name} - {naira(p.price)}</option>)}
  </select>
);

// ---------- forms ----------
function AirtimeForm() {
  const { busy, error, result, submit, reset } = usePurchase();
  const [serviceID, setServiceID] = useState('mtn');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  if (result) return <ResultCard res={result} onReset={reset} />;
  const go = (e: FormEvent) => { e.preventDefault(); submit({ type: 'airtime', serviceID, recipient: phone, amount: Number(amount) }); };
  return (
    <form onSubmit={go} className="card space-y-4">
      <Field label="Network"><Choice options={AIRTIME_NETWORKS} value={serviceID} onChange={setServiceID} /></Field>
      <Field label="Phone number"><input className="input" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08012345678" /></Field>
      <Field label="Amount (₦)">
        <input className="input" type="number" min={50} max={50000} required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Minimum ₦50" />
        <div className="mt-2 flex gap-2">
          {[100, 200, 500, 1000].map((n) => <button type="button" key={n} onClick={() => setAmount(String(n))} className="btn btn-ghost !px-3 !py-1.5 !text-xs">₦{n}</button>)}
        </div>
      </Field>
      <ErrorText msg={error} />
      <Submit busy={busy}>Buy airtime {amount && `· ₦${amount}`}</Submit>
    </form>
  );
}

function DataForm() {
  const { busy, error, result, submit, reset } = usePurchase();
  const [serviceID, setServiceID] = useState('mtn-data');
  const { plans, loading } = usePlans(serviceID);
  const [plan, setPlan] = useState('');
  const [phone, setPhone] = useState('');
  useEffect(() => setPlan(''), [serviceID]);
  if (result) return <ResultCard res={result} onReset={reset} />;
  const go = (e: FormEvent) => { e.preventDefault(); submit({ type: 'data', serviceID, recipient: phone, variationCode: plan }); };
  const chosen = plans.find((p) => p.variationCode === plan);
  return (
    <form onSubmit={go} className="card space-y-4">
      <Field label="Network"><Choice options={DATA_NETWORKS} value={serviceID} onChange={setServiceID} /></Field>
      <Field label="Data plan"><PlanSelect plans={plans} loading={loading} value={plan} onChange={setPlan} /></Field>
      <Field label="Phone number"><input className="input" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08012345678" /></Field>
      <ErrorText msg={error} />
      <Submit busy={busy} disabled={!plan}>Buy data {chosen && `· ${naira(chosen.price)}`}</Submit>
    </form>
  );
}

function CableForm() {
  const { busy, error, result, submit, reset } = usePurchase();
  const [serviceID, setServiceID] = useState('dstv');
  const { plans, loading } = usePlans(serviceID);
  const [plan, setPlan] = useState('');
  const [card, setCard] = useState('');
  const [mode, setMode] = useState('change');
  const v = useVerify(serviceID, card);
  useEffect(() => setPlan(''), [serviceID]);
  if (result) return <ResultCard res={result} onReset={reset} />;
  const go = (e: FormEvent) => { e.preventDefault(); submit({ type: 'cable', serviceID, recipient: card, variationCode: plan, subscriptionType: mode }); };
  const chosen = plans.find((p) => p.variationCode === plan);
  return (
    <form onSubmit={go} className="card space-y-4">
      <Field label="Provider"><Choice options={CABLE_PROVIDERS} value={serviceID} onChange={setServiceID} /></Field>
      <Field label="Smartcard / IUC number">
        <div className="flex gap-2">
          <input className="input" inputMode="numeric" required value={card} onChange={(e) => setCard(e.target.value.replace(/\D/g, ''))} />
          <button type="button" className="btn btn-primary" disabled={v.busy || card.length < 8} onClick={v.verify}>{v.busy ? <Spinner /> : 'Verify'}</button>
        </div>
        {v.customer && <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-emerald-600"><ShieldCheck size={16} /> {v.customer}</p>}
        {v.error && <p className="mt-2 text-sm text-red-500">{v.error}</p>}
      </Field>
      <Field label="Subscription type"><Choice options={[{ id: 'change', label: 'New / change bouquet' }, { id: 'renew', label: 'Renew current' }]} value={mode} onChange={setMode} /></Field>
      <Field label="Package"><PlanSelect plans={plans} loading={loading} value={plan} onChange={setPlan} /></Field>
      <ErrorText msg={error} />
      <Submit busy={busy} disabled={!plan || !v.customer}>Subscribe {chosen && `· ${naira(chosen.price)}`}</Submit>
    </form>
  );
}

function ElectricityForm() {
  const { busy, error, result, submit, reset } = usePurchase();
  const [serviceID, setServiceID] = useState(DISCOS[0].id);
  const [kind, setKind] = useState('prepaid');
  const [meter, setMeter] = useState('');
  const [amount, setAmount] = useState('');
  const v = useVerify(serviceID, meter, kind);
  if (result) return <ResultCard res={result} onReset={reset} />;
  const go = (e: FormEvent) => { e.preventDefault(); submit({ type: 'electricity', serviceID, recipient: meter, variationCode: kind, amount: Number(amount) }); };
  return (
    <form onSubmit={go} className="card space-y-4">
      <Field label="Distribution company">
        <select className="input" value={serviceID} onChange={(e) => setServiceID(e.target.value)}>
          {DISCOS.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
        </select>
      </Field>
      <Field label="Meter type"><Choice options={[{ id: 'prepaid', label: 'Prepaid' }, { id: 'postpaid', label: 'Postpaid' }]} value={kind} onChange={setKind} /></Field>
      <Field label="Meter number">
        <div className="flex gap-2">
          <input className="input" inputMode="numeric" required value={meter} onChange={(e) => setMeter(e.target.value.replace(/\D/g, ''))} />
          <button type="button" className="btn btn-primary" disabled={v.busy || meter.length < 6} onClick={v.verify}>{v.busy ? <Spinner /> : 'Verify'}</button>
        </div>
        {v.customer && <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-emerald-600"><ShieldCheck size={16} /> {v.customer}</p>}
        {v.error && <p className="mt-2 text-sm text-red-500">{v.error}</p>}
      </Field>
      <Field label="Amount (₦)"><input className="input" type="number" min={500} max={500000} required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Minimum ₦500" /></Field>
      <ErrorText msg={error} />
      <Submit busy={busy} disabled={!v.customer}>Pay {amount && `₦${amount}`}</Submit>
    </form>
  );
}

// ---------- page ----------
const PAGES: Record<string, { title: string; sub: string; Form: () => JSX.Element }> = {
  airtime: { title: 'Buy airtime', sub: 'Instant top-up on any network.', Form: AirtimeForm },
  data: { title: 'Buy data', sub: 'Pick a bundle and get connected.', Form: DataForm },
  cable: { title: 'Cable TV', sub: 'Renew or change your subscription.', Form: CableForm },
  electricity: { title: 'Electricity', sub: 'Prepaid tokens and postpaid bills.', Form: ElectricityForm },
};

export default function BuyPage() {
  const { service } = useParams<{ service: string }>();
  const page = PAGES[service];
  if (!page) return notFound();
  return (
    <div className="mx-auto max-w-lg">
      <PageTitle title={page.title} sub={page.sub} />
      <page.Form key={service} />
    </div>
  );
}
