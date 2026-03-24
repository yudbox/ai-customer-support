import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  OneToMany,
} from "typeorm";
import type { Order } from "./Order";
import type { Ticket } from "./Ticket";

export enum CustomerTier {
  VIP = "VIP",
  REGULAR = "Regular",
  NEW = "New",
}

@Entity("customers")
@Index(["email"]) // Быстрый поиск по email (Customer Lookup Agent)
@Index(["tier"]) // Фильтрация по tier в Dashboard
export class Customer {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 255, unique: true })
  email: string;

  @Column({ type: "varchar", length: 255 })
  name: string;

  @Column({
    type: "enum",
    enum: CustomerTier,
    default: CustomerTier.NEW,
  })
  tier: CustomerTier;

  @Column({ type: "int", default: 0 })
  total_orders: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  lifetime_value: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  total_spent: number;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: true,
  })
  avg_order_value?: number;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @OneToMany(() => require("./Order").Order, "customer", { cascade: true })
  orders: Order[];

  @OneToMany(() => require("./Ticket").Ticket, "customer", { cascade: true })
  tickets: Ticket[];
}
