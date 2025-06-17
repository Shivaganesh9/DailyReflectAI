import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

export interface SentimentAnalysis {
  mood: number;
  confidence: number;
  emotions: string[];
  topics: string[];
}

export interface AIInsights {
  sentiment: SentimentAnalysis;
  wordCount: number;
  readingTime: number;
  keyThemes: string[];
  suggestions: string[];
}

export async function analyzeSentiment(text: string): Promise<SentimentAnalysis> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert emotional intelligence analyst. Analyze the sentiment and emotional content of diary entries. 
          Provide a mood rating from 1-5 (1=very negative, 5=very positive), confidence score 0-1, 
          list of emotions detected, and key topics/themes.
          Respond with JSON in this exact format: {
            "mood": number,
            "confidence": number, 
            "emotions": ["emotion1", "emotion2"],
            "topics": ["topic1", "topic2"]
          }`
        },
        {
          role: "user",
          content: `Analyze this diary entry: "${text}"`
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      mood: Math.max(1, Math.min(5, Math.round(result.mood || 3))),
      confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
      emotions: Array.isArray(result.emotions) ? result.emotions : [],
      topics: Array.isArray(result.topics) ? result.topics : [],
    };
  } catch (error) {
    console.error("Failed to analyze sentiment:", error);
    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    throw new Error("Failed to analyze sentiment: " + errorMessage);
  }
}

export async function generateInsights(text: string): Promise<AIInsights> {
  try {
    const wordCount = text.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200); // Average reading speed

    const sentiment = await analyzeSentiment(text);

    const insightsResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a personal wellness coach and journal analyst. Analyze diary entries to provide helpful insights and suggestions.
          Focus on patterns, emotional well-being, and constructive recommendations.
          Respond with JSON in this format: {
            "keyThemes": ["theme1", "theme2"],
            "suggestions": ["suggestion1", "suggestion2"]
          }`
        },
        {
          role: "user",
          content: `Analyze this diary entry and provide wellness insights: "${text}"`
        }
      ],
      response_format: { type: "json_object" },
    });

    const insights = JSON.parse(insightsResponse.choices[0].message.content || "{}");

    return {
      sentiment,
      wordCount,
      readingTime,
      keyThemes: Array.isArray(insights.keyThemes) ? insights.keyThemes : [],
      suggestions: Array.isArray(insights.suggestions) ? insights.suggestions : [],
    };
  } catch (error) {
    console.error("Failed to generate insights:", error);
    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    throw new Error("Failed to generate insights: " + errorMessage);
  }
}

export async function generateWeeklyInsights(entries: string[]): Promise<{
  moodTrend: string;
  keyPatterns: string[];
  recommendations: string[];
  wellnessScore: number;
}> {
  try {
    const combinedText = entries.join("\n\n");
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a mental health and wellness analyst. Analyze a week's worth of diary entries to identify patterns and provide insights.
          Provide a wellness score from 1-100, mood trend description, key patterns observed, and personalized recommendations.
          Respond with JSON in this format: {
            "moodTrend": "description of mood over the week",
            "keyPatterns": ["pattern1", "pattern2"],
            "recommendations": ["rec1", "rec2"],
            "wellnessScore": number
          }`
        },
        {
          role: "user",
          content: `Analyze these diary entries from the past week: "${combinedText}"`
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      moodTrend: result.moodTrend || "No clear trend identified",
      keyPatterns: Array.isArray(result.keyPatterns) ? result.keyPatterns : [],
      recommendations: Array.isArray(result.recommendations) ? result.recommendations : [],
      wellnessScore: Math.max(1, Math.min(100, result.wellnessScore || 50)),
    };
  } catch (error) {
    console.error("Failed to generate weekly insights:", error);
    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    throw new Error("Failed to generate weekly insights: " + errorMessage);
  }
}

export async function generateWritingPrompt(): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a creative writing coach specializing in personal reflection and journaling. Generate thoughtful, engaging writing prompts that encourage self-reflection and personal growth."
        },
        {
          role: "user",
          content: "Generate a unique, inspiring writing prompt for a diary entry that encourages personal reflection and emotional exploration."
        }
      ],
    });

    return response.choices[0].message.content || "What are three things you're grateful for today, and why do they matter to you?";
  } catch (error) {
    console.error("Failed to generate writing prompt:", error);
    return "What are three things you're grateful for today, and why do they matter to you?";
  }
}
