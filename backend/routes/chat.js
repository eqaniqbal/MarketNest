const express = require('express')
const router = express.Router()
const pool = require('../config/db')
const { verifyToken } = require('../middleware/auth')

// ── Get all conversations for logged-in user ──────────────────────────────────
router.get('/conversations', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT ON (
        LEAST(m.sender_id, m.receiver_id),
        GREATEST(m.sender_id, m.receiver_id)
      )
        m.*,
        u.full_name  AS other_name,
        u.store_name AS other_store,
        u.role       AS other_role
      FROM messages m
      JOIN users u ON u.id = CASE
        WHEN m.sender_id = $1 THEN m.receiver_id
        ELSE m.sender_id
      END
      WHERE m.sender_id = $1 OR m.receiver_id = $1
      ORDER BY
        LEAST(m.sender_id, m.receiver_id),
        GREATEST(m.sender_id, m.receiver_id),
        m.created_at DESC
    `, [req.user.id])
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── Get messages between two users ────────────────────────────────────────────
router.get('/:otherId', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.*, u.full_name AS sender_name, u.role AS sender_role
      FROM messages m
      JOIN users u ON u.id = m.sender_id
      WHERE (m.sender_id = $1 AND m.receiver_id = $2)
         OR (m.sender_id = $2 AND m.receiver_id = $1)
      ORDER BY m.created_at ASC
    `, [req.user.id, req.params.otherId])

    // Mark incoming messages as seen
    await pool.query(`
      UPDATE messages SET is_seen = TRUE
      WHERE receiver_id = $1 AND sender_id = $2 AND is_seen = FALSE
    `, [req.user.id, req.params.otherId])

    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── Save a message ────────────────────────────────────────────────────────────
router.post('/send', verifyToken, async (req, res) => {
  const { receiver_id, content, product_id, image_url } = req.body
  if (!receiver_id || !content?.trim()) {
    return res.status(400).json({ message: 'receiver_id and content are required' })
  }
  try {
    const result = await pool.query(`
      INSERT INTO messages (sender_id, receiver_id, content, product_id, image_url)
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `, [req.user.id, receiver_id, content.trim(), product_id || null, image_url || null])
    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── Unread count for logged-in user ──────────────────────────────────────────
router.get('/unread/count', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT COUNT(*) FROM messages WHERE receiver_id=$1 AND is_seen=FALSE',
      [req.user.id]
    )
    res.json({ count: parseInt(result.rows[0].count) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
