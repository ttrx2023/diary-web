import { useEffect, useState } from "react";
import { useDiaryEntry } from "@/hooks/useDiary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { SaveProgressBar } from "@/components/ui/save-progress-bar";
import { PenLine } from "lucide-react";

interface ThoughtsSectionProps {
  date: string;
}

export function ThoughtsSection({ date }: ThoughtsSectionProps) {
  const { entry, updateEntry, isLoading } = useDiaryEntry(date);
  const [localThoughts, setLocalThoughts] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  useEffect(() => {
    setLocalThoughts(entry?.thoughts ?? "");
  }, [entry?.thoughts]);

  const handleBlur = () => {
    if (entry && localThoughts !== entry.thoughts) {
      setSaveStatus("saving");
      updateEntry({
        ...entry,
        thoughts: localThoughts,
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
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b bg-secondary/20 relative">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-background rounded-lg shadow-sm border">
            <PenLine className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-xl font-serif font-bold">Thoughts & Reflection</CardTitle>
        </div>
        {/* Save Progress Bar */}
        <SaveProgressBar status={saveStatus} className="absolute bottom-0 left-0 right-0" />
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
        </div>
      </CardContent>
    </Card>
  );
}