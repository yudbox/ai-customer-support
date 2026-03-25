import * as fs from "fs";
import * as path from "path";
import { faker } from "@faker-js/faker";
import { v4 as uuidv4 } from "uuid";

enum ShipmentStatus {
  IN_TRANSIT = "in_transit",
  DELIVERED = "delivered",
  EXCEPTION = "exception",
  LOST = "lost",
}

interface ShipmentEvent {
  timestamp: string;
  location: string;
  status: string;
  description: string;
}

interface Shipment {
  id: string; // UUID
  tracking_number: string;
  order_id: string; // UUID from orders
  carrier: string;
  status: ShipmentStatus;
  current_location: string | null;
  estimated_delivery: string | null; // date
  events: ShipmentEvent[]; // JSONB
  created_at: string;
}

interface Order {
  id: string;
  status: string;
  tracking_number: string | null;
  carrier: string | null;
  shipped_at: string | null;
  created_at: string;
}

interface GenerateOptions {
  filename: string;
  ordersFile: string;
}

const carriers = ["FedEx", "UPS", "DHL", "USPS", "Amazon Logistics"];

const locations = [
  "New York, NY",
  "Los Angeles, CA",
  "Chicago, IL",
  "Houston, TX",
  "Philadelphia, PA",
  "Phoenix, AZ",
  "San Antonio, TX",
  "San Diego, CA",
  "Dallas, TX",
  "San Jose, CA",
  "Memphis, TN",
  "Louisville, KY",
];

const eventStatuses = [
  "Package received",
  "In transit",
  "Arrived at facility",
  "Out for delivery",
  "Delivered",
  "Delivery exception",
  "Package delayed",
];

function parseArguments(): GenerateOptions {
  const args = process.argv.slice(2);

  const fileArg = args.find((arg) => arg.startsWith("--file="));
  const filename = fileArg
    ? fileArg.split("=")[1]
    : `shipments-${new Date().toISOString().split("T")[0]}.json`;

  const ordersArg = args.find((arg) => arg.startsWith("--orders="));
  const ordersFile = ordersArg
    ? ordersArg.split("=")[1]
    : "orders-2026-03-24.json";

  return { filename, ordersFile };
}

function loadShippableOrders(filename: string): Order[] {
  const filePath = path.resolve(__dirname, "../data", filename);
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  // Only orders that have been shipped or delivered
  return data.filter(
    (o: Order) => o.status === "shipped" || o.status === "delivered",
  );
}

function generateTrackingNumber(): string {
  const prefix = faker.helpers.arrayElement(["1Z", "FX", "DH", "US", "TBA"]);
  const num = faker.string.alphanumeric(12).toUpperCase();
  return `${prefix}${num}`;
}

function generateShipmentEvents(
  status: ShipmentStatus,
  shippedAt: Date,
  deliveredAt?: Date,
): ShipmentEvent[] {
  const events: ShipmentEvent[] = [];

  // Event 1: Package received
  const event1Date = new Date(shippedAt);
  events.push({
    timestamp: event1Date.toISOString(),
    location: faker.helpers.arrayElement(locations),
    status: "Package received",
    description: "Package received at origin facility",
  });

  // Event 2-4: In transit
  const transitDays =
    status === ShipmentStatus.DELIVERED
      ? deliveredAt
        ? Math.floor(
            (deliveredAt.getTime() - shippedAt.getTime()) /
              (1000 * 60 * 60 * 24),
          )
        : 3
      : faker.number.int({ min: 1, max: 5 });

  for (let i = 1; i <= Math.min(transitDays, 3); i++) {
    const eventDate = new Date(shippedAt);
    eventDate.setDate(eventDate.getDate() + i);
    events.push({
      timestamp: eventDate.toISOString(),
      location: faker.helpers.arrayElement(locations),
      status: faker.helpers.arrayElement(["In transit", "Arrived at facility"]),
      description: `Package ${faker.helpers.arrayElement(["in transit to", "arrived at"])} ${faker.helpers.arrayElement(locations)} facility`,
    });
  }

  // Final event based on status
  if (status === ShipmentStatus.DELIVERED && deliveredAt) {
    events.push({
      timestamp: deliveredAt.toISOString(),
      location: faker.helpers.arrayElement(locations),
      status: "Delivered",
      description: "Package delivered successfully",
    });
  } else if (status === ShipmentStatus.EXCEPTION) {
    const lastDate = new Date(shippedAt);
    lastDate.setDate(lastDate.getDate() + transitDays);
    events.push({
      timestamp: lastDate.toISOString(),
      location: faker.helpers.arrayElement(locations),
      status: "Delivery exception",
      description: faker.helpers.arrayElement([
        "Address issue - customer contacted",
        "Recipient not available - rescheduled",
        "Weather delay",
      ]),
    });
  } else if (status === ShipmentStatus.LOST) {
    const lastDate = new Date(shippedAt);
    lastDate.setDate(lastDate.getDate() + 7);
    events.push({
      timestamp: lastDate.toISOString(),
      location: "Unknown",
      status: "Lost",
      description: "Package lost in transit - investigation initiated",
    });
  }

  return events;
}

function generateShipment(order: Order): Shipment {
  const id = uuidv4();
  const tracking_number = order.tracking_number || generateTrackingNumber();
  const carrier = order.carrier || faker.helpers.arrayElement(carriers);

  // Determine status based on order status
  let status: ShipmentStatus;
  const randomValue = Math.random();

  if (order.status === "delivered") {
    // 95% delivered, 3% exception, 2% lost
    if (randomValue < 0.95) {
      status = ShipmentStatus.DELIVERED;
    } else if (randomValue < 0.98) {
      status = ShipmentStatus.EXCEPTION;
    } else {
      status = ShipmentStatus.LOST;
    }
  } else {
    // shipped orders: 80% in_transit, 15% exception, 5% lost
    if (randomValue < 0.8) {
      status = ShipmentStatus.IN_TRANSIT;
    } else if (randomValue < 0.95) {
      status = ShipmentStatus.EXCEPTION;
    } else {
      status = ShipmentStatus.LOST;
    }
  }

  const shipped_at = order.shipped_at
    ? new Date(order.shipped_at)
    : new Date(order.created_at);

  let delivered_at: Date | undefined;
  if (status === ShipmentStatus.DELIVERED) {
    delivered_at = new Date(shipped_at);
    delivered_at.setDate(
      delivered_at.getDate() + faker.number.int({ min: 3, max: 7 }),
    );
  }

  const events = generateShipmentEvents(status, shipped_at, delivered_at);

  const current_location =
    status === ShipmentStatus.DELIVERED
      ? null
      : status === ShipmentStatus.LOST
        ? null
        : faker.helpers.arrayElement(locations);

  const estimated_delivery =
    status === ShipmentStatus.IN_TRANSIT || status === ShipmentStatus.EXCEPTION
      ? (() => {
          const estDate = new Date(shipped_at);
          estDate.setDate(
            estDate.getDate() + faker.number.int({ min: 5, max: 10 }),
          );
          return estDate.toISOString().split("T")[0];
        })()
      : null;

  return {
    id,
    tracking_number,
    order_id: order.id,
    carrier,
    status,
    current_location,
    estimated_delivery,
    events,
    created_at: shipped_at.toISOString(),
  };
}

function generateShipments(
  options: GenerateOptions,
  orders: Order[],
): Shipment[] {
  return orders.map((order) => generateShipment(order));
}

// Main execution
const options = parseArguments();

console.log("📖 Loading orders...");
const shippableOrders = loadShippableOrders(options.ordersFile);

console.log(`   Shippable orders: ${shippableOrders.length}`);

const shipments = generateShipments(options, shippableOrders);
const outputPath = path.resolve(__dirname, "../data", options.filename);

// Ensure data directory exists
const dataDir = path.dirname(outputPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

fs.writeFileSync(outputPath, JSON.stringify(shipments, null, 2), "utf-8");

const statusCounts = {
  in_transit: shipments.filter((s) => s.status === ShipmentStatus.IN_TRANSIT)
    .length,
  delivered: shipments.filter((s) => s.status === ShipmentStatus.DELIVERED)
    .length,
  exception: shipments.filter((s) => s.status === ShipmentStatus.EXCEPTION)
    .length,
  lost: shipments.filter((s) => s.status === ShipmentStatus.LOST).length,
};

console.log(`✅ Generated ${shipments.length} shipments`);
console.log(`   In Transit: ${statusCounts.in_transit}`);
console.log(`   Delivered: ${statusCounts.delivered}`);
console.log(`   Exception: ${statusCounts.exception}`);
console.log(`   Lost: ${statusCounts.lost}`);
console.log(`📂 File saved to: ${outputPath}`);
console.log(`\nUsage:`);
console.log(`  npx tsx scripts/generate-shipments.ts`);
console.log(`  npx tsx scripts/generate-shipments.ts -- --orders=orders.json`);
