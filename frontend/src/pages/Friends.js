import React, { useEffect, useState } from 'react';
import { Typography, Box, List, ListItem, ListItemText, Button, TextField, Card, CardContent, FormHelperText } from '@mui/material';
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import MailIcon from '@mui/icons-material/Mail';
import { API_BASE_URL } from '../config';
import AppAlert from '../components/AppAlert';
import AppDialog from '../components/AppDialog';
import DialogContentText from '@mui/material/DialogContentText';
import AppSnackbar from '../components/AppSnackbar';

export default function Friends() {
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [searchError, setSearchError] = useState('');
  const [me, setMe] = useState(null);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [friendToRemove, setFriendToRemove] = useState(null);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const token = localStorage.getItem('token');

  // load user's friends and requests
  const fetchFriends = async () => {
    setError('');
    try {
      const meRes = await axios.get(`${API_BASE_URL}/users/me`, { headers: { Authorization: 'Bearer ' + token } });
      setMe(meRes.data);
      setFriends(meRes.data.friends || []);
      setRequests(meRes.data.friendRequests || []);
    } catch (err) {
      setError('Failed to fetch friends');
    }
  };

  // load all users for search
  const fetchAllUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/users/all`, { headers: { Authorization: 'Bearer ' + token } });
      setAllUsers(res.data.users || []);
    } catch {}
  };

  useEffect(() => { fetchFriends(); fetchAllUsers(); }, []);

  // send friend request
  const handleSendRequest = async (userId) => {
    setError(''); setSnackbar({ open: false, message: '', severity: 'success' }); setSearchError('');
    if (!userId) {
      setSearchError('Please select a user to send a request');
      return;
    }
    if (userId === me?._id) {
      setSearchError('You cannot send a friend request to yourself');
      return;
    }
    try {
      await axios.post(`${API_BASE_URL}/friends/request`, { toUserId: userId }, { headers: { Authorization: 'Bearer ' + token } });
      setSnackbar({ open: true, message: 'Friend request sent!', severity: 'success' });
      fetchAllUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send request');
    }
  };

  // accept friend request
  const handleAccept = async (fromUserId) => {
    setError(''); setSnackbar({ open: false, message: '', severity: 'success' });
    try {
      await axios.post(`${API_BASE_URL}/friends/accept`, { fromUserId }, { headers: { Authorization: 'Bearer ' + token } });
      setSnackbar({ open: true, message: 'Friend request accepted!', severity: 'success' });
      fetchFriends();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept request');
    }
  };

  const handleRemoveFriend = (friend) => {
    setFriendToRemove(friend);
    setRevokeDialogOpen(true);
  };

  const handleRemoveCancel = () => {
    setRevokeDialogOpen(false);
    setFriendToRemove(null);
  };

  // remove friend and optionally revoke file access
  const handleRemove = async (revokeAccess) => {
    if (!friendToRemove) return;
    setRemoveLoading(true);
    setError(''); setSnackbar({ open: false, message: '', severity: 'success' });
    try {
      await axios.post(`${API_BASE_URL}/friends/remove`, { friendId: friendToRemove._id, revokeAccess }, { headers: { Authorization: 'Bearer ' + token } });
      setSnackbar({
        open: true,
        message: revokeAccess
          ? `${friendToRemove.username} removed from your friends and file access revoked.`
          : `${friendToRemove.username} removed from your friends but still has file access.`,
        severity: 'success'
      });
      setRevokeDialogOpen(false);
      setFriendToRemove(null);
      fetchFriends();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove friend');
      setRevokeDialogOpen(false);
      setFriendToRemove(null);
    }
    setRemoveLoading(false);
  };

  // filter users for search
  const filteredUsers = allUsers.filter(u =>
    search &&
    (u.username.includes(search) || u.email.includes(search)) &&
    !friends.some(f => f._id === u._id) &&
    u._id !== me?._id
  );

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: (theme) => theme.palette.background.default, px: { xs: 1, sm: 2, md: 4 }, pt: 1, pb: 3 }}>
      <Box mt={2} mb={3}>
        <Typography
          variant="h5"
          sx={{
            textAlign: 'center',
            fontWeight: 600,
            color: (theme) => theme.palette.text.primary,
            mb: 3
          }}
        >
          YOUR CONNECTIONS
        </Typography>
        {error && <AppAlert severity="error">{error}</AppAlert>}
      </Box>
      <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
        <Card sx={{ backgroundColor: '#F3F4F6', border: '1px solid #E2E8F0', boxShadow: '0px 1px 3px rgba(0,0,0,0.1)', borderRadius: 2, mb: 2, minHeight: 220, width: '100%', maxWidth: 650 }}>
          <CardContent sx={{ px: 3, py: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: (theme) => theme.palette.text.primary, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <PeopleIcon sx={{ fontSize: 22, mr: 1 }} /> Current Friends
            </Typography>
            {friends.length > 2 ? (
              <Box sx={{ maxHeight: 120, overflowY: 'auto' }}>
                <List>
                  {friends.map(f => (
                    <ListItem
                      key={f._id}
                      secondaryAction={
                        <Tooltip title="Remove Friend">
                          <IconButton onClick={() => handleRemoveFriend(f)}>
                            <DeleteIcon sx={{ color: '#ef4444', fontSize: 22 }} />
                          </IconButton>
                        </Tooltip>
                      }
                    >
                      <ListItemText primary={f.username} secondary={f.email} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            ) : (
              <List>
                {friends.length === 0 && (
                  <ListItem sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 100 }}>
                    <ListItemText primary="No friends yet." sx={{ textAlign: 'center' }} />
                  </ListItem>
                )}
                {friends.map(f => (
                  <ListItem
                    key={f._id}
                    secondaryAction={
                      <Tooltip title="Remove Friend">
                        <IconButton onClick={() => handleRemoveFriend(f)}>
                          <DeleteIcon sx={{ color: '#ef4444', fontSize: 22 }} />
                        </IconButton>
                      </Tooltip>
                    }
                  >
                    <ListItemText primary={f.username} secondary={f.email} />
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
        <Card sx={{ backgroundColor: '#F3F4F6', border: '1px solid #E2E8F0', boxShadow: '0px 1px 3px rgba(0,0,0,0.1)', borderRadius: 2, mb: 2, minHeight: 220, width: '100%', maxWidth: 650 }}>
          <CardContent sx={{ px: 3, py: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: (theme) => theme.palette.text.primary, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <MailIcon sx={{ fontSize: 22, mr: 1 }} /> Incoming Friend Requests
            </Typography>
            {requests.length > 2 ? (
              <Box sx={{ maxHeight: 120, overflowY: 'auto' }}>
                <List>
                  {requests.map(r => (
                    <ListItem key={r._id} secondaryAction={<Button onClick={() => handleAccept(r._id)} variant="contained">Accept</Button>}>
                      <ListItemText primary={r.username} secondary={r.email} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            ) : (
              <List>
                {requests.length === 0 && (
                  <ListItem sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 100 }}>
                    <ListItemText primary="No incoming requests." sx={{ textAlign: 'center' }} />
                  </ListItem>
                )}
                {requests.map(r => (
                  <ListItem key={r._id} secondaryAction={<Button onClick={() => handleAccept(r._id)} variant="contained">Accept</Button>}>
                    <ListItemText primary={r.username} secondary={r.email} />
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
        <Card sx={{ backgroundColor: '#F3F4F6', border: '1px solid #E2E8F0', boxShadow: '0px 1px 3px rgba(0,0,0,0.1)', borderRadius: 2, mb: 2, minHeight: 220, width: '100%', maxWidth: 650 }}>
          <CardContent sx={{ px: 3, py: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: (theme) => theme.palette.text.primary, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonAddIcon sx={{ fontSize: 22, mr: 1 }} /> Add Friend
            </Typography>
            <TextField
              label="Search by username or email"
              value={search}
              onChange={e => setSearch(e.target.value)}
              fullWidth
              margin="normal"
            />
            <FormHelperText>
              Enter a dot (.) to see all users.
            </FormHelperText>
            <FormHelperText error>{searchError}</FormHelperText>
            {filteredUsers.length > 2 ? (
              <Box sx={{ maxHeight: 120, overflowY: 'auto' }}>
                <List>
                  {filteredUsers.map(u => (
                    <ListItem key={u._id} secondaryAction={<Button onClick={() => handleSendRequest(u._id)} variant="outlined">Send Request</Button>}>
                      <ListItemText primary={u.username} secondary={u.email} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            ) : (
              <List>
                {filteredUsers.length === 0 && search && <ListItem><ListItemText primary="No users found." /></ListItem>}
                {filteredUsers.map(u => (
                  <ListItem key={u._id} secondaryAction={<Button onClick={() => handleSendRequest(u._id)} variant="outlined">Send Request</Button>}>
                    <ListItemText primary={u.username} secondary={u.email} />
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      </Box>
      <AppDialog
        open={revokeDialogOpen}
        onClose={handleRemoveCancel}
        title="Remove Friend"
        content={
          <DialogContentText>
            What would you like to do with files you have shared with <b>{friendToRemove?.username}</b>?
          </DialogContentText>
        }
        actions={[
          <Button onClick={handleRemoveCancel} disabled={removeLoading}>Cancel</Button>,
          <Button onClick={() => handleRemove(false)} color="primary" disabled={removeLoading}>Remove Friend &amp; Keep File Access</Button>,
          <Button onClick={() => handleRemove(true)} color="error" disabled={removeLoading}>
            Remove Friend &amp; Revoke File Access
          </Button>
        ]}
      />
      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}

