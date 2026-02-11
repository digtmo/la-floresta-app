import type { ParsedOrder, WooOrder } from '../types';
import { parseSpanishDate } from './date';

const API_URL =
  import.meta.env.VITE_WC_ORDERS_URL ??
  'https://laflorestafloreria.cl/wp-json/wc/v3/orders?consumer_key=ck_a688b1675486ccea74d82a64eaccb1bc0b1e8675&consumer_secret=cs_20eb591b12abb24f6ed6cb85f8f9613e526bd33b';

function toLocalIso(date: Date): string {
  const tzOffsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - tzOffsetMs).toISOString().slice(0, 19);
}

function currentMonthRange(): { after: string; before: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0);
  return {
    after: toLocalIso(start),
    before: toLocalIso(nextMonthStart)
  };
}

function buildOrdersUrl(baseUrl: string, page: number): string {
  const url = new URL(baseUrl);
  const { after, before } = currentMonthRange();

  url.searchParams.set('per_page', '100');
  url.searchParams.set('page', String(page));
  url.searchParams.set('after', after);
  url.searchParams.set('before', before);
  url.searchParams.set('date_column', 'date_created');
  return url.toString();
}

function metaValue(meta: WooOrder['meta_data'], keys: string[]): string {
  for (const key of keys) {
    const found = meta.find((entry) => entry.key === key);
    if (found?.value !== undefined && found.value !== null) {
      return String(found.value).trim();
    }
  }
  return '';
}

function toName(first?: string, last?: string): string {
  return [first, last].filter(Boolean).join(' ').trim();
}

export function toParsedOrder(order: WooOrder): ParsedOrder {
  const deliveryDateLabel =
    metaValue(order.meta_data, ['Fecha de envío o retiro', '_orddd_lite_timestamp']) || 'Sin fecha';
  const deliverySlot =
    metaValue(order.meta_data, ['Horario de entrega', '_orddd_time_slot']) || 'Sin horario';
  const notes = metaValue(order.meta_data, ['shipping_mensaje', '_shipping_mensaje']);
  const observation = metaValue(order.meta_data, ['shipping_observaciones', '_shipping_observaciones']);
  const recipientPhone = metaValue(order.meta_data, ['shipping_telefono', '_shipping_telefono']) || 'Sin teléfono';
  const deliveryType = order.shipping_lines[0]?.method_title || 'No definido';
  const isPickup = /retiro|pickup/i.test(deliveryType);

  const parsedDate = parseSpanishDate(deliveryDateLabel);

  return {
    id: order.id,
    status: order.status,
    customerName: toName(order.billing.first_name, order.billing.last_name) || 'Sin nombre',
    customerPhone: order.billing.phone || 'Sin teléfono',
    customerEmail: order.billing.email || 'Sin email',
    recipientName: toName(order.shipping.first_name, order.shipping.last_name) || 'Sin destinatario',
    recipientPhone,
    isPickup,
    deliveryAddress: order.shipping.address_1 || '',
    deliveryType,
    deliveryDateLabel,
    deliveryDate: parsedDate,
    deliverySlot,
    total: Number(order.total),
    notes,
    observation,
    createdAt: new Date(order.date_created),
    items: order.line_items.map((item) => `${item.quantity} x ${item.name}`)
  };
}

export async function fetchOrders(): Promise<ParsedOrder[]> {
  const allOrders: WooOrder[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const response = await fetch(buildOrdersUrl(API_URL, page), {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`No se pudo cargar pedidos (${response.status})`);
    }

    const pageData = (await response.json()) as WooOrder[];
    allOrders.push(...pageData);

    const totalPagesHeader = response.headers.get('X-WP-TotalPages');
    if (totalPagesHeader) {
      totalPages = Number(totalPagesHeader) || 1;
    } else if (pageData.length < 100) {
      totalPages = page;
    } else {
      totalPages = page + 1;
    }

    page += 1;
  }

  console.log('WooCommerce orders (raw):', allOrders);

  return allOrders.map(toParsedOrder);
}

export const STATUS_LABELS: Record<string, string> = {
  processing: 'En proceso',
  completed: 'Completado',
  pending: 'Pendiente',
  cancelled: 'Cancelado',
  on_hold: 'En espera',
  refunded: 'Reembolsado',
  failed: 'Fallido'
};
