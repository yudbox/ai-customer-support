import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTables1774302369993 implements MigrationInterface {
    name = 'CreateTables1774302369993'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."refunds_status_enum" AS ENUM('pending', 'succeeded', 'failed')`);
        await queryRunner.query(`CREATE TABLE "refunds" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "order_id" uuid NOT NULL, "ticket_id" uuid, "amount" numeric(10,2) NOT NULL, "reason" character varying(255) NOT NULL, "status" "public"."refunds_status_enum" NOT NULL DEFAULT 'pending', "initiated_by" character varying(100) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5106efb01eeda7e49a78b869738" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_90c78d3c32a3346772edf34e73" ON "refunds" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_c76fa2e3f5368258258e78fadf" ON "refunds" ("ticket_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_a42db6369017df60549539f556" ON "refunds" ("order_id") `);
        await queryRunner.query(`CREATE TYPE "public"."tickets_sentiment_label_enum" AS ENUM('ANGRY', 'NEUTRAL', 'POSITIVE')`);
        await queryRunner.query(`CREATE TYPE "public"."tickets_priority_enum" AS ENUM('critical', 'high', 'medium', 'low')`);
        await queryRunner.query(`CREATE TYPE "public"."tickets_status_enum" AS ENUM('open', 'in_progress', 'pending_approval', 'resolved', 'closed')`);
        await queryRunner.query(`CREATE TABLE "tickets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "ticket_number" character varying(50) NOT NULL, "customer_id" uuid NOT NULL, "order_id" uuid, "subject" character varying(500) NOT NULL, "body" text NOT NULL, "category" character varying(100), "subcategory" character varying(100), "sentiment_label" "public"."tickets_sentiment_label_enum", "sentiment_score" numeric(3,2), "priority" "public"."tickets_priority_enum", "priority_score" integer, "status" "public"."tickets_status_enum" NOT NULL DEFAULT 'open', "assigned_to" character varying(100), "assigned_team" character varying(100), "resolution" text, "time_to_resolve_minutes" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "resolved_at" TIMESTAMP, CONSTRAINT "UQ_8d7b9a157280caf57aa0282e72c" UNIQUE ("ticket_number"), CONSTRAINT "PK_343bc942ae261cf7a1377f48fd0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_09a4d6db964c6b6ce11f8f1d92" ON "tickets" ("created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_143c60f935aa86982b2074fadd" ON "tickets" ("category") `);
        await queryRunner.query(`CREATE INDEX "IDX_a45076c2bfb748d347b3123d1b" ON "tickets" ("status", "priority_score") `);
        await queryRunner.query(`CREATE INDEX "IDX_bd5636236f799b19f132abf8d7" ON "tickets" ("order_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_42e4343476d9c4a46fb565a5c4" ON "tickets" ("customer_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_8d7b9a157280caf57aa0282e72" ON "tickets" ("ticket_number") `);
        await queryRunner.query(`CREATE TYPE "public"."shipments_status_enum" AS ENUM('in_transit', 'delivered', 'exception', 'lost')`);
        await queryRunner.query(`CREATE TABLE "shipments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tracking_number" character varying(100) NOT NULL, "order_id" uuid NOT NULL, "carrier" character varying(50) NOT NULL, "status" "public"."shipments_status_enum" NOT NULL DEFAULT 'in_transit', "current_location" character varying(255), "estimated_delivery" date, "events" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e148d569550cfa0295ccf237066" UNIQUE ("tracking_number"), CONSTRAINT "PK_6deda4532ac542a93eab214b564" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_6a19baf6dd62cac42fbb40a518" ON "shipments" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_e86fac2a18a75dcb82bfbb23f4" ON "shipments" ("order_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_e148d569550cfa0295ccf23706" ON "shipments" ("tracking_number") `);
        await queryRunner.query(`CREATE TYPE "public"."orders_status_enum" AS ENUM('pending', 'shipped', 'delivered', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "order_number" character varying(50) NOT NULL, "customer_id" uuid NOT NULL, "items" jsonb NOT NULL, "total_price" numeric(10,2) NOT NULL, "status" "public"."orders_status_enum" NOT NULL DEFAULT 'pending', "tracking_number" character varying(100), "carrier" character varying(50), "shipped_at" TIMESTAMP, "expected_delivery" date, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_75eba1c6b1a66b09f2a97e6927b" UNIQUE ("order_number"), CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_aafadefd70155200d8914ceaf9" ON "orders" ("tracking_number") `);
        await queryRunner.query(`CREATE INDEX "IDX_775c9f06fc27ae3ff8fb26f2c4" ON "orders" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_11fefa35e3ef25881234b8b89a" ON "orders" ("customer_id", "created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_75eba1c6b1a66b09f2a97e6927" ON "orders" ("order_number") `);
        await queryRunner.query(`CREATE TYPE "public"."customers_tier_enum" AS ENUM('VIP', 'Regular', 'New')`);
        await queryRunner.query(`CREATE TABLE "customers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(255) NOT NULL, "name" character varying(255) NOT NULL, "tier" "public"."customers_tier_enum" NOT NULL DEFAULT 'New', "total_orders" integer NOT NULL DEFAULT '0', "lifetime_value" numeric(10,2) NOT NULL DEFAULT '0', "total_spent" numeric(10,2) NOT NULL DEFAULT '0', "avg_order_value" numeric(10,2), "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_8536b8b85c06969f84f0c098b03" UNIQUE ("email"), CONSTRAINT "PK_133ec679a801fab5e070f73d3ea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_7d3348228e397a6919e087d974" ON "customers" ("tier") `);
        await queryRunner.query(`CREATE INDEX "IDX_8536b8b85c06969f84f0c098b0" ON "customers" ("email") `);
        await queryRunner.query(`CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "sku" character varying(50) NOT NULL, "name" character varying(255) NOT NULL, "category" character varying(100) NOT NULL, "price" numeric(10,2) NOT NULL, "specs" jsonb, "compatibility" jsonb, "inventory_count" integer NOT NULL DEFAULT '0', "images" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_c44ac33a05b144dd0d9ddcf9327" UNIQUE ("sku"), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c3932231d2385ac248d0888d95" ON "products" ("category") `);
        await queryRunner.query(`CREATE INDEX "IDX_c44ac33a05b144dd0d9ddcf932" ON "products" ("sku") `);
        await queryRunner.query(`CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "parent_category" character varying(255), "assigned_team" character varying(100) NOT NULL, "sla_hours" integer NOT NULL, "priority_boost" integer NOT NULL DEFAULT '0', "keywords" text NOT NULL, CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878" UNIQUE ("name"), CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_dcd806263f75da263bb90dd73e" ON "categories" ("assigned_team") `);
        await queryRunner.query(`CREATE INDEX "IDX_8b0be371d28245da6e4f4b6187" ON "categories" ("name") `);
        await queryRunner.query(`CREATE TABLE "teams" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "members" text NOT NULL, "slack_channel" character varying(100), "availability_hours" character varying(100), CONSTRAINT "UQ_48c0c32e6247a2de155baeaf980" UNIQUE ("name"), CONSTRAINT "PK_7e5523774a38b08a6236d322403" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_48c0c32e6247a2de155baeaf98" ON "teams" ("name") `);
        await queryRunner.query(`ALTER TABLE "refunds" ADD CONSTRAINT "FK_a42db6369017df60549539f5567" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "refunds" ADD CONSTRAINT "FK_c76fa2e3f5368258258e78fadf8" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tickets" ADD CONSTRAINT "FK_42e4343476d9c4a46fb565a5c46" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tickets" ADD CONSTRAINT "FK_bd5636236f799b19f132abf8d70" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shipments" ADD CONSTRAINT "FK_e86fac2a18a75dcb82bfbb23f43" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_772d0ce0473ac2ccfa26060dbe9" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_772d0ce0473ac2ccfa26060dbe9"`);
        await queryRunner.query(`ALTER TABLE "shipments" DROP CONSTRAINT "FK_e86fac2a18a75dcb82bfbb23f43"`);
        await queryRunner.query(`ALTER TABLE "tickets" DROP CONSTRAINT "FK_bd5636236f799b19f132abf8d70"`);
        await queryRunner.query(`ALTER TABLE "tickets" DROP CONSTRAINT "FK_42e4343476d9c4a46fb565a5c46"`);
        await queryRunner.query(`ALTER TABLE "refunds" DROP CONSTRAINT "FK_c76fa2e3f5368258258e78fadf8"`);
        await queryRunner.query(`ALTER TABLE "refunds" DROP CONSTRAINT "FK_a42db6369017df60549539f5567"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_48c0c32e6247a2de155baeaf98"`);
        await queryRunner.query(`DROP TABLE "teams"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8b0be371d28245da6e4f4b6187"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_dcd806263f75da263bb90dd73e"`);
        await queryRunner.query(`DROP TABLE "categories"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c44ac33a05b144dd0d9ddcf932"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c3932231d2385ac248d0888d95"`);
        await queryRunner.query(`DROP TABLE "products"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8536b8b85c06969f84f0c098b0"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7d3348228e397a6919e087d974"`);
        await queryRunner.query(`DROP TABLE "customers"`);
        await queryRunner.query(`DROP TYPE "public"."customers_tier_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_75eba1c6b1a66b09f2a97e6927"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_11fefa35e3ef25881234b8b89a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_775c9f06fc27ae3ff8fb26f2c4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_aafadefd70155200d8914ceaf9"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`DROP TYPE "public"."orders_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e148d569550cfa0295ccf23706"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e86fac2a18a75dcb82bfbb23f4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6a19baf6dd62cac42fbb40a518"`);
        await queryRunner.query(`DROP TABLE "shipments"`);
        await queryRunner.query(`DROP TYPE "public"."shipments_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8d7b9a157280caf57aa0282e72"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_42e4343476d9c4a46fb565a5c4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bd5636236f799b19f132abf8d7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a45076c2bfb748d347b3123d1b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_143c60f935aa86982b2074fadd"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_09a4d6db964c6b6ce11f8f1d92"`);
        await queryRunner.query(`DROP TABLE "tickets"`);
        await queryRunner.query(`DROP TYPE "public"."tickets_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."tickets_priority_enum"`);
        await queryRunner.query(`DROP TYPE "public"."tickets_sentiment_label_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a42db6369017df60549539f556"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c76fa2e3f5368258258e78fadf"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_90c78d3c32a3346772edf34e73"`);
        await queryRunner.query(`DROP TABLE "refunds"`);
        await queryRunner.query(`DROP TYPE "public"."refunds_status_enum"`);
    }

}
