const pool = require('../config/db');
const fs = require('fs');
const csv = require('csv-parser');
const { sendEmail } = require('../utils/email');

exports.addInventory = async (req, res) => {
  const { item_name, quantity, location_id, low_stock_threshold } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO inventory (item_name, quantity, location_id, low_stock_threshold) VALUES ($1, $2, $3, $4) RETURNING id',
      [item_name, quantity, location_id, low_stock_threshold]
    );
    if (quantity < low_stock_threshold) {
      const admins = await pool.query('SELECT email FROM users WHERE role = $1', ['admin']);
      for (const admin of admins.rows) {
        await sendEmail(admin.email, 'Low Stock Alert', `${item_name} stock is low: ${quantity}`);
      }
    }
    res.status(201).json({ message: 'Inventory added', inventoryId: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.uploadInventory = async (req, res) => {
  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        for (const item of results) {
          await pool.query(
            'INSERT INTO inventory (item_name, quantity, location_id, low_stock_threshold) VALUES ($1, $2, $3, $4)',
            [item.item_name, item.quantity, item.location_id, item.low_stock_threshold || 10]
          );
          if (item.quantity < (item.low_stock_threshold || 10)) {
            const admins = await pool.query('SELECT email FROM users WHERE role = $1', ['admin']);
            for (const admin of admins.rows) {
              await sendEmail(admin.email, 'Low Stock Alert', `${item.item_name} stock is low: ${item.quantity}`);
            }
          }
        }
        fs.unlinkSync(req.file.path); // Clean up
        res.json({ message: 'Inventory uploaded' });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });
};