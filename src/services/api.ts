import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";

const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:8000/api/";

// Token storage keys
const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

// Get tokens from storage
export const getAccessToken = (): string | null => sessionStorage.getItem(ACCESS_TOKEN_KEY);
export const getRefreshToken = (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY);

// Store tokens
export const setTokens = (accessToken: string, refreshToken: string): void => {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

// Clear tokens
export const clearTokens = (): void => {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// Create axios instance
const api: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
});

// Request interceptor to add auth header
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = getAccessToken();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 and we haven't tried refreshing yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = getRefreshToken();
            if (refreshToken) {
                try {
                    const response = await axios.post(`${BASE_URL}auth/refresh`, {
                        refreshToken,
                    });

                    const { accessToken } = response.data;
                    sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);

                    // Retry original request with new token
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    // Refresh failed, clear tokens
                    clearTokens();
                    window.dispatchEvent(new CustomEvent("auth:logout"));
                    return Promise.reject(refreshError);
                }
            }
        }

        return Promise.reject(error);
    }
);

// User types
export interface User {
    id: string;
    email: string;
    name: string | null;
    avatar: string | null;
    provider: string;
}

export interface UserSettings {
    themeId: string;
    rememberSub: boolean;
    saveHistory: boolean;
    lastSubreddit: string | null;
}

export interface SearchHistoryItem {
    id: string;
    subreddit: string;
    searchedAt: string;
}

// Auth API
export const authApi = {
    // Get current user
    getMe: async (): Promise<{ user: User; settings: UserSettings | null }> => {
        const response = await api.get("auth/me");
        return response.data;
    },

    // Refresh token
    refresh: async (refreshToken: string): Promise<{ accessToken: string }> => {
        const response = await api.post("auth/refresh", { refreshToken });
        return response.data;
    },

    // Logout
    logout: async (): Promise<void> => {
        const refreshToken = getRefreshToken();
        await api.post("auth/logout", { refreshToken });
        clearTokens();
    },
};

// User API
export const userApi = {
    // Get settings
    getSettings: async (): Promise<UserSettings> => {
        const response = await api.get("user/settings");
        return response.data;
    },

    // Update settings
    updateSettings: async (settings: Partial<UserSettings>): Promise<UserSettings> => {
        const response = await api.patch("user/settings", settings);
        return response.data;
    },

    // Get search history
    getHistory: async (): Promise<SearchHistoryItem[]> => {
        const response = await api.get("user/history");
        return response.data;
    },

    // Add to search history
    addHistory: async (subreddit: string): Promise<SearchHistoryItem[]> => {
        const response = await api.post("user/history", { subreddit });
        return response.data;
    },

    // Delete history item
    deleteHistoryItem: async (id: string): Promise<void> => {
        await api.delete(`user/history/${id}`);
    },

    // Clear all history
    clearHistory: async (): Promise<void> => {
        await api.delete("user/history");
    },
};

// Bookmarks API
export const bookmarksApi = {
    // Get all bookmarks
    getBookmarks: async (): Promise<any[]> => {
        const response = await api.get("bookmarks");
        return response.data;
    },

    // Add a bookmark
    addBookmark: async (post: any): Promise<void> => {
        await api.post("bookmarks", { post });
    },

    // Remove a bookmark
    removeBookmark: async (postId: string): Promise<void> => {
        await api.delete(`bookmarks/${postId}`);
    },

    // Clear all bookmarks
    clearBookmarks: async (): Promise<void> => {
        await api.delete("bookmarks");
    },
};

export default api;
