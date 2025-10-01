import { useState, useEffect } from "react"
import { TextField, Button, Typography, Container, Box, Card, CardContent,
  CardActions, Link as MuiLink, IconButton, Alert, CircularProgress } from "@mui/material"
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1"
import api from "../../api"
import { useNavigate, Link } from "react-router-dom"
import Visibility from "@mui/icons-material/Visibility"
import VisibilityOff from "@mui/icons-material/VisibilityOff"

export default function Signup() {
  // State for form inputs and UI feedback
  const [form, setForm] = useState({ username: "", email: "", password: "", confirmPassword: "" })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

   // Clear error automatically after 3 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 3000)
      return () => clearTimeout(timer)
    }
  }, [error])

  // Basic validation for email, password strength
  const validate = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/

    if (!form.username) return "Username is required"
    if (!form.email) return "Email is required"
    if (!emailRegex.test(form.email)) return "Invalid email format"
    if (!form.password) return "Password is required"
    if (!passwordRegex.test(form.password))
      return "Password must be at least 8 characters and include a number and a letter"
    if (!form.confirmPassword) return "Please confirm your password"
    if (form.password !== form.confirmPassword) return "Passwords do not match"

    return ""
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

   // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      setLoading(false)
      return
    }

    try {
      // Call backend signup API
      await api.post(`/auth/signup`, {
        username: form.username,
        email: form.email,
        password: form.password,
      })
      setSuccess("Signup successful! Redirecting to login...")
      setTimeout(() => navigate("/login"), 1500)
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: { xs: "100vh", sm: "100vh" },
        display: "flex",
        alignItems: { xs: "flex-start", sm: "center" },
        justifyContent: "center",
        pt: { xs: 2, sm: 0 },
        pb: { xs: 2, sm: 0 },
        px: { xs: 2, sm: 0 },
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: { xs: "100%", sm: 420, md: 480 },
          bgcolor: "#F9FAFB",
          color: "#111827",
          border: "1.5px solid #64748B",
          boxShadow: 3,
          borderRadius: { xs: 2, sm: 3 },
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          <Box display="flex" flexDirection="column" alignItems="center" mb={0.5}>
            <PersonAddAlt1Icon sx={{ fontSize: { xs: 44, sm: 56 }, color: "#38BDF8", mb: { xs: 1, sm: 1.5 } }} />
            <Typography
              variant="h4"
              align="center"
              gutterBottom
              color="#1E3A8A"
              sx={{ fontWeight: 700, fontSize: { xs: 24, sm: 28 } }}
            >
              Register
            </Typography>
          </Box>

          {error && (<Alert severity="error" sx={{ mb: 2 }}> {error} </Alert>)}
          {success && (<Alert severity="success" sx={{ mb: 2 }}> {success} </Alert>)}

          {/* Signup form */}
          <form onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              fullWidth
              label="Username"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              sx={{ "& .MuiInputBase-root": { background: "#fff", fontSize: { xs: 14, sm: 15 } } }}
              size="medium"
            />
            <TextField
              margin="normal"
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              sx={{ "& .MuiInputBase-root": { background: "#fff", fontSize: { xs: 14, sm: 15 } } }}
              size="medium"
            />
            <TextField
              margin="normal"
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              required
              sx={{ "& .MuiInputBase-root": { background: "#fff", fontSize: { xs: 14, sm: 15 } } }}
              InputProps={{
                endAdornment: (
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword((show) => !show)}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
              size="medium"
            />
            <TextField
              margin="normal"
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={form.confirmPassword}
              onChange={handleChange}
              required
              sx={{ "& .MuiInputBase-root": { background: "#fff", fontSize: { xs: 14, sm: 15 } } }}
              InputProps={{
                endAdornment: (
                  <IconButton
                    aria-label="toggle confirm password visibility"
                    onClick={() => setShowConfirmPassword((show) => !show)}
                    edge="end"
                    size="small"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
              size="medium"
            />

            {/* Submit button */}
            <CardActions sx={{ justifyContent: "center", mt: 2, p: 0 }}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  background: "#1E3A8A",
                  color: "#F9FAFB",
                  "&:hover": { background: "#163172" },
                  fontSize: { xs: 15, sm: 16 },
                  py: { xs: 1, sm: 1.2 },
                }}
                disabled={loading}
                size="medium"
              >
                {loading ? <CircularProgress size={22} sx={{ color: "#F9FAFB" }} /> : "Register"}
              </Button>
            </CardActions>
          </form>
        </CardContent>

        <Box textAlign="center" pb={{ xs: 1.5, sm: 2 }}>
          <Typography variant="body2" color="#64748B" sx={{ fontSize: { xs: 14, sm: 15 } }}>
            Already have an account?{" "}
            <MuiLink 
            component={Link}
            to="/login" 
            sx={{ color: "#1E3A8A", fontSize: { xs: 14, sm: 15 } }} underline="hover"
            >
              Login
            </MuiLink>
          </Typography>
        </Box>
      </Card>
    </Container>
  )
}
