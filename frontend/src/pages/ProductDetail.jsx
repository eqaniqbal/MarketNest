import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingCart, Heart, Star, Store, ChevronLeft, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import ChatBubble from '../components/ChatBubble'
import api from '../utils/api'
import { getUser } from '../utils/auth'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = getUser()
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)

  useEffect(() => {
    api.get(`/products/${id}`).then(res => {
      setProduct(res.data)
      setLoading(false)
    }).catch(() => { toast.error('Product not found'); navigate('/products') })
  }, [id])

  const addToCart = async () => {
    if (!user) return navigate('/buyer/login')
    try {
      await api.post('/cart', { product_id: product.id, quantity })
      setAddedToCart(true)
      toast.success('Added to cart!')
      setTimeout(() => setAddedToCart(false), 2000)
    } catch (err) {
      toast.error('Could not add to cart')
    }
  }

  const addToWishlist = async () => {
    if (!user) return navigate('/buyer/login')
    try {
      await api.post('/wishlist', { product_id: product.id })
      toast.success('Added to wishlist!')
    } catch (err) {
      toast.error('Already in wishlist')
    }
  }

  if (loading) return (
    <div><Navbar />
      <div style={{ maxWidth: 1100, margin: '3rem auto', padding: '0 2rem' }}>
        <div style={{ height: 400, background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }} />
      </div>
    </div>
  )

  if (!product) return null

  const displayPrice = product.discount_price || product.price
  const discount = product.discount_price
    ? Math.round((1 - product.discount_price / product.price) * 100) : null

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem' }}>

        {/* Back button */}
        <button onClick={() => navigate(-1)} className="btn" style={{ marginBottom: '1.5rem', background: 'white', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
          <ChevronLeft size={16} /> Back
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', alignItems: 'start' }}>

          {/* Left — Images */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div style={{
              background: 'white', borderRadius: 'var(--radius)',
              border: '1px solid var(--border)', overflow: 'hidden',
              aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <img
                src={product.images?.[selectedImage] ? `http://localhost:5000${product.images[selectedImage]}` : 'https://via.placeholder.com/500?text=No+Image'}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            {product.images?.length > 1 && (
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                {product.images.map((img, i) => (
                  <div key={i} onClick={() => setSelectedImage(i)} style={{
                    width: 72, height: 72, borderRadius: 8, overflow: 'hidden', cursor: 'pointer',
                    border: `2px solid ${selectedImage === i ? 'var(--primary)' : 'var(--border)'}`,
                    transition: 'border-color 0.2s'
                  }}>
                    <img src={`http://localhost:5000${img}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right — Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Store size={14} color="var(--text-muted)" />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{product.store_name}</span>
              {product.category && <span className="badge badge-purple" style={{ marginLeft: 'auto' }}>{product.category}</span>}
            </div>

            <h1 style={{ fontSize: '1.6rem', fontWeight: 700, lineHeight: 1.3, marginBottom: '1rem' }}>{product.name}</h1>

            {/* Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={16} fill={s <= Math.round(product.avg_rating || 0) ? '#F59E0B' : 'none'} stroke="#F59E0B" />
                ))}
              </div>
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{Number(product.avg_rating || 0).toFixed(1)}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>({product.review_count || 0} reviews)</span>
            </div>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.2rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>Rs. {displayPrice}</span>
              {discount && <>
                <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>Rs. {product.price}</span>
                <span style={{ background: '#fee2e2', color: 'var(--danger)', padding: '0.2rem 0.6rem', borderRadius: 6, fontWeight: 600, fontSize: '0.85rem' }}>{discount}% OFF</span>
              </>}
            </div>

            {/* Stock */}
            <div style={{ marginBottom: '1.2rem' }}>
              {product.stock_quantity > 0
                ? <span className="badge badge-success"><Check size={12} /> In Stock ({product.stock_quantity} available)</span>
                : <span className="badge badge-danger">Out of Stock</span>
              }
            </div>

            {/* Description */}
            {product.description && (
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontWeight: 600, marginBottom: '0.4rem' }}>Description</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.7 }}>{product.description}</p>
              </div>
            )}

            {/* Quantity */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <p style={{ fontWeight: 600 }}>Quantity:</p>
              <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  style={{ width: 36, height: 36, background: 'var(--bg)', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>−</button>
                <span style={{ width: 40, textAlign: 'center', fontWeight: 600 }}>{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stock_quantity, q + 1))}
                  style={{ width: 36, height: 36, background: 'var(--bg)', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>+</button>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={addToCart}
                disabled={product.stock_quantity === 0}
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: 'center', padding: '0.9rem', fontSize: '1rem', background: addedToCart ? 'var(--success)' : 'var(--primary)' }}
              >
                {addedToCart ? <><Check size={18} /> Added!</> : <><ShoppingCart size={18} /> Add to Cart</>}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={addToWishlist}
                className="btn"
                style={{ padding: '0.9rem 1.2rem', background: 'white', border: '1.5px solid var(--border)' }}
              >
                <Heart size={18} color="var(--danger)" />
              </motion.button>
            </div>

            {/* SKU */}
            {product.sku && (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1rem' }}>SKU: {product.sku}</p>
            )}
          </motion.div>
        </div>
      </div>

      {/* ChatBubble — buyer can chat with seller */}
      {user?.role === 'buyer' && product?.seller_id_ref && (
        <ChatBubble
          receiverId={product.seller_id_ref}
          receiverName={product.store_name || 'Seller'}
        />
      )}
    </div>
  )
}