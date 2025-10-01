import { useState } from "react"
import {
  TextField, Button, Typography, Container, Card, CardContent, Box, Alert, CircularProgress } from "@mui/material"
import { useLocation, useNavigate } from "react-router-dom"
import api from "../../api"

const ResetPassword = () => {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  // get token from url
  const params = new URLSearchParams(location.search)
  const token = params.get("token")

  // check password rules
  const validate = () => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/
    if (!passwordRegex.test(password)) return "Password must be at least 8 characters and include a number and a letter"
    if (!confirmPassword) return "Please confirm your password"
    if (password !== confirmPassword) return "Passwords do not match"
    return ""
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage("")
    setError("")
    setLoading(true)

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      setLoading(false)
      return
    }

    try {
      // call backend to reset password
      const res = await api.post("/auth/reset-password", { token, password })
      if (res.status === 200) {
        setMessage(res.data.message)
        setTimeout(() => navigate("/login"), 2000) // redirect after success
      } else {
        setError(res.data.message || "Reset password failed")
      }
    } catch (err) {
      setError("Something went wrong.")
    } finally {
      setLoading(false) 
    }
  }

  if (!token) return <Alert severity="error">Invalid or missing token.</Alert>

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: { xs: "100vh", sm: "90vh" }, 
        display: "flex",
        alignItems: { xs: "flex-start", md: "center" }, 
        justifyContent: "center",
        pt: { xs: 6, sm: 8, md: 0 }, 
        px: { xs: 2, sm: 3 },
      }}
    >
      {/* reset password card */}
      <Card
        sx={{
          width: "100%",
          maxWidth: { xs: 420, sm: 500, md: 560 },
          bgcolor: "#F9FAFB",
          color: "#111827",
          border: "1.5px solid #64748B",
          boxShadow: 3,
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, sm: 3, md: 4 } }}>
          <Typography
            variant="h5"
            align="center"
            gutterBottom
            sx={{ mt: { xs: 0.5, sm: 1 }, mb: { xs: 1.5, sm: 2 }, fontWeight: 600, fontSize: { xs: "1.25rem", sm: "1.5rem" }}}
          >
            Reset Password
          </Typography>

          {/* reset form */}
          <form onSubmit={handleSubmit}>
            <TextField
              label="New Password"
              type="password"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{
                "& .MuiInputBase-root": { background: "#fff", fontSize: { xs: 14, sm: 15 } },
              }}
            />
            <TextField
              label="Confirm Password"
              type="password"
              fullWidth
              margin="normal"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              sx={{
                "& .MuiInputBase-root": { background: "#fff", fontSize: { xs: 14, sm: 15 } },
              }}
            />

            <Box mt={{ xs: 2, sm: 2.5 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
                sx={{
                  py: { xs: 1.25, sm: 1.5 },
                  fontSize: { xs: "0.95rem", sm: "1rem" },
                }}
              >
                {loading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Reset Password"}
              </Button>
            </Box>
          </form>

          {message && (<Alert severity="success" sx={{ mt: { xs: 2, sm: 2.5 } }}> {message} </Alert>)}
          {error && (<Alert severity="error" sx={{ mt: { xs: 2, sm: 2.5 } }}> {error} </Alert>)}
        </CardContent>
      </Card>
    </Container>
  )
}

export default ResetPassword
