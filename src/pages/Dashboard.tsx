import { useEffect, useState } from 'react';
import { useSearchParams } from "react-router-dom";
import { ThoughtsSection } from "@/components/diary/ThoughtsSection";
import { DietSection } from "@/components/diary/DietSection";
import { ExerciseSection } from "@/components/diary/ExerciseSection";
import { TodoSection } from "@/components/diary/TodoSection";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const isValidDateParam = (value: string | null) => !!value && /^\d{4}-\d{2}-\d{2}$/.test(value);

const getTodayString = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().split('T')[0];
};

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawDateParam = searchParams.get("date");
  const dateParam = isValidDateParam(rawDateParam) ? rawDateParam : null;
  const [date, setDate] = useState(() => dateParam ?? getTodayString());

  useEffect(() => {
    if (dateParam && dateParam !== date) {
      setDate(dateParam);
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

  const handleDateChange = (nextDate: string) => {
    setDate(nextDate);
    setSearchParams({ date: nextDate }, { replace: true });
  };

  const displayDate = new Date(`${date}T00:00:00`);

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-30 py-6 border-b border-border/40 transition-all">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-primary">
            Today's Entry
          </h1>
          <p className="text-muted-foreground text-sm font-medium">
            {displayDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        
        <div className="relative mt-4 sm:mt-0 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <CalendarIcon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <input 
            type="date" 
            value={date} 
            onChange={(e) => handleDateChange(e.target.value)}
            className={cn(
              "pl-10 pr-4 py-2 bg-secondary/50 border-0 rounded-lg text-sm font-medium transition-all hover:bg-secondary focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer",
              "appearance-none min-w-[160px]"
            )}
          />
        </div>
      </div>
      
      <div className="grid gap-8 md:grid-cols-2">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-forwards opacity-0" style={{ animationDelay: '100ms' }}>
          <ThoughtsSection key={date} date={date} />
        </div>
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 fill-mode-forwards opacity-0" style={{ animationDelay: '200ms' }}>
          <DietSection key={date} date={date} />
        </div>
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-forwards opacity-0" style={{ animationDelay: '300ms' }}>
          <TodoSection key={`todo-${date}`} date={date} />
        </div>
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400 fill-mode-forwards opacity-0" style={{ animationDelay: '400ms' }}>
          <ExerciseSection key={date} date={date} />
        </div>
      </div>
    </div>
  );
}
