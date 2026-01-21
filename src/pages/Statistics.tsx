import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import type { DailyEntry } from "@/types/index";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionTimeline, type SectionType } from "@/components/diary/SectionTimeline";
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
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isToday } from "date-fns";
import { cn } from "@/lib/utils";

interface Stats {
  totalEntries: number;
  totalDays: number;
  entriesWithThoughts: number;
  entriesWithDiet: number;
  entriesWithExercise: number;
  entriesWithTodos: number;
  entriesWithDiscoveries: number;
  favoriteEntries: number;
  totalTodos: number;
  completedTodos: number;
  totalExercises: number;
  totalDiscoveries: number;
  currentStreak: number;
  longestStreak: number;
  weeklyActivity: { date: string; hasEntry: boolean }[];
}

export default function Statistics() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [allEntries, setAllEntries] = useState<DailyEntry[]>([]);
  const [selectedSection, setSelectedSection] = useState<SectionType | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        const allEntries = await api.getAllEntries();

        // Filter non-empty entries
        const nonEmpty = allEntries.filter(e =>
          e.thoughts ||
          e.diet.breakfast || e.diet.lunch || e.diet.dinner || e.diet.snacks ||
          e.exercises.length > 0 ||
          (e.todos?.length ?? 0) > 0 ||
          (e.discoveries?.length ?? 0) > 0
        );

        // Calculate streaks
        const sortedDates = nonEmpty.map(e => e.date).sort().reverse();
        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;

        const dateSet = new Set(sortedDates);

        // Current streak
        let checkDate = new Date();
        while (dateSet.has(format(checkDate, "yyyy-MM-dd"))) {
          currentStreak++;
          checkDate = subDays(checkDate, 1);
        }

        // Longest streak
        for (let i = 0; i < sortedDates.length; i++) {
          const current = new Date(sortedDates[i]);
          const next = i < sortedDates.length - 1 ? new Date(sortedDates[i + 1]) : null;

          tempStreak++;

          if (!next || (current.getTime() - next.getTime()) > 86400000 * 1.5) {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 0;
          }
        }

        // Weekly activity
        const weekStart = startOfWeek(new Date());
        const weekEnd = endOfWeek(new Date());
        const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
        const weeklyActivity = weekDays.map(day => ({
          date: format(day, "yyyy-MM-dd"),
          hasEntry: dateSet.has(format(day, "yyyy-MM-dd"))
        }));

        // Calculate stats
        const calculatedStats: Stats = {
          totalEntries: nonEmpty.length,
          totalDays: new Set(nonEmpty.map(e => e.date)).size,
          entriesWithThoughts: nonEmpty.filter(e => e.thoughts).length,
          entriesWithDiet: nonEmpty.filter(e => e.diet.breakfast || e.diet.lunch || e.diet.dinner || e.diet.snacks).length,
          entriesWithExercise: nonEmpty.filter(e => e.exercises.length > 0).length,
          entriesWithTodos: nonEmpty.filter(e => (e.todos?.length ?? 0) > 0).length,
          entriesWithDiscoveries: nonEmpty.filter(e => (e.discoveries?.length ?? 0) > 0).length,
          favoriteEntries: nonEmpty.filter(e => e.isFavorite).length,
          totalTodos: nonEmpty.reduce((acc, e) => acc + (e.todos?.length ?? 0), 0),
          completedTodos: nonEmpty.reduce((acc, e) => acc + (e.todos?.filter(t => t.completed).length ?? 0), 0),
          totalExercises: nonEmpty.reduce((acc, e) => acc + e.exercises.length, 0),
          totalDiscoveries: nonEmpty.reduce((acc, e) => acc + (e.discoveries?.length ?? 0), 0),
          currentStreak,
          longestStreak: Math.max(longestStreak, currentStreak),
          weeklyActivity,
        };

        setStats(calculatedStats);
        setAllEntries(nonEmpty);
      } catch (error) {
        console.error("Failed to load stats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  // Handle toggling todo completion from the timeline view
  const handleToggleTodo = useCallback(async (date: string, todoId: string) => {
    // Find the entry
    const entry = allEntries.find(e => e.date === date);
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

    // Optimistic update - update local state immediately
    const updatedEntry = { ...entry, todos: updatedTodos };
    setAllEntries(prev => prev.map(e => e.date === date ? updatedEntry : e));

    // Update stats
    if (stats) {
      const prevCompleted = entry.todos.find(t => t.id === todoId)?.completed;
      const newCompletedTodos = prevCompleted
        ? stats.completedTodos - 1
        : stats.completedTodos + 1;
      setStats({ ...stats, completedTodos: newCompletedTodos });
    }

    // Persist to backend
    try {
      await api.saveEntry(updatedEntry);
    } catch (error) {
      console.error("Failed to update todo:", error);
      // Rollback on error
      setAllEntries(prev => prev.map(e => e.date === date ? entry : e));
    }
  }, [allEntries, stats]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-secondary rounded w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-secondary rounded-xl" />
          ))}
        </div>
      </div>
    );
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
        entries={allEntries}
        onBack={() => setSelectedSection(null)}
        onToggleTodo={handleToggleTodo}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-3xl font-serif font-bold tracking-tight text-primary">Statistics</h1>
        <p className="text-muted-foreground mt-2">Your journaling insights and progress.</p>
      </div>

      {/* Streak Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border-orange-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Streak</p>
                <p className="text-3xl font-bold text-orange-600">{stats.currentStreak}</p>
                <p className="text-xs text-muted-foreground mt-1">days</p>
              </div>
              <div className="p-3 bg-orange-500/20 rounded-full">
                <Flame className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Longest Streak</p>
                <p className="text-3xl font-bold text-purple-600">{stats.longestStreak}</p>
                <p className="text-xs text-muted-foreground mt-1">days</p>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-full">
                <TrendingUp className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Task Completion</p>
                <p className="text-3xl font-bold text-green-600">{completionRate}%</p>
                <p className="text-xs text-muted-foreground mt-1">{stats.completedTodos}/{stats.totalTodos} done</p>
              </div>
              <div className="p-3 bg-green-500/20 rounded-full">
                <Target className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Favorites</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.favoriteEntries}</p>
                <p className="text-xs text-muted-foreground mt-1">starred entries</p>
              </div>
              <div className="p-3 bg-yellow-500/20 rounded-full">
                <Star className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card
          className={cn(
            "cursor-pointer transition-all hover:shadow-md hover:border-blue-500/30 group",
            stats.entriesWithThoughts === 0 && "opacity-50 cursor-not-allowed"
          )}
          onClick={() => stats.entriesWithThoughts > 0 && setSelectedSection("thoughts")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-500" />
                Thoughts
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-blue-500 transition-colors" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.entriesWithThoughts}</p>
            <p className="text-xs text-muted-foreground">entries with reflections</p>
          </CardContent>
        </Card>

        <Card
          className={cn(
            "cursor-pointer transition-all hover:shadow-md hover:border-green-500/30 group",
            stats.entriesWithDiet === 0 && "opacity-50 cursor-not-allowed"
          )}
          onClick={() => stats.entriesWithDiet > 0 && setSelectedSection("diet")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Utensils className="h-4 w-4 text-green-500" />
                Diet Logs
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-green-500 transition-colors" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.entriesWithDiet}</p>
            <p className="text-xs text-muted-foreground">days tracking meals</p>
          </CardContent>
        </Card>

        <Card
          className={cn(
            "cursor-pointer transition-all hover:shadow-md hover:border-orange-500/30 group",
            stats.entriesWithExercise === 0 && "opacity-50 cursor-not-allowed"
          )}
          onClick={() => stats.entriesWithExercise > 0 && setSelectedSection("exercise")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-orange-500" />
                Exercises
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-orange-500 transition-colors" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalExercises}</p>
            <p className="text-xs text-muted-foreground">workouts logged</p>
          </CardContent>
        </Card>

        <Card
          className={cn(
            "cursor-pointer transition-all hover:shadow-md hover:border-purple-500/30 group",
            stats.entriesWithTodos === 0 && "opacity-50 cursor-not-allowed"
          )}
          onClick={() => stats.entriesWithTodos > 0 && setSelectedSection("todo")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-purple-500" />
                Tasks
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-purple-500 transition-colors" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.completedTodos}</p>
            <p className="text-xs text-muted-foreground">tasks completed</p>
          </CardContent>
        </Card>

        <Card
          className={cn(
            "cursor-pointer transition-all hover:shadow-md hover:border-yellow-500/30 group",
            stats.entriesWithDiscoveries === 0 && "opacity-50 cursor-not-allowed"
          )}
          onClick={() => stats.entriesWithDiscoveries > 0 && setSelectedSection("discovery")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                Discoveries
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-yellow-500 transition-colors" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalDiscoveries}</p>
            <p className="text-xs text-muted-foreground">insights captured</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-indigo-500" />
              Total Entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalEntries}</p>
            <p className="text-xs text-muted-foreground">journal entries</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
