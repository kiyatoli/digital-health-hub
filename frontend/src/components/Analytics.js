<<<<<<< HEAD
// Analytics.js (React Component)
import React, { useEffect, useState } from 'react';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement
} from 'chart.js';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement
);

const Analytics = () => {
  const { t } = useTranslation();
  const [analytics, setAnalytics] = useState({ 
    appointments: {}, 
    revenue: {}, 
    demographics: [], 
    genderData: {}, 
    ageData: {} 
  });
  const [facilities, setFacilities] = useState({ hospitals: [], clinics: [] });
  const [selectedFacility, setSelectedFacility] = useState({ type: '', id: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, facilitiesRes] = await Promise.all([
          api.get('/analytics'),
          api.get('/users/hospitals-clinics')
        ]);
        setAnalytics(analyticsRes.data);
        setFacilities(facilitiesRes.data);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchFacilityAnalytics = async () => {
      if (selectedFacility.type && selectedFacility.id) {
        try {
          const res = await api.get(`/analytics/facility/${selectedFacility.type}/${selectedFacility.id}`);
          setAnalytics(res.data);
        } catch (err) {
          console.error('Failed to fetch facility analytics:', err);
        }
      }
    };
    fetchFacilityAnalytics();
  }, [selectedFacility]);

  const userDemographicsData = {
=======
import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { Typography, Box } from '@mui/material';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Analytics = () => {
  const { t } = useTranslation();
  const [analytics, setAnalytics] = useState({ appointments: 0, revenue: 0, demographics: [] });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/analytics');
        setAnalytics(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAnalytics();
  }, []);

  const data = {
>>>>>>> eeea500e7c21953c51f8f841cd9d812eaa7d4522
    labels: analytics.demographics.map(d => d.role),
    datasets: [{
      label: 'User Count',
      data: analytics.demographics.map(d => d.count),
<<<<<<< HEAD
      backgroundColor: [
        'rgba(255, 99, 132, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(75, 192, 192, 0.6)',
        'rgba(153, 102, 255, 0.6)'
      ],
      borderWidth: 1
    }]
  };

  const genderData = {
    labels: ['Male', 'Female', 'Other', 'Unknown'],
    datasets: [{
      data: [
        analytics.genderData.male || 0,
        analytics.genderData.female || 0,
        analytics.genderData.other || 0,
        analytics.genderData.unknown || 0
      ],
      backgroundColor: [
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 99, 132, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(201, 203, 207, 0.6)'
      ],
      borderWidth: 1
    }]
  };

  const ageData = {
    labels: ['0-18', '19-35', '36-50', '51+'],
    datasets: [{
      label: 'Patients by Age',
      data: [
        analytics.ageData.age_0_18 || 0,
        analytics.ageData.age_19_35 || 0,
        analytics.ageData.age_36_50 || 0,
        analytics.ageData.age_51_plus || 0
      ],
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
=======
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
>>>>>>> eeea500e7c21953c51f8f841cd9d812eaa7d4522
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1
    }]
  };

<<<<<<< HEAD
  const appointmentStatusData = {
    labels: ['Confirmed', 'Pending', 'Cancelled'],
    datasets: [{
      label: 'Appointments',
      data: [
        analytics.appointments.confirmed_appointments || 0,
        analytics.appointments.pending_appointments || 0,
        analytics.appointments.cancelled_appointments || 0
      ],
      backgroundColor: [
        'rgba(75, 192, 192, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(255, 99, 132, 0.6)'
      ],
      borderWidth: 1
    }]
  };

  return (
    <Box sx={{ mt: 4, p: 2 }}>
      <Typography variant="h4" gutterBottom>
        {t('analytics')}
      </Typography>

      {/* Facility Selector */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Filter by Facility</InputLabel>
        <Select
          value={selectedFacility.type ? `${selectedFacility.type}-${selectedFacility.id}` : ''}
          onChange={(e) => {
            if (e.target.value === '') {
              setSelectedFacility({ type: '', id: '' });
            } else {
              const [type, id] = e.target.value.split('-');
              setSelectedFacility({ type, id });
            }
          }}
          label="Filter by Facility"
        >
          <MenuItem value="">All Facilities</MenuItem>
          <Typography variant="subtitle1" sx={{ px: 2, py: 1 }}>Hospitals</Typography>
          {facilities.hospitals.map(hospital => (
            <MenuItem key={hospital.id} value={`hospital-${hospital.id}`}>
              {hospital.name}
            </MenuItem>
          ))}
          <Typography variant="subtitle1" sx={{ px: 2, py: 1 }}>Clinics</Typography>
          {facilities.clinics.map(clinic => (
            <MenuItem key={clinic.id} value={`clinic-${clinic.id}`}>
              {clinic.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Appointments
              </Typography>
              <Typography variant="h4">
                {analytics.appointments.total_appointments || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Revenue
              </Typography>
              <Typography variant="h4">
                ${analytics.revenue.total_revenue || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Paid Bills
              </Typography>
              <Typography variant="h4">
                {analytics.revenue.paid_bills || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Users
              </Typography>
              <Typography variant="h4">
                {analytics.demographics.reduce((sum, d) => sum + d.count, 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Grid */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              User Demographics
            </Typography>
            <Doughnut data={userDemographicsData} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Gender Distribution
            </Typography>
            <Pie data={genderData} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Patient Age Groups
            </Typography>
            <Bar data={ageData} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Appointment Status
            </Typography>
            <Doughnut data={appointmentStatusData} />
          </Paper>
        </Grid>
      </Grid>
=======
  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6">{t('analytics')}</Typography>
      <Typography>Appointments: {analytics.appointments}</Typography>
      <Typography>Revenue: ${analytics.revenue}</Typography>
      <Bar data={data} />
>>>>>>> eeea500e7c21953c51f8f841cd9d812eaa7d4522
    </Box>
  );
};

export default Analytics;