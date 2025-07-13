import React, { useState } from 'react';
import { TextField, Button, Typography, InputLabel, FormHelperText, Card, CardContent, Box } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import AppAlert from '../components/AppAlert';

export default function FileUpload() {
  const [file, setFile] = useState(null);
  const [accessDepth, setAccessDepth] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  // validate form fields
  const validate = () => {
    const errs = {};
    if (!file) errs.file = 'Please select a file';
    if (accessDepth === '' || isNaN(accessDepth) || accessDepth < 0) errs.accessDepth = 'Access depth must be 0 or greater';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFileChange = e => {
    setFile(e.target.files[0]);
    setFieldErrors({ ...fieldErrors, file: undefined });
  };
  const handleDepthChange = e => {
    setAccessDepth(e.target.value);
    setFieldErrors({ ...fieldErrors, accessDepth: undefined });
  };

  // upload file to server
  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!validate()) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('accessDepth', accessDepth);
    try {
      await axios.post(`${API_BASE_URL}/files/upload`, formData, {
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
          'Content-Type': 'multipart/form-data'
        }
      });
      setSuccess('File uploaded! Redirecting...');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    }
  };

  return (
    <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', mt: 6, px: 2 }}>
      <Card sx={{ width: '100%', maxWidth: 400, bgcolor: '#F9FAFB', color: '#111827', border: '1.5px solid #64748B', boxShadow: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h5" align="center" gutterBottom sx={{ mt: 1, mb: 2, fontWeight: 600 }}>Upload File</Typography>
          {error && <AppAlert severity="error">{error}</AppAlert>}
          {success && <AppAlert severity="success">{success}</AppAlert>}
          <form onSubmit={handleSubmit} noValidate>
            <InputLabel sx={{ mt: 2 }}>Select File</InputLabel>
            <input type="file" onChange={handleFileChange} required style={{ marginBottom: 8 }} />
            {fieldErrors.file && <FormHelperText error>{fieldErrors.file}</FormHelperText>}
            <FormHelperText sx={{ mt: 1, mb: 0.5, fontWeight: 500, color: 'text.secondary' }}>
              Hops (access depth) is the maximum number of times this file can be reshared through your network.
            </FormHelperText>
            <FormHelperText sx={{ mb: 1, color: 'text.secondary' }}>
              Hops 0 means this file is not shareable with anyone.
            </FormHelperText>
            <TextField
              margin="normal"
              fullWidth
              label="Access Depth (hops)"
              type="number"
              inputProps={{ min: 0, max: 10 }}
              value={accessDepth}
              onChange={handleDepthChange}
              required
              error={!!fieldErrors.accessDepth}
              helperText={fieldErrors.accessDepth || ''}
            />
            <Button type="submit" fullWidth variant="contained" color="primary" sx={{ mt: 2 }}>
              Upload
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
} 