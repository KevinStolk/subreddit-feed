import {useState, useEffect, useMemo} from "react";
import axios from "axios";

export interface IPostData {
    ups: string;
    num_comments: string;
    created_utc: number;
    author: string;
    subreddit: string;
    preview?: {
        images?: Array<{
            source: { url: string; width: number; height: number };
            resolutions: Array<{ url: string; width: number; height: number }>;
        }>;
    };
    thumbnail?: string;
    thumbnail_width?: number;
    thumbnail_height?: number;
    id: string;
    url_overridden_by_dest: string;
    url: string;
    title: string;
    permalink: string;
    selftext: string;
    secure_media_embed: { media_domain_url: string };
    is_gallery?: boolean;
    gallery_data?: { items: Array<{ media_id: string; caption?: string }> };
    media_metadata?: { [key: string]: { s?: { u: string }; p?: Array<{ u: string; width: number; height: number }>; m?: string } };
    over_18?: boolean;
    is_video?: boolean;
    media?: {
        reddit_video?: {
            fallback_url: string;
            hls_url?: string;
            height?: number;
            width?: number;
            duration?: number;
        };
    };
}

export interface IUseSubreddit {
    posts: IPostData[];
    filteredPosts: IPostData[];
    loading: boolean;
    error: string;
    sort: string;
    setSort: (value: string) => void;
    subreddit: string;
    setSubreddit: (value: string) => void;
    clearHistoryItem: (sub: string) => void;
    fetchNextPage: () => void;
    searchHistory: string[];
    clearHistory: () => void;
    fetchSubreddit: () => void;
    fetchSubredditFromSuggestion: (sub: string) => void;
    suggestions: string[];
    searchQuery: string;
    setSearchQuery: (value: string) => void;
    searchWithinSubreddit: () => void;
    clearSearch: () => void;
    isSearching: boolean;
}

export const useSubreddit = (initialSubreddit = "", initialSort = "new"): IUseSubreddit => {
    const [posts, setPosts] = useState<IPostData[]>([]);
    const [subreddit, setSubreddit] = useState(initialSubreddit);
    const [sort, setSort] = useState(initialSort);
    const [after, setAfter] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [searchHistory, setSearchHistory] = useState<string[]>(() => {
        const stored = localStorage.getItem("searchHistory");
        return stored ? JSON.parse(stored) : [];
    });

    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    const saveHistory = localStorage.getItem("saveHistory") === "true";
    const rememberLast = localStorage.getItem("rememberLastSubreddit") === "true";

    const filteredPosts = useMemo(() => {
        if (!isSearching || !searchQuery.trim()) {
            return posts;
        }
        const query = searchQuery.toLowerCase();
        return posts.filter(post =>
            post.title.toLowerCase().includes(query) ||
            post.selftext?.toLowerCase().includes(query) ||
            post.author?.toLowerCase().includes(query)
        );
    }, [posts, searchQuery, isSearching]);

    const fetchSuggestions = async (sub: string) => {
        try {
            const res = await axios.get(
                `${process.env.REACT_APP_BASE_URL}redditSearch?query=${sub}&exact=false`
            );

            const names = res.data.names || [];
            setSuggestions(names.slice(0, 5));
        } catch {
            setSuggestions([]);
        }
    };

    const fetchPosts = async (sub: string, sortBy: string, afterToken: string | null, append = false) => {
        const trimmed = sub.trim();
        if (!trimmed) {
            setError("Subreddit cannot be empty");
            setPosts([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError("");
        setSuggestions([]);

        try {
            const url = `${process.env.REACT_APP_BASE_URL}redditPosts?sub=${trimmed}&sort=${sortBy}.json?limit=25${append && afterToken ? `&after=${afterToken}` : ""}`;
            const res = await axios.get(url);
            const newPosts = res.data.data.children.map((c: any) => c.data);
            const nextAfter = res.data.data.after;

            setPosts(prev => (append ? [...prev, ...newPosts] : newPosts));
            setAfter(nextAfter);
            setLoading(false);

            if (rememberLast) localStorage.setItem("lastSubreddit", trimmed);

            if (saveHistory) {
                setSearchHistory(prev => {
                    const updated = [trimmed, ...prev.filter(s => s !== trimmed)].slice(0, 10);
                    localStorage.setItem("searchHistory", JSON.stringify(updated));
                    return updated;
                });
            }
        } catch (err) {
            console.error(err);
            await fetchSuggestions(trimmed);
            setError("Failed to load subreddit, does this even exist?");
            setPosts([]);
            setLoading(false);
        }
    };

    const fetchSubreddit = () => {
        setSearchQuery("");
        setIsSearching(false);
        setAfter(null);
        fetchPosts(subreddit, sort, null, false);
    };

    const fetchSubredditFromSuggestion = (sub: string) => {
        setSubreddit(sub);
        setSearchQuery("");
        setIsSearching(false);
        setAfter(null);
        fetchPosts(sub, sort, null, false);
    };

    const fetchNextPage = () => {
        if (!loading && after) {
            fetchPosts(subreddit, sort, after, true);
        }
    };

    const searchWithinSubreddit = () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
    };

    const clearSearch = () => {
        setSearchQuery("");
        setIsSearching(false);
    };

    const clearHistory = () => {
        setSearchHistory([]);
        localStorage.removeItem("searchHistory");
    };

    const clearHistoryItem = (sub: string) => {
        setSearchHistory(prev => {
            const newHistory = prev.filter(s => s !== sub);
            localStorage.setItem("searchHistory", JSON.stringify(newHistory));
            return newHistory;
        });
    };

    // On mount: load last subreddit if remembered
    useEffect(() => {
        const lastSub = localStorage.getItem("lastSubreddit");
        if (rememberLast && lastSub) {
            setSubreddit(lastSub);
        }
    }, []);

    return {
        posts,
        filteredPosts,
        loading,
        error,
        sort,
        setSort,
        subreddit,
        setSubreddit,
        fetchNextPage,
        searchHistory,
        clearHistory,
        clearHistoryItem,
        fetchSubreddit,
        fetchSubredditFromSuggestion,
        suggestions,
        searchQuery,
        setSearchQuery,
        searchWithinSubreddit,
        clearSearch,
        isSearching,
    };
};
