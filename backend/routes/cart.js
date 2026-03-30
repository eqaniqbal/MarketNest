const express = require('express')
const router = express.Router()
const pool = require('../config/db')
const { verifyToken, requireRole } = require('../middleware/auth')

// GET cart — MUST include p.seller_id so checkout can assign orders to sellers
router.get('/', verifyToken, requireRole('buyer'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, p.name, p.price, p.discount_price, p.images,
              p.stock_quantity, p.seller_id,
              u.store_name
       FROM cart c
       JOIN products p ON p.id = c.product_id
       JOIN users u ON u.id = p.seller_id
       WHERE c.buyer_id = $1`,
      [req.user.id]
    )
    res.json(result.rows)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// ADD to cart
router.post('/', verifyToken, requireRole('buyer'), async (req, res) => {
  const { product_id, quantity } = req.body
  try {
    const existing = await pool.query(
      'SELECT * FROM cart WHERE buyer_id=$1 AND product_id=$2',
      [req.user.id, product_id]
    )
    if (existing.rows.length > 0) {
      const result = await pool.query(
        'UPDATE cart SET quantity=quantity+$1 WHERE buyer_id=$2 AND product_id=$3 RETURNING *',
        [quantity || 1, req.user.id, product_id]
      )
      return res.json(result.rows[0])
    }
    const result = await pool.query(
      'INSERT INTO cart (buyer_id, product_id, quantity) VALUES ($1,$2,$3) RETURNING *',
      [req.user.id, product_id, quantity || 1]
    )
    res.status(201).json(result.rows[0])
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// UPDATE quantity
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE cart SET quantity=$1 WHERE id=$2 AND buyer_id=$3 RETURNING *',
      [req.body.quantity, req.params.id, req.user.id]
    )
    res.json(result.rows[0])
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// REMOVE from cart
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM cart WHERE id=$1 AND buyer_id=$2',
      [req.params.id, req.user.id]
    )
    res.json({ message: 'Removed from cart' })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

module.exports = router
