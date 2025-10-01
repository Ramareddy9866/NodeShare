import { useState, useEffect } from "react"
import { TextField, Button, Typography, Container, Box, Card, CardContent, CardActions, 
  Link as MuiLink, IconButton, Alert, CircularProgress } from "@mui/material"
import LoginIcon from "@mui/icons-material/Login"
import api from "../../api"
import { useNavigate, Link } from "react-router-dom"
import Visibility from "@mui/icons-material/Visibility"
import VisibilityOff from "@mui/icons-material/VisibilityOff"
import { useAuth } from "../../AuthContext"

export default function Login() {
  // state variables for form, errors, password visibility and loading
  const [form, setForm] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const { login } = useAuth()

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 3000)
      return () => clearTimeout(timer)
    }
  }, [error])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
     // call backend API for login
      const res = await api.post("/auth/login", form)
      const token = res.data.token

      await login(token)

      navigate("/dashboard")  // redirect after success
    } catch (err) {
      setError(err.response?.data?.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: { xs: "flex-start", sm: "center" },
        justifyContent: "center",
        py: { xs: 3, sm: 6 },
        px: { xs: 2, sm: 0 },
        mt: 0,
      }}
    >
      {/* Card holds login form */}
      <Card
        sx={{
          width: "100%",
          maxWidth: { xs: "100%", sm: 420, md: 480 },
          bgcolor: "#F9FAFB",
          color: "#111827",
          border: "1.5px solid #64748B",
          boxShadow: 3,
          mx: "auto",
          borderRadius: 2,
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, sm: 3.5, md: 4 } }}>
          <Box display="flex" flexDirection="column" alignItems="center" mb={0.5}>
            <LoginIcon sx={{ fontSize: { xs: 48, sm: 56 }, color: "#38BDF8", mb: 1.5 }} />
            <Typography
              variant="h4"
              align="center"
              gutterBottom
              color="#1E3A8A"
              sx={{ fontWeight: 700, fontSize: { xs: 24, sm: 28 } }}
            >
              Login
            </Typography>
          </Box>

          {error && (<Alert severity="error" sx={{ mb: 2 }}> {error} </Alert>)}

          {/* login form */}
          <form onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              disabled={loading}
              sx={{ "& .MuiInputBase-root": { background: "#fff", fontSize: { xs: 14, sm: 15 } } }}
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
              disabled={loading}
              sx={{ "& .MuiInputBase-root": { background: "#fff", fontSize: { xs: 14, sm: 15 } } }}
              InputProps={{
                endAdornment: (
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword((prev) => !prev)}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
            />

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
                  borderRadius: 1.25,
                }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={22} sx={{ color: "#F9FAFB" }} /> : "Login"}
              </Button>
            </CardActions>
          </form>
        </CardContent>

        <Box textAlign="center" pb={1} px={{ xs: 2, sm: 0 }}>
          <MuiLink
            component={Link}
            to="/forgot-password"
            sx={{ color: "#1E3A8A", fontSize: { xs: 14, sm: 15 } }}
            underline="hover"
          >
            Forgot Password?
          </MuiLink>
        </Box>

        <Box textAlign="center" pb={1.5} px={{ xs: 2, sm: 0 }}>
          <Typography variant="body2" color="#64748B" sx={{ fontSize: { xs: 14, sm: 15 } }}>
            {"Don't have an account? "}
            <MuiLink
              component={Link}
              to="/signup"
              sx={{ color: "#1E3A8A", fontSize: { xs: 14, sm: 15 } }}
              underline="hover"
            >
              Register
            </MuiLink>
          </Typography>
        </Box>
      </Card>
    </Container>
  )
}
