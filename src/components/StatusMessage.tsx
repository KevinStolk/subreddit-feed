import { Alert, Box } from "@mui/material";
import ErrorOutlineIcon from "@material-ui/icons/ErrorOutline";
import SentimentDissatisfiedIcon from "@material-ui/icons/SentimentDissatisfied";

interface StatusMessageProps {
    type: "error" | "empty";
    message: string;
}

const StatusMessage = ({ type, message }: StatusMessageProps) => {
    if (type === "error") {
        return (
            <Box display="flex" justifyContent="center" mt={3}>
                <Alert severity="error" icon={<ErrorOutlineIcon />}>
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
                <SentimentDissatisfiedIcon fontSize="large" color="error" />
                <p>{message}</p>
            </Box>
        );
    }

    return null;
};

export default StatusMessage;
