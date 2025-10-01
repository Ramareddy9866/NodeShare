import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import { Container, Typography, Box, CircularProgress, Alert } from "@mui/material"
import api from "../api"
import { Network } from "vis-network/standalone"
import { useAuth } from "../AuthContext"

export default function AccessGraph() {
  // Get file ID from route params
  const { fileId } = useParams()
  const visRef = useRef()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [file, setFile] = useState(null)
  const [users, setUsers] = useState([])
  const [edges, setEdges] = useState([])

  // Get logged-in user
  const { user } = useAuth()
  const currentUserId = user?._id

  // Fetch file details, authorized users, and edges for graph
  useEffect(() => {
    const fetchGraph = async () => {
      setLoading(true)
      setError("")
      try {
        const fileRes = await api.get(`/files/${fileId}/access-list`)
        setFile(fileRes.data.file)
        setUsers(fileRes.data.authorizedUsers)

        const edgesRes = await api.get(`/files/${fileId}/access-edges`)
        setEdges(edgesRes.data.edges)
      } catch (err) {
        setError("Failed to load access graph")
      } finally {
        setLoading(false)
      }
    }
    fetchGraph()
  }, [fileId])

  // Render graph when data is ready
  useEffect(() => {
    if (!loading && users.length > 0 && visRef.current) {
      // Build nodes (current user in orange)
      const nodes = users.map((u) => ({
        id: u.user._id,
        label: u.user.username,
        color: u.user._id === currentUserId ? "#F59E42" : "#38BDF8",
      }))

      // Build edges (arrows for access)
      const visEdges = edges.map((e) => ({
        from: e.from,
        to: e.to,
        arrows: "to",
      }))

      const data = { nodes, edges: visEdges }
      const options = {
        nodes: { shape: "dot", size: 20, font: { size: 16 } },
        edges: { arrows: "to" },
        physics: false,
      }

      new Network(visRef.current, data, options)
    }
  }, [loading, users, edges, currentUserId])

  return (
    <Container component="main" maxWidth="lg" sx={{ py: { xs: 3, sm: 4 }, px: { xs: 2, sm: 0 } }}>
      <Box sx={{ mt: { xs: 2, sm: 4 } }}>
        <Typography
          variant="h5"
          align="center"
          sx={{ fontWeight: 600, mb: { xs: 2, sm: 3 }, letterSpacing: 0.5, fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
        >
          ACCESS GRAPH
        </Typography>

        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: { xs: "50vh", sm: "60vh" },
            }}
          >
            <CircularProgress />
          </Box>
        ) : error ? (<Alert severity="error" sx={{ mt: { xs: 1.5, sm: 2 } }}> {error} </Alert>) 
          : (
          <>
            <Typography variant="subtitle1" sx={{ mb: 1, textAlign: "left", wordBreak: "break-word" }}>
              File: {file?.originalname}
            </Typography>
             {/* Graph container */}
            <Box
              ref={visRef}
              sx={{
                height: { xs: 320, sm: 420, md: 520 },
                width: "100%",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1.5,
                bgcolor: "background.paper",
                overflow: "hidden",
              }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: { xs: 1.5, sm: 2 } }}>
              {
                "Note: If you are not the owner of the file, you will only see the portion of the access graph that is relevant to your access."
              }
            </Typography>
          </>
        )}
      </Box>
    </Container>
  )
}
