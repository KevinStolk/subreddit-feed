import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import {
    authApi,
    userApi,
    bookmarksApi,
    User,
    UserSettings,
    SearchHistoryItem,
    getAccessToken,
    getRefreshToken,
    setTokens,
    clearTokens,
} from "../services/api";
import { IPostData } from "../hooks/useSubreddit";

interface AuthContextType {
    user: User | null;
    settings: UserSettings | null;
    searchHistory: SearchHistoryItem[];
    bookmarks: IPostData[];
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (provider: "google" | "github") => void;
    logout: () => Promise<void>;
    updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
    addToHistory: (subreddit: string) => Promise<void>;
    removeFromHistory: (id: string) => Promise<void>;
    clearHistory: () => Promise<void>;
    addBookmark: (post: IPostData) => Promise<void>;
    removeBookmark: (postId: string) => Promise<void>;
    clearBookmarks: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [settings, setSettings] = useState<UserSettings | null>(null);
    const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
    const [bookmarks, setBookmarks] = useState<IPostData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const isAuthenticated = !!user;

    // Handle OAuth callback
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get("accessToken");
        const refreshToken = params.get("refreshToken");

        if (accessToken && refreshToken) {
            setTokens(accessToken, refreshToken);
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    // Fetch user on mount
    const refreshUser = useCallback(async () => {
        const token = getAccessToken();
        const refresh = getRefreshToken();

        if (!token && !refresh) {
            setIsLoading(false);
            return;
        }

        try {
            const { user: userData, settings: userSettings } = await authApi.getMe();
            setUser(userData);
            setSettings(userSettings);

            // Fetch search history and bookmarks in parallel
            const [history, userBookmarks] = await Promise.all([
                userApi.getHistory(),
                bookmarksApi.getBookmarks(),
            ]);
            setSearchHistory(history);
            setBookmarks(userBookmarks);
        } catch (error) {
            console.error("Failed to fetch user:", error);
            clearTokens();
            setUser(null);
            setSettings(null);
            setSearchHistory([]);
            setBookmarks([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    // Listen for logout events from API interceptor
    useEffect(() => {
        const handleLogout = () => {
            setUser(null);
            setSettings(null);
            setSearchHistory([]);
            setBookmarks([]);
        };

        window.addEventListener("auth:logout", handleLogout);
        return () => window.removeEventListener("auth:logout", handleLogout);
    }, []);

    const login = (provider: "google" | "github") => {
        const baseUrl = process.env.REACT_APP_BASE_URL || "http://localhost:8000/api/";
        window.location.href = `${baseUrl}auth/${provider}`;
    };

    const logout = async () => {
        try {
            await authApi.logout();
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            clearTokens();
            setUser(null);
            setSettings(null);
            setSearchHistory([]);
            setBookmarks([]);
        }
    };

    const updateSettings = async (newSettings: Partial<UserSettings>) => {
        if (!isAuthenticated) return;

        try {
            const updated = await userApi.updateSettings(newSettings);
            setSettings(updated);
        } catch (error) {
            console.error("Failed to update settings:", error);
            throw error;
        }
    };

    const addToHistory = async (subreddit: string) => {
        if (!isAuthenticated) return;

        try {
            const updated = await userApi.addHistory(subreddit);
            setSearchHistory(updated);
        } catch (error) {
            console.error("Failed to add to history:", error);
        }
    };

    const removeFromHistory = async (id: string) => {
        if (!isAuthenticated) return;

        try {
            await userApi.deleteHistoryItem(id);
            setSearchHistory((prev) => prev.filter((item) => item.id !== id));
        } catch (error) {
            console.error("Failed to remove from history:", error);
        }
    };

    const clearHistoryFn = async () => {
        if (!isAuthenticated) return;

        try {
            await userApi.clearHistory();
            setSearchHistory([]);
        } catch (error) {
            console.error("Failed to clear history:", error);
        }
    };

    const addBookmark = async (post: IPostData) => {
        if (!isAuthenticated) return;

        // Optimistically update UI
        setBookmarks((prev) => {
            if (prev.some((b) => b.id === post.id)) return prev;
            return [post, ...prev];
        });

        try {
            await bookmarksApi.addBookmark(post);
        } catch (error) {
            console.error("Failed to add bookmark:", error);
            // Revert on error
            setBookmarks((prev) => prev.filter((b) => b.id !== post.id));
        }
    };

    const removeBookmark = async (postId: string) => {
        if (!isAuthenticated) return;

        // Store for potential rollback
        const previousBookmarks = bookmarks;

        // Optimistically update UI
        setBookmarks((prev) => prev.filter((b) => b.id !== postId));

        try {
            await bookmarksApi.removeBookmark(postId);
        } catch (error) {
            console.error("Failed to remove bookmark:", error);
            // Revert on error
            setBookmarks(previousBookmarks);
        }
    };

    const clearBookmarksFn = async () => {
        if (!isAuthenticated) return;

        const previousBookmarks = bookmarks;
        setBookmarks([]);

        try {
            await bookmarksApi.clearBookmarks();
        } catch (error) {
            console.error("Failed to clear bookmarks:", error);
            setBookmarks(previousBookmarks);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                settings,
                searchHistory,
                bookmarks,
                isAuthenticated,
                isLoading,
                login,
                logout,
                updateSettings,
                addToHistory,
                removeFromHistory,
                clearHistory: clearHistoryFn,
                addBookmark,
                removeBookmark,
                clearBookmarks: clearBookmarksFn,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export default AuthContext;
