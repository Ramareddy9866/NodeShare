import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import getTheme from './theme';

function Main() {
  const mode = localStorage.getItem('themeMode') || 'light';
  const theme = getTheme(mode);
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <App themeMode={mode} />
      </Router>
    </ThemeProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Main />);

reportWebVitals();
