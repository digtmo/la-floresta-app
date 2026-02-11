import type { ParsedOrder } from '../types';
import LogisticsBadge from './LogisticsBadge';
import StatusBadge from './StatusBadge';

type Props = {
  orders: ParsedOrder[];
};

function clp(value: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0
  }).format(value);
}

export default function OrderCards({ orders }: Props) {
  if (orders.length === 0) {
    return <p className="rounded-xl bg-white p-4 text-sm text-slate-500 shadow-soft">No hay pedidos para estos filtros.</p>;
  }

  return (
    <div className="grid gap-4 md:hidden">
      {orders.map((order) => {
        const address = order.isPickup
          ? 'No aplica (retiro en local).'
          : order.deliveryAddress || 'Sin dirección de envío registrada.';
        return (
          <article key={order.id} className="rounded-2xl bg-white p-4 shadow-soft ring-1 ring-slate-200">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pedido #{order.id}</p>
              <p className="text-lg font-bold text-slate-900">{order.recipientName}</p>
              <p className="text-sm text-slate-600">{order.customerName}</p>
            </div>
            <StatusBadge status={order.status} />
          </div>

          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Fecha</dt>
              <dd className="text-right font-medium text-slate-800">{order.deliveryDateLabel}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Horario</dt>
              <dd className="text-right text-slate-800">{order.deliverySlot}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Recibe</dt>
              <dd className="text-right text-slate-800">{order.recipientName}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Tel. envío</dt>
              <dd className="text-right text-slate-800">{order.recipientPhone}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Método</dt>
              <dd className="text-right text-slate-800">{order.deliveryType}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Logística</dt>
              <dd className="text-right">
                <LogisticsBadge isPickup={order.isPickup} />
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Total</dt>
              <dd className="text-right font-semibold text-blossom-600">{clp(order.total)}</dd>
            </div>
          </dl>

          <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
            <p className="line-clamp-2 font-medium">{order.items.join(', ')}</p>
            {!order.isPickup ? (
              <p className="mt-1 text-xs text-slate-500">
                <span className="font-semibold">Dirección:</span> {address}
              </p>
            ) : null}
            <p className="mt-2 text-xs text-slate-700">
              <span className="font-semibold">Mensaje:</span> {order.notes || 'Sin mensaje'}
            </p>
            <p className="mt-1 text-xs text-slate-700">
              <span className="font-semibold">Observaciones:</span> {order.observation || 'Sin observaciones'}
            </p>
          </div>
          </article>
        );
      })}
    </div>
  );
}
