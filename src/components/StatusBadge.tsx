import { STATUS_LABELS } from '../lib/orders';

type Props = { status: string };

const classes: Record<string, string> = {
  processing: 'bg-amber-100 text-amber-800',
  completed: 'bg-emerald-100 text-emerald-800',
  pending: 'bg-slate-200 text-slate-700',
  cancelled: 'bg-rose-100 text-rose-700',
  on_hold: 'bg-orange-100 text-orange-700',
  refunded: 'bg-sky-100 text-sky-700',
  failed: 'bg-red-100 text-red-700'
};

export default function StatusBadge({ status }: Props) {
  const label = STATUS_LABELS[status] ?? status;
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${classes[status] ?? 'bg-slate-100 text-slate-700'}`}>
      {label}
    </span>
  );
}
