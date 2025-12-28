import {
    Card,
    CardActionArea,
    CardContent,
    Typography,
    Dialog,
    DialogContent,
    DialogActions,
    Button,
    CardMedia,
    IconButton,
    Tooltip, Box,
    Chip, CircularProgress,
    Snackbar
} from "@mui/material";
import {NavigateBefore, NavigateNext, Web, ThumbUpAlt, Share, ContentCopy} from "@mui/icons-material";
import {IItemsProps} from "../../App";
import React, {useEffect, useState, useMemo, useCallback, memo} from "react";
import {Comments} from "../molecules/Comments";
import {useComments} from "../../hooks/useComments";
import {HLSVideoPlayer} from "../atoms/HLSVideoPlayer";

interface MediaItem {
    id: string;
    src: string;
    originalSrc: string;
    gifSrc: string | null;
    hlsSrc?: string | null;
    caption: string;
    type: "img" | "video" | "gif" | "image";
    loading?: "lazy" | "eager";
}

interface ItemProps {
    data: IItemsProps["data"];
    blurNsfw?: boolean;
}

export const Item = memo(({data, blurNsfw = false}: ItemProps) => {
    const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
    const [currentMediaIndex, setCurrentMediaIndex] = useState<number>(0);
    const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
    const [snackbarMessage, setSnackbarMessage] = useState<string>("");
    const [nsfwRevealed, setNsfwRevealed] = useState<boolean>(false);

    const isNsfw = data.over_18 === true;
    const shouldBlur = blurNsfw && isNsfw && !nsfwRevealed;

    const postUrl = `https://reddit.com${data.permalink}`;

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: data.title,
                    text: `Check out this post from r/${data.subreddit}`,
                    url: postUrl,
                });
            } catch (err) {
                if ((err as Error).name !== 'AbortError') {
                    handleCopyLink();
                }
            }
        } else {
            handleCopyLink();
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(postUrl).then(() => {
            setSnackbarMessage("Link copied to clipboard!");
            setSnackbarOpen(true);
        });
    };

    const videoLink = data.secure_media_embed?.media_domain_url;
    const image_src = data.url_overridden_by_dest;
    const fallback_url = data.url;
    const {comments, loading, sort, setSort, loadMore} = useComments(data.subreddit, data.id, lightboxOpen);

    const getActualGifUrl = useCallback((url: string): string | null => {
        if (!url) return null;

        if (/\.gif$/i.test(url)) return url;
        if (/\.gifv$/i.test(url)) return url.replace(/\.gif$/i, ".mp4");
        if (/preview\.redd\.it/.test(url)) {
            const match = url.match(/\/preview\/([^?]+)/);
            if (match) return `https://i.redd.it/${match[1].replace(/\..+$/, ".gif")}`;
        }
        return null;
    }, []);

    const mediaItems = useMemo((): MediaItem[] => {
        const items: MediaItem[] = [];

        if (videoLink) {
            items.push({
                id: `${data.id}-video`,
                src: videoLink,
                originalSrc: videoLink,
                gifSrc: null,
                caption: data.title,
                type: "video"
            });
            return items;
        }

        // Check for Reddit native video (v.redd.it) - use HLS for audio support
        const redditVideoUrl = data.media?.reddit_video?.fallback_url;
        const redditHlsUrl = data.media?.reddit_video?.hls_url;
        if (data.is_video && redditVideoUrl) {
            items.push({
                id: `${data.id}-reddit-video`,
                src: redditVideoUrl,
                originalSrc: redditVideoUrl,
                hlsSrc: redditHlsUrl || null,
                gifSrc: null,
                caption: data.title,
                type: "video"
            });
            return items;
        }

        const url = image_src || fallback_url;
        const actualGifUrl = getActualGifUrl(url);

        if (actualGifUrl) {
            items.push({
                id: `${data.id}-gif`,
                src: actualGifUrl,
                originalSrc: url,
                gifSrc: actualGifUrl,
                caption: data.title,
                type: "gif",
                loading: "lazy"
            });
            return items;
        }

        if (data.is_gallery && data.media_metadata) {
            data.gallery_data?.items.forEach((item) => {
                const mediaId = item.media_id;
                const mediaData = data.media_metadata?.[mediaId];

                if (!mediaData) return;

                const mimeType = mediaData.m?.split("/")[0];
                let mediaType: "img" | "video" | "gif" = "img";
                if (mimeType === "video") {
                    mediaType = "video";
                } else if (mimeType === "img" && /\.gif$/i.test(mediaData.s?.u || "")) {
                    mediaType = "gif";
                }

                const source = mediaData.s?.u || mediaData.p?.at(-1)?.u;
                const gifSource = mediaType === "img" ? source?.replace(/preview;/g, "&") : "";
                const gifUrl = gifSource?.replace("preview.redd.it", "i.redd.it");

                if (source) {
                    items.push({
                        id: mediaId,
                        src: gifUrl || "",
                        originalSrc: source.replace(/&amp;/g, "&"),
                        gifSrc: gifUrl || "",
                        caption: item.caption || data.title,
                        type: mediaType
                    });
                }
            });
            return items;
        }

        if (url) items.push({
            id: `${data.id}-img`,
            src: url,
            originalSrc: url,
            gifSrc: null,
            caption: data.title,
            type: "img",
            loading: "lazy"
        });

        return items;
    }, [data, videoLink, image_src, fallback_url, getActualGifUrl]);

    const isGallery = data.is_gallery && mediaItems.length > 1;

    const openLightbox = (index: number) => {
        setCurrentMediaIndex(index);
        setLightboxOpen(true);
    };

    const closeLightbox = () => setLightboxOpen(false);

    const navigateMedia = (direction: "prev" | "next") => {
        setCurrentMediaIndex((prev) => {
            return direction === "prev" ? (prev > 0 ? prev - 1 : mediaItems.length - 1) : (prev < mediaItems.length - 1 ? prev + 1 : 0);
        });
    };

    const renderMedia = (item: MediaItem, style?: React.CSSProperties) => {
        if (item.type === "video") {
            if (item.src.includes("v.redd.it")) {
                return (
                    <div style={{
                        position: "relative",
                        paddingBottom: "56.25%",
                        height: "100%",
                        overflow: "hidden",
                        borderRadius: 8
                    }}>
                        <HLSVideoPlayer
                            src={item.src}
                            hlsSrc={item.hlsSrc}
                            title={item.caption}
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                objectFit: "contain"
                            }}
                        />
                    </div>
                );
            }
            return (
                <div style={{
                    position: "relative",
                    paddingBottom: "56.25%",
                    height: "100%",
                    overflow: "hidden",
                    borderRadius: 8
                }}>
                    <iframe src={item.src}
                            style={{position: "absolute", top: 0, left: 0, width: "100%", height: "100%"}}
                            allowFullScreen title={item.caption} loading={"lazy"}/>
                </div>
            );
        }

        if (item.src.includes(".gif")) {
            return (
                <div style={{position: "relative", ...style}}>
                    <img
                        className={`post-image-${item.id}`}
                        style={{width: "100%", height: "100%", objectFit: "contain", borderRadius: 8}}
                        onError={(e) => {
                            const target = e.target as HTMLVideoElement;
                            if (target.src !== item.originalSrc) target.src = item.originalSrc;
                        }}
                        src={item.gifSrc || item.src}
                        alt={item.caption}
                        loading={"lazy"}
                    >
                    </img>
                    <Box sx={{
                        position: "absolute",
                        bottom: 8,
                        right: 8,
                        backgroundColor: "primary.main",
                        color: "white",
                        padding: "4px 8px",
                        fontSize: "0.75rem",
                        fontWeight: "600"
                    }}>GIF
                    </Box>
                </div>
            );
        }

        return <CardMedia component={item.type === 'gif' ? 'img' : item.type} src={item.src} alt={item.caption}
                          style={{opacity: 0, transition: "opacity 0.7s", borderRadius: 8, ...style}}
                          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = 'https://pngimg.com/uploads/question_mark/question_mark_PNG1.png';
                              target.width = 155;
                          }}
                          onLoad={(e: React.SyntheticEvent<HTMLImageElement>) => e.currentTarget.classList.add("opacity-full")}/>;
    };

    return (
        <Card
            sx={{
                width: "100%",
                height: "100%",
                padding: 0,
                overflow: "hidden",
                bgcolor: "background.paper",
                color: "text.primary",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: 2,
                transition: "transform 0.15s ease, box-shadow 0.15s ease",
                "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: 4,
                },
                position: "relative",
            }}
        >
            {shouldBlur && (
                <Box
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setNsfwRevealed(true);
                    }}
                    sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 10,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        backdropFilter: "blur(20px)",
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        cursor: "pointer",
                        borderRadius: 2,
                    }}
                >
                    <Typography variant="h6" color="white" sx={{mb: 1}}>
                        NSFW Content
                    </Typography>
                    <Typography variant="body2" color="rgba(255,255,255,0.7)">
                        Click to reveal
                    </Typography>
                </Box>
            )}
            <div
                onClick={(e) => {
                    if (shouldBlur) return;
                    if (mediaItems.length > 0) {
                        e.preventDefault();
                        e.stopPropagation();
                        openLightbox(0);
                    }
                }}
            >
                <CardActionArea href={"https://reddit.com" + data.permalink} target="_blank" rel="noreferrer">
                    <CardContent sx={{pb: 1}}>
                        <div className="inner-content" style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            flexWrap: "wrap",
                            marginBottom: 8,
                            opacity: 0.8,
                        }}>
                            <IconButton style={{padding: "0"}} aria-label="like" size={"small"} color={"primary"}>
                                <ThumbUpAlt/>
                            </IconButton>
                            <span>{data?.ups}{data?.ups > "1000" ? "k" : ""}</span>
                            <span style={{fontWeight: 600}}>r/{data?.subreddit}</span>
                            <span>•</span>
                            <span>u/{data?.author}</span>
                            <span>•</span>
                            <span>{new Date(data?.created_utc * 1000).toLocaleDateString()}</span>
                        </div>

                        <Typography gutterBottom component="h1" variant="h5" color="text.primary">
                            {data.title}
                        </Typography>

                        {mediaItems.length === 0 ? (
                            <div style={{
                                backgroundColor: "primary.main",
                                height: 200,
                                borderRadius: 2,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}>
                                <Typography variant="body2" color="text.secondary">No media available</Typography>
                            </div>
                        ) : isGallery ? (
                            <div style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 2,
                                position: "relative",
                                borderRadius: 2,
                                overflow: "hidden",
                                height: "100%",
                                paddingBottom: "2rem"
                            }}>
                                {mediaItems.slice(0, 1).map((item, index) => (
                                    <div key={item.id} style={{height: "100%", width: "100%"}} onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        openLightbox(index);
                                    }}>
                                        {renderMedia(item, {width: "100%", height: "100%"})}
                                        <span>
                                            {data?.num_comments} comment{data?.num_comments !== "1" ? "s" : ""}
                                        </span>
                                    </div>
                                ))}
                                {mediaItems.length > 0 && <Box sx={{
                                    position: "absolute",
                                    bottom: 8,
                                    right: 8,
                                    backgroundColor: "primary.main",
                                    color: "white",
                                    padding: "4px 8px",
                                    fontSize: "0.75rem",
                                    fontWeight: "600",
                                }}>+{mediaItems.length} in total</Box>}
                            </div>
                        ) : (
                            <>
                                {renderMedia(mediaItems[0], {
                                    width: "100%",
                                    height: "100%",
                                    cursor: mediaItems.length > 0 ? "pointer" : "default"
                                })}
                                <Box sx={{
                                    '& span': {
                                        color: 'inherit',
                                        textDecoration: 'none'
                                    },
                                    '& span:hover': {
                                        color: "primary.main",
                                        textDecoration: 'underline',
                                        transition: "color 0.2s ease"
                                    }
                                }}>
                                        <span>
                                            {data?.num_comments} comment{data?.num_comments !== "1" ? "s" : ""}
                                        </span>
                                </Box>
                            </>
                        )}
                    </CardContent>
                </CardActionArea>
            </div>

            <Dialog className="lightbox-dialog" open={lightboxOpen} onClose={closeLightbox} maxWidth="lg" fullWidth>
                <DialogContent>
                    <Typography variant="subtitle1">{mediaItems[currentMediaIndex].caption}</Typography>

                    {mediaItems[currentMediaIndex].type === "video" &&
                        <Box sx={{
                            backgroundColor: "primary.main",
                            color: "white",
                            padding: "4px 8px",
                            fontSize: "0.75rem",
                            fontWeight: "600",
                            width: "fit-content",
                        }}
                        >
                            VIDEO
                        </Box>
                    }
                    <div className="dialog-content" style={{width: "100%", overflow: "hidden"}}>
                        {mediaItems[currentMediaIndex].type === "video" ? (
                            <Box sx={{paddingTop: "0.5rem", paddingBottom: "0.5rem", height: "70vh"}}>
                                {mediaItems[currentMediaIndex].src.includes("v.redd.it") ? (
                                    <HLSVideoPlayer
                                        src={mediaItems[currentMediaIndex].src}
                                        hlsSrc={mediaItems[currentMediaIndex].hlsSrc}
                                        title={mediaItems[currentMediaIndex].caption}
                                        style={{width: "100%", height: "100%", objectFit: "contain"}}
                                    />
                                ) : (
                                    <iframe src={mediaItems[currentMediaIndex].src}
                                            style={{width: "100%", height: "100%"}}
                                            allowFullScreen title={mediaItems[currentMediaIndex].caption}
                                            loading={"lazy"}
                                            className="video-iframe"
                                    />
                                )}
                            </Box>
                        ) : (
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    maxHeight: "80vh",
                                }}
                            >
                                <img className={`post-image-${mediaItems[currentMediaIndex].id}`}
                                     src={mediaItems[currentMediaIndex].src} alt={mediaItems[currentMediaIndex].caption}
                                     style={{
                                         maxWidth: "100%",
                                         maxHeight: "80vh",
                                         objectFit: "contain"
                                     }}
                                     loading={"lazy"} onError={(e) => {
                                    const t = e.target as HTMLImageElement;
                                    t.onerror = null;
                                    t.src = "https://pngimg.com/uploads/question_mark/question_mark_PNG1.png";
                                }}/>
                                {mediaItems[currentMediaIndex].src.includes(".gif") ?
                                    <Box sx={{
                                        position: "absolute",
                                        bottom: 8,
                                        right: 8,
                                        backgroundColor: "primary.main",
                                        color: "white",
                                        padding: "4px 8px",
                                        fontSize: "0.75rem"
                                    }}>GIF
                                    </Box>
                                    : ""
                                }
                            </Box>
                        )}

                        {mediaItems.length > 1 && (
                            <>
                                <IconButton onClick={() => navigateMedia("prev")} sx={{
                                    position: "absolute",
                                    top: "50%",
                                    left: 16,
                                    transform: "translateY(-50%)",
                                    bgcolor: "rgba(0,0,0,0.5)",
                                    color: "white",
                                    "&:hover": {bgcolor: "rgba(0,0,0,0.7)"}
                                }}>
                                    <NavigateBefore/>
                                </IconButton>
                                <IconButton onClick={() => navigateMedia("next")} sx={{
                                    position: "absolute",
                                    top: "50%",
                                    right: 16,
                                    transform: "translateY(-50%)",
                                    bgcolor: "rgba(0,0,0,0.5)",
                                    color: "white",
                                    "&:hover": {bgcolor: "rgba(0,0,0,0.7)"}
                                }}>
                                    <NavigateNext/>
                                </IconButton>
                            </>
                        )}
                        {comments.length > 0 ?
                            <Box sx={{pt: 2}}>
                                <Box sx={{display: "flex", gap: 2, mb: 1}}>
                                    <Chip
                                        sx={{
                                            fontWeight: 600,
                                            textTransform: "uppercase",
                                            fontSize: "0.9rem",
                                            backgroundColor: sort === "best" ? "primary.main" : "",
                                            color: "white",
                                        }}
                                        onClick={() => setSort("best")}
                                        label={"Best"}
                                    ></Chip>

                                    <Chip
                                        sx={{
                                            fontWeight: 600,
                                            textTransform: "uppercase",
                                            fontSize: "0.9rem",
                                            backgroundColor: sort === "top" ? "primary.main" : "",
                                            color: "white",
                                        }}
                                        onClick={() => setSort("top")}
                                        label={"Top"}
                                    ></Chip>

                                    <Chip
                                        sx={{
                                            fontWeight: 600,
                                            textTransform: "uppercase",
                                            fontSize: "0.9rem",
                                            backgroundColor: sort === "new" ? "primary.main" : "",
                                            color: "white",
                                        }}
                                        onClick={() => setSort("new")}
                                        label={"New"}
                                    ></Chip>
                                </Box>

                                <Box sx={{
                                    pt: 1
                                }}
                                     onScroll={(e: React.UIEvent<HTMLDivElement>) => {
                                         const target = e.target as HTMLDivElement;
                                         const bottom = target.scrollHeight - target.scrollTop === target.clientHeight;
                                         if (bottom) loadMore();
                                     }}
                                >
                                    {comments.map((c: any, i: number) => (
                                        <Comments key={i} data={c} depth={0}/>
                                    ))}
                                </Box>
                            </Box>
                            :
                            <>
                                {loading ? <CircularProgress size={20}/> : "No comments"}
                            </>
                        }

                    </div>
                </DialogContent>
                <DialogActions>
                    <Typography variant="caption"
                                color="text.secondary">{currentMediaIndex + 1} of {mediaItems.length}</Typography>
                    <Box sx={{flexGrow: 1}}/>
                    <Tooltip title="Share" placement="top">
                        <IconButton color="primary" onClick={handleShare}>
                            <Share/>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Copy link" placement="top">
                        <IconButton color="primary" onClick={handleCopyLink}>
                            <ContentCopy/>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Go to post" placement="top">
                        <Button color="primary" href={postUrl} target="_blank"
                                rel="noreferrer"><Web/></Button>
                    </Tooltip>
                    <Button onClick={closeLightbox} color="primary">Close</Button>
                </DialogActions>
            </Dialog>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                message={snackbarMessage}
            />
        </Card>
    );
});
