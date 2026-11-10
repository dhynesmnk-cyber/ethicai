import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

import { applyContentDefaults } from '../content/apply-defaults'

// Photography redesign:
// 1. Removes the Home/About stats strip (the "counters") and its `page_copy_stats` table. The
//    four stats were starting copy (src/content/defaults.ts, still in git history); the client
//    asked for them to go. The site isn't live yet, so no production data is lost.
// 2. Adds a Photos tab to Page copy: one optional upload per page, replacing the bundled photo.
// 3. Writes "A.I." as "AI" in the editable copy (the client's spelling), so existing databases
//    match the new defaults. Only plain-text copy fields are touched; articles already say "AI".
//    `replace` is literal, so nothing else in those fields changes.
// 4. On an empty database, writes the starting copy (moved here from family_redesign, see below).

// Every plain-text copy field an editor can see (checked against the schema on 10 November 2026).
const COPY_COLUMNS: Record<string, string[]> = {
  page_copy: [
    'hero_eyebrow',
    'hero_headline',
    'hero_subhead',
    'statement',
    'about_headline',
    'about_lead',
    'about_story',
    'services_intro',
  ],
  page_copy_faq: ['question', 'answer'],
  page_copy_services_steps: ['title', 'body'],
  services: ['title', 'summary'],
  services_faq: ['question', 'answer'],
  site_settings: [
    'announcement_text',
    'selma_tagline',
    'selma_summary',
    'organisation_acknowledgement',
    'organisation_inclusion',
  ],
  site_settings_selma_suite: ['name', 'kicker', 'description'],
}

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "page_copy_stats" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "page_copy_stats" CASCADE;
  ALTER TABLE "page_copy" ADD COLUMN "photos_about_id" integer;
  ALTER TABLE "page_copy" ADD COLUMN "photos_services_id" integer;
  ALTER TABLE "page_copy" ADD COLUMN "photos_articles_id" integer;
  ALTER TABLE "page_copy" ADD COLUMN "photos_watch_id" integer;
  ALTER TABLE "page_copy" ADD COLUMN "photos_newsletter_id" integer;
  ALTER TABLE "page_copy" ADD COLUMN "photos_contact_id" integer;
  ALTER TABLE "page_copy" ADD COLUMN "photos_selma_id" integer;
  ALTER TABLE "page_copy" ADD COLUMN "photos_closing_id" integer;
  ALTER TABLE "page_copy" ADD CONSTRAINT "page_copy_photos_about_id_media_id_fk" FOREIGN KEY ("photos_about_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_copy" ADD CONSTRAINT "page_copy_photos_services_id_media_id_fk" FOREIGN KEY ("photos_services_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_copy" ADD CONSTRAINT "page_copy_photos_articles_id_media_id_fk" FOREIGN KEY ("photos_articles_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_copy" ADD CONSTRAINT "page_copy_photos_watch_id_media_id_fk" FOREIGN KEY ("photos_watch_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_copy" ADD CONSTRAINT "page_copy_photos_newsletter_id_media_id_fk" FOREIGN KEY ("photos_newsletter_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_copy" ADD CONSTRAINT "page_copy_photos_contact_id_media_id_fk" FOREIGN KEY ("photos_contact_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_copy" ADD CONSTRAINT "page_copy_photos_selma_id_media_id_fk" FOREIGN KEY ("photos_selma_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_copy" ADD CONSTRAINT "page_copy_photos_closing_id_media_id_fk" FOREIGN KEY ("photos_closing_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "page_copy_photos_photos_about_idx" ON "page_copy" USING btree ("photos_about_id");
  CREATE INDEX "page_copy_photos_photos_services_idx" ON "page_copy" USING btree ("photos_services_id");
  CREATE INDEX "page_copy_photos_photos_articles_idx" ON "page_copy" USING btree ("photos_articles_id");
  CREATE INDEX "page_copy_photos_photos_watch_idx" ON "page_copy" USING btree ("photos_watch_id");
  CREATE INDEX "page_copy_photos_photos_newsletter_idx" ON "page_copy" USING btree ("photos_newsletter_id");
  CREATE INDEX "page_copy_photos_photos_contact_idx" ON "page_copy" USING btree ("photos_contact_id");
  CREATE INDEX "page_copy_photos_photos_selma_idx" ON "page_copy" USING btree ("photos_selma_id");
  CREATE INDEX "page_copy_photos_photos_closing_idx" ON "page_copy" USING btree ("photos_closing_id");`)

  let fixed = 0
  for (const [table, columns] of Object.entries(COPY_COLUMNS)) {
    for (const column of columns) {
      const t = sql.identifier(table)
      const c = sql.identifier(column)
      const result = await db.execute(
        sql`UPDATE ${t} SET ${c} = replace(${c}, 'A.I.', 'AI') WHERE ${c} LIKE '%A.I.%'`,
      )
      fixed += result.rowCount ?? 0
    }
  }
  payload.logger.info(`photos_and_ai: wrote "A.I." as "AI" in ${fixed} field(s)`)

  // Starting copy (src/content/defaults.ts), only on a database whose Page copy has never been
  // saved: databases that already had it (written by family_redesign before this migration
  // existed) are left alone, so a field an editor deliberately emptied is never refilled.
  // DECISION: here rather than in the build or the seed, so any `payload migrate` (Netlify, or a
  // machine) fills a new production database exactly once, as family_redesign used to.
  // It uses the Local API, which reads the *current* config, so it must live in the newest
  // migration: tests/unit/migrations.test.ts fails until it's moved into a newer one.
  const { rows } = await db.execute(sql`SELECT 1 FROM "page_copy" LIMIT 1`)
  if (rows.length === 0) {
    const changed = await applyContentDefaults({ payload, req })
    if (changed.length > 0) payload.logger.info(`photos_and_ai: filled ${changed.join('; ')}`)
  }
}

// `down` restores the schema only: the stats table comes back empty, and "AI" is not turned back
// into "A.I." (there's no record of which fields used it).
export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "page_copy_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL,
  	"label" varchar NOT NULL
  );
  
  ALTER TABLE "page_copy" DROP CONSTRAINT IF EXISTS "page_copy_photos_about_id_media_id_fk";
  
  ALTER TABLE "page_copy" DROP CONSTRAINT IF EXISTS "page_copy_photos_services_id_media_id_fk";
  
  ALTER TABLE "page_copy" DROP CONSTRAINT IF EXISTS "page_copy_photos_articles_id_media_id_fk";
  
  ALTER TABLE "page_copy" DROP CONSTRAINT IF EXISTS "page_copy_photos_watch_id_media_id_fk";
  
  ALTER TABLE "page_copy" DROP CONSTRAINT IF EXISTS "page_copy_photos_newsletter_id_media_id_fk";
  
  ALTER TABLE "page_copy" DROP CONSTRAINT IF EXISTS "page_copy_photos_contact_id_media_id_fk";
  
  ALTER TABLE "page_copy" DROP CONSTRAINT IF EXISTS "page_copy_photos_selma_id_media_id_fk";
  
  ALTER TABLE "page_copy" DROP CONSTRAINT IF EXISTS "page_copy_photos_closing_id_media_id_fk";
  
  DROP INDEX IF EXISTS "page_copy_photos_photos_about_idx";
  DROP INDEX IF EXISTS "page_copy_photos_photos_services_idx";
  DROP INDEX IF EXISTS "page_copy_photos_photos_articles_idx";
  DROP INDEX IF EXISTS "page_copy_photos_photos_watch_idx";
  DROP INDEX IF EXISTS "page_copy_photos_photos_newsletter_idx";
  DROP INDEX IF EXISTS "page_copy_photos_photos_contact_idx";
  DROP INDEX IF EXISTS "page_copy_photos_photos_selma_idx";
  DROP INDEX IF EXISTS "page_copy_photos_photos_closing_idx";
  ALTER TABLE "page_copy_stats" ADD CONSTRAINT "page_copy_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_copy"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX IF NOT EXISTS "page_copy_stats_order_idx" ON "page_copy_stats" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "page_copy_stats_parent_id_idx" ON "page_copy_stats" USING btree ("_parent_id");
  ALTER TABLE "page_copy" DROP COLUMN IF EXISTS "photos_about_id";
  ALTER TABLE "page_copy" DROP COLUMN IF EXISTS "photos_services_id";
  ALTER TABLE "page_copy" DROP COLUMN IF EXISTS "photos_articles_id";
  ALTER TABLE "page_copy" DROP COLUMN IF EXISTS "photos_watch_id";
  ALTER TABLE "page_copy" DROP COLUMN IF EXISTS "photos_newsletter_id";
  ALTER TABLE "page_copy" DROP COLUMN IF EXISTS "photos_contact_id";
  ALTER TABLE "page_copy" DROP COLUMN IF EXISTS "photos_selma_id";
  ALTER TABLE "page_copy" DROP COLUMN IF EXISTS "photos_closing_id";`)
}
