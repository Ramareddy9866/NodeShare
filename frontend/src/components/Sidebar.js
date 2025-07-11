import React from 'react';
import { Drawer, Box } from '@mui/material';

const drawerWidth = 220;

// sidebar navigation component
function Sidebar({ isAuthPage, mobileOpen, handleDrawerToggle, theme, drawer }) {
  if (isAuthPage) return null;
  return (
    <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
      {/* mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, overflow: 'hidden' },
        }}
      >
        {drawer}
      </Drawer>
      {/* desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            top: '64px',
            height: 'calc(100% - 64px)',
            position: 'fixed',
            backgroundColor: theme.palette.secondary.main,
            color: theme.palette.text.primary,
            overflow: 'hidden',
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
}

export default Sidebar; 