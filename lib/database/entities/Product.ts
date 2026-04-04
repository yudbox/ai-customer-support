import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from "typeorm";

@Entity("products")
@Index(["sku"])
@Index(["category"])
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 50, unique: true })
  sku: string;

  @Column({ type: "varchar", length: 255 })
  name: string;

  @Column({ type: "varchar", length: 100 })
  category: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price: number;

  @Column({ type: "jsonb", nullable: true })
  specs?: Record<string, string | number | boolean>;

  @Column({ type: "jsonb", nullable: true })
  compatibility?: string[];

  @Column({ type: "int", default: 0 })
  inventory_count: number;

  @Column({ type: "jsonb", nullable: true })
  images?: string[];

  @CreateDateColumn()
  created_at: Date;
}
