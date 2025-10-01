import { createTheme } from '@mui/material/styles';

const getTheme = () => createTheme({
  palette: {
    primary: { main: '#1E3A8A' },      
    secondary: { main: '#506889' },   
    accent: { main: '#38BDF8' },       
    background: {
      default: '#F9FAFB',              
      paper: '#FFFFFF'               
    },
    text: {
      primary: '#111827',              
    },
    success: { main: '#10B981' },      
    error: { main: '#EF4444' },        
    warning: { main: '#F59E0B' },      
    info: { main: '#3B82F6' }          
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
