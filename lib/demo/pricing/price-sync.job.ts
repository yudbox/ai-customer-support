import { calculateDiscount, type PricedItem } from "./pricing";
import { cron } from "./runtime";

const CATALOG: PricedItem[] = [
  { unitPrice: 250, quantity: 1 },
  { unitPrice: 40, quantity: 5 },
];

export function syncPrices(): number {
  return calculateDiscount(CATALOG);
}

cron.schedule("*/15 * * * *", syncPrices);
