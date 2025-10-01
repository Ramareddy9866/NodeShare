import { useEffect, useState } from "react"
import {
  Button, Typography, Box, Accordion, AccordionSummary, AccordionDetails, Card, CardContent, Snackbar, Alert, Dialog,
  DialogTitle, DialogContent, DialogContentText, DialogActions, FormControlLabel, Checkbox, Skeleton } from "@mui/material"
import { useNavigate } from "react-router-dom"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import FileList from "../components/FileList"
import api from "../api"
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile"
import FolderSharedIcon from "@mui/icons-material/FolderShared"
import { useAuth } from "../AuthContext"

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  // state to store my files, shared files, errors, previews
  const [filesState, setFilesState] = useState({
    my: [],
    shared: [],
    loading: true,
    error: "",
    previews: {},
  })

  // dialogs, snackbars and sharing state
  const [dialog, setDialog] = useState({ type: null, file: null }) 
  const [snackbar, setSnackbar] = useState(null)
  const [friends, setFriends] = useState([])
  const [selectedFriends, setSelectedFriends] = useState([])
  const [shareLoading, setShareLoading] = useState(false)
  const [accessList, setAccessList] = useState([])
  const [sharedByMap, setSharedByMap] = useState({})

  const showSnackbar = (msg, severity = "info") => setSnackbar({ open: true, message: msg, severity })

  // check if logged in user owns the file
  const checkIsOwner = (file) => {
    if (!file || !user?._id) return false
    try {
      if (file.owner?._id !== undefined) {
        return file.owner._id === user._id
      } else {
        return file.owner === user._id
      }
    } catch {
      return false
    }
  }

  // fetch my files + shared files
  const fetchFiles = async () => {
    setFilesState((s) => ({ ...s, loading: true, error: "" }))
    try {
      const [myRes, sharedRes] = await Promise.all([api.get("/files/my"), api.get("/files/shared")])
      setFilesState((s) => ({
        ...s,
        my: myRes.data.files || [],
        shared: sharedRes.data.files || [],
        loading: false,
      }))
    } catch {
      setFilesState((s) => ({ ...s, loading: false, error: "Failed to fetch files" }))
    }
  }

  // download file
  const handleDownload = async (fileId, filename) => {
    try {
      const res = await api.get(`/files/${fileId}/download`)
      const { url } = res.data
      const fileResponse = await fetch(url)
      const blob = await fileResponse.blob()
      const blobUrl = window.URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = blobUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(blobUrl)

      showSnackbar("Download started", "success")
    } catch {
      showSnackbar("Download failed", "error")
    }
  }

  // view file in new tab
  const handleView = async (fileId) => {
    try {
      const res = await api.get(`/files/${fileId}/download`)
      const { url } = res.data
      const fileResponse = await fetch(url)
      const blob = await fileResponse.blob()
      const blobUrl = window.URL.createObjectURL(blob)

      window.open(blobUrl, "_blank")
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 10000)

      showSnackbar("File opened in new tab", "success")
    } catch (error) {
      showSnackbar(error.response?.data?.message || "View failed", "error")
    }
  }

  // delete file or revoke access
  const handleDeleteConfirm = async () => {
    if (!dialog.file) return
    try {
      const isOwner = checkIsOwner(dialog.file)
      if (isOwner) {
        await api.delete(`/files/${dialog.file._id}`)
        showSnackbar("File deleted successfully", "success")
      } else {
        await api.delete(`/files/${dialog.file._id}/revoke`)
        showSnackbar("Access revoked successfully", "success")
      }
      setDialog({ type: null, file: null })
      fetchFiles()
    } catch {
      showSnackbar("Operation failed", "error")
    }
  }

  // navigate to access graph page
  const handleAccessGraph = (fileId) => {
    navigate(`/access-graph/${fileId}`)
  }

   // share file with selected friends
  const handleShareConfirm = async () => {
    if (!dialog.file || selectedFriends.length === 0) return
    setShareLoading(true)
    try {
      await api.post(`/files/${dialog.file._id}/share`, { friends: selectedFriends })
      showSnackbar("File shared successfully", "success")
      setDialog({ type: null, file: null })
      setSelectedFriends([])
      fetchFiles()
    } catch (error) {
      const backendMsg = error.response?.data?.message || ""
      if (backendMsg.toLowerCase().includes("hop") && backendMsg.toLowerCase().includes("limit")) {
        showSnackbar("Hop limit reached. Cannot share this file further.", "error")
      } else {
        showSnackbar("Failed to share file", "error")
      }
    }
    setShareLoading(false)
  }

  // initial fetch of files
  useEffect(() => {
    fetchFiles()
  }, [])

  // generate image previews for image files
  useEffect(() => {
    const fetchPreview = async (file) => {
      if (filesState.previews[file._id]) return
      try {
        const res = await api.get(`/files/${file._id}/download`)
        const { url } = res.data
        const fileResponse = await fetch(url)
        const blob = await fileResponse.blob()
        const previewUrl = window.URL.createObjectURL(blob)
        setFilesState((s) => ({
          ...s,
          previews: { ...s.previews, [file._id]: previewUrl },
        }))
      } catch {
      }
    }

    filesState.my.concat(filesState.shared).forEach((file) => {
      if (file.mimetype?.startsWith("image/")) fetchPreview(file)
    })

    return () => {
      Object.values(filesState.previews).forEach((url) => window.URL.revokeObjectURL(url))
    }
  }, [filesState.my, filesState.shared])

  // fetch friends and access list when share dialog opens
  useEffect(() => {
    if (dialog.type === "share" && dialog.file) {
      api.get("/users/me").then((res) => setFriends(res.data.friends || []))
      api
        .get(`/files/${dialog.file._id}/full-access-list`)
        .then((res) => setAccessList(res.data.authorizedUsers || []))
        .catch(() => setAccessList([]))
    }
  }, [dialog])

  // fetch owners of shared files
  useEffect(() => {
    if (!user?._id || filesState.shared.length === 0) return
    const fetchSharedBy = async () => {
      const results = await Promise.all(
        filesState.shared.map(async (file) => {
          try {
            const res = await api.get(`/files/${file._id}/sharedBy/${user._id}`)
            return [file._id, res.data.sharedBy]
          } catch {
            return [file._id, null]
          }
        }),
      )
      const map = {}
      results.forEach(([fileId, sharedByUser]) => {
        map[fileId] = sharedByUser
      })
      setSharedByMap(map)
    }
    fetchSharedBy()
  }, [filesState.shared, user?._id])

  return (
    <Box
      sx={{ width: "100%", px: { xs: 1, sm: 2, md: 4 }, pt: 1, pb: 3, minHeight: "100vh", backgroundColor: (theme) => theme.palette.background.default }}
    >
      <Box mt={1} mb={2}>
        <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
          <Typography variant="h5" sx={{ width: { md: `calc(100% - 220px)` }, textAlign: "center", fontWeight: 600 }}>
            YOUR FILES ON NODESHARE
          </Typography>
        </Box>

        {/* upload button */}
        <Box display="flex" sx={{ mt: 2, justifyContent: { xs: "center", md: "flex-end" } }}>
          <Button
            variant="contained"
            onClick={() => navigate("/upload")}
            sx={{
              mr: { xs: 0, md: 2 },
              px: 4,
              py: 1.2,
              fontSize: "1rem",
              fontWeight: 600,
              textTransform: "none",
              borderRadius: "8px",
              boxShadow: 2,
              backgroundColor: "#38BDF8",
              color: "#fff",
              "&:hover": { backgroundColor: "#0ea5e9" },
              width: { xs: "100%", sm: "auto" },
            }}
          >
            Upload File
          </Button>
        </Box>
      </Box>

      {/* show loading state or files */}
      {filesState.loading ? (
        <Box>
          <Typography variant="h6">My Uploaded Files</Typography>
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={48} sx={{ mb: 1, borderRadius: 1 }} />
          ))}
          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}> Shared With Me </Typography>
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={48} sx={{ mb: 1, borderRadius: 1 }} />
          ))}
        </Box>
      ) : filesState.error ? (
        <Alert severity="error">{filesState.error}</Alert>
      ) : (
        <>
          {/* my uploaded files */}
          <Card sx={{ mb: 4, backgroundColor: "#F3F4F6", border: "1px solid #E2E8F0", boxShadow: "0px 1px 3px rgba(0,0,0,0.1)", borderRadius: 2}}>
            <CardContent
              sx={{ 
                maxHeight: { xs: "none", md: 300 },
                overflowY: { xs: "visible", md: "auto" },
                color: (theme) => theme.palette.text.primary,
                px: 3,
                py: 2,
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                <InsertDriveFileIcon sx={{ fontSize: 22, mr: 1 }} /> My Uploaded Files
              </Typography>

              <Accordion sx={{ mb: 2, backgroundColor: "transparent", boxShadow: "none" }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: 16 }}>
                    Shareable Files
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                  <FileList
                    files={filesState.my.filter((f) => f.accessDepth > 0)}
                    imagePreviews={filesState.previews}
                    actions={{
                      onDownload: handleDownload,
                      onView: handleView,
                      onShare: (file) => setDialog({ type: "share", file }),
                      onDelete: (file) => setDialog({ type: "delete", file }),
                      onAccessGraph: handleAccessGraph,
                    }}
                    section="my"
                  />
                </AccordionDetails>
              </Accordion>

              <Accordion sx={{ backgroundColor: "transparent", boxShadow: "none" }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: 16 }}>
                    Non-shareable Files
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                  <FileList
                    files={filesState.my.filter((f) => f.accessDepth === 0)}
                    imagePreviews={filesState.previews}
                    actions={{
                      onDownload: handleDownload,
                      onView: handleView,
                      onDelete: (file) => setDialog({ type: "delete", file }),
                    }}
                    section="my"
                  />
                </AccordionDetails>
              </Accordion>
            </CardContent>
          </Card>

          {/* files shared with me */}
          <Card
            sx={{ backgroundColor: "#F3F4F6", border: "1px solid #E2E8F0", boxShadow: "0px 1px 3px rgba(0,0,0,0.1)", borderRadius: 2 }}
          >
            <CardContent
              sx={{
                maxHeight: { xs: "none", md: 300 },
                overflowY: { xs: "visible", md: "auto" },
                color: (theme) => theme.palette.text.primary,
                px: 3,
                py: 2,
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                <FolderSharedIcon sx={{ fontSize: 22, mr: 1 }} /> Shared With Me
              </Typography>

              <FileList
                files={filesState.shared}
                imagePreviews={filesState.previews}
                sharedByMap={sharedByMap}
                actions={{
                  onDownload: handleDownload,
                  onView: handleView,
                  onShare: (file) => setDialog({ type: "share", file }),
                  onDelete: (file) => setDialog({ type: "delete", file }),
                  onAccessGraph: handleAccessGraph,
                }}
                showOwner={true}
                section="shared"
              />
            </CardContent>
          </Card>
        </>
      )}
      {/* delete / revoke access dialog */}
      <Dialog
        open={dialog.type === "delete"}
        onClose={() => setDialog({ type: null, file: null })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {dialog.file ? (checkIsOwner(dialog.file) ? "Delete File" : "Revoke Access") : "Delete File"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {dialog.file &&
              (checkIsOwner(dialog.file)
                ? `Are you sure you want to delete "${dialog.file.originalname}"? This will remove access for everyone you shared it with, including downstream recipients.`
                : `Are you sure you want to revoke your access to "${dialog.file.originalname}"? This will also remove access for everyone you shared it with, including downstream recipients.`)}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ flexWrap: { xs: "wrap", sm: "nowrap" }, gap: { xs: 1, sm: 0 } }}>
          <Button onClick={() => setDialog({ type: null, file: null })}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            {dialog.file ? (checkIsOwner(dialog.file) ? "Delete File" : "Revoke My Access") : "Delete File"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* share file dialog */}
      <Dialog
        open={dialog.type === "share"} onClose={() => setDialog({ type: null, file: null })} maxWidth="xs" fullWidth
        >
        <DialogTitle>Share File</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 0.5 }}>
            {dialog.file
              ? (() => {
                  const ineligible = new Set()
                  if (user?._id) ineligible.add(String(user._id))
                  if (Array.isArray(accessList)) {
                    accessList.forEach((u) =>
                      ineligible.add(u.user && u.user._id ? String(u.user._id) : String(u.user)),
                    )
                  }
                  const eligibleFriends = friends.filter((f) => !ineligible.has(f._id))
                  if (eligibleFriends.length === 0) {
                    return (
                      <Typography color="text.secondary">
                        No friends to share with. Any friends you have already have access.
                      </Typography>
                    )
                  }
                  return (
                    <>
                      <DialogContentText>
                        Only friends who do not already have access are shown below.
                      </DialogContentText>
                      {eligibleFriends.map((friend) => (
                        <FormControlLabel
                          key={friend._id}
                          control={
                            <Checkbox
                              checked={selectedFriends.includes(friend._id)}
                              onChange={() => {
                                setSelectedFriends((prev) =>
                                  prev.includes(friend._id)
                                    ? prev.filter((id) => id !== friend._id)
                                    : [...prev, friend._id],
                                )
                              }}
                            />
                          }
                          label={`${friend.username} (${friend.email})`}
                        />
                      ))}
                    </>
                  )
                })()
              : null}
          </Box>
        </DialogContent>
        <DialogActions sx={{ flexWrap: { xs: "wrap", sm: "nowrap" }, gap: { xs: 1, sm: 0 } }}>
          <Button onClick={() => setDialog({ type: null, file: null })}>Cancel</Button>
          <Button
            onClick={handleShareConfirm}
            disabled={selectedFriends.length === 0 || shareLoading}
            variant="contained"
            color="primary"
          >
            {shareLoading ? "Sharing..." : "Share"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* snackbar for notifications */}
      <Snackbar
        open={!!snackbar}
        autoHideDuration={3000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {snackbar && (
          <Alert onClose={() => setSnackbar(null)} severity={snackbar.severity} sx={{ width: "100%" }}>
            {snackbar.message}
          </Alert>
        )}
      </Snackbar>
    </Box>
  )
}
