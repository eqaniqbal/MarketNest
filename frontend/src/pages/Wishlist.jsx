import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trash2, ShoppingCart, Heart } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import api from '../utils/api'

export default function Wishlist() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/wishlist').then(res => { setItems(res.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const remove = async (id) => {
    try {
      await api.delete(`/wishlist/${id}`)
      setItems(items.filter(i => i.id !== id))
      toast.success('Removed from wishlist')
    } catch { toast.error('Failed to remove') }
  }

  const moveToCart = async (item) => {
    try {
      await api.post('/cart', { product_id: item.product_id, quantity: 1 })
      toast.success('Moved to cart!')
    } catch { toast.error('Could not add to cart') }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Heart size={22} color="var(--danger)" /> My Wishlist ({items.length})
        </h1>

        {loading ? <p>Loading...</p> : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <Heart size={48} color="var(--border)" style={{ margin: '0 auto 1rem' }} />
            <p style={{ color: 'var(--text-muted)' }}>Your wishlist is empty</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {items.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="card" style={{ padding: '1rem', overflow: 'hidden' }}>
                <img src={item.images?.[0] ? `http://localhost:5000${item.images[0]}` : 'https://via.placeholder.com/220x160?text=No+Img'} alt={item.name}
                  style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 8, marginBottom: '0.8rem' }} />
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.store_name}</p>
                <p style={{ fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.92rem' }}>{item.name}</p>
                <p style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '0.8rem' }}>Rs. {item.discount_price || item.price}</p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => moveToCart(item)} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '0.5rem', fontSize: '0.85rem' }}>
                    <ShoppingCart size={14} /> Add to Cart
                  </button>
                  <button onClick={() => remove(item.id)} className="btn btn-danger" style={{ padding: '0.5rem 0.7rem' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}