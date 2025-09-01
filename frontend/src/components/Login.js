import React, { useState } from 'react';
import {
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Container,
  AppBar,
  Toolbar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

<<<<<<< HEAD
  // Single redirectToDashboard function
  const redirectToDashboard = (role) => {
    switch (role) {
      case 'admin':
        window.location.href = '/admin-dashboard';
        break;
      case 'doctor':
        window.location.href = '/doctor-dashboard';
        break;
      case 'pharmacist':
        window.location.href = '/pharmacist-dashboard';
        break;
      case 'lab_staff':
        window.location.href = '/lab-dashboard';
        break;
      case 'patient':
        window.location.href = '/patient-dashboard';
        break;
      default:
        window.location.href = '/dashboard';
    }
  };

=======
>>>>>>> eeea500e7c21953c51f8f841cd9d812eaa7d4522
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
<<<<<<< HEAD
      // First try to login as user (staff/doctor/admin/pharmacist/lab_staff)
=======
      // First try to login as user (staff/doctor/admin)
>>>>>>> eeea500e7c21953c51f8f841cd9d812eaa7d4522
      const userResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email: formData.email,
        password: formData.password
      }, { timeout: 5000 });

      if (userResponse.data.requiresMFA) {
        setShowOtp(true);
        setUserId(userResponse.data.userId);
        setUserRole(userResponse.data.role);
      } else {
        localStorage.setItem('token', userResponse.data.token);
        localStorage.setItem('role', userResponse.data.role);
        localStorage.setItem('userId', userResponse.data.userId);
<<<<<<< HEAD
        localStorage.setItem('username', userResponse.data.username);
=======
>>>>>>> eeea500e7c21953c51f8f841cd9d812eaa7d4522
        redirectToDashboard(userResponse.data.role);
      }

    } catch (userError) {
      // If user login fails, try patient login
      try {
        const patientResponse = await axios.post('http://localhost:5000/api/auth/patient-login', {
          email: formData.email,
          password: formData.password
        }, { timeout: 5000 });

        if (patientResponse.data.requiresMFA) {
          setShowOtp(true);
          setUserId(patientResponse.data.userId);
<<<<<<< HEAD
          setUserRole('patient');
=======
          setUserRole('patient'); // Patients always have 'patient' role
>>>>>>> eeea500e7c21953c51f8f841cd9d812eaa7d4522
        } else {
          localStorage.setItem('token', patientResponse.data.token);
          localStorage.setItem('role', 'patient');
          localStorage.setItem('userId', patientResponse.data.userId);
          redirectToDashboard('patient');
        }

      } catch (patientError) {
        setLoading(false);
        if (patientError.response?.status === 401) {
          setError('Invalid email or password');
        } else if (patientError.code === 'ERR_NETWORK') {
          setError('Cannot connect to server. Please try again later.');
        } else {
          setError('Login failed. Please check your credentials.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    setError('');

    try {
      const endpoint = userRole === 'patient' 
        ? '/api/auth/verify-patient-mfa' 
        : '/api/auth/verify-mfa';

      const response = await axios.post(`http://localhost:5000${endpoint}`, {
        userId,
        otp
      }, { timeout: 5000 });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', userRole);
      localStorage.setItem('userId', response.data.userId);
      redirectToDashboard(userRole);

    } catch (error) {
      setLoading(false);
      if (error.response?.status === 401) {
        setError('Invalid OTP code');
      } else {
        setError('Verification failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
=======
  // In your handleLogin function, update the redirection:
const redirectToDashboard = (role) => {
  switch (role) {
    case 'admin':
      window.location.href = '/admin-dashboard';
      break;
    case 'doctor':
      window.location.href = '/doctor-dashboard';
      break;
    case 'pharmacist':
      window.location.href = '/pharmacist-dashboard';
      break;
    case 'lab_staff':
      window.location.href = '/lab-dashboard';
      break;
    case 'patient':
      window.location.href = '/patient-dashboard';
      break;
    default:
      window.location.href = '/dashboard';
  }
};

>>>>>>> eeea500e7c21953c51f8f841cd9d812eaa7d4522
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

      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Box
          sx={{
            bgcolor: '#fff',
            borderRadius: 4,
            boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
            p: { xs: 3, md: 5 },
            textAlign: 'center',
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#004aad', mb: 3 }}>
            Login
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {!showOtp ? (
            <form onSubmit={handleLogin}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                sx={{ mb: 2 }}
                variant="outlined"
                required
              />
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                sx={{ mb: 3 }}
                variant="outlined"
                required
              />
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                fullWidth
                sx={{
                  bgcolor: '#ff6f61',
                  color: '#fff',
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  borderRadius: '30px',
                  '&:hover': { bgcolor: '#e65b50' },
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
              </Button>
            </form>
          ) : (
            <>
              <TextField
                fullWidth
                label="OTP Code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                sx={{ mb: 2 }}
                variant="outlined"
                required
              />
              <Button
                variant="contained"
                onClick={handleVerify}
                disabled={loading}
                fullWidth
                sx={{
                  bgcolor: '#ff6f61',
                  color: '#fff',
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  borderRadius: '30px',
                  '&:hover': { bgcolor: '#e65b50' },
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Verify OTP'}
              </Button>
            </>
          )}

          <Typography sx={{ mt: 3, color: '#4a4a4a' }}>
            Don't have an account?{' '}
            <Button
              sx={{ color: '#ff6f61', fontWeight: 500 }}
              onClick={() => navigate('/register')}
            >
              Register
            </Button>
          </Typography>
        </Box>
      </Container>

      {/* Footer */}
      <Box sx={{ bgcolor: '#004aad', color: '#fff', py: 4, textAlign: 'center', mt: 4 }}>
        <Container maxWidth="lg">
          <Typography variant="body1" sx={{ mb: 2, fontWeight: 300 }}>
            © 2025 Digital Health Hub. Redefining Healthcare Access.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Login;