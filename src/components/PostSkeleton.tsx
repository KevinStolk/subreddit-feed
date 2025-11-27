import { Card, CardContent, Skeleton, Box } from "@mui/material";

const PostSkeleton = () => {
    return (
        <Card sx={{ mb: 2 }}>
            <CardContent>
                <Box display="flex" flexDirection="column" gap={1}>
                    <Skeleton variant="text" width="60%" height={30} animation="wave" />
                    <Skeleton variant="rectangular" width="100%" height={180} animation="wave" />
                    <Skeleton variant="text" width="40%" animation="wave" />
                </Box>
            </CardContent>
        </Card>
    );
};

export default PostSkeleton;
