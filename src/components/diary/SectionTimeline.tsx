import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { DailyEntry, ExerciseItem, TodoItem, DiscoveryItem } from "@/types/index";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft,
  BookOpen,
  Utensils,
  Activity,
  CheckSquare,
  Square,
  Lightbulb,
  Calendar,
  Dumbbell,
  Timer,
  Route,
  Coffee,
  Sun,
  Moon,
  Apple,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export type SectionType = "thoughts" | "diet" | "exercise" | "todo" | "discovery";

interface SectionTimelineProps {
  section: SectionType;
  entries: DailyEntry[];
  onBack: () => void;
  onToggleTodo?: (date: string, todoId: string) => void;
}

const sectionConfig: Record<SectionType, {
  title: string;
  icon: typeof BookOpen;
  color: string;
  bgColor: string;
}> = {
  thoughts: {
    title: "Thoughts History",
    icon: BookOpen,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10"
  },
  diet: {
    title: "Diet History",
    icon: Utensils,
    color: "text-green-500",
    bgColor: "bg-green-500/10"
  },
  exercise: {
    title: "Exercise History",
    icon: Activity,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10"
  },
  todo: {
    title: "Tasks History",
    icon: CheckSquare,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10"
  },
  discovery: {
    title: "Discoveries History",
    icon: Lightbulb,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10"
  },
};

// Filter entries that have data for the given section
function filterEntriesForSection(entries: DailyEntry[], section: SectionType): DailyEntry[] {
  return entries.filter((entry) => {
    switch (section) {
      case "thoughts":
        return !!entry.thoughts?.trim();
      case "diet":
        return !!(entry.diet.breakfast || entry.diet.lunch || entry.diet.dinner || entry.diet.snacks);
      case "exercise":
        return entry.exercises.length > 0;
      case "todo":
        return (entry.todos?.length ?? 0) > 0;
      case "discovery":
        return (entry.discoveries?.length ?? 0) > 0;
      default:
        return false;
    }
  }).sort((a, b) => b.date.localeCompare(a.date));
}

// Group entries by month
function groupByMonth(entries: DailyEntry[]): Record<string, DailyEntry[]> {
  const groups: Record<string, DailyEntry[]> = {};
  for (const entry of entries) {
    const monthKey = entry.date.substring(0, 7);
    if (!groups[monthKey]) {
      groups[monthKey] = [];
    }
    groups[monthKey].push(entry);
  }
  return groups;
}

// ============ DETAILED PREVIEW COMPONENTS ============

function ThoughtsPreview({ entry, expanded, onToggle }: { entry: DailyEntry; expanded?: boolean; onToggle?: () => void }) {
  const text = entry.thoughts || "";
  const isLong = text.length > 200;

  return (
    <div className="space-y-2">
      <p className={cn(
        "text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap",
        !expanded && isLong && "line-clamp-6"
      )}>
        {text}
      </p>
      {isLong && onToggle && (
        <button
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          {expanded ? (
            <>收起 <ChevronUp className="h-3 w-3" /></>
          ) : (
            <>阅读更多 <ChevronDown className="h-3 w-3" /></>
          )}
        </button>
      )}
    </div>
  );
}

function DietPreview({ entry }: { entry: DailyEntry }) {
  const { breakfast, lunch, dinner, snacks } = entry.diet;
  const meals = [
    { key: "breakfast", icon: Coffee, label: "早餐", value: breakfast, color: "text-amber-600", bgColor: "bg-amber-500/10" },
    { key: "lunch", icon: Sun, label: "午餐", value: lunch, color: "text-orange-500", bgColor: "bg-orange-500/10" },
    { key: "dinner", icon: Moon, label: "晚餐", value: dinner, color: "text-indigo-500", bgColor: "bg-indigo-500/10" },
    { key: "snacks", icon: Apple, label: "零食", value: snacks, color: "text-green-500", bgColor: "bg-green-500/10" },
  ];

  // Only show meals that have been recorded
  const filledMeals = meals.filter(meal => meal.value);

  return (
    <div className="space-y-2">
      {filledMeals.map(({ key, icon: Icon, label, value, color, bgColor }) => (
        <div key={key} className="flex items-start gap-2 text-sm">
          <div className={cn("p-1 rounded flex-shrink-0", bgColor)}>
            <Icon className={cn("h-3 w-3", color)} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-muted-foreground text-xs">{label}:</span>
            <span className="ml-1 text-foreground">{value}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ExercisePreview({ entry }: { entry: DailyEntry }) {
  const exerciseTypeConfig: Record<string, { icon: typeof Dumbbell; color: string; bgColor: string }> = {
    reps: { icon: Dumbbell, color: "text-orange-500", bgColor: "bg-orange-500/10" },
    duration: { icon: Timer, color: "text-blue-500", bgColor: "bg-blue-500/10" },
    distance: { icon: Route, color: "text-green-500", bgColor: "bg-green-500/10" },
  };

  const formatValue = (ex: ExerciseItem) => {
    if (ex.type === "duration") {
      const mins = Math.floor(ex.value);
      const secs = Math.round((ex.value % 1) * 60);
      return secs > 0 ? `${mins}m ${secs}s` : `${mins} min`;
    }
    return `${ex.value} ${ex.unit}`;
  };

  return (
    <div className="space-y-1.5">
      {entry.exercises.map((ex: ExerciseItem) => {
        const config = exerciseTypeConfig[ex.type] || exerciseTypeConfig.reps;
        const Icon = config.icon;

        return (
          <div
            key={ex.id}
            className="flex items-center gap-2 text-sm py-1 px-2 rounded-md bg-secondary/30"
          >
            <div className={cn("p-1 rounded", config.bgColor)}>
              <Icon className={cn("h-3 w-3", config.color)} />
            </div>
            <span className="flex-1 font-medium truncate">{ex.name || "运动"}</span>
            <span className="text-muted-foreground font-mono text-xs">{formatValue(ex)}</span>
          </div>
        );
      })}
    </div>
  );
}

function TodoPreview({ entry, onToggleTodo }: { entry: DailyEntry; onToggleTodo?: (date: string, todoId: string) => void }) {
  const todos = entry.todos ?? [];

  const handleToggle = (e: React.MouseEvent, todoId: string) => {
    e.stopPropagation();
    onToggleTodo?.(entry.date, todoId);
  };

  return (
    <div className="space-y-3">
      {/* Task List */}
      <div className="space-y-1">
        {todos.map((t: TodoItem) => (
          <button
            key={t.id}
            onClick={(e) => handleToggle(e, t.id)}
            className={cn(
              "flex items-center gap-2 w-full text-left text-sm py-1.5 px-2 rounded-md hover:bg-secondary/50 transition-colors group",
              t.completed && "opacity-60"
            )}
          >
            {t.completed ? (
              <CheckSquare className="h-4 w-4 text-purple-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
            ) : (
              <Square className="h-4 w-4 text-muted-foreground flex-shrink-0 group-hover:text-purple-500 group-hover:scale-110 transition-all" />
            )}
            <span className={cn(
              "flex-1",
              t.completed && "line-through text-muted-foreground"
            )}>
              {t.text}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function DiscoveryPreview({ entry }: { entry: DailyEntry }) {
  const discoveries = entry.discoveries ?? [];
  const categoryConfig: Record<string, { emoji: string; bgColor: string }> = {
    idea: { emoji: "💡", bgColor: "bg-yellow-500/10" },
    learning: { emoji: "📚", bgColor: "bg-blue-500/10" },
    inspiration: { emoji: "✨", bgColor: "bg-pink-500/10" },
    other: { emoji: "⚡", bgColor: "bg-gray-500/10" },
  };

  return (
    <div className="space-y-2 max-h-[200px] overflow-y-auto scrollbar-thin pr-1">
      {discoveries.map((d: DiscoveryItem) => {
        const config = categoryConfig[d.category] || categoryConfig.other;
        return (
          <div key={d.id} className={cn("flex items-start gap-2 text-sm p-2 rounded-md", config.bgColor)}>
            <span className="flex-shrink-0 text-base">{config.emoji}</span>
            <p className="text-foreground/80 leading-relaxed break-words whitespace-pre-wrap">{d.content}</p>
          </div>
        );
      })}
    </div>
  );
}

// ============ MAIN COMPONENT ============

export function SectionTimeline({ section, entries, onBack, onToggleTodo }: SectionTimelineProps) {
  const navigate = useNavigate();
  const config = sectionConfig[section];
  const Icon = config.icon;

  // Track expanded state for thoughts
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());

  const toggleExpanded = (date: string) => {
    setExpandedEntries(prev => {
      const next = new Set(prev);
      if (next.has(date)) {
        next.delete(date);
      } else {
        next.add(date);
      }
      return next;
    });
  };

  const filteredEntries = useMemo(() => filterEntriesForSection(entries, section), [entries, section]);
  const groupedEntries = useMemo(() => groupByMonth(filteredEntries), [filteredEntries]);
  const monthKeys = Object.keys(groupedEntries).sort().reverse();

  const goToDate = (date: string) => {
    navigate(`/?date=${date}`);
  };

  // Conditional grid layout based on section type
  const getGridClass = () => {
    switch (section) {
      case "thoughts":
        return "grid-cols-1"; // Single column for max reading space
      case "discovery":
        return "grid-cols-1 md:grid-cols-2"; // 2 columns
      default:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"; // 3 columns
    }
  };

  // Conditional min height for cards
  const getCardClass = () => {
    switch (section) {
      case "thoughts":
        return "min-h-[120px]";
      case "discovery":
        return "min-h-[150px]";
      case "todo":
        return "min-h-[100px]";
      default:
        return "min-h-[100px]";
    }
  };

  const renderPreview = (entry: DailyEntry) => {
    switch (section) {
      case "thoughts":
        return (
          <ThoughtsPreview
            entry={entry}
            expanded={expandedEntries.has(entry.date)}
            onToggle={() => toggleExpanded(entry.date)}
          />
        );
      case "diet":
        return <DietPreview entry={entry} />;
      case "exercise":
        return <ExercisePreview entry={entry} />;
      case "todo":
        return <TodoPreview entry={entry} onToggleTodo={onToggleTodo} />;
      case "discovery":
        return <DiscoveryPreview entry={entry} />;
      default:
        return null;
    }
  };

  // Render card header based on section type
  const renderCardHeader = (entry: DailyEntry, dayLabel: string) => {
    const todos = entry.todos ?? [];
    const completed = todos.filter((t: TodoItem) => t.completed).length;
    const total = todos.length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    if (section === "todo") {
      // Tasks: Date + Progress bar on same line
      return (
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-1.5">
            <div className={cn("p-1 rounded", config.bgColor)}>
              <Icon className={cn("h-3 w-3", config.color)} />
            </div>
            <span className="text-sm font-semibold text-primary">{dayLabel}</span>
            {entry.isFavorite && <span className="text-yellow-500 text-xs">★</span>}
          </div>
          <div className="flex-1 flex items-center gap-2">
            <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="text-xs font-medium text-purple-600 whitespace-nowrap">{completed}/{total}</span>
          </div>
        </div>
      );
    }

    // Default header for other sections
    return (
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <div className={cn("p-1 rounded", config.bgColor)}>
            <Icon className={cn("h-3 w-3", config.color)} />
          </div>
          <span className="text-sm font-semibold text-primary">{dayLabel}</span>
          {entry.isFavorite && <span className="text-yellow-500 text-xs">★</span>}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 py-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className={cn("p-2 rounded-lg", config.bgColor)}>
          <Icon className={cn("h-5 w-5", config.color)} />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-serif font-bold">{config.title}</h2>
          <p className="text-sm text-muted-foreground">{filteredEntries.length} entries</p>
        </div>
      </div>

      {/* Empty State */}
      {filteredEntries.length === 0 && (
        <Card className="p-8 text-center">
          <div className={cn("w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4", config.bgColor)}>
            <Icon className={cn("h-8 w-8", config.color)} />
          </div>
          <h3 className="font-medium text-lg mb-1">No {config.title.replace(" History", "")} Yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Start logging to see your history here.</p>
          <Button onClick={() => navigate("/")} variant="outline" size="sm">
            Go to Dashboard
          </Button>
        </Card>
      )}

      {/* Timeline - Conditional Grid Layout */}
      {monthKeys.map((monthKey) => {
        const monthDate = new Date(`${monthKey}-01T00:00:00`);
        const monthLabel = format(monthDate, "MMMM yyyy");
        const monthEntries = groupedEntries[monthKey];

        return (
          <div key={monthKey} className="space-y-3">
            {/* Month Header */}
            <div className="flex items-center gap-2 sticky top-0 bg-background/95 backdrop-blur-sm py-2 z-10">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm text-muted-foreground">{monthLabel}</h3>
              <span className="text-xs text-muted-foreground/50">({monthEntries.length})</span>
            </div>

            {/* Entries Grid - Conditional Layout */}
            <div className={cn("grid gap-4", getGridClass())}>
              {monthEntries.map((entry) => {
                const entryDate = new Date(`${entry.date}T00:00:00`);
                const dayLabel = format(entryDate, "EEE, MMM d");

                return (
                  <Card
                    key={entry.date}
                    className={cn(
                      "p-4 hover:shadow-md transition-all cursor-pointer hover:border-primary/30 flex flex-col hover-card",
                      getCardClass()
                    )}
                    onClick={() => goToDate(entry.date)}
                  >
                    {/* Card Header */}
                    {renderCardHeader(entry, dayLabel)}

                    {/* Content Preview */}
                    <div className="flex-1">
                      {renderPreview(entry)}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
