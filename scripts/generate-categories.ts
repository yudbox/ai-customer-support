import * as fs from "fs";
import * as path from "path";

import { v4 as uuidv4 } from "uuid";

interface Category {
  id: string; // UUID
  name: string;
  parent_category: string | null;
  assigned_team: string;
  sla_hours: number;
  priority_boost: number;
  keywords: string[]; // simple-array
}

interface GenerateOptions {
  filename: string;
}

const categoryConfigs = [
  // Main categories
  {
    name: "Technical Issues",
    parent_category: null,
    assigned_team: "Technical Support",
    sla_hours: 4,
    priority_boost: 10,
    keywords: [
      "error",
      "bug",
      "broken",
      "not working",
      "crash",
      "freeze",
      "technical",
      "problem",
    ],
  },
  {
    name: "Payment Problems",
    parent_category: null,
    assigned_team: "Billing & Payments",
    sla_hours: 2,
    priority_boost: 15,
    keywords: [
      "payment",
      "charge",
      "billing",
      "invoice",
      "card",
      "failed",
      "declined",
      "refund payment",
    ],
  },
  {
    name: "Refund Requests",
    parent_category: null,
    assigned_team: "Returns & Refunds",
    sla_hours: 24,
    priority_boost: 5,
    keywords: [
      "refund",
      "return",
      "money back",
      "cancel order",
      "unsatisfied",
      "disappointed",
    ],
  },
  {
    name: "Product Quality",
    parent_category: null,
    assigned_team: "Product Issues",
    sla_hours: 12,
    priority_boost: 8,
    keywords: [
      "defective",
      "damaged",
      "quality",
      "faulty",
      "malfunction",
      "warranty",
      "broken product",
    ],
  },
  {
    name: "Shipping Delays",
    parent_category: null,
    assigned_team: "Shipping & Delivery",
    sla_hours: 8,
    priority_boost: 7,
    keywords: [
      "shipping",
      "delivery",
      "tracking",
      "lost package",
      "delayed",
      "not arrived",
      "where is my order",
    ],
  },
  {
    name: "Account Issues",
    parent_category: null,
    assigned_team: "Account Management",
    sla_hours: 6,
    priority_boost: 5,
    keywords: [
      "account",
      "login",
      "password",
      "email",
      "profile",
      "access",
      "locked account",
    ],
  },
  // Subcategories - Technical Issues
  {
    name: "App Not Loading",
    parent_category: "Technical Issues",
    assigned_team: "Technical Support",
    sla_hours: 2,
    priority_boost: 12,
    keywords: ["app", "not loading", "stuck", "wont open", "loading screen"],
  },
  {
    name: "Feature Not Working",
    parent_category: "Technical Issues",
    assigned_team: "Technical Support",
    sla_hours: 6,
    priority_boost: 8,
    keywords: ["feature", "button", "function", "doesnt work", "cant use"],
  },
  // Subcategories - Payment Problems
  {
    name: "Card Declined",
    parent_category: "Payment Problems",
    assigned_team: "Billing & Payments",
    sla_hours: 1,
    priority_boost: 20,
    keywords: ["card declined", "payment failed", "transaction", "cant pay"],
  },
  {
    name: "Double Charge",
    parent_category: "Payment Problems",
    assigned_team: "Billing & Payments",
    sla_hours: 2,
    priority_boost: 18,
    keywords: [
      "double charge",
      "charged twice",
      "duplicate payment",
      "extra charge",
    ],
  },
  // Subcategories - Refund Requests
  {
    name: "Defective Product Return",
    parent_category: "Refund Requests",
    assigned_team: "Returns & Refunds",
    sla_hours: 12,
    priority_boost: 10,
    keywords: [
      "defective return",
      "broken return",
      "faulty return",
      "want refund",
    ],
  },
  {
    name: "Changed Mind",
    parent_category: "Refund Requests",
    assigned_team: "Returns & Refunds",
    sla_hours: 48,
    priority_boost: 2,
    keywords: ["changed mind", "dont want", "wrong item", "return policy"],
  },
  // Subcategories - Product Quality
  {
    name: "Product Damaged on Arrival",
    parent_category: "Product Quality",
    assigned_team: "Product Issues",
    sla_hours: 8,
    priority_boost: 12,
    keywords: [
      "damaged arrival",
      "broken box",
      "cracked",
      "dented",
      "shipping damage",
    ],
  },
  {
    name: "Missing Parts",
    parent_category: "Product Quality",
    assigned_team: "Product Issues",
    sla_hours: 12,
    priority_boost: 9,
    keywords: ["missing parts", "incomplete", "parts missing", "wheres the"],
  },
  // Subcategories - Shipping Delays
  {
    name: "Package Lost",
    parent_category: "Shipping Delays",
    assigned_team: "Shipping & Delivery",
    sla_hours: 4,
    priority_boost: 15,
    keywords: [
      "lost package",
      "never arrived",
      "missing delivery",
      "cant find package",
    ],
  },
  {
    name: "Wrong Address",
    parent_category: "Shipping Delays",
    assigned_team: "Shipping & Delivery",
    sla_hours: 6,
    priority_boost: 10,
    keywords: [
      "wrong address",
      "incorrect address",
      "change address",
      "update shipping",
    ],
  },
  // Subcategories - Account Issues
  {
    name: "Cannot Login",
    parent_category: "Account Issues",
    assigned_team: "Account Management",
    sla_hours: 3,
    priority_boost: 8,
    keywords: ["cant login", "login failed", "wrong password", "locked out"],
  },
  {
    name: "Email Change Request",
    parent_category: "Account Issues",
    assigned_team: "Account Management",
    sla_hours: 12,
    priority_boost: 3,
    keywords: ["change email", "update email", "new email", "email address"],
  },
];

function parseArguments(): GenerateOptions {
  const args = process.argv.slice(2);

  const fileArg = args.find((arg) => arg.startsWith("--file="));
  const filename = fileArg
    ? fileArg.split("=")[1]
    : `categories-${new Date().toISOString().split("T")[0]}.json`;

  return { filename };
}

function generateCategories(): Category[] {
  return categoryConfigs.map((config) => ({
    id: uuidv4(),
    name: config.name,
    parent_category: config.parent_category,
    assigned_team: config.assigned_team,
    sla_hours: config.sla_hours,
    priority_boost: config.priority_boost,
    keywords: config.keywords,
  }));
}

// Main execution
const options = parseArguments();
const categories = generateCategories();
const outputPath = path.resolve(__dirname, "../data", options.filename);

// Ensure data directory exists
const dataDir = path.dirname(outputPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

fs.writeFileSync(outputPath, JSON.stringify(categories, null, 2), "utf-8");

const mainCategories = categories.filter((c) => !c.parent_category);
const subCategories = categories.filter((c) => c.parent_category);

console.log(`✅ Generated ${categories.length} categories`);
console.log(`   Main: ${mainCategories.length}`);
console.log(`   Subcategories: ${subCategories.length}`);
console.log(`📂 File saved to: ${outputPath}`);
console.log(`\nMain Categories:`);
mainCategories.forEach((cat) => {
  const subs = subCategories.filter((s) => s.parent_category === cat.name);
  console.log(
    `   - ${cat.name} (${subs.length} subcategories, SLA: ${cat.sla_hours}h)`,
  );
});
console.log(`\nUsage:`);
console.log(`  tsx scripts/generate-categories.ts`);
console.log(`  tsx scripts/generate-categories.ts -- --file=categories.json`);
