import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";
import { toast } from "sonner";

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error: any) => {
      toast.error(error?.message || "Something went wrong while fetching data");
    },
  }),
  mutationCache: new MutationCache({
    onError: (error: any) => {
      toast.error(error?.message || "Action failed");
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
