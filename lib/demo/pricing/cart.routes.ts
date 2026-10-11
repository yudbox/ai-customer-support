import { calculateDiscount, type PricedItem } from "./pricing";
import { createRouter } from "./runtime";

const cart: PricedItem[] = [{ unitPrice: 80, quantity: 3 }];

export const router = createRouter();

export function getCartTotal() {
  return {
    items: cart.length,
    total: cart.reduce((s, i) => s + i.unitPrice * i.quantity, 0),
  };
}

export function checkout() {
  const total = cart.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  return { charged: total - calculateDiscount(cart) };
}

router.get("/cart/total", getCartTotal);
router.post("/cart/checkout", checkout);
