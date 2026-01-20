import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { DailyEntry } from "@/types/index";

export function useDiaryEntry(date: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["entry", date],
    queryFn: () => api.getEntryByDate(date),
  });

  const mutation = useMutation({
    mutationFn: (newEntry: DailyEntry) => api.saveEntry(newEntry),
    onSuccess: (data) => {
      queryClient.setQueryData(["entry", date], data);
    },
  });

  return {
    entry: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    updateEntry: mutation.mutate,
    isSaving: mutation.isPending,
  };
}
