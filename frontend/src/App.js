import React from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { Toolbar, CssBaseline, Box, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";

import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Dashboard from "./pages/Dashboard";
import FileUpload from "./pages/FileUpload";
import Friends from "./pages/Friends";
import AccessGraph from "./pages/AccessGraph";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

import AppBar from "./components/AppBar";
import Sidebar from "./components/Sidebar";

import { useAuth } from "./AuthContext";

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;

  return children;
}

function AppContent() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();

  const authPaths = ["/login", "/signup", "/forgot-password", "/reset-password"];
  const isAuthPage = authPaths.includes(location.pathname);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      <AppBar
        user={user}
        isAuthPage={isAuthPage}
        isMobile={isMobile}
        handleDrawerToggle={handleDrawerToggle}
        handleLogout={logout}
        theme={theme}
      />

      <Sidebar
        isAuthPage={isAuthPage}
        isMobile={isMobile}
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
        location={location}
        theme={theme}
      />

      <Box
        component="main"
        sx={{ 
          flexGrow: 1,
          px: { xs: 1, sm: 2, md: 3 },
          py: 3,
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Toolbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <FileUpload />
              </ProtectedRoute>
            }
          />
          <Route
            path="/friends"
            element={
              <ProtectedRoute>
                <Friends />
              </ProtectedRoute>
            }
          />
          <Route
            path="/access-graph/:fileId"
            element={
              <ProtectedRoute>
                <AccessGraph />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default function App() {
  return <AppContent />;
}
