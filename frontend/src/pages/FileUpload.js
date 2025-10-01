import { useState } from "react"
import { TextField, Button, Typography, Card, CardContent, Box, FormHelperText, Alert } from "@mui/material"
import { useNavigate } from "react-router-dom"
import api from "../api"

export default function FileUpload() {
  // keep track of file, hops, error, success and loading state
  const [file, setFile] = useState(null)
  const [accessDepth, setAccessDepth] = useState(1)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!file) {
      setError("Please select a file")
      return
    }

    setError("")
    setSuccess("")
    setLoading(true)

    const formData = new FormData()
    formData.append("file", file) // attach file
    formData.append("accessDepth", accessDepth) // attach hops value

    try {
      // send file to backend
      await api.post("/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      setSuccess("File uploaded successfully!")
      setTimeout(() => navigate("/dashboard"), 1500) // go to dashboard after upload
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: { xs: "100vh", md: "100vh" },
        display: "flex",
        alignItems: { xs: "flex-start", md: "center" },
        justifyContent: "center",
        pt: { xs: 4, sm: 6 },
        px: { xs: 2, sm: 3 },
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: { xs: 420, sm: 480, md: 560 },
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: { xs: 1, md: 3 },
          borderRadius: 2,
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          <Typography
            variant="h5"
            align="center"
            gutterBottom
            sx={{ fontWeight: 600, fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
          >
            Upload File
          </Typography>

          {error && (<Alert severity="error" sx={{ mt: 2, mb: 2 }}> {error} </Alert>)}
          {success && (<Alert severity="success" sx={{ mt: 2, mb: 2 }}> {success} </Alert>)}

          <form onSubmit={handleSubmit}>
            <Box
              sx={{ mt: 2, mb: 2, '& input[type="file"]': { width: "100%", fontSize: { xs: 14, sm: 16 } } }}
            >
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Select File
              </Typography>
              {/* file input */}
              <input
                type="file" 
                onChange={(e) => setFile(e.target.files[0])}
                required 
                aria-label="Select file to upload"
              />
            </Box>

            <FormHelperText
              sx={{
                mt: 1,
                mb: 0.5,
                fontWeight: 500,
                color: "text.secondary",
                fontSize: { xs: "0.8rem", sm: "0.875rem" },
                lineHeight: 1.5,
              }}
            >
              Hops (access depth) is the maximum number of times this file can be reshared through your network.
            </FormHelperText>
            <FormHelperText
              sx={{ mb: 1, color: "text.secondary", fontSize: { xs: "0.8rem", sm: "0.875rem" }, lineHeight: 1.5}}
            >
              Hops 0 means this file is not shareable with anyone.
            </FormHelperText>

            {/* input for hops value */}
            <TextField
              fullWidth
              label="Access Depth (hops)"
              type="number"
              inputProps={{ min: 0, max: 10 }}
              value={accessDepth}
              onChange={(e) => setAccessDepth(e.target.value)}
              sx={{ mb: 2, "& input": { fontSize: { xs: 14, sm: 16 } } }}
            />

             {/* upload button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ mt: 1, py: { xs: 1.25, sm: 1.5 }, fontSize: { xs: "0.95rem", sm: "1rem" } }}
            >
              {loading ? "Uploading..." : "Upload"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  )
}
