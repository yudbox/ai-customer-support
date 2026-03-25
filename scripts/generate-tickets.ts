import * as fs from "fs";
import * as path from "path";
import { faker } from "@faker-js/faker";
import { v4 as uuidv4 } from "uuid";

enum TicketStatus {
  OPEN = "open",
  IN_PROGRESS = "in_progress",
  PENDING_APPROVAL = "pending_approval",
  RESOLVED = "resolved",
  CLOSED = "closed",
}

enum TicketPriority {
  CRITICAL = "critical",
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
}

enum SentimentLabel {
  ANGRY = "ANGRY",
  NEUTRAL = "NEUTRAL",
  POSITIVE = "POSITIVE",
}

interface Ticket {
  id: string; // UUID
  ticket_number: string;
  customer_id: string; // UUID from customers
  order_id: string | null; // UUID from orders (nullable)
  subject: string;
  body: string;
  category: string | null;
  subcategory: string | null;
  sentiment_label: SentimentLabel | null;
  sentiment_score: number | null; // -1 to 1
  priority: TicketPriority | null;
  priority_score: number | null; // 1-100
  status: TicketStatus;
  assigned_to: string | null;
  assigned_team: string | null;
  resolution: string | null;
  time_to_resolve_minutes: number | null;
  created_at: string;
  resolved_at: string | null;
}

interface Category {
  name: string;
  parent_category: string | null;
  assigned_team: string;
  sla_hours: number;
  priority_boost: number;
  keywords: string[];
}

interface GenerateOptions {
  filename: string;
  count: number;
  customersFile: string;
  ordersFile: string;
  categoriesFile: string;
}

const agentNames = [
  "John Smith",
  "Sarah Johnson",
  "Mike Chen",
  "Emily Davis",
  "Alex Kumar",
  "Lisa Anderson",
  "Tom Wilson",
  "Maria Garcia",
];

function parseArguments(): GenerateOptions {
  const args = process.argv.slice(2);

  const fileArg = args.find((arg) => arg.startsWith("--file="));
  const filename = fileArg
    ? fileArg.split("=")[1]
    : `tickets-${new Date().toISOString().split("T")[0]}.json`;

  const countArg = args.find((arg) => arg.startsWith("--count="));
  const count = countArg ? parseInt(countArg.split("=")[1], 10) : 200;

  const customersArg = args.find((arg) => arg.startsWith("--customers="));
  const customersFile = customersArg
    ? customersArg.split("=")[1]
    : "customers-2026-03-23.json";

  const ordersArg = args.find((arg) => arg.startsWith("--orders="));
  const ordersFile = ordersArg
    ? ordersArg.split("=")[1]
    : "orders-2026-03-24.json";

  const categoriesArg = args.find((arg) => arg.startsWith("--categories="));
  const categoriesFile = categoriesArg
    ? categoriesArg.split("=")[1]
    : "categories-2026-03-24.json";

  return { filename, count, customersFile, ordersFile, categoriesFile };
}

function loadCustomers(filename: string): string[] {
  const filePath = path.resolve(__dirname, "../data", filename);
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  return data.map((c: any) => c.id);
}

function loadOrders(filename: string): string[] {
  const filePath = path.resolve(__dirname, "../data", filename);
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  return data.map((o: any) => o.id);
}

function loadCategories(filename: string): Category[] {
  const filePath = path.resolve(__dirname, "../data", filename);
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function generateTicketNumber(index: number): string {
  const year = new Date().getFullYear();
  const num = String(index).padStart(6, "0");
  return `TKT-${year}-${num}`;
}

function selectCategory(categories: Category[]): {
  category: string;
  subcategory: string | null;
  assigned_team: string;
  priority_boost: number;
  keywords: string[];
} {
  // 70% chance to have subcategory, 30% main category only
  const useSubcategory = Math.random() < 0.7;

  const subcategories = categories.filter((c) => c.parent_category !== null);
  const mainCategories = categories.filter((c) => c.parent_category === null);

  if (useSubcategory && subcategories.length > 0) {
    const subcat = faker.helpers.arrayElement(subcategories);
    return {
      category: subcat.parent_category!,
      subcategory: subcat.name,
      assigned_team: subcat.assigned_team,
      priority_boost: subcat.priority_boost,
      keywords: subcat.keywords,
    };
  } else {
    const maincat = faker.helpers.arrayElement(mainCategories);
    return {
      category: maincat.name,
      subcategory: null,
      assigned_team: maincat.assigned_team,
      priority_boost: maincat.priority_boost,
      keywords: maincat.keywords,
    };
  }
}

function generateSubjectAndBody(keywords: string[]): {
  subject: string;
  body: string;
} {
  const keyword = faker.helpers.arrayElement(keywords);

  const subjects = [
    `Issue with ${keyword}`,
    `Problem: ${keyword}`,
    `Help needed - ${keyword}`,
    `Question about ${keyword}`,
    `Urgent: ${keyword}`,
    `${keyword} - need assistance`,
  ];

  const bodies = [
    `I'm experiencing ${keyword}. Can you please help me resolve this issue as soon as possible?`,
    `Hello, I have a problem with ${keyword}. This has been ongoing and I need immediate assistance.`,
    `Hi support team, ${keyword} is causing me issues. Please advise on how to proceed.`,
    `I need help with ${keyword}. This is affecting my experience and I would appreciate a quick resolution.`,
    `There's an issue related to ${keyword}. Can someone from your team look into this urgently?`,
  ];

  return {
    subject: faker.helpers.arrayElement(subjects),
    body: faker.helpers.arrayElement(bodies),
  };
}

function calculatePriorityScore(
  sentiment: SentimentLabel,
  categoryBoost: number,
): { priority: TicketPriority; score: number } {
  let baseScore = 50;

  // Sentiment impact
  if (sentiment === SentimentLabel.ANGRY) {
    baseScore += 30;
  } else if (sentiment === SentimentLabel.NEUTRAL) {
    baseScore += 10;
  }

  // Category boost
  baseScore += categoryBoost;

  // Random variation
  baseScore += faker.number.int({ min: -10, max: 10 });

  // Clamp to 1-100
  const score = Math.max(1, Math.min(100, baseScore));

  let priority: TicketPriority;
  if (score >= 80) {
    priority = TicketPriority.CRITICAL;
  } else if (score >= 60) {
    priority = TicketPriority.HIGH;
  } else if (score >= 40) {
    priority = TicketPriority.MEDIUM;
  } else {
    priority = TicketPriority.LOW;
  }

  return { priority, score };
}

function generateTicket(
  index: number,
  customerIds: string[],
  orderIds: string[],
  categories: Category[],
): Ticket {
  const id = uuidv4();
  const ticket_number = generateTicketNumber(index);
  const customer_id = faker.helpers.arrayElement(customerIds);

  // 70% of tickets have order_id
  const order_id =
    Math.random() < 0.7 ? faker.helpers.arrayElement(orderIds) : null;

  const categoryInfo = selectCategory(categories);
  const { subject, body } = generateSubjectAndBody(categoryInfo.keywords);

  // Sentiment
  const sentimentRandom = Math.random();
  let sentiment_label: SentimentLabel;
  let sentiment_score: number;

  if (sentimentRandom < 0.3) {
    sentiment_label = SentimentLabel.ANGRY;
    sentiment_score = parseFloat(
      faker.number.float({ min: -1, max: -0.3, fractionDigits: 2 }).toFixed(2),
    );
  } else if (sentimentRandom < 0.8) {
    sentiment_label = SentimentLabel.NEUTRAL;
    sentiment_score = parseFloat(
      faker.number.float({ min: -0.3, max: 0.3, fractionDigits: 2 }).toFixed(2),
    );
  } else {
    sentiment_label = SentimentLabel.POSITIVE;
    sentiment_score = parseFloat(
      faker.number.float({ min: 0.3, max: 1, fractionDigits: 2 }).toFixed(2),
    );
  }

  const { priority, score: priority_score } = calculatePriorityScore(
    sentiment_label,
    categoryInfo.priority_boost,
  );

  // Status distribution: 10% open, 20% in_progress, 5% pending_approval, 50% resolved, 15% closed
  const statusRandom = Math.random();
  let status: TicketStatus;
  if (statusRandom < 0.1) {
    status = TicketStatus.OPEN;
  } else if (statusRandom < 0.3) {
    status = TicketStatus.IN_PROGRESS;
  } else if (statusRandom < 0.35) {
    status = TicketStatus.PENDING_APPROVAL;
  } else if (statusRandom < 0.85) {
    status = TicketStatus.RESOLVED;
  } else {
    status = TicketStatus.CLOSED;
  }

  const assigned_to =
    status !== TicketStatus.OPEN
      ? faker.helpers.arrayElement(agentNames)
      : null;
  const assigned_team =
    status !== TicketStatus.OPEN ? categoryInfo.assigned_team : null;

  const created_at = faker.date.recent({ days: 90 });

  let resolved_at: Date | null = null;
  let time_to_resolve_minutes: number | null = null;
  let resolution: string | null = null;

  if (status === TicketStatus.RESOLVED || status === TicketStatus.CLOSED) {
    const resolutionDays = faker.number.int({ min: 1, max: 7 });
    resolved_at = new Date(created_at);
    resolved_at.setDate(resolved_at.getDate() + resolutionDays);

    time_to_resolve_minutes =
      resolutionDays * 24 * 60 + faker.number.int({ min: 0, max: 1440 });

    resolution = faker.helpers.arrayElement([
      "Issue resolved successfully. Customer satisfied.",
      "Problem fixed after investigation. Closed ticket.",
      "Solution provided and confirmed by customer.",
      "Root cause identified and corrected.",
      "Customer request completed as per requirements.",
    ]);
  }

  return {
    id,
    ticket_number,
    customer_id,
    order_id,
    subject,
    body,
    category: categoryInfo.category,
    subcategory: categoryInfo.subcategory,
    sentiment_label,
    sentiment_score,
    priority,
    priority_score,
    status,
    assigned_to,
    assigned_team,
    resolution,
    time_to_resolve_minutes,
    created_at: created_at.toISOString(),
    resolved_at: resolved_at?.toISOString() || null,
  };
}

function generateTickets(
  options: GenerateOptions,
  customerIds: string[],
  orderIds: string[],
  categories: Category[],
): Ticket[] {
  const { count } = options;
  const tickets: Ticket[] = [];

  for (let i = 1; i <= count; i++) {
    tickets.push(generateTicket(i, customerIds, orderIds, categories));
  }

  // Sort by created_at
  return tickets.sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
}

// Main execution
const options = parseArguments();

console.log("📖 Loading existing data...");
const customerIds = loadCustomers(options.customersFile);
const orderIds = loadOrders(options.ordersFile);
const categories = loadCategories(options.categoriesFile);

console.log(`   Customers: ${customerIds.length}`);
console.log(`   Orders: ${orderIds.length}`);
console.log(`   Categories: ${categories.length}`);

const tickets = generateTickets(options, customerIds, orderIds, categories);
const outputPath = path.resolve(__dirname, "../data", options.filename);

// Ensure data directory exists
const dataDir = path.dirname(outputPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

fs.writeFileSync(outputPath, JSON.stringify(tickets, null, 2), "utf-8");

const statusCounts = {
  open: tickets.filter((t) => t.status === TicketStatus.OPEN).length,
  in_progress: tickets.filter((t) => t.status === TicketStatus.IN_PROGRESS)
    .length,
  pending_approval: tickets.filter(
    (t) => t.status === TicketStatus.PENDING_APPROVAL,
  ).length,
  resolved: tickets.filter((t) => t.status === TicketStatus.RESOLVED).length,
  closed: tickets.filter((t) => t.status === TicketStatus.CLOSED).length,
};

const withOrders = tickets.filter((t) => t.order_id !== null).length;

console.log(`✅ Generated ${tickets.length} tickets`);
console.log(`   Open: ${statusCounts.open}`);
console.log(`   In Progress: ${statusCounts.in_progress}`);
console.log(`   Pending Approval: ${statusCounts.pending_approval}`);
console.log(`   Resolved: ${statusCounts.resolved}`);
console.log(`   Closed: ${statusCounts.closed}`);
console.log(
  `   With order_id: ${withOrders} (${Math.round((withOrders / tickets.length) * 100)}%)`,
);
console.log(`📂 File saved to: ${outputPath}`);
console.log(`\nUsage:`);
console.log(`  npx tsx scripts/generate-tickets.ts`);
console.log(`  npx tsx scripts/generate-tickets.ts -- --count=200`);
console.log(
  `  npx tsx scripts/generate-tickets.ts -- --customers=customers.json --orders=orders.json`,
);
