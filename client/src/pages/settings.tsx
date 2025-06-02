import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeCustomizer } from "@/components/ui/theme-customizer";
import { PrivacySettings } from "@/components/ui/privacy-settings";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings as SettingsIcon, 
  Palette, 
  Shield, 
  Bell, 
  Download,
  Save
} from "lucide-react";
import { type UserPreferences } from "@shared/schema";

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [hasChanges, setHasChanges] = useState(false);
  const [localPreferences, setLocalPreferences] = useState<Partial<UserPreferences>>({});

  const { data: preferences, isLoading } = useQuery<UserPreferences>({
    queryKey: ["/api/preferences"],
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<UserPreferences>) => {
      const response = await apiRequest("PUT", "/api/preferences", updates);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/preferences"] });
      setHasChanges(false);
      setLocalPreferences({});
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePreferenceUpdate = (field: string, value: any) => {
    setLocalPreferences(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const saveChanges = () => {
    if (Object.keys(localPreferences).length > 0) {
      updateMutation.mutate(localPreferences);
    }
  };

  const currentPreferences = { ...preferences, ...localPreferences };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="w-full h-64" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="w-full h-48" />
              <Skeleton className="w-full h-48" />
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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold gradient-text mb-2">Settings</h1>
                <p className="text-muted-foreground">Customize your diary experience</p>
              </div>
              {hasChanges && (
                <Button 
                  onClick={saveChanges}
                  disabled={updateMutation.isPending}
                  className="flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{updateMutation.isPending ? "Saving..." : "Save Changes"}</span>
                </Button>
              )}
            </div>
          </div>

          <Tabs defaultValue="appearance" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="appearance" className="flex items-center space-x-2">
                <Palette className="w-4 h-4" />
                <span>Appearance</span>
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>Privacy</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center space-x-2">
                <Bell className="w-4 h-4" />
                <span>Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="data" className="flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Data</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="appearance" className="mt-6">
              <ThemeCustomizer 
                preferences={currentPreferences}
                onUpdate={handlePreferenceUpdate}
              />
            </TabsContent>

            <TabsContent value="privacy" className="mt-6">
              <PrivacySettings 
                preferences={currentPreferences}
                onUpdate={handlePreferenceUpdate}
              />
            </TabsContent>

            <TabsContent value="notifications" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="w-5 h-5" />
                    <span>Notification Preferences</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        Set up gentle reminders to maintain your journaling habit. 
                        All notifications are optional and can be customized to your preference.
                      </p>
                    </div>
                    
                    {/* Notification settings would go here */}
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Notification settings coming soon!</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="data" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Download className="w-5 h-5" />
                    <span>Data Management</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                      <p className="text-sm text-green-800 dark:text-green-200">
                        Your data is always under your control. Export, backup, or manage your entries 
                        with complete transparency and security.
                      </p>
                    </div>
                    
                    {/* Data management options would go here */}
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Data export and backup options coming soon!</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}