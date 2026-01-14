import { useState, useCallback } from "react";
import { getThemeById, Theme } from "../themes";
import { useAuth } from "../context/AuthContext";

export interface ContentFilters {
    showImages: boolean;
    showVideos: boolean;
    showGalleries: boolean;
    showText: boolean;
}

export interface ISettings {
    themeId: string;
    currentTheme: Theme;
    rememberLast: boolean;
    saveHistory: boolean;
    blurNsfw: boolean;
    contentFilters: ContentFilters;
    lastSubreddit: string | null;
    setThemeId: (id: string) => void;
    setRememberLast: (value: boolean) => void;
    setSaveHistory: (value: boolean) => void;
    setBlurNsfw: (value: boolean) => void;
    setContentFilters: (filters: ContentFilters) => void;
    setLastSubreddit: (subreddit: string | null) => void;
}

const defaultContentFilters: ContentFilters = {
    showImages: true,
    showVideos: true,
    showGalleries: true,
    showText: true,
};

export const useSettings = (): ISettings => {
    const { isAuthenticated, isLoading, settings: serverSettings, updateSettings } = useAuth();

    // Local-only settings (not synced to server)
    const [blurNsfw, setBlurNsfwState] = useState(() => localStorage.getItem("blurNsfw") === "true");
    const [contentFilters, setContentFiltersState] = useState<ContentFilters>(() => {
        const stored = localStorage.getItem("contentFilters");
        return stored ? JSON.parse(stored) : defaultContentFilters;
    });

    // Local state for unauthenticated users only
    const [localThemeId, setLocalThemeId] = useState(() => localStorage.getItem("themeId") || "dark");
    const [localRememberLast, setLocalRememberLast] = useState(() => localStorage.getItem("rememberLastSubreddit") === "true");
    const [localSaveHistory, setLocalSaveHistory] = useState(() => localStorage.getItem("saveHistory") === "true");
    const [localLastSubreddit, setLocalLastSubreddit] = useState<string | null>(() => localStorage.getItem("lastSubreddit"));

    // Derive values based on auth state
    // When loading, use local values temporarily; when authenticated, use server values
    const themeId = (!isLoading && isAuthenticated && serverSettings?.themeId)
        ? serverSettings.themeId
        : localThemeId;

    const rememberLast = (!isLoading && isAuthenticated && serverSettings)
        ? serverSettings.rememberSub
        : localRememberLast;

    const saveHistory = (!isLoading && isAuthenticated && serverSettings)
        ? serverSettings.saveHistory
        : localSaveHistory;

    const lastSubreddit = (!isLoading && isAuthenticated && serverSettings)
        ? serverSettings.lastSubreddit
        : localLastSubreddit;

    const setThemeId = useCallback((id: string) => {
        if (isAuthenticated) {
            updateSettings({ themeId: id }).catch(console.error);
        } else {
            setLocalThemeId(id);
            localStorage.setItem("themeId", id);
        }
    }, [isAuthenticated, updateSettings]);

    const handleRememberLast = useCallback((value: boolean) => {
        if (isAuthenticated) {
            updateSettings({ rememberSub: value }).catch(console.error);
        } else {
            setLocalRememberLast(value);
            localStorage.setItem("rememberLastSubreddit", String(value));
        }
    }, [isAuthenticated, updateSettings]);

    const handleSaveHistory = useCallback((value: boolean) => {
        if (isAuthenticated) {
            updateSettings({ saveHistory: value }).catch(console.error);
        } else {
            setLocalSaveHistory(value);
            localStorage.setItem("saveHistory", String(value));
        }
    }, [isAuthenticated, updateSettings]);

    const handleBlurNsfw = useCallback((value: boolean) => {
        setBlurNsfwState(value);
        localStorage.setItem("blurNsfw", String(value));
    }, []);

    const handleContentFilters = useCallback((filters: ContentFilters) => {
        setContentFiltersState(filters);
        localStorage.setItem("contentFilters", JSON.stringify(filters));
    }, []);

    const handleLastSubreddit = useCallback((subreddit: string | null) => {
        if (isAuthenticated) {
            updateSettings({ lastSubreddit: subreddit }).catch(console.error);
        } else {
            setLocalLastSubreddit(subreddit);
            if (subreddit) {
                localStorage.setItem("lastSubreddit", subreddit);
            } else {
                localStorage.removeItem("lastSubreddit");
            }
        }
    }, [isAuthenticated, updateSettings]);

    return {
        themeId,
        currentTheme: getThemeById(themeId),
        rememberLast,
        saveHistory,
        blurNsfw,
        contentFilters,
        lastSubreddit,
        setThemeId,
        setRememberLast: handleRememberLast,
        setSaveHistory: handleSaveHistory,
        setBlurNsfw: handleBlurNsfw,
        setContentFilters: handleContentFilters,
        setLastSubreddit: handleLastSubreddit,
    };
};
