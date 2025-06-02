import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Brain, Sparkles, Target, Lightbulb } from "lucide-react";

interface WeeklyInsights {
  moodTrend: string;
  keyPatterns: string[];
  recommendations: string[];
  wellnessScore: number;
}

export function AIInsightsWidget() {
  const { data: insights, isLoading } = useQuery<WeeklyInsights>({
    queryKey: ["/api/ai/weekly-insights"],
  });

  const { data: promptData } = useQuery<{ prompt: string }>({
    queryKey: ["/api/ai/writing-prompt"],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <div>
                <Skeleton className="w-24 h-5 mb-1" />
                <Skeleton className="w-16 h-4" />
              </div>
            </div>
            <div className="space-y-3">
              <Skeleton className="w-full h-16" />
              <Skeleton className="w-full h-16" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Insights Widget */}
      <Card className="glass-effect">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Brain className="text-primary w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">AI Insights</h4>
              <p className="text-xs text-muted-foreground">Powered by GPT-4</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {insights ? (
            <>
              <div className="bg-card/50 p-3 rounded-xl border">
                <p className="text-sm text-foreground mb-2">
                  <Sparkles className="inline w-4 h-4 mr-1 text-primary" />
                  <strong>Mood Pattern:</strong>
                </p>
                <p className="text-xs text-muted-foreground">
                  {insights.moodTrend}
                </p>
              </div>

              {insights.keyPatterns.length > 0 && (
                <div className="bg-card/50 p-3 rounded-xl border">
                  <p className="text-sm text-foreground mb-2">
                    <Target className="inline w-4 h-4 mr-1 text-accent" />
                    <strong>Key Patterns:</strong>
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {insights.keyPatterns.slice(0, 2).map((pattern, index) => (
                      <li key={index}>• {pattern}</li>
                    ))}
                  </ul>
                </div>
              )}

              {insights.recommendations.length > 0 && (
                <div className="bg-card/50 p-3 rounded-xl border">
                  <p className="text-sm text-foreground mb-2">
                    <Lightbulb className="inline w-4 h-4 mr-1 text-warning" />
                    <strong>Suggestions:</strong>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {insights.recommendations[0]}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">
                Write a few entries to get personalized AI insights!
              </p>
            </div>
          )}

          <Button variant="ghost" className="w-full text-primary hover:text-primary/80 text-sm font-medium">
            View Full Analysis
          </Button>
        </CardContent>
      </Card>

      {/* Writing Prompt */}
      {promptData && (
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                <Lightbulb className="text-primary w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Daily Prompt</h4>
                <p className="text-xs text-muted-foreground">Spark your creativity</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground mb-4 font-content italic leading-relaxed">
              "{promptData.prompt}"
            </p>
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              Start Writing
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
