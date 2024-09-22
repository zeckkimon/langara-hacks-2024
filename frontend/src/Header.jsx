import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import PermPhoneMsgIcon from "@mui/icons-material/PermPhoneMsg";
import PersonIcon from "@mui/icons-material/Person";
import { Typography } from "@mui/material";

export default function Header() {
  const [open, setOpen] = React.useState(false);

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const DrawerList = (
    <Box
      sx={{ width: 250, zIndex: 100 }}
      role="presentation"
      onClick={toggleDrawer(false)}
    >
      <List>
        {["Chat", "Profile"].map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                {index % 2 === 0 ? <PermPhoneMsgIcon /> : <PersonIcon />}
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          margin: "0 auto", // Center it horizontally
          maxWidth: "800px",
          width: "100vw",
          backgroundColor: "#F7F7F7",
          height: "60px",
          zIndex: 999,
        }}
      >
        <Button
          onClick={toggleDrawer(true)}
          sx={{ position: "absolute", top: 0, left: 0, height: "100%" }}
        >
          <MenuIcon />
        </Button>
        <Typography variant="h5" sx={{ lineHeight: "60px" }}>
          Phone Call Chat
        </Typography>
      </header>
      <Drawer open={open} onClose={toggleDrawer(false)}>
        {DrawerList}
      </Drawer>
    </>
  );
}
