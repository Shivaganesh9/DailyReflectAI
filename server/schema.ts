// schema.ts
import {
  mysqlTable,
  int,
  varchar,
  datetime,
  boolean,
  text,
  json,
  serial,
  mysqlEnum
} from 'drizzle-orm/mysql-core';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';

export const users = mysqlTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  createdAt: datetime('created_at').default(new Date()),
});

export const userPreferences = mysqlTable('user_preferences', {
  userId: int('user_id').primaryKey(),
  reminderTime: varchar('reminder_time', { length: 255 }),
  reminderEnabled: boolean('reminder_enabled').default(true),
  fontSize: varchar('font_size', { length: 50 }).default('medium'),
  fontFamily: varchar('font_family', { length: 100 }).default('Inter'),
  autoSave: boolean('auto_save').default(true),
  biometricEnabled: boolean('biometric_enabled').default(false),
  exportFormat: varchar('export_format', { length: 10 }).default('pdf'),
  offlineMode: boolean('offline_mode').default(true),
  syncEnabled: boolean('sync_enabled').default(true),
  encryption: boolean('encryption').default(true),
  customTheme: varchar('custom_theme', { length: 50 }).default('system'),
  backgroundTexture: varchar('background_texture', { length: 50 }).default('none'),
  lineHeight: varchar('line_height', { length: 50 }).default('relaxed'),
  privacyMode: boolean('privacy_mode').default(false),
  updatedAt: datetime('updated_at'),
});

export const entries = mysqlTable('entries', {
  id: serial('id').primaryKey(),
  userId: int('user_id').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  createdAt: datetime('created_at').default(new Date()),
  updatedAt: datetime('updated_at'),
  wordCount: int('word_count'),
  aiInsights: text('ai_insights'),
  attachments: text('attachments'),
  mood: int('mood'),
  moodEmoji: varchar('mood_emoji', { length: 10 }),
  tags: varchar('tags', { length: 255 }),
  isVoiceNote: boolean('is_voice_note'),
});

export const moodLogs = mysqlTable('mood_logs', {
  id: serial('id').primaryKey(),
  userId: int('user_id').notNull(),
  mood: int('mood'),
  tags: varchar('tags', { length: 255 }),
  entryId: int('entry_id'),
  notes: text('notes'),
  createdAt: datetime('created_at').default(new Date()),
});

export type User = InferSelectModel<typeof users>;
export type InsertUser = InferInsertModel<typeof users>;

export type Entry = InferSelectModel<typeof entries>;
export type InsertEntry = InferInsertModel<typeof entries>;

export type MoodLog = InferSelectModel<typeof moodLogs>;
export type InsertMoodLog = InferInsertModel<typeof moodLogs>;

export type UserPreferences = InferSelectModel<typeof userPreferences>;
export type InsertUserPreferences = InferInsertModel<typeof userPreferences>;

export type DashboardStats = {
  streak: number;
  totalEntries: number;
  averageMood: number;
  wellnessScore: number;
};

export type SearchFilters = {
  query?: string;
  mood?: number[];
  tags?: string[];
  dateFrom?: Date;
  dateTo?: Date;
};
