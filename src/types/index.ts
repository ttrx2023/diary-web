export type ExerciseType = 'reps' | 'duration' | 'distance';

export interface ExerciseItem {
  id: string;
  name: string;
  type: ExerciseType;
  value: number;
  unit: string; // e.g., "mins", "sets", "km"
}

export interface DietEntry {
  breakfast: string;
  lunch: string;
  dinner: string;
  snacks: string;
}

export interface DailyEntry {
  id: string;
  date: string; // YYYY-MM-DD
  thoughts: string;
  diet: DietEntry;
  exercises: ExerciseItem[];
  created_at?: string;
  user_id?: string;
}

export interface DiaryApi {
  getEntryByDate(date: string): Promise<DailyEntry>;
  getEntriesByDateRange(startDate: string, endDate: string): Promise<DailyEntry[]>;
  saveEntry(entry: DailyEntry): Promise<DailyEntry>;
}
