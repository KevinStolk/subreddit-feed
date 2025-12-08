import { useState, useEffect } from "react";
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

    const fetchComments = async (isAppend = false) => {
        if (!postId || !subreddit || !open) return;

        setLoading(true);

        const url =
            `${process.env.REACT_APP_BASE_URL}redditComments/?sub=${subreddit}&&id=${postId}&sort=${sort}` +
            (after ? `&after=${after}` : "");

        const res = await axios.get(url);

        setComments(prev =>
            isAppend ? [...prev, ...res.data.comments] : res.data.comments
        );

        setAfter(res.data.after);
        setLoading(false);
    };

    useEffect(() => {
        if (open) fetchComments(false);
    }, [open, sort]);

    return {
        comments,
        loading,
        sort,
        setSort,
        loadMore: () => after && !loading && fetchComments(true),
    };
};
