const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyToken, requireRole } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Get THIS seller's own products (including unapproved) — used by ProductManagement
router.get('/mine', verifyToken, requireRole('seller'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM products WHERE seller_id = $1 AND is_active = TRUE ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all approved products (public)
router.get('/', async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    let query = `SELECT p.*, u.store_name,
      COALESCE(AVG(r.rating), 0) AS avg_rating,
      COUNT(r.id) AS review_count
      FROM products p
      LEFT JOIN users u ON p.seller_id = u.id
      LEFT JOIN reviews r ON r.product_id = p.id
      WHERE p.is_approved = TRUE AND p.is_active = TRUE`;
    const params = [];

    if (category) { params.push(category); query += ` AND p.category = $${params.length}`; }
    if (search) { params.push(`%${search}%`); query += ` AND p.name ILIKE $${params.length}`; }

    query += ` GROUP BY p.id, u.store_name`;
    if (sort === 'price_asc') query += ' ORDER BY p.price ASC';
    else if (sort === 'price_desc') query += ' ORDER BY p.price DESC';
    else query += ' ORDER BY p.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, u.store_name, u.id as seller_id_ref FROM products p
       LEFT JOIN users u ON p.seller_id = u.id WHERE p.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Product not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add product (seller only)
// Add product (seller only)
router.post('/', verifyToken, requireRole('seller'), upload.array('images', 5), async (req, res) => {
  try {
    const { name, description, category, price, sku, stock_quantity, variants } = req.body;

    // Clean up input values
    const descVal = description?.trim() || '';
    const skuVal  = sku?.trim() || null;
    const discount_price = req.body.discount_price?.trim() !== '' ? Number(req.body.discount_price) : null;
    const images = req.files?.map(f => `/uploads/${f.filename}`) || [];

    // Handle variants safely
    let variantsVal = null;
    if (variants?.trim()) {
      try {
        // Try parse as JSON
        const parsed = JSON.parse(variants);
        // If it's an object or array, stringify to send to JSONB
        variantsVal = JSON.stringify(parsed);
      } catch {
        // If not valid JSON, treat as comma-separated list
        const arr = variants.split(',').map(v => v.trim()).filter(Boolean);
        variantsVal = arr.length > 0 ? JSON.stringify(arr) : null;
      }
    }

    // DEBUG: log values before insert
    console.log('=== ADD PRODUCT DEBUG ===');
    console.log({ seller_id: req.user.id, name, descVal, category, price: Number(price), discount_price, skuVal, stock_quantity: Number(stock_quantity), variantsVal, images });
    console.log('=========================');

    // Insert product safely
    const result = await pool.query(
      `INSERT INTO products
         (seller_id, name, description, category, price, discount_price, sku, stock_quantity, variants, images)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10) RETURNING *`,
      [
        req.user.id,
        name,
        descVal,
        category,
        Number(price),
        discount_price,
        skuVal,
        Number(stock_quantity),
        variantsVal,
        images
      ]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error('Add product error:', err.message);
    console.error('Full error detail:', err.detail || '(no detail)');
    console.error('Error position  :', err.position || '(no position)');
    res.status(500).json({ message: err.message });
  }
});

// Update product (seller only)
router.put('/:id', verifyToken, requireRole('seller'), async (req, res) => {
  const { name, description, category, price, stock_quantity, variants } = req.body;
  const discount_price = req.body.discount_price !== '' ? req.body.discount_price : null;

  let variantsVal = null;
  if (variants && variants.trim()) {
    try {
      variantsVal = JSON.parse(variants);
    } catch {
      variantsVal = variants.split(',').map(v => v.trim()).filter(Boolean);
    }
  }

  try {
    const result = await pool.query(
      `UPDATE products SET name=$1, description=$2, category=$3, price=$4, discount_price=$5,
       stock_quantity=$6, variants=$7
       WHERE id=$8 AND seller_id=$9 RETURNING *`,
      [name, description || '', category, Number(price), discount_price,
       Number(stock_quantity), variantsVal, req.params.id, req.user.id]
    );
    if (!result.rows[0]) return res.status(404).json({ message: 'Product not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update product error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// Delete product
router.delete('/:id', verifyToken, requireRole('seller'), async (req, res) => {
  try {
    await pool.query('UPDATE products SET is_active=FALSE WHERE id=$1 AND seller_id=$2', [req.params.id, req.user.id]);
    res.json({ message: 'Product removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

