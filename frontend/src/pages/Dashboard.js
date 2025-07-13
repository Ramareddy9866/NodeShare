import React, { useEffect, useState } from 'react';
import {
  Button, Typography, Box,
  Accordion, AccordionSummary, AccordionDetails,
  Card, CardContent
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { API_BASE_URL } from '../config';
import AppAlert from '../components/AppAlert';
import AppSnackbar from '../components/AppSnackbar';
import AppDialog from '../components/AppDialog';
import FileList from '../components/FileList';
import axios from 'axios';
import Skeleton from '@mui/material/Skeleton';
import DialogContentText from '@mui/material/DialogContentText';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import FolderSharedIcon from '@mui/icons-material/FolderShared';

export default function Dashboard() {
  const navigate = useNavigate();
  const [myFiles, setMyFiles] = useState([]);
  const [sharedFiles, setSharedFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [imagePreviews, setImagePreviews] = useState({});
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [fileToShare, setFileToShare] = useState(null);
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [shareLoading, setShareLoading] = useState(false);
  const [fileHops, setFileHops] = useState({});
  const [sharedByMap, setSharedByMap] = useState({});
  const [accessList, setAccessList] = useState([]);

  // load user's files
  const fetchFiles = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const [myRes, sharedRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/files/my`, { headers: { Authorization: 'Bearer ' + token } }),
        axios.get(`${API_BASE_URL}/files/shared`, { headers: { Authorization: 'Bearer ' + token } })
      ]);
      setMyFiles(myRes.data.files || []);
      setSharedFiles(sharedRes.data.files || []);
    } catch {
      setError('Failed to fetch files');
    }
    setLoading(false);
  };

  useEffect(() => { fetchFiles(); }, []);

  // download file
  const handleDownload = async (fileId, filename) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/files/${fileId}/download`, {
        headers: { Authorization: 'Bearer ' + token }
      });
      if (!res.ok) {
        const err = await res.json();
        setSnackbar({ open: true, message: err.message || 'Download failed', severity: 'error' });
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setSnackbar({ open: true, message: 'Download started', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Download failed', severity: 'error' });
    }
  };

  // view file in new tab
  const handleView = async (fileId, filename) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/files/${fileId}/download`, {
        headers: { Authorization: 'Bearer ' + token }
      });
      if (!res.ok) {
        const err = await res.json();
        setSnackbar({ open: true, message: err.message || 'View failed', severity: 'error' });
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => window.URL.revokeObjectURL(url), 10000);
      setSnackbar({ open: true, message: 'File opened in new tab', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'View failed', severity: 'error' });
    }
  };

  const handleDeleteClick = (file) => {
    setFileToDelete(file);
    setDeleteDialogOpen(true);
  };

  // delete file or revoke access
  const handleDeleteConfirm = async () => {
    if (!fileToDelete) return;
    try {
      const token = localStorage.getItem('token');
      const userId = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).id;
      const isOwner = fileToDelete.owner && (fileToDelete.owner._id === undefined ? fileToDelete.owner === userId : fileToDelete.owner._id === userId);
      
      if (isOwner) {
        // owner deletes file
        await fetch(`${API_BASE_URL}/files/${fileToDelete._id}`, {
          method: 'DELETE',
          headers: { Authorization: 'Bearer ' + token }
        });
        setSnackbar({ open: true, message: 'File deleted successfully', severity: 'success' });
        // update UI
        setMyFiles(prev => prev.filter(f => f._id !== fileToDelete._id));
        setSharedFiles(prev => prev.filter(f => f._id !== fileToDelete._id));
      } else {
        // non-owner revokes access
        await fetch(`${API_BASE_URL}/files/${fileToDelete._id}/revoke`, {
          method: 'DELETE',
          headers: { Authorization: 'Bearer ' + token }
        });
        setSnackbar({ open: true, message: 'Access revoked successfully', severity: 'success' });
      }
      setDeleteDialogOpen(false);
      setFileToDelete(null);
      fetchFiles();
    } catch (error) {
      console.error('Delete/Revoke error:', error);
      setSnackbar({ open: true, message: 'Operation failed', severity: 'error' });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setFileToDelete(null);
  };

  const handleAccessGraph = (fileId) => {
    navigate(`/access-graph/${fileId}`);
  };

  // get image preview for display
  const fetchImagePreview = async (file) => {
    if (imagePreviews[file._id]) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/files/${file._id}/download`, {
        headers: { Authorization: 'Bearer ' + token }
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      setImagePreviews(prev => ({ ...prev, [file._id]: url }));
    } catch {}
  };

  // get user's hop level for file
  const fetchFileHop = async (fileId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/files/${fileId}/my-hop`, { headers: { Authorization: 'Bearer ' + token } });
      setFileHops(prev => ({ ...prev, [fileId]: res.data.hop }));
    } catch {}
  };

  // load image previews and hop levels
  useEffect(() => {
    myFiles.concat(sharedFiles).forEach(file => {
      if (file.mimetype?.startsWith('image/')) {
        fetchImagePreview(file);
      }
      fetchFileHop(file._id);
    });
    return () => {
      Object.values(imagePreviews).forEach(url => window.URL.revokeObjectURL(url));
    };
  }, [myFiles, sharedFiles]);

  // get user's friends list
  const fetchFriends = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/users/me`, { headers: { Authorization: 'Bearer ' + token } });
      setFriends(res.data.friends || []);
    } catch {}
  };

  // open share dialog
  const handleOpenShareDialog = async (file) => {
    setFileToShare(file);
    setSelectedFriends([]);
    setShareDialogOpen(true);
    fetchFriends();
    // get full access list
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/files/${file._id}/full-access-list`, { headers: { Authorization: 'Bearer ' + token } });
      setAccessList(res.data.authorizedUsers || []);
    } catch {
      setAccessList([]);
    }
  };

  const handleCloseShareDialog = () => {
    setShareDialogOpen(false);
    setFileToShare(null);
    setSelectedFriends([]);
  };

  const handleToggleFriend = (friendId) => {
    setSelectedFriends(prev => prev.includes(friendId) ? prev.filter(id => id !== friendId) : [...prev, friendId]);
  };

  // share file with selected friends
  const handleShareConfirm = async () => {
    if (!fileToShare || selectedFriends.length === 0) return;
    setShareLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // use correct access depth
      let accessDepthToUse = fileToShare.accessDepth;
      
      // for shared files, use user's hop count
      const isShared = sharedFiles.some(f => f._id === fileToShare._id);
      if (isShared && fileHops && fileHops[fileToShare._id] !== undefined) {
        accessDepthToUse = fileHops[fileToShare._id];
      }
      
      await axios.post(`${API_BASE_URL}/files/${fileToShare._id}/share`, {
        friends: selectedFriends,
        accessDepth: accessDepthToUse
      }, { headers: { Authorization: 'Bearer ' + token } });
      setSnackbar({ open: true, message: 'File shared successfully', severity: 'success' });
      setShareDialogOpen(false);
      setFileToShare(null);
      setSelectedFriends([]);
      fetchFiles();
      // update access list
      try {
        const res = await axios.get(`${API_BASE_URL}/files/${fileToShare._id}/access-list`, { headers: { Authorization: 'Bearer ' + token } });
        window.localStorage.setItem(`accessList_${fileToShare._id}`, JSON.stringify(res.data.authorizedUsers));
      } catch (error) {
        console.error('Failed to update access list:', error);
      }
    } catch (error) {
      console.error('Share error:', error);
      const backendMsg = error.response?.data?.message || '';
      if (backendMsg.toLowerCase().includes('hop') && backendMsg.toLowerCase().includes('limit')) {
        setSnackbar({ open: true, message: 'Hop limit reached. Cannot share this file further.', severity: 'error' });
      } else {
        setSnackbar({ open: true, message: 'Failed to share file', severity: 'error' });
      }
    }
    setShareLoading(false);
  };

  // get who shared each file with user
  useEffect(() => {
    const fetchSharedBy = async () => {
      const token = localStorage.getItem('token');
      const userId = (() => {
        try {
          const t = localStorage.getItem('token');
          if (!t) return null;
          return JSON.parse(atob(t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).id;
        } catch { return null; }
      })();
      if (!userId) return;
      const promises = sharedFiles.map(async (file) => {
        try {
          const res = await fetch(`${API_BASE_URL}/files/${file._id}/why/${userId}`, {
            headers: { Authorization: 'Bearer ' + token }
          });
          if (!res.ok) return [file._id, null];
          const data = await res.json();
          // last user before current user is the sharer
          if (data.path && data.path.length >= 2) {
            return [file._id, data.path[data.path.length - 2]];
          }
          return [file._id, null];
        } catch {
          return [file._id, null];
        }
      });
      const results = await Promise.all(promises);
      const map = {};
      results.forEach(([fileId, user]) => { map[fileId] = user; });
      setSharedByMap(map);
    };
    if (sharedFiles.length > 0) fetchSharedBy();
  }, [sharedFiles]);

  return (
    <Box sx={{ width: '100%', px: { xs: 1, sm: 2, md: 4 }, pt: 1, pb: 3, minHeight: '100vh', backgroundColor: (theme) => theme.palette.background.default }}>
     <Box mt={1} mb={2}>
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      width: '100%',
    }}
  >
    <Typography
      variant="h5"
      sx={{
        width: { md: `calc(100% - 220px)` },
        textAlign: 'center',
        fontWeight: 600,
      }}
    >
      YOUR FILES ON NODESHARE
    </Typography>
  </Box>

  <Box display="flex" justifyContent="flex-end" sx={{ mt: 2 }}>
  <Button
    variant="contained"
    onClick={() => navigate('/upload')}
    sx={{
      mr: { xs: 0, md: 2 },
      px: 4,
      py: 1.2,
      fontSize: '1rem',
      fontWeight: 600,
      textTransform: 'none',
      borderRadius: '8px',
      boxShadow: 2,
      backgroundColor: '#38BDF8',
      color: '#fff',
      '&:hover': {
        backgroundColor: '#0ea5e9'
      }
    }}
  >
    Upload File
  </Button>
</Box>



</Box>



      {loading ? (
        <Box>
          <Typography variant="h6">My Uploaded Files</Typography>
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={48} sx={{ mb: 1, borderRadius: 1 }} />
          ))}
          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Shared With Me</Typography>
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={48} sx={{ mb: 1, borderRadius: 1 }} />
          ))}
        </Box>
      ) : error ? <AppAlert severity="error">{error}</AppAlert> : (
        <>
          <Card sx={{ mb: 4, backgroundColor: '#F3F4F6', border: '1px solid #E2E8F0', boxShadow: '0px 1px 3px rgba(0,0,0,0.1)', borderRadius: 2 }}>
  <CardContent sx={{ maxHeight: { xs: 'none', md: 300 }, overflowY: { xs: 'visible', md: 'auto' }, color: (theme) => theme.palette.text.primary, px: 3, py: 2 }}>
    <Typography variant="h6" gutterBottom sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
      <InsertDriveFileIcon sx={{ fontSize: 22, mr: 1 }} /> My Uploaded Files
    </Typography>
    <Accordion sx={{ mb: 2, backgroundColor: 'transparent', boxShadow: 'none' }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: 16 }}>Shareable Files</Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0 }}>
        <FileList
          files={myFiles.filter(f => f.accessDepth > 0)}
          imagePreviews={imagePreviews}
          fileHops={fileHops}
          actions={{
            onDownload: handleDownload,
            onView: handleView,
            onShare: handleOpenShareDialog,
            onDelete: handleDeleteClick,
            onAccessGraph: handleAccessGraph
          }}
          showShare={true}
          showRevoke={true}
          section="my"
        />
      </AccordionDetails>
    </Accordion>
    <Accordion sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: 16 }}>Non-shareable Files</Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0 }}>
        <FileList
          files={myFiles.filter(f => f.accessDepth === 0)}
          imagePreviews={imagePreviews}
          actions={{
            onDownload: handleDownload,
            onView: handleView,
            onDelete: handleDeleteClick,
            onAccessGraph: handleAccessGraph
          }}
          showRevoke={true}
          section="my"
        />
      </AccordionDetails>
    </Accordion>
  </CardContent>
</Card>

<Card sx={{ backgroundColor: '#F3F4F6', border: '1px solid #E2E8F0', boxShadow: '0px 1px 3px rgba(0,0,0,0.1)', borderRadius: 2 }}>
  <CardContent sx={{ maxHeight: { xs: 'none', md: 300 }, overflowY: { xs: 'visible', md: 'auto' }, color: (theme) => theme.palette.text.primary, px: 3, py: 2 }}>
    <Typography variant="h6" gutterBottom sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
      <FolderSharedIcon sx={{ fontSize: 22, mr: 1 }} /> Shared With Me
    </Typography>
    <FileList
      files={sharedFiles}
      imagePreviews={imagePreviews}
      fileHops={fileHops}
      sharedByMap={sharedByMap}
      actions={{
        onDownload: handleDownload,
        onView: handleView,
        onShare: handleOpenShareDialog,
        onDelete: handleDeleteClick,
        onAccessGraph: handleAccessGraph
      }}
      showOwner={true}
      showShare={true}
      showRevoke={true}
      section="shared"
    />
  </CardContent>
</Card>

        </>
      )}

      <AppDialog 
        open={deleteDialogOpen} 
        onClose={handleDeleteCancel}
        title={fileToDelete && (() => {
          try {
            const token = localStorage.getItem('token');
            const userId = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).id;
            const isOwner = fileToDelete.owner && (fileToDelete.owner._id === undefined ? fileToDelete.owner === userId : fileToDelete.owner._id === userId);
            return isOwner ? 'Delete File' : 'Revoke Access';
          } catch {
            return 'Delete File';
          }
        })()}
        content={fileToDelete && (() => {
          try {
            const token = localStorage.getItem('token');
            const userId = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).id;
            const isOwner = fileToDelete.owner && (fileToDelete.owner._id === undefined ? fileToDelete.owner === userId : fileToDelete.owner._id === userId);
            if (isOwner) {
              return `Are you sure you want to delete "${fileToDelete.originalname}"? This will remove access for everyone you shared it with, including any downstream recipients.`;
            } else {
              return `Are you sure you want to revoke your access to "${fileToDelete.originalname}"? This will also remove access for everyone you shared it with, including any downstream recipients.`;
            }
          } catch {
            return `Are you sure you want to delete "${fileToDelete.originalname}"? This action cannot be undone.`;
          }
        })()}
        actions={
          <>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error">
              {fileToDelete && (() => {
                try {
                  const token = localStorage.getItem('token');
                  const userId = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).id;
                  const isOwner = fileToDelete.owner && (fileToDelete.owner._id === undefined ? fileToDelete.owner === userId : fileToDelete.owner._id === userId);
                  return isOwner ? 'Delete File' : 'Revoke My Access';
                } catch {
                  return 'Delete File';
                }
              })()}
            </Button>
          </>
        }
      />

      <AppDialog 
        open={shareDialogOpen} 
        onClose={handleCloseShareDialog} 
        DialogProps={{ maxWidth: "xs", fullWidth: true }}
        title="Share File"
        content={
          <Box sx={{ mt: 0.5 }}>
            {(() => {
              if (!fileToShare) return null;
              const isShared = sharedFiles.some(f => f._id === fileToShare._id);
              let userId = null;
              try {
                const t = localStorage.getItem('token');
                if (t) userId = JSON.parse(atob(t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).id;
              } catch {}
              let ineligible = new Set();
              if (isShared) {
                // exclude self, owner, and ancestors
                ineligible.add(String(userId));
                if (fileToShare.owner?._id) ineligible.add(String(fileToShare.owner._id));
                else if (fileToShare.owner) ineligible.add(String(fileToShare.owner));
                // get all ancestors in access path
                const path = window.localStorage.getItem(`accessPath_${fileToShare._id}`);
                let ancestorIds = [];
                if (path) {
                  try {
                    ancestorIds = JSON.parse(path).map(u => u && (u._id ? String(u._id) : String(u)));
                  } catch {}
                }
                ancestorIds.forEach(id => ineligible.add(id));
              }
              // exclude all users in access graph
              let accessIds = [];
              if (accessList && Array.isArray(accessList)) {
                accessIds = accessList.map(u => (u.user && u.user._id ? String(u.user._id) : String(u.user)));
              }
              accessIds.forEach(id => ineligible.add(id));
              const eligibleFriends = friends.filter(f => !ineligible.has(f._id));
              if (eligibleFriends.length === 0) {
                return <Typography color="text.secondary">No friends to share with. Any friends you have already have access.</Typography>;
              }
              return <>
                <DialogContentText>
                  Only friends who do not already have access are shown below.
                </DialogContentText>
                {eligibleFriends.map(friend => (
                  <FormControlLabel
                    key={friend._id}
                    control={
                      <Checkbox
                        checked={selectedFriends.includes(friend._id)}
                        onChange={() => handleToggleFriend(friend._id)}
                      />
                    }
                    label={`${friend.username} (${friend.email})`}
                  />
                ))}
              </>;
            })()}
          </Box>
        }
        actions={
          <>
          <Button onClick={handleCloseShareDialog}>Cancel</Button>
          <Button onClick={handleShareConfirm} disabled={selectedFriends.length === 0 || shareLoading} variant="contained" color="primary">
            {shareLoading ? 'Sharing...' : 'Share'}
          </Button>
          </>
        }
      />

      <AppSnackbar 
        open={snackbar.open} 
        message={snackbar.message}
        severity={snackbar.severity}
        autoHideDuration={3000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}
 