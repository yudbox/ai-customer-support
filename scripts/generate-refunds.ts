import * as fs from "fs";
import * as path from "path";

import { faker } from "@faker-js/faker";
import { v4 as uuidv4 } from "uuid";

enum RefundStatus {
  PENDING = "pending",
  SUCCEEDED = "succeeded",
  FAILED = "failed",
}

interface Refund {
  id: string; // UUID
  order_id: string; // UUID from orders
  ticket_id: string | null; // UUID from tickets (nullable)
  amount: number;
  reason: string;
  status: RefundStatus;
  initiated_by: string;
  created_at: string;
}

interface GenerateOptions {
  filename: string;
  count: number;
  ordersFile: string;
  ticketsFile: string;
}

const refundReasons = [
  "Product defective on arrival",
  "Wrong item received",
  "Item not as described",
  "Changed mind / no longer needed",
  "Found better price elsewhere",
  "Duplicate order",
  "Product damaged during shipping",
  "Missing parts",
  "Quality not as expected",
  "Size/fit issue",
];

const agentNames = [
  "John Smith",
  "Sarah Johnson",
  "Mike Chen",
  "Emily Davis",
  "Lisa Anderson",
  "Tom Wilson",
  "System Auto-refund",
];

function parseArguments(): GenerateOptions {
  const args = process.argv.slice(2);

  const fileArg = args.find((arg) => arg.startsWith("--file="));
  const filename = fileArg
    ? fileArg.split("=")[1]
    : `refunds-${new Date().toISOString().split("T")[0]}.json`;

  const countArg = args.find((arg) => arg.startsWith("--count="));
  const count = countArg ? parseInt(countArg.split("=")[1], 10) : 50;

  const ordersArg = args.find((arg) => arg.startsWith("--orders="));
  const ordersFile = ordersArg
    ? ordersArg.split("=")[1]
    : "orders-2026-03-24.json";

  const ticketsArg = args.find((arg) => arg.startsWith("--tickets="));
  const ticketsFile = ticketsArg
    ? ticketsArg.split("=")[1]
    : "tickets-2026-03-24.json";

  return { filename, count, ordersFile, ticketsFile };
}

function loadOrders(
  filename: string,
): Array<{ id: string; total_price: number }> {
  const filePath = path.resolve(__dirname, "../data", filename);
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  return data.map((o: any) => ({ id: o.id, total_price: o.total_price }));
}

function loadTickets(filename: string): string[] {
  const filePath = path.resolve(__dirname, "../data", filename);
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  // Only tickets with order_id (refunds связаны с orders)
  return data.filter((t: any) => t.order_id !== null).map((t: any) => t.id);
}

function generateRefund(
  orders: Array<{ id: string; total_price: number }>,
  ticketIds: string[],
): Refund {
  const id = uuidv4();
  const order = faker.helpers.arrayElement(orders);
  const order_id = order.id;

  // 80% refunds связаны с ticket
  const ticket_id =
    Math.random() < 0.8 && ticketIds.length > 0
      ? faker.helpers.arrayElement(ticketIds)
      : null;

  // Refund amount: обычно полная сумма или частичная
  const isPartialRefund = Math.random() < 0.3;
  const amount = isPartialRefund
    ? parseFloat(
        (
          order.total_price *
          faker.number.float({ min: 0.3, max: 0.7, fractionDigits: 2 })
        ).toFixed(2),
      )
    : order.total_price;

  const reason = faker.helpers.arrayElement(refundReasons);

  // Status distribution: 70% succeeded, 20% pending, 10% failed
  const statusRandom = Math.random();
  let status: RefundStatus;
  if (statusRandom < 0.7) {
    status = RefundStatus.SUCCEEDED;
  } else if (statusRandom < 0.9) {
    status = RefundStatus.PENDING;
  } else {
    status = RefundStatus.FAILED;
  }

  const initiated_by = faker.helpers.arrayElement(agentNames);

  // Created date (last 3 months)
  const created_at = faker.date.recent({ days: 90 });

  return {
    id,
    order_id,
    ticket_id,
    amount,
    reason,
    status,
    initiated_by,
    created_at: created_at.toISOString(),
  };
}

function generateRefunds(
  options: GenerateOptions,
  orders: Array<{ id: string; total_price: number }>,
  ticketIds: string[],
): Refund[] {
  const { count } = options;
  const refunds: Refund[] = [];

  for (let i = 0; i < count; i++) {
    refunds.push(generateRefund(orders, ticketIds));
  }

  // Sort by created_at
  return refunds.sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
}

// Main execution
const options = parseArguments();

console.log("📖 Loading existing data...");
const orders = loadOrders(options.ordersFile);
const ticketIds = loadTickets(options.ticketsFile);

console.log(`   Orders: ${orders.length}`);
console.log(`   Tickets with order_id: ${ticketIds.length}`);

const refunds = generateRefunds(options, orders, ticketIds);
const outputPath = path.resolve(__dirname, "../data", options.filename);

// Ensure data directory exists
const dataDir = path.dirname(outputPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

fs.writeFileSync(outputPath, JSON.stringify(refunds, null, 2), "utf-8");

const statusCounts = {
  pending: refunds.filter((r) => r.status === RefundStatus.PENDING).length,
  succeeded: refunds.filter((r) => r.status === RefundStatus.SUCCEEDED).length,
  failed: refunds.filter((r) => r.status === RefundStatus.FAILED).length,
};

const withTickets = refunds.filter((r) => r.ticket_id !== null).length;
const totalAmount = refunds.reduce((sum, r) => sum + r.amount, 0);

console.log(`✅ Generated ${refunds.length} refunds`);
console.log(`   Pending: ${statusCounts.pending}`);
console.log(`   Succeeded: ${statusCounts.succeeded}`);
console.log(`   Failed: ${statusCounts.failed}`);
console.log(
  `   With ticket_id: ${withTickets} (${Math.round((withTickets / refunds.length) * 100)}%)`,
);
console.log(`   Total amount: $${totalAmount.toFixed(2)}`);
console.log(`📂 File saved to: ${outputPath}`);
console.log(`\nUsage:`);
console.log(`  npx tsx scripts/generate-refunds.ts`);
console.log(`  npx tsx scripts/generate-refunds.ts -- --count=50`);
console.log(
  `  npx tsx scripts/generate-refunds.ts -- --orders=orders.json --tickets=tickets.json`,
);
