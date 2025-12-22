import { useState } from "react";
import { getThemeById, Theme } from "../themes";

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
    setThemeId: (id: string) => void;
    setRememberLast: (value: boolean) => void;
    setSaveHistory: (value: boolean) => void;
    setBlurNsfw: (value: boolean) => void;
    setContentFilters: (filters: ContentFilters) => void;
}

const defaultContentFilters: ContentFilters = {
    showImages: true,
    showVideos: true,
    showGalleries: true,
    showText: true,
};

export const useSettings = (): ISettings => {
    const [themeId, setThemeIdState] = useState(localStorage.getItem("themeId") || "dark");
    const [rememberLast, setRememberLast] = useState(localStorage.getItem("rememberLastSubreddit") === "true");
    const [saveHistory, setSaveHistory] = useState(localStorage.getItem("saveHistory") === "true");
    const [blurNsfw, setBlurNsfwState] = useState(localStorage.getItem("blurNsfw") === "true");
    const [contentFilters, setContentFiltersState] = useState<ContentFilters>(() => {
        const stored = localStorage.getItem("contentFilters");
        return stored ? JSON.parse(stored) : defaultContentFilters;
    });

    const setThemeId = (id: string) => {
        setThemeIdState(id);
        localStorage.setItem("themeId", id);
    };

    const handleRememberLast = (value: boolean) => {
        setRememberLast(value);
        localStorage.setItem("rememberLastSubreddit", String(value));
    };

    const handleSaveHistory = (value: boolean) => {
        setSaveHistory(value);
        localStorage.setItem("saveHistory", String(value));
    };

    const handleBlurNsfw = (value: boolean) => {
        setBlurNsfwState(value);
        localStorage.setItem("blurNsfw", String(value));
    };

    const handleContentFilters = (filters: ContentFilters) => {
        setContentFiltersState(filters);
        localStorage.setItem("contentFilters", JSON.stringify(filters));
    };

    return {
        themeId,
        currentTheme: getThemeById(themeId),
        rememberLast,
        saveHistory,
        blurNsfw,
        contentFilters,
        setThemeId,
        setRememberLast: handleRememberLast,
        setSaveHistory: handleSaveHistory,
        setBlurNsfw: handleBlurNsfw,
        setContentFilters: handleContentFilters,
    };
};
