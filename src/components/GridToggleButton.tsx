import { IconButton, Menu, MenuItem } from "@material-ui/core";
import {
  ViewArray as OneColumnIcon,
  ViewWeek as TwoColumnsIcon,
  ViewComfy as ThreeColumnsIcon
} from "@material-ui/icons";
import { useEffect, useState } from "react";

type GridLayout = "one" | "two" | "three";

const GridToggleButton = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [gridLayout, setGridLayout] = useState<GridLayout>("two");

  // Load from localStorage on mount
  useEffect(() => {
    const savedLayout = localStorage.getItem("gridLayout") as GridLayout | null;
    if (savedLayout) {
      setGridLayout(savedLayout);
      document.body.classList.add(`grid-${savedLayout}`);
    } else {
      document.body.classList.add("grid-two"); // default
    }
  }, []);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLayoutChange = (layout: GridLayout) => {
    setGridLayout(layout);
    document.body.classList.remove("grid-one", "grid-two", "grid-three");
    document.body.classList.add(`grid-${layout}`);
    localStorage.setItem("gridLayout", layout);
    handleClose();
  };

  const getCurrentIcon = () => {
    switch (gridLayout) {
      case "one":
        return <OneColumnIcon />;
      case "two":
        return <TwoColumnsIcon />;
      case "three":
        return <ThreeColumnsIcon />;
      default:
        return <TwoColumnsIcon />;
    }
  };

  return (
      <>
        <IconButton
            color="inherit"
            onClick={handleClick}
            aria-label="Change grid layout"
            className="grid-toggle-button"
            disabled={document.body.offsetWidth < 769}
        >
          {getCurrentIcon()}
        </IconButton>

        <Menu
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
        >
          <MenuItem onClick={() => handleLayoutChange("one")}>
            <OneColumnIcon style={{ marginRight: 8 }} />
            One Column
          </MenuItem>
          <MenuItem onClick={() => handleLayoutChange("two")}>
            <TwoColumnsIcon style={{ marginRight: 8 }} />
            Two Columns
          </MenuItem>
          <MenuItem onClick={() => handleLayoutChange("three")}>
            <ThreeColumnsIcon style={{ marginRight: 8 }} />
            Three Columns
          </MenuItem>
        </Menu>
      </>
  );
};

export default GridToggleButton;
