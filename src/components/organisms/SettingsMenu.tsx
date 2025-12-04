import {Drawer, Box, Typography, Divider, Button} from "@mui/material";
import {useState} from "react";
import {ThemeToggle} from "../molecules/ThemeToggle";
import {GridToggleButton} from "../molecules/GridToggleButton";
import {RememberToggle} from "../molecules/RememberToggle";
import {HistoryToggle} from "../molecules/HistoryToggle";

interface Props {
    darkMode: boolean;
    toggleDarkMode: () => void;
    rememberLast: boolean;
    setRememberLast: (v: boolean) => void;
    saveHistory: boolean;
    setSaveHistory: (v: boolean) => void;
}

export const SettingsMenu = ({darkMode, toggleDarkMode, setRememberLast, rememberLast, saveHistory, setSaveHistory}: Props) => {
    const [open, setOpen] = useState(false);
    return <>
        <Button variant="outlined" onClick={() => setOpen(true)}>Settings</Button>
        <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
            <Box sx={{width: 250, p: 2}}>
                <Typography variant="h6" gutterBottom>Settings</Typography>
                <Divider sx={{my: 1}}/>
                <ThemeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode}/>
                <GridToggleButton/>
                <Divider sx={{my: 1}}/>
                <RememberToggle onChange={setRememberLast} rememberLast={rememberLast}/>
                <HistoryToggle saveHistory={saveHistory} onChange={setSaveHistory}/>
            </Box>
        </Drawer>
    </>;
}
