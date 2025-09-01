import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Container,
  Alert,
  CircularProgress,
  Paper,
  MenuItem,
  AppBar,
  Toolbar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const TestRegistration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: 'test123', // Default password
    role: 'doctor',
    phone: '+1-555-0000'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const roles = [
    { value: 'admin', label: 'Admin' },
    { value: 'doctor', label: 'Doctor' },
    { value: 'pharmacist', label: 'Pharmacist' },
    { value: 'lab_staff', label: 'Lab Staff' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('http://localhost:5000/api/test/create-user', {
        ...formData
      }, { timeout: 5000 });

      if (response.status === 201) {
        setSuccess(`User created successfully! Username: ${formData.username}, Password: test123`);
        setFormData({
          username: '',
          email: '',
          password: 'test123',
          role: 'doctor',
          phone: '+1-555-0000'
        });
      }
    } catch (error) {
      if (error.response?.status === 409) {
        setError('Email already exists. Please use a different email.');
      } else if (error.code === 'ERR_NETWORK') {
        setError('Cannot connect to server. Make sure backend is running on port 5000.');
      } else {
        setError(error.response?.data?.message || 'Failed to create user.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  return (
    <Box sx={{ bgcolor: '#e9ecef', minHeight: '100vh', fontFamily: '"Inter", sans-serif', pt: 8 }}>
      {/* Navigation Bar */}
      <AppBar position="fixed" sx={{ bgcolor: '#004aad', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 4 } }}>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '1.2rem', md: '1.5rem' }, color: '#fff' }}>
            Digital Health Hub - Test Registration
          </Typography>
          <Box sx={{ display: 'flex', gap: { xs: 1, md: 3 } }}>
            <Button color="inherit" sx={{ fontWeight: 500 }} onClick={() => navigate('/')}>Home</Button>
            <Button color="inherit" sx={{ fontWeight: 500 }} onClick={() => navigate('/login')}>Login</Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#004aad', mb: 3 }}>
            Create Test User
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              select
              label="Role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            >
              {roles.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            
            <TextField
              fullWidth
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              sx={{ mb: 3 }}
            />
            
            <Typography variant="body2" sx={{ mb: 2, color: 'green' }}>
              Password will be: <strong>test123</strong>
            </Typography>
            
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                bgcolor: '#ff6f61',
                color: '#fff',
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: '30px',
                '&:hover': { bgcolor: '#e65b50' },
                minWidth: 150
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Create User'}
            </Button>
          </form>

          <Typography sx={{ mt: 3, color: '#4a4a4a' }}>
            <Button
              sx={{ color: '#ff6f61', fontWeight: 500 }}
              onClick={() => navigate('/login')}
            >
              Go to Login
            </Button>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default TestRegistration;