export type ExerciseType = 'reps' | 'duration' | 'distance';

// Todo item for daily tasks
export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
}

// Discovery item for daily insights
export type DiscoveryCategory = 'idea' | 'learning' | 'inspiration' | 'other';

export interface DiscoveryItem {
  id: string;
  content: string;
  category: DiscoveryCategory;
  createdAt: string;
}

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
  todos: TodoItem[];
  discoveries: DiscoveryItem[];
  isFavorite?: boolean;
  created_at?: string;
  user_id?: string;
}

export interface DiaryApi {
  getEntryByDate(date: string): Promise<DailyEntry>;
  getEntriesByDateRange(startDate: string, endDate: string): Promise<DailyEntry[]>;
  getAllEntries(): Promise<DailyEntry[]>;
  saveEntry(entry: DailyEntry): Promise<DailyEntry>;
}
