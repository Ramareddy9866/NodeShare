import React from 'react';
import { List, ListItem, Box, Typography, IconButton, Tooltip, Button, Chip } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ShareIcon from '@mui/icons-material/Share';
import DeleteIcon from '@mui/icons-material/Delete';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import DescriptionIcon from '@mui/icons-material/Description';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

// get icon based on file type
const getFileIcon = (mimetype) => {
  if (mimetype.startsWith('image/')) return <ImageIcon color="primary" sx={{ mr: 1 }} />;
  if (mimetype === 'application/pdf') return <PictureAsPdfIcon color="error" sx={{ mr: 1 }} />;
  if (mimetype.startsWith('text/')) return <DescriptionIcon color="secondary" sx={{ mr: 1 }} />;
  return <InsertDriveFileIcon color="action" sx={{ mr: 1 }} />;
};

// file list component
const FileList = ({
  files = [],
  imagePreviews = {},
  sharedByMap = {},
  actions = {},
  showOwner = false,
  showShare = false,
  showRevoke = false,
  section = "my"
}) => (
  <List>
    {files.length === 0 && (
      <ListItem sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 100, width: '100%' }}>
        <Typography variant="body2" color="text.secondary" sx={{ width: '100%', textAlign: 'center', justifyContent: 'center' }}>
          {section === "my" ? 'No files found.' : 'No files shared with you yet.'}
        </Typography>
      </ListItem>
    )}
    {files.map(file => (
      <ListItem key={file._id} divider sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          {file.mimetype?.startsWith('image/') && imagePreviews[file._id] ? (
            <img src={imagePreviews[file._id]} alt={file.originalname} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4, marginRight: 8 }} />
          ) : getFileIcon(file.mimetype)}
          <Box>
            <Typography noWrap sx={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1 }}>
              {file.originalname}
              {section === 'my' && (
                <Chip
                  label={`Hop Limit: ${file.accessDepth}`}
                  size="small"
                  sx={{ ml: 1, fontSize: '0.75rem', height: 22 }}
                />
              )}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {showOwner && (<>Owner: {file.owner?.username || file.owner} </>)}
              {sharedByMap && sharedByMap[file._id] && (
                <>| Shared by: {sharedByMap[file._id].username}</>
              )}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexDirection: 'column', minWidth: 0 }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {/* only show for shareable files */}
            {file.accessDepth !== 0 && (
              <Button
                variant="contained"
                size="small"
                startIcon={<AccountTreeIcon />}
                onClick={() => actions.onAccessGraph(file._id)}
                sx={{
                  backgroundColor: '#38BDF8',
                  color: 'white',
                  borderColor: '#38BDF8',
                  '&:hover': {
                    backgroundColor: '#0ea5e9',
                    borderColor: '#0ea5e9'
                  },
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  py: 0.5,
                  px: 1
                }}
              >
                Access Graph
              </Button>
            )}
            <Tooltip title="Download"><IconButton onClick={() => actions.onDownload(file._id, file.originalname)}><DownloadIcon /></IconButton></Tooltip>
            <Tooltip title="View"><IconButton onClick={() => actions.onView(file._id, file.originalname)}><VisibilityIcon /></IconButton></Tooltip>
            {showShare && (
              <Tooltip title="Share">
                <IconButton onClick={() => actions.onShare(file)}>
                  <ShareIcon />
                </IconButton>
              </Tooltip>
            )}
            {showRevoke && (
              <Tooltip title={section === "my" ? "Delete" : "Revoke Access"}>
                <IconButton onClick={() => actions.onDelete(file)}>
                  <DeleteIcon sx={{ color: '#ef4444', fontSize: 22 }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
      </ListItem>
    ))}
  </List>
);

export default FileList; 