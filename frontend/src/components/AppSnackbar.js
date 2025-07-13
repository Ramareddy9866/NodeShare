import React from 'react';
import { Snackbar, Alert } from '@mui/material';

// snackbar component for notifications
const AppSnackbar = ({
  open,
  onClose,
  severity = 'info',
  message,
  autoHideDuration = 3000,
  anchorOrigin = { vertical: 'bottom', horizontal: 'center' },
  ...rest
}) => (
  <Snackbar
    open={open}
    autoHideDuration={autoHideDuration}
    onClose={onClose}
    anchorOrigin={anchorOrigin}
    {...rest}
  >
    <Alert onClose={onClose} severity={severity} sx={{ width: '100%' }}>
      {message}
    </Alert>
  </Snackbar>
);

export default AppSnackbar; 