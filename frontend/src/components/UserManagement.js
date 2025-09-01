<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  Grid,
  Paper
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Person as PersonIcon,
  MedicalServices as MedicalServicesIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import api from '../services/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: 'admin',
    phone: '',
    full_name: '',
    sex: '',
    age: '',
    type: 'user',
    hospital_id: '',
    clinic_id: '',
    is_active: true,
    is_locked: false,
    mfa_enabled: false,
    is_super_admin: false
  });
  const [editUser, setEditUser] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    hospital_id: '',
    clinic_id: '',
    type: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchHospitalsAndClinics();
  }, []);

  const fetchUsers = async (filterParams = {}) => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams(filterParams).toString();
      const response = await api.get(`/users?${params}`);
      if (response.data && response.data.length === 0) {
        setError('No users found matching your criteria.');
        setUsers([]);
      } else {
        setUsers(response.data);
        setError('');
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError(err.response?.data?.error || 'Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchHospitalsAndClinics = async () => {
    try {
      const response = await api.get('/users/hospitals-clinics');
      setHospitals(response.data.hospitals || []);
      setClinics(response.data.clinics || []);
    } catch (err) {
      console.error('Failed to fetch hospitals and clinics:', err);
      setError('Failed to load hospitals and clinics');
    }
  };

  const handleApplyFilters = () => {
    const filterParams = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value) filterParams[key] = value;
    });
    fetchUsers(filterParams);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      role: '',
      hospital_id: '',
      clinic_id: '',
      type: ''
    });
    fetchUsers();
  };

  const handleAddUser = async () => {
    try {
      setLoading(true);
      setError('');
      
      const userData = { ...newUser };
      
      if (userData.type === 'patient') {
        if (userData.age) {
          userData.age = new Date(userData.age).toISOString().split('T')[0];
        }
      }
      
      const response = await api.post('/users', userData);
      setUsers([...users, response.data]);
      setOpenAddDialog(false);
      setNewUser({
        username: '',
        email: '',
        password: '',
        role: 'admin',
        phone: '',
        full_name: '',
        sex: '',
        age: '',
        type: 'user',
        hospital_id: '',
        clinic_id: '',
        is_active: true,
        is_locked: false,
        mfa_enabled: false,
        is_super_admin: false
      });
      setSuccess('User added successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to add user:', err);
      setError(err.response?.data?.error || 'Failed to add user');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async () => {
    try {
      setLoading(true);
      setError('');
      
      const userData = { ...editUser };
      delete userData.hospital_name;
      delete userData.clinic_name;
      delete userData.created_at;
      
      if (userData.type === 'patient' && userData.date_of_birth) {
        userData.age = new Date(userData.date_of_birth).toISOString().split('T')[0];
      }
      
      const response = await api.put(`/users/${editUser.id}`, userData);
      setUsers(users.map(user => 
        user.id === editUser.id && user.type === editUser.type 
          ? response.data 
          : user
      ));
      setOpenEditDialog(false);
      setEditUser(null);
      setSuccess('User updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to update user:', err);
      setError(err.response?.data?.error || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, type) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      await api.delete(`/users/${userId}/${type}s`);
      setUsers(users.filter(user => !(user.id === userId && user.type === type)));
      setSuccess('User deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to delete user:', err);
      setError(err.response?.data?.error || 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, type, statusType, currentValue) => {
    try {
      setLoading(true);
      setError('');
      const response = await api.patch(`/users/${userId}/status`, {
        type,
        statusType,
        value: !currentValue
      });
      setUsers(users.map(user => 
        user.id === userId && user.type === type 
          ? { ...user, [statusType]: !currentValue } 
          : user
      ));
      setSuccess(response.data.message || 'Status updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to update status:', err);
      setError(err.response?.data?.error || 'Failed to update user status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusChips = (user) => {
    if (user.type === 'patient') {
      return <Chip label="Patient" color="info" size="small" />;
    }
    
    return (
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
        <Chip
          label={user.is_active ? 'Active' : 'Inactive'}
          color={user.is_active ? 'success' : 'default'}
          size="small"
        />
        <Chip
          label={user.is_locked ? 'Locked' : 'Unlocked'}
          color={user.is_locked ? 'error' : 'default'}
          size="small"
        />
        {user.is_super_admin && (
          <Chip label="Super Admin" color="warning" size="small" />
        )}
      </Box>
    );
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'doctor':
        return <MedicalServicesIcon color="primary" />;
      case 'patient':
        return <PersonIcon color="info" />;
      case 'nurse':
        return <MedicalServicesIcon color="secondary" />;
      default:
        return <PersonIcon />;
    }
  };

  const getFilteredClinics = (hospitalId) => {
    if (!hospitalId) return clinics;
    return clinics.filter(clinic => clinic.hospital_id == hospitalId);
  };

  const isFilterActive = Object.values(filters).some(value => value !== '');

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        User Management
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}
      
      {/* Filter and Search Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Search"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && handleApplyFilters()}
              size="small"
              placeholder="Name, email, username"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Role</InputLabel>
              <Select
                value={filters.role}
                onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                label="Role"
              >
                <MenuItem value="">All Roles</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="doctor">Doctor</MenuItem>
                <MenuItem value="nurse">Nurse</MenuItem>
                <MenuItem value="staff">Staff</MenuItem>
                <MenuItem value="patient">Patient</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Hospital</InputLabel>
              <Select
                value={filters.hospital_id}
                onChange={(e) => setFilters({ ...filters, hospital_id: e.target.value })}
                label="Hospital"
              >
                <MenuItem value="">All Hospitals</MenuItem>
                {hospitals.map(hospital => (
                  <MenuItem key={hospital.id} value={hospital.id}>
                    {hospital.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Clinic</InputLabel>
              <Select
                value={filters.clinic_id}
                onChange={(e) => setFilters({ ...filters, clinic_id: e.target.value })}
                label="Clinic"
              >
                <MenuItem value="">All Clinics</MenuItem>
                {getFilteredClinics(filters.hospital_id).map(clinic => (
                  <MenuItem key={clinic.id} value={clinic.id}>
                    {clinic.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                label="Type"
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="user">Staff</MenuItem>
                <MenuItem value="patient">Patient</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={1}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                onClick={handleApplyFilters}
                startIcon={<SearchIcon />}
                size="small"
              >
                Apply
              </Button>
              {isFilterActive && (
                <Button
                  variant="outlined"
                  onClick={handleClearFilters}
                  size="small"
                  startIcon={<ClearIcon />}
                >
                  Clear
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Action Buttons */}
      <Box sx={{ mb: 2, display: 'flex', gap: 1, justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          {users.length} {users.length === 1 ? 'User' : 'Users'} Found
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setOpenAddDialog(true)}
            startIcon={<PersonIcon />}
          >
            Add User
          </Button>
        </Box>
      </Box>

      {/* User Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ overflow: 'auto' }}>
          <Table sx={{ minWidth: 1000 }}>
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Hospital</TableCell>
                <TableCell>Clinic</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Typography color="textSecondary" sx={{ py: 3 }}>
                      {isFilterActive ? 'No users match your filters' : 'No users found'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map(user => (
                  <TableRow key={`${user.type}-${user.id}`} hover>
                    <TableCell>
                      <Chip
                        label={user.type}
                        color={user.type === 'user' ? 'primary' : 'info'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getRoleIcon(user.role)}
                        {user.full_name}
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip label={user.role} variant="outlined" size="small" />
                    </TableCell>
                    <TableCell>{user.phone || 'N/A'}</TableCell>
                    <TableCell>{user.hospital_name || 'None'}</TableCell>
                    <TableCell>{user.clinic_name || 'None'}</TableCell>
                    <TableCell>{getStatusChips(user)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setEditUser(user);
                              setOpenEditDialog(true);
                            }}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteUser(user.id, user.type)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>

                        {user.type === 'user' && (
                          <>
                            <Tooltip title={user.is_active ? 'Deactivate' : 'Activate'}>
                              <IconButton
                                size="small"
                                onClick={() => handleToggleStatus(user.id, user.type, 'is_active', user.is_active)}
                                color={user.is_active ? 'default' : 'success'}
                              >
                                {user.is_active ? '✓' : '✗'}
                              </IconButton>
                            </Tooltip>

                            <Tooltip title={user.is_locked ? 'Unlock' : 'Lock'}>
                              <IconButton
                                size="small"
                                onClick={() => handleToggleStatus(user.id, user.type, 'is_locked', user.is_locked)}
                                color={user.is_locked ? 'success' : 'error'}
                              >
                                {user.is_locked ? <LockOpenIcon /> : <LockIcon />}
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Box>
      )}

      {/* Add User Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>User Type</InputLabel>
            <Select
              value={newUser.type}
              onChange={(e) => setNewUser({ ...newUser, type: e.target.value })}
              label="User Type"
            >
              <MenuItem value="user">Staff User</MenuItem>
              <MenuItem value="patient">Patient</MenuItem>
            </Select>
          </FormControl>

          {newUser.type === 'user' && (
            <>
              <TextField
                fullWidth
                label="Username"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                margin="normal"
                required
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Role</InputLabel>
                <Select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  label="Role"
                >
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="doctor">Doctor</MenuItem>
                  <MenuItem value="nurse">Nurse</MenuItem>
                  <MenuItem value="staff">Staff</MenuItem>
                </Select>
              </FormControl>
            </>
          )}

          <TextField
            fullWidth
            label="Full Name"
            value={newUser.full_name}
            onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
            margin="normal"
            required
            placeholder="First Name Last Name"
          />

          <TextField
            fullWidth
            label="Email"
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Phone"
            value={newUser.phone}
            onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
            margin="normal"
          />

          {newUser.type === 'user' ? (
            <>
              <FormControl fullWidth margin="normal">
                <InputLabel>Sex</InputLabel>
                <Select
                  value={newUser.sex}
                  onChange={(e) => setNewUser({ ...newUser, sex: e.target.value })}
                  label="Sex"
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Age"
                type="number"
                value={newUser.age}
                onChange={(e) => setNewUser({ ...newUser, age: e.target.value })}
                margin="normal"
                inputProps={{ min: 0, max: 120 }}
              />
            </>
          ) : (
            <TextField
              fullWidth
              label="Date of Birth"
              type="date"
              value={newUser.age}
              onChange={(e) => setNewUser({ ...newUser, age: e.target.value })}
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
          )}

          <FormControl fullWidth margin="normal">
            <InputLabel>Hospital</InputLabel>
            <Select
              value={newUser.hospital_id}
              onChange={(e) => setNewUser({ ...newUser, hospital_id: e.target.value })}
              label="Hospital"
            >
              <MenuItem value="">None</MenuItem>
              {hospitals.map(hospital => (
                <MenuItem key={hospital.id} value={hospital.id}>
                  {hospital.name} {hospital.location && `(${hospital.location})`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Clinic</InputLabel>
            <Select
              value={newUser.clinic_id}
              onChange={(e) => setNewUser({ ...newUser, clinic_id: e.target.value })}
              label="Clinic"
            >
              <MenuItem value="">None</MenuItem>
              {getFilteredClinics(newUser.hospital_id).map(clinic => (
                <MenuItem key={clinic.id} value={clinic.id}>
                  {clinic.name} {clinic.location && `(${clinic.location})`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {newUser.type === 'user' && (
            <>
              <FormControl fullWidth margin="normal">
                <InputLabel>Active Status</InputLabel>
                <Select
                  value={newUser.is_active}
                  onChange={(e) => setNewUser({ ...newUser, is_active: e.target.value })}
                  label="Active Status"
                >
                  <MenuItem value={true}>Active</MenuItem>
                  <MenuItem value={false}>Inactive</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth margin="normal">
                <InputLabel>Lock Status</InputLabel>
                <Select
                  value={newUser.is_locked}
                  onChange={(e) => setNewUser({ ...newUser, is_locked: e.target.value })}
                  label="Lock Status"
                >
                  <MenuItem value={false}>Unlocked</MenuItem>
                  <MenuItem value={true}>Locked</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth margin="normal">
                <InputLabel>MFA Enabled</InputLabel>
                <Select
                  value={newUser.mfa_enabled}
                  onChange={(e) => setNewUser({ ...newUser, mfa_enabled: e.target.value })}
                  label="MFA Enabled"
                >
                  <MenuItem value={false}>Disabled</MenuItem>
                  <MenuItem value={true}>Enabled</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth margin="normal">
                <InputLabel>Super Admin</InputLabel>
                <Select
                  value={newUser.is_super_admin}
                  onChange={(e) => setNewUser({ ...newUser, is_super_admin: e.target.value })}
                  label="Super Admin"
                >
                  <MenuItem value={false}>No</MenuItem>
                  <MenuItem value={true}>Yes</MenuItem>
                </Select>
              </FormControl>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleAddUser} 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Add User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      {editUser && (
        <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Edit User</DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>User Type</InputLabel>
              <Select
                value={editUser.type}
                label="User Type"
                disabled
              >
                <MenuItem value="user">Staff User</MenuItem>
                <MenuItem value="patient">Patient</MenuItem>
              </Select>
            </FormControl>

            {editUser.type === 'user' && (
              <>
                <TextField
                  fullWidth
                  label="Username"
                  value={editUser.username}
                  onChange={(e) => setEditUser({ ...editUser, username: e.target.value })}
                  margin="normal"
                  required
                />
                <FormControl fullWidth margin="normal">
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={editUser.role}
                    onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                    label="Role"
                  >
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="doctor">Doctor</MenuItem>
                    <MenuItem value="nurse">Nurse</MenuItem>
                    <MenuItem value="staff">Staff</MenuItem>
                  </Select>
                </FormControl>
              </>
            )}

            <TextField
              fullWidth
              label="Full Name"
              value={editUser.full_name}
              onChange={(e) => setEditUser({ ...editUser, full_name: e.target.value })}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Email"
              type="email"
              value={editUser.email}
              onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Phone"
              value={editUser.phone}
              onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
              margin="normal"
            />

            {editUser.type === 'user' ? (
              <>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Sex</InputLabel>
                  <Select
                    value={editUser.sex}
                    onChange={(e) => setEditUser({ ...editUser, sex: e.target.value })}
                    label="Sex"
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Age"
                  type="number"
                  value={editUser.age}
                  onChange={(e) => setEditUser({ ...editUser, age: e.target.value })}
                  margin="normal"
                  inputProps={{ min: 0, max: 120 }}
                />
              </>
            ) : (
              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                value={editUser.date_of_birth || ''}
                onChange={(e) => setEditUser({ ...editUser, date_of_birth: e.target.value })}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            )}

            <FormControl fullWidth margin="normal">
              <InputLabel>Hospital</InputLabel>
              <Select
                value={editUser.hospital_id || ''}
                onChange={(e) => setEditUser({ ...editUser, hospital_id: e.target.value })}
                label="Hospital"
              >
                <MenuItem value="">None</MenuItem>
                {hospitals.map(hospital => (
                  <MenuItem key={hospital.id} value={hospital.id}>
                    {hospital.name} {hospital.location && `(${hospital.location})`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel>Clinic</InputLabel>
              <Select
                value={editUser.clinic_id || ''}
                onChange={(e) => setEditUser({ ...editUser, clinic_id: e.target.value })}
                label="Clinic"
              >
                <MenuItem value="">None</MenuItem>
                {getFilteredClinics(editUser.hospital_id).map(clinic => (
                  <MenuItem key={clinic.id} value={clinic.id}>
                    {clinic.name} {clinic.location && `(${clinic.location})`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {editUser.type === 'user' && (
              <>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Active Status</InputLabel>
                  <Select
                    value={editUser.is_active}
                    onChange={(e) => setEditUser({ ...editUser, is_active: e.target.value })}
                    label="Active Status"
                  >
                    <MenuItem value={true}>Active</MenuItem>
                    <MenuItem value={false}>Inactive</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth margin="normal">
                  <InputLabel>Lock Status</InputLabel>
                  <Select
                    value={editUser.is_locked}
                    onChange={(e) => setEditUser({ ...editUser, is_locked: e.target.value })}
                    label="Lock Status"
                  >
                    <MenuItem value={false}>Unlocked</MenuItem>
                    <MenuItem value={true}>Locked</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth margin="normal">
                  <InputLabel>MFA Enabled</InputLabel>
                  <Select
                    value={editUser.mfa_enabled}
                    onChange={(e) => setEditUser({ ...editUser, mfa_enabled: e.target.value })}
                    label="MFA Enabled"
                  >
                    <MenuItem value={false}>Disabled</MenuItem>
                    <MenuItem value={true}>Enabled</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth margin="normal">
                  <InputLabel>Super Admin</InputLabel>
                  <Select
                    value={editUser.is_super_admin}
                    onChange={(e) => setEditUser({ ...editUser, is_super_admin: e.target.value })}
                    label="Super Admin"
                  >
                    <MenuItem value={false}>No</MenuItem>
                    <MenuItem value={true}>Yes</MenuItem>
                  </Select>
                </FormControl>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleEditUser} 
              variant="contained"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Save Changes'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
=======
import React, { useState } from 'react';
import { Button, TextField, Box, Typography, Card, Select, MenuItem, FormControl, InputLabel, Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

const UserManagement = () => {
  const { t } = useTranslation();
  const [form, setForm] = useState({ username: '', email: '', password: '', role: '', phone: '', hospital_id: '', clinic_id: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async () => {
    try {
      setError('');
      setSuccess('');
      const res = await api.post('/auth/register', form);  // Reuse register endpoint, but admin-only
      // Backend should send email with credentials (update backend if needed)
      setSuccess(`User created: ${res.data.userId}. Credentials sent to ${form.email}`);
    } catch (err) {
      setError(t('error'));
    }
  };

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Create New User</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <TextField label={t('username')} name="username" value={form.username} onChange={handleChange} fullWidth margin="normal" />
      <TextField label={t('email')} name="email" value={form.email} onChange={handleChange} fullWidth margin="normal" />
      <TextField label={t('password')} name="password" type="password" value={form.password} onChange={handleChange} fullWidth margin="normal" />
      <TextField label={t('phone')} name="phone" value={form.phone} onChange={handleChange} fullWidth margin="normal" />
      <FormControl fullWidth margin="normal">
        <InputLabel>Role</InputLabel>
        <Select name="role" value={form.role} onChange={handleChange}>
          <MenuItem value="doctor">Doctor</MenuItem>
          <MenuItem value="admin">Admin</MenuItem>
          <MenuItem value="pharmacist">Pharmacist</MenuItem>
          <MenuItem value="lab_staff">Lab Staff</MenuItem>
        </Select>
      </FormControl>
      <TextField label="Hospital ID" name="hospital_id" value={form.hospital_id} onChange={handleChange} fullWidth margin="normal" />
      <TextField label="Clinic ID" name="clinic_id" value={form.clinic_id} onChange={handleChange} fullWidth margin="normal" />
      <Button variant="contained" onClick={handleCreate} sx={{ mt: 2 }}>Create User & Send Credentials</Button>
      <Typography variant="body2" sx={{ mt: 2 }}>Note: Patients register themselves. Credentials will be emailed.</Typography>
    </Card>
>>>>>>> eeea500e7c21953c51f8f841cd9d812eaa7d4522
  );
};

export default UserManagement;