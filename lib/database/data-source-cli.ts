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
import { TicketWorkflowState } from "./entities/TicketWorkflowState";

// Load .env.local для CLI команд
const { config } = require("dotenv");
const { resolve } = require("path");
config({ path: resolve(process.cwd(), ".env.local") });

// Парсим URL или используем прямые параметры
function getDatabaseConfig() {
  const host = process.env.POSTGRES_HOST;
  const port = process.env.POSTGRES_PORT;
  const username = process.env.POSTGRES_USER;
  const password = process.env.POSTGRES_PASSWORD;
  const database = process.env.POSTGRES_DATABASE;

  // Валидация: все переменные обязательны
  if (!host || !port || !username || !password || !database) {
    throw new Error(
      "Missing required database environment variables. Required: POSTGRES_HOST, POSTGRES_PORT, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DATABASE",
    );
  }

  // Определяем локальная ли БД по хосту
  const isLocalDb =
    host.includes("localhost") ||
    host.includes("127.0.0.1") ||
    host.includes("db");

  return {
    host,
    port: parseInt(port),
    username,
    password,
    database,
    ssl: !isLocalDb
      ? {
          rejectUnauthorized: true, // verify-full mode (устраняет warning)
        }
      : false, // Локальный Docker без SSL
  };
}

// Data source ДЛЯ CLI КОМАНД (migration:run, migration:generate)
// ⚠️ TypeORM CLI требует ТОЛЬКО default export (no named export!)
const AppDataSource = new DataSource({
  type: "postgres",
  ...getDatabaseConfig(),
  synchronize: false,
  logging: false, // Disabled SQL query logs (enable if needed for debugging migrations)
  entities: [
    Customer,
    Order,
    Ticket,
    Shipment,
    Product,
    Category,
    Team,
    Refund,
    TicketWorkflowState,
  ],
  // В CLI можем использовать glob patterns
  migrations: ["lib/database/migrations/*.ts"],
  subscribers: [],
});

export default AppDataSource;
