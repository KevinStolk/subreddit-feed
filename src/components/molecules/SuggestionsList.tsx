import React from "react";
import {Box, Chip} from "@mui/material";

interface SuggestionsListProps {
    suggestions: string[];
    setSubreddit: (sub: string) => void;
    fetchSubredditFromSuggestion: (sub: string) => void;
}


export const SuggestionsList = ({ suggestions, setSubreddit, fetchSubredditFromSuggestion }: SuggestionsListProps) => {
    return (
        <Box mt={2} mb={2} display="flex" flexDirection="column" alignItems="center">
            <p className="font-semibold mb-2">Did you mean:</p>
            <Box display="flex" justifyContent="space-between" width="100%" maxWidth="500px">
                <Box mt={1} sx={{display: "flex", flexWrap: "wrap", gap: 1}}>
                    {suggestions.map(sub => (
                        <Chip
                            key={sub}
                            onClick={() => {
                                setSubreddit(sub);
                                fetchSubredditFromSuggestion(sub);
                            }}
                            className="cursor-pointer hover:underline"
                            color={"primary"}
                            clickable
                            label={`r/${sub}`}
                        >
                        </Chip>
                    ))}
                </Box>
            </Box>
        </Box>
    );
}