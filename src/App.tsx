import { ArrowDownward, ArrowUpward } from "@material-ui/icons";
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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions, InputAdornment
} from "@mui/material";
import { useState, useEffect, useMemo, ChangeEvent } from "react";
import Item from "./components/Item";
import InfiniteScroll from "react-infinite-scroll-component";
import axios from "axios";
import {createTheme, ThemeProvider} from '@mui/material/styles';
import CssBaseline from "@mui/material/CssBaseline";
import ThemeToggle from "./components/ThemeToggle";
import GridToggleButton from "./components/GridToggleButton";
import RememberToggle from "./components/RememberToggle";
import HistoryToggle from "./components/HistoryToggle";
import StatusMessage from "./components/StatusMessage";
import PostSkeleton from "./components/PostSkeleton";

export interface IItemsProps {
    data: {
        preview: any;
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
                p?: Array<{ u: string, y: string }>;
                m?: string;
            };
        };
    };
}

function App() {
    const [items, setItems] = useState<IItemsProps[]>([]);
    const [after, setAfter] = useState(""); // Use after to get multiple pages.
    const [subreddit, setSubreddit] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [limit, setLimit] = useState<number>(25);
    const [darkMode, setDarkMode] = useState(false);
    const [rememberLast, setRememberLast] = useState<boolean>(true);
    const [sort, setSort] = useState<string>("new");
    const [searchHistory, setHistory] = useState<string[]>(() => {
        const stored = localStorage.getItem("searchHistory");
        return stored ? JSON.parse(stored) : [];
    });
    const [saveHistory, setSaveHistory] = useState<boolean>(true);
    const [openConfirm, setOpenConfirm] = useState(false);
    let scrollElement = document.scrollingElement || document.body;

    // const fetchMoreData = () => {
    //     // INFINITE SCROLL:
    //     setTimeout(() => {
    //         setLoading(true);
    //     }, 1000)
    //     axios
    //         .get(redditUrl)
    //         .then((res) => {
    //             if (res.status === 404) {
    //                 setLoading(false);
    //                 setError("Subreddit does not exist or may be banned.");
    //             }
    //             if (res.status === 200) {
    //                 // setAfter(body.data.after);
    //                 setLimit(limit + 25);
    //                 setLoading(false);
    //                 setItems(res.data.data.children);
    //             }
    //         })
    //         .catch((err) => {
    //             console.error(err);
    //         });
    // };


    const fetchSubreddit = async (sub: string, append: boolean = false) => {
        const trimmed = sub.trim();

        if (!trimmed) {
            setError("Subreddit cannot be empty");
            setItems([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError("");

        try {
            // const url = `https://www.reddit.com/r/${trimmed}/${sort}.json?limit=${limit}`;
            const url = `https://www.reddit.com/r/${trimmed}/${sort}.json?limit=25${after ? `&after=${after}` : ""}`;
            const res = await axios.get(url);

            const newItems = res.data.data.children;
            const nextAfter = res.data.data.after;

            // setItems(res.data.data.children);
            // setLimit(limit + 25); // TODO: Switch to after
            setItems((prev) => (append ? [...prev, ...newItems] : newItems));
            setAfter(nextAfter);
            setLoading(false);

            // Persist the last good subreddit
            if (rememberLast) {
                localStorage.setItem("lastSubreddit", trimmed);
            }

            if (saveHistory) {
                setHistory(prev => {
                    const updated = [trimmed, ...prev.filter(s => s !== trimmed)].slice(0, 10);
                    localStorage.setItem("searchHistory", JSON.stringify(updated));
                    setHistory(updated);
                    return updated;
                });
            }

        } catch (err) {
            console.error(err);
            setLoading(false);
            setError("Failed to load subreddit, does this even exist?");
            setItems([]);
        }
    };

    const loadSub = () => {
        if(!loading && after) {
            fetchSubreddit(subreddit, true);
        }
    };

    const handleSubmit = (e: ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();
        setAfter(""); // reset pagination
        fetchSubreddit(subreddit);
    };

    useEffect(() => {
        const savedMode = localStorage.getItem('darkMode') === 'true';
        const last = localStorage.getItem("lastSubreddit");
        const remember = localStorage.getItem("rememberLastSubreddit");
        const savedHistory = JSON.parse(localStorage.getItem("searchHistory") || "[]");
        const savedToggle = localStorage.getItem("saveHistory") === "true";

        setHistory(savedHistory);
        setSaveHistory(savedToggle);

        setDarkMode(savedMode);
        setHistory(savedHistory);

        if (remember === "true" && last) {
            setSubreddit(last);
            fetchSubreddit(last);
        } else {
            setSubreddit("");
        }

        if (subreddit) {
            fetchSubreddit(subreddit);
        }
    }, [sort]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setSubreddit(e.target.value);
    };

    const scrollToTop = () => {
        scrollElement.scrollTop = 0;
    };

    const scrollToBottom = () => {
        scrollElement.scrollTop = scrollElement.scrollHeight;
    };

    const toggleDarkMode = () => {
        setDarkMode((prev) => {
            localStorage.setItem('darkMode', String(!prev));
            return !prev;
        });
    };

    const handleClearClick = () => {
        setOpenConfirm(true);
    };

    const handleClose = () => {
        setOpenConfirm(false);
    };

    const handleConfirmClear = () => {
        setHistory([]);
        localStorage.removeItem("searchHistory");
        setOpenConfirm(false);
    };

    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode: darkMode ? 'dark' : 'light',
                    background: {
                        default: darkMode ? '#121212' : '#fff',
                        paper: darkMode ? '#1E1E1E' : '#fff',
                    },
                },
            }),
        [darkMode]
    );


    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <div className="App">
                <div style={{display: "flex", gap: ".5rem", alignItems: "center"}}>
                    <ThemeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode}/>
                    <GridToggleButton/>
                    <RememberToggle onChange={setRememberLast}/>
                    <HistoryToggle saveHistory={saveHistory} onChange={setSaveHistory}/>
                </div>
                <form className={"form"} onSubmit={handleSubmit}>
                    <TextField
                        variant="outlined"
                        value={subreddit}
                        onChange={handleInputChange}
                        label="Subreddit"
                        InputProps={{

                            endAdornment: (
                                <InputAdornment position="end">
                                    {loading && <CircularProgress size={20} />}
                                </InputAdornment>
                            )
                        }}
                    />
                    <Button type="submit" variant="contained" color="primary" disabled={loading}>
                        {loading ? "Searching..." : "Search"}
                    </Button>

                    <FormControl variant="outlined" size="small">
                        <InputLabel>Sort</InputLabel>
                        <Select
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            label="Sort"
                        >
                            <MenuItem value="hot">Hot</MenuItem>
                            <MenuItem value="new">New</MenuItem>
                            <MenuItem value="top">Top</MenuItem>
                            <MenuItem value="rising">Rising</MenuItem>
                        </Select>
                    </FormControl>
                </form>

                {searchHistory.length > 0 && (
                    <Box
                        mt={2}
                        mb={2}
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                    >
                        <Box
                            display="flex"
                            justifyContent="space-between"
                            width="100%"
                            maxWidth="500px"
                        >
                            <Typography variant="body2" color="text.secondary">
                                Recent Searches:
                            </Typography>
                            <Button size="small" onClick={handleClearClick}>
                                Clear
                            </Button>
                        </Box>
                        <Box
                            mt={1}
                            sx={{ display: "flex", flexWrap: "wrap", gap: 1, maxWidth: "500px" }}
                        >
                            {searchHistory.map((sub) => (
                                <Chip
                                    key={sub}
                                    label={sub}
                                    onClick={() => fetchSubreddit(sub)}
                                    clickable
                                />
                            ))}
                        </Box>
                    </Box>
                )}

                <Dialog open={openConfirm} onClose={handleClose}>
                    <DialogTitle>Clear Search History</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to clear your entire search history? This action
                            cannot be undone.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={handleConfirmClear} color="error" variant="contained">
                            Clear
                        </Button>
                    </DialogActions>
                </Dialog>

                {error && <StatusMessage type="error" message={error} />}

                {/* Empty state handling */}

                {!loading && !error && items.length === 0 && subreddit && (
                    <StatusMessage type="empty" message={`No posts found in r/${subreddit}`} />
                )}

                <InfiniteScroll
                    className="grid"
                    dataLength={items.length}
                    next={loadSub}
                    hasMore={!!after} // load if only there is a next page
                    loader={
                        loading && (
                            <div className="progress">
                                <CircularProgress
                                />
                                <h1 className="load-text">Loading...</h1>
                            </div>
                        )
                    }
                >
                    {/*{items.map((item: IItemsProps) => (*/}
                    {/*    <Item key={item.data.id} data={item.data}/>*/}
                    {/*))}*/}
                    {loading && items.length === 0 ? (
                        <>
                            {[...Array(5)].map((_, i) => (
                                <PostSkeleton key={i} />
                            ))}
                        </>
                    ) : (
                        items.map((item: IItemsProps) => (
                            <Item key={item.data.id} data={item.data} />
                        ))
                    )}
                </InfiniteScroll>

                <SpeedDial
                    ariaLabel="SpeedDial"
                    sx={{
                        position: "fixed",
                        bottom: (theme) => theme.spacing(2),
                        right: (theme) => theme.spacing(2),
                    }}
                    icon={<SpeedDialIcon/>}
                >
                    <SpeedDialAction
                        icon={<ArrowUpward></ArrowUpward>}
                        tooltipTitle="Go up"
                        onClick={scrollToTop}
                    />
                    <SpeedDialAction
                        icon={<ArrowDownward></ArrowDownward>}
                        tooltipTitle="Go down"
                        onClick={scrollToBottom}
                    />
                </SpeedDial>
            </div>
        </ThemeProvider>
    );
}

export default App;
