import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRejectedStatus1774705114365 implements MigrationInterface {
    name = 'AddRejectedStatus1774705114365'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_a45076c2bfb748d347b3123d1b"`);
        await queryRunner.query(`ALTER TYPE "public"."tickets_status_enum" RENAME TO "tickets_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."tickets_status_enum" AS ENUM('open', 'in_progress', 'pending_approval', 'resolved', 'closed', 'rejected')`);
        await queryRunner.query(`ALTER TABLE "tickets" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "tickets" ALTER COLUMN "status" TYPE "public"."tickets_status_enum" USING "status"::"text"::"public"."tickets_status_enum"`);
        await queryRunner.query(`ALTER TABLE "tickets" ALTER COLUMN "status" SET DEFAULT 'open'`);
        await queryRunner.query(`DROP TYPE "public"."tickets_status_enum_old"`);
        await queryRunner.query(`CREATE INDEX "IDX_a45076c2bfb748d347b3123d1b" ON "tickets" ("status", "priority_score") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_a45076c2bfb748d347b3123d1b"`);
        await queryRunner.query(`CREATE TYPE "public"."tickets_status_enum_old" AS ENUM('open', 'in_progress', 'pending_approval', 'resolved', 'closed')`);
        await queryRunner.query(`ALTER TABLE "tickets" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "tickets" ALTER COLUMN "status" TYPE "public"."tickets_status_enum_old" USING "status"::"text"::"public"."tickets_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "tickets" ALTER COLUMN "status" SET DEFAULT 'open'`);
        await queryRunner.query(`DROP TYPE "public"."tickets_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."tickets_status_enum_old" RENAME TO "tickets_status_enum"`);
        await queryRunner.query(`CREATE INDEX "IDX_a45076c2bfb748d347b3123d1b" ON "tickets" ("priority_score", "status") `);
    }

}
