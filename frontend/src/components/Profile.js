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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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
    }
  };

  return (
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
    </Card>
  );
};

export default Profile;