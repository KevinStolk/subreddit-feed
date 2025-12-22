import { useState } from "react";
import { getThemeById, Theme } from "../themes";

export interface ISettings {
    themeId: string;
    currentTheme: Theme;
    rememberLast: boolean;
    saveHistory: boolean;
    setThemeId: (id: string) => void;
    setRememberLast: (value: boolean) => void;
    setSaveHistory: (value: boolean) => void;
}

export const useSettings = (): ISettings => {
    const [themeId, setThemeIdState] = useState(localStorage.getItem("themeId") || "dark");
    const [rememberLast, setRememberLast] = useState(localStorage.getItem("rememberLastSubreddit") === "true");
    const [saveHistory, setSaveHistory] = useState(localStorage.getItem("saveHistory") === "true");

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

    return {
        themeId,
        currentTheme: getThemeById(themeId),
        rememberLast,
        saveHistory,
        setThemeId,
        setRememberLast: handleRememberLast,
        setSaveHistory: handleSaveHistory
    };
};
