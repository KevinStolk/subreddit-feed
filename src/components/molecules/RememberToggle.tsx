import { FormControlLabel, Switch } from "@mui/material";

interface RememberToggleProps {
    rememberLast: boolean;
    onChange: (value: boolean) => void;
}

export const RememberToggle: React.FC<RememberToggleProps> = ({ rememberLast, onChange }) => {
    return (
        <FormControlLabel
            control={<Switch checked={rememberLast} onChange={e => onChange(e.target.checked)} />}
            label="Remember last subreddit"
        />
    );
};
