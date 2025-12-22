import { Box, Typography, Grid } from "@mui/material";
import { Check } from "@mui/icons-material";
import { themes, Theme, isDarkTheme } from "../../themes";

interface ThemeSelectorProps {
    currentThemeId: string;
    onThemeChange: (themeId: string) => void;
}

export const ThemeSelector = ({ currentThemeId, onThemeChange }: ThemeSelectorProps) => {
    const lightThemes = themes.filter(t => !isDarkTheme(t));
    const darkThemes = themes.filter(t => isDarkTheme(t));

    const ThemeButton = ({ theme }: { theme: Theme }) => {
        const isSelected = theme.id === currentThemeId;

        return (
            <Box
                onClick={() => onThemeChange(theme.id)}
                sx={{
                    width: '100%',
                    height: 48,
                    borderRadius: 1,
                    cursor: 'pointer',
                    border: isSelected ? '2px solid' : '1px solid',
                    borderColor: isSelected ? theme.primary : 'rgba(128,128,128,0.3)',
                    backgroundColor: theme.background,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 1.5,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        borderColor: theme.primary,
                        transform: 'scale(1.02)',
                    },
                }}
            >
                <Typography
                    sx={{
                        fontSize: '0.75rem',
                        fontWeight: isSelected ? 600 : 400,
                        color: theme.text,
                    }}
                >
                    {theme.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {isSelected && (
                        <Check sx={{ fontSize: 16, color: theme.primary }} />
                    )}
                    <Box
                        sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: theme.primary,
                        }}
                    />
                </Box>
            </Box>
        );
    };

    return (
        <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Light
            </Typography>
            <Grid container spacing={1} sx={{ mb: 2 }}>
                {lightThemes.map(theme => (
                    <Grid key={theme.id} size={6}>
                        <ThemeButton theme={theme} />
                    </Grid>
                ))}
            </Grid>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Dark
            </Typography>
            <Grid container spacing={1}>
                {darkThemes.map(theme => (
                    <Grid key={theme.id} size={6}>
                        <ThemeButton theme={theme} />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};
