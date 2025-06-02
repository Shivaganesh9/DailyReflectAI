import { Header } from "@/components/layout/header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentEntries } from "@/components/dashboard/recent-entries";
import { AIInsightsWidget } from "@/components/dashboard/ai-insights";
import { CalendarWidget } from "@/components/dashboard/calendar-widget";
import { MoodSelector } from "@/components/ui/mood-selector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function Dashboard() {
  const [selectedMood, setSelectedMood] = useState<number>();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const logMoodMutation = useMutation({
    mutationFn: async (data: { mood: number; moodEmoji: string; tags: string[] }) => {
      const moodEmojis = ["😢", "😕", "😐", "😊", "😄"];
      const response = await apiRequest("POST", "/api/moods", {
        mood: data.mood,
        moodEmoji: data.moodEmoji,
        tags: data.tags,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Mood logged",
        description: "Your mood has been recorded successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setSelectedMood(undefined);
      setSelectedTags([]);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to log your mood. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLogMood = () => {
    if (!selectedMood) return;
    
    const moodEmojis = ["😢", "😕", "😐", "😊", "😄"];
    logMoodMutation.mutate({
      mood: selectedMood,
      moodEmoji: moodEmojis[selectedMood - 1],
      tags: selectedTags,
    });
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header />
      
      <main className="flex-1 p-6 overflow-auto custom-scrollbar">
        {/* Stats Cards */}
        <div className="mb-8">
          <StatsCards />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Entries */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-foreground">Recent Entries</h3>
              <Button variant="ghost" className="text-primary hover:text-primary/80 text-sm font-medium">
                View All
              </Button>
            </div>
            <RecentEntries />
          </div>

          {/* Sidebar Widgets */}
          <div className="space-y-6">
            {/* AI Insights */}
            <AIInsightsWidget />

            {/* Quick Mood Tracker */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Mood Check</CardTitle>
              </CardHeader>
              <CardContent>
                <MoodSelector
                  selectedMood={selectedMood}
                  selectedTags={selectedTags}
                  onMoodChange={setSelectedMood}
                  onTagsChange={setSelectedTags}
                />
                <Button 
                  className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={handleLogMood}
                  disabled={!selectedMood || logMoodMutation.isPending}
                >
                  {logMoodMutation.isPending ? "Logging..." : "Log Mood"}
                </Button>
              </CardContent>
            </Card>

            {/* Calendar Widget */}
            <CalendarWidget />
          </div>
        </div>
      </main>
    </div>
  );
}
