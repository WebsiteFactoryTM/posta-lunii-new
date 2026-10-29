import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_orders_product_line" AS ENUM('posta-lunii', 'posta-secreta');
  ALTER TABLE "landing" ALTER COLUMN "hero_cta_note" SET DEFAULT 'de la 55 lei / lună · livrare inclusă prin Poșta Română';
  ALTER TABLE "orders" ADD COLUMN "product_line" "enum_orders_product_line" DEFAULT 'posta-lunii';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "landing" ALTER COLUMN "hero_cta_note" SET DEFAULT 'de la 55 lei / lună · livrat prin poștă';
  ALTER TABLE "orders" DROP COLUMN "product_line";
  DROP TYPE "public"."enum_orders_product_line";`)
}
