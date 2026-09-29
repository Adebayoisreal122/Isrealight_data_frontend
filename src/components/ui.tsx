import { ReactNode } from 'react';
import { Loader2, Smartphone, Tv, Wifi, Zap } from 'lucide-react';
import { Tx, TxStatus, TxType } from '@/lib/api';
import { dateTime, naira } from '@/lib/format';

export const TYPE_LABEL: Record<TxType, string> = { airtime: 'Airtime', data: 'Data', cable: 'Cable TV', electricity: 'Electricity' };
export const TYPE_ICON = { airtime: Smartphone, data: Wifi, cable: Tv, electricity: Zap };

export function StatusBadge({ status }: { status: TxStatus }) {
  const styles: Record<TxStatus, string> = {
    success: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
    pending: 'bg-sun-400/30 text-amber-800 dark:text-sun-300',
    failed: 'bg-red-500/15 text-red-600 dark:text-red-400',
  };
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${styles[status]}`}>{status}</span>;
}

export const Spinner = ({ size = 18 }: { size?: number }) => <Loader2 size={size} className="animate-spin" />;

export const FullSpinner = () => (
  <div className="grid min-h-screen place-items-center text-brand-600"><Spinner size={28} /></div>
);

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export const ErrorText = ({ msg }: { msg: string }) =>
  msg ? <p className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">{msg}</p> : null;

export const PageTitle = ({ title, sub }: { title: string; sub?: string }) => (
  <div className="mb-5">
    <h1 className="text-xl font-bold sm:text-2xl">{title}</h1>
    {sub && <p className="text-sm text-muted">{sub}</p>}
  </div>
);

export const Empty = ({ text }: { text: string }) => <p className="py-8 text-center text-sm text-muted">{text}</p>;

export function TxRow({ tx, onClick }: { tx: Tx; onClick?: () => void }) {
  const Icon = TYPE_ICON[tx.type];
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 py-3 text-left">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-600/10 text-brand-600 dark:text-brand-300">
        <Icon size={18} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">{TYPE_LABEL[tx.type]} · {tx.recipient}</span>
        <span className="block text-xs text-muted">{dateTime(tx.createdAt)}</span>
      </span>
      <span className="text-right">
        <span className="block text-sm font-semibold">{naira(tx.amount)}</span>
        <StatusBadge status={tx.status} />
      </span>
    </button>
  );
}
