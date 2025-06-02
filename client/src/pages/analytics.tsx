import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  Brain, 
  TrendingUp, 
  Calendar, 
  Target,
  Lightbulb,
  Sparkles,
  Heart,
  Activity
} from "lucide-react";
import { type Entry, type MoodLog, type DashboardStats } from "@shared/schema";

interface WeeklyInsights {
  moodTrend: string;
  keyPatterns: string[];
  recommendations: string[];
  wellnessScore: number;
}

export default function Analytics() {
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: entries } = useQuery<Entry[]>({
    queryKey: ["/api/entries"],
  });

  const { data: moodLogs } = useQuery<MoodLog[]>({
    queryKey: ["/api/moods"],
  });

  const { data: weeklyInsights } = useQuery<WeeklyInsights>({
    queryKey: ["/api/ai/weekly-insights"],
  });

  // Process mood data for charts
  const moodData = moodLogs?.slice(0, 30).reverse().map((log, index) => ({
    day: `Day ${index + 1}`,
    mood: log.mood,
    date: new Date(log.createdAt).toLocaleDateString(),
  })) || [];

  // Process entries by day of week
  const dayOfWeekData = entries?.reduce((acc, entry) => {
    const dayOfWeek = new Date(entry.createdAt).getDay();
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayName = dayNames[dayOfWeek];
    
    acc[dayName] = (acc[dayName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const weeklyData = Object.entries(dayOfWeekData).map(([day, count]) => ({
    day,
    entries: count,
  }));

  // Mood distribution
  const moodDistribution = moodLogs?.reduce((acc, log) => {
    const moodLabels = ["Very Sad", "Sad", "Neutral", "Happy", "Very Happy"];
    const label = moodLabels[log.mood - 1];
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const moodPieData = Object.entries(moodDistribution).map(([mood, count]) => ({
    name: mood,
    value: count,
  }));

  const COLORS = ['#F44336', '#FF9800', '#9E9E9E', '#4CAF50', '#2196F3'];

  // Tag analysis
  const tagAnalysis = entries?.reduce((acc, entry) => {
    entry.tags.forEach(tag => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>) || {};

  const topTags = Object.entries(tagAnalysis)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  const isLoading = !stats || !entries || !moodLogs;

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 p-6">
          <div className="space-y-6">
            <Skeleton className="w-full h-64" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="w-full h-48" />
              <Skeleton className="w-full h-48" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header />
      
      <main className="flex-1 p-6 overflow-auto custom-scrollbar">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">Analytics & Insights</h1>
            <p className="text-muted-foreground">Discover patterns in your journaling journey</p>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="mood">Mood Analysis</TabsTrigger>
              <TabsTrigger value="patterns">Patterns</TabsTrigger>
              <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Activity className="text-primary w-6 h-6" />
                      </div>
                      <Badge variant="default">Current</Badge>
                    </div>
                    <h3 className="text-2xl font-bold mt-4">{stats.streak}</h3>
                    <p className="text-muted-foreground text-sm">Day Streak</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                        <Calendar className="text-accent w-6 h-6" />
                      </div>
                      <Badge variant="secondary">Total</Badge>
                    </div>
                    <h3 className="text-2xl font-bold mt-4">{stats.totalEntries}</h3>
                    <p className="text-muted-foreground text-sm">Entries Written</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center">
                        <Heart className="text-warning w-6 h-6" />
                      </div>
                      <Badge variant="outline">Average</Badge>
                    </div>
                    <h3 className="text-2xl font-bold mt-4">{stats.averageMood.toFixed(1)}/5</h3>
                    <p className="text-muted-foreground text-sm">Mood Score</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
                        <TrendingUp className="text-success w-6 h-6" />
                      </div>
                      <Badge variant="default">AI Score</Badge>
                    </div>
                    <h3 className="text-2xl font-bold mt-4">{stats.wellnessScore}%</h3>
                    <p className="text-muted-foreground text-sm">Wellness Score</p>
                  </CardContent>
                </Card>
              </div>

              {/* Writing Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Writing Activity by Day</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="entries" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="mood" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Mood Trend */}
                <Card>
                  <CardHeader>
                    <CardTitle>Mood Trend (Last 30 Days)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={moodData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis domain={[1, 5]} />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="mood" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                          dot={{ fill: "hsl(var(--primary))" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Mood Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Mood Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={moodPieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {moodPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="patterns" className="space-y-6">
              {/* Tag Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Most Used Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topTags.map(([tag, count], index) => (
                      <div key={tag} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                            <span className="text-sm font-bold text-primary">#{index + 1}</span>
                          </div>
                          <span className="font-medium">{tag}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all duration-300"
                              style={{ width: `${(count / Math.max(...topTags.map(([, c]) => c))) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-8 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Writing Patterns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Calendar className="text-primary w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">
                      {entries ? Math.round((entries.length / Math.max(1, Math.ceil((Date.now() - new Date(entries[entries.length - 1]?.createdAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24)))) * 10) / 10 : 0}
                    </h3>
                    <p className="text-muted-foreground text-sm">Avg Entries/Day</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Target className="text-accent w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">
                      {entries ? Math.round(entries.reduce((sum, entry) => sum + (entry.wordCount || 0), 0) / entries.length) : 0}
                    </h3>
                    <p className="text-muted-foreground text-sm">Avg Words/Entry</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Activity className="text-warning w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">
                      {Object.keys(dayOfWeekData).length > 0 ? 
                        Object.entries(dayOfWeekData).reduce((max, [day, count]) => 
                          count > max[1] ? [day, count] : max, ["", 0])[0] : "N/A"
                      }
                    </h3>
                    <p className="text-muted-foreground text-sm">Most Active Day</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="ai-insights" className="space-y-6">
              {weeklyInsights ? (
                <>
                  {/* AI Summary */}
                  <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Brain className="text-primary w-5 h-5" />
                        <span>AI Weekly Analysis</span>
                        <Badge className="bg-primary text-primary-foreground">Powered by GPT-4</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center p-6">
                        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-2xl font-bold text-primary">{weeklyInsights.wellnessScore}</span>
                        </div>
                        <h3 className="text-xl font-bold mb-2">Overall Wellness Score</h3>
                        <p className="text-muted-foreground">Based on your recent entries and mood patterns</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Detailed Insights */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Sparkles className="text-accent w-5 h-5" />
                          <span>Mood Trends</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground leading-relaxed">
                          {weeklyInsights.moodTrend}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Target className="text-warning w-5 h-5" />
                          <span>Key Patterns</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {weeklyInsights.keyPatterns.map((pattern, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="text-primary text-sm mt-1">•</span>
                              <span className="text-sm text-muted-foreground">{pattern}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recommendations */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Lightbulb className="text-success w-5 h-5" />
                        <span>Personalized Recommendations</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {weeklyInsights.recommendations.map((recommendation, index) => (
                          <div key={index} className="bg-muted/30 p-4 rounded-lg">
                            <p className="text-sm text-muted-foreground">{recommendation}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Brain className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Generate AI Insights</h3>
                    <p className="text-muted-foreground mb-6">
                      Write a few more entries to unlock personalized AI insights and recommendations.
                    </p>
                    <Button>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Get Insights
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
