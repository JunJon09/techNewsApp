CREATE TABLE "articles" (
	"id" serial PRIMARY KEY NOT NULL,
	"hn_id" integer NOT NULL,
	"title" text NOT NULL,
	"url" text,
	"score" integer DEFAULT 0 NOT NULL,
	"author" text NOT NULL,
	"comment_count" integer DEFAULT 0 NOT NULL,
	"fetched_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "articles_hn_id_unique" UNIQUE("hn_id")
);
