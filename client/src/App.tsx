import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNavigation } from "@/components/layout/bottom-nav";
import Dashboard from "@/pages/dashboard";
import NewEntry from "@/pages/new-entry";
import Calendar from "@/pages/calendar";
import Analytics from "@/pages/analytics";
import Search from "@/pages/search";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";
import { useState } from "react";
import { cn } from "@/lib/utils";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/new-entry" component={NewEntry} />
      <Route path="/calendar" component={Calendar} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/search" component={Search} />
      <Route path="/settings" component={Settings} />
      <Route path="/ai-insights" component={Analytics} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-background text-foreground">
            <div className="flex h-screen overflow-hidden">
              {/* Sidebar */}
              <Sidebar />
              
              {/* Mobile sidebar overlay */}
              {sidebarOpen && (
                <div 
                  className="fixed inset-0 z-50 bg-black/20 lg:hidden"
                  onClick={() => setSidebarOpen(false)}
                />
              )}

              {/* Main content */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <Router />
              </div>
            </div>

            {/* Bottom navigation for mobile */}
            <BottomNavigation />
          </div>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
