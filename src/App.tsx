import {ArrowDownward, ArrowUpward} from "@mui/icons-material";
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
import {useState, useRef, ChangeEvent, useMemo} from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import {createTheme, ThemeProvider} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import {Item} from "./components/organisms/Item";
import {PostSkeleton} from "./components/molecules/PostSkeleton";
import {StatusMessage} from "./components/molecules/StatusMessage";
import {SettingsMenu} from "./components/organisms/SettingsMenu";
import {useSubreddit} from "./hooks/useSubreddit";
import {useSettings} from "./hooks/useSettings";


export interface IItemsProps {
    data: {
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
        clearHistory
    } = useSubreddit();
    const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
    const inputRef = useRef<HTMLInputElement>(null);
    const scrollElement = document.scrollingElement || document.body;
    const settings = useSettings()


    const theme = useMemo(() => createTheme({
        palette: {
            mode: darkMode ? 'dark' : 'light',
            primary: {main: '#e03e3e'},
            background: {
                default: darkMode ? '#121212' : '#fff',
                paper: darkMode ? '#1E1E1E' : '#fff',
            },
        },
    }), [darkMode]);

    const handleSubmit = (e: ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubreddit(subreddit);
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setSubreddit(e.target.value);
    };

    const scrollToTop = () => scrollElement.scrollTop = 0;
    const scrollToBottom = () => scrollElement.scrollTop = scrollElement.scrollHeight;
    const toggleDarkMode = () => setDarkMode(prev => {
        localStorage.setItem('darkMode', String(!prev));
        return !prev;
    });

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <div className="App">
                <div style={{display: "flex", justifyContent: "end", padding: "1rem"}}>
                    <SettingsMenu darkMode={settings.darkMode} toggleDarkMode={settings.toggleDarkMode}
                                  rememberLast={settings.rememberLast} setRememberLast={settings.setRememberLast}
                                  saveHistory={settings.saveHistory} setSaveHistory={settings.setSaveHistory}/>
                </div>

                <form className="form" onSubmit={handleSubmit}>
                    <TextField
                        inputRef={inputRef}
                        variant="outlined"
                        value={subreddit}
                        onChange={handleInputChange}
                        label="Subreddit"
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    {loading && <CircularProgress size={20}/>}
                                </InputAdornment>
                            )
                        }}
                    />
                    <Button type="submit" variant="contained" color="primary" disabled={loading}>
                        {loading ? "Searching..." : "Search"}
                    </Button>

                    <FormControl variant="outlined" size="small">
                        <InputLabel>Sort</InputLabel>
                        <Select value={sort} onChange={e => setSort(e.target.value)} label="Sort">
                            <MenuItem value="hot">Hot</MenuItem>
                            <MenuItem value="new">New</MenuItem>
                            <MenuItem value="top">Top</MenuItem>
                            <MenuItem value="rising">Rising</MenuItem>
                        </Select>
                    </FormControl>
                </form>

                {searchHistory.length > 0 && (
                    <Box mt={2} mb={2} display="flex" flexDirection="column" alignItems="center">
                        <Box display="flex" justifyContent="space-between" width="100%" maxWidth="500px">
                            <Typography variant="body2" color="text.secondary">Recent Searches:</Typography>
                            <Button size="small" onClick={clearHistory}>Clear</Button>
                        </Box>
                        <Box mt={1} sx={{display: "flex", flexWrap: "wrap", gap: 1, maxWidth: "500px"}}>
                            {searchHistory.map(sub => (
                                <Chip key={sub} label={sub} onClick={() => setSubreddit(sub)} clickable/>
                            ))}
                        </Box>
                    </Box>
                )}

                {error && <StatusMessage type="error" message={error}/>}

                <div className="container">
                    <InfiniteScroll
                        className="grid"
                        dataLength={posts.length}
                        next={fetchNextPage}
                        hasMore={true}
                        loader={loading && <><CircularProgress/><h1 className="load-text">Loading...</h1></>}
                    >
                        {loading && posts.length === 0
                            ? [...Array(5)].map((_, i) => <PostSkeleton key={i}/>)
                            : posts.map(post => <Item key={post.id} data={post}/>)
                        }
                    </InfiniteScroll>
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
