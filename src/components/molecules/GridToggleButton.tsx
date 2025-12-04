import Menu from "@mui/material/Menu";
import IconButton from "@mui/material/IconButton"
import MenuItem from "@mui/material/MenuItem"
import { ViewArray as OneColumnIcon, ViewWeek as TwoColumnsIcon, ViewComfy as ThreeColumnsIcon } from "@mui/icons-material";
import { useEffect, useState } from "react";

type GridLayout = "one" | "two" | "three";

export const GridToggleButton =() => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [gridLayout, setGridLayout] = useState<GridLayout>("two");

    useEffect(() => {
        const savedLayout = localStorage.getItem("gridLayout") as GridLayout | null;
        document.body.classList.add(`grid-${savedLayout || "two"}`);
        if (savedLayout) setGridLayout(savedLayout);
    }, []);

    const handleLayoutChange = (layout: GridLayout) => {
        setGridLayout(layout);
        document.body.classList.remove("grid-one", "grid-two", "grid-three");
        document.body.classList.add(`grid-${layout}`);
        localStorage.setItem("gridLayout", layout);
        setAnchorEl(null);
    };

    const getCurrentIcon = () => {
        switch (gridLayout) {
            case "one": return <OneColumnIcon />;
            case "two": return <TwoColumnsIcon />;
            case "three": return <ThreeColumnsIcon />;
        }
    };

    return <>
        <IconButton color="inherit" onClick={e => setAnchorEl(e.currentTarget)} disabled={document.body.offsetWidth < 769}>
            {getCurrentIcon()}
        </IconButton>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem onClick={() => handleLayoutChange("one")}><OneColumnIcon style={{ marginRight: 8 }} />One Column</MenuItem>
            <MenuItem onClick={() => handleLayoutChange("two")}><TwoColumnsIcon style={{ marginRight: 8 }} />Two Columns</MenuItem>
            <MenuItem onClick={() => handleLayoutChange("three")}><ThreeColumnsIcon style={{ marginRight: 8 }} />Three Columns</MenuItem>
        </Menu>
    </>;
}

