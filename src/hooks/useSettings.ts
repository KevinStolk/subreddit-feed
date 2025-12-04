import { useState } from "react";

export interface ISettings {
    darkMode: boolean;
    rememberLast: boolean;
    saveHistory: boolean;
    toggleDarkMode: () => void;
    setRememberLast: (value: boolean) => void;
    setSaveHistory: (value: boolean) => void;
}

export const useSettings = (): ISettings => {
    const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === "true");
    const [rememberLast, setRememberLast] = useState(localStorage.getItem("rememberLastSubreddit") === "true");
    const [saveHistory, setSaveHistory] = useState(localStorage.getItem("saveHistory") === "true");

    const toggleDarkMode = () => {
        setDarkMode(prev => {
            localStorage.setItem("darkMode", String(!prev));
            return !prev;
        });
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
        darkMode,
        rememberLast,
        saveHistory,
        toggleDarkMode,
        setRememberLast: handleRememberLast,
        setSaveHistory: handleSaveHistory
    };
};
