import React, { useState, useEffect } from 'react';
import { TextField, Button, Typography, Container, Card, CardContent, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import AppAlert from '../../components/AppAlert';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // clear success message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) setMessage(data.message);
      else setError(data.message);
    } catch (err) {
      setError('Something went wrong.');
    }
  };

  return (
    <Container maxWidth="xs" sx={{ minHeight: '80vh', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', mt: 10 }}>
      <Card sx={{ width: '100%', maxWidth: 400, bgcolor: '#F9FAFB', color: '#111827', border: '1.5px solid #64748B', boxShadow: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h5" align="center" gutterBottom sx={{ mt: 1, mb: 2, fontWeight: 600 }}>Forgot Password</Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Email"
              fullWidth
              margin="normal"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <Box mt={2}>
              <Button type="submit" variant="contained" color="primary" fullWidth>
                Send Reset Link
              </Button>
            </Box>
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
              onClick={() => navigate('/login')}
            >
              Back to Login
            </Button>
          </form>
          {message && <AppAlert severity="success" sx={{ mt: 2 }}>{message}</AppAlert>}
          {error && <AppAlert severity="error" sx={{ mt: 2 }}>{error}</AppAlert>}
        </CardContent>
      </Card>
    </Container>
  );
};

export default ForgotPassword; 