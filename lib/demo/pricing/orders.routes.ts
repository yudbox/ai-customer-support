import { calculateDiscount, type PricedItem } from "./pricing";
import { createRouter } from "./runtime";

const ORDERS: Record<string, PricedItem[]> = {
  "ord-1": [{ unitPrice: 120, quantity: 2 }],
};

export const router = createRouter();

export function getOrderPrice(params: Record<string, string>) {
  const items = ORDERS[params.id] ?? [];
  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  return { subtotal, discount: calculateDiscount(items) };
}

router.get("/orders/:id/price", getOrderPrice);
