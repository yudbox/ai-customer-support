/**
 * Test Database Setup - PostgreSQL in-memory (pg-mem)
 *
 * Creates isolated PostgreSQL database in RAM for integration tests
 * - Fast initialization (~20-50ms)
 * - Automatic cleanup after completion
 * - 100% PostgreSQL compatibility (ENUM, JSONB, Arrays)
 * - Full TypeORM entities support
 */

import { newDb } from "pg-mem";
import { DataSource } from "typeorm";

import { Category } from "@/lib/database/entities/Category";
import { Customer } from "@/lib/database/entities/Customer";
import { Order } from "@/lib/database/entities/Order";
import { Product } from "@/lib/database/entities/Product";
import { Refund } from "@/lib/database/entities/Refund";
import { Shipment } from "@/lib/database/entities/Shipment";
import { Team } from "@/lib/database/entities/Team";
import { Ticket } from "@/lib/database/entities/Ticket";
import { TicketWorkflowState } from "@/lib/database/entities/TicketWorkflowState";

/**
 * Test DataSource - PostgreSQL in-memory
 * Used ONLY for integration tests
 */
export let testDataSource: DataSource;

/**
 * Initialize test database
 * Called in beforeAll() of each test suite
 */
export async function setupTestDatabase(): Promise<DataSource> {
  // Create PostgreSQL in-memory database
  const db = newDb();

  // Register required PostgreSQL functions
  db.public.registerFunction({
    name: "current_database",
    implementation: () => "test",
  });

  db.public.registerFunction({
    name: "version",
    implementation: () => "PostgreSQL 15.0 (pg-mem)",
  });

  // UUID generation function (required for entity IDs)
  db.public.registerFunction({
    name: "uuid_generate_v4",
    implementation: () => {
      // Simple UUID v4 implementation
      const HEX_BASE = 16;
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * HEX_BASE) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(HEX_BASE);
      });
    },
  });

  // NOW() function for timestamps
  db.public.registerFunction({
    name: "now",
    implementation: () => new Date(),
  });

  // Create TypeORM DataSource via pg-mem adapter
  testDataSource = await db.adapters.createTypeormDataSource({
    type: "postgres",
    entities: [
      Customer,
      Order,
      Team,
      Ticket,
      TicketWorkflowState,
      Shipment,
      Refund,
      Product,
      Category,
    ],
  });

  await testDataSource.initialize();
  await testDataSource.synchronize();

  return testDataSource;
}

/**
 * Clean all data from database
 * Called in afterEach() for test isolation
 */
export async function cleanupTestDatabase(): Promise<void> {
  if (!testDataSource?.isInitialized) {
    return;
  }

  // ✅ Use TRUNCATE CASCADE for fast cleanup of all tables
  // Automatically resets sequences and respects FK constraints
  await testDataSource.query("TRUNCATE TABLE tickets CASCADE");
  await testDataSource.query("TRUNCATE TABLE orders CASCADE");
  await testDataSource.query("TRUNCATE TABLE customers CASCADE");
  await testDataSource.query("TRUNCATE TABLE teams CASCADE");
}

/**
 * Close test database
 * Called in afterAll() of test suite
 */
export async function teardownTestDatabase(): Promise<void> {
  if (testDataSource?.isInitialized) {
    await testDataSource.destroy();
  }
}

/**
 * Mock function to replace getDataSource in tests
 * Returns test database instead of production
 */
export async function mockGetDataSource(): Promise<DataSource> {
  if (!testDataSource?.isInitialized) {
    await setupTestDatabase();
  }
  return testDataSource;
}
