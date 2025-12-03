import {Drawer, Box, Typography, Divider, Button} from "@mui/material";
import {useState} from "react";
import ThemeToggle from "./ThemeToggle";
import GridToggleButton from "./GridToggleButton";
import RememberToggle from "./RememberToggle";
import HistoryToggle from "./HistoryToggle";

interface SettingsMenuProps {
    darkMode: boolean;
    toggleDarkMode: () => void;
    rememberLast: boolean;
    setRememberLast: (value: boolean) => void;
    saveHistory: boolean;
    setSaveHistory: (value: boolean) => void;
}

const SettingsMenu = ({
                          darkMode,
                          toggleDarkMode,
                          setRememberLast,
                          saveHistory,
                          setSaveHistory
                      }: SettingsMenuProps) => {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button  variant="outlined" color="primary" onClick={() => setOpen(true)}>Settings</Button>
            <Drawer sx={{bgcolor: 'background.paper', color: 'text.primary'}} anchor="right" open={open}
                    onClose={() => setOpen(false)}>
                <Box sx={{width: 250, height: "100%", p: 2, bgcolor: 'background.paper', color: 'text.primary'}}>
                    <Typography color="primary" variant="h6" gutterBottom>Settings</Typography>
                    <Divider sx={{my: 1}}/>

                    <ThemeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode}/>
                    <GridToggleButton/>

                    <Divider sx={{my: 1}}/>

                    <RememberToggle onChange={setRememberLast}/>

                    <HistoryToggle saveHistory={saveHistory} onChange={setSaveHistory}/>
                </Box>
            </Drawer>
        </>
    );
}

export default SettingsMenu;