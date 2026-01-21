import { useState, useEffect, useCallback } from "react";

export interface StatisticsPreferences {
  showSectionOverview: boolean;
  showTodoProgress: boolean;
  showStreak: boolean;
  showFavorites: boolean;
  showWeeklyActivity: boolean;
}

const DEFAULT_PREFERENCES: StatisticsPreferences = {
  showSectionOverview: true,
  showTodoProgress: true,
  showStreak: false,
  showFavorites: false,
  showWeeklyActivity: false,
};

const STORAGE_KEY = "diary-statistics-preferences";

export function usePreferences() {
  const [preferences, setPreferences] = useState<StatisticsPreferences>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.error("Failed to load preferences:", e);
    }
    return DEFAULT_PREFERENCES;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch (e) {
      console.error("Failed to save preferences:", e);
    }
  }, [preferences]);

  const updatePreference = useCallback(<K extends keyof StatisticsPreferences>(
    key: K,
    value: StatisticsPreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetPreferences = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
  }, []);

  return {
    preferences,
    updatePreference,
    resetPreferences,
  };
}
