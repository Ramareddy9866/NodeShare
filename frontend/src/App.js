import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, Link } from 'react-router-dom';
import { Toolbar, CssBaseline, Box, useMediaQuery, List, ListItem, ListItemText } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import { useTheme } from '@mui/material/styles';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Dashboard from './pages/Dashboard';
import FileUpload from './pages/FileUpload';
import Friends from './pages/Friends';
import AccessGraph from './pages/AccessGraph';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import { API_BASE_URL } from './config';
import AppBar from './components/AppBar';
import Sidebar from './components/Sidebar';

const drawerWidth = 220;

function App() {
  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();

  // check if current page is auth page
  const isAuthPage =
    location.pathname === '/login' ||
    location.pathname === '/signup' ||
    location.pathname === '/forgot-password' ||
    location.pathname === '/reset-password';

  // load user data on app start
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE_URL}/users/me`, {
          headers: { Authorization: 'Bearer ' + token }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch {}
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // sidebar navigation menu
  const drawer = (
    <Box sx={{
      height: '100%',
      backgroundColor: theme.palette.secondary.main,
      borderRight: '1px solid rgba(255,255,255,0.08)',
      boxShadow: '2px 0 8px rgba(0,0,0,0.08)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      minHeight: '100vh',
      p: 0,
      overflow: 'hidden',
      color: '#F8FAFC', // white text
    }}>
    
    
      <List sx={{ flex: 1, mt: 3 }}>
        <ListItem
          button
          component={Link}
          to="/dashboard"
          onClick={() => isMobile && setMobileOpen(false)}
          selected={location.pathname === '/dashboard'}
          sx={{
            borderRadius: 2,
            mx: 1,
            my: 0.5,
            color: '#F9FAFB',
            '& .MuiSvgIcon-root': { color: '#F9FAFB' },
            '&.Mui-selected, &.Mui-selected:hover': {
              backgroundColor: theme.palette.accent.main,
              color: theme.palette.primary.main,
              '& .MuiSvgIcon-root': { color: theme.palette.primary.main },
            },
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
            }
          }}
        >
          <DashboardIcon sx={{ mr: 2 }} />
          <ListItemText primary="Dashboard" />
        </ListItem>
  
        <ListItem
          button
          component={Link}
          to="/friends"
          onClick={() => isMobile && setMobileOpen(false)}
          selected={location.pathname === '/friends'}
          sx={{
            borderRadius: 2,
            mx: 1,
            my: 0.5,
            color: '#F9FAFB',
            '& .MuiSvgIcon-root': { color: '#F9FAFB' },
            '&.Mui-selected, &.Mui-selected:hover': {
              backgroundColor: theme.palette.accent.main,
              color: theme.palette.primary.main,
              '& .MuiSvgIcon-root': { color: theme.palette.primary.main },
            },
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
            }
          }}
        >
          <PeopleIcon sx={{ mr: 2 }} />
          <ListItemText primary="Friends" />
        </ListItem>
      </List>
      <Box sx={{ flexGrow: 0, mb: 2 }} />
    </Box>
  );
  
  

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        user={user}
        isAuthPage={isAuthPage}
        isMobile={isMobile}
        handleDrawerToggle={handleDrawerToggle}
        handleLogout={handleLogout}
        theme={theme}
      />
      <Sidebar
        isAuthPage={isAuthPage}
        isMobile={isMobile}
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
        location={location}
        theme={theme}
        drawer={drawer}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          px: { xs: 1, sm: 2, md: 3 },
          py: 3,
          width: '100%',
          maxWidth: '100vw',
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Toolbar />
        <Routes>
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/signup" element={<Signup setUser={setUser} />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload" element={<FileUpload />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/access-graph/:fileId" element={<AccessGraph />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;
