import React, { useState } from 'react';
import { Button, TextField, Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

const Inventory = () => {
  const { t } = useTranslation();
  const [form, setForm] = useState({ item_name: '', quantity: '', location_id: '', low_stock_threshold: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await api.post('/inventory', form);
      alert('Inventory added');
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = async (e) => {
    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    try {
      await api.post('/inventory/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      alert('Inventory uploaded');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6">{t('manage_inventory')}</Typography>
      <TextField label="Item Name" name="item_name" value={form.item_name} onChange={handleChange} fullWidth margin="normal" />
      <TextField label="Quantity" name="quantity" value={form.quantity} onChange={handleChange} fullWidth margin="normal" />
      <TextField label="Location ID" name="location_id" value={form.location_id} onChange={handleChange} fullWidth margin="normal" />
      <TextField label="Low Stock Threshold" name="low_stock_threshold" value={form.low_stock_threshold} onChange={handleChange} fullWidth margin="normal" />
      <Button variant="contained" onClick={handleSubmit}>Add Item</Button>
      <Box sx={{ mt: 2 }}>
        <input type="file" accept=".csv" onChange={handleFileUpload} />
      </Box>
    </Box>
  );
};

export default Inventory;