const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyToken, requireRole } = require('../middleware/auth');

// ── Place an order (buyer) ────────────────────────────────────────────────────
router.post('/', verifyToken, requireRole('buyer'), async (req, res) => {
  const { items, shipping_address, delivery_method, payment_method, coupon_code } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Delivery fee
    const subtotal = items.reduce((sum, i) => sum + Number(i.unit_price) * Number(i.quantity), 0);
    const deliveryFee = subtotal >= 2000 ? 0 : (delivery_method === 'express' ? 300 : 150);

    // Coupon discount
    let discountAmount = 0;
    if (coupon_code) {
      const couponRes = await client.query(
        `SELECT * FROM coupons WHERE code=$1 AND is_active=TRUE
          AND (start_date IS NULL OR start_date <= NOW())
          AND (end_date IS NULL OR end_date >= NOW())`,
        [coupon_code.toUpperCase()]
      );
      if (couponRes.rows.length > 0) {
        const c = couponRes.rows[0];
        if (c.discount_type === 'percentage') {
          discountAmount = Math.round(subtotal * Number(c.discount_value) / 100);
        } else {
          discountAmount = Number(c.discount_value);
        }
      }
    }

    const total = subtotal + deliveryFee - discountAmount;

    const order = await client.query(
      `INSERT INTO orders (buyer_id, total_amount, shipping_address, delivery_method,
                           payment_method, coupon_code, discount_amount)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [req.user.id, total, shipping_address, delivery_method,
       payment_method, coupon_code || null, discountAmount]
    );

    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, seller_id, quantity, unit_price, variant)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [order.rows[0].id, item.product_id, item.seller_id,
         item.quantity, item.unit_price, item.variant || null]
      );
      await client.query(
        'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    await client.query('DELETE FROM cart WHERE buyer_id = $1', [req.user.id]);
    await client.query('COMMIT');
    res.status(201).json(order.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: err.message });
  } finally {
    client.release();
  }
});

// ── Validate coupon at checkout ───────────────────────────────────────────────
router.post('/validate-coupon', verifyToken, requireRole('buyer'), async (req, res) => {
  const { code, order_total } = req.body;
  if (!code) return res.status(400).json({ message: 'Coupon code required' });
  try {
    const result = await pool.query(
      `SELECT * FROM coupons WHERE code=$1 AND is_active=TRUE
        AND (start_date IS NULL OR start_date <= NOW())
        AND (end_date IS NULL OR end_date >= NOW())`,
      [code.toUpperCase().trim()]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Invalid or expired coupon' });
    }
    const c = result.rows[0];
    const total = Number(order_total) || 0;
    if (c.min_order_amount > 0 && total < Number(c.min_order_amount)) {
      return res.status(400).json({
        message: `Minimum order Rs. ${c.min_order_amount} required`
      });
    }
    let discount = c.discount_type === 'percentage'
      ? Math.round(total * Number(c.discount_value) / 100)
      : Number(c.discount_value);
    discount = Math.min(discount, total);
    res.json({ valid: true, discount, coupon_code: c.code, message: `You save Rs. ${discount}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Buyer: get own orders ────────────────────────────────────────────────────
router.get('/my', verifyToken, requireRole('buyer'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*,
        json_agg(
          json_build_object(
            'id', oi.id,
            'product_id', oi.product_id,
            'seller_id', oi.seller_id,
            'quantity', oi.quantity,
            'unit_price', oi.unit_price,
            'variant', oi.variant,
            'product_name', p.name,
            'product_images', p.images
          )
        ) as items
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN products p ON p.id = oi.product_id
       WHERE o.buyer_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Seller: get their orders ──────────────────────────────────────────────────
router.get('/seller', verifyToken, requireRole('seller'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.id, o.status, o.shipping_address, o.delivery_method,
              o.payment_method, o.total_amount, o.tracking_id, o.created_at,
              oi.id as item_id, oi.quantity, oi.unit_price, oi.variant,
              p.name as product_name, p.images as product_images,
              u.full_name as buyer_name, u.phone as buyer_phone
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       JOIN products p ON p.id = oi.product_id
       JOIN users u ON u.id = o.buyer_id
       WHERE oi.seller_id = $1
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Admin: get ALL orders ─────────────────────────────────────────────────────
router.get('/admin/all', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*,
        u.full_name as buyer_name, u.email as buyer_email,
        json_agg(
          json_build_object(
            'product_name', p.name,
            'quantity', oi.quantity,
            'unit_price', oi.unit_price,
            'seller_id', oi.seller_id
          )
        ) as items
       FROM orders o
       JOIN users u ON u.id = o.buyer_id
       LEFT JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN products p ON p.id = oi.product_id
       GROUP BY o.id, u.full_name, u.email
       ORDER BY o.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Seller: update order status + tracking ────────────────────────────────────
router.patch('/:id/status', verifyToken, requireRole('seller'), async (req, res) => {
  const { status, tracking_id } = req.body;
  try {
    const result = await pool.query(
      'UPDATE orders SET status=$1, tracking_id=$2 WHERE id=$3 RETURNING *',
      [status, tracking_id || null, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Order not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Admin: update any order status ───────────────────────────────────────────
router.patch('/:id/admin-status', verifyToken, requireRole('admin'), async (req, res) => {
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
