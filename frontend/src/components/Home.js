import React from 'react';
import { Box, Typography, Button, Grid, Container, AppBar, Toolbar, Card, CardContent, Fade } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Healing, LocalHospital, Videocam } from '@mui/icons-material';

const Home = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ bgcolor: '#e9ecef', minHeight: '100vh', fontFamily: '"Inter", sans-serif' }}>
      {/* Navigation Bar */}
      <AppBar position="fixed" sx={{ bgcolor: '#004aad', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 4 } }}>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '1.2rem', md: '1.5rem' }, color: '#fff' }}>
            Digital Health Hub
          </Typography>
          <Box sx={{ display: 'flex', gap: { xs: 1, md: 3 } }}>
            <Button color="inherit" sx={{ fontWeight: 500, fontSize: { xs: '0.9rem', md: '1rem' } }} onClick={() => navigate('/')}>Home</Button>
            <Button color="inherit" sx={{ fontWeight: 500, fontSize: { xs: '0.9rem', md: '1rem' } }} onClick={() => navigate('/about')}>About</Button>
            <Button color="inherit" sx={{ fontWeight: 500, fontSize: { xs: '0.9rem', md: '1rem' } }} onClick={() => navigate('/services')}>Services</Button>
            <Button color="inherit" sx={{ fontWeight: 500, fontSize: { xs: '0.9rem', md: '1rem' } }} onClick={() => navigate('/contact')}>Contact</Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          pt: 8,
          background: 'linear-gradient(135deg, #004aad 0%, #00a8cc 100%)',
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'url(https://images.unsplash.com/photo-1666214280253-4d78e7980cd0) no-repeat center',
            backgroundSize: 'cover',
            opacity: 0.3,
            zIndex: 1,
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Fade in timeout={800}>
            <Box>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '3rem', md: '5rem' },
                  fontWeight: 800,
                  mb: 3,
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                }}
              >
                Empowering Your Health
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontSize: { xs: '1.2rem', md: '1.8rem' },
                  fontWeight: 300,
                  mb: 4,
                  maxWidth: 800,
                  mx: 'auto',
                }}
              >
                Revolutionizing healthcare in Robe City with seamless access to hospitals, clinics, and digital services.
              </Typography>
              <Button
                variant="contained"
                size="large"
                sx={{
                  bgcolor: '#ff6f61',
                  color: '#fff',
                  px: 6,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: '30px',
                  '&:hover': { bgcolor: '#e65b50', transform: 'scale(1.1)' },
                  transition: 'all 0.3s',
                }}
                onClick={() => navigate('/register')}
                aria-label="Join as a patient"
              >
                Join Now
              </Button>
            </Box>
          </Fade>
        </Container>
      </Box>

      {/* Services Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Typography
          variant="h3"
          sx={{ textAlign: 'center', fontWeight: 700, color: '#004aad', mb: 6 }}
        >
          Our Core Services
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={4}>
            <Fade in timeout={1000}>
              <Card
                sx={{
                  bgcolor: '#fff',
                  borderRadius: 4,
                  border: '1px solid #e0e0e0',
                  transition: 'all 0.3s',
                  '&:hover': { transform: 'scale(1.05)', borderColor: '#ff6f61' },
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 5 }}>
                  <LocalHospital sx={{ fontSize: 70, color: '#ff6f61', mb: 2 }} />
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 1.5 }}>
                    Smart Scheduling
                  </Typography>
                  <Typography sx={{ color: '#4a4a4a', fontSize: '1rem' }}>
                    Book appointments instantly across 2 hospitals and 6 clinics with real-time availability.
                  </Typography>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Fade in timeout={1200}>
              <Card
                sx={{
                  bgcolor: '#fff',
                  borderRadius: 4,
                  border: '1px solid #e0e0e0',
                  transition: 'all 0.3s',
                  '&:hover': { transform: 'scale(1.05)', borderColor: '#ff6f61' },
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 5 }}>
                  <Healing sx={{ fontSize: 70, color: '#ff6f61', mb: 2 }} />
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 1.5 }}>
                    Health Records
                  </Typography>
                  <Typography sx={{ color: '#4a4a4a', fontSize: '1rem' }}>
                    Securely access and manage your medical records on a unified platform.
                  </Typography>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Fade in timeout={1400}>
              <Card
                sx={{
                  bgcolor: '#fff',
                  borderRadius: 4,
                  border: '1px solid #e0e0e0',
                  transition: 'all 0.3s',
                  '&:hover': { transform: 'scale(1.05)', borderColor: '#ff6f61' },
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 5 }}>
                  <Videocam sx={{ fontSize: 70, color: '#ff6f61', mb: 2 }} />
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 1.5 }}>
                    Virtual Care
                  </Typography>
                  <Typography sx={{ color: '#4a4a4a', fontSize: '1rem' }}>
                    Consult doctors remotely with secure video calls and follow-up tools.
                  </Typography>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        </Grid>
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

export default Home;