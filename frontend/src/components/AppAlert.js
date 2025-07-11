import React from 'react';
import { Alert } from '@mui/material';

// alert component for messages
const AppAlert = ({ severity = 'info', children, sx, onClose, ...rest }) => (
  <Alert severity={severity} sx={sx} onClose={onClose} {...rest}>
    {children}
  </Alert>
);

export default AppAlert; 