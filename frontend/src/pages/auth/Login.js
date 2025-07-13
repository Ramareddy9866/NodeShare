import React, { useState, useEffect } from 'react';
import { TextField, Button, Typography, Container, Box, Card, CardContent, CardActions, Link as MuiLink, IconButton } from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { API_BASE_URL } from '../../config';
import AppAlert from '../../components/AppAlert';

export default function Login({ setUser }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  // clear error message after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // validate form fields
  const validate = () => {
    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email) errs.email = 'Email is required';
    else if (!emailRegex.test(form.email)) errs.email = 'Invalid email format';
    if (!form.password) errs.password = 'Password is required';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFieldErrors({ ...fieldErrors, [e.target.name]: undefined });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login`, form);
      localStorage.setItem('token', res.data.token);
      // get user profile
      try {
        const userRes = await axios.get(`${API_BASE_URL}/users/me`, {
          headers: { Authorization: 'Bearer ' + res.data.token }
        });
        if (userRes.status === 200) {
          setUser(userRes.data);
        }
      } catch {}
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ minHeight: '80vh', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', mt: 4 }}>
      <Card sx={{ width: '100%', maxWidth: 360, bgcolor: '#F9FAFB', color: '#111827', border: '1.5px solid #64748B', boxShadow: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" flexDirection="column" alignItems="center" mb={0.5}>
            <LoginIcon sx={{ fontSize: 56, color: '#38BDF8', mb: 1.5 }} />
            <Typography variant="h4" align="center" gutterBottom color="#1E3A8A" sx={{ fontWeight: 700, fontSize: 28 }}>
              Login
            </Typography>
          </Box>
          {error && <AppAlert severity="error" sx={{ mb: 2 }}>{error}</AppAlert>}
          <form onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              error={!!fieldErrors.email}
              helperText={fieldErrors.email}
              sx={{ 
                '& .MuiInputBase-root': { 
                  background: '#fff', 
                  fontSize: 15 
                } 
              }}
              size="medium"
            />
            <TextField
              margin="normal"
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
              required
              error={!!fieldErrors.password}
              helperText={fieldErrors.password}
              sx={{ 
                '& .MuiInputBase-root': { 
                  background: '#fff', 
                  fontSize: 15 
                } 
              }}
              InputProps={{
                endAdornment: (
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword((show) => !show)}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                )
              }}
              size="medium"
            />
            <CardActions sx={{ justifyContent: 'center', mt: 2, p: 0 }}>
              <Button type="submit" fullWidth variant="contained" sx={{ background: '#1E3A8A', color: '#F9FAFB', '&:hover': { background: '#163172' }, fontSize: 16, py: 1.2 }} size="medium">
                Login
              </Button>
            </CardActions>
          </form>
        </CardContent>
        <Box textAlign="center" pb={1}>
          <MuiLink component={Link} to="/forgot-password" sx={{ color: '#1E3A8A', fontSize: 15 }} underline="hover">
            Forgot Password?
          </MuiLink>
        </Box>
        <Box textAlign="center" pb={1.5}>
          <Typography variant="body2" color="#64748B" sx={{ fontSize: 15 }}>
            Don't have an account?{' '}
            <MuiLink component={Link} to="/signup" sx={{ color: '#1E3A8A', fontSize: 15 }} underline="hover">
              Register
            </MuiLink>
          </Typography>
        </Box>
      </Card>
    </Container>
  );
} 