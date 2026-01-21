import { useEffect, useState } from "react";
import { useDiaryEntry } from "@/hooks/useDiary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { DiscoveryItem, DiscoveryCategory } from "@/types/index";
import { Plus, Trash2, Lightbulb, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface DiscoverySectionProps {
  date: string;
}

const categoryConfig: Record<DiscoveryCategory, { label: string; color: string; emoji: string }> = {
  idea: { label: "Idea", color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/30", emoji: "💡" },
  learning: { label: "Learning", color: "text-blue-500 bg-blue-500/10 border-blue-500/30", emoji: "📚" },
  inspiration: { label: "Inspiration", color: "text-pink-500 bg-pink-500/10 border-pink-500/30", emoji: "✨" },
  other: { label: "Other", color: "text-gray-500 bg-gray-500/10 border-gray-500/30", emoji: "⚡" },
};

export function DiscoverySection({ date }: DiscoverySectionProps) {
  const { entry, updateEntry, isLoading } = useDiaryEntry(date);
  const [discoveries, setDiscoveries] = useState<DiscoveryItem[]>(entry?.discoveries ?? []);
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState<DiscoveryCategory>("idea");

  useEffect(() => {
    setDiscoveries(entry?.discoveries ?? []);
  }, [entry?.discoveries]);

  const save = (newDiscoveries: DiscoveryItem[]) => {
    if (!entry) return;
    updateEntry({ ...entry, discoveries: newDiscoveries });
  };

  const addDiscovery = () => {
    if (!newContent.trim()) return;

    const newItem: DiscoveryItem = {
      id: crypto.randomUUID(),
      content: newContent.trim(),
      category: newCategory,
      createdAt: new Date().toISOString(),
    };
    const newList = [...discoveries, newItem];
    setDiscoveries(newList);
    setNewContent("");
    save(newList);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      addDiscovery();
    }
  };

  const removeDiscovery = (id: string) => {
    const newList = discoveries.filter((d) => d.id !== id);
    setDiscoveries(newList);
    save(newList);
  };

  const updateDiscoveryContent = (id: string, content: string) => {
    const newList = discoveries.map((d) => {
      if (d.id === id) {
        return { ...d, content };
      }
      return d;
    });
    setDiscoveries(newList);
  };

  const updateDiscoveryCategory = (id: string, category: DiscoveryCategory) => {
    const newList = discoveries.map((d) => {
      if (d.id === id) {
        return { ...d, category };
      }
      return d;
    });
    setDiscoveries(newList);
    save(newList);
  };

  const handleBlur = () => {
    save(discoveries);
  };

  return (
    <Card className="overflow-hidden flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 py-3 px-4 border-b bg-secondary/20 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-background rounded-md shadow-sm border">
            <Lightbulb className="h-4 w-4 text-yellow-500" />
          </div>
          <CardTitle className="text-base font-serif font-bold">Discoveries</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          {discoveries.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-yellow-500/10 text-yellow-600">
              <Sparkles className="h-3 w-3" />
              {discoveries.length}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0 flex flex-col flex-1 min-h-0">
        {isLoading && (
          <div className="p-6 text-center text-sm text-muted-foreground animate-pulse">
            Loading discoveries...
          </div>
        )}

        {!isLoading && discoveries.length === 0 && (
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-2 bg-secondary/5 flex-1">
            <div className="p-2 bg-yellow-500/10 rounded-full">
              <Lightbulb className="h-5 w-5 text-yellow-500/50" />
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-foreground">No discoveries yet</p>
              <p className="text-xs text-muted-foreground">Capture your ideas & insights</p>
            </div>
          </div>
        )}

        {/* Scrollable Discovery List */}
        {!isLoading && discoveries.length > 0 && (
          <div className="relative flex-1 min-h-0">
            <div className="max-h-[280px] overflow-y-auto scrollbar-thin p-3 space-y-2">
              {discoveries.map((item, index) => {
                const config = categoryConfig[item.category];

                return (
                  <div
                    key={item.id}
                    className="group bg-background rounded-lg border shadow-sm hover:shadow-md transition-all duration-200"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <div className="flex items-start gap-2 p-3">
                      {/* Category Badge */}
                      <select
                        value={item.category}
                        onChange={(e) => updateDiscoveryCategory(item.id, e.target.value as DiscoveryCategory)}
                        className={cn(
                          "w-9 h-9 rounded-md border text-base cursor-pointer appearance-none text-center flex-shrink-0",
                          config.color
                        )}
                        title="Change category"
                      >
                        <option value="idea">💡</option>
                        <option value="learning">📚</option>
                        <option value="inspiration">✨</option>
                        <option value="other">⚡</option>
                      </select>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <Input
                          value={item.content}
                          onChange={(e) => updateDiscoveryContent(item.id, e.target.value)}
                          onBlur={handleBlur}
                          placeholder="What did you discover?"
                          className="border-0 bg-transparent shadow-none px-0 h-auto py-0.5 text-sm focus-visible:ring-0"
                        />
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {" · "}
                          {config.label}
                        </p>
                      </div>

                      {/* Delete Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeDiscovery(item.id)}
                        className="h-7 w-7 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Fade overlay */}
            {discoveries.length > 4 && (
              <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-background to-transparent pointer-events-none" />
            )}
          </div>
        )}

        {/* Add New Discovery */}
        <div className="p-3 border-t bg-secondary/10 flex-shrink-0">
          <div className="flex gap-2">
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as DiscoveryCategory)}
              className={cn(
                "w-10 h-9 rounded-md border text-base cursor-pointer appearance-none text-center flex-shrink-0",
                categoryConfig[newCategory].color
              )}
            >
              <option value="idea">💡</option>
              <option value="learning">📚</option>
              <option value="inspiration">✨</option>
              <option value="other">⚡</option>
            </select>

            <Input
              placeholder="What did you discover?"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading || !entry}
              className="flex-1 bg-background h-9 text-sm"
            />
            <Button
              onClick={addDiscovery}
              disabled={isLoading || !entry || !newContent.trim()}
              size="sm"
              className="bg-yellow-500 hover:bg-yellow-600 text-white h-9 px-3"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
