import { useState, useEffect } from "react"
import { TextField, Button, Typography, Container, Card, CardContent, Box, Alert, CircularProgress } from "@mui/material"
import { useNavigate } from "react-router-dom"
import api from "../../api"

const ForgotPassword = () => {
  // state variables to store email, messages, errors and loading state
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage("")
    setError("")
    setLoading(true) 
    try {
      const res = await api.post("/auth/forgot-password", { email })
      if (res.status === 200) setMessage(res.data.message)
      else setError(res.data.message)
    } catch (err) {
      setError("Something went wrong.")
    } finally {
      setLoading(false) 
    }
  }

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: { xs: "100dvh", md: "100vh" },
        display: "flex",
        alignItems: { xs: "flex-start", md: "center" },
        justifyContent: "center",
        py: { xs: 4, md: 8 },
        px: { xs: 2, sm: 0 },
      }}
    >
      {/* Card holds the forgot password form */}
      <Card
        sx={{
          width: "100%",
          maxWidth: { xs: "100%", sm: 440, md: 480 },
          bgcolor: "#F9FAFB",
          color: "#111827",
          border: "1.5px solid #64748B",
          boxShadow: 3,
          borderRadius: 2,
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          <Typography
            variant="h5"
            align="center"
            gutterBottom
            sx={{ mt: 1, mb: 2, fontWeight: 600, fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
          >
            Forgot Password
          </Typography>

          {/* form to enter email and submit */}
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="Email"
                fullWidth
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                sx={{
                  "& .MuiInputBase-input": { fontSize: { xs: "0.95rem", sm: "1rem" } },
                }}
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
                sx={{ minHeight: { xs: 44, sm: 48 }, textTransform: "none" }}
              >
                {loading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Send Reset Link"}
              </Button>

              <Button
                variant="outlined"
                color="primary"
                fullWidth
                onClick={() => navigate("/login")}
                sx={{ minHeight: { xs: 44, sm: 48 }, textTransform: "none" }}
              >
                Back to Login
              </Button>
            </Box>
          </form>

          {/* show messages or errors */}
          {message && (<Alert severity="success" sx={{ mt: 2 }}> {message} </Alert>)}
          {error && (<Alert severity="error" sx={{ mt: 2 }}> {error} </Alert>)}
        </CardContent>
      </Card>
    </Container>
  )
}

export default ForgotPassword
