import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const moodEmojis = [
  { emoji: "😢", value: 1, label: "Very Sad" },
  { emoji: "😕", value: 2, label: "Sad" },
  { emoji: "😐", value: 3, label: "Neutral" },
  { emoji: "😊", value: 4, label: "Happy" },
  { emoji: "😄", value: 5, label: "Very Happy" },
];

const moodTags = [
  "Grateful", "Energetic", "Peaceful", "Productive", "Anxious",
  "Excited", "Tired", "Motivated", "Stressed", "Content",
  "Lonely", "Confident", "Overwhelmed", "Creative", "Focused"
];

interface MoodSelectorProps {
  selectedMood?: number;
  selectedTags?: string[];
  onMoodChange?: (mood: number) => void;
  onTagsChange?: (tags: string[]) => void;
  className?: string;
}

export function MoodSelector({
  selectedMood,
  selectedTags = [],
  onMoodChange,
  onTagsChange,
  className
}: MoodSelectorProps) {
  const [localSelectedTags, setLocalSelectedTags] = useState<string[]>(selectedTags);

  const handleMoodSelect = (mood: number) => {
    onMoodChange?.(mood);
  };

  const handleTagToggle = (tag: string) => {
    const newTags = localSelectedTags.includes(tag)
      ? localSelectedTags.filter(t => t !== tag)
      : [...localSelectedTags, tag];
    
    setLocalSelectedTags(newTags);
    onTagsChange?.(newTags);
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Mood Selection */}
      <div>
        <h4 className="font-semibold text-foreground mb-4">How are you feeling?</h4>
        <div className="grid grid-cols-5 gap-2">
          {moodEmojis.map((mood) => (
            <Button
              key={mood.value}
              variant="ghost"
              size="lg"
              className={cn(
                "mood-emoji text-3xl p-4 rounded-xl transition-all duration-200",
                selectedMood === mood.value 
                  ? "bg-primary/20 scale-110 shadow-md" 
                  : "hover:bg-muted hover:scale-105"
              )}
              onClick={() => handleMoodSelect(mood.value)}
              title={mood.label}
            >
              {mood.emoji}
            </Button>
          ))}
        </div>
        {selectedMood && (
          <p className="text-center text-sm text-muted-foreground mt-2">
            {moodEmojis.find(m => m.value === selectedMood)?.label}
          </p>
        )}
      </div>

      {/* Tag Selection */}
      <div>
        <h4 className="font-semibold text-foreground mb-4">Add some tags</h4>
        <div className="flex flex-wrap gap-2">
          {moodTags.map((tag) => {
            const isSelected = localSelectedTags.includes(tag);
            return (
              <Badge
                key={tag}
                variant={isSelected ? "default" : "secondary"}
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:scale-105",
                  isSelected 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary"
                )}
                onClick={() => handleTagToggle(tag)}
              >
                {tag}
              </Badge>
            );
          })}
        </div>
        {localSelectedTags.length > 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            Selected: {localSelectedTags.join(", ")}
          </p>
        )}
      </div>
    </div>
  );
}
