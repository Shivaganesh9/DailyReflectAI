import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Home, 
  Plus, 
  Calendar, 
  TrendingUp, 
  Brain, 
  Search, 
  Settings,
  PenTool
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "New Entry", href: "/new-entry", icon: Plus },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Analytics", href: "/analytics", icon: TrendingUp },
  { name: "AI Insights", href: "/ai-insights", icon: Brain },
  { name: "Search", href: "/search", icon: Search },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="hidden lg:flex lg:w-64 bg-card border-r border-border flex-col">
      {/* Logo and Brand */}
      <div className="p-6 border-b border-border/10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <PenTool className="text-primary-foreground w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text">MindScribe</h1>
            <p className="text-xs text-muted-foreground">Your Personal Journal</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href || 
            (item.href !== "/" && location.startsWith(item.href));
          
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start space-x-3 h-12",
                  isActive && "bg-primary/10 text-primary font-medium hover:bg-primary/15"
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-border/10">
        <div className="flex items-center space-x-3 p-3 rounded-xl hover:bg-muted/50 cursor-pointer transition-colors">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-primary text-primary-foreground">
              SJ
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-medium text-sm">Sarah Johnson</p>
            <p className="text-xs text-muted-foreground">Premium Member</p>
          </div>
          <Button variant="ghost" size="sm" className="p-2">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
