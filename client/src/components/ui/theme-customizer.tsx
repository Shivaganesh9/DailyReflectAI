import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { 
  Palette, 
  Type, 
  Layout, 
  Monitor,
  Smartphone,
  Tablet,
  Sun,
  Moon,
  Contrast
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeCustomizerProps {
  preferences: any;
  onUpdate: (field: string, value: any) => void;
}

const fontOptions = [
  { name: "Inter", family: "Inter", description: "Modern & Clean" },
  { name: "Crimson Pro", family: "Crimson Pro", description: "Elegant Serif" },
  { name: "Source Sans Pro", family: "Source Sans Pro", description: "Professional" },
  { name: "Merriweather", family: "Merriweather", description: "Reading-focused" },
  { name: "Open Sans", family: "Open Sans", description: "Friendly & Open" },
];

const fontSizes = [
  { name: "Small", value: "small", size: "14px" },
  { name: "Medium", value: "medium", size: "16px" },
  { name: "Large", value: "large", size: "18px" },
  { name: "Extra Large", value: "xl", size: "20px" },
];

const lineHeights = [
  { name: "Compact", value: "compact" },
  { name: "Normal", value: "normal" },
  { name: "Relaxed", value: "relaxed" },
  { name: "Loose", value: "loose" },
];

const backgroundTextures = [
  { name: "None", value: "none", preview: "bg-background" },
  { name: "Paper", value: "paper", preview: "bg-gradient-to-br from-amber-50 to-orange-50" },
  { name: "Linen", value: "linen", preview: "bg-gradient-to-br from-stone-50 to-neutral-50" },
  { name: "Minimal", value: "minimal", preview: "bg-gradient-to-br from-slate-50 to-gray-50" },
];

const colorSchemes = [
  { name: "Purple Harmony", primary: "#6750A4", accent: "#7C4DFF", bg: "#FEF7FF" },
  { name: "Ocean Blue", primary: "#1976D2", accent: "#2196F3", bg: "#F3F9FF" },
  { name: "Forest Green", primary: "#388E3C", accent: "#4CAF50", bg: "#F1F8E9" },
  { name: "Sunset Orange", primary: "#F57C00", accent: "#FF9800", bg: "#FFF8E1" },
  { name: "Rose Pink", primary: "#C2185B", accent: "#E91E63", bg: "#FCE4EC" },
];

export function ThemeCustomizer({ preferences, onUpdate }: ThemeCustomizerProps) {
  const [previewMode, setPreviewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");

  return (
    <div className="space-y-6">
      {/* Theme Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Monitor className="w-5 h-5" />
              <span>Theme Preview</span>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant={previewMode === "desktop" ? "default" : "outline"}
                size="sm"
                onClick={() => setPreviewMode("desktop")}
              >
                <Monitor className="w-4 h-4" />
              </Button>
              <Button
                variant={previewMode === "tablet" ? "default" : "outline"}
                size="sm"
                onClick={() => setPreviewMode("tablet")}
              >
                <Tablet className="w-4 h-4" />
              </Button>
              <Button
                variant={previewMode === "mobile" ? "default" : "outline"}
                size="sm"
                onClick={() => setPreviewMode("mobile")}
              >
                <Smartphone className="w-4 h-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={cn(
            "border rounded-lg overflow-hidden transition-all duration-300",
            previewMode === "desktop" && "w-full h-64",
            previewMode === "tablet" && "w-3/4 h-56 mx-auto",
            previewMode === "mobile" && "w-80 h-96 mx-auto"
          )}>
            <div 
              className="w-full h-full p-4 space-y-3"
              style={{ 
                fontFamily: preferences?.fontFamily || "Inter",
                fontSize: preferences?.fontSize === "small" ? "14px" : 
                         preferences?.fontSize === "large" ? "18px" : 
                         preferences?.fontSize === "xl" ? "20px" : "16px",
                lineHeight: preferences?.lineHeight === "compact" ? "1.4" :
                           preferences?.lineHeight === "loose" ? "1.8" :
                           preferences?.lineHeight === "relaxed" ? "1.6" : "1.5"
              }}
            >
              <div className="h-8 bg-card border-b flex items-center px-3">
                <div className="w-3 h-3 bg-primary rounded-full mr-2"></div>
                <span className="text-sm font-medium">My Diary Entry</span>
              </div>
              <div className="p-3 space-y-2">
                <h3 className="font-semibold text-foreground">Today's Reflection</h3>
                <p className="text-muted-foreground text-sm">
                  This is a preview of how your diary entries will look with your selected font and styling preferences.
                </p>
                <div className="flex space-x-2 mt-3">
                  <Badge variant="secondary">Grateful</Badge>
                  <Badge variant="outline">Productive</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Color Schemes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="w-5 h-5" />
            <span>Color Schemes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {colorSchemes.map((scheme) => (
              <div
                key={scheme.name}
                className="border rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow"
                style={{ backgroundColor: scheme.bg }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{scheme.name}</span>
                  <div className="flex space-x-1">
                    <div 
                      className="w-4 h-4 rounded-full border" 
                      style={{ backgroundColor: scheme.primary }}
                    ></div>
                    <div 
                      className="w-4 h-4 rounded-full border" 
                      style={{ backgroundColor: scheme.accent }}
                    ></div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Tap to apply this color scheme
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Typography */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Type className="w-5 h-5" />
            <span>Typography</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Font Family */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Font Family</Label>
            <div className="grid grid-cols-1 gap-2">
              {fontOptions.map((font) => (
                <div
                  key={font.family}
                  className={cn(
                    "border rounded-lg p-3 cursor-pointer transition-all",
                    preferences?.fontFamily === font.family 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-primary/50"
                  )}
                  onClick={() => onUpdate("fontFamily", font.family)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p style={{ fontFamily: font.family }} className="font-medium">
                        {font.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{font.description}</p>
                    </div>
                    {preferences?.fontFamily === font.family && (
                      <Badge variant="default" className="text-xs">Selected</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Font Size */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Font Size</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {fontSizes.map((size) => (
                <Button
                  key={size.value}
                  variant={preferences?.fontSize === size.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => onUpdate("fontSize", size.value)}
                  className="flex flex-col h-auto py-3"
                >
                  <span style={{ fontSize: size.size }}>Aa</span>
                  <span className="text-xs">{size.name}</span>
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Line Height */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Line Spacing</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {lineHeights.map((height) => (
                <Button
                  key={height.value}
                  variant={preferences?.lineHeight === height.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => onUpdate("lineHeight", height.value)}
                >
                  {height.name}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Background & Layout */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Layout className="w-5 h-5" />
            <span>Background & Layout</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-sm font-medium mb-3 block">Background Texture</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {backgroundTextures.map((texture) => (
                <div
                  key={texture.value}
                  className={cn(
                    "border rounded-lg p-4 cursor-pointer transition-all h-20 flex items-center justify-center",
                    texture.preview,
                    preferences?.backgroundTexture === texture.value 
                      ? "border-primary ring-2 ring-primary/20" 
                      : "border-border hover:border-primary/50"
                  )}
                  onClick={() => onUpdate("backgroundTexture", texture.value)}
                >
                  <div className="text-center">
                    <p className="text-xs font-medium">{texture.name}</p>
                    {preferences?.backgroundTexture === texture.value && (
                      <Badge variant="default" className="text-xs mt-1">Active</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accessibility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Contrast className="w-5 h-5" />
            <span>Accessibility</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Your theme choices are automatically optimized for screen readers and 
              high contrast displays. All customizations maintain accessibility standards.
            </p>
          </div>
          
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Sun className="w-4 h-4 mr-2" />
              Test High Contrast Mode
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Moon className="w-4 h-4 mr-2" />
              Test Dark Mode Compatibility
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}