import * as fs from "fs";
import * as path from "path";

import { faker } from "@faker-js/faker";
import { v4 as uuidv4 } from "uuid";

enum OrderStatus {
  PENDING = "pending",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
}

interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string; // UUID
  order_number: string;
  customer_id: string; // UUID from customers
  items: OrderItem[]; // JSONB
  total_price: number;
  status: OrderStatus;
  tracking_number: string | null;
  carrier: string | null;
  shipped_at: string | null;
  expected_delivery: string | null;
  created_at: string;
}

interface GenerateOptions {
  filename: string;
  count: number;
  customersFile: string;
  productsFile: string;
}

const carriers = ["FedEx", "UPS", "DHL", "USPS", "Amazon Logistics"];

function parseArguments(): GenerateOptions {
  const args = process.argv.slice(2);

  const fileArg = args.find((arg) => arg.startsWith("--file="));
  const filename = fileArg
    ? fileArg.split("=")[1]
    : `orders-${new Date().toISOString().split("T")[0]}.json`;

  const countArg = args.find((arg) => arg.startsWith("--count="));
  const count = countArg ? parseInt(countArg.split("=")[1], 10) : 500;

  const customersArg = args.find((arg) => arg.startsWith("--customers="));
  const customersFile = customersArg
    ? customersArg.split("=")[1]
    : "customers-2026-03-23.json";

  const productsArg = args.find((arg) => arg.startsWith("--products="));
  const productsFile = productsArg
    ? productsArg.split("=")[1]
    : "products-2026-03-24.json";

  return { filename, count, customersFile, productsFile };
}

interface CustomerRecord extends Record<string, unknown> {
  id: string;
}

interface ProductRecord extends Record<string, unknown> {
  id: string;
  name: string;
  price: number;
}

function loadCustomers(filename: string): string[] {
  const filePath = path.resolve(__dirname, "../data", filename);
  const data: CustomerRecord[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  return data.map((c) => c.id);
}

function loadProducts(
  filename: string,
): Array<{ id: string; name: string; price: number }> {
  const filePath = path.resolve(__dirname, "../data", filename);
  const data: ProductRecord[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  return data.map((p) => ({ id: p.id, name: p.name, price: p.price }));
}

function generateOrderNumber(index: number): string {
  const year = new Date().getFullYear();
  const num = String(index).padStart(6, "0");
  return `ORD-${year}-${num}`;
}

function generateTrackingNumber(): string {
  const prefix = faker.helpers.arrayElement(["1Z", "FX", "DH", "US", "TBA"]);
  const num = faker.string.alphanumeric(12).toUpperCase();
  return `${prefix}${num}`;
}

function generateOrder(
  index: number,
  customerIds: string[],
  products: Array<{ id: string; name: string; price: number }>,
): Order {
  const id = uuidv4();
  const order_number = generateOrderNumber(index);
  const customer_id = faker.helpers.arrayElement(customerIds);

  // Generate 1-3 items per order
  const itemCount = faker.number.int({ min: 1, max: 3 });
  const selectedProducts = faker.helpers.arrayElements(products, itemCount);

  const items: OrderItem[] = selectedProducts.map((product) => ({
    product_id: product.id,
    product_name: product.name,
    quantity: faker.number.int({ min: 1, max: 3 }),
    price: product.price,
  }));

  const total_price = parseFloat(
    items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2),
  );

  // Realistic status distribution
  const statusRandom = Math.random();
  let status: OrderStatus;
  if (statusRandom < 0.5) {
    status = OrderStatus.DELIVERED;
  } else if (statusRandom < 0.75) {
    status = OrderStatus.SHIPPED;
  } else if (statusRandom < 0.9) {
    status = OrderStatus.PENDING;
  } else {
    status = OrderStatus.CANCELLED;
  }

  const tracking_number =
    status !== OrderStatus.PENDING && status !== OrderStatus.CANCELLED
      ? generateTrackingNumber()
      : null;

  const carrier = tracking_number ? faker.helpers.arrayElement(carriers) : null;

  // Created date (last 6 months)
  const created_at = faker.date.recent({ days: 180 });

  let shipped_at: Date | null = null;
  let expected_delivery: Date | null = null;

  if (status === OrderStatus.SHIPPED || status === OrderStatus.DELIVERED) {
    shipped_at = new Date(created_at);
    shipped_at.setDate(
      shipped_at.getDate() + faker.number.int({ min: 1, max: 3 }),
    );

    expected_delivery = new Date(shipped_at);
    expected_delivery.setDate(
      expected_delivery.getDate() + faker.number.int({ min: 3, max: 7 }),
    );
  }

  return {
    id,
    order_number,
    customer_id,
    items,
    total_price,
    status,
    tracking_number,
    carrier,
    shipped_at: shipped_at?.toISOString() || null,
    expected_delivery: expected_delivery?.toISOString().split("T")[0] || null,
    created_at: created_at.toISOString(),
  };
}

function generateOrders(
  options: GenerateOptions,
  customerIds: string[],
  products: Array<{ id: string; name: string; price: number }>,
): Order[] {
  const { count } = options;
  const orders: Order[] = [];

  for (let i = 1; i <= count; i++) {
    orders.push(generateOrder(i, customerIds, products));
  }

  // Sort by created_at (oldest first)
  return orders.sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
}

// Main execution
const options = parseArguments();

console.log("📖 Loading existing data...");
const customerIds = loadCustomers(options.customersFile);
const products = loadProducts(options.productsFile);

console.log(`   Customers: ${customerIds.length}`);
console.log(`   Products: ${products.length}`);

const orders = generateOrders(options, customerIds, products);
const outputPath = path.resolve(__dirname, "../data", options.filename);

// Ensure data directory exists
const dataDir = path.dirname(outputPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

fs.writeFileSync(outputPath, JSON.stringify(orders, null, 2), "utf-8");

const statusCounts = {
  pending: orders.filter((o) => o.status === OrderStatus.PENDING).length,
  shipped: orders.filter((o) => o.status === OrderStatus.SHIPPED).length,
  delivered: orders.filter((o) => o.status === OrderStatus.DELIVERED).length,
  cancelled: orders.filter((o) => o.status === OrderStatus.CANCELLED).length,
};

console.log(`✅ Generated ${orders.length} orders`);
console.log(`   Pending: ${statusCounts.pending}`);
console.log(`   Shipped: ${statusCounts.shipped}`);
console.log(`   Delivered: ${statusCounts.delivered}`);
console.log(`   Cancelled: ${statusCounts.cancelled}`);
console.log(`📂 File saved to: ${outputPath}`);
console.log(`\nUsage:`);
console.log(`  npx tsx scripts/generate-orders.ts`);
console.log(`  npx tsx scripts/generate-orders.ts -- --count=500`);
console.log(
  `  npx tsx scripts/generate-orders.ts -- --customers=customers.json --products=products.json`,
);
