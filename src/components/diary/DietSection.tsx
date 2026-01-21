import { useEffect, useState } from "react";
import { useDiaryEntry } from "@/hooks/useDiary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SaveProgressBar } from "@/components/ui/save-progress-bar";
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
  const { entry, updateEntry, isLoading } = useDiaryEntry(date);
  const [diet, setDiet] = useState<DietEntry>(entry?.diet ?? emptyDiet);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  useEffect(() => {
    setDiet(entry?.diet ?? emptyDiet);
  }, [entry?.diet]);

  const handleChange = (field: keyof DietEntry, value: string) => {
    setDiet((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlur = () => {
    if (entry && JSON.stringify(diet) !== JSON.stringify(entry.diet)) {
      setSaveStatus("saving");
      updateEntry({
        ...entry,
        diet: diet,
      });
      // Show saved status briefly
      setTimeout(() => {
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 800);
      }, 300);
    }
  };

  const isInteractive = !isLoading && !!entry;

  return (
    <Card className="overflow-hidden border-0 md:border shadow-none md:shadow-sm">
      {/* Header - Hidden on mobile */}
      <CardHeader className="hidden md:flex flex-row items-center justify-between space-y-0 py-3 md:pb-6 px-4 md:px-6 border-b bg-secondary/20 relative">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="p-1.5 md:p-2 bg-background rounded-md md:rounded-lg shadow-sm border">
            <Utensils className="h-4 w-4 md:h-5 md:w-5 text-primary" />
          </div>
          <CardTitle className="text-base md:text-xl font-serif font-bold">Diet</CardTitle>
        </div>
        {/* Save Progress Bar */}
        <SaveProgressBar status={saveStatus} className="absolute bottom-0 left-0 right-0" />
      </CardHeader>

      {/* Mobile: Minimal save indicator + Title */}
      <div className="md:hidden relative">
        <SaveProgressBar status={saveStatus} className="absolute top-0 left-0 right-0" />
        <div className="flex items-center justify-between px-1 pt-1 pb-2">
          <div className="flex items-center gap-2">
            <Utensils className="h-4 w-4 text-green-500" />
            <span className="text-sm font-semibold">Meals</span>
          </div>
        </div>
      </div>

      <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
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