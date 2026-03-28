import { pgTable, uuid, text, jsonb, timestamp, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const pipelines = pgTable('pipelines', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  sourceUrl: varchar('source_url', { length: 255 }).notNull().unique(),
  actionType: varchar('action_type', { length: 50 }).notNull(), // مثل 'TRANSFORM_TEXT'
  createdAt: timestamp('created_at').defaultNow(),

});
export type Pipelines=  typeof pipelines.$inferInsert;

export const subscribers = pgTable('subscribers', {
  id: uuid('id').primaryKey().defaultRandom(),
  pipelineId: uuid('pipeline_id').references(() => pipelines.id),
  targetUrl: text('target_url').notNull(),
});
export type Subscribers=  typeof subscribers.$inferInsert;

export const jobs = pgTable('jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  pipelineId: uuid('pipeline_id').references(() => pipelines.id),
  payload: jsonb('payload').notNull(),
  status: varchar('status', { length: 20 }).default('pending'), // pending, completed, failed
  result: jsonb('result'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
});

export type Jobs=  typeof jobs.$inferInsert;
export const pipelinesRelations = relations(pipelines, ({ many }) => ({
  jobs: many(jobs),
  subscribers: many(subscribers),
}));

// علاقات جدول Jobs
export const jobsRelations = relations(jobs, ({ one }) => ({
  pipeline: one(pipelines, {
    fields: [jobs.pipelineId],
    references: [pipelines.id],
  }),
}));

// علاقات جدول Subscribers
export const subscribersRelations = relations(subscribers, ({ one }) => ({
  pipeline: one(pipelines, {
    fields: [subscribers.pipelineId],
    references: [pipelines.id],
  }),
}));