import { FormControlLabel, Switch } from "@mui/material";

interface HistoryToggleProps {
    saveHistory: boolean;
    onChange: (value: boolean) => void;
}

const HistoryToggle = ({ saveHistory, onChange }: HistoryToggleProps) => {
    const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.checked;
        onChange(newValue);
        localStorage.setItem("saveHistory", String(newValue));
        if (!newValue) {
            localStorage.removeItem("searchHistory");
        }
    };

    return (
        <FormControlLabel
            control={
                <Switch
                    checked={saveHistory}
                    onChange={handleToggle}
                    color="primary"
                />
            }
            label="Save Search History"
        />
    );
};

export default HistoryToggle;
