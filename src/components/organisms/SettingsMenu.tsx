import {Drawer, Box, Typography, Divider, Button, IconButton} from "@mui/material";
import {useState} from "react";
import {ThemeSelector} from "../molecules/ThemeSelector";
import {GridToggleButton} from "../molecules/GridToggleButton";
import {RememberToggle} from "../molecules/RememberToggle";
import {HistoryToggle} from "../molecules/HistoryToggle";
import {Settings} from "@mui/icons-material";

interface Props {
    themeId: string;
    setThemeId: (id: string) => void;
    rememberLast: boolean;
    setRememberLast: (v: boolean) => void;
    saveHistory: boolean;
    setSaveHistory: (v: boolean) => void;
}

export const SettingsMenu = ({themeId, setThemeId, setRememberLast, rememberLast, saveHistory, setSaveHistory}: Props) => {
    const [open, setOpen] = useState(false);
    return <>
        <Button sx={{display: {xs: 'none', md: 'initial'}}}  variant="outlined" aria-label="settings" onClick={() => setOpen(true)}>
            <Typography variant="body1">Settings</Typography>
        </Button>
        <IconButton color="primary" sx={{display: {xs: 'initial', md: 'none'}, padding: '0'}} aria-label="settings"  onClick={() => setOpen(true)}>
            <Settings/>
        </IconButton>
        <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
            <Box sx={{width: 300, p: 2, maxHeight: '100vh', overflowY: 'auto'}}>
                <Typography variant="h6" gutterBottom>Settings</Typography>
                <Divider sx={{my: 1}}/>
                <Typography variant="subtitle2" sx={{mb: 1}}>Theme</Typography>
                <ThemeSelector currentThemeId={themeId} onThemeChange={setThemeId}/>
                <Divider sx={{my: 2}}/>
                <Typography variant="subtitle2" sx={{mb: 1}}>Layout</Typography>
                <GridToggleButton/>
                <Divider sx={{my: 2}}/>
                <Typography variant="subtitle2" sx={{mb: 1}}>Preferences</Typography>
                <RememberToggle onChange={setRememberLast} rememberLast={rememberLast}/>
                <HistoryToggle saveHistory={saveHistory} onChange={setSaveHistory}/>
            </Box>
        </Drawer>
    </>;
}
