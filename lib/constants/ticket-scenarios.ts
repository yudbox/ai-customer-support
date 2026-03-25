/**
 * Predefined ticket scenarios for quick form filling and demo purposes.
 * Based on UI_ARCHITECTURE_SECTION.md specifications.
 */

export interface TicketScenario {
  id: string;
  icon: string;
  label: string;
  email: string;
  subject: string;
  body: string;
  order_number?: string;
  expectedPriority: "critical" | "high" | "medium" | "low";
  expectedCategory: string;
}

export const ticketScenarios: TicketScenario[] = [
  {
    id: "vip-angry-delayed",
    icon: "🚨",
    label: "VIP злой - заказ задержан",
    email: "john.vip@walmart.com",
    subject: "Where is my order?! This is unacceptable!",
    body: "I ordered an iPhone case 10 days ago for $450 (Order #ORD-20260315-1234). The tracking hasn't updated in over a week and I still haven't received it. This is completely unacceptable! I've been a loyal VIP customer for years with 145 orders and I expect much better service. I need this resolved IMMEDIATELY or I will take my business elsewhere!",
    order_number: "ORD-20260315-1234",
    expectedPriority: "critical",
    expectedCategory: "Order Status / Delayed",
  },
  {
    id: "regular-angry-damaged",
    icon: "😡",
    label: "Обычный злой - товар поврежден",
    email: "sarah.customer@gmail.com",
    subject: "Received damaged product - very disappointed",
    body: "I just received my order (Order #ORD-20260318-5678) and the product is completely damaged! The box was crushed and the item inside is broken. I paid good money for this and I'm extremely disappointed. This is not the quality I expected. I want a full refund or replacement immediately. Very poor packaging on your part.",
    order_number: "ORD-20260318-5678",
    expectedPriority: "high",
    expectedCategory: "Product Quality / Damaged",
  },
  {
    id: "regular-question-product",
    icon: "😊",
    label: "Обычный вопрос - о продукте",
    email: "mike.buyer@yahoo.com",
    subject: "Question about iPhone case compatibility",
    body: "Hi, I'm interested in purchasing the Premium iPhone Case (SKU #PRD-789). Could you please confirm if it's compatible with the iPhone 15 Pro Max? I want to make sure it fits properly before ordering. Also, does it support MagSafe charging? Thanks for your help!",
    expectedPriority: "low",
    expectedCategory: "Product Question",
  },
  {
    id: "new-customer-shipping",
    icon: "🆕",
    label: "Новый клиент - про доставку",
    email: "emily.newcomer@hotmail.com",
    subject: "Shipping options and delivery time question",
    body: "Hello! I'm a new customer and I'm planning to make my first order. I'd like to know what shipping options are available and how long delivery typically takes. Is express shipping available? Also, do you ship internationally? I'm located in California. Looking forward to hearing from you!",
    expectedPriority: "low",
    expectedCategory: "Shipping / Delivery Question",
  },
  {
    id: "bug-website",
    icon: "🐛",
    label: "Баг - сайт не работает",
    email: "tech.user@outlook.com",
    subject: "Website checkout not working - technical issue",
    body: "I'm trying to complete my purchase but the checkout page keeps crashing. When I click 'Proceed to Payment', I get an error message saying 'Something went wrong' and the page refreshes. I've tried on both Chrome and Safari, cleared my cache, but the problem persists. My cart has 3 items totaling $230. Can you please fix this ASAP? I need to complete this order today.",
    expectedPriority: "medium",
    expectedCategory: "Technical Issue / Bug",
  },
  {
    id: "payment-double-charge",
    icon: "💳",
    label: "Оплата - списали дважды",
    email: "concerned.buyer@icloud.com",
    subject: "URGENT: Double charged for my order!",
    body: "I just checked my bank statement and I've been charged TWICE for the same order (Order #ORD-20260320-9999)! I placed one order for $125.50 but my card shows two charges of $125.50 each. This is a serious error. I need one of these charges refunded immediately. Please investigate and confirm the refund date. This is causing issues with my account balance.",
    order_number: "ORD-20260320-9999",
    expectedPriority: "high",
    expectedCategory: "Payment Issue / Double Charge",
  },
];

/**
 * Get scenario by ID
 */
export function getScenarioById(id: string): TicketScenario | undefined {
  return ticketScenarios.find((scenario) => scenario.id === id);
}

/**
 * Get select options for dropdown
 */
export function getScenarioOptions() {
  return ticketScenarios.map((scenario) => ({
    value: scenario.id,
    label: scenario.label,
    icon: scenario.icon,
  }));
}
