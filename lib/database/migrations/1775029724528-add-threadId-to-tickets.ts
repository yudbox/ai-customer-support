import { MigrationInterface, QueryRunner } from "typeorm";

export class AddThreadIdToTickets1775029724528 implements MigrationInterface {
    name = 'AddThreadIdToTickets1775029724528'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tickets" ADD "thread_id" character varying(255)`);
        await queryRunner.query(`CREATE INDEX "IDX_30e71cc50603e739a43f3f7e35" ON "tickets" ("thread_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_30e71cc50603e739a43f3f7e35"`);
        await queryRunner.query(`ALTER TABLE "tickets" DROP COLUMN "thread_id"`);
    }

}
