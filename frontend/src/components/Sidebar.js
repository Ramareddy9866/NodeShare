import { Box, List, ListItem, ListItemText, Drawer } from "@mui/material"
import DashboardIcon from "@mui/icons-material/Dashboard"
import PeopleIcon from "@mui/icons-material/People"
import { Link } from "react-router-dom"

export default function Sidebar({ isAuthPage, isMobile, mobileOpen, handleDrawerToggle, location, theme }) {
  const drawer = (
    <Box
      sx={{
        height: "100%",
        backgroundColor: theme.palette.secondary.main,
        borderRight: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "2px 0 8px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        p: 0,
        overflow: "hidden",
        color: "#F8FAFC",
      }}
    >
      <List sx={{ flex: 1, mt: { xs: 2, md: 3 }, overflow: "hidden" }}>
        <ListItem
          button
          component={Link}
          to="/dashboard"
          onClick={() => isMobile && handleDrawerToggle()}
          selected={location.pathname === "/dashboard"}
          sx={{
            borderRadius: 2,
            mx: 1,
            my: 0.5,
            color: "#F9FAFB",
            "& .MuiSvgIcon-root": { color: "#F9FAFB" },
            "&.Mui-selected, &.Mui-selected:hover": {
              backgroundColor: theme.palette.accent.main,
              color: theme.palette.primary.main,
              "& .MuiSvgIcon-root": { color: theme.palette.primary.main },
            },
            "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.08)" },
          }}
        >
          <DashboardIcon sx={{ mr: { xs: 1.5, md: 2 } }} />
          <ListItemText primary="Dashboard" />
        </ListItem>

        <ListItem
          button
          component={Link}
          to="/friends"
          onClick={() => isMobile && handleDrawerToggle()}
          selected={location.pathname === "/friends"}
          sx={{
            borderRadius: 2,
            mx: 1,
            my: 0.5,
            color: "#F9FAFB",
            "& .MuiSvgIcon-root": { color: "#F9FAFB" },
            "&.Mui-selected, &.Mui-selected:hover": {
              backgroundColor: theme.palette.accent.main,
              color: theme.palette.primary.main,
              "& .MuiSvgIcon-root": { color: theme.palette.primary.main },
            },
            "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.08)" },
          }}
        >
          <PeopleIcon sx={{ mr: { xs: 1.5, md: 2 } }} />
          <ListItemText primary="Friends" />
        </ListItem>
      </List>

      <Box sx={{ flexGrow: 0, mb: 2 }} />
    </Box>
  )

  if (isAuthPage) return null

  return isMobile ? (
    // Temporary drawer for mobile
    <Drawer
      variant="temporary"
      open={mobileOpen}
      onClose={handleDrawerToggle}
      ModalProps={{ keepMounted: true }}
      sx={{
        "& .MuiDrawer-paper": {
          boxSizing: "border-box",
          width: { xs: 220, sm: 240, lg: 260 },
          backgroundColor: theme.palette.secondary.main,
          position: "fixed",
          top: { xs: 56, sm: 64 },
          height: { xs: "calc(100vh - 56px)", sm: "calc(100vh - 64px)" },
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {drawer}
    </Drawer>
  ) : (
    // Permanent drawer for desktop
    <Drawer
      variant="permanent"
      sx={{
        width: { md: 240, lg: 260 },
        flexShrink: 0,
        display: { xs: "none", md: "block" },
        "& .MuiDrawer-paper": {
          width: { md: 240, lg: 260 },
          boxSizing: "border-box",
          backgroundColor: theme.palette.secondary.main,
          position: "fixed",
          top: { xs: 56, sm: 64 },
          height: { xs: "calc(100vh - 56px)", sm: "calc(100vh - 64px)" },
          overflow: "hidden",
        },
      }}
      open
    >
      {drawer}
    </Drawer>
  )
};
