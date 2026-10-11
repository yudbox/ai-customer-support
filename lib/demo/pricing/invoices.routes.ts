import { formatPrice } from "./pricing";
import { createRouter } from "./runtime";

const INVOICES: Record<string, number> = { "inv-1": 1234.5 };

export const router = createRouter();

export function getInvoice(params: Record<string, string>) {
  const amount = INVOICES[params.id] ?? 0;
  return { id: params.id, amount: formatPrice(amount) };
}

router.get("/invoices/:id", getInvoice);
