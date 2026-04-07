import { AppDataSource } from "./data-source";

let isInitialized = false;

export async function initializeDatabase() {
  if (isInitialized) {
    return AppDataSource;
  }

  try {
    await AppDataSource.initialize();
    isInitialized = true;
    console.log("✅ Database connected successfully");
    return AppDataSource;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    throw error;
  }
}

export async function closeDatabase() {
  if (isInitialized && AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    isInitialized = false;
    console.log("🔌 Database connection closed");
  }
}

export function getDataSource() {
  if (!isInitialized || !AppDataSource.isInitialized) {
    throw new Error(
      "Database not initialized. Call initializeDatabase() first.",
    );
  }
  return AppDataSource;
}
