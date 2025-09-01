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
  Person as PersonIcon,
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import api from '../services/api';

const PatientManagement = () => {
  const [patients, setPatients] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [newPatient, setNewPatient] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    dob: '',
    address: '',
    hospital_id: '',
    clinic_id: ''
  });
  const [editPatient, setEditPatient] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    hospital_id: '',
    clinic_id: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPatients();
    fetchHospitalsAndClinics();
  }, []);

  const fetchPatients = async (filterParams = {}) => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams({
        ...filterParams,
        type: 'patient'
      }).toString();
      const response = await api.get(`/users?${params}`);
      if (response.data && response.data.length === 0) {
        setError('No patients found matching your criteria.');
        setPatients([]);
      } else {
        setPatients(response.data);
        setError('');
      }
    } catch (err) {
      console.error('Failed to fetch patients:', err);
      setError(err.response?.data?.error || 'Failed to load patients');
      setPatients([]);
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
    fetchPatients(filterParams);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      hospital_id: '',
      clinic_id: ''
    });
    fetchPatients();
  };

  const handleAddPatient = async () => {
    try {
      setLoading(true);
      setError('');
      
      const patientData = { ...newPatient, type: 'patient' };
      
      // Remove empty values for hospital and clinic
      if (!patientData.hospital_id) patientData.hospital_id = null;
      if (!patientData.clinic_id) patientData.clinic_id = null;
      
      const response = await api.post('/users', patientData);
      setPatients([...patients, response.data]);
      setOpenAddDialog(false);
      setNewPatient({
        full_name: '',
        email: '',
        password: '',
        phone: '',
        dob: '',
        address: '',
        hospital_id: '',
        clinic_id: ''
      });
      setSuccess('Patient added successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to add patient:', err);
      setError(err.response?.data?.error || 'Failed to add patient');
    } finally {
      setLoading(false);
    }
  };

  const handleEditPatient = async () => {
    try {
      setLoading(true);
      setError('');
      
      const patientData = { ...editPatient };
      delete patientData.hospital_name;
      delete patientData.clinic_name;
      delete patientData.created_at;
      
      // Remove empty values for hospital and clinic
      if (!patientData.hospital_id) patientData.hospital_id = null;
      if (!patientData.clinic_id) patientData.clinic_id = null;
      
      const response = await api.put(`/users/${editPatient.id}`, patientData);
      setPatients(patients.map(patient => 
        patient.id === editPatient.id ? response.data : patient
      ));
      setOpenEditDialog(false);
      setEditPatient(null);
      setSuccess('Patient updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to update patient:', err);
      setError(err.response?.data?.error || 'Failed to update patient');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePatient = async (patientId) => {
    if (!window.confirm('Are you sure you want to delete this patient?')) {
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      await api.delete(`/users/${patientId}/users`);
      setPatients(patients.filter(patient => patient.id !== patientId));
      setSuccess('Patient deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to delete patient:', err);
      setError(err.response?.data?.error || 'Failed to delete patient');
    } finally {
      setLoading(false);
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
        Patient Management
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
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Search"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && handleApplyFilters()}
              size="small"
              placeholder="Name, email, phone"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
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
          <Grid item xs={12} sm={6} md={3}>
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
          {patients.length} {patients.length === 1 ? 'Patient' : 'Patients'} Found
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setOpenAddDialog(true)}
            startIcon={<PersonIcon />}
          >
            Add Patient
          </Button>
        </Box>
      </Box>

      {/* Patient Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ overflow: 'auto' }}>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>DOB</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Hospital</TableCell>
                <TableCell>Clinic</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {patients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography color="textSecondary" sx={{ py: 3 }}>
                      {isFilterActive ? 'No patients match your filters' : 'No patients found'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                patients.map(patient => (
                  <TableRow key={patient.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon />
                        {patient.full_name}
                      </Box>
                    </TableCell>
                    <TableCell>{patient.email}</TableCell>
                    <TableCell>{patient.phone || 'N/A'}</TableCell>
                    <TableCell>{patient.dob || 'N/A'}</TableCell>
                    <TableCell>{patient.address || 'N/A'}</TableCell>
                    <TableCell>{patient.hospital_name || 'None'}</TableCell>
                    <TableCell>{patient.clinic_name || 'None'}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setEditPatient(patient);
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
                            onClick={() => handleDeletePatient(patient.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Box>
      )}

      {/* Add Patient Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Patient</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Full Name"
            value={newPatient.full_name}
            onChange={(e) => setNewPatient({ ...newPatient, full_name: e.target.value })}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Email"
            type="email"
            value={newPatient.email}
            onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            value={newPatient.password}
            onChange={(e) => setNewPatient({ ...newPatient, password: e.target.value })}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Phone"
            value={newPatient.phone}
            onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
            margin="normal"
          />

          <TextField
            fullWidth
            label="Date of Birth"
            type="date"
            value={newPatient.dob}
            onChange={(e) => setNewPatient({ ...newPatient, dob: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            fullWidth
            label="Address"
            multiline
            rows={3}
            value={newPatient.address}
            onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
            margin="normal"
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Hospital</InputLabel>
            <Select
              value={newPatient.hospital_id}
              onChange={(e) => setNewPatient({ ...newPatient, hospital_id: e.target.value })}
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
              value={newPatient.clinic_id}
              onChange={(e) => setNewPatient({ ...newPatient, clinic_id: e.target.value })}
              label="Clinic"
            >
              <MenuItem value="">None</MenuItem>
              {getFilteredClinics(newPatient.hospital_id).map(clinic => (
                <MenuItem key={clinic.id} value={clinic.id}>
                  {clinic.name} {clinic.location && `(${clinic.location})`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleAddPatient} 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Add Patient'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Patient Dialog */}
      {editPatient && (
        <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Edit Patient</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Full Name"
              value={editPatient.full_name}
              onChange={(e) => setEditPatient({ ...editPatient, full_name: e.target.value })}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Email"
              type="email"
              value={editPatient.email}
              onChange={(e) => setEditPatient({ ...editPatient, email: e.target.value })}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Phone"
              value={editPatient.phone}
              onChange={(e) => setEditPatient({ ...editPatient, phone: e.target.value })}
              margin="normal"
            />

            <TextField
              fullWidth
              label="Date of Birth"
              type="date"
              value={editPatient.dob}
              onChange={(e) => setEditPatient({ ...editPatient, dob: e.target.value })}
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              fullWidth
              label="Address"
              multiline
              rows={3}
              value={editPatient.address}
              onChange={(e) => setEditPatient({ ...editPatient, address: e.target.value })}
              margin="normal"
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>Hospital</InputLabel>
              <Select
                value={editPatient.hospital_id || ''}
                onChange={(e) => setEditPatient({ ...editPatient, hospital_id: e.target.value })}
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
                value={editPatient.clinic_id || ''}
                onChange={(e) => setEditPatient({ ...editPatient, clinic_id: e.target.value })}
                label="Clinic"
              >
                <MenuItem value="">None</MenuItem>
                {getFilteredClinics(editPatient.hospital_id).map(clinic => (
                  <MenuItem key={clinic.id} value={clinic.id}>
                    {clinic.name} {clinic.location && `(${clinic.location})`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleEditPatient} 
              variant="contained"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Save Changes'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default PatientManagement;