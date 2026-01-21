import { useEffect, useState, useTransition, useMemo } from 'react';
import { useSearchParams } from "react-router-dom";
import { ThoughtsSection } from "@/components/diary/ThoughtsSection";
import { DietSection } from "@/components/diary/DietSection";
import { ExerciseSection } from "@/components/diary/ExerciseSection";
import { TodoSection } from "@/components/diary/TodoSection";
import { DiscoverySection } from "@/components/diary/DiscoverySection";
import { useDiaryEntry, usePrefetchDates } from "@/hooks/useDiary";
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

  const { entry, updateEntry, isFetching } = useDiaryEntry(date);
  const { prefetchAdjacent } = usePrefetchDates(date);

  const displayDateText = useMemo(() => formatDisplayDate(date), [date]);
  const isToday = useMemo(() => date === getTodayString(), [date]);

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

  return (
    <div className="space-y-3 pb-16">
      {/* Compact Header */}
      <div className="flex items-center justify-between py-1">
        {/* Left: Title + Favorite + Date Text */}
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-serif font-bold tracking-tight text-primary">
            {isToday ? "Today" : "Entry"}
          </h1>
          {entry && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFavorite}
              className={cn(
                "h-7 w-7 transition-all duration-200",
                entry.isFavorite
                  ? "text-yellow-500 hover:text-yellow-600"
                  : "text-muted-foreground/30 hover:text-yellow-500"
              )}
            >
              <Star className={cn("h-4 w-4 transition-transform", entry.isFavorite && "fill-current scale-110")} />
            </Button>
          )}
          <span className={cn(
            "text-muted-foreground text-sm font-medium transition-opacity duration-300 hidden sm:inline",
            (isPending || isFetching) && "opacity-50"
          )}>
            {displayDateText}
          </span>
        </div>

        {/* Right: Date Navigation */}
        <div className="flex items-center gap-1">
          {/* Today button - hidden when already today */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDateChange(getTodayString())}
            disabled={isPending || isToday}
            className={cn(
              "h-7 w-7 transition-all",
              isToday ? "opacity-0 pointer-events-none" : "opacity-100"
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
            className="h-7 w-7 hover:bg-secondary"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Date picker - no icon inside, wider width */}
          <input
            type="date"
            value={date}
            onChange={(e) => handleDateChange(e.target.value)}
            className={cn(
              "px-3 py-1 bg-secondary/50 border-0 rounded-md text-xs font-medium transition-all hover:bg-secondary focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer",
              "w-[130px]"
            )}
          />

          <Button
            variant="ghost"
            size="icon"
            onClick={goToNextDay}
            disabled={isPending}
            className="h-7 w-7 hover:bg-secondary"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content Grid */}
      <div className={cn(
        "grid gap-4 md:grid-cols-2 lg:grid-cols-3 transition-opacity duration-300",
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
