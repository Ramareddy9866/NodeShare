import { createTheme } from '@mui/material/styles';

const getTheme = () => createTheme({
  palette: {
    primary: { main: '#1E3A8A' },      // top bar
    secondary: { main: '#506889' },    // sidebar
    accent: { main: '#38BDF8' },       // action buttons
    background: {
      default: '#F9FAFB',              // app background
      paper: '#FFFFFF'                 // card background
    },
    text: {
      primary: '#111827',              // main text
    },
    success: { main: '#10B981' },      // success messages
    error: { main: '#EF4444' },        // error messages
    warning: { main: '#F59E0B' },      // warning messages
    info: { main: '#3B82F6' }          // info messages
  },

  components: {
    MuiAppBar: {
      styleOverrides: {
        root: { backgroundColor: '#1E3A8A' }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#334155',
          color: '#F1F5F9'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          boxShadow: '0px 4px 10px rgba(0,0,0,0.04)'
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 500,
        }
      }
    }
  },

  typography: {
    fontFamily: `'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif`,
    h6: {
      fontWeight: 600,
    },
    button: {
      fontSize: '0.9rem',
    },
  }
});

export default getTheme;
