import IconButton from "@mui/material/IconButton";
import {Brightness4 as MoonIcon, Brightness7 as SunIcon} from "@mui/icons-material";

interface ThemeToggleProps {
    darkMode: boolean;
    toggleDarkMode: () => void;
}

export const ThemeToggle = ({darkMode, toggleDarkMode}: ThemeToggleProps) => {

    return (
        <IconButton color="inherit" onClick={toggleDarkMode} aria-label="Toggle dark mode">
            {darkMode ? <SunIcon/> : <MoonIcon/>}
        </IconButton>
    );
};
