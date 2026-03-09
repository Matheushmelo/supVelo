import { sqliteTable, text, real } from 'drizzle-orm/sqlite-core';

export const conversations = sqliteTable('conversations', {
  id:         text('id').primaryKey(),
  clientName: text('client_name').notNull(),
  status:     text('status').notNull(),
  sector:     text('sector'),
  intent:     text('intent'),
  summary:    text('summary'),
  confidence: real('confidence'),
  createdAt:  text('created_at').notNull(),
  updatedAt:  text('updated_at').notNull(),
});

export const messages = sqliteTable('messages', {
  id:             text('id').primaryKey(),
  conversationId: text('conversation_id').notNull().references(() => conversations.id),
  role:           text('role').notNull(),
  content:        text('content').notNull(),
  createdAt:      text('created_at').notNull(),
});

// Tipos inferidos automaticamente pelo Drizzle
export type ConversationRow = typeof conversations.$inferSelect;
export type MessageRow      = typeof messages.$inferSelect;