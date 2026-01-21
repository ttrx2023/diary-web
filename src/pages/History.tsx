import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import type { DailyEntry } from "@/types/index";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, ChevronLeft, ChevronRight, BookOpen, Utensils, Activity, ListTodo, Download, Star, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday } from "date-fns";
import { ExportModal } from "@/components/export/ExportModal";
import { cn } from "@/lib/utils";

export default function History() {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [entries, setEntries] = useState<Record<string, DailyEntry>>({});
  const [loading, setLoading] = useState(true);
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadData = async () => {
      setLoading(true);
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);
      const startStr = format(start, "yyyy-MM-dd");
      const endStr = format(end, "yyyy-MM-dd");

      try {
        const entriesList = await api.getEntriesByDateRange(startStr, endStr);
        const entriesMap: Record<string, DailyEntry> = {};

        for (const entry of entriesList) {
          if (
            entry.thoughts ||
            entry.diet.breakfast ||
            entry.diet.lunch ||
            entry.diet.dinner ||
            entry.diet.snacks ||
            entry.exercises.length > 0 ||
            (entry.todos?.length ?? 0) > 0 ||
            (entry.discoveries?.length ?? 0) > 0 ||
            entry.isFavorite
          ) {
            entriesMap[entry.date] = entry;
          }
        }

        if (isActive) {
          setEntries(entriesMap);
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to load entries for month:", error);
        if (isActive) {
          setEntries({});
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isActive = false;
    };
  }, [currentMonth]);

  const goToDate = (date: Date) => {
    navigate(`/?date=${format(date, "yyyy-MM-dd")}`);
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  // Get full calendar grid including days from prev/next month
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

  // Calculate statistics
  const entryList = Object.values(entries);
  const stats = {
    total: entryList.length,
    thoughts: entryList.filter(e => e.thoughts).length,
    diet: entryList.filter(e => e.diet.breakfast || e.diet.lunch || e.diet.dinner || e.diet.snacks).length,
    exercise: entryList.filter(e => e.exercises.length > 0).length,
    tasks: entryList.filter(e => (e.todos?.length ?? 0) > 0).length,
    discoveries: entryList.filter(e => (e.discoveries?.length ?? 0) > 0).length,
    favorites: entryList.filter(e => e.isFavorite).length,
  };

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between py-2">
        <div>
          <h1 className="text-2xl font-serif font-bold tracking-tight text-primary">History</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Browse your journal entries</p>
        </div>
        <Button
          onClick={() => setShowExportModal(true)}
          size="sm"
          className="bg-indigo-500 hover:bg-indigo-600 text-white h-9"
        >
          <Download className="mr-1.5 h-3.5 w-3.5" />
          Export
        </Button>
      </div>

      {/* Main Content - Calendar + Stats Side by Side */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardContent className="p-4">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="icon" onClick={previousMonth} className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <h2 className="text-lg font-serif font-bold">
                  {format(currentMonth, "MMMM yyyy")}
                </h2>
              </div>
              <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-8 text-muted-foreground animate-pulse text-sm">
                Loading calendar...
              </div>
            ) : (
              <>
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                                  {/* Week day headers */}
                  {weekDays.map((day, i) => (
                    <div
                      key={i}
                      className="text-center text-[10px] font-medium text-muted-foreground py-1"
                    >
                      {day}
                    </div>
                  ))}

                  {/* Calendar days - includes prev/next month days */}
                  {calendarDays.map((day) => {
                    const dateStr = format(day, "yyyy-MM-dd");
                    const entry = entries[dateStr];
                    const hasEntry = !!entry;
                    const isCurrentMonth = isSameMonth(day, currentMonth);
                    const isTodayDate = isToday(day);
                    const isFavorite = entry?.isFavorite;

                    // Content indicators
                    const hasThoughts = entry?.thoughts;
                    const hasDiet = entry?.diet.breakfast || entry?.diet.lunch || entry?.diet.dinner || entry?.diet.snacks;
                    const hasExercise = (entry?.exercises.length ?? 0) > 0;
                    const hasTodos = (entry?.todos?.length ?? 0) > 0;

                    return (
                      <button
                        key={dateStr}
                        onClick={() => goToDate(day)}
                        className={cn(
                          "relative h-10 rounded-md transition-all hover:bg-secondary/80 group",
                          isCurrentMonth ? "opacity-100" : "opacity-40 text-muted-foreground",
                          isTodayDate && "ring-2 ring-primary ring-offset-1",
                          hasEntry && isCurrentMonth && "bg-secondary/50",
                          hasEntry && !isCurrentMonth && "bg-secondary/30"
                        )}
                      >
                        <div className="flex flex-col items-center justify-center h-full">
                          <span className={cn(
                            "text-xs font-medium",
                            isTodayDate && "text-primary font-bold",
                            !isCurrentMonth && "text-muted-foreground"
                          )}>
                            {format(day, "d")}
                          </span>

                          {/* Content indicator dots */}
                          {hasEntry && (
                            <div className="flex gap-0.5 mt-0.5">
                              {hasThoughts && <div className={cn("w-1 h-1 rounded-full bg-blue-500", !isCurrentMonth && "opacity-50")} />}
                              {hasDiet && <div className={cn("w-1 h-1 rounded-full bg-green-500", !isCurrentMonth && "opacity-50")} />}
                              {hasExercise && <div className={cn("w-1 h-1 rounded-full bg-orange-500", !isCurrentMonth && "opacity-50")} />}
                              {hasTodos && <div className={cn("w-1 h-1 rounded-full bg-purple-500", !isCurrentMonth && "opacity-50")} />}
                            </div>
                          )}
                        </div>

                        {/* Favorite star */}
                        {isFavorite && (
                          <Star className={cn("absolute top-0.5 right-0.5 h-2.5 w-2.5 text-yellow-500 fill-current", !isCurrentMonth && "opacity-50")} />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="mt-4 pt-3 border-t flex flex-wrap gap-3 text-[10px]">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span className="text-muted-foreground">Thoughts</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="text-muted-foreground">Diet</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                    <span className="text-muted-foreground">Exercise</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    <span className="text-muted-foreground">Tasks</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-2.5 h-2.5 text-yellow-500 fill-current" />
                    <span className="text-muted-foreground">Favorite</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Stats Panel */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-serif font-bold text-sm mb-3">This Month</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 bg-secondary/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs">Total Entries</span>
                </div>
                <span className="text-lg font-bold text-primary">{stats.total}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-blue-500/10 rounded-lg">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-3.5 w-3.5 text-blue-500" />
                  <span className="text-xs">With Thoughts</span>
                </div>
                <span className="text-lg font-bold text-blue-600">{stats.thoughts}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-green-500/10 rounded-lg">
                <div className="flex items-center gap-2">
                  <Utensils className="h-3.5 w-3.5 text-green-500" />
                  <span className="text-xs">With Diet</span>
                </div>
                <span className="text-lg font-bold text-green-600">{stats.diet}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-orange-500/10 rounded-lg">
                <div className="flex items-center gap-2">
                  <Activity className="h-3.5 w-3.5 text-orange-500" />
                  <span className="text-xs">With Exercise</span>
                </div>
                <span className="text-lg font-bold text-orange-600">{stats.exercise}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-purple-500/10 rounded-lg">
                <div className="flex items-center gap-2">
                  <ListTodo className="h-3.5 w-3.5 text-purple-500" />
                  <span className="text-xs">With Tasks</span>
                </div>
                <span className="text-lg font-bold text-purple-600">{stats.tasks}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-yellow-500/10 rounded-lg">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-3.5 w-3.5 text-yellow-500" />
                  <span className="text-xs">Discoveries</span>
                </div>
                <span className="text-lg font-bold text-yellow-600">{stats.discoveries}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-yellow-500/5 rounded-lg border border-yellow-500/20">
                <div className="flex items-center gap-2">
                  <Star className="h-3.5 w-3.5 text-yellow-500 fill-current" />
                  <span className="text-xs">Favorites</span>
                </div>
                <span className="text-lg font-bold text-yellow-600">{stats.favorites}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />
    </div>
  );
}
