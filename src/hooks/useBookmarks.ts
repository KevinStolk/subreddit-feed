import { useState, useCallback } from "react";
import { IPostData } from "./useSubreddit";

export interface IBookmarks {
    bookmarks: IPostData[];
    isBookmarked: (postId: string) => boolean;
    addBookmark: (post: IPostData) => void;
    removeBookmark: (postId: string) => void;
    toggleBookmark: (post: IPostData) => void;
    clearBookmarks: () => void;
}

export const useBookmarks = (): IBookmarks => {
    const [bookmarks, setBookmarks] = useState<IPostData[]>(() => {
        const stored = localStorage.getItem("bookmarks");
        return stored ? JSON.parse(stored) : [];
    });

    const saveBookmarks = useCallback((newBookmarks: IPostData[]) => {
        setBookmarks(newBookmarks);
        localStorage.setItem("bookmarks", JSON.stringify(newBookmarks));
    }, []);

    const isBookmarked = useCallback((postId: string): boolean => {
        return bookmarks.some(b => b.id === postId);
    }, [bookmarks]);

    const addBookmark = useCallback((post: IPostData) => {
        if (!isBookmarked(post.id)) {
            saveBookmarks([post, ...bookmarks]);
        }
    }, [bookmarks, isBookmarked, saveBookmarks]);

    const removeBookmark = useCallback((postId: string) => {
        saveBookmarks(bookmarks.filter(b => b.id !== postId));
    }, [bookmarks, saveBookmarks]);

    const toggleBookmark = useCallback((post: IPostData) => {
        if (isBookmarked(post.id)) {
            removeBookmark(post.id);
        } else {
            addBookmark(post);
        }
    }, [isBookmarked, removeBookmark, addBookmark]);

    const clearBookmarks = useCallback(() => {
        saveBookmarks([]);
    }, [saveBookmarks]);

    return {
        bookmarks,
        isBookmarked,
        addBookmark,
        removeBookmark,
        toggleBookmark,
        clearBookmarks,
    };
};
