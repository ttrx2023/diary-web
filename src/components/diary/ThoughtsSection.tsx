import { useEffect, useState } from "react";
import { useDiaryEntry } from "@/hooks/useDiary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { PenLine, Cloud } from "lucide-react";

interface ThoughtsSectionProps {
  date: string;
}

export function ThoughtsSection({ date }: ThoughtsSectionProps) {
  const { entry, updateEntry, isSaving, isLoading } = useDiaryEntry(date);
  const [localThoughts, setLocalThoughts] = useState("");

  useEffect(() => {
    setLocalThoughts(entry?.thoughts ?? "");
  }, [entry?.thoughts]);

  const handleBlur = () => {
    if (entry && localThoughts !== entry.thoughts) {
      updateEntry({
        ...entry,
        thoughts: localThoughts,
      });
    }
  };

  const isInteractive = !isLoading && !!entry;

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b bg-secondary/20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-background rounded-lg shadow-sm border">
            <PenLine className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-xl font-serif font-bold">Thoughts & Reflection</CardTitle>
        </div>
        {isSaving && (
             <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary animate-pulse">
                <Cloud className="w-3 h-3" />
                Saving
            </span>
        )}
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <div className="relative h-full">
            <Textarea
            placeholder="How was your day? What's on your mind?"
            className="min-h-[250px] h-full resize-none border-0 focus-visible:ring-0 rounded-none p-6 text-base leading-relaxed bg-transparent"
            value={localThoughts}
            onChange={(e) => setLocalThoughts(e.target.value)}
            onBlur={handleBlur}
            disabled={!isInteractive}
            />
            {/* Lined paper effect overlay if desired, or just clean space */}
        </div>
      </CardContent>
    </Card>
  );
}