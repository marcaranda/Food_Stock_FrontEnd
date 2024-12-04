import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar, Box, Toolbar, Button, Menu, MenuItem } from "@mui/material";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faListDots } from "@fortawesome/free-solid-svg-icons";

function Navbar() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleShowOptionsDiet = (event) => {
    setAnchorEl(event.currentTarget);
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Box sx={{ flexGrow: 1 }}>
            <Button color="inherit" onClick={handleShowOptionsDiet}>
              <FontAwesomeIcon icon={faListDots} />
            </Button>
            <Menu
              id="simple-menu"
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              <MenuItem onClick={() => navigate("/myStock")}>Mi Stock</MenuItem>
              <MenuItem onClick={() => navigate("/myDiets")}>Mis Dietas</MenuItem>
              <MenuItem onClick={() => navigate("/addDiet")}>Añadir Dieta</MenuItem>
              <MenuItem onClick={() => navigate("/newShopping")}>Nueva Compra</MenuItem>
            </Menu>
            <Button color="inherit" onClick={() => navigate("/")}>Inicio</Button>
          </Box>
          <Button color="inherit">Login</Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default Navbar;