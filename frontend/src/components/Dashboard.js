import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import AppointmentForm from './AppointmentForm';
import EMRView from './EMRView';
import Telemedicine from './Telemedicine';
import Inventory from './Inventory';
import Analytics from './Analytics';
import Profile from './Profile';
import UserManagement from './UserManagement';
import { 
  Box, Drawer, List, ListItem, ListItemText, Typography, Button, Divider,
  AppBar, Toolbar, Container, Card, CardContent, Grid
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 240;

const Dashboard = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [view, setView] = useState('dashboard');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
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
        navigate('/login');
      }
    };
    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
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
    }
  };

  const menuItems = [
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

      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            top: '64px' // Below app bar
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <List>
          {menuItems.map((item) => (
            <ListItem button key={item.label} onClick={item.onClick}>
              <ListItemText primary={item.label} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <Container maxWidth="lg">
          {renderContent()}
        </Container>
      </Box>
    </Box>
  );
};

export default Dashboard;