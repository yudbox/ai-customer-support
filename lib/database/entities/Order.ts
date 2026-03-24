import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { Customer } from "./Customer";
import { Ticket } from "./Ticket";
import { Shipment } from "./Shipment";
import { Refund } from "./Refund";

export enum OrderStatus {
  PENDING = "pending",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
}

export interface OrderItem {
  name: string;
  price: number;
  qty: number;
  sku?: string;
}

@Entity("orders")
@Index(["order_number"]) // Поиск по order number (Customer Lookup Agent)
@Index(["customer_id", "created_at"]) // Customer order history
@Index(["status"]) // Фильтрация в Dashboard
@Index(["tracking_number"]) // Tracking lookup
export class Order {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 50, unique: true })
  order_number: string;

  @ManyToOne(() => Customer, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "customer_id" })
  customer: Customer;

  @Column({ type: "uuid" })
  customer_id: string;

  @Column({ type: "jsonb" })
  items: OrderItem[];

  @Column({ type: "decimal", precision: 10, scale: 2 })
  total_price: number;

  @Column({
    type: "enum",
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({ type: "varchar", length: 100, nullable: true })
  tracking_number?: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  carrier?: string;

  @Column({ type: "timestamp", nullable: true })
  shipped_at?: Date;

  @Column({ type: "date", nullable: true })
  expected_delivery?: Date;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @OneToMany(() => Shipment, (shipment) => shipment.order, { cascade: true })
  shipments: Shipment[];

  @OneToMany(() => Ticket, (ticket) => ticket.order)
  tickets: Ticket[];

  @OneToMany(() => Refund, (refund) => refund.order, { cascade: true })
  refunds: Refund[];
}
