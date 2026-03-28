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
import type { Customer } from "./Customer";
import type { Order } from "./Order";
import type { Refund } from "./Refund";
import { TicketStatus, SentimentLabel } from "@/lib/types/common";

export enum TicketPriority {
  CRITICAL = "critical",
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
}

@Entity("tickets")
@Index(["ticket_number"])
@Index(["customer_id"])
@Index(["order_id"])
@Index(["status", "priority_score"]) // Manager Dashboard главный query
@Index(["category"])
@Index(["created_at"])
export class Ticket {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 50, unique: true })
  ticket_number: string;

  @ManyToOne(() => require("./Customer").Customer, "tickets", {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "customer_id" })
  customer: Customer;

  @Column({ type: "uuid" })
  customer_id: string;

  @ManyToOne(() => require("./Order").Order, "tickets", {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "order_id" })
  order?: Order;

  @Column({ type: "uuid", nullable: true })
  order_id?: string;

  @Column({ type: "varchar", length: 500 })
  subject: string;

  @Column({ type: "text" })
  body: string;

  // Classification Agent
  @Column({ type: "varchar", length: 100, nullable: true })
  category?: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  subcategory?: string;

  // Sentiment Agent
  @Column({
    type: "enum",
    enum: SentimentLabel,
    nullable: true,
  })
  sentiment_label?: SentimentLabel;

  @Column({
    type: "decimal",
    precision: 3,
    scale: 2,
    nullable: true,
  })
  sentiment_score?: number;

  // Priority Agent
  @Column({
    type: "enum",
    enum: TicketPriority,
    nullable: true,
  })
  priority?: TicketPriority;

  @Column({
    type: "int",
    nullable: true,
  })
  priority_score?: number;

  // Workflow status
  @Column({
    type: "enum",
    enum: TicketStatus,
    default: TicketStatus.OPEN,
  })
  status: TicketStatus;

  // Routing Agent
  @Column({ type: "varchar", length: 100, nullable: true })
  assigned_to?: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  assigned_team?: string;

  // Resolution
  @Column({ type: "text", nullable: true })
  resolution?: string;

  @Column({ type: "int", nullable: true })
  time_to_resolve_minutes?: number;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: "timestamp", nullable: true })
  resolved_at?: Date;

  // Relations
  @OneToMany(() => require("./Refund").Refund, "ticket")
  refunds: Refund[];
}
