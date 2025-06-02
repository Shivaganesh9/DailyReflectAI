import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MoreHorizontal, Clock, Image, Mic } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { type Entry } from "@shared/schema";

export function RecentEntries() {
  const { data: entries, isLoading } = useQuery<Entry[]>({
    queryKey: ["/api/entries"],
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-8 h-8 rounded" />
                  <div>
                    <Skeleton className="w-40 h-5 mb-2" />
                    <Skeleton className="w-24 h-4" />
                  </div>
                </div>
                <Skeleton className="w-16 h-6 rounded-full" />
              </div>
              <Skeleton className="w-full h-16 mb-4" />
              <div className="flex items-center justify-between">
                <div className="flex space-x-4">
                  <Skeleton className="w-16 h-4" />
                  <Skeleton className="w-16 h-4" />
                </div>
                <Skeleton className="w-20 h-6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground mb-4">No entries yet</p>
          <Link href="/new-entry">
            <Button>Create your first entry</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const getMoodEmoji = (mood?: number) => {
    if (!mood) return "😐";
    const emojis = ["😢", "😕", "😐", "😊", "😄"];
    return emojis[mood - 1] || "😐";
  };

  const getTagColor = (tag: string) => {
    const colors = {
      "Work": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      "Adventure": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      "Mindfulness": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      "Health": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      "Family": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    };
    return colors[tag as keyof typeof colors] || "bg-muted text-muted-foreground";
  };

  const truncateContent = (content: string, maxLength = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  return (
    <div className="space-y-4">
      {entries.slice(0, 5).map((entry, index) => (
        <Card 
          key={entry.id} 
          className="entry-card animate-fade-in" 
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="mood-emoji text-2xl cursor-pointer">
                  {getMoodEmoji(entry.mood)}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{entry.title}</h4>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {entry.tags && entry.tags.length > 0 && (
                  <Badge 
                    variant="secondary"
                    className={getTagColor(entry.tags[0])}
                  >
                    {entry.tags[0]}
                  </Badge>
                )}
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
              {truncateContent(entry.content)}
            </p>

            {entry.attachments && Array.isArray(entry.attachments) && entry.attachments.length > 0 && (
              <div className="flex items-center space-x-2 mb-4">
                {entry.attachments.slice(0, 3).map((attachment: any, i: number) => (
                  <div key={i} className="w-16 h-10 bg-muted rounded-lg overflow-hidden">
                    {attachment.mimetype?.startsWith('image/') ? (
                      <img 
                        src={attachment.url} 
                        alt={attachment.originalName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                ))}
                {entry.attachments.length > 3 && (
                  <div className="w-16 h-10 bg-muted rounded-lg flex items-center justify-center text-xs text-muted-foreground">
                    +{entry.attachments.length - 3} more
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <span className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {Math.ceil((entry.wordCount || 0) / 200)} min read
                </span>
                {entry.attachments && Array.isArray(entry.attachments) && entry.attachments.length > 0 && (
                  <span className="flex items-center">
                    <Image className="w-3 h-3 mr-1" />
                    {entry.attachments.length} media
                  </span>
                )}
                {entry.isVoiceNote && (
                  <span className="flex items-center">
                    <Mic className="w-3 h-3 mr-1" />
                    Voice note
                  </span>
                )}
              </div>
              <Link href={`/entries/${entry.id}`}>
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                  Read More
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
