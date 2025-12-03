import {
    Card,
    CardActionArea,
    CardContent,
    Typography,
    Dialog,
    DialogContent,
    DialogActions,
    Button,
    CardMedia
} from "@mui/material";
import IconButton from "@material-ui/core/IconButton"
import {makeStyles} from "@material-ui/core/styles";
import {IItemsProps} from "../App";
import {useState, useRef} from "react";
import {NavigateBefore, NavigateNext} from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
    root: {
        width: "100%",
        height: "100%",
        padding: 0,
        overflow: "hidden",
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        border: "1px solid rgba(255,255,255,0.05)",
        borderRadius: 16,
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
        boxShadow:
            theme.palette.background.default === "dark"
                ? "0px 1px 3px rgba(0,0,0,0.5)"
                : "0px 1px 3px rgba(0,0,0,0.15)",
        "&:hover": {
            transform: "translateY(-3px)",
            boxShadow:
                theme.palette.background.default === "dark"
                    ? "0px 4px 10px rgba(0,0,0,0.6)"
                    : "0px 4px 12px rgba(0,0,0,0.2)",
        },
    },

    media: {
        width: "100%",
        height: "100%",
        maxHeight: "400px",
        objectFit: "contain",
        cursor: "pointer",
        borderRadius: 8,
    },

    galleryContainer: {
        display: "flex",
        flexWrap: "wrap",
        gap: "2px",
        position: "relative",
        borderRadius: 8,
        overflow: "hidden",
    },

    galleryImage: {
        flexGrow: 1,
        minWidth: "calc(50% - 1px)",
        height: "200px",
        objectFit: "cover",
        cursor: "pointer",
        transition: "transform 0.2s",
        "&:hover": {
            transform: "scale(1.02)",
        },
    },

    moreImagesIndicator: {
        position: "absolute",
        bottom: 8,
        right: 8,
        backgroundColor: "rgba(0, 0, 0, 0.65)",
        color: "white",
        padding: "4px 8px",
        borderRadius: 6,
        fontSize: "0.75rem",
        backdropFilter: "blur(3px)",
    },

    placeholder: {
        backgroundColor: theme.palette.background.default,
        height: "200px",
        borderRadius: 8,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
    },

    carouselContainer: {
        position: "relative",
        height: "70vh",
        width: "100%",
        overflow: "hidden",
    },

    dialogMedia: {
        maxWidth: "100%",
        maxHeight: "100%",
        objectFit: "contain",
    },

    carouselButton: {
        position: "absolute",
        top: "50%",
        transform: "translateY(-50%)",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        color: "white",
        zIndex: 2,
        "&:hover": {
            backgroundColor: "rgba(0,0,0,0.7)",
        },
    },

    prevButton: {
        left: theme.spacing(2),
    },

    nextButton: {
        right: theme.spacing(2),
    },

    videoContainer: {
        position: "relative",
        paddingBottom: "56.25%",
        height: "100%",
        overflow: "hidden",
        background: "#000",
        borderRadius: 8,
    },

    videoIframe: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        border: "none",
    },

    gifPlayer: {
        width: "100%",
        height: "100%",
        objectFit: "contain",
        cursor: "pointer",
        borderRadius: 8,
    },

    gifBadge: {
        position: "absolute",
        bottom: 8,
        right: 8,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        color: "white",
        padding: "4px 8px",
        borderRadius: 6,
        fontSize: "0.75rem",
    },

    gifControls: {
        position: "absolute",
        bottom: 16,
        left: 16,
        backgroundColor: "rgba(0,0,0,0.5)",
        color: "white",
        zIndex: 2,
    },
}));

interface MediaItem {
    id: string;
    src: string;
    originalSrc: string;
    gifSrc: string | null;
    caption: string;
    type: 'image' | 'video' | 'gif';
}

export default function Item(props: IItemsProps) {
    const classes = useStyles();
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [isGifPlaying, setIsGifPlaying] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);

    const videoLink = props.data.secure_media_embed?.media_domain_url;
    const image_src = props.data.url_overridden_by_dest;
    const fallback_url = props.data.url;
    const preview = props.data.preview?.images?.[0]?.source?.url;

    const getActualGifUrl = (url: string): string | null => {
        if (!url) return null;

        // Direct GIF link
        if (/\.gif$/i.test(url)) {
            return url;
        }

        // GIF link - convert to MP4
        if (/\.gifv$/i.test(url)) {
            return url.replace(/\.gif$/i, '.mp4');
        }

        // Reddit preview image - try to get original
        if (/preview\.redd\.it/.test(url)) {
            // Check if post URL has GIF
            if (props.data.url && /\.gif?$/i.test(props.data.url)) {
                return props.data.url.replace(/\.gif$/i, '.mp4');
            }

            // Extract from preview URL
            const match = url.match(/\/preview\/([^?]+)/);
            if (match) {
                return `https://i.redd.it/${match[1].replace(/\..+$/, '.gif')}`;
            }
        }

        return null;
    };

    const getMediaItems = (): MediaItem[] => {
        const items: MediaItem[] = [];

        // Handle single video
        if (videoLink) {
            items.push({
                id: 'video',
                src: videoLink,
                originalSrc: videoLink,
                gifSrc: null,
                caption: props.data.title,
                type: 'video'
            });
            return items;
        }

        const url = image_src || fallback_url;
        const actualGifUrl = getActualGifUrl(url);

        // Handle GIFs
        if (actualGifUrl) {
            items.push({
                id: 'gif',
                src: actualGifUrl,
                originalSrc: url,
                gifSrc: actualGifUrl,
                caption: props.data.title,
                type: 'gif'
            });
            return items;
        }

        // Handle gallery
        if (props.data.is_gallery && props.data.media_metadata) {
            props.data.gallery_data?.items.forEach(item => {
                const mediaId = item.media_id;
                const mediaData = props.data.media_metadata?.[mediaId];

                if (!mediaData) return;

                let mediaType: 'image' | 'video' | 'gif' = 'image';
                const mimeType = mediaData.m?.split('/')[0];

                if (mimeType === 'video') mediaType = 'video';
                else if (mimeType === 'image' && /\.gif$/i.test(mediaData.s?.u || '')) mediaType = 'gif';

                const source = mediaData.s?.u || mediaData.p?.at(-1)?.u;
                const gifSource = mediaType === 'image' ? source?.replace(/preview;/g, '&') : "";

                const gifUrl = gifSource?.replace('preview.redd.it', 'i.redd.it')

                if (source) {
                    items.push({
                        id: mediaId,
                        src: gifUrl ? gifUrl : "",
                        originalSrc: source.replace(/&amp;/g, '&'),
                        gifSrc: gifUrl ? gifUrl : "",
                        caption: item.caption || props.data.title,
                        type: mediaType
                    });
                }
            });
            return items;
        }

        // Handle single image
        if (url) {
            items.push({
                id: 'image',
                src: url,
                originalSrc: url,
                gifSrc: null,
                caption: props.data.title,
                type: 'image'
            });
        }

        return items;
    };

    const mediaItems = getMediaItems();
    const isGallery = props.data.is_gallery && mediaItems.length > 1;

    const openLightbox = (index: number) => {
        setCurrentMediaIndex(index);
        setLightboxOpen(true);
        setIsGifPlaying(true);
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
    };

    const navigateMedia = (direction: 'prev' | 'next') => {
        setCurrentMediaIndex(prev => {
            const newIndex = direction === 'prev'
                ? prev > 0 ? prev - 1 : mediaItems.length - 1
                : prev < mediaItems.length - 1 ? prev + 1 : 0;
            setIsGifPlaying(true);
            return newIndex;
        });
    };

    const renderMedia = (item: MediaItem, style?: React.CSSProperties) => {
        if (item.type === 'video') {
            return (
                <div className={classes.videoContainer}>
                    <iframe
                        src={item.src}
                        className={classes.videoIframe}
                        allowFullScreen
                        title={item.caption}
                    />
                </div>
            );
        }

        if (item.type === 'gif') {
            return (
                <div style={{position: 'relative', ...style}}>
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className={classes.gifPlayer}
                        poster={item.src.replace(/\.(mp4|gif)$/i, '.gif')}
                        onError={(e) => {
                            const target = e.target as HTMLVideoElement;
                            if (target.src !== item.originalSrc) {
                                target.src = item.originalSrc;
                            }
                        }}
                    >
                        <source src={item.gifSrc || item.src}
                                type={item.src.endsWith('.mp4') ? 'video/mp4' : 'image/gif'}/>
                    </video>
                    <div className={classes.gifBadge}>GIF</div>
                </div>
            );
        }

        return (
            <CardMedia
                component="img"
                src={item.src}
                alt={item.caption}
                style={{opacity: 0, transitionDuration: "700ms", transitionProperty: "opacity", borderRadius: "0.5rem"}}
                onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = 'https://pngimg.com/uploads/question_mark/question_mark_PNG1.png';
                    target.width = 155;
                }}
                onLoad={(e) => e.currentTarget.classList.add("opacity-full") }
            />
        );
    };

    return (
        <Card className={classes.root}>
            <div onClick={(e) => {
                if (mediaItems.length > 0) {
                    e.preventDefault();
                    e.stopPropagation();
                    openLightbox(0);
                }
            }}>
                <CardActionArea
                    href={"https://reddit.com" + props.data.permalink}
                    target="_blank"
                    rel="noreferrer"
                >
                    <CardContent style={{paddingBottom: "0.75rem"}}>
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "8px",
                            opacity: 0.8,
                            fontSize: "0.85rem"
                        }}>
                            <span style={{opacity: 0.8}}>{props.data?.ups}{props.data?.ups > "1000" ? "k" : ""}</span>
                            <span style={{fontWeight: 600}}>r/{props.data?.subreddit}</span>
                            <span style={{opacity: 0.6}}>•</span>
                            <span style={{opacity: 0.8}}>u/{props.data?.author}</span>
                            <span style={{opacity: 0.6}}>•</span>
                            <span style={{opacity: 0.8}}>{new Date(props.data?.created_utc * 1000).toLocaleDateString()}</span>

                        </div>

                        <Typography gutterBottom component="h1" variant="h5" color="textPrimary">
                            {props.data.title}
                        </Typography>

                        {mediaItems.length === 0 ? (
                            <div className={classes.placeholder}>
                                <Typography variant="body2" color="textSecondary">
                                    No media available
                                </Typography>
                            </div>
                        ) : isGallery ? (
                            <div style={{height: "100%", paddingBottom: "2rem"}} className={classes.galleryContainer}>
                                {mediaItems.slice(0, 1).map((item, index) => (
                                    <div style={{height: "100%", width: "100%"}} key={`${item.id}-${index}`}
                                         onClick={(e) => {
                                             e.preventDefault();
                                             e.stopPropagation();
                                             openLightbox(index);
                                         }}>
                                        {renderMedia(item, {
                                            width: '100%',
                                            height: '100%'
                                        })}
                                    </div>
                                ))}

                                {mediaItems.length > 0 && (
                                    <div className={classes.moreImagesIndicator}>
                                        +{mediaItems.length} in total
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                {renderMedia(mediaItems[0], {
                                    width: '100%',
                                    height: '100%',
                                    cursor: mediaItems.length > 0 ? 'pointer' : 'default'
                                })}
                                <span style={{opacity: 0.6}}>{props.data?.num_comments} comment{props.data?.num_comments > "1" || props.data?.num_comments === "0" ? "s" : ""}</span>
                            </>
                        )}
                    </CardContent>
                </CardActionArea>
            </div>

            <Dialog
                open={lightboxOpen}
                onClose={closeLightbox}
                maxWidth="lg"
                fullWidth
            >
                <DialogContent>
                    <Typography variant="subtitle1">
                        {mediaItems[currentMediaIndex].caption}
                    </Typography>
                    <a href={"https://reddit.com" + props.data.permalink} target="_blank" rel="noreferrer">Link to post</a>
                    <div className={classes.carouselContainer}>
                        {mediaItems[currentMediaIndex].type === 'video' ? (
                            <div className={classes.videoContainer}>
                                <iframe
                                    src={mediaItems[currentMediaIndex].src}
                                    className={classes.videoIframe}
                                    allowFullScreen
                                    title={mediaItems[currentMediaIndex].caption}
                                />
                            </div>
                        ) : mediaItems[currentMediaIndex].type === 'gif' ? (
                            <div style={{position: 'relative', height: '100%'}}>
                                <img
                                    style={{maxHeight: '70vh', maxWidth: '100%', height: '100%'}}
                                    src={mediaItems[currentMediaIndex].gifSrc || mediaItems[currentMediaIndex].src}
                                />
                            </div>
                        ) : (
                            <img
                                style={{height: "100%"}}
                                src={mediaItems[currentMediaIndex].src}
                                alt={mediaItems[currentMediaIndex].caption}
                                className={classes.dialogMedia}
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.onerror = null;
                                    target.src = 'https://pngimg.com/uploads/question_mark/question_mark_PNG1.png';
                                }}
                            />
                        )}

                        {mediaItems.length > 1 && (
                            <>
                                <IconButton
                                    className={`${classes.carouselButton} ${classes.prevButton}`}
                                    onClick={() => navigateMedia('prev')}
                                >
                                    <NavigateBefore/>
                                </IconButton>
                                <IconButton
                                    className={`${classes.carouselButton} ${classes.nextButton}`}
                                    onClick={() => navigateMedia('next')}
                                >
                                    <NavigateNext/>
                                </IconButton>
                            </>
                        )}
                    </div>
                </DialogContent>
                <DialogActions>
                    <Typography variant="caption" color="textSecondary">
                        {currentMediaIndex + 1} of {mediaItems.length}
                    </Typography>
                    <Button onClick={closeLightbox} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
}