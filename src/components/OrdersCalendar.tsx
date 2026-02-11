import { useMemo, useState } from 'react';
import { asIsoDay } from '../lib/date';
import type { ParsedOrder } from '../types';
import LogisticsBadge from './LogisticsBadge';
import StatusBadge from './StatusBadge';

type Props = { orders: ParsedOrder[] };

function monthTitle(date: Date): string {
  return date.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
}

function beginning(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function end(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function buildDays(currentMonth: Date): Date[] {
  const first = beginning(currentMonth);
  const last = end(currentMonth);
  const firstWeekday = (first.getDay() + 6) % 7;
  const daysInMonth = last.getDate();

  const days: Date[] = [];
  for (let i = 0; i < firstWeekday; i += 1) {
    days.push(new Date(first.getFullYear(), first.getMonth(), i - firstWeekday + 1));
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    days.push(new Date(first.getFullYear(), first.getMonth(), day));
  }
  while (days.length % 7 !== 0) {
    const lastDate = days[days.length - 1];
    days.push(new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate() + 1));
  }
  return days;
}

export default function OrdersCalendar({ orders }: Props) {
  const [monthCursor, setMonthCursor] = useState(() => {
    const first = orders.find((item) => item.deliveryDate)?.deliveryDate;
    return first ? new Date(first.getFullYear(), first.getMonth(), 1) : beginning(new Date());
  });

  const grouped = useMemo(() => {
    return orders.reduce<Record<string, ParsedOrder[]>>((acc, order) => {
      if (!order.deliveryDate) return acc;
      const key = asIsoDay(order.deliveryDate);
      acc[key] = acc[key] ? [...acc[key], order] : [order];
      return acc;
    }, {});
  }, [orders]);

  const [selectedDay, setSelectedDay] = useState<string>(() => {
    const today = asIsoDay(new Date());
    return grouped[today] ? today : Object.keys(grouped)[0] ?? today;
  });

  const days = buildDays(monthCursor);

  const selectedOrders = grouped[selectedDay] ?? [];

  return (
    <div className="hidden rounded-2xl bg-white p-5 shadow-soft ring-1 ring-slate-200 md:block">
      <div className="mb-4 flex items-center justify-between">
        <button
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          onClick={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1))}
        >
          Anterior
        </button>
        <h3 className="text-lg font-bold capitalize text-slate-900">{monthTitle(monthCursor)}</h3>
        <button
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          onClick={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1))}
        >
          Siguiente
        </button>
      </div>

      <div className="mb-3 grid grid-cols-7 text-center text-xs font-semibold uppercase text-slate-500">
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
          <span key={day} className="py-2">
            {day}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const key = asIsoDay(day);
          const count = grouped[key]?.length ?? 0;
          const isCurrentMonth = day.getMonth() === monthCursor.getMonth();
          const isSelected = selectedDay === key;

          return (
            <button
              key={key}
              onClick={() => setSelectedDay(key)}
              className={[
                'relative min-h-20 rounded-xl border p-2 text-left transition',
                isSelected ? 'border-blossom-500 bg-blossom-50' : 'border-slate-200 hover:bg-slate-50',
                isCurrentMonth ? 'text-slate-800' : 'text-slate-400'
              ].join(' ')}
            >
              <span className="text-sm font-semibold">{day.getDate()}</span>
              {count > 0 ? (
                <span className="absolute bottom-2 right-2 rounded-full bg-blossom-500 px-2 py-0.5 text-xs font-semibold text-white">
                  {count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 p-4">
        <p className="mb-3 text-sm font-semibold text-slate-700">Pedidos para {selectedDay}</p>
        {selectedOrders.length === 0 ? (
          <p className="text-sm text-slate-500">No hay pedidos para esta fecha.</p>
        ) : (
          <div className="space-y-3">
            {selectedOrders.map((order) => {
              const address = order.isPickup
                ? 'No aplica (retiro en local).'
                : order.deliveryAddress || 'Sin dirección de envío registrada.';

              return (
                <article key={order.id} className="rounded-lg bg-slate-50 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-semibold text-slate-900">#{order.id} {order.recipientName}</p>
                  <StatusBadge status={order.status} />
                </div>
                <p className="text-sm text-slate-700">{order.deliverySlot}</p>
                <div className="mt-1">
                  <LogisticsBadge isPickup={order.isPickup} />
                </div>
                <p className="mt-1 text-xs text-slate-600">{order.recipientPhone}</p>
                {!order.isPickup ? (
                  <p className="mt-1 text-xs text-slate-500">
                    <span className="font-semibold">Dirección:</span> {address}
                  </p>
                ) : null}
                <p className="mt-2 text-xs text-slate-700">
                  <span className="font-semibold">Mensaje:</span> {order.notes || 'Sin mensaje'}
                </p>
                <p className="mt-1 text-xs text-slate-700">
                  <span className="font-semibold">Obs:</span> {order.observation || 'Sin observaciones'}
                </p>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
