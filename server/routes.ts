import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertEntrySchema, insertMoodLogSchema, insertUserPreferencesSchema,
  type SearchFilters 
} from "@shared/schema";
import { analyzeSentiment, generateInsights, generateWeeklyInsights, generateWritingPrompt } from "./ai";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage_multer = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage_multer,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|mp3|wav|m4a/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Mock user session - in production, use proper authentication
  app.use((req, res, next) => {
    req.user = { id: 1 }; // Mock user ID
    next();
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats(req.user.id);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Entries
  app.get("/api/entries", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const entries = await storage.getEntries(req.user.id, limit, offset);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch entries" });
    }
  });

  app.get("/api/entries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const entry = await storage.getEntry(id, req.user.id);
      if (!entry) {
        return res.status(404).json({ message: "Entry not found" });
      }
      res.json(entry);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch entry" });
    }
  });

  app.post("/api/entries", upload.array('attachments'), async (req, res) => {
    try {
      const validatedData = insertEntrySchema.parse(req.body);
      
      // Handle file attachments
      const attachments = (req.files as Express.Multer.File[])?.map(file => ({
        id: Date.now().toString(),
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: `/uploads/${file.filename}`
      })) || [];

      const entryData = {
        ...validatedData,
        userId: req.user.id,
        attachments: attachments.length > 0 ? attachments : undefined,
      };

      const entry = await storage.createEntry(entryData);

      // Generate AI insights asynchronously
      if (entry.content && entry.content.length > 50) {
        try {
          const insights = await generateInsights(entry.content);
          await storage.updateEntry(entry.id, req.user.id, {
            aiInsights: insights,
            mood: entry.mood || insights.sentiment.mood,
          });
        } catch (aiError) {
          console.error("Failed to generate AI insights:", aiError);
        }
      }

      res.json(entry);
    } catch (error) {
      res.status(400).json({ message: "Invalid entry data" });
    }
  });

  app.put("/api/entries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertEntrySchema.partial().parse(req.body);
      
      const entry = await storage.updateEntry(id, req.user.id, validatedData);
      if (!entry) {
        return res.status(404).json({ message: "Entry not found" });
      }

      // Regenerate AI insights if content changed
      if (validatedData.content && validatedData.content.length > 50) {
        try {
          const insights = await generateInsights(validatedData.content);
          await storage.updateEntry(id, req.user.id, {
            aiInsights: insights,
            mood: validatedData.mood || insights.sentiment.mood,
          });
        } catch (aiError) {
          console.error("Failed to generate AI insights:", aiError);
        }
      }

      res.json(entry);
    } catch (error) {
      res.status(400).json({ message: "Invalid entry data" });
    }
  });

  app.delete("/api/entries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteEntry(id, req.user.id);
      if (!deleted) {
        return res.status(404).json({ message: "Entry not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete entry" });
    }
  });

  // Search entries
  app.post("/api/entries/search", async (req, res) => {
    try {
      const filters: SearchFilters = req.body;
      const entries = await storage.searchEntries(req.user.id, filters);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Search failed" });
    }
  });

  // Calendar entries
  app.get("/api/entries/calendar/:year/:month", async (req, res) => {
    try {
      const year = parseInt(req.params.year);
      const month = parseInt(req.params.month);
      
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);
      
      const entries = await storage.getEntriesByDateRange(req.user.id, startDate, endDate);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch calendar entries" });
    }
  });

  // Mood logs
  app.get("/api/moods", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 30;
      const moods = await storage.getMoodLogs(req.user.id, limit);
      res.json(moods);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch mood logs" });
    }
  });

  app.post("/api/moods", async (req, res) => {
    try {
      const validatedData = insertMoodLogSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      
      const moodLog = await storage.createMoodLog(validatedData);
      res.json(moodLog);
    } catch (error) {
      res.status(400).json({ message: "Invalid mood data" });
    }
  });

  // AI insights
  app.post("/api/ai/analyze", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || text.length < 10) {
        return res.status(400).json({ message: "Text too short for analysis" });
      }
      
      const insights = await generateInsights(text);
      res.json(insights);
    } catch (error) {
      res.status(500).json({ message: "AI analysis failed" });
    }
  });

  app.get("/api/ai/weekly-insights", async (req, res) => {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (7 * 24 * 60 * 60 * 1000));
      
      const entries = await storage.getEntriesByDateRange(req.user.id, startDate, endDate);
      const entryTexts = entries.map(entry => entry.content);
      
      if (entryTexts.length === 0) {
        return res.json({
          moodTrend: "Insufficient data for analysis",
          keyPatterns: [],
          recommendations: ["Try writing more entries this week to get personalized insights!"],
          wellnessScore: 50,
        });
      }
      
      const insights = await generateWeeklyInsights(entryTexts);
      res.json(insights);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate weekly insights" });
    }
  });

  app.get("/api/ai/writing-prompt", async (req, res) => {
    try {
      const prompt = await generateWritingPrompt();
      res.json({ prompt });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate writing prompt" });
    }
  });

  // User preferences
  app.get("/api/preferences", async (req, res) => {
    try {
      const preferences = await storage.getUserPreferences(req.user.id);
      res.json(preferences);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch preferences" });
    }
  });

  app.put("/api/preferences", async (req, res) => {
    try {
      const validatedData = insertUserPreferencesSchema.partial().parse(req.body);
      const preferences = await storage.updateUserPreferences(req.user.id, validatedData);
      res.json(preferences);
    } catch (error) {
      res.status(400).json({ message: "Invalid preferences data" });
    }
  });

  // File uploads
  app.use('/uploads', express.static(uploadDir));

  // Export entries
  app.get("/api/export/:format", async (req, res) => {
    try {
      const format = req.params.format;
      const entries = await storage.getEntries(req.user.id);
      
      if (format === 'json') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="diary-entries-${Date.now()}.json"`);
        res.json(entries);
      } else if (format === 'txt') {
        const textContent = entries.map(entry => 
          `${entry.title}\n${new Date(entry.createdAt).toLocaleDateString()}\n\n${entry.content}\n\n---\n\n`
        ).join('');
        
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', `attachment; filename="diary-entries-${Date.now()}.txt"`);
        res.send(textContent);
      } else {
        res.status(400).json({ message: "Unsupported export format" });
      }
    } catch (error) {
      res.status(500).json({ message: "Export failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

declare global {
  namespace Express {
    interface Request {
      user: { id: number };
    }
  }
}
