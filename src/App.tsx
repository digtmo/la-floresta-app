import { useEffect, useMemo, useState } from 'react';
import OrdersCalendar from './components/OrdersCalendar';
import OrderCards from './components/OrderCards';
import OrdersTable from './components/OrdersTable';
import { fetchOrders, STATUS_LABELS } from './lib/orders';
import type { ParsedOrder } from './types';

type ViewMode = 'table' | 'calendar';
type LogisticsFilter = 'all' | 'delivery' | 'pickup';

type FetchState = {
  loading: boolean;
  error: string;
  orders: ParsedOrder[];
};

function useOrders(): FetchState & { reload: () => Promise<void> } {
  const [state, setState] = useState<FetchState>({
    loading: true,
    error: '',
    orders: []
  });

  async function reload() {
    try {
      setState((prev) => ({ ...prev, loading: true, error: '' }));
      const orders = await fetchOrders();
      setState({ loading: false, error: '', orders });
    } catch (error) {
      setState({
        loading: false,
        orders: [],
        error: error instanceof Error ? error.message : 'Error inesperado cargando pedidos'
      });
    }
  }

  useEffect(() => {
    void reload();
  }, []);

  return { ...state, reload };
}

export default function App() {
  const { orders, loading, error, reload } = useOrders();
  const [statusFilter, setStatusFilter] = useState('all');
  const [logisticsFilter, setLogisticsFilter] = useState<LogisticsFilter>('all');
  const [search, setSearch] = useState('');
  const [view, setView] = useState<ViewMode>('table');

  const statuses = useMemo(() => {
    return Array.from(new Set(orders.map((order) => order.status)));
  }, [orders]);

  const filtered = useMemo(() => {
    return orders
      .filter((order) => (statusFilter === 'all' ? true : order.status === statusFilter))
      .filter((order) => {
        if (logisticsFilter === 'all') return true;
        if (logisticsFilter === 'pickup') return order.isPickup;
        return !order.isPickup;
      })
      .filter((order) => {
        const query = search.trim().toLowerCase();
        if (!query) return true;
        const full = [
          String(order.id),
          order.customerName,
          order.recipientName,
          order.recipientPhone,
          order.deliveryDateLabel,
          order.deliveryAddress,
          order.customerPhone,
          order.notes,
          order.observation
        ]
          .join(' ')
          .toLowerCase();
        return full.includes(query);
      })
      .sort((a, b) => {
        const aTime = a.deliveryDate ? a.deliveryDate.getTime() : a.createdAt.getTime();
        const bTime = b.deliveryDate ? b.deliveryDate.getTime() : b.createdAt.getTime();
        return aTime - bTime;
      });
  }, [logisticsFilter, orders, search, statusFilter]);

  const metrics = useMemo(() => {
    const totals = filtered.reduce(
      (acc, order) => {
        acc.orders += 1;
        acc.amount += order.total;
        if (order.isPickup) {
          acc.pickupOrders += 1;
          acc.pickupAmount += order.total;
        } else {
          acc.deliveryOrders += 1;
          acc.deliveryAmount += order.total;
        }
        return acc;
      },
      {
        orders: 0,
        amount: 0,
        deliveryOrders: 0,
        deliveryAmount: 0,
        pickupOrders: 0,
        pickupAmount: 0
      }
    );
    return totals;
  }, [filtered]);

  const clp = (value: number): string =>
    new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    }).format(value);

  return (
    <main className="min-h-screen bg-gradient-to-b from-blossom-50 via-white to-slate-100 px-3 py-5 md:px-8 md:py-8">
      <section className="w-full">
        <header className="mb-5 rounded-3xl bg-white p-4 shadow-soft ring-1 ring-slate-200 md:p-6">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">La Floresta Pedidos</h1>
              <p className="text-sm text-slate-600">Gestión de reservas por fecha de entrega o retiro</p>
            </div>
            <button
              onClick={() => void reload()}
              className="rounded-xl bg-blossom-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blossom-600"
            >
              Actualizar
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-[220px,220px,1fr,auto]">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Estado</span>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none ring-blossom-300 focus:ring"
              >
                <option value="all">Todos</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status] ?? status}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Logística</span>
              <select
                value={logisticsFilter}
                onChange={(event) => setLogisticsFilter(event.target.value as LogisticsFilter)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none ring-blossom-300 focus:ring"
              >
                <option value="all">Todos</option>
                <option value="delivery">Envío</option>
                <option value="pickup">Retiro</option>
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Buscar</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="N° pedido, cliente, destinatario, fecha..."
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none ring-blossom-300 focus:ring"
              />
            </label>

            <div className="hidden items-end gap-2 md:flex">
              <button
                onClick={() => setView('table')}
                className={`rounded-xl px-3 py-2 text-sm font-semibold ${
                  view === 'table' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Tabla
              </button>
              <button
                onClick={() => setView('calendar')}
                className={`rounded-xl px-3 py-2 text-sm font-semibold ${
                  view === 'calendar' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Calendario
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <article className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pedidos</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{metrics.orders}</p>
              <p className="text-xs text-slate-600">{clp(metrics.amount)}</p>
            </article>
            <article className="rounded-2xl bg-sky-50 p-3 ring-1 ring-sky-200">
              <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">Envíos</p>
              <p className="mt-1 text-xl font-bold text-sky-900">{metrics.deliveryOrders}</p>
              <p className="text-xs text-sky-700">{clp(metrics.deliveryAmount)}</p>
            </article>
            <article className="rounded-2xl bg-violet-50 p-3 ring-1 ring-violet-200">
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">Retiros</p>
              <p className="mt-1 text-xl font-bold text-violet-900">{metrics.pickupOrders}</p>
              <p className="text-xs text-violet-700">{clp(metrics.pickupAmount)}</p>
            </article>
            <article className="rounded-2xl bg-blossom-50 p-3 ring-1 ring-blossom-200">
              <p className="text-xs font-semibold uppercase tracking-wide text-blossom-700">Ticket promedio</p>
              <p className="mt-1 text-xl font-bold text-blossom-700">
                {metrics.orders > 0 ? clp(metrics.amount / metrics.orders) : clp(0)}
              </p>
              <p className="text-xs text-blossom-700">Sobre tabla filtrada</p>
            </article>
          </div>
        </header>

        {loading ? <p className="text-sm text-slate-600">Cargando pedidos...</p> : null}
        {error ? <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}

        {!loading && !error ? (
          <>
            <OrderCards orders={filtered} />
            {view === 'table' ? <OrdersTable orders={filtered} /> : <OrdersCalendar orders={filtered} />}
          </>
        ) : null}
      </section>
    </main>
  );
}
