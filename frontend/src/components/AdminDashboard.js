// components/AdminDashboard.js
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { 
  Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Typography, 
  Button, AppBar, Toolbar, Container, Card, CardContent, Grid,
  Avatar, Chip, IconButton, CircularProgress, Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  ExitToApp as LogoutIcon,
  Analytics as AnalyticsIcon,
  ChevronLeft as ChevronLeftIcon,
  Menu as MenuIcon,
  Assignment as AppointmentIcon,
  AttachMoney as RevenueIcon,
  Group as UsersIcon,
  Favorite as GenderIcon,
  Cake as AgeIcon
} from '@mui/icons-material';
import UserManagement from './UserManagement';
import Profile from './Profile';

const drawerWidth = 280;
// components/AdminDashboard.js - Updated with hospital/clinic info
// Add this to your dashboard content:

// components/AdminDashboard.js
const renderDashboardContent = () => {
  const currentUser = {
    hospital_id: parseInt(localStorage.getItem('hospital_id') || '0'),
    clinic_id: parseInt(localStorage.getItem('clinic_id') || '0'),
    is_super_admin: localStorage.getItem('is_super_admin') === 'true',
    role: localStorage.getItem('role') || 'admin'
  };

  const getHospitalName = (id) => {
    const hospitals = [
      { id: 0, name: 'All Hospitals (Super Admin)' },
      { id: 1, name: 'Robe General Hospital' },
      { id: 2, name: 'Bale Hospital' }
    ];
    const hospital = hospitals.find(h => h.id === id);
    return hospital ? hospital.name : `Unknown Hospital (ID: ${id})`;
  };

  const getClinicName = (id) => {
    const clinics = [
      { id: 1, name: 'Clinic A' },
      { id: 2, name: 'Clinic B' },
      { id: 3, name: 'Clinic C' },
      { id: 4, name: 'Clinic D' },
      { id: 5, name: 'Clinic E' },
      { id: 6, name: 'Clinic F' }
    ];
    const clinic = clinics.find(c => c.id === id);
    return clinic ? clinic.name : `Unknown Clinic (ID: ${id})`;
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom color="primary" sx={{ mb: 3, fontWeight: 'bold' }}>
        <DashboardIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
        Admin Dashboard
      </Typography>
      <Typography variant="h6" color="textPrimary" sx={{ mb: 2 }}>
        Role: {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 3 }}>
        {currentUser.is_super_admin
          ? 'Super Admin: Access to all hospitals and clinics'
          : currentUser.hospital_id > 0
            ? `Assigned Hospital: ${getHospitalName(currentUser.hospital_id)}`
            : currentUser.clinic_id > 0
              ? `Assigned Clinic: ${getClinicName(currentUser.clinic_id)}`
              : 'No hospital or clinic assigned'}
      </Typography>
      
      {/* Rest of your dashboard content */}
    </Box>
  );
};
const AdminDashboard = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [view, setView] = useState('dashboard');
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    appointments: { total: 0, confirmed: 0, pending: 0 },
    revenue: { total: 0, paid: 0, unpaid: 0 },
    users: 0,
    patients: 0,
    genderData: { male: 0, female: 0, other: 0 },
    ageData: { age_0_18: 0, age_19_35: 0, age_36_50: 0, age_51_plus: 0 }
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        const username = localStorage.getItem('username');
        const userId = localStorage.getItem('userId');
        
        if (!token || !role) {
          navigate('/login');
          return;
        }

        // SIMPLIFIED: Just set the user from localStorage without token verification
        // The token verification should be handled by API calls, not on component mount
        setUser({
          id: userId,
          role: role,
          username: username,
        });
        
        // Fetch dashboard stats
        await fetchDashboardStats();
        
      } catch (err) {
        console.error('Failed to fetch user:', err);
        setError('Authentication failed. Please login again.');
        // Clear invalid credentials
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        setTimeout(() => navigate('/login'), 2000);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  const fetchDashboardStats = async () => {
    try {
      const statsResponse = await api.get('/admin/analytics');
      setStats(statsResponse.data);
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
      // If API call fails due to authentication, redirect to login
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        navigate('/login');
        return;
      }
      // Set mock data for demonstration
      setStats({
        appointments: { total: 1245, confirmed: 1000, pending: 245 },
        revenue: { total: 125640, paid: 100000, unpaid: 25640 },
        demographics: [
          { role: 'admin', count: 5 },
          { role: 'doctor', count: 25 },
          { role: 'pharmacist', count: 10 },
          { role: 'lab_staff', count: 8 },
          { role: 'patient', count: 892 }
        ],
        genderData: { male: 512, female: 365, other: 15 },
        ageData: { age_0_18: 145, age_19_35: 367, age_36_50: 258, age_51_plus: 122 }
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const StatCard = ({ title, value, icon, color = 'primary', subtitle }) => (
    <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="textSecondary" gutterBottom variant="overline">
              {title}
            </Typography>
            <Typography variant="h4" component="div" color={color}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{ color: `${color}.main`, fontSize: 40 }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const renderDashboardContent = () => {
    const totalUsers = stats.demographics?.reduce((sum, item) => sum + parseInt(item.count), 0) || 0;
    const totalPatients = stats.demographics?.find(d => d.role === 'patient')?.count || 0;

    return (
      <Box>
        <Typography variant="h4" gutterBottom color="primary" sx={{ mb: 3, fontWeight: 'bold' }}>
          <DashboardIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
          Admin Dashboard
        </Typography>
        
        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Total Appointments" 
              value={stats.appointments?.total || 0} 
              icon={<AppointmentIcon fontSize="inherit" />} 
              color="primary"
              subtitle={`${stats.appointments?.confirmed || 0} confirmed, ${stats.appointments?.pending || 0} pending`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Revenue ($)" 
              value={(stats.revenue?.total || 0).toLocaleString()} 
              icon={<RevenueIcon fontSize="inherit" />} 
              color="success"
              subtitle={`${stats.revenue?.paid || 0} paid, ${stats.revenue?.unpaid || 0} unpaid`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Users" 
              value={totalUsers} 
              icon={<UsersIcon fontSize="inherit" />} 
              color="info"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Patients" 
              value={totalPatients} 
              icon={<PeopleIcon fontSize="inherit" />} 
              color="warning"
            />
          </Grid>
        </Grid>
        
        {/* Charts and Additional Stats */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
              <Typography variant="h6" gutterBottom color="primary">
                <GenderIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                Gender Distribution
              </Typography>
              <Box sx={{ mt: 2 }}>
                {Object.entries(stats.genderData || {}).map(([key, value]) => (
                  <Box key={key} sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" color="textSecondary">
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {value} ({(value / totalUsers * 100).toFixed(1)}%)
                      </Typography>
                    </Box>
                    <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1 }}>
                      <Box 
                        sx={{ 
                          height: 8, 
                          bgcolor: key === 'male' ? 'primary.main' : key === 'female' ? 'secondary.main' : 'warning.main',
                          width: `${(value / totalUsers * 100)}%`,
                          borderRadius: 1
                        }} 
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
              <Typography variant="h6" gutterBottom color="primary">
                <AgeIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                Age Distribution
              </Typography>
              <Box sx={{ mt: 2 }}>
                {stats.ageData && Object.entries(stats.ageData).map(([key, value]) => {
                  const label = key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
                  return (
                    <Box key={key} sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" color="textSecondary">
                          {label}
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {value} ({(value / totalPatients * 100).toFixed(1)}%)
                        </Typography>
                      </Box>
                      <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1 }}>
                        <Box 
                          sx={{ 
                            height: 8, 
                            bgcolor: 'info.main',
                            width: `${(value / totalPatients * 100)}%`,
                            borderRadius: 1
                          }} 
                        />
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderContent = () => {
    switch (view) {
      case 'profile':
        return <Profile user={user} setUser={setUser} />;
      case 'user_management':
        return <UserManagement />;
      case 'dashboard':
      default:
        return renderDashboardContent();
    }
  };

  const menuItems = [
    { label: 'Dashboard', icon: <DashboardIcon />, onClick: () => setView('dashboard') },
    { label: 'User Management', icon: <PeopleIcon />, onClick: () => setView('user_management') },
    { label: 'Profile', icon: <PersonIcon />, onClick: () => setView('profile') },
    { label: 'Logout', icon: <LogoutIcon />, onClick: handleLogout },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading Admin Dashboard...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <Alert severity="error" sx={{ mb: 2, width: '50%' }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/login')}>
          Go to Login
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'white',
          color: 'primary.main',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            onClick={toggleDrawer}
            edge="start"
            sx={{ mr: 2 }}
          >
            {drawerOpen ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Digital Health Hub - Admin Panel
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
              {user?.username?.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="body1" sx={{ display: { xs: 'none', sm: 'block' } }}>
              {user?.username}
            </Typography>
            <Chip 
              label="Admin" 
              size="small" 
              color="primary" 
              variant="filled"
              sx={{ fontWeight: 'bold' }}
            />
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        sx={{
          width: drawerOpen ? drawerWidth : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerOpen ? drawerWidth : 0,
            boxSizing: 'border-box',
            top: '64px', // Below app bar
            backgroundColor: '#2c3e50',
            color: 'white',
            transition: 'width 0.3s ease',
            border: 'none',
          },
        }}
        variant="permanent"
        anchor="left"
        open={drawerOpen}
      >
        <List sx={{ mt: 2, p: 1 }}>
          {menuItems.map((item) => (
            <ListItem 
              button 
              key={item.label} 
              onClick={item.onClick}
              selected={view === item.label.toLowerCase().replace(' ', '_')}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                },
                borderRadius: 2,
                mb: 1
              }}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.label} 
                primaryTypographyProps={{ fontWeight: 'medium' }}
              />
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          mt: 8,
          width: drawerOpen ? `calc(100% - ${drawerWidth}px)` : '100%',
          transition: 'width 0.3s ease, margin 0.3s ease',
        }}
      >
        <Container maxWidth="xl" sx={{ py: 2 }}>
          {renderContent()}
        </Container>
      </Box>
    </Box>
  );
};

export default AdminDashboard;