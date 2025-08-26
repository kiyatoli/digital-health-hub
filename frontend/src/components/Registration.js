import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Container,
  AppBar,
  Toolbar,
  Alert,
  CircularProgress,
  Fade,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PersonAdd } from '@mui/icons-material';
import axios from 'axios';

const Registration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    dob: '',
    address: '',
    phone: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.match(/^[\w-]+@([\w-]+\.)+[\w-]{2,4}$/))
      newErrors.email = 'Invalid email format';
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!formData.dob.match(/^\d{4}-\d{2}-\d{2}$/)) newErrors.dob = 'Date of birth must be YYYY-MM-DD';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.phone.match(/^\+?\d{10,15}$/))
      newErrors.phone = 'Phone number must be 10-15 digits';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccess(false);

    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/register', {
        ...formData,
        role: 'patient',
      }, { timeout: 5000 });

      if (response.status === 201) {
        setSuccess(true);
        setFormData({ name: '', email: '', password: '', dob: '', address: '', phone: '' });
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setServerError('Unexpected response from server. Please try again.');
      }
    } catch (error) {
      setLoading(false);
      if (error.code === 'ERR_NETWORK') {
        setServerError('Cannot connect to server. Ensure the backend is running on port 5000.');
      } else if (error.response) {
        if (error.response.status === 404) {
          setServerError('Registration endpoint not found. Check backend setup.');
        } else if (error.response.status === 409) {
          setServerError('Email already exists. Please use a different email.');
        } else if (error.response.status === 400) {
          setServerError(error.response.data.message || 'Invalid input data.');
        } else {
          setServerError(`Server error (${error.response.status}). Please try again.`);
        }
      } else {
        setServerError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
    setServerError('');
  };

  return (
    <Box sx={{ bgcolor: '#e9ecef', minHeight: '100vh', fontFamily: '"Inter", sans-serif', pt: 8 }}>
      {/* Navigation Bar */}
      <AppBar position="fixed" sx={{ bgcolor: '#004aad', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 4 } }}>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '1.2rem', md: '1.5rem' }, color: '#fff' }}>
            Digital Health Hub
          </Typography>
          <Box sx={{ display: 'flex', gap: { xs: 1, md: 3 } }}>
            <Button color="inherit" sx={{ fontWeight: 500 }} onClick={() => navigate('/')}>Home</Button>
            <Button color="inherit" sx={{ fontWeight: 500 }} onClick={() => navigate('/about')}>About</Button>
            <Button color="inherit" sx={{ fontWeight: 500 }} onClick={() => navigate('/services')}>Services</Button>
            <Button color="inherit" sx={{ fontWeight: 500 }} onClick={() => navigate('/contact')}>Contact</Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Registration Form */}
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Fade in timeout={800}>
          <Box
            sx={{
              bgcolor: '#fff',
              borderRadius: 4,
              boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
              p: { xs: 3, md: 5 },
              textAlign: 'center',
            }}
          >
            <PersonAdd sx={{ fontSize: 60, color: '#ff6f61', mb: 2 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#004aad', mb: 3 }}>
              Patient Registration
            </Typography>
            {serverError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {serverError}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Registration successful! Redirecting to login...
              </Alert>
            )}
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                sx={{ mb: 2 }}
                variant="outlined"
                aria-label="Enter your full name"
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                sx={{ mb: 2 }}
                variant="outlined"
                aria-label="Enter your email address"
              />
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                sx={{ mb: 2 }}
                variant="outlined"
                aria-label="Enter your password"
              />
              <TextField
                fullWidth
                label="Date of Birth (YYYY-MM-DD)"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                error={!!errors.dob}
                helperText={errors.dob}
                sx={{ mb: 2 }}
                variant="outlined"
                aria-label="Enter your date of birth"
              />
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                error={!!errors.address}
                helperText={errors.address}
                sx={{ mb: 2 }}
                variant="outlined"
                aria-label="Enter your address"
              />
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                error={!!errors.phone}
                helperText={errors.phone}
                sx={{ mb: 3 }}
                variant="outlined"
                aria-label="Enter your phone number"
              />
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
                }}
                aria-label="Submit registration"
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
              </Button>
            </form>
            <Typography sx={{ mt: 2, color: '#4a4a4a' }}>
              Already have an account?{' '}
              <Button
                sx={{ color: '#ff6f61', fontWeight: 500 }}
                onClick={() => navigate('/login')}
                aria-label="Go to login page"
              >
                Log In
              </Button>
            </Typography>
          </Box>
        </Fade>
      </Container>

      {/* Footer */}
      <Box sx={{ bgcolor: '#004aad', color: '#fff', py: 4, textAlign: 'center' }}>
        <Container maxWidth="lg">
          <Typography variant="body1" sx={{ mb: 2, fontWeight: 300 }}>
            © 2025 Digital Health Hub. Redefining Healthcare Access.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
            <Button sx={{ color: '#fff', fontWeight: 500 }} onClick={() => navigate('/')}>Home</Button>
            <Button sx={{ color: '#fff', fontWeight: 500 }} onClick={() => navigate('/about')}>About</Button>
            <Button sx={{ color: '#fff', fontWeight: 500 }} onClick={() => navigate('/services')}>Services</Button>
            <Button sx={{ color: '#fff', fontWeight: 500 }} onClick={() => navigate('/contact')}>Contact</Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Registration;