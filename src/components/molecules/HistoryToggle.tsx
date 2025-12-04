import { FormControlLabel, Switch } from "@mui/material";

interface HistoryToggleProps {
    saveHistory: boolean;
    onChange: (value: boolean) => void;
}

export const HistoryToggle: React.FC<HistoryToggleProps> = ({ saveHistory, onChange }) => {
    return (
        <FormControlLabel
            control={<Switch checked={saveHistory} onChange={e => onChange(e.target.checked)} />}
            label="Save search history"
        />
    );
};

