import { useEffect, useState } from "react";
import { useDiaryEntry } from "@/hooks/useDiary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ExerciseItem, ExerciseType } from "@/types/index";
import { Plus, Trash2, Activity, Dumbbell, Timer, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExerciseSectionProps {
  date: string;
}

export function ExerciseSection({ date }: ExerciseSectionProps) {
  const { entry, updateEntry, isSaving, isLoading } = useDiaryEntry(date);
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
        return { ...e, [field]: value };
      }
      return e;
    });
    setExercises(newList);
  };

  const handleBlur = () => {
     save(exercises);
  };

  const getTypeIcon = (type: ExerciseType) => {
    switch (type) {
        case 'reps': return <Dumbbell className="h-3 w-3" />;
        case 'duration': return <Timer className="h-3 w-3" />;
        case 'distance': return <MapPin className="h-3 w-3" />;
        default: return <Activity className="h-3 w-3" />;
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 border-b bg-secondary/20">
        <div className="flex items-center gap-3">
           <div className="p-2 bg-background rounded-lg shadow-sm border">
             <Activity className="h-5 w-5 text-primary" />
           </div>
           <CardTitle className="text-xl font-serif font-bold">Exercise Log</CardTitle>
        </div>
        {isSaving && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Saving
            </span>
        )}
      </CardHeader>
      <CardContent className="p-0">
        {isLoading && <div className="p-8 text-center text-sm text-muted-foreground animate-pulse">Loading data...</div>}

        {!isLoading && exercises.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-3 bg-secondary/5">
                <div className="p-3 bg-secondary rounded-full">
                    <Dumbbell className="h-6 w-6 text-muted-foreground/50" />
                </div>
                <div className="space-y-1">
                    <p className="font-medium text-foreground">No exercises yet</p>
                    <p className="text-sm text-muted-foreground">Go move your body and track it here!</p>
                </div>
            </div>
        )}
        
        <div className="divide-y divide-border/50">
          {exercises.map((item, index) => (
            <div 
                key={item.id} 
                className="grid grid-cols-12 gap-4 items-start p-4 transition-colors hover:bg-secondary/30 animate-in fade-in slide-in-from-bottom-2 duration-300"
                style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="col-span-12 md:col-span-4 space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Activity</Label>
                  <Input
                      placeholder="e.g. Morning Run"
                      value={item.name}
                      onChange={(e) => updateItem(item.id, "name", e.target.value)}
                      onBlur={handleBlur}
                      className="font-medium border-transparent bg-transparent hover:bg-background focus:bg-background focus:border-input shadow-none px-0 h-9 rounded-sm focus:px-3 transition-all"
                  />
              </div>
              
              <div className="col-span-4 md:col-span-3 space-y-1.5">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      {getTypeIcon(item.type)} Type
                  </Label>
                  <div className="relative">
                    <select
                        className={cn(
                            "flex h-9 w-full rounded-md border border-transparent bg-secondary/50 px-3 py-1 text-sm shadow-none transition-colors", 
                            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:bg-background focus:border-input hover:bg-secondary/80 cursor-pointer appearance-none"
                        )}
                        value={item.type}
                        onChange={(e) => updateItem(item.id, "type", e.target.value as ExerciseType)}
                        onBlur={handleBlur}
                    >
                        <option value="reps">Sets & Reps</option>
                        <option value="duration">Duration</option>
                        <option value="distance">Distance</option>
                    </select>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  </div>
              </div>

              <div className="col-span-4 md:col-span-2 space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Value</Label>
                  <Input
                      type="number"
                      value={item.value}
                      onChange={(e) => updateItem(item.id, "value", parseFloat(e.target.value) || 0)}
                      onBlur={handleBlur}
                      className="h-9 bg-secondary/30 border-transparent hover:border-input focus:bg-background text-right font-mono"
                  />
              </div>

              <div className="col-span-3 md:col-span-2 space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Unit</Label>
                  <Input
                      placeholder="sets"
                      value={item.unit}
                      onChange={(e) => updateItem(item.id, "unit", e.target.value)}
                      onBlur={handleBlur}
                      className="h-9 bg-secondary/30 border-transparent hover:border-input focus:bg-background text-right"
                  />
              </div>

              <div className="col-span-1 flex justify-end pt-7">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeExercise(item.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                      <Trash2 className="h-4 w-4" />
                  </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t bg-secondary/10">
            <Button 
                onClick={addExercise} 
                className="w-full bg-background border-dashed border-2 hover:bg-secondary/50 text-muted-foreground hover:text-primary transition-all shadow-none h-12" 
                variant="outline"
                disabled={isLoading || !entry}
            >
                <Plus className="mr-2 h-4 w-4" /> 
                {isLoading ? "Loading..." : "Log New Exercise"}
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}