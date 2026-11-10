import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Family redesign (docs/REDESIGN-PLAN.md §4): page copy global, Selma/organisation/search
// settings, services, team LinkedIn and credentials, author profiles and article key takeaways.
// The schema changes only add tables and columns. `down` removes only what `up` added.
//
// The starting copy used to be written here too. It goes through Payload's Local API, which reads
// the *current* config, so on an empty database it broke as soon as a later migration added a
// column. It now runs from the newest migration instead (see applyContentDefaultsOnce).

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_site_settings_search_ai_crawlers" AS ENUM('allow-all', 'search-only', 'block-all');
  CREATE TABLE "articles_key_takeaways" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"point" varchar
  );
  
  CREATE TABLE "_articles_v_version_key_takeaways" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"point" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "services_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL
  );
  
  CREATE TABLE "services" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"summary" varchar NOT NULL,
  	"body" jsonb NOT NULL,
  	"order" numeric DEFAULT 0,
  	"published" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "team_members_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "site_settings_selma_suite" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"kicker" varchar,
  	"description" varchar NOT NULL
  );
  
  CREATE TABLE "page_copy_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "page_copy_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL
  );
  
  CREATE TABLE "page_copy_press" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"outlet" varchar NOT NULL,
  	"headline" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"date" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_copy_services_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"body" varchar NOT NULL
  );
  
  CREATE TABLE "page_copy" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_eyebrow" varchar,
  	"hero_headline" varchar NOT NULL,
  	"hero_subhead" varchar,
  	"hero_image_id" integer,
  	"statement" varchar,
  	"about_headline" varchar NOT NULL,
  	"about_lead" varchar,
  	"about_story" varchar,
  	"services_intro" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "team_members" ADD COLUMN "linkedin_url" varchar;
  ALTER TABLE "users" ADD COLUMN "profile_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "services_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "selma_show" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "selma_url" varchar DEFAULT 'https://selma.au';
  ALTER TABLE "site_settings" ADD COLUMN "selma_waitlist_url" varchar DEFAULT 'https://selma.au/#waitlist';
  ALTER TABLE "site_settings" ADD COLUMN "selma_tagline" varchar DEFAULT 'AI that answers only to you.';
  ALTER TABLE "site_settings" ADD COLUMN "selma_summary" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "announcement_enabled" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "announcement_text" varchar DEFAULT 'Selma by EthicAI ships January 2027.';
  ALTER TABLE "site_settings" ADD COLUMN "announcement_link_label" varchar DEFAULT 'Join the waitlist';
  ALTER TABLE "site_settings" ADD COLUMN "announcement_link_url" varchar DEFAULT 'https://selma.au/#waitlist';
  ALTER TABLE "site_settings" ADD COLUMN "organisation_legal_name" varchar DEFAULT 'EthicAI Pty Ltd';
  ALTER TABLE "site_settings" ADD COLUMN "organisation_abn" varchar DEFAULT '13 686 628 848';
  ALTER TABLE "site_settings" ADD COLUMN "organisation_locality" varchar DEFAULT 'Sydney, NSW';
  ALTER TABLE "site_settings" ADD COLUMN "organisation_acknowledgement" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "organisation_inclusion" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "search_ai_crawlers" "enum_site_settings_search_ai_crawlers" DEFAULT 'allow-all' NOT NULL;
  ALTER TABLE "site_settings" ADD COLUMN "search_google_verification" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "search_bing_verification" varchar;
  ALTER TABLE "articles_key_takeaways" ADD CONSTRAINT "articles_key_takeaways_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_version_key_takeaways" ADD CONSTRAINT "_articles_v_version_key_takeaways_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_faq" ADD CONSTRAINT "services_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "team_members_texts" ADD CONSTRAINT "team_members_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."team_members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_selma_suite" ADD CONSTRAINT "site_settings_selma_suite_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_copy_stats" ADD CONSTRAINT "page_copy_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_copy"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_copy_faq" ADD CONSTRAINT "page_copy_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_copy"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_copy_press" ADD CONSTRAINT "page_copy_press_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_copy"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_copy_services_steps" ADD CONSTRAINT "page_copy_services_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_copy"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_copy" ADD CONSTRAINT "page_copy_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "articles_key_takeaways_order_idx" ON "articles_key_takeaways" USING btree ("_order");
  CREATE INDEX "articles_key_takeaways_parent_id_idx" ON "articles_key_takeaways" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_version_key_takeaways_order_idx" ON "_articles_v_version_key_takeaways" USING btree ("_order");
  CREATE INDEX "_articles_v_version_key_takeaways_parent_id_idx" ON "_articles_v_version_key_takeaways" USING btree ("_parent_id");
  CREATE INDEX "services_faq_order_idx" ON "services_faq" USING btree ("_order");
  CREATE INDEX "services_faq_parent_id_idx" ON "services_faq" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "services_slug_idx" ON "services" USING btree ("slug");
  CREATE INDEX "services_updated_at_idx" ON "services" USING btree ("updated_at");
  CREATE INDEX "services_created_at_idx" ON "services" USING btree ("created_at");
  CREATE INDEX "team_members_texts_order_parent" ON "team_members_texts" USING btree ("order","parent_id");
  CREATE INDEX "site_settings_selma_suite_order_idx" ON "site_settings_selma_suite" USING btree ("_order");
  CREATE INDEX "site_settings_selma_suite_parent_id_idx" ON "site_settings_selma_suite" USING btree ("_parent_id");
  CREATE INDEX "page_copy_stats_order_idx" ON "page_copy_stats" USING btree ("_order");
  CREATE INDEX "page_copy_stats_parent_id_idx" ON "page_copy_stats" USING btree ("_parent_id");
  CREATE INDEX "page_copy_faq_order_idx" ON "page_copy_faq" USING btree ("_order");
  CREATE INDEX "page_copy_faq_parent_id_idx" ON "page_copy_faq" USING btree ("_parent_id");
  CREATE INDEX "page_copy_press_order_idx" ON "page_copy_press" USING btree ("_order");
  CREATE INDEX "page_copy_press_parent_id_idx" ON "page_copy_press" USING btree ("_parent_id");
  CREATE INDEX "page_copy_services_steps_order_idx" ON "page_copy_services_steps" USING btree ("_order");
  CREATE INDEX "page_copy_services_steps_parent_id_idx" ON "page_copy_services_steps" USING btree ("_parent_id");
  CREATE INDEX "page_copy_hero_hero_image_idx" ON "page_copy" USING btree ("hero_image_id");
  ALTER TABLE "users" ADD CONSTRAINT "users_profile_id_team_members_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."team_members"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_profile_idx" ON "users" USING btree ("profile_id");
  CREATE INDEX "payload_locked_documents_rels_services_id_idx" ON "payload_locked_documents_rels" USING btree ("services_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "articles_key_takeaways" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articles_v_version_key_takeaways" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "team_members_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings_selma_suite" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_copy_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_copy_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_copy_press" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_copy_services_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_copy" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "articles_key_takeaways" CASCADE;
  DROP TABLE "_articles_v_version_key_takeaways" CASCADE;
  DROP TABLE "services_faq" CASCADE;
  DROP TABLE "services" CASCADE;
  DROP TABLE "team_members_texts" CASCADE;
  DROP TABLE "site_settings_selma_suite" CASCADE;
  DROP TABLE "page_copy_stats" CASCADE;
  DROP TABLE "page_copy_faq" CASCADE;
  DROP TABLE "page_copy_press" CASCADE;
  DROP TABLE "page_copy_services_steps" CASCADE;
  DROP TABLE "page_copy" CASCADE;
  ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_profile_id_team_members_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_services_fk";
  
  DROP INDEX IF EXISTS "users_profile_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_services_id_idx";
  ALTER TABLE "team_members" DROP COLUMN "linkedin_url";
  ALTER TABLE "users" DROP COLUMN "profile_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "services_id";
  ALTER TABLE "site_settings" DROP COLUMN "selma_show";
  ALTER TABLE "site_settings" DROP COLUMN "selma_url";
  ALTER TABLE "site_settings" DROP COLUMN "selma_waitlist_url";
  ALTER TABLE "site_settings" DROP COLUMN "selma_tagline";
  ALTER TABLE "site_settings" DROP COLUMN "selma_summary";
  ALTER TABLE "site_settings" DROP COLUMN "announcement_enabled";
  ALTER TABLE "site_settings" DROP COLUMN "announcement_text";
  ALTER TABLE "site_settings" DROP COLUMN "announcement_link_label";
  ALTER TABLE "site_settings" DROP COLUMN "announcement_link_url";
  ALTER TABLE "site_settings" DROP COLUMN "organisation_legal_name";
  ALTER TABLE "site_settings" DROP COLUMN "organisation_abn";
  ALTER TABLE "site_settings" DROP COLUMN "organisation_locality";
  ALTER TABLE "site_settings" DROP COLUMN "organisation_acknowledgement";
  ALTER TABLE "site_settings" DROP COLUMN "organisation_inclusion";
  ALTER TABLE "site_settings" DROP COLUMN "search_ai_crawlers";
  ALTER TABLE "site_settings" DROP COLUMN "search_google_verification";
  ALTER TABLE "site_settings" DROP COLUMN "search_bing_verification";
  DROP TYPE "public"."enum_site_settings_search_ai_crawlers";`)
}
