const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyToken, requireRole } = require('../middleware/auth');

// ── Dashboard stats + monthly chart ──────────────────────────────────────────
router.get('/stats', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const buyers  = await pool.query("SELECT COUNT(*) FROM users WHERE role='buyer'");
    const sellers = await pool.query("SELECT COUNT(*) FROM users WHERE role='seller'");
    const orders  = await pool.query('SELECT COUNT(*) FROM orders');
    const revenue = await pool.query(
      "SELECT COALESCE(SUM(total_amount),0) as total FROM orders WHERE status != 'cancelled'"
    );

    // Monthly orders for chart (last 6 months)
    const monthlyOrders = await pool.query(`
      SELECT TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') AS month,
             COUNT(*)::int AS orders,
             COALESCE(SUM(total_amount),0)::numeric AS revenue
      FROM orders
      WHERE created_at >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY DATE_TRUNC('month', created_at) ASC
    `);

    res.json({
      total_buyers:   buyers.rows[0].count,
      total_sellers:  sellers.rows[0].count,
      total_orders:   orders.rows[0].count,
      total_revenue:  revenue.rows[0].total,
      monthly_orders: monthlyOrders.rows,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Get all users ─────────────────────────────────────────────────────────────
router.get('/users', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, role, full_name, email, phone, is_active, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Block / unblock user ──────────────────────────────────────────────────────
router.patch('/users/:id/toggle', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE users SET is_active = NOT is_active WHERE id=$1 RETURNING id, full_name, is_active',
      [req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Get pending products ──────────────────────────────────────────────────────
router.get('/products/pending', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, u.store_name, u.full_name as seller_name
       FROM products p
       JOIN users u ON p.seller_id = u.id
       WHERE p.is_approved = FALSE AND p.is_active = TRUE
       ORDER BY p.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Approve / reject product ──────────────────────────────────────────────────
router.patch('/products/:id/approve', verifyToken, requireRole('admin'), async (req, res) => {
  const { approved } = req.body;
  try {
    const result = await pool.query(
      'UPDATE products SET is_approved=$1 WHERE id=$2 RETURNING *',
      [approved, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Get ALL orders (for admin orders tab) ─────────────────────────────────────
router.get('/orders', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*,
         u.full_name as buyer_name,
         u.email    as buyer_email,
         u.phone    as buyer_phone,
         json_agg(
           json_build_object(
             'product_name', p.name,
             'quantity',     oi.quantity,
             'unit_price',   oi.unit_price,
             'seller_name',  s.store_name
           ) ORDER BY oi.id
         ) as items
       FROM orders o
       JOIN users u ON u.id = o.buyer_id
       LEFT JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN products p ON p.id = oi.product_id
       LEFT JOIN users s ON s.id = oi.seller_id
       GROUP BY o.id, u.full_name, u.email, u.phone
       ORDER BY o.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Update order status (admin) ───────────────────────────────────────────────
router.patch('/orders/:id/status', verifyToken, requireRole('admin'), async (req, res) => {
  const { status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE orders SET status=$1 WHERE id=$2 RETURNING *',
      [status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
