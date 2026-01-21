import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionTimeline, type SectionType } from "@/components/diary/SectionTimeline";
import { usePreferences } from "@/hooks/usePreferences";
import { useAllEntries } from "@/hooks/useAllEntries";
import {
  BarChart3,
  Calendar,
  CheckSquare,
  Activity,
  BookOpen,
  Utensils,
  Lightbulb,
  Star,
  TrendingUp,
  Target,
  Flame,
  ChevronRight
} from "lucide-react";
import { format, isToday } from "date-fns";
import { cn } from "@/lib/utils";

// Skeleton component for loading state
function StatsSkeleton() {
  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in duration-300">
      {/* Header skeleton */}
      <div className="border-b pb-2 md:pb-4">
        <div className="h-7 md:h-9 bg-secondary rounded-md w-24 animate-pulse" />
        <div className="hidden md:block h-4 bg-secondary rounded w-64 mt-2 animate-pulse" />
      </div>

      {/* Streak cards skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-24 md:h-32 bg-secondary/50 rounded-xl animate-pulse" />
        ))}
      </div>

      {/* Content cards skeleton */}
      <div className="grid gap-3 md:gap-4 grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="h-20 md:h-28 bg-secondary/50 rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export default function Statistics() {
  const [searchParams] = useSearchParams();
  const [selectedSection, setSelectedSection] = useState<SectionType | null>(null);
  const { preferences } = usePreferences();

  // Use React Query for cached data loading
  const { entries, stats, isLoading } = useAllEntries();

  // Handle URL parameter for direct section access - only run once on mount
  useEffect(() => {
    const sectionParam = searchParams.get("section");
    if (sectionParam && ["thoughts", "diet", "exercise", "todo", "discovery"].includes(sectionParam)) {
      setSelectedSection(sectionParam as SectionType);
      // Clear the URL parameter after setting section
      window.history.replaceState({}, "", "/statistics");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Handle toggling todo completion from the timeline view
  const handleToggleTodo = useCallback(async (date: string, todoId: string) => {
    // Find the entry
    const entry = entries.find(e => e.date === date);
    if (!entry || !entry.todos) return;

    // Toggle the todo
    const updatedTodos = entry.todos.map(t => {
      if (t.id === todoId) {
        return {
          ...t,
          completed: !t.completed,
          completedAt: !t.completed ? new Date().toISOString() : undefined,
        };
      }
      return t;
    });

    // Persist to backend
    const updatedEntry = { ...entry, todos: updatedTodos };
    try {
      await api.saveEntry(updatedEntry);
    } catch (error) {
      console.error("Failed to update todo:", error);
    }
  }, [entries]);

  // Show skeleton while loading
  if (isLoading && !stats) {
    return <StatsSkeleton />;
  }

  if (!stats) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Failed to load statistics
      </div>
    );
  }

  const completionRate = stats.totalTodos > 0
    ? Math.round((stats.completedTodos / stats.totalTodos) * 100)
    : 0;

  // If a section is selected, show the timeline view
  if (selectedSection) {
    return (
      <SectionTimeline
        section={selectedSection}
        entries={entries}
        onBack={() => setSelectedSection(null)}
        onToggleTodo={handleToggleTodo}
      />
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header - Compact on mobile */}
      <div className="border-b pb-2 md:pb-4">
        <h1 className="text-xl md:text-3xl font-serif font-bold tracking-tight text-primary">Stats</h1>
        <p className="text-muted-foreground text-xs md:text-base mt-0.5 md:mt-2 hidden md:block">Your journaling insights and progress.</p>
      </div>

      {/* Streak Cards - Hidden on mobile by default, controlled by preferences */}
      <div className={cn(
        "grid gap-4 md:grid-cols-2 lg:grid-cols-4",
        !preferences.showStreak && "hidden md:grid"
      )}>
        <Card className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border-orange-500/20">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-muted-foreground">Current Streak</p>
                <p className="text-2xl md:text-3xl font-bold text-orange-600">{stats.currentStreak}</p>
                <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1">days</p>
              </div>
              <div className="p-2 md:p-3 bg-orange-500/20 rounded-full">
                <Flame className="h-5 w-5 md:h-6 md:w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-muted-foreground">Longest Streak</p>
                <p className="text-2xl md:text-3xl font-bold text-purple-600">{stats.longestStreak}</p>
                <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1">days</p>
              </div>
              <div className="p-2 md:p-3 bg-purple-500/20 rounded-full">
                <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(
          "bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20",
          !preferences.showTodoProgress && "hidden md:block"
        )}>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-muted-foreground">Task Completion</p>
                <p className="text-2xl md:text-3xl font-bold text-green-600">{completionRate}%</p>
                <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1">{stats.completedTodos}/{stats.totalTodos} done</p>
              </div>
              <div className="p-2 md:p-3 bg-green-500/20 rounded-full">
                <Target className="h-5 w-5 md:h-6 md:w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(
          "bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-500/20",
          !preferences.showFavorites && "hidden md:block"
        )}>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-muted-foreground">Favorites</p>
                <p className="text-2xl md:text-3xl font-bold text-yellow-600">{stats.favoriteEntries}</p>
                <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1">starred entries</p>
              </div>
              <div className="p-2 md:p-3 bg-yellow-500/20 rounded-full">
                <Star className="h-5 w-5 md:h-6 md:w-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Activity - Hidden on mobile by default */}
      <Card className={cn(
        !preferences.showWeeklyActivity && "hidden md:block"
      )}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Calendar className="h-4 w-4 md:h-5 md:w-5" />
            This Week's Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between gap-2">
            {stats.weeklyActivity.map((day) => {
              const dayDate = new Date(day.date + "T00:00:00");
              const dayName = format(dayDate, "EEE");
              const isCurrentDay = isToday(dayDate);

              return (
                <div key={day.date} className="flex-1 text-center">
                  <p className={`text-xs font-medium mb-2 ${isCurrentDay ? "text-primary" : "text-muted-foreground"}`}>
                    {dayName}
                  </p>
                  <div
                    className={`
                      h-12 rounded-lg transition-all
                      ${day.hasEntry
                        ? "bg-primary"
                        : "bg-secondary"
                      }
                      ${isCurrentDay ? "ring-2 ring-primary ring-offset-2" : ""}
                    `}
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Content Statistics - Clickable Cards */}
      <div className="grid gap-3 md:gap-4 grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
        {/* Thoughts Card */}
        <Card
          className={cn(
            "cursor-pointer transition-all hover:shadow-md hover:border-blue-500/30 group hover-card",
            stats.entriesWithThoughts === 0 && "opacity-50 cursor-not-allowed"
          )}
          onClick={() => stats.entriesWithThoughts > 0 && setSelectedSection("thoughts")}
        >
          <CardHeader className="pb-1 md:pb-2 p-3 md:p-6">
            <CardTitle className="text-sm md:text-base flex items-center justify-between">
              <div className="flex items-center gap-1.5 md:gap-2">
                <BookOpen className="h-3.5 w-3.5 md:h-4 md:w-4 text-blue-500" />
                <span className="hidden md:inline">Thoughts</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground/30 group-hover:text-blue-500 transition-colors" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
            <p className="text-xl md:text-2xl font-bold">{stats.entriesWithThoughts}</p>
            <p className="text-[10px] md:text-xs text-muted-foreground">entries</p>
          </CardContent>
        </Card>

        {/* Diet Card */}
        <Card
          className={cn(
            "cursor-pointer transition-all hover:shadow-md hover:border-green-500/30 group hover-card",
            stats.entriesWithDiet === 0 && "opacity-50 cursor-not-allowed"
          )}
          onClick={() => stats.entriesWithDiet > 0 && setSelectedSection("diet")}
        >
          <CardHeader className="pb-1 md:pb-2 p-3 md:p-6">
            <CardTitle className="text-sm md:text-base flex items-center justify-between">
              <div className="flex items-center gap-1.5 md:gap-2">
                <Utensils className="h-3.5 w-3.5 md:h-4 md:w-4 text-green-500" />
                <span className="hidden md:inline">Diet Logs</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground/30 group-hover:text-green-500 transition-colors" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
            <p className="text-xl md:text-2xl font-bold">{stats.entriesWithDiet}</p>
            <p className="text-[10px] md:text-xs text-muted-foreground">days</p>
          </CardContent>
        </Card>

        {/* Exercise Card - Enhanced with streak info */}
        <Card
          className={cn(
            "cursor-pointer transition-all hover:shadow-md hover:border-orange-500/30 group hover-card",
            stats.entriesWithExercise === 0 && "opacity-50 cursor-not-allowed"
          )}
          onClick={() => stats.entriesWithExercise > 0 && setSelectedSection("exercise")}
        >
          <CardHeader className="pb-1 md:pb-2 p-3 md:p-6">
            <CardTitle className="text-sm md:text-base flex items-center justify-between">
              <div className="flex items-center gap-1.5 md:gap-2">
                <Activity className="h-3.5 w-3.5 md:h-4 md:w-4 text-orange-500" />
                <span className="hidden md:inline">Exercises</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground/30 group-hover:text-orange-500 transition-colors" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
            <p className="text-xl md:text-2xl font-bold">{stats.totalExercises}</p>
            <p className="text-[10px] md:text-xs text-muted-foreground">workouts</p>
          </CardContent>
        </Card>

        {/* Tasks Card */}
        <Card
          className={cn(
            "cursor-pointer transition-all hover:shadow-md hover:border-purple-500/30 group hover-card",
            stats.entriesWithTodos === 0 && "opacity-50 cursor-not-allowed"
          )}
          onClick={() => stats.entriesWithTodos > 0 && setSelectedSection("todo")}
        >
          <CardHeader className="pb-1 md:pb-2 p-3 md:p-6">
            <CardTitle className="text-sm md:text-base flex items-center justify-between">
              <div className="flex items-center gap-1.5 md:gap-2">
                <CheckSquare className="h-3.5 w-3.5 md:h-4 md:w-4 text-purple-500" />
                <span className="hidden md:inline">Tasks</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground/30 group-hover:text-purple-500 transition-colors" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
            <p className="text-xl md:text-2xl font-bold">{completionRate}%</p>
            <p className="text-[10px] md:text-xs text-muted-foreground">{stats.completedTodos}/{stats.totalTodos}</p>
          </CardContent>
        </Card>

        {/* Discoveries Card */}
        <Card
          className={cn(
            "cursor-pointer transition-all hover:shadow-md hover:border-yellow-500/30 group hover-card",
            stats.entriesWithDiscoveries === 0 && "opacity-50 cursor-not-allowed"
          )}
          onClick={() => stats.entriesWithDiscoveries > 0 && setSelectedSection("discovery")}
        >
          <CardHeader className="pb-1 md:pb-2 p-3 md:p-6">
            <CardTitle className="text-sm md:text-base flex items-center justify-between">
              <div className="flex items-center gap-1.5 md:gap-2">
                <Lightbulb className="h-3.5 w-3.5 md:h-4 md:w-4 text-yellow-500" />
                <span className="hidden md:inline">Discoveries</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground/30 group-hover:text-yellow-500 transition-colors" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
            <p className="text-xl md:text-2xl font-bold">{stats.totalDiscoveries}</p>
            <p className="text-[10px] md:text-xs text-muted-foreground">insights</p>
          </CardContent>
        </Card>

        {/* Total Entries Card */}
        <Card className="hover-card">
          <CardHeader className="pb-1 md:pb-2 p-3 md:p-6">
            <CardTitle className="text-sm md:text-base flex items-center gap-1.5 md:gap-2">
              <BarChart3 className="h-3.5 w-3.5 md:h-4 md:w-4 text-indigo-500" />
              <span className="hidden md:inline">Total Entries</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
            <p className="text-xl md:text-2xl font-bold">{stats.totalEntries}</p>
            <p className="text-[10px] md:text-xs text-muted-foreground">entries</p>
          </CardContent>
        </Card>
      </div>

      {/* Mobile hint for settings */}
      <p className="text-center text-xs text-muted-foreground md:hidden py-2">
        更多统计选项可在设置中开启
      </p>
    </div>
  );
}
