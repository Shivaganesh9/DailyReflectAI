import { 
  users, entries, moodLogs, userPreferences,
  type User, type InsertUser, type Entry, type InsertEntry, 
  type MoodLog, type InsertMoodLog, type UserPreferences,
  type InsertUserPreferences, type DashboardStats, type SearchFilters
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, lte, like, inArray, sql } from "drizzle-orm";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    
    // Create default preferences
    await db.insert(userPreferences).values({
      userId: user.id,
      reminderTime: null,
      reminderEnabled: true,
      fontSize: "medium",
      fontFamily: "Inter",
      autoSave: true,
      biometricEnabled: false,
      exportFormat: "pdf",
      offlineMode: true,
      syncEnabled: true,
      encryption: true,
      customTheme: "system",
      backgroundTexture: "none",
      lineHeight: "relaxed",
      privacyMode: false,
    });

    return user;
  }

  async getEntries(userId: number, limit = 50, offset = 0): Promise<Entry[]> {
    return await db
      .select()
      .from(entries)
      .where(eq(entries.userId, userId))
      .orderBy(desc(entries.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getEntry(id: number, userId: number): Promise<Entry | undefined> {
    const [entry] = await db
      .select()
      .from(entries)
      .where(and(eq(entries.id, id), eq(entries.userId, userId)));
    return entry;
  }

  async createEntry(insertEntry: InsertEntry): Promise<Entry> {
    const wordCount = insertEntry.content.split(/\s+/).length;
    const [entry] = await db
      .insert(entries)
      .values({
        ...insertEntry,
        wordCount,
        aiInsights: null,
        attachments: insertEntry.attachments || null,
        mood: insertEntry.mood || null,
        moodEmoji: insertEntry.moodEmoji || null,
        tags: insertEntry.tags || null,
        isVoiceNote: insertEntry.isVoiceNote || null,
      })
      .returning();
    return entry;
  }

  async updateEntry(id: number, userId: number, updateData: Partial<Entry>): Promise<Entry | undefined> {
    const [entry] = await db
      .update(entries)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(and(eq(entries.id, id), eq(entries.userId, userId)))
      .returning();
    return entry;
  }

  async deleteEntry(id: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(entries)
      .where(and(eq(entries.id, id), eq(entries.userId, userId)));
    return result.rowCount > 0;
  }

  async searchEntries(userId: number, filters: SearchFilters): Promise<Entry[]> {
    let query = db
      .select()
      .from(entries)
      .where(eq(entries.userId, userId));

    const conditions = [eq(entries.userId, userId)];

    if (filters.query) {
      conditions.push(
        sql`(${entries.title} ILIKE ${`%${filters.query}%`} OR ${entries.content} ILIKE ${`%${filters.query}%`})`
      );
    }

    if (filters.mood && filters.mood.length > 0) {
      conditions.push(inArray(entries.mood, filters.mood));
    }

    if (filters.tags && filters.tags.length > 0) {
      conditions.push(
        sql`${entries.tags} && ${filters.tags}`
      );
    }

    if (filters.dateFrom) {
      conditions.push(gte(entries.createdAt, new Date(filters.dateFrom)));
    }

    if (filters.dateTo) {
      conditions.push(lte(entries.createdAt, new Date(filters.dateTo)));
    }

    return await db
      .select()
      .from(entries)
      .where(and(...conditions))
      .orderBy(desc(entries.createdAt));
  }

  async getEntriesByDateRange(userId: number, startDate: Date, endDate: Date): Promise<Entry[]> {
    return await db
      .select()
      .from(entries)
      .where(
        and(
          eq(entries.userId, userId),
          gte(entries.createdAt, startDate),
          lte(entries.createdAt, endDate)
        )
      )
      .orderBy(desc(entries.createdAt));
  }

  async getMoodLogs(userId: number, limit = 30): Promise<MoodLog[]> {
    return await db
      .select()
      .from(moodLogs)
      .where(eq(moodLogs.userId, userId))
      .orderBy(desc(moodLogs.createdAt))
      .limit(limit);
  }

  async createMoodLog(insertMoodLog: InsertMoodLog): Promise<MoodLog> {
    const [moodLog] = await db
      .insert(moodLogs)
      .values({
        ...insertMoodLog,
        tags: insertMoodLog.tags || null,
        entryId: insertMoodLog.entryId || null,
        notes: insertMoodLog.notes || null,
      })
      .returning();
    return moodLog;
  }

  async getMoodLogsByDateRange(userId: number, startDate: Date, endDate: Date): Promise<MoodLog[]> {
    return await db
      .select()
      .from(moodLogs)
      .where(
        and(
          eq(moodLogs.userId, userId),
          gte(moodLogs.createdAt, startDate),
          lte(moodLogs.createdAt, endDate)
        )
      )
      .orderBy(desc(moodLogs.createdAt));
  }

  async getDashboardStats(userId: number): Promise<DashboardStats> {
    const [entryCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(entries)
      .where(eq(entries.userId, userId));

    const [avgMood] = await db
      .select({ avg: sql<number>`avg(${entries.mood})` })
      .from(entries)
      .where(and(eq(entries.userId, userId), sql`${entries.mood} IS NOT NULL`));

    // Calculate streak (consecutive days with entries)
    const recentEntries = await db
      .select({ date: sql<string>`date(${entries.createdAt})` })
      .from(entries)
      .where(eq(entries.userId, userId))
      .groupBy(sql`date(${entries.createdAt})`)
      .orderBy(desc(sql`date(${entries.createdAt})`))
      .limit(30);

    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    let currentDate = new Date(today);
    
    for (const entry of recentEntries) {
      const entryDate = entry.date;
      const expectedDate = currentDate.toISOString().split('T')[0];
      
      if (entryDate === expectedDate) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return {
      streak,
      totalEntries: entryCount.count,
      averageMood: avgMood.avg || 0,
      wellnessScore: Math.round((avgMood.avg || 0) * 20), // Convert 1-5 scale to 0-100
    };
  }

  async getUserPreferences(userId: number): Promise<UserPreferences | undefined> {
    const [prefs] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId));
    return prefs;
  }

  async updateUserPreferences(userId: number, preferences: Partial<InsertUserPreferences>): Promise<UserPreferences> {
    const [updated] = await db
      .update(userPreferences)
      .set({
        ...preferences,
        updatedAt: new Date(),
      })
      .where(eq(userPreferences.userId, userId))
      .returning();
    return updated;
  }
}