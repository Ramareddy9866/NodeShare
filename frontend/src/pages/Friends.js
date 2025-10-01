import { useEffect, useState } from "react"
import {
  Typography, Box, List, ListItem, ListItemText, Button, TextField, Card, CardContent, FormHelperText, Snackbar,
  Alert, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Skeleton } from "@mui/material"
import api from "../api"
import DeleteIcon from "@mui/icons-material/Delete"
import IconButton from "@mui/material/IconButton"
import Tooltip from "@mui/material/Tooltip"
import PeopleIcon from "@mui/icons-material/People"
import PersonAddIcon from "@mui/icons-material/PersonAdd"
import MailIcon from "@mui/icons-material/Mail"

export default function Friends() {
  // state for friends, requests, users and messages
  const [friends, setFriends] = useState([])
  const [requests, setRequests] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [search, setSearch] = useState("")
  const [error, setError] = useState("")
  const [me, setMe] = useState(null)
  // dialog and snackbar states
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false)
  const [friendToRemove, setFriendToRemove] = useState(null)
  const [removeLoading, setRemoveLoading] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" })
  // loading indicators
  const [loadingFriends, setLoadingFriends] = useState(true)
  const [loadingUsers, setLoadingUsers] = useState(true)

  // get my data + friends
  const fetchFriends = async () => {
    setError("")
    setLoadingFriends(true)
    try {
      const meRes = await api.get(`/users/me`)
      setMe(meRes.data)
      setFriends(meRes.data.friends || [])
      setRequests(meRes.data.friendRequests || [])
    } catch (err) {
      setError("Failed to fetch friends")
    }
    setLoadingFriends(false)
  }

  // get all users for search
  const fetchAllUsers = async () => {
    setLoadingUsers(true)
    try {
      const res = await api.get(`/users/all`)
      setAllUsers(res.data.users || [])
    } catch {}
    setLoadingUsers(false)
  }

  useEffect(() => {
    fetchFriends()
    fetchAllUsers()
  }, [])

  // send new friend request
  const handleSendRequest = async (userId) => {
    setSnackbar({ open: false, message: "", severity: "success" })
    try {
      await api.post(`/friends/request`, { toUserId: userId })
      setSnackbar({ open: true, message: "Friend request sent!", severity: "success" })
      fetchAllUsers()
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || "Failed to send request", severity: "error" })
    }
  }

  // accept incoming request
  const handleAccept = async (fromUserId) => {
    setSnackbar({ open: false, message: "", severity: "success" })
    try {
      await api.post(`/friends/accept`, { fromUserId })
      setSnackbar({ open: true, message: "Friend request accepted!", severity: "success" })
      fetchFriends()
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || "Failed to accept request", severity: "error" })
    }
  }

   // open dialog to remove friend
  const handleRemoveFriend = (friend) => {
    setFriendToRemove(friend)
    setRevokeDialogOpen(true)
  }

  const handleRemoveCancel = () => {
    setRevokeDialogOpen(false)
    setFriendToRemove(null)
  }

   // remove friend (with or without revoking access)
  const handleRemove = async (revokeAccess) => {
    if (!friendToRemove) return
    setRemoveLoading(true)
    setSnackbar({ open: false, message: "", severity: "success" })
    try {
      await api.post(`/friends/remove`, { friendId: friendToRemove._id, revokeAccess })
      setSnackbar({
        open: true,
        message: revokeAccess
          ? `${friendToRemove.username} removed from your friends and file access revoked.`
          : `${friendToRemove.username} removed from your friends but still has file access.`,
        severity: "success",
      })
      setRevokeDialogOpen(false)
      setFriendToRemove(null)
      fetchFriends()
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || "Failed to remove friend", severity: "error" })
      setRevokeDialogOpen(false)
      setFriendToRemove(null)
    }
    setRemoveLoading(false)
  }

  // filter users from search box
  const filteredUsers = allUsers.filter(
    (u) =>
      search &&
      (u.username.includes(search) || u.email.includes(search)) &&
      !friends.some((f) => f._id === u._id) &&
      u._id !== me?._id,
  )

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: (theme) => theme.palette.background.default,
        px: { xs: 1, sm: 2, md: 4 },
        pt: { xs: 2, sm: 3 },
        pb: { xs: 3, sm: 4 },
      }}
    >
      <Box mt={{ xs: 1, sm: 2 }} mb={{ xs: 2, sm: 3 }}>
        <Typography
          variant="h5"
          sx={{
            textAlign: "center",
            fontWeight: 600,
            color: (theme) => theme.palette.text.primary,
            mb: { xs: 2, sm: 3 },
            fontSize: { xs: "1.25rem", sm: "1.5rem" },
            letterSpacing: { xs: 0.2, sm: 0.4 },
          }}
        >
          YOUR CONNECTIONS
        </Typography>
        {/* show error if fetching fails */}
        {error && (<Alert severity="error" sx={{ mb: 2 }}> {error} </Alert>)}
      </Box>

      <Box display="flex" flexDirection="column" alignItems="center" gap={{ xs: 2, sm: 3 }}>
        {/* section: current friends */}
        <Card
          sx={{
            backgroundColor: "#F3F4F6",
            border: "1px solid #E2E8F0",
            boxShadow: "0px 1px 3px rgba(0,0,0,0.1)",
            borderRadius: 2,
            mb: 2,
            minHeight: { xs: 200, sm: 220 },
            width: "100%",
            maxWidth: { xs: "100%", sm: 640, md: 720 },
            mx: "auto",
          }}
        >
          <CardContent sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1.5, sm: 2 } }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: (theme) => theme.palette.text.primary,
                mb: { xs: 1.5, sm: 2 },
                display: "flex",
                alignItems: "center",
                gap: 1,
                fontSize: { xs: "1rem", sm: "1.125rem" },
              }}
            >
              <PeopleIcon sx={{ fontSize: { xs: 20, sm: 22 }, mr: 1 }} /> Current Friends
            </Typography>
            <Box sx={{ maxHeight: { xs: 160, sm: 200 }, overflowY: "auto" }}>
              <List>
                {loadingFriends ? (
                  [...Array(3)].map((_, idx) => (
                    <ListItem key={idx}>
                      <Skeleton variant="circular" width={32} height={32} sx={{ mr: 2 }} />
                      <Skeleton variant="text" width="60%" />
                    </ListItem>
                  ))
                ) : friends.length === 0 ? (
                  <ListItem sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 100 }}>
                    <ListItemText primary="No friends yet." sx={{ textAlign: "center" }} />
                  </ListItem>
                ) : (
                  friends.map((f) => (
                    <ListItem
                      key={f._id}
                      secondaryAction={
                        <Tooltip title="Remove Friend">
                          <IconButton onClick={() => handleRemoveFriend(f)}>
                            <DeleteIcon sx={{ color: "#ef4444", fontSize: { xs: 20, sm: 22 } }} />
                          </IconButton>
                        </Tooltip>
                      }
                    >
                      <ListItemText primary={f.username} secondary={f.email} />
                    </ListItem>
                  ))
                )}
              </List>
            </Box>
          </CardContent>
        </Card>

       {/* section: incoming requests */}
        <Card
          sx={{
            backgroundColor: "#F3F4F6",
            border: "1px solid #E2E8F0",
            boxShadow: "0px 1px 3px rgba(0,0,0,0.1)",
            borderRadius: 2,
            mb: 2,
            minHeight: { xs: 200, sm: 220 },
            width: "100%",
            maxWidth: { xs: "100%", sm: 640, md: 720 },
            mx: "auto",
          }}
        >
          <CardContent sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1.5, sm: 2 } }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: (theme) => theme.palette.text.primary,
                mb: { xs: 1.5, sm: 2 },
                display: "flex",
                alignItems: "center",
                gap: 1,
                fontSize: { xs: "1rem", sm: "1.125rem" },
              }}
            >
              <MailIcon sx={{ fontSize: { xs: 20, sm: 22 }, mr: 1 }} /> Incoming Friend Requests
            </Typography>
            <Box sx={{ maxHeight: { xs: 160, sm: 200 }, overflowY: requests.length > 2 ? "auto" : "visible" }}>
              <List>
                {loadingFriends ? (
                  [...Array(2)].map((_, idx) => (
                    <ListItem key={idx}>
                      <Skeleton variant="circular" width={32} height={32} sx={{ mr: 2 }} />
                      <Skeleton variant="text" width="50%" />
                    </ListItem>
                  ))
                ) : requests.length === 0 ? (
                  <ListItem
                    sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 100 }}
                  >
                    <ListItemText primary="No incoming requests." sx={{ textAlign: "center" }} />
                  </ListItem>
                ) : (
                  requests.map((r) => (
                    <ListItem
                      key={r._id}
                      secondaryAction={
                        <Button
                          onClick={() => handleAccept(r._id)}
                          variant="contained"
                          sx={{ px: { xs: 1.25, sm: 1.75 }, py: { xs: 0.5, sm: 0.75 }, fontSize: { xs: "0.8125rem", sm: "0.875rem" }}}
                        >
                          Accept
                        </Button>
                      }
                    >
                      <ListItemText primary={r.username} secondary={r.email} />
                    </ListItem>
                  ))
                )}
              </List>
            </Box>
          </CardContent>
        </Card>

        {/* section: add new friend */}
        <Card
          sx={{
            backgroundColor: "#F3F4F6",
            border: "1px solid #E2E8F0",
            boxShadow: "0px 1px 3px rgba(0,0,0,0.1)",
            borderRadius: 2,
            mb: 2,
            minHeight: { xs: 200, sm: 220 },
            width: "100%",
            maxWidth: { xs: "100%", sm: 640, md: 720 },
            mx: "auto",
          }}
        >
          <CardContent sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1.5, sm: 2 } }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: (theme) => theme.palette.text.primary,
                mb: { xs: 1.5, sm: 2 },
                display: "flex",
                alignItems: "center",
                gap: 1,
                fontSize: { xs: "1rem", sm: "1.125rem" },
              }}
            >
              <PersonAddIcon sx={{ fontSize: { xs: 20, sm: 22 }, mr: 1 }} /> Add Friend
            </Typography>
            <TextField
              label="Search by username or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              fullWidth
              margin="normal"
              size="small"
              sx={{ "& .MuiInputBase-input": { fontSize: { xs: "0.95rem", sm: "1rem" } } }}
            />
            <FormHelperText>Enter a dot (.) to see all users.</FormHelperText>
            <Box sx={{ maxHeight: { xs: 160, sm: 200 }, overflowY: "auto" }}>
              <List>
                {loadingUsers ? (
                  [...Array(2)].map((_, idx) => (
                    <ListItem key={idx}>
                      <Skeleton variant="circular" width={32} height={32} sx={{ mr: 2 }} />
                      <Skeleton variant="text" width="50%" />
                    </ListItem>
                  ))
                ) : filteredUsers.length === 0 && search ? (
                  <ListItem> <ListItemText primary="No users found." /> </ListItem>
                ) : (
                  filteredUsers.map((u) => (
                    <ListItem
                      key={u._id}
                      secondaryAction={
                        <Button
                          onClick={() => handleSendRequest(u._id)}
                          variant="outlined"
                          sx={{ px: { xs: 1.25, sm: 1.75 }, py: { xs: 0.5, sm: 0.75 }, fontSize: { xs: "0.8125rem", sm: "0.875rem" } }}
                        >
                          Send Request
                        </Button>
                      }
                    >
                      <ListItemText primary={u.username} secondary={u.email} />
                    </ListItem>
                  ))
                )}
              </List>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* dialog to confirm friend removal and access revocation */}
      <Dialog
        open={revokeDialogOpen}
        onClose={handleRemoveCancel}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { mx: { xs: 2, sm: "auto" } } }}
      >
        <DialogTitle>Remove Friend</DialogTitle>
        <DialogContent>
          <DialogContentText>
            What would you like to do with files you have shared with <b>{friendToRemove?.username}</b>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRemoveCancel} disabled={removeLoading}>
            Cancel
          </Button>
          <Button onClick={() => handleRemove(false)} color="primary" disabled={removeLoading}>
            Remove Friend &amp; Keep File Access
          </Button>
          <Button onClick={() => handleRemove(true)} color="error" disabled={removeLoading}>
            Remove Friend &amp; Revoke File Access
          </Button>
        </DialogActions>
      </Dialog>

      {/* snackbar for success/error messages */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
