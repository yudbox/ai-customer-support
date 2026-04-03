import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTicketWorkflowStates1775078845798 implements MigrationInterface {
    name = 'CreateTicketWorkflowStates1775078845798'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "ticket_workflow_states" ("thread_id" character varying(255) NOT NULL, "checkpoint_id" character varying(255) NOT NULL, "checkpoint_data" jsonb NOT NULL, "metadata" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9bafe14470008964bd9ed3f6b70" PRIMARY KEY ("thread_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c7ade50994db270282392128c7" ON "ticket_workflow_states" ("created_at") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_c7ade50994db270282392128c7"`);
        await queryRunner.query(`DROP TABLE "ticket_workflow_states"`);
    }

}
