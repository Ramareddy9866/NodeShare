import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material';

// dialog component for confirmations
const AppDialog = ({
  open,
  onClose,
  title,
  content,
  actions,
  DialogProps = {},
  ...rest
}) => (
  <Dialog open={open} onClose={onClose} {...DialogProps} {...rest}>
    {title && <DialogTitle>{title}</DialogTitle>}
    {content && (
      <DialogContent>
        {typeof content === 'string' ? (
          <DialogContentText>{content}</DialogContentText>
        ) : (
          content
        )}
      </DialogContent>
    )}
    {actions && <DialogActions>{actions}</DialogActions>}
  </Dialog>
);

export default AppDialog; 