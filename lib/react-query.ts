import { QueryClient, QueryCache, MutationCache, isServer } from "@tanstack/react-query";
import { toast } from "sonner";

function makeQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error: any) => {
        // Only show toasts on the client
        if (!isServer) {
          const message = error?.response?.data?.message || error?.response?.data?.error?.message || error?.message || "Something went wrong while fetching data";
          toast.error(message);
        }
      },
    }),
    mutationCache: new MutationCache({
      onError: (error: any) => {
        if (!isServer) {
          const message = error?.response?.data?.message || error?.response?.data?.error?.message || error?.message || "Action failed";
          toast.error(message);
        }
      },
    }),
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
        staleTime: 60 * 1000, 
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

import { cache } from 'react';

const _getQueryClient = cache(() => {
  return makeQueryClient();
});

export function getQueryClient() {
  if (isServer) {
    return _getQueryClient();
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}
