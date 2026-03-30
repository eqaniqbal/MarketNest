const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyToken, requireRole } = require('../middleware/auth');

// ── Seller: Create coupon ─────────────────────────────────────────────────────
router.post('/', verifyToken, requireRole('seller'), async (req, res) => {
  const {
    code, discount_type, discount_value,
    min_order_amount, start_date, end_date, is_active
  } = req.body;

  if (!code || !discount_type || !discount_value) {
    return res.status(400).json({ message: 'code, discount_type, and discount_value are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO coupons
         (seller_id, code, discount_type, discount_value, min_order_amount, start_date, end_date, is_active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [
        req.user.id,
        code.toUpperCase().trim(),
        discount_type,
        discount_value,
        min_order_amount || 0,
        start_date || null,
        end_date || null,
        is_active !== undefined ? is_active : true
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ message: 'Coupon code already exists' });
    res.status(500).json({ message: err.message });
  }
});

// ── Seller: Get all their coupons ─────────────────────────────────────────────
router.get('/my', verifyToken, requireRole('seller'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM coupons WHERE seller_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Seller: Update coupon ─────────────────────────────────────────────────────
router.put('/:id', verifyToken, requireRole('seller'), async (req, res) => {
  const {
    code, discount_type, discount_value,
    min_order_amount, start_date, end_date, is_active
  } = req.body;
  try {
    const result = await pool.query(
      `UPDATE coupons SET
         code=$1, discount_type=$2, discount_value=$3,
         min_order_amount=$4, start_date=$5, end_date=$6, is_active=$7
       WHERE id=$8 AND seller_id=$9 RETURNING *`,
      [
        code?.toUpperCase().trim(), discount_type, discount_value,
        min_order_amount || 0, start_date || null, end_date || null,
        is_active,
        req.params.id, req.user.id
      ]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Coupon not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Seller: Delete coupon ─────────────────────────────────────────────────────
router.delete('/:id', verifyToken, requireRole('seller'), async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM coupons WHERE id=$1 AND seller_id=$2',
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Coupon deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Buyer: Validate/apply a coupon at checkout ────────────────────────────────
router.post('/validate', async (req, res) => {
  const { code, order_total } = req.body;
  if (!code) return res.status(400).json({ message: 'Coupon code required' });

  try {
    const result = await pool.query(
      `SELECT * FROM coupons
       WHERE code = $1
         AND is_active = TRUE
         AND (start_date IS NULL OR start_date <= NOW())
         AND (end_date   IS NULL OR end_date   >= NOW())`,
      [code.toUpperCase().trim()]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Invalid or expired coupon code' });
    }

    const coupon = result.rows[0];

    if (order_total && coupon.min_order_amount > 0 && order_total < coupon.min_order_amount) {
      return res.status(400).json({
        message: `Minimum order amount of Rs. ${coupon.min_order_amount} required for this coupon`
      });
    }

    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = Math.round((order_total || 0) * coupon.discount_value / 100);
    } else {
      discount = coupon.discount_value;
    }

    res.json({
      valid: true,
      discount,
      coupon_code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      message: `Coupon applied! You save Rs. ${discount}`
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
