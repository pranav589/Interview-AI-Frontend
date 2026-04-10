import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";
import { toast } from "sonner";

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.response?.data?.error?.message || error?.message || "Something went wrong while fetching data";
      toast.error(message);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.response?.data?.error?.message || error?.message || "Action failed";
      toast.error(message);
    },
  }),
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      // staleTime: 1000 * 60 * 5, // 5 minutes is a standard baseline
    },
  },
});
