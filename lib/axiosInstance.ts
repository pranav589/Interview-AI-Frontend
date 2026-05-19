import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";

const axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 120000, // 2 minutes to allow for complex AI feedback generation
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

axiosInstance.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    if (config.headers) {
      delete config.headers['Content-Type'];
      delete config.headers['content-type'];
    }
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.data && (error.response.data as any).message) {
      error.message = (error.response.data as any).message || error.message;
    }

    if (error.response?.status === 429) {
      console.warn("[API] Rate limit hit. Please wait before retrying.");
      if (originalRequest.url?.includes("auth/refresh-token")) {
        processQueue(error, null);
        isRefreshing = false;
      }
      return Promise.reject(error);
    }

    const excludedAuthRoutes = [
      "auth/login",
      "auth/register",
      "auth/refresh-token",
      "auth/logout",
      "auth/forgot-password",
      "auth/reset-password",
    ];

    const isAuthRoute = excludedAuthRoutes.some((route) =>
      originalRequest.url?.includes(route),
    );

    // Logging for 401 diagnostic
    console.log(
      `[API Interceptor] 401 Unauthorized detected. URL: ${originalRequest.url}, IsAuthRoute: ${isAuthRoute}`,
    );

    if (
      !originalRequest ||
      error.response?.status !== 401 ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    if (isAuthRoute) {
      console.log(
        `[Auth] Skipping refresh for auth route: ${originalRequest.url}`,
      );
      return Promise.reject(error);
    }

    const hasSessionHint =
      typeof window !== "undefined" && localStorage.getItem("is-logged-in");
    if (!hasSessionHint) {
      console.warn(
        `[Auth] 401 on ${originalRequest.url} but no session hint. Skipping refresh.`,
      );
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise(function (resolve, reject) {
        failedQueue.push({ resolve, reject });
      })
        .then(() => {
          return axiosInstance(originalRequest);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Final check right before the refresh call to catch rapid state changes
      if (
        typeof window !== "undefined" &&
        !localStorage.getItem("is-logged-in")
      ) {
        console.warn(
          `[Auth] Refresh aborted for ${originalRequest.url} - session hint removed.`,
        );
        return Promise.reject(error);
      }

      console.log(
        `[Auth] Access token expired on ${originalRequest.url}. Attempting to refresh...`,
      );
      await axiosInstance.post("auth/refresh-token");
      console.log(
        `[Auth] Token refresh successful for ${originalRequest.url}. Retrying.`,
      );
      processQueue(null);
      return axiosInstance(originalRequest);
    } catch (refreshError: any) {
      processQueue(refreshError, null);

      const isSessionExpired =
        refreshError.response?.status === 401 ||
        refreshError.response?.status === 400;

      if (typeof window !== "undefined" && isSessionExpired) {
        console.error(
          "[Auth] Refresh token expired or invalid. Redirecting to sign-in.",
        );
        // Clear session hint
        localStorage.removeItem("is-logged-in");
        window.location.href = "/auth/signin";
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default axiosInstance;
