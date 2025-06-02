import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Calendar, 
  Plus, 
  TrendingUp, 
  User 
} from "lucide-react";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Add", href: "/new-entry", icon: Plus, isMain: true },
  { name: "Analytics", href: "/analytics", icon: TrendingUp },
  { name: "Profile", href: "/profile", icon: User },
];

export function BottomNavigation() {
  const [location] = useLocation();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-2 safe-area-pb z-50">
      <div className="flex justify-around items-center">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href || 
            (item.href !== "/" && location.startsWith(item.href));

          if (item.isMain) {
            return (
              <Link key={item.name} href={item.href}>
                <Button 
                  size="lg"
                  className="relative -mt-6 bg-primary hover:bg-primary/90 w-14 h-14 rounded-full shadow-lg transition-colors"
                >
                  <Icon className="w-6 h-6 text-primary-foreground" />
                </Button>
              </Link>
            );
          }

          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "flex flex-col items-center space-y-1 py-2 px-3 h-auto min-w-0",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.name}</span>
              </Button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
