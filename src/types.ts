export type WooOrder = {
  id: number;
  status: string;
  total: string;
  currency: string;
  date_created: string;
  date_paid: string | null;
  billing: {
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
  };
  shipping: {
    first_name: string;
    last_name: string;
    address_1: string;
  };
  line_items: Array<{
    id: number;
    name: string;
    quantity: number;
  }>;
  shipping_lines: Array<{
    method_title: string;
    total: string;
  }>;
  meta_data: Array<{
    key: string;
    value: unknown;
  }>;
};

export type ParsedOrder = {
  id: number;
  status: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  recipientName: string;
  recipientPhone: string;
  isPickup: boolean;
  deliveryAddress: string;
  deliveryType: string;
  deliveryDateLabel: string;
  deliveryDate: Date | null;
  deliverySlot: string;
  total: number;
  notes: string;
  observation: string;
  createdAt: Date;
  items: string[];
};
