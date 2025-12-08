import {useState} from "react";
import {Box, Typography, IconButton, Chip} from "@mui/material";
import {ArrowRight, ArrowDropUp} from "@mui/icons-material";

export const Comments = ({data, depth = 0}: any) => {
    const [collapsed, setCollapsed] = useState(false);

    if (!data || !data.data) return null;

    const comment = data.data;
    const replies = comment.replies?.data?.children || [];

    return (
        <Box sx={{ml: depth * 2, mt: 1}}>
            <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                <Chip sx={{fontWeight: 600, fontSize: "0.8rem", backgroundColor: "primary.main", color: "white"}}
                      label={comment.ups}
                >
                </Chip>

                <Typography sx={{fontWeight: 600, fontSize: "0.9rem"}}>
                    {comment.author}
                </Typography>

                {replies.length > 0 && (
                    <IconButton
                        sx={{color: "primary.main"}}
                        size="small"
                        onClick={() => setCollapsed(prev => !prev)}
                    >
                        {collapsed ? <ArrowRight/> : <ArrowDropUp/>}
                    </IconButton>
                )}
            </Box>

            {!collapsed && (
                <>
                    <Typography variant="body2" sx={{mb: 1, ml: "2.5rem"}}>
                        {comment.body}
                    </Typography>

                    {replies.map((r: any, i: number) => (
                        <Comments key={i} data={r} depth={depth + 1}/>
                    ))}
                </>
            )}
        </Box>
    );
};


