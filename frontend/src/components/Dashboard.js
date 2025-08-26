import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import AppointmentForm from './AppointmentForm';
import EMRView from './EMRView';
import Telemedicine from './Telemedicine';
import Inventory from './Inventory';
import Analytics from './Analytics';
import Profile from './Profile';  // New profile component
import UserManagement from './UserManagement';  // New for admin
import { Box, Drawer, List, ListItem, ListItemText, Typography, Button, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 240;

const Dashboard = () => {
  const { t } = useTranslation();
  const [role, setRole] = useState('');
  const [view, setView] = useState('main');  // To switch views (main, profile, user_management)
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/auth/me');
        setRole(res.data.role);
      } catch (err) {
        console.error(err);
        navigate('/login');
      }
    };
    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
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
    }
  };

  const menuItems = [
    { label: 'Dashboard', onClick: () => setView('main') },
    { label: 'Profile', onClick: () => setView('profile') },
    ...(role === 'admin' ? [{ label: 'User Management', onClick: () => setView('user_management') }] : []),
    { label: t('logout'), onClick: handleLogout },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
        }}
        variant="permanent"
        anchor="left"
      >
        <Typography variant="h6" sx={{ p: 2 }}>{t('dashboard')}</Typography>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItem button key={item.label} onClick={item.onClick}>
              <ListItemText primary={item.label} />
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h4" gutterBottom>{t('dashboard')}</Typography>
        {renderContent()}
      </Box>
    </Box>
  );
};

export default Dashboard;