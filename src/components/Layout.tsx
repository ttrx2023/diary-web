import { Outlet, NavLink, useLocation } from "react-router-dom";
import { BookOpen, Calendar, Settings as SettingsIcon, Menu, X, Search, BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { GlobalSearch } from "@/components/search/GlobalSearch";

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navItems = [
    { to: "/", icon: BookOpen, label: "Journal" },
    { to: "/history", icon: Calendar, label: "History" },
    { to: "/statistics", icon: BarChart3, label: "Statistics" },
    { to: "/settings", icon: SettingsIcon, label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row relative overflow-hidden font-sans text-foreground selection:bg-primary/10">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <span className="font-serif font-bold text-xl tracking-tight">Diary Web</span>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)}>
            <Search className="h-5 w-5" />
          </Button>
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Sidebar (Desktop) / Mobile Menu */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-card border-r shadow-paper transform transition-transform duration-300 ease-in-out md:translate-x-0 md:relative md:shadow-none md:h-auto md:bg-transparent",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-8 pb-4">
          <h1 className="font-serif font-bold text-3xl tracking-tighter text-primary">
            Diary Web
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">Capture your days</p>
        </div>

        {/* Search Button (Desktop) */}
        <div className="px-4 mb-4 hidden md:block">
          <Button
            variant="outline"
            onClick={() => setIsSearchOpen(true)}
            className="w-full justify-start text-muted-foreground hover:text-foreground"
          >
            <Search className="h-4 w-4 mr-2" />
            <span>Search...</span>
            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
        </div>

        <nav className="flex-1 px-4 space-y-2 py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-md transition-all duration-200 group relative overflow-hidden",
                  isActive
                    ? "text-primary font-medium bg-secondary/50"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/30"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn(
                      "h-4 w-4 transition-colors",
                      isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  <span className="relative z-10">{item.label}</span>
                  {/* Active Indicator */}
                  <div
                    className={cn(
                      "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-primary rounded-r transition-all duration-300",
                      isActive ? "h-8 opacity-100" : "h-0 opacity-0"
                    )}
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Theme Toggle (Desktop) */}
        <div className="p-4 border-t hidden md:flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Theme</span>
          <ThemeToggle />
        </div>

        <div className="p-6 text-xs text-muted-foreground/50 text-center">
          v0.2.0 • Local Storage
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden animate-in fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 md:pt-12 overflow-y-auto h-[calc(100vh-64px)] md:h-screen scroll-smooth">
        <div className="max-w-5xl mx-auto animate-in fade-in duration-500 slide-in-from-bottom-4">
          <Outlet />
        </div>
      </main>

      {/* Global Search Modal */}
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}
