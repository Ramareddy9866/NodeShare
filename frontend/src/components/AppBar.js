import React from 'react';
import { AppBar as MuiAppBar, Toolbar, Typography, Box, IconButton, Tooltip } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HubIcon from '@mui/icons-material/Hub';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

function AppBar({ user, isAuthPage, isMobile, handleDrawerToggle, handleLogout}) {
  return (
    <MuiAppBar
      position="fixed"
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
    >
      <Toolbar sx={{ display: 'flex', alignItems: 'center', flexWrap: 'nowrap' }}>
        {/* logo and title */}
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2, ml: 3 }}>
          <HubIcon sx={{ mr: 1, fontSize: 32, color: '#fff' }} />
          <Typography variant="h6" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            NodeShare
          </Typography>
        </Box>
        {/* mobile menu button */}
        {!isAuthPage && isMobile && (
          <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
        )}
        <Box sx={{ flexGrow: 1 }} />
        {/* user info */}
        {!isAuthPage && user && (
          <Tooltip title={user.email || ''} arrow>
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 1.5, cursor: 'pointer' }}>
              <AccountCircleIcon sx={{ fontSize: 22, mr: 1 }} />
              <Typography sx={{ whiteSpace: 'nowrap' }}>{user.username}</Typography>
            </Box>
          </Tooltip>
        )}
        {/* logout button */}
        {!isAuthPage && (
          <Tooltip title="Logout">
            <IconButton onClick={handleLogout} sx={{ ml: 3 }}>
              <LogoutIcon sx={{ color: '#ef4444', fontSize: 22 }} />
            </IconButton>
          </Tooltip>
        )}
      </Toolbar>
    </MuiAppBar>
  );
}

export default AppBar; 