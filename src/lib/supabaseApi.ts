import type { DailyEntry, DiaryApi } from "@/types/index";
import { supabase } from "./supabase";

export const supabaseApi: DiaryApi = {
  async getEntryByDate(date: string): Promise<DailyEntry> {
    if (!supabase) throw new Error("Supabase not configured");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('entries')
      .select('payload')
      .eq('date', date)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') { // PGRST116 is 'not found'
      console.error("Error fetching entry:", error);
    }

    if (data?.payload) {
        // Merge with default structure to ensure type safety
        return {
            ...defaultEntry(date),
            ...data.payload,
            date // ensure date is correct
        };
    }

    return defaultEntry(date);
  },

  async getEntriesByDateRange(startDate: string, endDate: string): Promise<DailyEntry[]> {
    if (!supabase) throw new Error("Supabase not configured");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('entries')
      .select('payload,date')
      .eq('user_id', user.id)
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) {
      console.error("Error fetching entries:", error);
      return [];
    }

    return (data ?? []).map((row) => {
      const entryDate = row.date as string;
      return {
        ...defaultEntry(entryDate),
        ...(row.payload ?? {}),
        date: entryDate,
      } as DailyEntry;
    });
  },

  async getAllEntries(): Promise<DailyEntry[]> {
    if (!supabase) throw new Error("Supabase not configured");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('entries')
      .select('payload,date')
      .eq('user_id', user.id)
      .order('date', { ascending: true });

    if (error) {
      console.error("Error fetching all entries:", error);
      return [];
    }

    return (data ?? []).map((row) => {
      const entryDate = row.date as string;
      return {
        ...defaultEntry(entryDate),
        ...(row.payload ?? {}),
        date: entryDate,
      } as DailyEntry;
    });
  },

  async saveEntry(entry: DailyEntry): Promise<DailyEntry> {
    if (!supabase) throw new Error("Supabase not configured");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // Upsert based on date and user_id
    const { error } = await supabase
      .from('entries')
      .upsert({
        user_id: user.id,
        date: entry.date,
        payload: entry
      }, { onConflict: 'user_id,date' });

    if (error) {
      console.error("Error saving entry:", error);
      throw error;
    }

    return entry;
  }
};

function defaultEntry(date: string): DailyEntry {
    return {
      id: crypto.randomUUID(),
      date,
      thoughts: "",
      diet: { breakfast: "", lunch: "", dinner: "", snacks: "" },
      exercises: [],
      todos: [],
      discoveries: [],
      isFavorite: false,
    };
}
