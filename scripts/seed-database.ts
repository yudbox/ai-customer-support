import "reflect-metadata";
import * as fs from "fs";
import * as path from "path";
import { AppDataSource } from "../lib/database/data-source";
import { Customer } from "../lib/database/entities/Customer";
import { Product } from "../lib/database/entities/Product";
import { Category } from "../lib/database/entities/Category";
import { Team } from "../lib/database/entities/Team";
import { Order } from "../lib/database/entities/Order";
import { Shipment } from "../lib/database/entities/Shipment";
import { Ticket } from "../lib/database/entities/Ticket";
import { Refund } from "../lib/database/entities/Refund";

interface SeedOptions {
  clear?: boolean; // Clear existing data before seeding
}

function parseArguments(): SeedOptions {
  const args = process.argv.slice(2);
  const clearFlag = args.includes("--clear");
  return { clear: clearFlag };
}

function loadJSON<T>(filename: string): T[] {
  const filePath = path.resolve(__dirname, "../data", filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

async function clearDatabase() {
  console.log("🗑️  Clearing existing data...");

  // Use TRUNCATE CASCADE to handle foreign key constraints
  // All tables cleared in one command
  await AppDataSource.query(`
    TRUNCATE TABLE 
      refunds, 
      tickets, 
      shipments, 
      orders, 
      customers, 
      products, 
      categories, 
      teams 
    CASCADE
  `);

  console.log("   ✅ All tables cleared");
  console.log("");
}

async function seedDatabase() {
  try {
    console.log("🌱 Starting database seed...\n");

    // Initialize connection
    await AppDataSource.initialize();
    console.log("✅ Database connection established\n");

    const options = parseArguments();

    // Clear existing data if flag provided
    if (options.clear) {
      await clearDatabase();
    }

    // STEP 1: Independent tables (no foreign keys)
    console.log("📦 Seeding independent tables...");

    const customersData = loadJSON<Customer>("customers-2026-03-23.json");
    await AppDataSource.manager.save(Customer, customersData);
    console.log(`   ✅ Customers: ${customersData.length}`);

    const productsData = loadJSON<Product>("products-2026-03-24.json");
    await AppDataSource.manager.save(Product, productsData);
    console.log(`   ✅ Products: ${productsData.length}`);

    const categoriesData = loadJSON<Category>("categories-2026-03-24.json");
    await AppDataSource.manager.save(Category, categoriesData);
    console.log(`   ✅ Categories: ${categoriesData.length}`);

    const teamsData = loadJSON<Team>("teams-2026-03-24.json");
    await AppDataSource.manager.save(Team, teamsData);
    console.log(`   ✅ Teams: ${teamsData.length}\n`);

    // STEP 2: Orders (depends on customers)
    console.log("📦 Seeding orders (depends on customers)...");
    const ordersData = loadJSON<Order>("orders-2026-03-24.json");
    await AppDataSource.manager.save(Order, ordersData);
    console.log(`   ✅ Orders: ${ordersData.length}\n`);

    // STEP 3: Shipments (depends on orders)
    console.log("📦 Seeding shipments (depends on orders)...");
    const shipmentsData = loadJSON<Shipment>("shipments-2026-03-24.json");
    await AppDataSource.manager.save(Shipment, shipmentsData);
    console.log(`   ✅ Shipments: ${shipmentsData.length}\n`);

    // STEP 4: Tickets (depends on customers + orders)
    console.log("📦 Seeding tickets (depends on customers + orders)...");
    const ticketsData = loadJSON<Ticket>("tickets-2026-03-24.json");
    await AppDataSource.manager.save(Ticket, ticketsData);
    console.log(`   ✅ Tickets: ${ticketsData.length}\n`);

    // STEP 5: Refunds (depends on orders + tickets)
    console.log("📦 Seeding refunds (depends on orders + tickets)...");
    const refundsData = loadJSON<Refund>("refunds-2026-03-24.json");
    await AppDataSource.manager.save(Refund, refundsData);
    console.log(`   ✅ Refunds: ${refundsData.length}\n`);

    // Summary
    const totalRecords =
      customersData.length +
      productsData.length +
      categoriesData.length +
      teamsData.length +
      ordersData.length +
      shipmentsData.length +
      ticketsData.length +
      refundsData.length;

    console.log("🎉 Seed completed successfully!");
    console.log(`📊 Total records inserted: ${totalRecords}`);
    console.log("\n📋 Summary:");
    console.log(`   Customers: ${customersData.length}`);
    console.log(`   Products: ${productsData.length}`);
    console.log(`   Categories: ${categoriesData.length}`);
    console.log(`   Teams: ${teamsData.length}`);
    console.log(`   Orders: ${ordersData.length}`);
    console.log(`   Shipments: ${shipmentsData.length}`);
    console.log(`   Tickets: ${ticketsData.length}`);
    console.log(`   Refunds: ${refundsData.length}`);
  } catch (error) {
    console.error("❌ Error during seed:", error);
    throw error;
  } finally {
    // Close connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log("\n✅ Database connection closed");
    }
  }
}

// Run seed
console.log("═".repeat(60));
console.log("  AI Customer Support - Database Seed");
console.log("═".repeat(60));
console.log("");

seedDatabase()
  .then(() => {
    console.log("\n✨ All done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Seed failed:", error.message);
    process.exit(1);
  });
