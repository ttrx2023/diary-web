import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import type { DailyEntry } from "@/types/index";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, ChevronLeft, ChevronRight, BookOpen, Utensils, Activity, ListTodo, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from "date-fns";
import { ExportModal } from "@/components/export/ExportModal";

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
            entry.todos?.length > 0
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

  const hasContent = (dateStr: string) => {
    return !!entries[dateStr];
  };

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
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get the day of week for the first day (0 = Sunday)
  const firstDayOfWeek = monthStart.getDay();

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-primary">History</h1>
          <p className="text-muted-foreground mt-2">Browse your past journal entries.</p>
        </div>
        <Button
          onClick={() => setShowExportModal(true)}
          className="bg-indigo-500 hover:bg-indigo-600 text-white"
        >
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" size="icon" onClick={previousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-serif font-bold">
                {format(currentMonth, "MMMM yyyy")}
              </h2>
            </div>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground animate-pulse">
              Loading calendar...
            </div>
          ) : (
            <>
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {/* Week day headers */}
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs font-medium text-muted-foreground py-2"
                  >
                    {day}
                  </div>
                ))}

                {/* Empty cells for days before month starts */}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {/* Calendar days */}
                {daysInMonth.map((day) => {
                  const dateStr = format(day, "yyyy-MM-dd");
                  const hasEntry = hasContent(dateStr);
                  const entry = entries[dateStr];
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isTodayDate = isToday(day);

                  return (
                    <button
                      key={dateStr}
                      onClick={() => goToDate(day)}
                      className={`
                        aspect-square p-2 rounded-lg border-2 transition-all hover:border-primary/50 hover:shadow-md
                        ${isCurrentMonth ? "opacity-100" : "opacity-40"}
                        ${isTodayDate ? "border-primary bg-primary/5" : "border-transparent"}
                        ${hasEntry ? "bg-secondary/50 hover:bg-secondary" : "hover:bg-secondary/30"}
                      `}
                    >
                      <div className="flex flex-col h-full">
                        <span
                          className={`text-sm font-medium mb-1 ${
                            isTodayDate ? "text-primary font-bold" : "text-foreground"
                          }`}
                        >
                          {format(day, "d")}
                        </span>

                        {hasEntry && (
                          <div className="flex flex-col gap-0.5 mt-auto">
                            {entry.thoughts && (
                              <div className="h-1 w-full bg-blue-500/60 rounded-full" title="Has thoughts" />
                            )}
                            {(entry.diet.breakfast || entry.diet.lunch || entry.diet.dinner || entry.diet.snacks) && (
                              <div className="h-1 w-full bg-green-500/60 rounded-full" title="Has diet log" />
                            )}
                            {entry.exercises.length > 0 && (
                              <div className="h-1 w-full bg-orange-500/60 rounded-full" title="Has exercises" />
                            )}
                            {entry.todos?.length > 0 && (
                              <div className="h-1 w-full bg-purple-500/60 rounded-full" title="Has tasks" />
                            )}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-6 pt-6 border-t">
                <p className="text-xs font-medium text-muted-foreground mb-3">Legend:</p>
                <div className="flex flex-wrap gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3 text-blue-500" />
                      <div className="h-1 w-6 bg-blue-500/60 rounded-full" />
                    </div>
                    <span className="text-muted-foreground">Thoughts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Utensils className="h-3 w-3 text-green-500" />
                      <div className="h-1 w-6 bg-green-500/60 rounded-full" />
                    </div>
                    <span className="text-muted-foreground">Diet</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Activity className="h-3 w-3 text-orange-500" />
                      <div className="h-1 w-6 bg-orange-500/60 rounded-full" />
                    </div>
                    <span className="text-muted-foreground">Exercise</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <ListTodo className="h-3 w-3 text-purple-500" />
                      <div className="h-1 w-6 bg-purple-500/60 rounded-full" />
                    </div>
                    <span className="text-muted-foreground">Tasks</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Entry count summary */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-medium mb-3">This Month</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-secondary/30 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {Object.keys(entries).length}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Total Entries</div>
            </div>
            <div className="text-center p-4 bg-blue-500/10 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {Object.values(entries).filter((e) => e.thoughts).length}
              </div>
              <div className="text-xs text-muted-foreground mt-1">With Thoughts</div>
            </div>
            <div className="text-center p-4 bg-green-500/10 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Object.values(entries).filter(
                  (e) => e.diet.breakfast || e.diet.lunch || e.diet.dinner || e.diet.snacks
                ).length}
              </div>
              <div className="text-xs text-muted-foreground mt-1">With Diet</div>
            </div>
            <div className="text-center p-4 bg-orange-500/10 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {Object.values(entries).filter((e) => e.exercises.length > 0).length}
              </div>
              <div className="text-xs text-muted-foreground mt-1">With Exercise</div>
            </div>
            <div className="text-center p-4 bg-purple-500/10 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Object.values(entries).filter((e) => e.todos?.length > 0).length}
              </div>
              <div className="text-xs text-muted-foreground mt-1">With Tasks</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />
    </div>
  );
}
