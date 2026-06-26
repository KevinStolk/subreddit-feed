import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";

const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:8000/api/";

// Token storage keys
const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

// Get tokens from storage
export const getAccessToken = (): string | null => sessionStorage.getItem(ACCESS_TOKEN_KEY);
export const getRefreshToken = (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY);

export const setTokens = (accessToken: string, refreshToken: string): void => {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearTokens = (): void => {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const api: AxiosInstance = axios.create({
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
    getMe: async (): Promise<{ user: User; settings: UserSettings | null }> => {
        const response = await api.get("auth/me");
        return response.data;
    },

    refresh: async (refreshToken: string): Promise<{ accessToken: string }> => {
        const response = await api.post("auth/refresh", { refreshToken });
        return response.data;
    },

    logout: async (): Promise<void> => {
        const refreshToken = getRefreshToken();
        await api.post("auth/logout", { refreshToken });
        clearTokens();
    },
};

export const userApi = {
    getSettings: async (): Promise<UserSettings> => {
        const response = await api.get("user/settings");
        return response.data;
    },

    updateSettings: async (settings: Partial<UserSettings>): Promise<UserSettings> => {
        const response = await api.patch("user/settings", settings);
        return response.data;
    },

    getHistory: async (): Promise<SearchHistoryItem[]> => {
        const response = await api.get("user/history");
        return response.data;
    },

    addHistory: async (subreddit: string): Promise<SearchHistoryItem[]> => {
        const response = await api.post("user/history", { subreddit });
        return response.data;
    },

    deleteHistoryItem: async (id: string): Promise<void> => {
        await api.delete(`user/history/${id}`);
    },

    clearHistory: async (): Promise<void> => {
        await api.delete("user/history");
    },
};

// Bookmarks API
export const bookmarksApi = {
    getBookmarks: async (): Promise<any[]> => {
        const response = await api.get("bookmarks");
        return response.data;
    },

    addBookmark: async (post: any): Promise<void> => {
        await api.post("bookmarks", { post });
    },

    removeBookmark: async (postId: string): Promise<void> => {
        await api.delete(`bookmarks/${postId}`);
    },

    clearBookmarks: async (): Promise<void> => {
        await api.delete("bookmarks");
    },
};