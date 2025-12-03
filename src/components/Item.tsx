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
    Tooltip
} from "@mui/material";
import {NavigateBefore, NavigateNext, Web} from "@mui/icons-material";
import { IItemsProps } from "../App";
import { useState, useRef } from "react";

interface MediaItem {
    id: string;
    src: string;
    originalSrc: string;
    gifSrc: string | null;
    caption: string;
    type: "image" | "video" | "gif";
}

export default function Item({ data }: IItemsProps) {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

    const videoRef = useRef<HTMLVideoElement>(null);
    const [isGifPlaying, setIsGifPlaying] = useState(true);

    const videoLink = data.secure_media_embed?.media_domain_url;
    const image_src = data.url_overridden_by_dest;
    const fallback_url = data.url;
    const preview = data.preview?.images?.[0]?.source?.url;

    const getActualGifUrl = (url: string): string | null => {
        if (!url) return null;

        if (/\.gif$/i.test(url)) return url;
        if (/\.gifv$/i.test(url)) return url.replace(/\.gif$/i, ".mp4");
        if (/preview\.redd\.it/.test(url)) {
            const match = url.match(/\/preview\/([^?]+)/);
            if (match) return `https://i.redd.it/${match[1].replace(/\..+$/, ".gif")}`;
        }
        return null;
    };

    const getMediaItems = (): MediaItem[] => {
        const items: MediaItem[] = [];

        if (videoLink) {
            items.push({ id: "video", src: videoLink, originalSrc: videoLink, gifSrc: null, caption: data.title, type: "video" });
            return items;
        }

        const url = image_src || fallback_url;
        const actualGifUrl = getActualGifUrl(url);

        if (actualGifUrl) {
            items.push({ id: "gif", src: actualGifUrl, originalSrc: url, gifSrc: actualGifUrl, caption: data.title, type: "gif" });
            return items;
        }

        if (data.is_gallery && data.media_metadata) {
            data.gallery_data?.items.forEach((item) => {
                const mediaId = item.media_id;
                const mediaData = data.media_metadata?.[mediaId];
                if (!mediaData) return;

                const mimeType = mediaData.m?.split("/")[0];
                let mediaType: "image" | "video" | "gif" = "image";
                if (mimeType === "video") mediaType = "video";
                else if (mimeType === "image" && /\.gif$/i.test(mediaData.s?.u || "")) mediaType = "gif";

                const source = mediaData.s?.u || mediaData.p?.at(-1)?.u;
                const gifSource = mediaType === "image" ? source?.replace(/preview;/g, "&") : "";
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

        if (url) items.push({ id: "image", src: url, originalSrc: url, gifSrc: null, caption: data.title, type: "image" });

        return items;
    };

    const mediaItems = getMediaItems();
    const isGallery = data.is_gallery && mediaItems.length > 1;

    const openLightbox = (index: number) => {
        setCurrentMediaIndex(index);
        setLightboxOpen(true);
        setIsGifPlaying(true);
    };

    const closeLightbox = () => setLightboxOpen(false);

    const navigateMedia = (direction: "prev" | "next") => {
        setCurrentMediaIndex((prev) => {
            const newIndex = direction === "prev" ? (prev > 0 ? prev - 1 : mediaItems.length - 1) : (prev < mediaItems.length - 1 ? prev + 1 : 0);
            setIsGifPlaying(true);
            return newIndex;
        });
    };

    const renderMedia = (item: MediaItem, style?: React.CSSProperties) => {
        if (item.type === "video") {
            return (
                <div style={{ position: "relative", paddingBottom: "56.25%", height: "100%", overflow: "hidden", borderRadius: 8 }}>
                    <iframe src={item.src} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }} allowFullScreen title={item.caption} />
                </div>
            );
        }

        if (item.type === "gif") {
            return (
                <div style={{ position: "relative", ...style }}>
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: 8 }}
                        poster={item.src.replace(/\.(mp4|gif)$/i, ".gif")}
                        onError={(e) => {
                            const target = e.target as HTMLVideoElement;
                            if (target.src !== item.originalSrc) target.src = item.originalSrc;
                        }}
                    >
                        <source src={item.gifSrc || item.src} type={item.src.endsWith(".mp4") ? "video/mp4" : "image/gif"} />
                    </video>
                    <div style={{ position: "absolute", bottom: 8, right: 8, backgroundColor: "rgba(0,0,0,0.7)", color: "white", padding: "4px 8px", borderRadius: 6, fontSize: "0.75rem" }}>GIF</div>
                </div>
            );
        }

        return <CardMedia component="img" src={item.src} alt={item.caption} style={{ opacity: 0, transition: "opacity 0.7s", borderRadius: 8, ...style }} onLoad={(e) => e.currentTarget.classList.add("opacity-full")} />;
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
            }}
        >
            <div
                onClick={(e) => {
                    if (mediaItems.length > 0) {
                        e.preventDefault();
                        e.stopPropagation();
                        openLightbox(0);
                    }
                }}
            >
                <CardActionArea href={"https://reddit.com" + data.permalink} target="_blank" rel="noreferrer">
                    <CardContent sx={{ pb: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, opacity: 0.8, fontSize: "0.85rem" }}>
                            <span>{data?.ups}{data?.ups > "1000" ? "k" : ""}</span>
                            <span style={{ fontWeight: 600 }}>r/{data?.subreddit}</span>
                            <span>•</span>
                            <span>u/{data?.author}</span>
                            <span>•</span>
                            <span>{new Date(data?.created_utc * 1000).toLocaleDateString()}</span>
                        </div>

                        <Typography gutterBottom component="h1" variant="h5" color="text.primary">
                            {data.title}
                        </Typography>

                        {mediaItems.length === 0 ? (
                            <div style={{ backgroundColor: "background.default", height: 200, borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Typography variant="body2" color="text.secondary">No media available</Typography>
                            </div>
                        ) : isGallery ? (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 2, position: "relative", borderRadius: 2, overflow: "hidden", height: "100%", paddingBottom: "2rem" }}>
                                {mediaItems.slice(0, 1).map((item, index) => (
                                    <div key={item.id} style={{ height: "100%", width: "100%" }} onClick={(e) => { e.preventDefault(); e.stopPropagation(); openLightbox(index); }}>
                                        {renderMedia(item, { width: "100%", height: "100%" })}
                                    </div>
                                ))}
                                {mediaItems.length > 0 && <div style={{ position: "absolute", bottom: 8, right: 8, backgroundColor: "rgba(0,0,0,0.65)", color: "white", padding: "4px 8px", borderRadius: 6, fontSize: "0.75rem", backdropFilter: "blur(3px)" }}>+{mediaItems.length} in total</div>}
                            </div>
                        ) : (
                            <>
                                {renderMedia(mediaItems[0], { width: "100%", height: "100%", cursor: mediaItems.length > 0 ? "pointer" : "default" })}
                                <a href={"https://reddit.com" + data.permalink} target="_blank" rel="noreferrer" style={{ color: "inherit", opacity: 0.6 }}>
                                    {data?.num_comments} comment{data?.num_comments !== "1" ? "s" : ""}
                                </a>
                            </>
                        )}
                    </CardContent>
                </CardActionArea>
            </div>

            {/* Lightbox Dialog */}
            <Dialog open={lightboxOpen} onClose={closeLightbox} maxWidth="lg" fullWidth>
                <DialogContent>
                    <Typography variant="subtitle1">{mediaItems[currentMediaIndex].caption}</Typography>
                    <div style={{ position: "relative", height: "70vh", width: "100%", overflow: "hidden" }}>
                        {mediaItems[currentMediaIndex].type === "video" ? (
                            <iframe src={mediaItems[currentMediaIndex].src} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }} allowFullScreen title={mediaItems[currentMediaIndex].caption} />
                        ) : mediaItems[currentMediaIndex].type === "gif" ? (
                            <img src={mediaItems[currentMediaIndex].gifSrc || mediaItems[currentMediaIndex].src} style={{ maxHeight: "70vh", maxWidth: "100%", height: "100%" }} />
                        ) : (
                            <img src={mediaItems[currentMediaIndex].src} alt={mediaItems[currentMediaIndex].caption} style={{ height: "100%" }} onError={(e) => { const t = e.target as HTMLImageElement; t.onerror = null; t.src = "https://pngimg.com/uploads/question_mark/question_mark_PNG1.png"; }} />
                        )}

                        {mediaItems.length > 1 && (
                            <>
                                <IconButton onClick={() => navigateMedia("prev")} sx={{ position: "absolute", top: "50%", left: 16, transform: "translateY(-50%)", bgcolor: "rgba(0,0,0,0.5)", color: "white", "&:hover": { bgcolor: "rgba(0,0,0,0.7)" } }}>
                                    <NavigateBefore />
                                </IconButton>
                                <IconButton onClick={() => navigateMedia("next")} sx={{ position: "absolute", top: "50%", right: 16, transform: "translateY(-50%)", bgcolor: "rgba(0,0,0,0.5)", color: "white", "&:hover": { bgcolor: "rgba(0,0,0,0.7)" } }}>
                                    <NavigateNext />
                                </IconButton>
                            </>
                        )}
                    </div>
                </DialogContent>
                <DialogActions>
                    <Typography variant="caption" color="text.secondary">{currentMediaIndex + 1} of {mediaItems.length}</Typography>
                    <Tooltip title="Go to post" placement="top">
                        <Button color="primary" href={"https://reddit.com" + data.permalink} target="_blank" rel="noreferrer"><Web /></Button>
                    </Tooltip>
                    <Button onClick={closeLightbox} color="primary">Close</Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
}


