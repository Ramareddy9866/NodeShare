import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme'; 

import { AuthProvider } from './AuthContext';

function Main() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <AuthProvider>
          <App />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Main />);
