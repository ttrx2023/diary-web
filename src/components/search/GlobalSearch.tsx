import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import type { DailyEntry } from "@/types/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X, Calendar, BookOpen, Utensils, Activity, ListTodo, Lightbulb, Star } from "lucide-react";
import { format } from "date-fns";

interface SearchResult {
  entry: DailyEntry;
  matches: {
    type: "thoughts" | "diet" | "exercise" | "todo" | "discovery";
    text: string;
  }[];
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const entries = await api.getAllEntries();
      const q = searchQuery.toLowerCase();

      const matchedResults: SearchResult[] = [];

      for (const entry of entries) {
        const matches: SearchResult["matches"] = [];

        // Search in thoughts
        if (entry.thoughts?.toLowerCase().includes(q)) {
          matches.push({ type: "thoughts", text: entry.thoughts });
        }

        // Search in diet
        const dietFields = [entry.diet.breakfast, entry.diet.lunch, entry.diet.dinner, entry.diet.snacks];
        for (const field of dietFields) {
          if (field?.toLowerCase().includes(q)) {
            matches.push({ type: "diet", text: field });
            break;
          }
        }

        // Search in exercises
        for (const ex of entry.exercises) {
          if (ex.name?.toLowerCase().includes(q)) {
            matches.push({ type: "exercise", text: ex.name });
            break;
          }
        }

        // Search in todos
        for (const todo of entry.todos || []) {
          if (todo.text?.toLowerCase().includes(q)) {
            matches.push({ type: "todo", text: todo.text });
            break;
          }
        }

        // Search in discoveries
        for (const disc of entry.discoveries || []) {
          if (disc.content?.toLowerCase().includes(q)) {
            matches.push({ type: "discovery", text: disc.content });
            break;
          }
        }

        if (matches.length > 0) {
          matchedResults.push({ entry, matches });
        }
      }

      // Sort by date descending
      matchedResults.sort((a, b) => b.entry.date.localeCompare(a.entry.date));
      setResults(matchedResults.slice(0, 20)); // Limit to 20 results
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      search(query);
    }, 300);

    return () => clearTimeout(debounce);
  }, [query, search]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  const goToEntry = (date: string) => {
    navigate(`/?date=${date}`);
    onClose();
    setQuery("");
    setResults([]);
  };

  const getTypeIcon = (type: SearchResult["matches"][0]["type"]) => {
    switch (type) {
      case "thoughts": return <BookOpen className="h-3 w-3 text-blue-500" />;
      case "diet": return <Utensils className="h-3 w-3 text-green-500" />;
      case "exercise": return <Activity className="h-3 w-3 text-orange-500" />;
      case "todo": return <ListTodo className="h-3 w-3 text-purple-500" />;
      case "discovery": return <Lightbulb className="h-3 w-3 text-yellow-500" />;
    }
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Search Modal */}
      <div className="relative z-10 w-full max-w-2xl mx-4 bg-background rounded-xl shadow-2xl border animate-in zoom-in-95 fade-in duration-200 overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b">
          <Search className="h-5 w-5 text-muted-foreground" />
          <Input
            autoFocus
            placeholder="Search your diary..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 border-0 shadow-none text-lg focus-visible:ring-0 bg-transparent"
          />
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {isSearching && (
            <div className="p-8 text-center text-muted-foreground animate-pulse">
              Searching...
            </div>
          )}

          {!isSearching && query && results.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No results found for "{query}"
            </div>
          )}

          {!isSearching && results.length > 0 && (
            <div className="divide-y">
              {results.map((result) => (
                <button
                  key={result.entry.date}
                  onClick={() => goToEntry(result.entry.date)}
                  className="w-full p-4 text-left hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {format(new Date(result.entry.date + "T00:00:00"), "EEEE, MMMM d, yyyy")}
                    </span>
                    {result.entry.isFavorite && (
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                    )}
                  </div>
                  <div className="space-y-1">
                    {result.matches.map((match, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        {getTypeIcon(match.type)}
                        <span className="text-muted-foreground line-clamp-1">
                          {highlightMatch(match.text.slice(0, 100), query)}
                          {match.text.length > 100 && "..."}
                        </span>
                      </div>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          )}

          {!query && (
            <div className="p-8 text-center text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>Search across all your diary entries</p>
              <p className="text-sm mt-1">Thoughts, diet, exercises, tasks, and discoveries</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
