import { useEffect, useState, useTransition, useMemo, useRef } from 'react';
import { useSearchParams } from "react-router-dom";
import { ThoughtsSection } from "@/components/diary/ThoughtsSection";
import { DietSection } from "@/components/diary/DietSection";
import { ExerciseSection } from "@/components/diary/ExerciseSection";
import { TodoSection } from "@/components/diary/TodoSection";
import { DiscoverySection } from "@/components/diary/DiscoverySection";
import { MobileSectionTabs, type SectionType } from "@/components/diary/MobileSectionTabs";
import { MobileHistoryOverlay } from "@/components/diary/MobileHistoryOverlay";
import { useDiaryEntry, usePrefetchDates } from "@/hooks/useDiary";
import { api } from "@/lib/api";
import { Star, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const isValidDateParam = (value: string | null) => !!value && /^\d{4}-\d{2}-\d{2}$/.test(value);

const getTodayString = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().split('T')[0];
};

const formatDisplayDate = (dateStr: string) => {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawDateParam = searchParams.get("date");
  const dateParam = isValidDateParam(rawDateParam) ? rawDateParam : null;
  const [date, setDate] = useState(() => dateParam ?? getTodayString());
  const [isPending, startTransition] = useTransition();
  const [activeSection, setActiveSection] = useState<SectionType>("thoughts");

  // History Overlay State
  const [showHistory, setShowHistory] = useState(false);
  const [historySection, setHistorySection] = useState<SectionType | null>(null);

  const { entry, updateEntry, isFetching } = useDiaryEntry(date);
  const { prefetchAdjacent } = usePrefetchDates(date);

  const displayDateText = useMemo(() => formatDisplayDate(date), [date]);
  const isToday = useMemo(() => date === getTodayString(), [date]);

  // Auto-migrate unfinished todos from yesterday
  const hasCheckedMigration = useRef(false);

  useEffect(() => {
    const checkMigration = async () => {
      // Only run if it's today, we have an entry, and haven't checked yet in this session
      if (!isToday || !entry || hasCheckedMigration.current) return;

      hasCheckedMigration.current = true;

      try {
        const yesterday = new Date(date);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        const prevEntry = await api.getEntryByDate(yesterdayStr);

        if (prevEntry && prevEntry.todos && prevEntry.todos.length > 0) {
          const unfinished = prevEntry.todos.filter(t => !t.completed);

          if (unfinished.length > 0) {
             // Filter out tasks that already exist in today's list (matching by text)
             const currentTexts = new Set((entry.todos || []).map(t => t.text));
             const toMigrate = unfinished.filter(t => !currentTexts.has(t.text));

             if (toMigrate.length > 0) {
               console.log("Migrating todos:", toMigrate);
               const newTodos = [
                 ...toMigrate.map(t => ({
                   ...t,
                   id: crypto.randomUUID(),
                   createdAt: new Date().toISOString(),
                   // Add a subtle indicator or just keep text as is
                   text: t.text
                 })),
                 ...(entry.todos || [])
               ];
               updateEntry({ ...entry, todos: newTodos });
             }
          }
        }
      } catch (e) {
        console.error("Migration check failed", e);
      }
    };

    checkMigration();
  }, [isToday, date, entry, updateEntry]);

  // Reset migration check when date changes
  useEffect(() => {
    hasCheckedMigration.current = false;
  }, [date]);

  useEffect(() => {
    if (dateParam && dateParam !== date) {
      startTransition(() => {
        setDate(dateParam);
      });
      return;
    }

    if (!dateParam) {
      const fallbackDate = date || getTodayString();
      if (fallbackDate !== date) {
        setDate(fallbackDate);
      }
      setSearchParams({ date: fallbackDate }, { replace: true });
    }
  }, [dateParam, date, setSearchParams]);

  useEffect(() => {
    prefetchAdjacent();
  }, [date, prefetchAdjacent]);

  const handleDateChange = (nextDate: string) => {
    startTransition(() => {
      setDate(nextDate);
      setSearchParams({ date: nextDate }, { replace: true });
    });
  };

  const goToPreviousDay = () => {
    const current = new Date(date);
    current.setDate(current.getDate() - 1);
    handleDateChange(current.toISOString().split('T')[0]);
  };

  const goToNextDay = () => {
    const current = new Date(date);
    current.setDate(current.getDate() + 1);
    handleDateChange(current.toISOString().split('T')[0]);
  };

  const toggleFavorite = () => {
    if (!entry) return;
    updateEntry({ ...entry, isFavorite: !entry.isFavorite });
  };

  const handleDoubleTap = (section: SectionType) => {
    setHistorySection(section);
    setShowHistory(true);
  };

  return (
    <div className="space-y-3 pb-4">
      {/* Mobile History Overlay */}
      {showHistory && (
        <MobileHistoryOverlay
          section={historySection}
          onClose={() => setShowHistory(false)}
          onSelectDate={handleDateChange}
        />
      )}

      {/* Mobile Tab Navigation - Only visible on mobile */}
      <div className="md:hidden -mx-4 -mt-4">
        <MobileSectionTabs
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          onDoubleTap={handleDoubleTap}
          date={date}
          onDateChange={handleDateChange}
        />
      </div>

      {/* Desktop Header - Hidden on mobile */}
      <div className="hidden md:flex items-center justify-between py-1">
        {/* Left: Title + Favorite + Date Text */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-primary shrink-0">
            {isToday ? "Today" : "Entry"}
          </h1>
          {entry && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFavorite}
              className={cn(
                "h-7 w-7 shrink-0 transition-all duration-200",
                entry.isFavorite
                  ? "text-yellow-500 hover:text-yellow-600"
                  : "text-muted-foreground/30 hover:text-yellow-500"
              )}
            >
              <Star className={cn("h-4 w-4 transition-transform", entry.isFavorite && "fill-current scale-110")} />
            </Button>
          )}
          <span className={cn(
            "text-muted-foreground text-sm font-medium transition-opacity duration-300 hidden sm:inline truncate",
            (isPending || isFetching) && "opacity-50"
          )}>
            {displayDateText}
          </span>
        </div>

        {/* Right: Date Navigation */}
        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
          {/* Today button - hidden when already today */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDateChange(getTodayString())}
            disabled={isPending || isToday}
            className={cn(
              "h-8 w-8 sm:h-7 sm:w-7 transition-all",
              isToday ? "opacity-0 pointer-events-none w-0 sm:w-7" : "opacity-100"
            )}
            title="Go to today"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={goToPreviousDay}
            disabled={isPending}
            className="h-8 w-8 sm:h-7 sm:w-7 hover:bg-secondary"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Date picker - responsive width */}
          <input
            type="date"
            value={date}
            onChange={(e) => handleDateChange(e.target.value)}
            className={cn(
              "px-2 sm:px-3 py-1.5 sm:py-1 bg-secondary/50 border-0 rounded-md text-xs font-medium transition-all hover:bg-secondary focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer",
              "w-[115px] sm:w-[130px]"
            )}
          />

          <Button
            variant="ghost"
            size="icon"
            onClick={goToNextDay}
            disabled={isPending}
            className="h-8 w-8 sm:h-7 sm:w-7 hover:bg-secondary"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Mobile: Single Section View */}
      <div className={cn(
        "md:hidden transition-opacity duration-300",
        (isPending || isFetching) && "opacity-70"
      )}>
        {activeSection === "thoughts" && <ThoughtsSection date={date} />}
        {activeSection === "diet" && <DietSection date={date} />}
        {activeSection === "discovery" && <DiscoverySection date={date} />}
        {activeSection === "todo" && <TodoSection date={date} />}
        {activeSection === "exercise" && <ExerciseSection date={date} />}
      </div>

      {/* Desktop: Grid View - Hidden on mobile */}
      <div className={cn(
        "hidden md:grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3 transition-opacity duration-300",
        (isPending || isFetching) && "opacity-70"
      )}>
        {/* Thoughts - Full width on large screens */}
        <div className="lg:col-span-2">
          <ThoughtsSection date={date} />
        </div>

        {/* Diet */}
        <div>
          <DietSection date={date} />
        </div>

        {/* Today's Discoveries */}
        <div>
          <DiscoverySection date={date} />
        </div>

        {/* Tasks */}
        <div>
          <TodoSection date={date} />
        </div>

        {/* Exercise */}
        <div>
          <ExerciseSection date={date} />
        </div>
      </div>
    </div>
  );
}
