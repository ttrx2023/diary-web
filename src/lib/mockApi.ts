import type { DailyEntry, DiaryApi } from "@/types/index";

const STORAGE_KEY = "diary_entries";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// Helper to ensure entry has all required fields
function normalizeEntry(entry: Partial<DailyEntry>, date: string): DailyEntry {
  return {
    id: entry.id || crypto.randomUUID(),
    date: entry.date || date,
    thoughts: entry.thoughts || "",
    diet: {
      breakfast: entry.diet?.breakfast || "",
      lunch: entry.diet?.lunch || "",
      dinner: entry.diet?.dinner || "",
      snacks: entry.diet?.snacks || "",
    },
    exercises: Array.isArray(entry.exercises) ? entry.exercises : [],
    todos: Array.isArray(entry.todos) ? entry.todos : [],
    discoveries: Array.isArray(entry.discoveries) ? entry.discoveries : [],
    isFavorite: entry.isFavorite || false,
    created_at: entry.created_at || new Date().toISOString(),
  };
}

export const mockDiaryApi: DiaryApi = {
  async getEntryByDate(date: string): Promise<DailyEntry> {
    await delay(300); // Simulate network latency

    try {
      const data = localStorage.getItem(STORAGE_KEY);
      const parsed: unknown = data ? JSON.parse(data) : {};
      const entries: Record<string, unknown> = isRecord(parsed) ? parsed : {};

      if (entries[date]) {
        // Normalize ensuring structure matches expectations
        return normalizeEntry(entries[date], date);
      }
    } catch (e) {
      console.error("Failed to parse diary entries", e);
      // If error, fall through to default
    }

    // Return empty template if not exists
    return normalizeEntry({}, date);
  },

  async getEntriesByDateRange(startDate: string, endDate: string): Promise<DailyEntry[]> {
    await delay(300);

    try {
      const data = localStorage.getItem(STORAGE_KEY);
      const parsed: unknown = data ? JSON.parse(data) : {};
      const entries: Record<string, unknown> = isRecord(parsed) ? parsed : {};

      return Object.entries(entries)
        .filter(([date]) => date >= startDate && date <= endDate)
        .map(([date, entry]) => normalizeEntry(entry as Partial<DailyEntry>, date));
    } catch (e) {
      console.error("Failed to parse diary entries", e);
      return [];
    }
  },

  async getAllEntries(): Promise<DailyEntry[]> {
    await delay(300);

    try {
      const data = localStorage.getItem(STORAGE_KEY);
      const parsed: unknown = data ? JSON.parse(data) : {};
      const entries: Record<string, unknown> = isRecord(parsed) ? parsed : {};

      return Object.entries(entries)
        .map(([date, entry]) => normalizeEntry(entry as Partial<DailyEntry>, date))
        .sort((a, b) => a.date.localeCompare(b.date));
    } catch (e) {
      console.error("Failed to parse diary entries", e);
      return [];
    }
  },

  async saveEntry(entry: DailyEntry): Promise<DailyEntry> {
    await delay(500); // Simulate network latency

    const data = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = data ? JSON.parse(data) : {};
    const entries: Record<string, unknown> = isRecord(parsed) ? parsed : {};

    entries[entry.date] = entry;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));

    console.log("Saved entry to local storage:", entry);
    return entry;
  },
};
