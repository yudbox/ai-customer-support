/* eslint-disable @typescript-eslint/no-require-imports */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from "typeorm";

import type { Order } from "./Order";
import type { Ticket } from "./Ticket";

export enum RefundStatus {
  PENDING = "pending",
  SUCCEEDED = "succeeded",
  FAILED = "failed",
}

@Entity("refunds")
@Index(["order_id"])
@Index(["ticket_id"])
@Index(["status"])
export class Refund {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => require("./Order").Order, "refunds", {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "order_id" })
  order: Order;

  @Column({ type: "uuid" })
  order_id: string;

  @ManyToOne(() => require("./Ticket").Ticket, "refunds", {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "ticket_id" })
  ticket?: Ticket;

  @Column({ type: "uuid", nullable: true })
  ticket_id?: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  amount: number;

  @Column({ type: "varchar", length: 255 })
  reason: string;

  @Column({
    type: "enum",
    enum: RefundStatus,
    default: RefundStatus.PENDING,
  })
  status: RefundStatus;

  @Column({ type: "varchar", length: 100 })
  initiated_by: string;

  @CreateDateColumn()
  created_at: Date;
}
