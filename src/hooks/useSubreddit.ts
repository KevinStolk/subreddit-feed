import {useState, useEffect} from "react";
import axios from "axios";

export interface IPostData {
    ups: string;
    num_comments: string;
    created_utc: number;
    author: string;
    subreddit: string;
    preview: any;
    id: string;
    url_overridden_by_dest: string;
    url: string;
    title: string;
    permalink: string;
    selftext: string;
    secure_media_embed: { media_domain_url: string };
    is_gallery?: boolean;
    gallery_data?: { items: Array<{ media_id: string; caption?: string }> };
    media_metadata?: { [key: string]: { s?: { u: string }; p?: Array<{ u: string; y: string }>; m?: string } };
}

export interface IUseSubreddit {
    posts: IPostData[];
    loading: boolean;
    error: string;
    sort: string;
    setSort: (value: string) => void;
    subreddit: string;
    setSubreddit: (value: string) => void;
    fetchNextPage: () => void;
    searchHistory: string[];
    clearHistory: () => void;
    fetchSubreddit: () => void;
    fetchSubredditFromSuggestion: (sub: string) => void;
    suggestions: string[];
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

    const saveHistory = localStorage.getItem("saveHistory") === "true";
    const rememberLast = localStorage.getItem("rememberLastSubreddit") === "true";

    const fetchSuggestions = async (sub: string) => {
        try {
            const res = await axios.get(`/api/redditSearch?query=${sub}`);

            const names = res.data.names || [];
            setSuggestions(names.slice(0, 5)); // limit suggestions
        } catch {
            setSuggestions([]);
        }
    };
    const fetchPosts = async (sub: string, append = false) => {
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
            // const url = `https://www.reddit.com/r/${trimmed}/${sort}.json?limit=25${after ? `&after=${after}` : ""}`;
            const url = `/api/redditPosts?sub=${trimmed}&sort=${sort}${after ? `&after=${after}` : ""}`;
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
        fetchPosts(subreddit, false);
        setAfter(null); // reset pagination on new search
    };

    const fetchSubredditFromSuggestion = (sub: string) => {
        setSubreddit(sub);
        setAfter(null);
        fetchPosts(sub, false);
    };

    const fetchNextPage = () => {
        if (!loading && after) {
            fetchPosts(subreddit, true);
        }
    };

    const clearHistory = () => {
        setSearchHistory([]);
        localStorage.removeItem("searchHistory");
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
        loading,
        error,
        sort,
        setSort,
        subreddit,
        setSubreddit,
        fetchNextPage,
        searchHistory,
        clearHistory,
        fetchSubreddit,
        fetchSubredditFromSuggestion,
        suggestions,
    };
};
