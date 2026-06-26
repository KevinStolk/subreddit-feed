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
    CircularProgress,
    Snackbar
} from "@mui/material";
import {NavigateBefore, NavigateNext, Web, ThumbUpAlt, ContentCopy, Bookmark, BookmarkBorder, Download} from "@mui/icons-material";
import {IItemsProps} from "../../App";
import React, {useState, useMemo, useCallback, memo} from "react";
import {Comments} from "../molecules/Comments";
import {useComments} from "../../hooks/useComments";
import {HLSVideoPlayer} from "../atoms/HLSVideoPlayer";
import {api} from "../../services/api";

interface MediaItem {
    id: string;
    src: string;
    thumbnailSrc: string | null;
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
    isBookmarked?: boolean;
    onToggleBookmark?: () => void;
}

export const Item = memo(({data, blurNsfw = false, isBookmarked = false, onToggleBookmark}: ItemProps) => {
    const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
    const [currentMediaIndex, setCurrentMediaIndex] = useState<number>(0);
    const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
    const [snackbarMessage, setSnackbarMessage] = useState<string>("");
    const [nsfwRevealed, setNsfwRevealed] = useState<boolean>(false);
    const [downloading, setDownloading] = useState<boolean>(false);

    const isNsfw = data.over_18 === true;
    const shouldBlur = blurNsfw && isNsfw && !nsfwRevealed;

    const postUrl = `https://reddit.com${data.permalink}`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(postUrl).then(() => {
            setSnackbarMessage("Link copied to clipboard!");
            setSnackbarOpen(true);
        });
    };

    const handleBookmark = () => {
        if (onToggleBookmark) {
            onToggleBookmark();
            setSnackbarMessage(isBookmarked ? "Bookmark removed" : "Post bookmarked");
            setSnackbarOpen(true);
        }
    };

    const slugify = (text: string): string =>
        text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "reddit-post";

    const getDownloadInfo = (item: MediaItem): { url: string; filename: string } | null => {
        if (item.type === "video") return null;

        let url: string;
        let ext: string;
        if (item.type === "gif" || item.src.includes(".gif")) {
            url = item.gifSrc || item.originalSrc || item.src;
            ext = "gif";
        } else {
            url = item.originalSrc || item.src;
            const match = url.split("?")[0].match(/\.(jpe?g|png|webp|gif)$/i);
            ext = match ? match[1].toLowerCase() : "jpg";
        }

        if (!url) return null;
        return {url, filename: `${slugify(item.caption)}.${ext}`};
    };

    const triggerBlobDownload = (blob: Blob, filename: string) => {
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(objectUrl);
    };

    const handleDownload = async () => {
        const item = mediaItems[currentMediaIndex];

        if (item.type === "video" && item.src.includes("v.redd.it")) {
            setDownloading(true);
            try {
                const response = await api.get("download", {
                    params: {url: item.src, title: item.caption},
                    responseType: "blob",
                });
                triggerBlobDownload(response.data, `${slugify(item.caption)}.mp4`);
                setSnackbarMessage("Download started");
                setSnackbarOpen(true);
            } catch {
                setSnackbarMessage("Couldn't download video. Opening in new tab...");
                setSnackbarOpen(true);
                window.open(item.src, "_blank", "noopener,noreferrer");
            } finally {
                setDownloading(false);
            }
            return;
        }

        const info = getDownloadInfo(item);
        if (!info) {
            setSnackbarMessage("This media can't be downloaded directly. Opening source...");
            setSnackbarOpen(true);
            window.open(item.src, "_blank", "noopener,noreferrer");
            return;
        }

        setDownloading(true);
        try {
            const response = await fetch(info.url);
            if (!response.ok) {
                // Cross-origin or network failure: fall back to opening the file.
                setSnackbarMessage("Couldn't download directly. Opening in new tab...");
                setSnackbarOpen(true);
                window.open(info.url, "_blank", "noopener,noreferrer");
                return;
            }
            triggerBlobDownload(await response.blob(), info.filename);
            setSnackbarMessage("Download started");
            setSnackbarOpen(true);
        } catch {
            setSnackbarMessage("Couldn't download directly. Opening in new tab...");
            setSnackbarOpen(true);
            window.open(info.url, "_blank", "noopener,noreferrer");
        } finally {
            setDownloading(false);
        }
    };

    const videoLink = data.secure_media_embed?.media_domain_url;
    const image_src = data.url_overridden_by_dest;
    const fallback_url = data.url;
    const {comments, loading, loadMore} = useComments(data.subreddit, data.id, lightboxOpen);

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

    const getThumbnailUrl = useCallback((): string | null => {
        const resolutions = data.preview?.images?.[0]?.resolutions;
        if (resolutions && resolutions.length > 0) {
            // Find a resolution around 320-640px
            const targetWidth = 480;
            const sorted = [...resolutions].sort((a, b) =>
                Math.abs(a.width - targetWidth) - Math.abs(b.width - targetWidth)
            );
            return sorted[0].url.replace(/&amp;/g, '&');
        }

        // Fallback to thumbnail if it's a valid URL
        if (data.thumbnail && data.thumbnail.startsWith('http')) {
            return data.thumbnail;
        }

        return null;
    }, [data.preview, data.thumbnail]);

    const mediaItems = useMemo((): MediaItem[] => {
        const items: MediaItem[] = [];
        const thumbnailUrl = getThumbnailUrl();

        if (videoLink) {
            items.push({
                id: `${data.id}-video`,
                src: videoLink,
                thumbnailSrc: thumbnailUrl,
                originalSrc: videoLink,
                gifSrc: null,
                caption: data.title,
                type: "video"
            });
            return items;
        }

        const redditVideoUrl = data.media?.reddit_video?.fallback_url;
        const redditHlsUrl = data.media?.reddit_video?.hls_url;
        if (data.is_video && redditVideoUrl) {
            items.push({
                id: `${data.id}-reddit-video`,
                src: redditVideoUrl,
                thumbnailSrc: thumbnailUrl,
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
                thumbnailSrc: thumbnailUrl,
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

                let galleryThumbnail: string | null = null;
                if (mediaData.p && mediaData.p.length > 0) {
                    const targetWidth = 480;
                    const sorted = [...mediaData.p].sort((a, b) =>
                        Math.abs(a.width - targetWidth) - Math.abs(b.width - targetWidth)
                    );
                    galleryThumbnail = sorted[0].u.replace(/&amp;/g, '&');
                }

                if (source) {
                    items.push({
                        id: mediaId,
                        src: gifUrl || "",
                        thumbnailSrc: galleryThumbnail,
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
            thumbnailSrc: thumbnailUrl,
            originalSrc: url,
            gifSrc: null,
            caption: data.title,
            type: "img",
            loading: "lazy"
        });

        return items;
    }, [data, videoLink, image_src, fallback_url, getActualGifUrl, getThumbnailUrl]);

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

    const renderMedia = (item: MediaItem, style?: React.CSSProperties, useThumbnail: boolean = false) => {
        if (item.type === "video") {
            if (useThumbnail && item.thumbnailSrc) {
                return (
                    <div style={{position: "relative", ...style}}>
                        <img
                            src={item.thumbnailSrc}
                            alt={item.caption}
                            style={{width: "100%", height: "100%", objectFit: "cover", borderRadius: 8}}
                            loading="lazy"
                        />
                        <Box sx={{
                            position: "absolute",
                            bottom: 8,
                            right: 8,
                            backgroundColor: "primary.main",
                            color: "white",
                            padding: "4px 8px",
                            fontSize: "0.75rem",
                            fontWeight: "600"
                        }}>VIDEO</Box>
                    </div>
                );
            }
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
            const imageSrc = useThumbnail && item.thumbnailSrc ? item.thumbnailSrc : (item.gifSrc || item.src);
            return (
                <div style={{position: "relative", ...style}}>
                    <img
                        className={`post-image-${item.id}`}
                        style={{width: "100%", height: "100%", objectFit: "contain", borderRadius: 8}}
                        onError={(e) => {
                            const target = e.target as HTMLVideoElement;
                            if (target.src !== item.originalSrc) target.src = item.originalSrc;
                        }}
                        src={imageSrc}
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

        const imageSrc = useThumbnail && item.thumbnailSrc ? item.thumbnailSrc : item.src;
        return <CardMedia component={item.type === 'gif' ? 'img' : item.type} src={imageSrc} alt={item.caption}
                          style={{opacity: 0, transition: "opacity 0.7s", borderRadius: 8, ...style}}
                          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              // On error, try full resolution before fallback
                              if (useThumbnail && item.thumbnailSrc && target.src === item.thumbnailSrc) {
                                  target.src = item.src;
                              } else {
                                  target.src = 'https://pngimg.com/uploads/question_mark/question_mark_PNG1.png';
                                  target.width = 155;
                              }
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
                            data.selftext ? (
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                        display: "-webkit-box",
                                        WebkitLineClamp: 6,
                                        WebkitBoxOrient: "vertical",
                                        overflow: "hidden",
                                        whiteSpace: "pre-wrap",
                                    }}
                                >
                                    {data.selftext}
                                </Typography>
                            ) : null
                        ) : isGallery ? (
                            <>
                                <div style={{position: "relative"}}>
                                    <div
                                        className="card-media"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            openLightbox(0);
                                        }}
                                    >
                                        {renderMedia(mediaItems[0], {width: "100%", height: "100%"}, true)}
                                    </div>
                                    <Box sx={{
                                        position: "absolute",
                                        bottom: 8,
                                        right: 8,
                                        backgroundColor: "primary.main",
                                        color: "white",
                                        padding: "4px 8px",
                                        fontSize: "0.75rem",
                                        fontWeight: "600",
                                    }}>+{mediaItems.length} in total</Box>
                                </div>
                                <Box sx={{
                                    mt: 0.5,
                                    '& span': {color: 'inherit', textDecoration: 'none'},
                                    '& span:hover': {color: "primary.main", textDecoration: 'underline', transition: "color 0.2s ease"}
                                }}>
                                    <span>{data?.num_comments} comment{data?.num_comments !== "1" ? "s" : ""}</span>
                                </Box>
                            </>
                        ) : (
                            <>
                                <div className="card-media" style={{cursor: "pointer"}}>
                                    {renderMedia(mediaItems[0], {width: "100%", height: "100%"}, true)}
                                </div>
                                <Box sx={{
                                    mt: 0.5,
                                    '& span': {color: 'inherit', textDecoration: 'none'},
                                    '& span:hover': {color: "primary.main", textDecoration: 'underline', transition: "color 0.2s ease"}
                                }}>
                                    <span>{data?.num_comments} comment{data?.num_comments !== "1" ? "s" : ""}</span>
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
                                {/* <Box sx={{display: "flex", gap: 2, mb: 1}}>
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
                                </Box> */}

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
                    {onToggleBookmark && (
                        <Tooltip title={isBookmarked ? "Remove bookmark" : "Add bookmark"} placement="top">
                            <IconButton color="primary" onClick={handleBookmark}>
                                {isBookmarked ? <Bookmark/> : <BookmarkBorder/>}
                            </IconButton>
                        </Tooltip>
                    )}
                    <Tooltip title="Download" placement="top">
                        <span>
                            <IconButton color="primary" onClick={handleDownload} disabled={downloading}>
                                {downloading ? <CircularProgress size={20}/> : <Download/>}
                            </IconButton>
                        </span>
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
