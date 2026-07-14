import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1783811935513 implements MigrationInterface {
  name = 'Migrations1783811935513';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "deliveries" ("id" SERIAL NOT NULL, "customer" character varying NOT NULL, "customerEmail" character varying NOT NULL, "address" text NOT NULL, "country" character varying NOT NULL, "region" character varying NOT NULL, "city" character varying NOT NULL, "postalCode" character varying NOT NULL, "phone" character varying NOT NULL, "fee" numeric(10,2), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a6ef225c5c5f0974e503bfb731f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "products" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "image" character varying NOT NULL, "price" integer NOT NULL, "stock" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."order_transactions_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "order_transactions" ("id" SERIAL NOT NULL, "paymentGatewayTransactionId" character varying, "quantity" integer NOT NULL, "total" numeric(15,2), "status" "public"."order_transactions_status_enum" NOT NULL DEFAULT 'PENDING', "productId" integer NOT NULL, "deliveryId" integer, "acceptanceEndUserPolicyUrl" character varying, "acceptanceEndUserPolicyToken" character varying, "acceptancePersonalDataAuthorizationUrl" character varying, "acceptancePersonalDataAuthorizationToken" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a3f432d56165e5acafd5fb17cb3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_transactions" ADD CONSTRAINT "FK_d594d48454c3f2c85e2e1040a52" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_transactions" ADD CONSTRAINT "FK_81ba699e6c9b8dc7ba0e931a5c9" FOREIGN KEY ("deliveryId") REFERENCES "deliveries"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_transactions" DROP CONSTRAINT "FK_81ba699e6c9b8dc7ba0e931a5c9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_transactions" DROP CONSTRAINT "FK_d594d48454c3f2c85e2e1040a52"`,
    );
    await queryRunner.query(`DROP TABLE "order_transactions"`);
    await queryRunner.query(
      `DROP TYPE "public"."order_transactions_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "products"`);
    await queryRunner.query(`DROP TABLE "deliveries"`);
  }
}
