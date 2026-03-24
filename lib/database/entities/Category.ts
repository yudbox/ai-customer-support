import { Entity, PrimaryGeneratedColumn, Column, Index } from "typeorm";

@Entity("categories")
@Index(["name"])
@Index(["assigned_team"])
export class Category {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 255, unique: true })
  name: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  parent_category?: string;

  @Column({ type: "varchar", length: 100 })
  assigned_team: string;

  @Column({ type: "int" })
  sla_hours: number;

  @Column({ type: "int", default: 0 })
  priority_boost: number;

  @Column({ type: "simple-array" })
  keywords: string[];
}
