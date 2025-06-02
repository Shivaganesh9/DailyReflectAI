import { useState } from "react";
import { useLocation } from "wouter";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MoodSelector } from "@/components/ui/mood-selector";
import { VoiceRecorder } from "@/components/ui/voice-recorder";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAutoSave } from "@/hooks/use-auto-save";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Save, 
  Upload, 
  Mic, 
  Type, 
  Image as ImageIcon,
  X,
  FileText
} from "lucide-react";

interface EntryFormData {
  title: string;
  content: string;
  mood?: number;
  moodEmoji?: string;
  tags: string[];
  attachments: File[];
}

export default function NewEntry() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<EntryFormData>({
    title: "",
    content: "",
    tags: [],
    attachments: [],
  });

  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const createEntryMutation = useMutation({
    mutationFn: async (data: EntryFormData) => {
      const formDataObj = new FormData();
      formDataObj.append("title", data.title);
      formDataObj.append("content", data.content);
      if (data.mood) formDataObj.append("mood", data.mood.toString());
      if (data.moodEmoji) formDataObj.append("moodEmoji", data.moodEmoji);
      formDataObj.append("tags", JSON.stringify(data.tags));
      
      data.attachments.forEach((file) => {
        formDataObj.append("attachments", file);
      });

      const response = await fetch("/api/entries", {
        method: "POST",
        body: formDataObj,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to create entry");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Entry created",
        description: "Your diary entry has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/entries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      navigate("/");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create entry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const { debouncedSave } = useAutoSave({
    onSave: async (data: EntryFormData) => {
      if (data.title.trim() && data.content.trim()) {
        // Auto-save logic can be implemented here
        console.log("Auto-saving:", data);
      }
    },
    enabled: formData.title.trim() !== "" && formData.content.trim() !== "",
  });

  const handleInputChange = (field: keyof EntryFormData, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    debouncedSave(newData);
  };

  const handleMoodChange = (mood: number) => {
    const moodEmojis = ["😢", "😕", "😐", "😊", "😄"];
    handleInputChange("mood", mood);
    handleInputChange("moodEmoji", moodEmojis[mood - 1]);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const newAttachments = [...formData.attachments, ...files];
    const newPreviewUrls = [...previewUrls];

    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        newPreviewUrls.push(url);
      }
    });

    setFormData({ ...formData, attachments: newAttachments });
    setPreviewUrls(newPreviewUrls);
  };

  const removeAttachment = (index: number) => {
    const newAttachments = formData.attachments.filter((_, i) => i !== index);
    const newPreviewUrls = previewUrls.filter((_, i) => i !== index);
    
    setFormData({ ...formData, attachments: newAttachments });
    setPreviewUrls(newPreviewUrls);
  };

  const handleVoiceTranscript = (transcript: string) => {
    const newContent = formData.content + (formData.content ? "\n\n" : "") + transcript;
    handleInputChange("content", newContent);
  };

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide both a title and content for your entry.",
        variant: "destructive",
      });
      return;
    }

    createEntryMutation.mutate(formData);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header />
      
      <main className="flex-1 p-6 overflow-auto custom-scrollbar">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Create New Entry</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Entry Title</Label>
                <Input
                  id="title"
                  placeholder="What's on your mind today?"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="text-lg"
                />
              </div>

              {/* Content Input Methods */}
              <Tabs defaultValue="text" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="text" className="flex items-center space-x-2">
                    <Type className="w-4 h-4" />
                    <span>Text</span>
                  </TabsTrigger>
                  <TabsTrigger value="voice" className="flex items-center space-x-2">
                    <Mic className="w-4 h-4" />
                    <span>Voice</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="content">Your thoughts...</Label>
                    <Textarea
                      id="content"
                      placeholder="Write about your day, thoughts, feelings, or anything that comes to mind..."
                      value={formData.content}
                      onChange={(e) => handleInputChange("content", e.target.value)}
                      className="min-h-[300px] resize-none font-content text-base leading-relaxed"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="voice" className="space-y-4">
                  <VoiceRecorder onTranscriptChange={handleVoiceTranscript} />
                  {formData.content && (
                    <div className="space-y-2">
                      <Label>Current Content:</Label>
                      <div className="bg-muted p-4 rounded-lg max-h-40 overflow-y-auto">
                        <p className="text-sm whitespace-pre-wrap">{formData.content}</p>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <Separator />

              {/* Mood Selector */}
              <MoodSelector
                selectedMood={formData.mood}
                selectedTags={formData.tags}
                onMoodChange={handleMoodChange}
                onTagsChange={(tags) => handleInputChange("tags", tags)}
              />

              <Separator />

              {/* File Attachments */}
              <div className="space-y-4">
                <Label>Attachments</Label>
                <div className="flex items-center space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("file-upload")?.click()}
                    className="flex items-center space-x-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Add Photos/Videos</span>
                  </Button>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    accept="image/*,video/*,audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {formData.attachments.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.attachments.map((file, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                          {file.type.startsWith("image/") ? (
                            <img
                              src={previewUrls[index]}
                              alt={file.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-center p-4">
                              <ImageIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground truncate">
                                {file.name}
                              </p>
                            </div>
                          )}
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeAttachment(index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Actions */}
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => navigate("/")}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={!formData.title.trim() || !formData.content.trim() || createEntryMutation.isPending}
                  className="flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>
                    {createEntryMutation.isPending ? "Saving..." : "Save Entry"}
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
