import { pgTable, text, serial, integer, boolean, timestamp, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  displayName: text("display_name").notNull(),
  theme: text("theme").notNull().default("light"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const entries = pgTable("entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  mood: integer("mood"), // 1-5 scale
  moodEmoji: text("mood_emoji"),
  tags: text("tags").array().default([]),
  attachments: jsonb("attachments").default([]),
  isVoiceNote: boolean("is_voice_note").default(false),
  wordCount: integer("word_count").default(0),
  aiInsights: jsonb("ai_insights"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const moodLogs = pgTable("mood_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  entryId: integer("entry_id"),
  mood: integer("mood").notNull(), // 1-5 scale
  moodEmoji: text("mood_emoji").notNull(),
  tags: text("tags").array().default([]),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiAnalytics = pgTable("ai_analytics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  period: text("period").notNull(), // daily, weekly, monthly
  moodAverage: real("mood_average"),
  sentimentScore: real("sentiment_score"),
  keyTopics: text("key_topics").array().default([]),
  insights: jsonb("insights"),
  suggestions: text("suggestions").array().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  reminderTime: text("reminder_time"),
  reminderEnabled: boolean("reminder_enabled").default(true),
  fontSize: text("font_size").default("medium"),
  fontFamily: text("font_family").default("Inter"),
  autoSave: boolean("auto_save").default(true),
  biometricEnabled: boolean("biometric_enabled").default(false),
  exportFormat: text("export_format").default("pdf"),
  offlineMode: boolean("offline_mode").default(true),
  syncEnabled: boolean("sync_enabled").default(true),
  encryption: boolean("encryption").default(true),
  customTheme: text("custom_theme").default("system"),
  backgroundTexture: text("background_texture").default("none"),
  lineHeight: text("line_height").default("relaxed"),
  privacyMode: boolean("privacy_mode").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertEntrySchema = createInsertSchema(entries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  wordCount: true,
  aiInsights: true,
});

export const insertMoodLogSchema = createInsertSchema(moodLogs).omit({
  id: true,
  createdAt: true,
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Entry = typeof entries.$inferSelect;
export type InsertEntry = z.infer<typeof insertEntrySchema>;

export type MoodLog = typeof moodLogs.$inferSelect;
export type InsertMoodLog = z.infer<typeof insertMoodLogSchema>;

export type AIAnalytics = typeof aiAnalytics.$inferSelect;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;

// API response types
export interface DashboardStats {
  streak: number;
  totalEntries: number;
  averageMood: number;
  wellnessScore: number;
}

export interface AIInsight {
  type: "mood_pattern" | "suggestion" | "topic_analysis" | "wellness_tip";
  title: string;
  description: string;
  confidence: number;
}

export interface SearchFilters {
  query?: string;
  mood?: number[];
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
}
