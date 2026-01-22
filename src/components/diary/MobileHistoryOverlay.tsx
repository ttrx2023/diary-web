import { useMemo, useEffect, useRef } from "react";
import { useAllEntries } from "@/hooks/useAllEntries";
import { format } from "date-fns";
import { X, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SectionType } from "./MobileSectionTabs";
import { Button } from "@/components/ui/button";

interface MobileHistoryOverlayProps {
  section: SectionType | null;
  onClose: () => void;
  onSelectDate?: (date: string) => void;
}

export function MobileHistoryOverlay({ section, onClose, onSelectDate }: MobileHistoryOverlayProps) {
  const { entries } = useAllEntries();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Filter entries that have content for the selected section
  const historyItems = useMemo(() => {
    if (!section) return [];

    // Sort by date ascending (oldest to newest) so newest is at bottom
    const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));

    return sorted.filter(entry => {
      switch (section) {
        case "todo":
          return entry.todos && entry.todos.length > 0;
        case "exercise":
          return entry.exercises && entry.exercises.length > 0;
        case "discovery":
          return entry.discoveries && entry.discoveries.length > 0;
        case "diet":
          return entry.diet && (entry.diet.breakfast || entry.diet.lunch || entry.diet.dinner || entry.diet.snacks);
        case "thoughts":
          return !!entry.thoughts;
        default:
          return false;
      }
    });
  }, [entries, section]);

  // Scroll to bottom on mount
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [historyItems, section]);

  if (!section) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm md:hidden animate-in fade-in duration-200 flex flex-col safe-area-top safe-area-bottom">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-background/50 sticky top-0">
        <div className="flex items-center gap-2">
          <span className="text-lg font-serif font-bold capitalize">
            {section} History
          </span>
          <span className="text-xs text-muted-foreground px-2 py-0.5 bg-secondary rounded-full">
            {historyItems.length} days
          </span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Content List */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
        {historyItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-2">
            <Calendar className="h-10 w-10 opacity-20" />
            <p className="text-sm">No history yet</p>
          </div>
        ) : (
          historyItems.map((entry) => (
            <div key={entry.date} className="space-y-2">
              <div
                className="flex items-center gap-2 text-xs font-medium text-muted-foreground sticky top-0 bg-background/95 backdrop-blur py-2 z-10 w-fit px-2 rounded-full border cursor-pointer hover:bg-secondary/50 transition-colors"
                onClick={() => {
                  onSelectDate?.(entry.date);
                  onClose();
                }}
              >
                <Calendar className="h-3 w-3" />
                {format(new Date(entry.date), "EEE, MMM d, yyyy")}
              </div>

              <div className="pl-2 border-l-2 border-secondary/50 space-y-2">
                {section === "todo" && (
                  <div className="space-y-1">
                    {entry.todos.map(t => (
                      <div key={t.id} className={cn("text-sm flex gap-2", t.completed ? "text-muted-foreground line-through opacity-70" : "text-foreground")}>
                        <span className="opacity-50">•</span> {t.text}
                      </div>
                    ))}
                  </div>
                )}

                {section === "exercise" && (
                  <div className="space-y-1">
                    {entry.exercises.map(e => (
                      <div key={e.id} className="text-sm flex items-center gap-2">
                         <span className="text-xs px-1.5 py-0.5 bg-orange-500/10 text-orange-600 rounded">
                           {e.type}
                         </span>
                         <span>{e.name}</span>
                         <span className="text-muted-foreground text-xs">
                           {e.value} {e.unit}
                         </span>
                      </div>
                    ))}
                  </div>
                )}

                {section === "discovery" && (
                  <div className="space-y-2">
                    {entry.discoveries.map(d => (
                      <div key={d.id} className="bg-secondary/20 p-2 rounded-lg text-sm">
                        <span className="mr-2">{d.category === 'idea' ? '💡' : d.category === 'learning' ? '📚' : d.category === 'inspiration' ? '✨' : '⚡'}</span>
                        {d.content}
                      </div>
                    ))}
                  </div>
                )}

                {section === "diet" && (
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {entry.diet.breakfast && <div>🍳 {entry.diet.breakfast}</div>}
                    {entry.diet.lunch && <div>☀️ {entry.diet.lunch}</div>}
                    {entry.diet.dinner && <div>🌙 {entry.diet.dinner}</div>}
                    {entry.diet.snacks && <div>🍎 {entry.diet.snacks}</div>}
                  </div>
                )}

                {section === "thoughts" && (
                  <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/80 font-serif italic bg-secondary/10 p-3 rounded-lg border-l-2 border-primary/20">
                    {entry.thoughts}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer hint */}
      <div className="p-3 text-center text-[10px] text-muted-foreground border-t bg-secondary/10">
        Newest entries at the bottom
      </div>
    </div>
  );
}
