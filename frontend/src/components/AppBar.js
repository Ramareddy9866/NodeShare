import { AppBar as MuiAppBar, Toolbar, Typography, Box, IconButton, Tooltip } from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"
import HubIcon from "@mui/icons-material/Hub"
import LogoutIcon from "@mui/icons-material/Logout"
import AccountCircleIcon from "@mui/icons-material/AccountCircle"

// top navigation bar
function AppBar({ user, isAuthPage, isMobile, handleDrawerToggle, handleLogout }) {
  return (
    <MuiAppBar
      position="fixed"
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, height: { xs: 56, sm: 64 } }}
    >
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: { xs: 1, sm: 2 },
          minHeight: { xs: 56, sm: 64 },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {/* show menu button only on mobile and not on auth pages */}
          {!isAuthPage && isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              aria-label="Open navigation"
              sx={{ ml: 1, mr: 1.5, p: { xs: 0.5, sm: 1 }, display: { xs: "inline-flex", md: "none" }}}
            >
              <MenuIcon sx={{ fontSize: { xs: 22, sm: 24 } }} />
            </IconButton>
          )}
          
           {/* app logo + title */}
          <HubIcon sx={{ fontSize: { xs: 26, sm: 30, md: 32 }, color: "inherit", ml: isMobile ? 1 : 0}} />
          <Typography
            variant="h6"
            noWrap
            sx={{
              fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
              overflow: "hidden",
              textOverflow: "ellipsis",
              ml: isMobile ? 0.8 : 1.5,
              letterSpacing: { xs: 0.1, md: 0.2 },
            }}
          >
            NodeShare
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center" }}>
          {!isAuthPage && user && (
            <Tooltip title={user.email || ""} arrow>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  ml: { xs: 1, sm: 1.5 },
                  cursor: "pointer",
                  gap: { xs: 0.5, sm: 1 },
                }}
                aria-label="Account"
              >
                <AccountCircleIcon sx={{ fontSize: { xs: 20, sm: 22 } }} />
                <Typography
                  noWrap
                  sx={{
                    display: { xs: "none", sm: "block" },
                    fontSize: { sm: "0.95rem", md: "1rem" },
                    maxWidth: { sm: 160, md: 220 },
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {user.username}
                </Typography>
              </Box>
            </Tooltip>
          )}

          {!isAuthPage && (
            <Tooltip title="Logout">
              <IconButton
                onClick={handleLogout}
                aria-label="Logout"
                sx={{ ml: { xs: 1, sm: 2.5 }, p: { xs: 0.75, sm: 1 } }}
              >
                <LogoutIcon sx={{ color: "#ef4444", fontSize: { xs: 20, sm: 22 } }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Toolbar>
    </MuiAppBar>
  )
}

export default AppBar
