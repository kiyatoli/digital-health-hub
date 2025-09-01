import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import AppointmentForm from './AppointmentForm';
import EMRView from './EMRView';
import Telemedicine from './Telemedicine';
import Inventory from './Inventory';
import Analytics from './Analytics';
<<<<<<< HEAD
import Profile from './Profile';
import UserManagement from './UserManagement';
import { 
  Box, Drawer, List, ListItem, ListItemText, Typography, Button, Divider,
  AppBar, Toolbar, Container, Card, CardContent, Grid
} from '@mui/material';
=======
import Profile from './Profile';  // New profile component
import UserManagement from './UserManagement';  // New for admin
import { Box, Drawer, List, ListItem, ListItemText, Typography, Button, Divider } from '@mui/material';
>>>>>>> eeea500e7c21953c51f8f841cd9d812eaa7d4522
import { useNavigate } from 'react-router-dom';

const drawerWidth = 240;

const Dashboard = () => {
  const { t } = useTranslation();
<<<<<<< HEAD
  const [user, setUser] = useState(null);
  const [view, setView] = useState('dashboard');
=======
  const [role, setRole] = useState('');
  const [view, setView] = useState('main');  // To switch views (main, profile, user_management)
>>>>>>> eeea500e7c21953c51f8f841cd9d812eaa7d4522
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
<<<<<<< HEAD
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        const username = localStorage.getItem('username');
        
        if (!token || !role) {
          navigate('/login');
          return;
        }

        setUser({
          role: role,
          username: username,
          // Add other user details as needed
        });

      } catch (err) {
        console.error('Failed to fetch user:', err);
=======
        const res = await api.get('/auth/me');
        setRole(res.data.role);
      } catch (err) {
        console.error(err);
>>>>>>> eeea500e7c21953c51f8f841cd9d812eaa7d4522
        navigate('/login');
      }
    };
    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
<<<<<<< HEAD
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const renderDashboardContent = () => {
    if (!user) return <Typography>Loading...</Typography>;

    switch (user.role) {
      case 'patient':
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom>Appointments</Typography>
                  <AppointmentForm />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom>Medical Records</Typography>
                  <EMRView />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );
      case 'doctor':
        return (
          <Card>
            <CardContent>
              <Typography variant="h4" gutterBottom>Doctor Dashboard</Typography>
              <EMRView />
            </CardContent>
          </Card>
        );
      case 'admin':
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom>Analytics</Typography>
                  <Analytics />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom>User Management</Typography>
                  <UserManagement />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );
      case 'pharmacist':
        return (
          <Card>
            <CardContent>
              <Typography variant="h4" gutterBottom>Pharmacist Dashboard</Typography>
              <Inventory />
            </CardContent>
          </Card>
        );
      case 'lab_staff':
        return (
          <Card>
            <CardContent>
              <Typography variant="h4" gutterBottom>Lab Staff Dashboard</Typography>
              <Typography>Lab results management interface coming soon...</Typography>
            </CardContent>
          </Card>
        );
      default:
        return <Typography>Access Denied</Typography>;
    }
  };

  const renderContent = () => {
    switch (view) {
      case 'profile':
        return <Profile />;
      case 'user_management':
        return user?.role === 'admin' ? <UserManagement /> : <Typography>Access Denied</Typography>;
      case 'dashboard':
      default:
        return renderDashboardContent();
=======
    navigate('/login');
  };

  const renderContent = () => {
    if (view === 'profile') return <Profile />;
    if (view === 'user_management' && role === 'admin') return <UserManagement />;

    switch (role) {
      case 'patient':
        return (
          <>
            <AppointmentForm />
            <EMRView />
            <Telemedicine />
          </>
        );
      case 'doctor':
        return <EMRView />;
      case 'admin':
        return (
          <>
            <Analytics />
            <Inventory />
          </>
        );
      case 'pharmacist':
        return <Inventory />;
      case 'lab_staff':
        return <Typography>Lab Results Management (To be implemented)</Typography>;
      default:
        return <Typography>{t('loading')}</Typography>;
>>>>>>> eeea500e7c21953c51f8f841cd9d812eaa7d4522
    }
  };

  const menuItems = [
<<<<<<< HEAD
    { label: 'Dashboard', onClick: () => setView('dashboard') },
    { label: 'Profile', onClick: () => setView('profile') },
    ...(user?.role === 'admin' ? [{ label: 'User Management', onClick: () => setView('user_management') }] : []),
    { label: 'Logout', onClick: handleLogout },
  ];

  if (!user) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Digital Health Hub - {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard
          </Typography>
          <Typography variant="body1">Welcome, {user.username}</Typography>
        </Toolbar>
      </AppBar>

=======
    { label: 'Dashboard', onClick: () => setView('main') },
    { label: 'Profile', onClick: () => setView('profile') },
    ...(role === 'admin' ? [{ label: 'User Management', onClick: () => setView('user_management') }] : []),
    { label: t('logout'), onClick: handleLogout },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
>>>>>>> eeea500e7c21953c51f8f841cd9d812eaa7d4522
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
<<<<<<< HEAD
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            top: '64px' // Below app bar
          },
=======
          '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
>>>>>>> eeea500e7c21953c51f8f841cd9d812eaa7d4522
        }}
        variant="permanent"
        anchor="left"
      >
<<<<<<< HEAD
=======
        <Typography variant="h6" sx={{ p: 2 }}>{t('dashboard')}</Typography>
        <Divider />
>>>>>>> eeea500e7c21953c51f8f841cd9d812eaa7d4522
        <List>
          {menuItems.map((item) => (
            <ListItem button key={item.label} onClick={item.onClick}>
              <ListItemText primary={item.label} />
            </ListItem>
          ))}
        </List>
      </Drawer>
<<<<<<< HEAD

      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <Container maxWidth="lg">
          {renderContent()}
        </Container>
=======
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h4" gutterBottom>{t('dashboard')}</Typography>
        {renderContent()}
>>>>>>> eeea500e7c21953c51f8f841cd9d812eaa7d4522
      </Box>
    </Box>
  );
};

export default Dashboard;