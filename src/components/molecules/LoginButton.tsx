import { Button, Menu, MenuItem, Avatar, Box, Typography, Divider, CircularProgress } from "@mui/material";
import { Logout, Google } from "@mui/icons-material";
import { useState, MouseEvent } from "react";
import { useAuth } from "../../context/AuthContext";

export const LoginButton = () => {
    const { user, isAuthenticated, isLoading, login, logout } = useAuth();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogin = () => {
        login("google");
    };

    const handleLogout = async () => {
        handleClose();
        await logout();
    };

    if (isLoading) {
        return <CircularProgress size={24} />;
    }

    if (isAuthenticated && user) {
        return (
            <>
                <Button
                    onClick={handleClick}
                    sx={{
                        textTransform: "none",
                        display: "flex",
                        gap: 1,
                        alignItems: "center",
                    }}
                >
                    <Avatar
                        src={user.avatar || undefined}
                        alt={user.name || user.email}
                        sx={{ width: 32, height: 32 }}
                    />
                    <Typography
                        variant="body2"
                        sx={{
                            display: { xs: "none", sm: "block" },
                            maxWidth: 120,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {user.name || user.email}
                    </Typography>
                </Button>
                <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "right",
                    }}
                    transformOrigin={{
                        vertical: "top",
                        horizontal: "right",
                    }}
                >
                    <Box sx={{ px: 2, py: 1 }}>
                        <Typography variant="subtitle2">{user.name || "User"}</Typography>
                        <Typography variant="caption" color="text.secondary">
                            {user.email}
                        </Typography>
                    </Box>
                    <Divider />
                    <MenuItem onClick={handleLogout}>
                        <Logout sx={{ mr: 1 }} fontSize="small" />
                        Logout
                    </MenuItem>
                </Menu>
            </>
        );
    }

    return (
        <Button
            variant="outlined"
            size="small"
            startIcon={<Google />}
            onClick={handleLogin}
        >
            Login with Google
        </Button>
    );
};
