import { Alert, Box } from "@mui/material";
import { ErrorOutline, SentimentDissatisfied, Info } from "@mui/icons-material";

export const StatusMessage = ({ type, message }: { type: "error" | "empty" | "info"; message: string }) => {
    if (type === "error") return (
        <Box display="flex" justifyContent="center" mt={3}>
            <Alert severity="error" icon={<ErrorOutline />}>{message}</Alert>
        </Box>
    );
    if (type === "empty") return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" mt={5}>
            <SentimentDissatisfied fontSize="large" color="error" />
            <p>{message}</p>
        </Box>
    );
    if (type === "info") return (
        <Box display="flex" justifyContent="center" mt={3}>
            <Alert severity="info" icon={<Info />}>{message}</Alert>
        </Box>
    );
    return null;
}
