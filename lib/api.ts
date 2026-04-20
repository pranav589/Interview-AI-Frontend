import { AxiosRequestConfig } from "axios";
import axiosInstance from "./axiosInstance";

const isServer = typeof window === "undefined";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Helper to safely get auth headers on the server without breaking the client bundle.
 */
async function getServerCookieHeader() {
  if (!isServer) return "";
  try {
    // Dynamically import to prevent the client-side bundler from failing
    const { cookies, headers } = await import("next/headers");
    const headerList = await headers();
    const mwToken = headerList.get("x-middleware-access-token");

    if (mwToken) {
      return `accessToken=${mwToken}`;
    }

    const cookieStore = await cookies();
    return cookieStore.toString();
  } catch (e) {
    return "";
  }
}

/**
 * A standard API client bridge that is safe for both Client and Server contexts.
 */
export const api = {
  get: async <T>(
    url: string,
    config?: AxiosRequestConfig | any,
  ): Promise<T> => {
    if (isServer) {
      const fullUrl = url.startsWith("http")
        ? url
        : `${API_URL}${url.startsWith("/") ? url.slice(1) : url}`;
      try {
        const cookieHeader = await getServerCookieHeader();
        const res = await fetch(fullUrl, {
          method: "GET",
          ...config,
          headers: {
            ...(config?.headers || {}),
            Cookie: cookieHeader,
          },
        });

        if (res.status === 401) {
          console.warn(
            `[SSR API] Unauthorized (api.get): ${url} - Deferring to client.`,
          );
          return { data: null } as any;
        }
        if (!res.ok) throw new Error(`Server Fetch Error: ${res.status}`);
        return res.json();
      } catch (e: any) {
        console.warn(
          `[SSR API] Fetch Failed: ${fullUrl} - Error: ${e.message}`,
        );
        return { data: null } as any;
      }
    }
    return axiosInstance.get<T>(url, config) as unknown as Promise<T>;
  },
  post: async <T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig | any,
  ): Promise<T> => {
    if (isServer) {
      const fullUrl = url.startsWith("http")
        ? url
        : `${API_URL}${url.startsWith("/") ? url.slice(1) : url}`;
      try {
        const cookieHeader = await getServerCookieHeader();
        const res = await fetch(fullUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(config?.headers || {}),
            Cookie: cookieHeader,
          },
          body: JSON.stringify(data),
          ...config,
        });
        if (res.status === 401) return { data: null } as any;
        if (!res.ok) throw new Error(`Server Fetch Error: ${res.status}`);
        return res.json();
      } catch (e) {
        return { data: null } as any;
      }
    }
    return axiosInstance.post<T>(url, data, config) as unknown as Promise<T>;
  },
  put: async <T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig | any,
  ): Promise<T> => {
    if (isServer) {
      const fullUrl = url.startsWith("http")
        ? url
        : `${API_URL}${url.startsWith("/") ? url.slice(1) : url}`;
      try {
        const cookieHeader = await getServerCookieHeader();
        const res = await fetch(fullUrl, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(config?.headers || {}),
            Cookie: cookieHeader,
          },
          body: JSON.stringify(data),
          ...config,
        });
        if (res.status === 401) return { data: null } as any;
        if (!res.ok) throw new Error(`Server Fetch Error: ${res.status}`);
        return res.json();
      } catch (e) {
        return { data: null } as any;
      }
    }
    return axiosInstance.put<T>(url, data, config) as unknown as Promise<T>;
  },
  patch: async <T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig | any,
  ): Promise<T> => {
    if (isServer) {
      const fullUrl = url.startsWith("http")
        ? url
        : `${API_URL}${url.startsWith("/") ? url.slice(1) : url}`;
      try {
        const cookieHeader = await getServerCookieHeader();
        const res = await fetch(fullUrl, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(config?.headers || {}),
            Cookie: cookieHeader,
          },
          body: JSON.stringify(data),
          ...config,
        });
        if (res.status === 401) return { data: null } as any;
        if (!res.ok) throw new Error(`Server Fetch Error: ${res.status}`);
        return res.json();
      } catch (e) {
        return { data: null } as any;
      }
    }
    return axiosInstance.patch<T>(url, data, config) as unknown as Promise<T>;
  },
  delete: async <T>(
    url: string,
    config?: AxiosRequestConfig | any,
  ): Promise<T> => {
    if (isServer) {
      const fullUrl = url.startsWith("http")
        ? url
        : `${API_URL}${url.startsWith("/") ? url.slice(1) : url}`;
      try {
        const cookieHeader = await getServerCookieHeader();
        const res = await fetch(fullUrl, {
          method: "DELETE",
          ...config,
          headers: {
            ...(config?.headers || {}),
            Cookie: cookieHeader,
          },
        });
        if (res.status === 401) return { data: null } as any;
        if (!res.ok) throw new Error(`Server Fetch Error: ${res.status}`);
        return res.json();
      } catch (e) {
        return { data: null } as any;
      }
    }
    return axiosInstance.delete<T>(url, config) as unknown as Promise<T>;
  },
};
