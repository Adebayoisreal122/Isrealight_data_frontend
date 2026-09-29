'use client';
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { api, ApiError } from '@/lib/api';
import { naira } from '@/lib/format';
import { Spinner } from '@/components/ui';

// Paystack redirects here after payment: /wallet/verify?reference=...
function Verify() {
  const params = useSearchParams();
  const reference = params.get('reference') || params.get('trxref');
  const { refresh } = useAuth();
  const [state, setState] = useState<{ kind: 'loading' | 'ok' | 'pending' | 'error'; amount?: number; msg?: string }>({ kind: 'loading' });

  useEffect(() => {
    if (!reference) return setState({ kind: 'error', msg: 'Missing payment reference.' });
    api<{ status: string; amount?: number }>(`/wallet/fund/verify?reference=${encodeURIComponent(reference)}`)
      .then((r) => { setState(r.status === 'success' ? { kind: 'ok', amount: r.amount } : { kind: 'pending' }); refresh(); })
      .catch((e) => setState({ kind: 'error', msg: e instanceof ApiError ? e.message : 'Could not verify payment.' }));
  }, [reference, refresh]);

  return (
    <div className="card mx-auto max-w-md space-y-4 text-center">
      {state.kind === 'loading' && <><div className="flex justify-center text-brand-600"><Spinner size={40} /></div><p>Confirming your payment...</p></>}
      {state.kind === 'ok' && <>
        <CheckCircle2 size={56} className="mx-auto text-emerald-500" />
        <h2 className="text-xl font-bold">Wallet funded</h2>
        <p className="text-muted">{state.amount ? `${naira(state.amount)} has been added to your wallet.` : 'Your wallet has been updated.'}</p>
      </>}
      {state.kind === 'pending' && <>
        <Clock size={56} className="mx-auto text-amber-500" />
        <h2 className="text-xl font-bold">Payment not confirmed yet</h2>
        <p className="text-muted">If you were charged, your wallet will update shortly.</p>
      </>}
      {state.kind === 'error' && <>
        <XCircle size={56} className="mx-auto text-red-500" />
        <h2 className="text-xl font-bold">Something went wrong</h2>
        <p className="text-muted">{state.msg}</p>
      </>}
      {state.kind !== 'loading' && <Link href="/dashboard" className="btn btn-primary w-full">Back to dashboard</Link>}
    </div>
  );
}

export default function VerifyPage() {
  return <Suspense><Verify /></Suspense>;
}
