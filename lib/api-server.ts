import { cookies, headers } from "next/headers";
import { QueryClient } from "@tanstack/react-query";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1/";

/**
 * A server-side fetch wrapper that forwards cookies from the client request
 * to the backend API. Matches the interface of our axios-based api object.
 */
export async function apiServer<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  let cookieHeader = "";
  try {
    const headerList = await headers();
    const middlewareToken = headerList.get("x-middleware-access-token");

    if (middlewareToken) {
      // If the middleware just refreshed the token, use it directly!
      cookieHeader = `accessToken=${middlewareToken}`;
    } else {
      // Fallback to standard cookie store
      const cookieStore = await cookies();
      cookieHeader = cookieStore.toString();
    }
  } catch (e: any) {
    // Not in a request context
  }

  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  const url = `${API_URL}${cleanEndpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
        ...options.headers,
      },
      cache: options.cache || "no-store",
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.warn(
          `[SSR API] Unauthorized: ${endpoint} - User session may be invalid or expired.`,
        );
      }

      let errorMessage = `API Error: ${response.status} ${response.statusText}`;
      try {
        const errorJson = await response.json();
        errorMessage = errorJson.message || errorMessage;
      } catch (e) {}
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error: any) {
    if (error.name === "AbortError") throw error;

    console.error(`[SSR API] Fetch Failed: ${url}`, error.message);
    throw error;
  }
}

export const apiServerMethods = {
  get: <T>(url: string, options?: RequestInit) =>
    apiServer<T>(url, { ...options, method: "GET" }),
  post: <T>(url: string, data?: any, options?: RequestInit) =>
    apiServer<T>(url, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    }),
  put: <T>(url: string, data?: any, options?: RequestInit) =>
    apiServer<T>(url, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    }),
  patch: <T>(url: string, data?: any, options?: RequestInit) =>
    apiServer<T>(url, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: <T>(url: string, options?: RequestInit) =>
    apiServer<T>(url, { ...options, method: "DELETE" }),
};

export async function prefetchAuthUser(queryClient: QueryClient) {
  await queryClient.prefetchQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      try {
        const res = await apiServer<{ user: any }>("user/me");
        return res.user;
      } catch (e) {
        return null;
      }
    },
  });
}

export async function prefetchFeatureFlags(queryClient: QueryClient) {
  await queryClient.prefetchQuery({
    queryKey: ["feature-flags"],
    queryFn: async () => {
      try {
        const res = await apiServer<{ success: boolean; data: any }>(
          "/config/features",
        );
        return res.data;
      } catch (e) {
        return {};
      }
    },
  });
}
