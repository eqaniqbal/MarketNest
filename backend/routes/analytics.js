const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyToken, requireRole } = require('../middleware/auth');

// ── Seller Analytics ──────────────────────────────────────────────────────────
// GET /api/analytics/seller?range=7   (7 | 30 | 90)
router.get('/seller', verifyToken, requireRole('seller'), async (req, res) => {
  const sellerId = req.user.id;
  const range = Math.min(Math.max(parseInt(req.query.range) || 30, 1), 365); // safe 1–365

  try {
    // Revenue & orders per day — parameterized, no SQL injection
    const dailyStats = await pool.query(
      `SELECT
         DATE(o.created_at)                                         AS date,
         COUNT(oi.id)::int                                          AS orders,
         COALESCE(SUM(oi.unit_price * oi.quantity), 0)::numeric    AS revenue
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       WHERE oi.seller_id = $1
         AND o.created_at >= NOW() - ($2 * INTERVAL '1 day')
       GROUP BY DATE(o.created_at)
       ORDER BY date ASC`,
      [sellerId, range]
    );

    // Top selling products (all time)
    const topProducts = await pool.query(
      `SELECT
         p.name,
         SUM(oi.quantity)::int                                       AS units_sold,
         COALESCE(SUM(oi.unit_price * oi.quantity), 0)::numeric     AS revenue
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       WHERE oi.seller_id = $1
       GROUP BY p.id, p.name
       ORDER BY units_sold DESC
       LIMIT 5`,
      [sellerId]
    );

    // Overall totals (all time)
    const totals = await pool.query(
      `SELECT
         COALESCE(SUM(oi.unit_price * oi.quantity), 0)::numeric     AS total_revenue,
         COUNT(DISTINCT o.id)::int                                   AS total_orders,
         COUNT(DISTINCT oi.product_id)::int                         AS products_sold
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       WHERE oi.seller_id = $1`,
      [sellerId]
    );

    // Orders by status
    const byStatus = await pool.query(
      `SELECT o.status, COUNT(*)::int AS count
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       WHERE oi.seller_id = $1
       GROUP BY o.status`,
      [sellerId]
    );

    res.json({
      daily:       dailyStats.rows,
      topProducts: topProducts.rows,
      totals:      totals.rows[0],
      byStatus:    byStatus.rows,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Admin Platform Analytics ──────────────────────────────────────────────────
// GET /api/analytics/platform?range=30
router.get('/platform', verifyToken, requireRole('admin'), async (req, res) => {
  const range = Math.min(Math.max(parseInt(req.query.range) || 30, 1), 365);
  try {
    const daily = await pool.query(
      `SELECT
         DATE(created_at)                                    AS date,
         COUNT(*)::int                                       AS orders,
         COALESCE(SUM(total_amount), 0)::numeric            AS revenue
       FROM orders
       WHERE created_at >= NOW() - ($1 * INTERVAL '1 day')
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
      [range]
    );

    const totals = await pool.query(
      `SELECT
         (SELECT COUNT(*) FROM users WHERE role='buyer')::int    AS total_buyers,
         (SELECT COUNT(*) FROM users WHERE role='seller')::int   AS total_sellers,
         (SELECT COUNT(*) FROM orders)::int                      AS total_orders,
         COALESCE(
           (SELECT SUM(total_amount) FROM orders WHERE payment_status='paid'),
           0
         )::numeric                                              AS total_revenue`
    );

    res.json({ daily: daily.rows, totals: totals.rows[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
