import {useCallback, useEffect, useRef, useState} from "react";
import {Dialog, DialogContent, DialogTitle, DialogActions, Button, Box, Typography, IconButton} from "@mui/material";
import {Casino, Close, OpenInNew} from "@mui/icons-material";
import {IPostData} from "../../hooks/useSubreddit";

interface BookmarkRouletteProps {
    open: boolean;
    onClose: () => void;
    bookmarks: IPostData[];
    onSelect: (post: IPostData) => void;
}

const TILE_W = 150;
const GAP = 12;
const STRIDE = TILE_W + GAP;
const REEL_BEFORE = 45;
const REEL_AFTER = 12;
const WINNER_INDEX = REEL_BEFORE;
const SPIN_MS = 5500;

const getTileImage = (post: IPostData): string | null => {
    const resolutions = post.preview?.images?.[0]?.resolutions;
    if (resolutions && resolutions.length > 0) {
        const target = 216;
        const sorted = [...resolutions].sort(
            (a, b) => Math.abs(a.width - target) - Math.abs(b.width - target)
        );
        return sorted[0].url.replace(/&amp;/g, "&");
    }
    if (post.thumbnail && post.thumbnail.startsWith("http")) return post.thumbnail;
    if (post.media_metadata) {
        const first = Object.values(post.media_metadata)[0];
        const u = first?.p?.[0]?.u || first?.s?.u;
        if (u) return u.replace(/&amp;/g, "&");
    }
    return null;
};

// Stable per-post accent colour derived from the id.
const accentColor = (id: string): string => {
    const hue = [...id].reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % 360;
    return `hsl(${hue}, 70%, 55%)`;
};

const RouletteTile = ({post, highlighted}: {post: IPostData; highlighted: boolean}) => {
    const image = getTileImage(post);
    const accent = accentColor(post.id);
    return (
        <Box
            sx={{
                flex: `0 0 ${TILE_W}px`,
                width: TILE_W,
                height: TILE_W,
                borderRadius: 1.5,
                overflow: "hidden",
                position: "relative",
                bgcolor: "background.default",
                border: "1px solid rgba(255,255,255,0.08)",
                borderBottom: `4px solid ${accent}`,
                boxShadow: highlighted ? `0 0 24px 4px ${accent}` : "none",
                transition: "box-shadow 0.3s ease",
            }}
        >
            {image ? (
                <Box
                    component="img"
                    src={image}
                    alt={post.title}
                    loading="lazy"
                    sx={{width: "100%", height: "100%", objectFit: "cover"}}
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                        e.currentTarget.style.display = "none";
                    }}
                />
            ) : (
                <Box sx={{display: "flex", alignItems: "center", justifyContent: "center", height: "100%", p: 1}}>
                    <Typography variant="caption" align="center" color="text.secondary"
                                sx={{display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden"}}>
                        {post.title}
                    </Typography>
                </Box>
            )}
            <Box
                sx={{
                    position: "absolute",
                    bottom: 4,
                    left: 0,
                    right: 0,
                    px: 0.5,
                    textAlign: "center",
                }}
            >
                <Typography
                    variant="caption"
                    sx={{
                        display: "inline-block",
                        maxWidth: "100%",
                        px: 0.5,
                        borderRadius: 0.5,
                        bgcolor: "rgba(0,0,0,0.6)",
                        color: "white",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                >
                    r/{post.subreddit}
                </Typography>
            </Box>
        </Box>
    );
};

export const BookmarkRoulette = ({open, onClose, bookmarks, onSelect}: BookmarkRouletteProps) => {
    const viewportRef = useRef<HTMLDivElement>(null);
    const [reel, setReel] = useState<IPostData[]>([]);
    const [offset, setOffset] = useState(0);
    const [animate, setAnimate] = useState(false);
    const [rolling, setRolling] = useState(false);
    const [winner, setWinner] = useState<IPostData | null>(null);

    const pickRandom = useCallback(
        () => bookmarks[Math.floor(Math.random() * bookmarks.length)],
        [bookmarks]
    );

    const startRoll = useCallback(() => {
        if (bookmarks.length === 0) return;

        const chosen = pickRandom();
        const sequence: IPostData[] = [];
        for (let i = 0; i < REEL_BEFORE; i++) sequence.push(pickRandom());
        sequence.push(chosen);
        for (let i = 0; i < REEL_AFTER; i++) sequence.push(pickRandom());

        setWinner(null);
        setRolling(true);
        setReel(sequence);

        setAnimate(false);
        setOffset(0);

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const viewportWidth = viewportRef.current?.clientWidth ?? 0;
                const centerX = viewportWidth / 2;
                const jitter = (Math.random() - 0.5) * TILE_W * 0.7;
                const target = centerX - (WINNER_INDEX * STRIDE + TILE_W / 2 + jitter);
                setAnimate(true);
                setOffset(target);
            });
        });
    }, [bookmarks.length, pickRandom]);

    // Auto-spin when the dialog opens.
    useEffect(() => {
        if (open) {
            startRoll();
        } else {
            setReel([]);
            setWinner(null);
            setRolling(false);
            setOffset(0);
            setAnimate(false);
        }
    }, [open, startRoll]);

    const handleTransitionEnd = () => {
        if (rolling) {
            setRolling(false);
            setWinner(reel[WINNER_INDEX] ?? null);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{display: "flex", alignItems: "center", gap: 1}}>
                <Casino color="primary"/>
                Bookmark Roulette
                <Box sx={{flexGrow: 1}}/>
                <IconButton onClick={onClose} size="small">
                    <Close/>
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Box
                    ref={viewportRef}
                    sx={{
                        position: "relative",
                        height: TILE_W + 24,
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        borderRadius: 2,
                        bgcolor: "rgba(0,0,0,0.25)",
                        py: 1.5,
                    }}
                >
                    <Box sx={{position: "absolute", top: 0, bottom: 0, left: "50%", width: "2px",
                        transform: "translateX(-1px)", bgcolor: "primary.main", zIndex: 3, opacity: 0.9}}/>
                    <Box sx={{position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 0, height: 0,
                        borderLeft: "8px solid transparent", borderRight: "8px solid transparent",
                        borderTop: "10px solid", borderTopColor: "primary.main", zIndex: 4}}/>
                    <Box sx={{position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 0, height: 0,
                        borderLeft: "8px solid transparent", borderRight: "8px solid transparent",
                        borderBottom: "10px solid", borderBottomColor: "primary.main", zIndex: 4}}/>

                    <Box
                        onTransitionEnd={handleTransitionEnd}
                        sx={{
                            display: "flex",
                            gap: `${GAP}px`,
                            willChange: "transform",
                            transform: `translateX(${offset}px)`,
                            transition: animate ? `transform ${SPIN_MS}ms cubic-bezier(0.08, 0.7, 0.08, 1)` : "none",
                        }}
                    >
                        {reel.map((post, i) => (
                            <RouletteTile
                                key={`${post.id}-${i}`}
                                post={post}
                                highlighted={!rolling && winner !== null && i === WINNER_INDEX}
                            />
                        ))}
                    </Box>
                </Box>

                <Box sx={{mt: 2, minHeight: 64, textAlign: "center"}}>
                    {winner ? (
                        <>
                            <Typography variant="overline" color="text.secondary">You rolled</Typography>
                            <Typography variant="h6" sx={{
                                display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                            }}>
                                {winner.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                r/{winner.subreddit} • u/{winner.author}
                            </Typography>
                        </>
                    ) : (
                        <Typography variant="body1" color="text.secondary" sx={{mt: 2}}>
                            {rolling ? "Rolling…" : " "}
                        </Typography>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                {winner && (
                    <Button
                        startIcon={<OpenInNew/>}
                        onClick={() => onSelect(winner)}
                    >
                        View post
                    </Button>
                )}
                <Button
                    variant="contained"
                    startIcon={<Casino/>}
                    onClick={startRoll}
                    disabled={rolling || bookmarks.length === 0}
                >
                    {winner ? "Roll again" : "Roll"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};