import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";
import { 
  Search as SearchIcon, 
  Filter, 
  Calendar, 
  Tag, 
  Smile,
  Clock,
  Image,
  Mic,
  X,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { type Entry, type SearchFilters } from "@shared/schema";

const moodOptions = [
  { value: 1, label: "Very Sad", emoji: "😢" },
  { value: 2, label: "Sad", emoji: "😕" },
  { value: 3, label: "Neutral", emoji: "😐" },
  { value: 4, label: "Happy", emoji: "😊" },
  { value: 5, label: "Very Happy", emoji: "😄" },
];

const commonTags = [
  "Work", "Family", "Travel", "Health", "Exercise", "Meditation",
  "Reading", "Learning", "Gratitude", "Goals", "Reflection", "Dreams"
];

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Entry[]>([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    mood: [],
    tags: [],
    dateFrom: "",
    dateTo: "",
  });

  const searchMutation = useMutation({
    mutationFn: async (searchFilters: SearchFilters) => {
      const response = await apiRequest("POST", "/api/entries/search", searchFilters);
      return response.json();
    },
    onSuccess: (data: Entry[]) => {
      setResults(data);
    },
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim() || filters.mood?.length || filters.tags?.length || filters.dateFrom || filters.dateTo) {
        const searchFilters: SearchFilters = {
          ...filters,
          query: query.trim(),
        };
        searchMutation.mutate(searchFilters);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, filters]);

  const handleMoodToggle = (moodValue: number) => {
    const currentMoods = filters.mood || [];
    const newMoods = currentMoods.includes(moodValue)
      ? currentMoods.filter(m => m !== moodValue)
      : [...currentMoods, moodValue];
    
    setFilters({ ...filters, mood: newMoods });
  };

  const handleTagToggle = (tag: string) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    
    setFilters({ ...filters, tags: newTags });
  };

  const clearFilters = () => {
    setFilters({
      query: "",
      mood: [],
      tags: [],
      dateFrom: "",
      dateTo: "",
    });
    setQuery("");
  };

  const hasActiveFilters = query.trim() || filters.mood?.length || filters.tags?.length || filters.dateFrom || filters.dateTo;

  const getMoodEmoji = (mood?: number) => {
    if (!mood) return "😐";
    const emojis = ["😢", "😕", "😐", "😊", "😄"];
    return emojis[mood - 1] || "😐";
  };

  const highlightText = (text: string, searchQuery: string) => {
    if (!searchQuery.trim()) return text;
    
    const regex = new RegExp(`(${searchQuery})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-primary/20 text-primary-foreground px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header />
      
      <main className="flex-1 overflow-auto custom-scrollbar">
        <div className="max-w-6xl mx-auto p-6">
          {/* Search Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold gradient-text mb-2">Search Your Journal</h1>
            <p className="text-muted-foreground">Find entries by keywords, mood, tags, or date</p>
          </div>

          {/* Search Bar */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    placeholder="Search your thoughts, experiences, and memories..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-10 pr-4 py-3 text-lg"
                  />
                  {query && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                      onClick={() => setQuery("")}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                  className="flex items-center space-x-2"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                  {hasActiveFilters && (
                    <Badge variant="default" className="ml-2">
                      {[
                        filters.mood?.length || 0,
                        filters.tags?.length || 0,
                        filters.dateFrom ? 1 : 0,
                        filters.dateTo ? 1 : 0
                      ].reduce((a, b) => a + b, 0)}
                    </Badge>
                  )}
                  {isFiltersOpen ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Filters Panel */}
          {isFiltersOpen && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Search Filters</span>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      Clear All
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Date Range */}
                <div>
                  <Label className="text-sm font-medium mb-3 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Date Range
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dateFrom" className="text-xs text-muted-foreground">From</Label>
                      <Input
                        id="dateFrom"
                        type="date"
                        value={filters.dateFrom}
                        onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="dateTo" className="text-xs text-muted-foreground">To</Label>
                      <Input
                        id="dateTo"
                        type="date"
                        value={filters.dateTo}
                        onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Mood Filter */}
                <div>
                  <Label className="text-sm font-medium mb-3 flex items-center">
                    <Smile className="w-4 h-4 mr-2" />
                    Mood
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {moodOptions.map((mood) => (
                      <div key={mood.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`mood-${mood.value}`}
                          checked={filters.mood?.includes(mood.value) || false}
                          onCheckedChange={() => handleMoodToggle(mood.value)}
                        />
                        <Label
                          htmlFor={`mood-${mood.value}`}
                          className="text-sm cursor-pointer flex items-center space-x-1"
                        >
                          <span>{mood.emoji}</span>
                          <span>{mood.label}</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Tags Filter */}
                <div>
                  <Label className="text-sm font-medium mb-3 flex items-center">
                    <Tag className="w-4 h-4 mr-2" />
                    Tags
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {commonTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={filters.tags?.includes(tag) ? "default" : "secondary"}
                        className={cn(
                          "cursor-pointer transition-all duration-200 hover:scale-105",
                          filters.tags?.includes(tag)
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-primary/10 hover:text-primary"
                        )}
                        onClick={() => handleTagToggle(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Search Results */}
          <div className="space-y-6">
            {searchMutation.isPending ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Skeleton className="w-8 h-8 rounded" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="w-3/4 h-5" />
                          <Skeleton className="w-1/4 h-4" />
                          <Skeleton className="w-full h-16" />
                          <div className="flex space-x-2">
                            <Skeleton className="w-16 h-5 rounded-full" />
                            <Skeleton className="w-16 h-5 rounded-full" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : results.length > 0 ? (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground">
                    Found {results.length} {results.length === 1 ? 'entry' : 'entries'}
                  </p>
                  <Button variant="outline" size="sm">
                    Export Results
                  </Button>
                </div>

                <div className="space-y-4">
                  {results.map((entry) => (
                    <Card key={entry.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="mood-emoji text-2xl">
                            {getMoodEmoji(entry.mood)}
                          </div>
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold text-lg">
                                  {highlightText(entry.title, query)}
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                {entry.tags && entry.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {entry.tags.slice(0, 3).map((tag) => (
                                      <Badge key={tag} variant="secondary" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                    {entry.tags.length > 3 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{entry.tags.length - 3}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {highlightText(
                                entry.content.length > 200 
                                  ? entry.content.substring(0, 200) + "..." 
                                  : entry.content,
                                query
                              )}
                            </p>

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
                                  Read Entry
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : hasActiveFilters ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <SearchIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">No entries found</h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your search criteria or filters
                  </p>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <SearchIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Start searching</h3>
                  <p className="text-muted-foreground">
                    Enter keywords, select moods, or apply filters to find your entries
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
