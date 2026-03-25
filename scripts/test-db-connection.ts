import { initializeDatabase, closeDatabase } from '../lib/database';

async function testConnection() {
  console.log("🔌 Testing database connection...\n");

  try {
    const dataSource = await initializeDatabase();

    console.log("\n📊 Database info:");
    console.log(`  Type: ${dataSource.options.type}`);
    console.log(`  Database: ${dataSource.driver.database}`);
    console.log(`  Entities: ${dataSource.entityMetadatas.length}`);

    console.log("\n📋 Registered entities:");
    dataSource.entityMetadatas.forEach((meta) => {
      console.log(`  - ${meta.tableName}`);
    });

    console.log("\n✅ Database connection test passed!");

    await closeDatabase();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Database connection test failed!");
    console.error(error);
    process.exit(1);
  }
}

testConnection();
