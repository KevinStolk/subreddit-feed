import { IconButton } from "@material-ui/core";
import { Brightness4 as MoonIcon, Brightness7 as SunIcon } from "@material-ui/icons";

interface ThemeToggleProps {
    darkMode: boolean;
    toggleDarkMode: () => void;
}

const ThemeToggle = ({ darkMode, toggleDarkMode }: ThemeToggleProps) => {

    return (
        <IconButton color="inherit" onClick={toggleDarkMode} aria-label="Toggle dark mode">
            {darkMode ? <SunIcon /> : <MoonIcon />}
        </IconButton>
    );
};

export default ThemeToggle;