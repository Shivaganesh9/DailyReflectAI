import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";
import { type Entry } from "@shared/schema";

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const shortDayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const { data: entries, isLoading } = useQuery<Entry[]>({
    queryKey: ["/api/entries/calendar", year, month],
  });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const today = new Date();

  const entriesByDay = new Map<string, Entry[]>();
  if (entries) {
    entries.forEach(entry => {
      const entryDate = new Date(entry.createdAt);
      const dateKey = `${entryDate.getFullYear()}-${entryDate.getMonth()}-${entryDate.getDate()}`;
      if (!entriesByDay.has(dateKey)) {
        entriesByDay.set(dateKey, []);
      }
      entriesByDay.get(dateKey)!.push(entry);
    });
  }

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  };

  const isToday = (day: number) => {
    return (
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year
    );
  };

  const hasEntry = (day: number) => {
    const dateKey = `${year}-${month}-${day}`;
    return entriesByDay.has(dateKey);
  };

  const getEntriesForDay = (day: number) => {
    const dateKey = `${year}-${month}-${day}`;
    return entriesByDay.get(dateKey) || [];
  };

  const getMoodEmoji = (day: number) => {
    const dayEntries = getEntriesForDay(day);
    if (!dayEntries || dayEntries.length === 0) return null;
    
    const latestEntry = dayEntries.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
    
    if (!latestEntry.mood) return null;
    
    const emojis = ["😢", "😕", "😐", "😊", "😄"];
    return emojis[latestEntry.mood - 1] || null;
  };

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(year, month, day);
    setSelectedDate(clickedDate);
  };

  const selectedDayEntries = selectedDate ? getEntriesForDay(selectedDate.getDate()) : [];

  const renderCalendarGrid = () => {
    const calendarDays = [];
    
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarDays.push(
        <div key={`empty-${i}`} className="aspect-square"></div>
      );
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const moodEmoji = getMoodEmoji(day);
      const isSelected = selectedDate?.getDate() === day;
      
      calendarDays.push(
        <div
          key={day}
          className={cn(
            "aspect-square border border-border/20 cursor-pointer transition-all duration-200 hover:bg-muted/50 flex flex-col items-center justify-center relative p-1",
            hasEntry(day) && "bg-primary/5 border-primary/30",
            isToday(day) && "ring-2 ring-primary",
            isSelected && "bg-primary/20 border-primary"
          )}
          onClick={() => handleDayClick(day)}
        >
          <span className={cn(
            "text-sm font-medium",
            isToday(day) && "text-primary font-bold",
            isSelected && "text-primary font-bold"
          )}>
            {day}
          </span>
          {moodEmoji && (
            <span className="text-xs mt-1">{moodEmoji}</span>
          )}
          {hasEntry(day) && (
            <div className="absolute bottom-1 w-1 h-1 bg-primary rounded-full"></div>
          )}
        </div>
      );
    }

    return calendarDays;
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            <div className="lg:col-span-2">
              <Skeleton className="w-full h-96" />
            </div>
            <div>
              <Skeleton className="w-full h-64" />
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
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar Grid */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">
                      {monthNames[month]} {year}
                    </h2>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={goToPreviousMonth}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={goToNextMonth}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                      <Link href="/new-entry">
                        <Button size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          New Entry
                        </Button>
                      </Link>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Day headers */}
                  <div className="grid grid-cols-7 gap-0 mb-2">
                    {shortDayNames.map(day => (
                      <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar grid */}
                  <div className="grid grid-cols-7 gap-0 border border-border/20 rounded-lg overflow-hidden">
                    {renderCalendarGrid()}
                  </div>

                  {/* Legend */}
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-primary/20 border border-primary/30 rounded"></div>
                      <span>Has entries</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 border-2 border-primary rounded"></div>
                      <span>Today</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span>Entry indicator</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Selected Day Details */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedDate ? (
                      <span>
                        {dayNames[selectedDate.getDay()]}, {monthNames[selectedDate.getMonth()]} {selectedDate.getDate()}
                      </span>
                    ) : (
                      "Select a Date"
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedDate ? (
                    selectedDayEntries.length > 0 ? (
                      <div className="space-y-4">
                        {selectedDayEntries.map((entry) => (
                          <div key={entry.id} className="border border-border/20 rounded-lg p-4 hover:bg-muted/20 transition-colors">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold text-sm">{entry.title}</h4>
                              {entry.mood && (
                                <span className="text-lg">
                                  {["😢", "😕", "😐", "😊", "😄"][entry.mood - 1]}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">
                              {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
                            </p>
                            <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                              {entry.content.substring(0, 100)}
                              {entry.content.length > 100 && "..."}
                            </p>
                            {entry.tags && entry.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {entry.tags.slice(0, 3).map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            <Link href={`/entries/${entry.id}`}>
                              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                                Read More
                              </Button>
                            </Link>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground mb-4">No entries for this day</p>
                        <Link href="/new-entry">
                          <Button variant="outline" size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Entry
                          </Button>
                        </Link>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Click on a date to view entries</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Monthly Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Monthly Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Entries</span>
                    <span className="font-semibold">{entries?.length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Days with Entries</span>
                    <span className="font-semibold">{entriesByDay.size}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Average per Day</span>
                    <span className="font-semibold">
                      {entriesByDay.size > 0 ? ((entries?.length || 0) / entriesByDay.size).toFixed(1) : "0"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
