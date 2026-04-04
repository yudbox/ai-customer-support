import * as fs from "fs";
import * as path from "path";

import { faker } from "@faker-js/faker";
import { v4 as uuidv4 } from "uuid";

enum CustomerTier {
  VIP = "VIP",
  Regular = "Regular",
  New = "New",
}

interface Customer {
  id: string; // UUID
  email: string;
  name: string;
  tier: CustomerTier;
  total_orders: number;
  lifetime_value: number;
  total_spent: number;
  avg_order_value: number | null;
  created_at: string; // ISO timestamp
}

interface GenerateOptions {
  filename: string;
  vipCount: number;
  regularCount: number;
  newCount: number;
}

function parseArguments(): GenerateOptions {
  const args = process.argv.slice(2);

  const fileArg = args.find((arg) => arg.startsWith("--file="));
  const filename = fileArg
    ? fileArg.split("=")[1]
    : `customers-${new Date().toISOString().split("T")[0]}.json`;

  const vipArg = args.find((arg) => arg.startsWith("--vip="));
  const vipCount = vipArg ? parseInt(vipArg.split("=")[1], 10) : 30;

  const regularArg = args.find((arg) => arg.startsWith("--regular="));
  const regularCount = regularArg ? parseInt(regularArg.split("=")[1], 10) : 70;

  const newArg = args.find((arg) => arg.startsWith("--new="));
  const newCount = newArg ? parseInt(newArg.split("=")[1], 10) : 150;

  return { filename, vipCount, regularCount, newCount };
}

function generateCustomer(
  tier: CustomerTier,
  createdDaysAgo: number,
): Customer {
  const id = uuidv4();
  const email = faker.internet.email().toLowerCase();
  const name = faker.person.fullName();

  // Generate realistic data based on tier
  let total_orders: number;
  let total_spent: number;

  if (tier === CustomerTier.VIP) {
    total_orders = faker.number.int({ min: 20, max: 100 });
    total_spent = faker.number.float({
      min: 5000,
      max: 50000,
      fractionDigits: 2,
    });
  } else if (tier === CustomerTier.Regular) {
    total_orders = faker.number.int({ min: 5, max: 20 });
    total_spent = faker.number.float({
      min: 500,
      max: 5000,
      fractionDigits: 2,
    });
  } else {
    // New customers
    total_orders = faker.number.int({ min: 0, max: 4 });
    total_spent = faker.number.float({ min: 0, max: 500, fractionDigits: 2 });
  }

  const lifetime_value = parseFloat((total_spent * 1.2).toFixed(2)); // CLV = 1.2x total spent
  const avg_order_value =
    total_orders > 0
      ? parseFloat((total_spent / total_orders).toFixed(2))
      : null;

  // Created date (older customers more likely to be VIP)
  const created_at = new Date();
  created_at.setDate(created_at.getDate() - createdDaysAgo);

  return {
    id,
    email,
    name,
    tier,
    total_orders,
    lifetime_value,
    total_spent,
    avg_order_value,
    created_at: created_at.toISOString(),
  };
}

function generateCustomers(options: GenerateOptions): Customer[] {
  const { vipCount, regularCount, newCount } = options;
  const customers: Customer[] = [];

  // VIP customers (oldest, 1-3 years ago)
  for (let i = 0; i < vipCount; i++) {
    const daysAgo = faker.number.int({ min: 365, max: 1095 });
    customers.push(generateCustomer(CustomerTier.VIP, daysAgo));
  }

  // Regular customers (6 months - 1 year ago)
  for (let i = 0; i < regularCount; i++) {
    const daysAgo = faker.number.int({ min: 180, max: 365 });
    customers.push(generateCustomer(CustomerTier.Regular, daysAgo));
  }

  // New customers (0-6 months ago)
  for (let i = 0; i < newCount; i++) {
    const daysAgo = faker.number.int({ min: 0, max: 180 });
    customers.push(generateCustomer(CustomerTier.New, daysAgo));
  }

  // Shuffle to mix tiers
  return customers.sort(() => Math.random() - 0.5);
}

// Main execution
const options = parseArguments();
const customers = generateCustomers(options);
const outputPath = path.resolve(__dirname, "../data", options.filename);

// Ensure data directory exists
const dataDir = path.dirname(outputPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

fs.writeFileSync(outputPath, JSON.stringify(customers, null, 2), "utf-8");

console.log(`✅ Generated ${customers.length} customers`);
console.log(`   VIP: ${options.vipCount}`);
console.log(`   Regular: ${options.regularCount}`);
console.log(`   New: ${options.newCount}`);
console.log(`📂 File saved to: ${outputPath}`);
console.log(`\nUsage examples:`);
console.log(
  `  npm run generate:customers -- --file=customers.json --vip=30 --regular=70 --new=150`,
);
console.log(`  npm run generate:customers -- --vip=50 --regular=100 --new=200`);
