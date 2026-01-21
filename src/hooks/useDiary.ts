import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { DailyEntry } from "@/types/index";

export function useDiaryEntry(date: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["entry", date],
    queryFn: () => api.getEntryByDate(date),
    staleTime: 1000 * 60 * 5, // 5 minutes - reduce unnecessary refetches
    gcTime: 1000 * 60 * 30, // 30 minutes cache
    refetchOnWindowFocus: false, // Prevent refetch on focus
    placeholderData: (previousData) => previousData, // Keep previous data while loading
  });

  const mutation = useMutation({
    mutationFn: (newEntry: DailyEntry) => api.saveEntry(newEntry),
    onSuccess: (data) => {
      queryClient.setQueryData(["entry", date], data);
    },
  });

  return {
    entry: query.data,
    isLoading: query.isLoading && !query.isPlaceholderData,
    isFetching: query.isFetching,
    isError: query.isError,
    updateEntry: mutation.mutate,
    isSaving: mutation.isPending,
  };
}

// Hook to prefetch adjacent dates
export function usePrefetchDates(currentDate: string) {
  const queryClient = useQueryClient();

  const prefetchDate = (date: string) => {
    queryClient.prefetchQuery({
      queryKey: ["entry", date],
      queryFn: () => api.getEntryByDate(date),
      staleTime: 1000 * 60 * 5,
    });
  };

  // Prefetch previous and next day
  const prefetchAdjacent = () => {
    const current = new Date(currentDate);

    const prevDate = new Date(current);
    prevDate.setDate(prevDate.getDate() - 1);
    const prevStr = prevDate.toISOString().split("T")[0];

    const nextDate = new Date(current);
    nextDate.setDate(nextDate.getDate() + 1);
    const nextStr = nextDate.toISOString().split("T")[0];

    prefetchDate(prevStr);
    prefetchDate(nextStr);
  };

  return { prefetchAdjacent };
}
