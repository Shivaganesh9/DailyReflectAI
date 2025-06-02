import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { type Entry } from "@shared/schema";

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const dayNames = ["S", "M", "T", "W", "T", "F", "S"];

export function CalendarWidget() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const { data: entries } = useQuery<Entry[]>({
    queryKey: ["/api/entries/calendar", year, month],
  });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const today = new Date();

  const entriesByDay = new Map<number, Entry[]>();
  if (entries) {
    entries.forEach(entry => {
      const entryDate = new Date(entry.createdAt);
      if (entryDate.getMonth() === month && entryDate.getFullYear() === year) {
        const day = entryDate.getDate();
        if (!entriesByDay.has(day)) {
          entriesByDay.set(day, []);
        }
        entriesByDay.get(day)!.push(entry);
      }
    });
  }

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const isToday = (day: number) => {
    return (
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year
    );
  };

  const hasEntry = (day: number) => {
    return entriesByDay.has(day);
  };

  const getMoodEmoji = (day: number) => {
    const dayEntries = entriesByDay.get(day);
    if (!dayEntries || dayEntries.length === 0) return null;
    
    // Get the most recent entry's mood
    const latestEntry = dayEntries.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
    
    if (!latestEntry.mood) return null;
    
    const emojis = ["😢", "😕", "😐", "😊", "😄"];
    return emojis[latestEntry.mood - 1] || null;
  };

  // Create calendar grid
  const calendarDays = [];
  
  // Empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="calendar-day"></div>);
  }
  
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const moodEmoji = getMoodEmoji(day);
    
    calendarDays.push(
      <div
        key={day}
        className={cn(
          "calendar-day relative",
          hasEntry(day) && "has-entry",
          isToday(day) && "today ring-2 ring-primary"
        )}
        title={hasEntry(day) ? `${entriesByDay.get(day)!.length} entries` : undefined}
      >
        <span className="text-sm">{day}</span>
        {moodEmoji && (
          <span className="absolute -top-1 -right-1 text-xs">
            {moodEmoji}
          </span>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <h4 className="font-semibold text-foreground">
            {monthNames[month]} {year}
          </h4>
          <div className="flex space-x-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={goToPreviousMonth}
              className="w-8 h-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={goToNextMonth}
              className="w-8 h-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 text-xs text-center mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-muted-foreground p-1 font-medium">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1 text-xs">
          {calendarDays}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-primary/20 rounded"></div>
            <span>Has entry</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 border-2 border-primary rounded"></div>
            <span>Today</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
