import React, { useState } from 'react';
import { TextField, Button, Typography, Container, Card, CardContent, Box } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import AppAlert from '../../components/AppAlert';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  // get token from URL
  const params = new URLSearchParams(location.search);
  const token = params.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setFieldError('');
    // validate password requirements
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      setFieldError('Password must be at least 8 characters and include a number and a letter');
      return;
    }
    if (!confirmPassword) {
      setFieldError('Please confirm your password');
      return;
    }
    if (password !== confirmPassword) {
      setFieldError('Passwords do not match');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        setTimeout(() => navigate('/login'), 2000);
      } else setError(data.message);
    } catch (err) {
      setError('Something went wrong.');
    }
  };

  if (!token) return <AppAlert severity="error">Invalid or missing token.</AppAlert>;

  return (
    <Container maxWidth="xs" sx={{ minHeight: '80vh', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', mt: 10 }}>
      <Card sx={{ width: '100%', maxWidth: 400, bgcolor: '#F9FAFB', color: '#111827', border: '1.5px solid #64748B', boxShadow: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h5" align="center" gutterBottom sx={{ mt: 1, mb: 2, fontWeight: 600 }}>Reset Password</Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="New Password"
              type="password"
              fullWidth
              margin="normal"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <TextField
              label="Confirm Password"
              type="password"
              fullWidth
              margin="normal"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              error={!!fieldError}
              helperText={fieldError}
            />
            <Box mt={2}>
              <Button type="submit" variant="contained" color="primary" fullWidth>
                Reset Password
              </Button>
            </Box>
          </form>
          {message && <AppAlert severity="success" sx={{ mt: 2 }}>{message}</AppAlert>}
          {error && <AppAlert severity="error" sx={{ mt: 2 }}>{error}</AppAlert>}
        </CardContent>
      </Card>
    </Container>
  );
};

export default ResetPassword; 