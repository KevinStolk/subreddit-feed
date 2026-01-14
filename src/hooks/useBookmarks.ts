import { useState, useCallback } from "react";
import { IPostData } from "./useSubreddit";
import { useAuth } from "../context/AuthContext";

export interface IBookmarks {
    bookmarks: IPostData[];
    isBookmarked: (postId: string) => boolean;
    addBookmark: (post: IPostData) => void;
    removeBookmark: (postId: string) => void;
    toggleBookmark: (post: IPostData) => void;
    clearBookmarks: () => void;
}

export const useBookmarks = (): IBookmarks => {
    const {
        isAuthenticated,
        isLoading: authLoading,
        bookmarks: serverBookmarks,
        addBookmark: addServerBookmark,
        removeBookmark: removeServerBookmark,
        clearBookmarks: clearServerBookmarks,
    } = useAuth();

    // Local bookmarks for unauthenticated users only
    const [localBookmarks, setLocalBookmarks] = useState<IPostData[]>(() => {
        const stored = localStorage.getItem("bookmarks");
        return stored ? JSON.parse(stored) : [];
    });

    // Use server bookmarks when authenticated, otherwise local
    const bookmarks = (!authLoading && isAuthenticated) ? serverBookmarks : localBookmarks;

    const isBookmarked = useCallback((postId: string): boolean => {
        return bookmarks.some(b => b.id === postId);
    }, [bookmarks]);

    const addBookmark = useCallback((post: IPostData) => {
        if (isAuthenticated) {
            addServerBookmark(post);
        } else {
            setLocalBookmarks(prev => {
                if (prev.some(b => b.id === post.id)) return prev;
                const newBookmarks = [post, ...prev];
                localStorage.setItem("bookmarks", JSON.stringify(newBookmarks));
                return newBookmarks;
            });
        }
    }, [isAuthenticated, addServerBookmark]);

    const removeBookmark = useCallback((postId: string) => {
        if (isAuthenticated) {
            removeServerBookmark(postId);
        } else {
            setLocalBookmarks(prev => {
                const newBookmarks = prev.filter(b => b.id !== postId);
                localStorage.setItem("bookmarks", JSON.stringify(newBookmarks));
                return newBookmarks;
            });
        }
    }, [isAuthenticated, removeServerBookmark]);

    const toggleBookmark = useCallback((post: IPostData) => {
        if (isBookmarked(post.id)) {
            removeBookmark(post.id);
        } else {
            addBookmark(post);
        }
    }, [isBookmarked, removeBookmark, addBookmark]);

    const clearBookmarks = useCallback(() => {
        if (isAuthenticated) {
            clearServerBookmarks();
        } else {
            setLocalBookmarks([]);
            localStorage.removeItem("bookmarks");
        }
    }, [isAuthenticated, clearServerBookmarks]);

    return {
        bookmarks,
        isBookmarked,
        addBookmark,
        removeBookmark,
        toggleBookmark,
        clearBookmarks,
    };
};
