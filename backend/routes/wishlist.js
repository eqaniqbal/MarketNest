const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyToken, requireRole } = require('../middleware/auth');

// GET buyer's wishlist
router.get('/', verifyToken, requireRole('buyer'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT w.id, w.product_id, w.added_at,
              p.name, p.price, p.discount_price, p.images, p.stock_quantity,
              u.store_name,
              COALESCE(AVG(r.rating), 0) AS avg_rating
       FROM wishlist w
       JOIN products p ON p.id = w.product_id
       JOIN users u ON u.id = p.seller_id
       LEFT JOIN reviews r ON r.product_id = p.id
       WHERE w.buyer_id = $1
       GROUP BY w.id, p.id, u.store_name
       ORDER BY w.added_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADD to wishlist
router.post('/', verifyToken, requireRole('buyer'), async (req, res) => {
  const { product_id } = req.body;
  try {
    const exists = await pool.query(
      'SELECT id FROM wishlist WHERE buyer_id=$1 AND product_id=$2',
      [req.user.id, product_id]
    );
    if (exists.rows.length > 0) {
      return res.status(409).json({ message: 'Already in wishlist' });
    }
    const result = await pool.query(
      'INSERT INTO wishlist (buyer_id, product_id) VALUES ($1,$2) RETURNING *',
      [req.user.id, product_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// REMOVE from wishlist
router.delete('/:id', verifyToken, requireRole('buyer'), async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM wishlist WHERE id=$1 AND buyer_id=$2',
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Removed from wishlist' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
