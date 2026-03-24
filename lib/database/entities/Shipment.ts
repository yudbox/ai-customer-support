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

export enum ShipmentStatus {
  IN_TRANSIT = "in_transit",
  DELIVERED = "delivered",
  EXCEPTION = "exception",
  LOST = "lost",
}

export interface ShipmentEvent {
  date: string;
  location: string;
  message: string;
}

@Entity("shipments")
@Index(["tracking_number"])
@Index(["order_id"])
@Index(["status"])
export class Shipment {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 100, unique: true })
  tracking_number: string;

  @ManyToOne(() => require("./Order").Order, "shipments", {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "order_id" })
  order: Order;

  @Column({ type: "uuid" })
  order_id: string;

  @Column({ type: "varchar", length: 50 })
  carrier: string;

  @Column({
    type: "enum",
    enum: ShipmentStatus,
    default: ShipmentStatus.IN_TRANSIT,
  })
  status: ShipmentStatus;

  @Column({ type: "varchar", length: 255, nullable: true })
  current_location?: string;

  @Column({ type: "date", nullable: true })
  estimated_delivery?: Date;

  @Column({ type: "jsonb", nullable: true })
  events?: ShipmentEvent[];

  @CreateDateColumn()
  created_at: Date;
}
