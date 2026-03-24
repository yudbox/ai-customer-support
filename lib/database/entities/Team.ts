import { Entity, PrimaryGeneratedColumn, Column, Index } from "typeorm";

@Entity("teams")
@Index(["name"])
export class Team {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 100, unique: true })
  name: string;

  @Column({ type: "simple-array" })
  members: string[];

  @Column({ type: "varchar", length: 100, nullable: true })
  slack_channel?: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  availability_hours?: string;
}
