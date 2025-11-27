import { FormControlLabel, Switch } from "@mui/material";
import { useEffect, useState } from "react";

interface RememberToggleProps {
    onChange: (enabled: boolean) => void;
}

const RememberToggle = ({ onChange }: RememberToggleProps) => {
    const [enabled, setEnabled] = useState<boolean>(true);

    // Load initial preference
    useEffect(() => {
        const stored = localStorage.getItem("rememberLastSubreddit");
        if (stored !== null) {
            const value = stored === "true";
            setEnabled(value);
            onChange(value);
        }
    }, []);

    const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
        const checked = event.target.checked;
        setEnabled(checked);
        localStorage.setItem("rememberLastSubreddit", String(checked));
        onChange(checked);
    };

    return (
        <FormControlLabel
            control={
                <Switch
                    checked={enabled}
                    onChange={handleToggle}
                    color="primary"
                />
            }
            label="Remember last subreddit"
        />
    );
};

export default RememberToggle;
