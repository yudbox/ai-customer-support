/** Pricing rules shared by the order, cart and invoice routes and jobs. */

export interface PricedItem {
  unitPrice: number;
  quantity: number;
}

const LARGE_ORDER_THRESHOLD = 1000;
const LARGE_ORDER_RATE = 0.15;
const MEDIUM_ORDER_THRESHOLD = 300;
const MEDIUM_ORDER_RATE = 0.07;
const BULK_QUANTITY = 10;
const BULK_BONUS_RATE = 0.02;

/**
 * Discount for an order subtotal, in the same currency units.
 * Tiered by subtotal, plus a bulk bonus when any line has 10+ units.
 */
export function calculateDiscount(items: PricedItem[]): number {
  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const hasBulkLine = items.some((i) => i.quantity >= BULK_QUANTITY);
  const bulkBonus = hasBulkLine ? BULK_BONUS_RATE : 0;

  if (subtotal >= LARGE_ORDER_THRESHOLD) {
    return subtotal * (LARGE_ORDER_RATE + bulkBonus);
  }
  if (subtotal >= MEDIUM_ORDER_THRESHOLD) {
    return subtotal * (MEDIUM_ORDER_RATE + bulkBonus);
  }
  return subtotal * bulkBonus;
}

/** Formats an amount for display, e.g. `$1,234.50` or `€1,234.50`. */
export function formatPrice(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    amount,
  );
}
