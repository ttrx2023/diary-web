import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { DailyEntry } from "@/types/index";
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";

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

function calculateStats(allEntries: DailyEntry[]): Stats {
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

  return {
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
}

export function useAllEntries() {
  const query = useQuery({
    queryKey: ["allEntries"],
    queryFn: () => api.getAllEntries(),
    staleTime: 1000 * 60 * 5, // 5 minutes - data stays fresh
    gcTime: 1000 * 60 * 30, // 30 minutes - keep in cache
  });

  const entries = query.data ?? [];
  const nonEmptyEntries = entries.filter(e =>
    e.thoughts ||
    e.diet.breakfast || e.diet.lunch || e.diet.dinner || e.diet.snacks ||
    e.exercises.length > 0 ||
    (e.todos?.length ?? 0) > 0 ||
    (e.discoveries?.length ?? 0) > 0
  );

  const stats = query.data ? calculateStats(query.data) : null;

  return {
    entries: nonEmptyEntries,
    stats,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}
