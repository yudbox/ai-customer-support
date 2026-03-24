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

// Load .env.local для CLI команд
const { config } = require("dotenv");
const { resolve } = require("path");
config({ path: resolve(process.cwd(), ".env.local") });

// Data source ДЛЯ CLI КОМАНД (migration:run, migration:generate)
// ⚠️ TypeORM CLI требует ТОЛЬКО default export (no named export!)
const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.POSTGRES_URL,
  synchronize: false,
  logging: true, // Включаем логи для CLI
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
  // В CLI можем использовать glob patterns
  migrations: ["lib/database/migrations/*.ts"],
  subscribers: [],
});

export default AppDataSource;
