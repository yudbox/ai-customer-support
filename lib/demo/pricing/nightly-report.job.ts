import { formatPrice } from "./pricing";
import { cron } from "./runtime";

const DAILY_REVENUE = { orders: 420, subscriptions: 1310.25, refunds: -87.5 };

export function buildNightlyReport(): string {
  const total = Object.values(DAILY_REVENUE).reduce((sum, v) => sum + v, 0);
  return `Revenue for the day: ${formatPrice(total)}`;
}

cron.schedule("0 3 * * *", buildNightlyReport);
