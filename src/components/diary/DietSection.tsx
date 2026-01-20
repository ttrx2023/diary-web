import { useEffect, useState } from "react";
import { useDiaryEntry } from "@/hooks/useDiary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DietEntry } from "@/types/index";
import { Utensils, Coffee, Sun, Moon, Apple } from "lucide-react";

interface DietSectionProps {
  date: string;
}

const emptyDiet: DietEntry = {
  breakfast: "",
  lunch: "",
  dinner: "",
  snacks: "",
};

export function DietSection({ date }: DietSectionProps) {
  const { entry, updateEntry, isSaving, isLoading } = useDiaryEntry(date);
  const [diet, setDiet] = useState<DietEntry>(entry?.diet ?? emptyDiet);

  useEffect(() => {
    setDiet(entry?.diet ?? emptyDiet);
  }, [entry?.diet]);

  const handleChange = (field: keyof DietEntry, value: string) => {
    setDiet((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlur = () => {
    if (entry && JSON.stringify(diet) !== JSON.stringify(entry.diet)) {
      updateEntry({
        ...entry,
        diet: diet,
      });
    }
  };

  const isInteractive = !isLoading && !!entry;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 border-b bg-secondary/20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-background rounded-lg shadow-sm border">
            <Utensils className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-xl font-serif font-bold">Diet Log</CardTitle>
        </div>
        {isSaving && (
             <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Saving
            </span>
        )}
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid gap-4">
          <div className="group space-y-2">
            <Label htmlFor="breakfast" className="flex items-center gap-2 text-muted-foreground group-focus-within:text-primary transition-colors">
                <Coffee className="h-4 w-4" /> Breakfast
            </Label>
            <Input
              id="breakfast"
              placeholder="Oatmeal, Coffee..."
              value={diet.breakfast}
              onChange={(e) => handleChange("breakfast", e.target.value)}
              onBlur={handleBlur}
              disabled={!isInteractive}
              className="bg-secondary/20 border-transparent focus:bg-background transition-all"
            />
          </div>
          <div className="group space-y-2">
            <Label htmlFor="lunch" className="flex items-center gap-2 text-muted-foreground group-focus-within:text-primary transition-colors">
                <Sun className="h-4 w-4" /> Lunch
            </Label>
            <Input
              id="lunch"
              placeholder="Salad, Chicken..."
              value={diet.lunch}
              onChange={(e) => handleChange("lunch", e.target.value)}
              onBlur={handleBlur}
              disabled={!isInteractive}
              className="bg-secondary/20 border-transparent focus:bg-background transition-all"
            />
          </div>
          <div className="group space-y-2">
             <Label htmlFor="dinner" className="flex items-center gap-2 text-muted-foreground group-focus-within:text-primary transition-colors">
                <Moon className="h-4 w-4" /> Dinner
            </Label>
            <Input
              id="dinner"
              placeholder="Fish, Rice..."
              value={diet.dinner}
              onChange={(e) => handleChange("dinner", e.target.value)}
              onBlur={handleBlur}
              disabled={!isInteractive}
              className="bg-secondary/20 border-transparent focus:bg-background transition-all"
            />
          </div>
          <div className="group space-y-2">
            <Label htmlFor="snacks" className="flex items-center gap-2 text-muted-foreground group-focus-within:text-primary transition-colors">
                <Apple className="h-4 w-4" /> Snacks
            </Label>
            <Input
              id="snacks"
              placeholder="Nuts, Fruit..."
              value={diet.snacks}
              onChange={(e) => handleChange("snacks", e.target.value)}
              onBlur={handleBlur}
              disabled={!isInteractive}
              className="bg-secondary/20 border-transparent focus:bg-background transition-all"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}