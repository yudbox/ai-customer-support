import "reflect-metadata";
import { DataSource } from "typeorm";
import { Customer } from "./entities/Customer";
import { Order } from "./entities/Order";
import { Ticket } from "./entities/Ticket";
import { Shipment } from "./entities/Shipment";
import { Product } from "./entities/Product";
import { Category } from "./entities/Category";
import { Team } from "./entities/Team";
import { Refund } from "./entities/Refund";

// Load .env.local только локально (на Vercel env vars автоматически доступны)
if (process.env.NODE_ENV !== "production") {
  const { config } = require("dotenv");
  const { resolve } = require("path");
  config({ path: resolve(process.cwd(), ".env.local") });
}

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.POSTGRES_URL,
  synchronize: false, // ⚠️ false в production! Используем migrations
  logging: process.env.NODE_ENV === "development",
  entities: [
    Customer,
    Order,
    Ticket,
    Shipment,
    Product,
    Category,
    Team,
    Refund,
  ],
  // Migrations НЕ нужны в Next.js runtime
  // Используются только в CLI командах (npm run migration:run)
  migrations: [],
  subscribers: [],
});
