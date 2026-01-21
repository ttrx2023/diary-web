import { useEffect, useState } from "react";
import { useDiaryEntry } from "@/hooks/useDiary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ExerciseItem, ExerciseType } from "@/types/index";
import { Plus, Trash2, Activity, Dumbbell, Timer, Route, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExerciseSectionProps {
  date: string;
}

const exerciseTypeConfig: Record<ExerciseType, { icon: typeof Dumbbell; label: string; color: string; defaultUnit: string }> = {
  reps: { icon: Dumbbell, label: "Strength", color: "text-orange-500 bg-orange-500/10", defaultUnit: "sets" },
  duration: { icon: Timer, label: "Cardio", color: "text-blue-500 bg-blue-500/10", defaultUnit: "mins" },
  distance: { icon: Route, label: "Endurance", color: "text-green-500 bg-green-500/10", defaultUnit: "km" },
};

export function ExerciseSection({ date }: ExerciseSectionProps) {
  const { entry, updateEntry, isLoading } = useDiaryEntry(date);
  const [exercises, setExercises] = useState<ExerciseItem[]>(entry?.exercises ?? []);

  useEffect(() => {
    setExercises(entry?.exercises ?? []);
  }, [entry?.exercises]);

  const save = (newExercises: ExerciseItem[]) => {
    if (!entry) return;
    updateEntry({ ...entry, exercises: newExercises });
  };

  const addExercise = () => {
    const newItem: ExerciseItem = {
      id: crypto.randomUUID(),
      name: "",
      type: "reps",
      value: 0,
      unit: "sets",
    };
    const newList = [...exercises, newItem];
    setExercises(newList);
    save(newList);
  };

  const removeExercise = (id: string) => {
    const newList = exercises.filter((e) => e.id !== id);
    setExercises(newList);
    save(newList);
  };

  const updateItem = (id: string, field: keyof ExerciseItem, value: string | number) => {
    const newList = exercises.map((e) => {
      if (e.id === id) {
        if (field === "type") {
          const newType = value as ExerciseType;
          return { ...e, type: newType, unit: exerciseTypeConfig[newType].defaultUnit };
        }
        return { ...e, [field]: value };
      }
      return e;
    });
    setExercises(newList);
  };

  const handleBlur = () => {
    save(exercises);
  };

  const totalExercises = exercises.length;

  // Helper to format duration value
  const formatDurationDisplay = (totalMins: number) => {
    const mins = Math.floor(totalMins);
    const secs = Math.round((totalMins - mins) * 60);
    return { mins, secs };
  };

  const handleDurationChange = (id: string, mins: number, secs: number) => {
    const totalMins = mins + secs / 60;
    updateItem(id, "value", totalMins);
  };

  return (
    <Card className="overflow-hidden flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 py-3 px-4 border-b bg-secondary/20 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-background rounded-md shadow-sm border">
            <Activity className="h-4 w-4 text-orange-500" />
          </div>
          <CardTitle className="text-base font-serif font-bold">Exercise</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          {totalExercises > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-orange-500/10 text-orange-600">
              <Flame className="h-3 w-3" />
              {totalExercises}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0 flex flex-col flex-1 min-h-0">
        {isLoading && (
          <div className="p-6 text-center text-sm text-muted-foreground animate-pulse">
            Loading exercises...
          </div>
        )}

        {!isLoading && exercises.length === 0 && (
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-2 bg-secondary/5 flex-1">
            <div className="p-2 bg-secondary rounded-full">
              <Dumbbell className="h-5 w-5 text-muted-foreground/50" />
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-foreground">No exercises yet</p>
              <p className="text-xs text-muted-foreground">Track your workouts</p>
            </div>
          </div>
        )}

        {/* Scrollable Exercise List */}
        {!isLoading && exercises.length > 0 && (
          <div className="relative flex-1 min-h-0">
            <div className="max-h-[320px] overflow-y-auto scrollbar-thin p-3 space-y-2">
              {exercises.map((item, index) => {
                const config = exerciseTypeConfig[item.type];
                const TypeIcon = config.icon;
                const { mins, secs } = formatDurationDisplay(item.value);

                return (
                  <div
                    key={item.id}
                    className="group bg-background rounded-lg border shadow-sm hover:shadow-md transition-all duration-200"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    {/* Exercise Header */}
                    <div className="flex items-center gap-2 p-3 pb-2">
                      <div className={cn("p-1.5 rounded-md", config.color)}>
                        <TypeIcon className="h-3.5 w-3.5" />
                      </div>
                      <Input
                        placeholder="Exercise name..."
                        value={item.name}
                        onChange={(e) => updateItem(item.id, "name", e.target.value)}
                        onBlur={handleBlur}
                        className="flex-1 text-sm font-medium border-0 bg-transparent shadow-none px-1 h-7 focus-visible:ring-0"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeExercise(item.id)}
                        className="h-6 w-6 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Exercise Metrics */}
                    <div className="px-3 pb-3">
                      <div className="flex items-center gap-2 p-2 bg-secondary/30 rounded-md">
                        {/* Type Selector */}
                        <div className="flex-1">
                          <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium mb-0.5 block">
                            Type
                          </label>
                          <select
                            className="w-full h-8 rounded-md bg-background border px-2 text-xs font-medium cursor-pointer appearance-none focus:outline-none focus:ring-1 focus:ring-primary/20"
                            value={item.type}
                            onChange={(e) => updateItem(item.id, "type", e.target.value as ExerciseType)}
                            onBlur={handleBlur}
                          >
                            <option value="reps">💪 Strength</option>
                            <option value="duration">⏱️ Cardio</option>
                            <option value="distance">🏃 Endurance</option>
                          </select>
                        </div>

                        {/* Value Input - Different for duration type */}
                        {item.type === "duration" ? (
                          <div className="flex items-center gap-1">
                            <div className="w-14">
                              <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium mb-0.5 block">
                                Min
                              </label>
                              <Input
                                type="number"
                                value={mins || ""}
                                onChange={(e) => handleDurationChange(item.id, parseInt(e.target.value) || 0, secs)}
                                onBlur={handleBlur}
                                placeholder="0"
                                className="h-8 text-center font-mono text-sm bg-background"
                              />
                            </div>
                            <span className="text-muted-foreground mt-4">:</span>
                            <div className="w-14">
                              <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium mb-0.5 block">
                                Sec
                              </label>
                              <Input
                                type="number"
                                value={secs || ""}
                                onChange={(e) => handleDurationChange(item.id, mins, Math.min(59, parseInt(e.target.value) || 0))}
                                onBlur={handleBlur}
                                placeholder="0"
                                max={59}
                                className="h-8 text-center font-mono text-sm bg-background"
                              />
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="w-16">
                              <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium mb-0.5 block">
                                Amount
                              </label>
                              <Input
                                type="number"
                                value={item.value || ""}
                                onChange={(e) => updateItem(item.id, "value", parseFloat(e.target.value) || 0)}
                                onBlur={handleBlur}
                                placeholder="0"
                                className="h-8 text-center font-mono text-sm bg-background"
                              />
                            </div>
                            <div className="w-16">
                              <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium mb-0.5 block">
                                Unit
                              </label>
                              <Input
                                placeholder="unit"
                                value={item.unit}
                                onChange={(e) => updateItem(item.id, "unit", e.target.value)}
                                onBlur={handleBlur}
                                className="h-8 text-center text-xs bg-background"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Fade overlay */}
            {exercises.length > 3 && (
              <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-background to-transparent pointer-events-none" />
            )}
          </div>
        )}

        {/* Add Button */}
        <div className="p-3 border-t bg-secondary/10 flex-shrink-0">
          <Button
            onClick={addExercise}
            className="w-full bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-dashed border-orange-500/30 hover:border-orange-500/50 hover:from-orange-500/20 hover:to-amber-500/20 text-orange-600 transition-all shadow-none h-9 text-sm"
            variant="outline"
            disabled={isLoading || !entry}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Exercise
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
