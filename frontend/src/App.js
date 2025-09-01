import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import Home from './components/Home';
import Login from './components/Login';
import Registration from './components/Registration';
<<<<<<< HEAD
//import TestRegistration from './components/TestRegistration'; // Add this import
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard'; // Changed the import name

=======
import Dashboard from './components/Dashboard';
>>>>>>> eeea500e7c21953c51f8f841cd9d812eaa7d4522
import { useTranslation } from 'react-i18next';
import { AppBar, Toolbar, Typography, Select, MenuItem, FormControl, Box } from '@mui/material';

function App() {
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState('en');

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>{t('welcome')}</Typography>
            <FormControl sx={{ minWidth: 120 }}>
              <Select value={language} onChange={handleLanguageChange} sx={{ color: 'white' }}>
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="am">Amharic</MenuItem>
                <MenuItem value="om">Afan Oromo</MenuItem>
              </Select>
            </FormControl>
          </Toolbar>
        </AppBar>
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pt: 4 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Registration />} />
            <Route path="/dashboard" element={localStorage.getItem('token') ? <Dashboard /> : <Navigate to="/login" />} />
<<<<<<< HEAD
            {/* Add these routes */}
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/doctor-dashboard" element={<Dashboard />} />
            <Route path="/pharmacist-dashboard" element={<Dashboard />} />
            <Route path="/lab-dashboard" element={<Dashboard />} />
            <Route path="/patient-dashboard" element={<Dashboard />} />
            {/* Add this route */}
=======
>>>>>>> eeea500e7c21953c51f8f841cd9d812eaa7d4522
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;