import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/lib/theme";
import { 
  Menu, 
  Search, 
  Bell, 
  Moon, 
  Sun, 
  Plus,
  Monitor
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <div className="hidden lg:block">
            <h2 className="text-2xl font-bold text-foreground">
              {getGreeting()}, Sarah!
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Ready to reflect on your day?
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="hidden md:flex items-center bg-muted rounded-xl px-4 py-2 w-64">
            <Search className="text-muted-foreground mr-3 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search your entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none shadow-none focus-visible:ring-0 p-0 text-sm placeholder:text-muted-foreground"
            />
          </div>

          {/* Notification Bell */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-5 h-5" />
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 w-3 h-3 p-0 text-xs"
            >
              3
            </Badge>
          </Button>

          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                {theme === "light" && <Sun className="w-5 h-5" />}
                {theme === "dark" && <Moon className="w-5 h-5" />}
                {theme === "system" && <Monitor className="w-5 h-5" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="mr-2 h-4 w-4" />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="mr-2 h-4 w-4" />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Monitor className="mr-2 h-4 w-4" />
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Quick Actions */}
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 space-x-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:block">New Entry</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
