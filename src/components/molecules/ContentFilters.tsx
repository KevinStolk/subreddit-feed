import { Box, Typography, Chip } from "@mui/material";
import { Image, VideoLibrary, Collections, TextFields } from "@mui/icons-material";
import { ContentFilters as ContentFiltersType } from "../../hooks/useSettings";

interface Props {
    filters: ContentFiltersType;
    onChange: (filters: ContentFiltersType) => void;
}

export const ContentFiltersComponent = ({ filters, onChange }: Props) => {
    const toggleFilter = (key: keyof ContentFiltersType) => {
        onChange({ ...filters, [key]: !filters[key] });
    };

    return (
        <Box>
            <Typography variant="body2" sx={{ mb: 1 }}>Show content types:</Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
                <Chip
                    icon={<Image />}
                    label="Images"
                    onClick={() => toggleFilter("showImages")}
                    color={filters.showImages ? "primary" : "default"}
                    variant={filters.showImages ? "filled" : "outlined"}
                    size="small"
                />
                <Chip
                    icon={<VideoLibrary />}
                    label="Videos"
                    onClick={() => toggleFilter("showVideos")}
                    color={filters.showVideos ? "primary" : "default"}
                    variant={filters.showVideos ? "filled" : "outlined"}
                    size="small"
                />
                <Chip
                    icon={<Collections />}
                    label="Galleries"
                    onClick={() => toggleFilter("showGalleries")}
                    color={filters.showGalleries ? "primary" : "default"}
                    variant={filters.showGalleries ? "filled" : "outlined"}
                    size="small"
                />
                <Chip
                    icon={<TextFields />}
                    label="Text"
                    onClick={() => toggleFilter("showText")}
                    color={filters.showText ? "primary" : "default"}
                    variant={filters.showText ? "filled" : "outlined"}
                    size="small"
                />
            </Box>
        </Box>
    );
};
