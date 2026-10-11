/** Pricing rules shared by the order, cart and invoice routes and jobs. */

export interface PricedItem {
  unitPrice: number;
  quantity: number;
}

const LARGE_ORDER_THRESHOLD = 500;
const LARGE_ORDER_RATE = 0.1;
const MEDIUM_ORDER_THRESHOLD = 200;
const MEDIUM_ORDER_RATE = 0.05;

/** Discount for an order subtotal, in the same currency units. */
export function calculateDiscount(items: PricedItem[]): number {
  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  if (subtotal >= LARGE_ORDER_THRESHOLD) return subtotal * LARGE_ORDER_RATE;
  if (subtotal >= MEDIUM_ORDER_THRESHOLD) return subtotal * MEDIUM_ORDER_RATE;
  return 0;
}

/** Formats an amount for display, e.g. `$1,234.50`. */
export function formatPrice(amount: number): string {
  return `$${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}
