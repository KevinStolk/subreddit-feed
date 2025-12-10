import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";

export const useComments = (
    subreddit: string,
    postId: string,
    open: boolean
) => {
    const [comments, setComments] = useState<any[]>([]);
    const [after, setAfter] = useState<string | null>(null);
    const [sort, setSort] = useState("best");
    const [loading, setLoading] = useState(false);
    const afterRef = useRef<string | null>(null);

    const fetchComments = useCallback(async (isAppend = false) => {
        if (!postId || !subreddit || !open) return;

        setLoading(true);

        const currentAfter = isAppend ? afterRef.current : null;
        const url =
            `${process.env.REACT_APP_BASE_URL}redditComments/?sub=${subreddit}&&id=${postId}&sort=${sort}` +
            (currentAfter ? `&after=${currentAfter}` : "");

        try {
            const res = await axios.get(url);

            setComments(prev =>
                isAppend ? [...prev, ...res.data.comments] : res.data.comments
            );

            setAfter(res.data.after);
            afterRef.current = res.data.after;
        } catch (error) {
            console.error("Failed to fetch comments:", error);
            if (!isAppend) {
                setComments([]);
            }
        } finally {
            setLoading(false);
        }
    }, [postId, subreddit, open, sort]);

    useEffect(() => {
        if (open) {
            setComments([]);
            setAfter(null);
            afterRef.current = null;
            fetchComments(false);
        }
    }, [open, sort, postId, subreddit, fetchComments]);

    return {
        comments,
        loading,
        sort,
        setSort,
        loadMore: () => after && !loading && fetchComments(true),
    };
};
