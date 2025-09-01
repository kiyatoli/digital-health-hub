<<<<<<< HEAD
// Profile.js
import React, { useState, useEffect } from 'react';
import { 
  Button, TextField, Box, Typography, Card, Alert, 
  Grid, Avatar, FormControl, InputLabel, Select, MenuItem 
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

const Profile = ({ user, setUser }) => {
  const { t } = useTranslation();
  const [form, setForm] = useState({ 
    username: '', 
    email: '', 
    phone: '', 
    password: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    address: '',
    gender: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        password: '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        dateOfBirth: user.dateOfBirth || '',
        address: user.address || '',
        gender: user.gender || ''
      });
    }
  }, [user]);
=======
import React, { useState, useEffect } from 'react';
import { Button, TextField, Box, Typography, Card, Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

const Profile = () => {
  const { t } = useTranslation();
  const [form, setForm] = useState({ username: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/me');
        setForm({ username: res.data.username, email: res.data.email, phone: res.data.phone || '', password: '' });
      } catch (err) {
        setError(t('error'));
      }
    };
    fetchProfile();
  }, [t]);
>>>>>>> eeea500e7c21953c51f8f841cd9d812eaa7d4522

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

<<<<<<< HEAD
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      setError('');
      setSuccess('');
      
      // Remove password from update if empty
      const updateData = { ...form };
      if (!updateData.password) {
        delete updateData.password;
      }
      
      const response = await api.put('/users/profile', updateData);
      setSuccess('Profile updated successfully');
      
      // Update user context if needed
      if (setUser) {
        setUser({ ...user, ...response.data });
      }
      
      // Clear password field
      setForm({ ...form, password: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
=======
  const handleSubmit = async () => {
    try {
      setError('');
      setSuccess('');
      // Assume backend has a /auth/update endpoint (add it if needed)
      await api.put('/auth/update', form);
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(t('error'));
>>>>>>> eeea500e7c21953c51f8f841cd9d812eaa7d4522
    }
  };

  return (
<<<<<<< HEAD
    <Card sx={{ p: 4, borderRadius: 2, boxShadow: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Avatar sx={{ width: 64, height: 64, mr: 2, bgcolor: 'primary.main' }}>
          {form.username.charAt(0).toUpperCase()}
        </Avatar>
        <Box>
          <Typography variant="h5" gutterBottom>
            {form.firstName} {form.lastName}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {user?.role}
          </Typography>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="First Name"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Last Name"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Username"
              name="username"
              value={form.username}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Gender</InputLabel>
              <Select
                name="gender"
                value={form.gender}
                label="Gender"
                onChange={handleChange}
              >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Date of Birth"
              name="dateOfBirth"
              type="date"
              value={form.dateOfBirth}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Address"
              name="address"
              value={form.address}
              onChange={handleChange}
              fullWidth
              multiline
              rows={2}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="New Password (leave blank to keep current)"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <Button 
              type="submit" 
              variant="contained" 
              size="large"
              disabled={loading}
              sx={{ minWidth: 120 }}
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </Button>
          </Grid>
        </Grid>
      </form>
=======
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Edit Profile</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <TextField label={t('username')} name="username" value={form.username} onChange={handleChange} fullWidth margin="normal" />
      <TextField label={t('email')} name="email" value={form.email} onChange={handleChange} fullWidth margin="normal" />
      <TextField label={t('phone')} name="phone" value={form.phone} onChange={handleChange} fullWidth margin="normal" />
      <TextField label="New Password (optional)" name="password" type="password" value={form.password} onChange={handleChange} fullWidth margin="normal" />
      <Button variant="contained" onClick={handleSubmit} sx={{ mt: 2 }}>Update Profile</Button>
>>>>>>> eeea500e7c21953c51f8f841cd9d812eaa7d4522
    </Card>
  );
};

export default Profile;