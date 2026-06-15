import { pgTable, serial, integer, text, timestamp } from 'drizzle-orm/pg-core'

export const articles = pgTable('articles', {
  id:           serial('id').primaryKey(),
  hnId:         integer('hn_id').notNull().unique(),
  title:        text('title').notNull(),
  url:          text('url'),
  score:        integer('score').notNull().default(0),
  author:       text('author').notNull(),
  commentCount: integer('comment_count').notNull().default(0),
  fetchedAt:    timestamp('fetched_at').notNull().defaultNow(),
})

export type Article = typeof articles.$inferSelect
export type NewArticle = typeof articles.$inferInsert
