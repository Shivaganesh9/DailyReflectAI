import { 
  users, entries, moodLogs, aiAnalytics, userPreferences,
  type User, type InsertUser, type Entry, type InsertEntry, 
  type MoodLog, type InsertMoodLog, type UserPreferences,
  type InsertUserPreferences, type DashboardStats, type SearchFilters
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, lte, like, inArray, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Entry operations
  getEntries(userId: number, limit?: number, offset?: number): Promise<Entry[]>;
  getEntry(id: number, userId: number): Promise<Entry | undefined>;
  createEntry(entry: InsertEntry): Promise<Entry>;
  updateEntry(id: number, userId: number, entry: Partial<Entry>): Promise<Entry | undefined>;
  deleteEntry(id: number, userId: number): Promise<boolean>;
  searchEntries(userId: number, filters: SearchFilters): Promise<Entry[]>;
  getEntriesByDateRange(userId: number, startDate: Date, endDate: Date): Promise<Entry[]>;

  // Mood operations
  getMoodLogs(userId: number, limit?: number): Promise<MoodLog[]>;
  createMoodLog(moodLog: InsertMoodLog): Promise<MoodLog>;
  getMoodLogsByDateRange(userId: number, startDate: Date, endDate: Date): Promise<MoodLog[]>;

  // Analytics
  getDashboardStats(userId: number): Promise<DashboardStats>;
  getUserPreferences(userId: number): Promise<UserPreferences | undefined>;
  updateUserPreferences(userId: number, preferences: Partial<InsertUserPreferences>): Promise<UserPreferences>;
}

export class DatabaseStorage implements IStorage {

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date(),
      theme: "light"
    };
    this.users.set(id, user);

    // Create default preferences
    const defaultPrefs: UserPreferences = {
      id: this.currentId++,
      userId: id,
      reminderTime: "20:00",
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
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.userPreferences.set(id, defaultPrefs);

    return user;
  }

  async getEntries(userId: number, limit = 50, offset = 0): Promise<Entry[]> {
    const userEntries = Array.from(this.entries.values())
      .filter(entry => entry.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(offset, offset + limit);
    return userEntries;
  }

  async getEntry(id: number, userId: number): Promise<Entry | undefined> {
    const entry = this.entries.get(id);
    return entry && entry.userId === userId ? entry : undefined;
  }

  async createEntry(insertEntry: InsertEntry): Promise<Entry> {
    const id = this.currentId++;
    const now = new Date();
    const wordCount = insertEntry.content.split(/\s+/).length;
    
    const entry: Entry = {
      ...insertEntry,
      id,
      wordCount,
      aiInsights: null,
      createdAt: now,
      updatedAt: now,
    };
    this.entries.set(id, entry);
    return entry;
  }

  async updateEntry(id: number, userId: number, updateData: Partial<Entry>): Promise<Entry | undefined> {
    const entry = this.entries.get(id);
    if (!entry || entry.userId !== userId) return undefined;

    const updatedEntry: Entry = {
      ...entry,
      ...updateData,
      id,
      userId,
      updatedAt: new Date(),
    };

    if (updateData.content) {
      updatedEntry.wordCount = updateData.content.split(/\s+/).length;
    }

    this.entries.set(id, updatedEntry);
    return updatedEntry;
  }

  async deleteEntry(id: number, userId: number): Promise<boolean> {
    const entry = this.entries.get(id);
    if (!entry || entry.userId !== userId) return false;
    return this.entries.delete(id);
  }

  async searchEntries(userId: number, filters: SearchFilters): Promise<Entry[]> {
    let userEntries = Array.from(this.entries.values())
      .filter(entry => entry.userId === userId);

    if (filters.query) {
      const query = filters.query.toLowerCase();
      userEntries = userEntries.filter(entry => 
        entry.title.toLowerCase().includes(query) ||
        entry.content.toLowerCase().includes(query) ||
        entry.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    if (filters.mood && filters.mood.length > 0) {
      userEntries = userEntries.filter(entry => 
        entry.mood && filters.mood!.includes(entry.mood)
      );
    }

    if (filters.tags && filters.tags.length > 0) {
      userEntries = userEntries.filter(entry =>
        filters.tags!.some(tag => entry.tags.includes(tag))
      );
    }

    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      userEntries = userEntries.filter(entry => 
        new Date(entry.createdAt) >= fromDate
      );
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      userEntries = userEntries.filter(entry => 
        new Date(entry.createdAt) <= toDate
      );
    }

    return userEntries.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getEntriesByDateRange(userId: number, startDate: Date, endDate: Date): Promise<Entry[]> {
    return Array.from(this.entries.values())
      .filter(entry => 
        entry.userId === userId &&
        new Date(entry.createdAt) >= startDate &&
        new Date(entry.createdAt) <= endDate
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getMoodLogs(userId: number, limit = 30): Promise<MoodLog[]> {
    return Array.from(this.moodLogs.values())
      .filter(log => log.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async createMoodLog(insertMoodLog: InsertMoodLog): Promise<MoodLog> {
    const id = this.currentId++;
    const moodLog: MoodLog = {
      ...insertMoodLog,
      id,
      createdAt: new Date(),
    };
    this.moodLogs.set(id, moodLog);
    return moodLog;
  }

  async getMoodLogsByDateRange(userId: number, startDate: Date, endDate: Date): Promise<MoodLog[]> {
    return Array.from(this.moodLogs.values())
      .filter(log => 
        log.userId === userId &&
        new Date(log.createdAt) >= startDate &&
        new Date(log.createdAt) <= endDate
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getDashboardStats(userId: number): Promise<DashboardStats> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    const userEntries = Array.from(this.entries.values())
      .filter(entry => entry.userId === userId);

    const recentEntries = userEntries.filter(entry => 
      new Date(entry.createdAt) >= thirtyDaysAgo
    );

    // Calculate streak
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      
      const hasEntry = userEntries.some(entry => {
        const entryDate = new Date(entry.createdAt);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate.getTime() === checkDate.getTime();
      });
      
      if (hasEntry) {
        streak++;
      } else if (i > 0) { // Allow for today to not have an entry yet
        break;
      }
    }

    // Calculate average mood
    const moodsInPeriod = userEntries
      .filter(entry => entry.mood && new Date(entry.createdAt) >= thirtyDaysAgo)
      .map(entry => entry.mood!);
    
    const averageMood = moodsInPeriod.length > 0 
      ? moodsInPeriod.reduce((sum, mood) => sum + mood, 0) / moodsInPeriod.length 
      : 0;

    // Calculate wellness score (based on consistency, mood, and activity)
    const consistencyScore = Math.min(100, (recentEntries.length / 30) * 100);
    const moodScore = (averageMood / 5) * 100;
    const wellnessScore = Math.round((consistencyScore * 0.6) + (moodScore * 0.4));

    return {
      streak,
      totalEntries: userEntries.length,
      averageMood: Math.round(averageMood * 10) / 10,
      wellnessScore,
    };
  }

  async getUserPreferences(userId: number): Promise<UserPreferences | undefined> {
    return this.userPreferences.get(userId);
  }

  async updateUserPreferences(userId: number, preferences: Partial<InsertUserPreferences>): Promise<UserPreferences> {
    const existing = this.userPreferences.get(userId);
    if (!existing) {
      throw new Error("User preferences not found");
    }

    const updated: UserPreferences = {
      ...existing,
      ...preferences,
      updatedAt: new Date(),
    };

    this.userPreferences.set(userId, updated);
    return updated;
  }
}

import { DatabaseStorage } from "./database-storage";

export const storage = new DatabaseStorage();
