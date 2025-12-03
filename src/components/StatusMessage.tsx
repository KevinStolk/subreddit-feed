import {Alert, Box} from "@mui/material";
import {ErrorOutline, SentimentDissatisfied} from "@mui/icons-material";

interface StatusMessageProps {
    type: "error" | "empty";
    message: string;
}

const StatusMessage = ({type, message}: StatusMessageProps) => {
    if (type === "error") {
        return (
            <Box display="flex" justifyContent="center" mt={3}>
                <Alert severity="error" icon={<ErrorOutline/>}>
                    {message}
                </Alert>
            </Box>
        );
    }

    if (type === "empty") {
        return (
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                mt={5}
            >
                <SentimentDissatisfied fontSize="large" color="error"/>
                <p>{message}</p>
            </Box>
        );
    }

    return null;
};

export default StatusMessage;
