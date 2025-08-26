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
    labels: analytics.demographics.map(d => d.role),
    datasets: [{
      label: 'User Count',
      data: analytics.demographics.map(d => d.count),
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1
    }]
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6">{t('analytics')}</Typography>
      <Typography>Appointments: {analytics.appointments}</Typography>
      <Typography>Revenue: ${analytics.revenue}</Typography>
      <Bar data={data} />
    </Box>
  );
};

export default Analytics;