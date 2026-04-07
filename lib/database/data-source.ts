/* eslint-disable @typescript-eslint/no-require-imports */
import "reflect-metadata";
import { DataSource } from "typeorm";

import { Category } from "./entities/Category";
import { Customer } from "./entities/Customer";
import { Order } from "./entities/Order";
import { Product } from "./entities/Product";
import { Refund } from "./entities/Refund";
import { Shipment } from "./entities/Shipment";
import { Team } from "./entities/Team";
import { Ticket } from "./entities/Ticket";
import { TicketWorkflowState } from "./entities/TicketWorkflowState";

// Load .env.local только локально (на Vercel env vars автоматически доступны)
if (process.env.NODE_ENV !== "production") {
  const { config } = require("dotenv");
  const { resolve } = require("path");
  config({ path: resolve(process.cwd(), ".env.local") });
}

// Парсим URL или используем прямые параметры
function getDatabaseConfig() {
  const host = process.env.POSTGRES_HOST;
  const port = process.env.POSTGRES_PORT;
  const username = process.env.POSTGRES_USER;
  const password = process.env.POSTGRES_PASSWORD;
  const database = process.env.POSTGRES_DATABASE;

  // Валидация: все переменные обязательны (только в runtime, не в build time)
  if (!host || !port || !username || !password || !database) {
    // В процессе build Next.js может импортировать этот модуль без подключения к БД
    // Возвращаем дефолтные значения, которые не будут использоваться
    if (process.env.NODE_ENV === "production" && !process.env.POSTGRES_HOST) {
      console.warn(
        "⚠️ Database env vars not set (build time) - using placeholder config",
      );
      return {
        host: "placeholder",
        port: 5432,
        username: "placeholder",
        password: "placeholder",
        database: "placeholder",
        ssl: false,
      };
    }
    throw new Error("Missing required database environment variables.");
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

function createDataSource() {
  return new DataSource({
    type: "postgres",
    ...getDatabaseConfig(),
    synchronize: false, // ⚠️ false в production! Используем migrations
    logging: false, // Disabled SQL query logs for cleaner console
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
    migrations: [],
    subscribers: [],
  });
}

// Export singleton DataSource instance
export const AppDataSource = createDataSource();

// Helper for getting the instance (backward compatibility)
export function getAppDataSource(): DataSource {
  return AppDataSource;
}
