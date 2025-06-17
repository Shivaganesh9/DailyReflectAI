import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame, Book, Smile, TrendingUp } from "lucide-react";
import { type DashboardStats } from "@shared/schema";

export function StatsCards() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <Skeleton className="w-16 h-5 rounded-full" />
              </div>
              <Skeleton className="w-12 h-8 mb-2" />
              <Skeleton className="w-20 h-4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | null | undefined;

  const cards: Array<{
    title: string;
    value: string | number;
    icon: React.ElementType;
    badge: string;
    badgeVariant: BadgeVariant;
    iconBg: string;
    iconColor: string;
  }> = [
    {
      title: "Day Streak",
      value: stats.streak,
      icon: Flame,
      badge: `+${Math.min(3, stats.streak)} days`,
      badgeVariant: "default",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      title: "Total Entries",
      value: stats.totalEntries,
      icon: Book,
      badge: "This month",
      badgeVariant: "secondary",
      iconBg: "bg-accent/10",
      iconColor: "text-accent",
    },
    {
      title: "Avg Mood",
      value: `${stats.averageMood}/5`,
      icon: Smile,
      badge: stats.averageMood >= 4 ? "Positive" : stats.averageMood >= 3 ? "Neutral" : "Needs attention",
      badgeVariant: stats.averageMood >= 4 ? "default" : stats.averageMood >= 3 ? "secondary" : "destructive",
      iconBg: "bg-warning/10",
      iconColor: "text-warning",
    },
    {
      title: "Wellness Score",
      value: `${stats.wellnessScore}%`,
      icon: TrendingUp,
      badge: "AI Powered",
      badgeVariant: "outline",
      iconBg: "bg-success/10",
      iconColor: "text-success",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        
        return (
          <Card key={card.title} className="hover:shadow-lg transition-shadow animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${card.iconBg} rounded-xl flex items-center justify-center`}>
                  <Icon className={`${card.iconColor} w-6 h-6`} />
                </div>
                <Badge variant={card.badgeVariant} className="text-xs">
                  {card.badge}
                </Badge>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-1">
                {card.value}
              </h3>
              <p className="text-muted-foreground text-sm">{card.title}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
