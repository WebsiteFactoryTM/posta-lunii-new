import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_orders_status" AS ENUM('new', 'active', 'done', 'cancelled');
  CREATE TYPE "public"."enum_orders_variant" AS ENUM('lunar', 'anual-recurent', 'anual-integral');
  CREATE TYPE "public"."enum_withdrawals_product" AS ENUM('single', 'monthly', 'annual');
  CREATE TYPE "public"."enum_withdrawals_status" AS ENUM('new', 'processing', 'refunded', 'closed');
  CREATE TYPE "public"."enum_landing_envelope_items_variant" AS ENUM('letter', 'journal', 'book', 'gift');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"credit" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_full_url" varchar,
  	"sizes_full_width" numeric,
  	"sizes_full_height" numeric,
  	"sizes_full_mime_type" varchar,
  	"sizes_full_filesize" numeric,
  	"sizes_full_filename" varchar
  );
  
  CREATE TABLE "orders" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"reference" varchar NOT NULL,
  	"status" "enum_orders_status" DEFAULT 'new',
  	"variant" "enum_orders_variant",
  	"amount" numeric,
  	"currency" varchar,
  	"name" varchar,
  	"email" varchar,
  	"phone" varchar,
  	"shipping_address" varchar,
  	"notes" varchar,
  	"stripe_session_id" varchar NOT NULL,
  	"stripe_customer_id" varchar,
  	"stripe_subscription_id" varchar,
  	"livemode" boolean,
  	"customer_email_sent" boolean,
  	"admin_email_sent" boolean,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "withdrawals" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"reference" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"product" "enum_withdrawals_product" NOT NULL,
  	"contract" varchar NOT NULL,
  	"address" varchar,
  	"message" varchar,
  	"status" "enum_withdrawals_status" DEFAULT 'new',
  	"acknowledgement_sent" boolean,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"orders_id" integer,
  	"withdrawals_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "landing_envelope_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_landing_envelope_items_variant" DEFAULT 'letter' NOT NULL,
  	"title" varchar NOT NULL,
  	"note" varchar
  );
  
  CREATE TABLE "landing_about_paragraphs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "landing_pricing_plans_payment_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"detail" varchar,
  	"checkout_url" varchar NOT NULL
  );
  
  CREATE TABLE "landing_pricing_plans" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"price" varchar NOT NULL,
  	"price_suffix" varchar,
  	"description" varchar NOT NULL,
  	"savings" varchar,
  	"description_after" varchar,
  	"fine" varchar,
  	"cta_label" varchar NOT NULL,
  	"checkout_url" varchar DEFAULT '#' NOT NULL,
  	"featured" boolean,
  	"badge" varchar
  );
  
  CREATE TABLE "landing_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL
  );
  
  CREATE TABLE "landing" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_subtitle" varchar DEFAULT 'Un plic pentru tine. Un mic ajutor pentru un animal din adăpost.',
  	"hero_text" varchar DEFAULT 'În fiecare lună primești în poștă o scrisoare, un exercițiu de scriere, o recomandare de carte potrivită pentru tema lunii și alte surprize — lucruri create să te scoată puțin din online și să-ți aducă bucuria de a primi ceva făcut cu grijă.',
  	"hero_donation_before" varchar DEFAULT 'Iar',
  	"hero_donation_amount" varchar DEFAULT '15 lei',
  	"hero_donation_after" varchar DEFAULT 'din fiecare plic cumpărat merg către Adăpostul Speranța.',
  	"hero_cta_label" varchar DEFAULT 'Vreau Poșta Lunii',
  	"hero_cta_note" varchar DEFAULT 'de la 55 lei / lună · livrat prin poștă',
  	"envelope_eyebrow" varchar DEFAULT 'Ediția fiecărei luni',
  	"envelope_title" varchar DEFAULT 'Ce găsești în plic?',
  	"envelope_outro" varchar DEFAULT 'Un plic mic care face loc pentru două lucruri: ceva frumos pentru tine și puțin bine pentru un animal.',
  	"about_photo_caption" varchar DEFAULT 'eu și Bella',
  	"about_photo_alt" varchar DEFAULT 'Adina îmbrățișând-o pe Bella, cățelușa ei adoptată',
  	"about_signature" varchar DEFAULT '— Adina 🌙',
  	"donation_eyebrow" varchar DEFAULT 'Poșta Lunii înseamnă și…',
  	"donation_title_amount" varchar DEFAULT '15 lei',
  	"donation_title_middle" varchar DEFAULT 'din fiecare plic',
  	"donation_title_target" varchar DEFAULT 'Adăpostul Speranța',
  	"donation_text" varchar DEFAULT 'Vreau ca Poșta Lunii să fie mai mult decât un abonament la lucruri drăguțe. Cu fiecare plic cumpărat, contribui direct la sprijinirea animalelor aflate în grija Adăpostului Speranța.',
  	"donation_refrain_left" varchar DEFAULT 'Tu primești o scrisoare.',
  	"donation_refrain_right" varchar DEFAULT 'Un animal primește puțin ajutor.',
  	"pricing_eyebrow" varchar DEFAULT 'Abonament',
  	"pricing_title" varchar DEFAULT 'Alege cum vrei să primești Poșta Lunii',
  	"pricing_note" varchar DEFAULT 'Din fiecare plic, 15 lei merg către Adăpostul Speranța.',
  	"closing_text" varchar DEFAULT 'Pentru cei care încă iubesc să primească scrisori, păstrează bilețele între paginile cărților și vor să iasă puțin din zgomotul online.',
  	"closing_cta_label" varchar DEFAULT 'Vreau Poșta Lunii',
  	"faq_enabled" boolean DEFAULT false,
  	"faq_eyebrow" varchar DEFAULT 'Întrebări',
  	"faq_title" varchar DEFAULT 'Ce e bine să știi',
  	"footer_instagram_label" varchar DEFAULT '@adina.creeaza',
  	"footer_base_note" varchar DEFAULT '15 lei din fiecare plic → Adăpostul Speranța',
  	"footer_copyright" varchar DEFAULT '© 2026 Poșta Lunii',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "navigation_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "navigation" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"cta_label" varchar DEFAULT 'Abonează-te',
  	"cta_href" varchar DEFAULT '#preturi',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"site_name" varchar DEFAULT 'Poșta Lunii' NOT NULL,
  	"tagline" varchar DEFAULT 'Un plic pentru tine. Un mic ajutor pentru un animal din adăpost.',
  	"instagram_url" varchar DEFAULT 'https://www.instagram.com/adina.creeaza/',
  	"meta_title" varchar DEFAULT 'Poșta Lunii — abonament lunar prin poștă, cu 15 lei pentru adăpost',
  	"meta_description" varchar DEFAULT 'Un abonament lunar prin poștă: o scrisoare, un exercițiu de journaling, o recomandare de carte și mici surprize. 15 lei din fiecare plic merg către Adăpostul Speranța.',
  	"keywords" varchar DEFAULT 'abonament lunar, scrisoare prin poștă, journaling, jurnal, recomandare de carte, cadou, Poșta Lunii, adăpost animale, Adăpostul Speranța',
  	"og_image_id" integer,
  	"noindex" boolean DEFAULT false,
  	"donation_amount" varchar DEFAULT '15 lei',
  	"shelter_name" varchar DEFAULT 'Adăpostul Speranța',
  	"price_from" varchar DEFAULT '55',
  	"price_monthly" varchar DEFAULT '60',
  	"currency" varchar DEFAULT 'RON',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_orders_fk" FOREIGN KEY ("orders_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_withdrawals_fk" FOREIGN KEY ("withdrawals_id") REFERENCES "public"."withdrawals"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_envelope_items" ADD CONSTRAINT "landing_envelope_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_about_paragraphs" ADD CONSTRAINT "landing_about_paragraphs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pricing_plans_payment_options" ADD CONSTRAINT "landing_pricing_plans_payment_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_pricing_plans"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_pricing_plans" ADD CONSTRAINT "landing_pricing_plans_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_faq_items" ADD CONSTRAINT "landing_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_items" ADD CONSTRAINT "navigation_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "settings" ADD CONSTRAINT "settings_og_image_id_media_id_fk" FOREIGN KEY ("og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_full_sizes_full_filename_idx" ON "media" USING btree ("sizes_full_filename");
  CREATE UNIQUE INDEX "orders_reference_idx" ON "orders" USING btree ("reference");
  CREATE UNIQUE INDEX "orders_stripe_session_id_idx" ON "orders" USING btree ("stripe_session_id");
  CREATE INDEX "orders_updated_at_idx" ON "orders" USING btree ("updated_at");
  CREATE INDEX "orders_created_at_idx" ON "orders" USING btree ("created_at");
  CREATE UNIQUE INDEX "withdrawals_reference_idx" ON "withdrawals" USING btree ("reference");
  CREATE INDEX "withdrawals_updated_at_idx" ON "withdrawals" USING btree ("updated_at");
  CREATE INDEX "withdrawals_created_at_idx" ON "withdrawals" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_orders_id_idx" ON "payload_locked_documents_rels" USING btree ("orders_id");
  CREATE INDEX "payload_locked_documents_rels_withdrawals_id_idx" ON "payload_locked_documents_rels" USING btree ("withdrawals_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "landing_envelope_items_order_idx" ON "landing_envelope_items" USING btree ("_order");
  CREATE INDEX "landing_envelope_items_parent_id_idx" ON "landing_envelope_items" USING btree ("_parent_id");
  CREATE INDEX "landing_about_paragraphs_order_idx" ON "landing_about_paragraphs" USING btree ("_order");
  CREATE INDEX "landing_about_paragraphs_parent_id_idx" ON "landing_about_paragraphs" USING btree ("_parent_id");
  CREATE INDEX "landing_pricing_plans_payment_options_order_idx" ON "landing_pricing_plans_payment_options" USING btree ("_order");
  CREATE INDEX "landing_pricing_plans_payment_options_parent_id_idx" ON "landing_pricing_plans_payment_options" USING btree ("_parent_id");
  CREATE INDEX "landing_pricing_plans_order_idx" ON "landing_pricing_plans" USING btree ("_order");
  CREATE INDEX "landing_pricing_plans_parent_id_idx" ON "landing_pricing_plans" USING btree ("_parent_id");
  CREATE INDEX "landing_faq_items_order_idx" ON "landing_faq_items" USING btree ("_order");
  CREATE INDEX "landing_faq_items_parent_id_idx" ON "landing_faq_items" USING btree ("_parent_id");
  CREATE INDEX "navigation_items_order_idx" ON "navigation_items" USING btree ("_order");
  CREATE INDEX "navigation_items_parent_id_idx" ON "navigation_items" USING btree ("_parent_id");
  CREATE INDEX "settings_og_image_idx" ON "settings" USING btree ("og_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "orders" CASCADE;
  DROP TABLE "withdrawals" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "landing_envelope_items" CASCADE;
  DROP TABLE "landing_about_paragraphs" CASCADE;
  DROP TABLE "landing_pricing_plans_payment_options" CASCADE;
  DROP TABLE "landing_pricing_plans" CASCADE;
  DROP TABLE "landing_faq_items" CASCADE;
  DROP TABLE "landing" CASCADE;
  DROP TABLE "navigation_items" CASCADE;
  DROP TABLE "navigation" CASCADE;
  DROP TABLE "settings" CASCADE;
  DROP TYPE "public"."enum_orders_status";
  DROP TYPE "public"."enum_orders_variant";
  DROP TYPE "public"."enum_withdrawals_product";
  DROP TYPE "public"."enum_withdrawals_status";
  DROP TYPE "public"."enum_landing_envelope_items_variant";`)
}
