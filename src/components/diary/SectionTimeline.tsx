import { useMemo } from "react";
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

function ThoughtsPreview({ entry }: { entry: DailyEntry }) {
  const text = entry.thoughts || "";
  const truncated = text.length > 120 ? text.substring(0, 120) + "..." : text;

  return (
    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{truncated}</p>
  );
}

function DietPreview({ entry }: { entry: DailyEntry }) {
  const { breakfast, lunch, dinner, snacks } = entry.diet;
  const meals = [
    { key: "breakfast", icon: Coffee, value: breakfast, color: "text-amber-600" },
    { key: "lunch", icon: Sun, value: lunch, color: "text-orange-500" },
    { key: "dinner", icon: Moon, value: dinner, color: "text-indigo-500" },
    { key: "snacks", icon: Apple, value: snacks, color: "text-green-500" },
  ].filter(m => m.value);

  return (
    <div className="space-y-1">
      {meals.slice(0, 3).map(({ key, icon: Icon, value, color }) => (
        <div key={key} className="flex items-center gap-1.5 text-xs">
          <Icon className={cn("h-3 w-3 flex-shrink-0", color)} />
          <span className="text-muted-foreground truncate">{value}</span>
        </div>
      ))}
      {meals.length > 3 && (
        <span className="text-[10px] text-muted-foreground/60">+{meals.length - 3} more</span>
      )}
    </div>
  );
}

function ExercisePreview({ entry }: { entry: DailyEntry }) {
  const exerciseTypeConfig: Record<string, { icon: typeof Dumbbell; color: string }> = {
    reps: { icon: Dumbbell, color: "text-orange-500" },
    duration: { icon: Timer, color: "text-blue-500" },
    distance: { icon: Route, color: "text-green-500" },
  };

  const formatValue = (ex: ExerciseItem) => {
    if (ex.type === "duration") {
      const mins = Math.floor(ex.value);
      const secs = Math.round((ex.value % 1) * 60);
      return secs > 0 ? `${mins}m${secs}s` : `${mins}m`;
    }
    return `${ex.value}${ex.unit}`;
  };

  return (
    <div className="flex flex-wrap gap-1">
      {entry.exercises.slice(0, 3).map((ex: ExerciseItem) => {
        const config = exerciseTypeConfig[ex.type] || exerciseTypeConfig.reps;
        const Icon = config.icon;

        return (
          <div
            key={ex.id}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-secondary/50 rounded text-[10px]"
          >
            <Icon className={cn("h-2.5 w-2.5", config.color)} />
            <span className="truncate max-w-[60px]">{ex.name || "Exercise"}</span>
            <span className="text-muted-foreground font-mono">{formatValue(ex)}</span>
          </div>
        );
      })}
      {entry.exercises.length > 3 && (
        <span className="text-[10px] text-muted-foreground/60 px-1">+{entry.exercises.length - 3}</span>
      )}
    </div>
  );
}

function TodoPreview({ entry, onToggleTodo }: { entry: DailyEntry; onToggleTodo?: (date: string, todoId: string) => void }) {
  const todos = entry.todos ?? [];
  const completed = todos.filter((t: TodoItem) => t.completed).length;
  const total = todos.length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const handleToggle = (e: React.MouseEvent, todoId: string) => {
    e.stopPropagation(); // 阻止卡片导航
    onToggleTodo?.(entry.date, todoId);
  };

  return (
    <div className="space-y-1.5">
      {/* Progress Bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-500 rounded-full transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="text-[10px] font-medium text-purple-600">{completed}/{total}</span>
      </div>

      {/* Task List - Interactive */}
      <div className="space-y-0.5">
        {todos.slice(0, 4).map((t: TodoItem) => (
          <button
            key={t.id}
            onClick={(e) => handleToggle(e, t.id)}
            className={cn(
              "flex items-center gap-1.5 w-full text-left text-xs py-0.5 rounded hover:bg-secondary/50 transition-colors group",
              t.completed && "opacity-60"
            )}
          >
            {t.completed ? (
              <CheckSquare className="h-3 w-3 text-purple-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
            ) : (
              <Square className="h-3 w-3 text-muted-foreground flex-shrink-0 group-hover:text-purple-500 group-hover:scale-110 transition-all" />
            )}
            <span className={cn(
              "truncate",
              t.completed && "line-through text-muted-foreground"
            )}>
              {t.text}
            </span>
          </button>
        ))}
        {todos.length > 4 && (
          <span className="text-[10px] text-muted-foreground/60 pl-4">+{todos.length - 4} more</span>
        )}
      </div>
    </div>
  );
}

function DiscoveryPreview({ entry }: { entry: DailyEntry }) {
  const discoveries = entry.discoveries ?? [];
  const categoryConfig: Record<string, { emoji: string }> = {
    idea: { emoji: "💡" },
    learning: { emoji: "📚" },
    inspiration: { emoji: "✨" },
    other: { emoji: "⚡" },
  };

  return (
    <div className="space-y-1">
      {discoveries.slice(0, 3).map((d: DiscoveryItem) => {
        const config = categoryConfig[d.category] || categoryConfig.other;
        return (
          <div key={d.id} className="flex items-start gap-1.5 text-xs">
            <span className="flex-shrink-0">{config.emoji}</span>
            <span className="text-muted-foreground line-clamp-1">{d.content}</span>
          </div>
        );
      })}
      {discoveries.length > 3 && (
        <span className="text-[10px] text-muted-foreground/60">+{discoveries.length - 3} more</span>
      )}
    </div>
  );
}

// ============ MAIN COMPONENT ============

export function SectionTimeline({ section, entries, onBack, onToggleTodo }: SectionTimelineProps) {
  const navigate = useNavigate();
  const config = sectionConfig[section];
  const Icon = config.icon;

  const filteredEntries = useMemo(() => filterEntriesForSection(entries, section), [entries, section]);
  const groupedEntries = useMemo(() => groupByMonth(filteredEntries), [filteredEntries]);
  const monthKeys = Object.keys(groupedEntries).sort().reverse();

  const goToDate = (date: string) => {
    navigate(`/?date=${date}`);
  };

  const renderPreview = (entry: DailyEntry) => {
    switch (section) {
      case "thoughts":
        return <ThoughtsPreview entry={entry} />;
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

      {/* Timeline - Grid Layout */}
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

            {/* Entries Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {monthEntries.map((entry) => {
                const entryDate = new Date(`${entry.date}T00:00:00`);
                const dayLabel = format(entryDate, "EEE, MMM d");

                return (
                  <Card
                    key={entry.date}
                    className="p-3 hover:shadow-md transition-all cursor-pointer hover:border-primary/30 min-h-[100px] flex flex-col"
                    onClick={() => goToDate(entry.date)}
                  >
                    {/* Date Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <div className={cn("p-1 rounded", config.bgColor)}>
                          <Icon className={cn("h-3 w-3", config.color)} />
                        </div>
                        <span className="text-xs font-semibold text-primary">{dayLabel}</span>
                        {entry.isFavorite && (
                          <span className="text-yellow-500 text-xs">★</span>
                        )}
                      </div>
                    </div>

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
