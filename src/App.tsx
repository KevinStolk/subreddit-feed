import {ArrowDownward, ArrowUpward, ArrowBack} from "@mui/icons-material";
import {
    CircularProgress,
    SpeedDial,
    SpeedDialAction,
    SpeedDialIcon,
    TextField,
    Button,
    Select,
    MenuItem,
    Chip,
    Box,
    Typography,
    FormControl,
    InputLabel,
    InputAdornment
} from "@mui/material";
import React from "react"
import {useState, useRef, ChangeEvent, useMemo, useCallback} from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import {createTheme, ThemeProvider} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import {PostSkeleton} from "./components/molecules/PostSkeleton";
import {StatusMessage} from "./components/molecules/StatusMessage";
import {SettingsMenu} from "./components/organisms/SettingsMenu";
import {useSubreddit, IPostData} from "./hooks/useSubreddit";
import {useSettings} from "./hooks/useSettings";
import {useBookmarks} from "./hooks/useBookmarks";
import {SuggestionsList} from "./components/molecules/SuggestionsList";
import {isDarkTheme} from "./themes";

const Item = React.lazy(() => import('./components/organisms/Item').then(module => ({default: module.Item})));

export interface IItemsProps {
    data: {
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
        secure_media_embed: {
            media_domain_url: string;
        };
        is_gallery?: boolean;
        gallery_data?: {
            items: Array<{
                media_id: string;
                caption?: string;
            }>;
        };
        media_metadata?: {
            [key: string]: {
                s?: { u: string };
                p?: Array<{ u: string; width: number; height: number }>;
                m?: string;
            };
        };
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
        over_18?: boolean;
    };
}

function App() {
    const {
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
        clearHistoryItem,
        fetchSubreddit,
        fetchSubredditFromSuggestion,
        suggestions
    } = useSubreddit();
    const {
        currentTheme,
        themeId,
        setThemeId,
        rememberLast,
        setRememberLast,
        saveHistory,
        setSaveHistory,
        blurNsfw,
        setBlurNsfw,
        contentFilters,
        setContentFilters
    } = useSettings();
    const {bookmarks, isBookmarked, toggleBookmark} = useBookmarks();
    const [showingBookmarks, setShowingBookmarks] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const scrollElement = document.scrollingElement || document.body;

    const getPostMediaType = useCallback((post: IPostData): "video" | "gallery" | "image" | "text" => {
        if (post.secure_media_embed?.media_domain_url || post.is_video) return "video";
        if (post.is_gallery) return "gallery";
        const url = post.url_overridden_by_dest || post.url;
        if (url && /\.(jpg|jpeg|png|gif|webp)$/i.test(url)) return "image";
        if (url && url.includes("i.redd.it")) return "image";
        if (url && url.includes("preview.redd.it")) return "image";
        if (post.selftext && !post.url_overridden_by_dest) return "text";
        return "image";
    }, []);

    const filterPosts = useCallback((postsToFilter: IPostData[]): IPostData[] => {
        return postsToFilter.filter(post => {
            const mediaType = getPostMediaType(post);
            if (mediaType === "video" && !contentFilters.showVideos) return false;
            if (mediaType === "gallery" && !contentFilters.showGalleries) return false;
            if (mediaType === "image" && !contentFilters.showImages) return false;
            if (mediaType === "text" && !contentFilters.showText) return false;
            return true;
        });
    }, [contentFilters, getPostMediaType]);

    const filteredPosts = useMemo(() => filterPosts(posts), [posts, filterPosts]);

    const theme = useMemo(() => createTheme({
        palette: {
            mode: isDarkTheme(currentTheme) ? 'dark' : 'light',
            primary: {main: currentTheme.primary},
            background: {
                default: currentTheme.background,
                paper: currentTheme.paper,
            },
            text: {
                primary: currentTheme.text,
                secondary: currentTheme.textSecondary,
            },
        },
    }), [currentTheme]);

    const handleSubmit = useCallback((e: ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubreddit(subreddit);
        fetchSubreddit();
    }, [subreddit, setSubreddit, fetchSubreddit]);

    const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setSubreddit(e.target.value);
    }, [setSubreddit]);

    const scrollToTop = useCallback(() => scrollElement.scrollTop = 0, [scrollElement]);
    const scrollToBottom = useCallback(() => scrollElement.scrollTop = scrollElement.scrollHeight, [scrollElement]);

    const subSortOptions = ["Hot", "New", "Top", "Rising"];

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <div className="App">
                <div style={{display: "flex", justifyContent: "end", padding: "1rem"}}>
                    <SettingsMenu
                        themeId={themeId}
                        setThemeId={setThemeId}
                        rememberLast={rememberLast}
                        setRememberLast={setRememberLast}
                        saveHistory={saveHistory}
                        setSaveHistory={setSaveHistory}
                        blurNsfw={blurNsfw}
                        setBlurNsfw={setBlurNsfw}
                        contentFilters={contentFilters}
                        setContentFilters={setContentFilters}
                        bookmarkCount={bookmarks.length}
                        onViewBookmarks={() => setShowingBookmarks(true)}
                    />
                </div>
                <div className="container">
                    {showingBookmarks ? (
                        <>
                            <Box display="flex" alignItems="center" gap={2} mb={2}>
                                <Button
                                    startIcon={<ArrowBack/>}
                                    onClick={() => setShowingBookmarks(false)}
                                    variant="outlined"
                                >
                                    Back to Feed
                                </Button>
                                <Typography variant="h5">
                                    Bookmarks ({bookmarks.length})
                                </Typography>
                            </Box>
                            {bookmarks.length === 0 ? (
                                <StatusMessage type="info" message="No bookmarks yet. Open a post and click the bookmark icon to save it."/>
                            ) : (
                                <div className="grid">
                                    {bookmarks.map(post => (
                                        <Item
                                            key={post.id}
                                            data={post}
                                            blurNsfw={blurNsfw}
                                            isBookmarked={isBookmarked(post.id)}
                                            onToggleBookmark={() => toggleBookmark(post)}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <form className="form" onSubmit={handleSubmit}
                                  style={{
                                      display: "flex",
                                      gap: "1rem",
                                      margin: "0 auto",
                                      justifyContent: "center",
                                      alignItems: "center"
                                  }}
                            >
                                <TextField
                                    inputRef={inputRef}
                                    variant="outlined"
                                    value={subreddit}
                                    onChange={handleInputChange}
                                    label="Subreddit"

                                    sx={{
                                        width: {
                                            xs: "100%",
                                            sm: "auto"
                                        },
                                    }}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                {loading && <CircularProgress size={20}/>}
                                            </InputAdornment>
                                        )
                                    }}
                                />
                                <Button type="submit" variant="contained" color="primary" disabled={loading}
                                        sx={{
                                            width: {
                                                xs: "100%",
                                                sm: "auto"
                                            },
                                        }}
                                >
                                    {loading ? "Searching..." : "Search"}
                                </Button>

                                <FormControl variant="outlined"
                                             size={"small"}
                                             sx={{
                                                 width: {
                                                     xs: "100%",
                                                     sm: "auto"
                                                 },
                                             }}
                                >
                                    <InputLabel>Sort</InputLabel>
                                    <Select value={sort} onChange={e => setSort(e.target.value)} label="Sort"
                                    >
                                        {subSortOptions.map((opt: string, i: number) => (
                                            <MenuItem value={opt.toLowerCase()} key={i}>{opt}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </form>


                            {suggestions.length > 0 && (
                                <SuggestionsList suggestions={suggestions} setSubreddit={setSubreddit}
                                                 fetchSubredditFromSuggestion={fetchSubredditFromSuggestion}/>
                            )}

                            {searchHistory.length > 0 && (
                                <Box mt={2} mb={2} display="flex" flexDirection="column" alignItems="center">
                                    <Box display="flex" justifyContent="space-between" width="100%" maxWidth="500px">
                                        <Typography variant="body2" color="text.secondary">Recent Searches:</Typography>
                                        <Button size="small" onClick={clearHistory}>Clear</Button>
                                    </Box>
                                    <Box mt={1} sx={{display: "flex", flexWrap: "wrap", gap: 1, maxWidth: "500px"}}>
                                        {searchHistory.map((sub) => (
                                            <Chip
                                                key={sub}
                                                label={sub}
                                                onClick={() => setSubreddit(sub)}
                                                onDelete={() => clearHistoryItem(sub)}
                                                clickable
                                            />
                                        ))}
                                    </Box>
                                </Box>
                            )}

                            {error && <StatusMessage type="error" message={error}/>}

                            <InfiniteScroll
                                className="grid"
                                dataLength={filteredPosts.length}
                                next={fetchNextPage}
                                hasMore={true}
                                loader={loading && <><CircularProgress/><h1 className="load-text">Loading...</h1></>}
                            >
                                {loading && posts.length === 0
                                    ? [...Array(5)].map((_, i) => <PostSkeleton key={i}/>)
                                    : filteredPosts.map(post => (
                                        <Item
                                            key={post.id}
                                            data={post}
                                            blurNsfw={blurNsfw}
                                            isBookmarked={isBookmarked(post.id)}
                                            onToggleBookmark={() => toggleBookmark(post)}
                                        />
                                    ))
                                }
                            </InfiniteScroll>
                        </>
                    )}
                </div>

                <SpeedDial
                    ariaLabel="SpeedDial"
                    sx={{position: "fixed", bottom: (theme) => theme.spacing(2), right: (theme) => theme.spacing(2)}}
                    icon={<SpeedDialIcon/>}
                >
                    <SpeedDialAction icon={<ArrowUpward/>} tooltipTitle="Go up" onClick={scrollToTop}/>
                    <SpeedDialAction icon={<ArrowDownward/>} tooltipTitle="Go down" onClick={scrollToBottom}/>
                </SpeedDial>
            </div>
        </ThemeProvider>
    );
}

export default App;
