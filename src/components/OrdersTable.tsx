import { useMemo, useState } from 'react';
import type { ParsedOrder } from '../types';
import LogisticsBadge from './LogisticsBadge';
import StatusBadge from './StatusBadge';

type Props = { orders: ParsedOrder[] };
type SortDirection = 'asc' | 'desc';
type SortKey = 'id' | 'customer' | 'reservation' | 'logistics' | 'message' | 'status' | 'total';

function clp(value: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0
  }).format(value);
}

export default function OrdersTable({ orders }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('reservation');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const sortedOrders = useMemo(() => {
    const multiplier = sortDirection === 'asc' ? 1 : -1;
    return [...orders].sort((a, b) => {
      const byText = (left: string, right: string): number =>
        left.localeCompare(right, 'es', { sensitivity: 'base', numeric: true });

      let result = 0;
      switch (sortKey) {
        case 'id':
          result = a.id - b.id;
          break;
        case 'customer':
          result = byText(a.customerName, b.customerName);
          break;
        case 'reservation': {
          const aTime = a.deliveryDate ? a.deliveryDate.getTime() : a.createdAt.getTime();
          const bTime = b.deliveryDate ? b.deliveryDate.getTime() : b.createdAt.getTime();
          result = aTime - bTime;
          if (result === 0) {
            result = byText(a.deliverySlot, b.deliverySlot);
          }
          break;
        }
        case 'logistics':
          result = Number(a.isPickup) - Number(b.isPickup);
          if (result === 0) {
            result = byText(a.recipientName, b.recipientName);
          }
          break;
        case 'message':
          result = byText(`${a.notes} ${a.observation}`.trim(), `${b.notes} ${b.observation}`.trim());
          break;
        case 'status':
          result = byText(a.status, b.status);
          break;
        case 'total':
          result = a.total - b.total;
          break;
        default:
          result = 0;
      }
      return result * multiplier;
    });
  }, [orders, sortDirection, sortKey]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortKey(key);
    setSortDirection(key === 'id' || key === 'total' ? 'desc' : 'asc');
  };

  const sortArrow = (key: SortKey): string => {
    if (sortKey !== key) return '';
    return sortDirection === 'asc' ? ' ▲' : ' ▼';
  };

  if (orders.length === 0) {
    return <p className="hidden rounded-xl bg-white p-4 text-sm text-slate-500 shadow-soft md:block">No hay pedidos para estos filtros.</p>;
  }

  return (
    <div className="hidden overflow-x-auto rounded-2xl bg-white shadow-soft ring-1 ring-slate-200 md:block">
      <table className="min-w-full text-left text-sm">
        <colgroup>
          <col className="w-[10%]" />
          <col className="w-[13%]" />
          <col className="w-[18%]" />
          <col className="w-[24%]" />
          <col className="w-[24%]" />
          <col className="w-[6%]" />
          <col className="w-[5%]" />
        </colgroup>
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">
              <button onClick={() => handleSort('id')} className="font-semibold hover:text-slate-700">
                Pedido{sortArrow('id')}
              </button>
            </th>
            <th className="px-4 py-3">
              <button onClick={() => handleSort('customer')} className="font-semibold hover:text-slate-700">
                Cliente{sortArrow('customer')}
              </button>
            </th>
            <th className="px-4 py-3">
              <button onClick={() => handleSort('reservation')} className="font-semibold hover:text-slate-700">
                Reserva{sortArrow('reservation')}
              </button>
            </th>
            <th className="px-4 py-3">
              <button onClick={() => handleSort('logistics')} className="font-semibold hover:text-slate-700">
                Logística{sortArrow('logistics')}
              </button>
            </th>
            <th className="px-4 py-3">
              <button onClick={() => handleSort('message')} className="font-semibold hover:text-slate-700">
                Mensaje y observaciones{sortArrow('message')}
              </button>
            </th>
            <th className="px-4 py-3">
              <button onClick={() => handleSort('status')} className="font-semibold hover:text-slate-700">
                Estado{sortArrow('status')}
              </button>
            </th>
            <th className="px-4 py-3">
              <button onClick={() => handleSort('total')} className="font-semibold hover:text-slate-700">
                Total{sortArrow('total')}
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedOrders.map((order) => {
            const address = order.isPickup
              ? 'No aplica (retiro en local).'
              : order.deliveryAddress || 'Sin dirección de envío registrada.';
            return (
              <tr key={order.id} className="border-t border-slate-100 align-top">
              <td className="px-4 py-3">
                <p className="font-semibold text-slate-900">#{order.id}</p>
                <p className="text-xs text-slate-500">{order.items.slice(0, 2).join(', ')}</p>
              </td>
              <td className="px-4 py-3">
                <p className="font-medium text-slate-900">{order.customerName}</p>
                <p className="text-xs text-slate-500">{order.customerPhone}</p>
              </td>
              <td className="px-4 py-3">
                <p className="font-medium text-slate-900">{order.deliveryDateLabel}</p>
                <p className="text-slate-600">{order.deliverySlot}</p>
                <p className="text-xs text-slate-500">Creado por {order.customerName}</p>
              </td>
              <td className="px-4 py-3">
                <div className="mb-2">
                  <LogisticsBadge isPickup={order.isPickup} />
                </div>
                <p className="mt-1 text-xs text-slate-700">
                  <span className="font-semibold">Recibe:</span> {order.recipientName}
                </p>
                <p className="text-xs text-slate-700">
                  <span className="font-semibold">Teléfono:</span> {order.recipientPhone}
                </p>
                {!order.isPickup ? (
                  <p className="mt-1 whitespace-normal break-words text-xs text-slate-500">
                    <span className="font-semibold">Dirección:</span> {address}
                  </p>
                ) : null}
              </td>
              <td className="px-4 py-3">
                <p className="whitespace-normal break-words text-xs text-slate-700">
                  <span className="font-semibold">Mensaje:</span> {order.notes || 'Sin mensaje'}
                </p>
                <p className="mt-1 whitespace-normal break-words text-xs text-slate-700">
                  <span className="font-semibold">Obs:</span> {order.observation || 'Sin observaciones'}
                </p>
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={order.status} />
              </td>
              <td className="px-4 py-3 font-semibold text-blossom-600">{clp(order.total)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
