import React, { useState } from 'react';
import { TextField, Button, Typography, Container, Box, Card, CardContent, CardActions, Link as MuiLink, IconButton } from '@mui/material';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { API_BASE_URL } from '../../config';
import AppAlert from '../../components/AppAlert';

export default function Signup() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  // validate form fields
  const validate = () => {
    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    if (!form.username) errs.username = 'Username is required';
    if (!form.email) errs.email = 'Email is required';
    else if (!emailRegex.test(form.email)) errs.email = 'Invalid email format';
    if (!form.password) errs.password = 'Password is required';
    else if (!passwordRegex.test(form.password)) errs.password = 'Password must be at least 8 characters and include a number and a letter';
    if (!form.confirmPassword) errs.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFieldErrors({ ...fieldErrors, [e.target.name]: undefined });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!validate()) return;
    try {
      await axios.post(`${API_BASE_URL}/auth/signup`, {
        username: form.username,
        email: form.email,
        password: form.password
      });
      setSuccess('Signup successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ minHeight: '80vh', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', mt: 4 }}>
      <Card sx={{ width: '100%', maxWidth: 360, bgcolor: '#F9FAFB', color: '#111827', border: '1.5px solid #64748B', boxShadow: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" flexDirection="column" alignItems="center" mb={0.5}>
            <PersonAddAlt1Icon sx={{ fontSize: 56, color: '#38BDF8', mb: 1.5 }} />
            <Typography variant="h4" align="center" gutterBottom color="#1E3A8A" sx={{ fontWeight: 700, fontSize: 28 }}>
              Register
            </Typography>
          </Box>
          {error && <AppAlert severity="error" sx={{ mb: 2 }}>{error}</AppAlert>}
          {success && <AppAlert severity="success" sx={{ mb: 2 }}>{success}</AppAlert>}
          <form onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              fullWidth
              label="Username"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              error={!!fieldErrors.username}
              helperText={fieldErrors.username}
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
            <TextField
              margin="normal"
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={handleChange}
              required
              error={!!fieldErrors.confirmPassword}
              helperText={fieldErrors.confirmPassword}
              sx={{ 
                '& .MuiInputBase-root': { 
                  background: '#fff', 
                  fontSize: 15 
                } 
              }}
              InputProps={{
                endAdornment: (
                  <IconButton
                    aria-label="toggle confirm password visibility"
                    onClick={() => setShowConfirmPassword((show) => !show)}
                    edge="end"
                    size="small"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                )
              }}
              size="medium"
            />
            <CardActions sx={{ justifyContent: 'center', mt: 2, p: 0 }}>
              <Button type="submit" fullWidth variant="contained" sx={{ background: '#1E3A8A', color: '#F9FAFB', '&:hover': { background: '#163172' }, fontSize: 16, py: 1.2 }} size="medium">
                Register
              </Button>
            </CardActions>
          </form>
        </CardContent>
        <Box textAlign="center" pb={1.5}>
          <Typography variant="body2" color="#64748B" sx={{ fontSize: 15 }}>
            Already have an account?{' '}
            <MuiLink component={Link} to="/login" sx={{ color: '#1E3A8A', fontSize: 15 }} underline="hover">
              Login
            </MuiLink>
          </Typography>
        </Box>
      </Card>
    </Container>
  );
} 