import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";

/**
 * Entity для хранения workflow checkpoints (HITL паузы)
 * Используется для сохранения state при interruptAfter: [WAIT_APPROVAL]
 */
@Entity("ticket_workflow_states")
export class TicketWorkflowState {
  @PrimaryColumn({ type: "varchar", length: 255 })
  thread_id: string;

  @Column({ type: "varchar", length: 255 })
  checkpoint_id: string;

  @Column({ type: "jsonb" })
  checkpoint_data: any; // LangGraph Checkpoint object

  @Column({ type: "jsonb", nullable: true })
  metadata?: any; // CheckpointMetadata

  @CreateDateColumn()
  @Index()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
