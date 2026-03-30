import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Trash2, Plus, Minus, Tag, ArrowRight, ShoppingCart, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import api from '../utils/api'

export default function Cart() {
  const navigate = useNavigate()
  const [items, setItems]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [coupon, setCoupon]         = useState('')
  const [discount, setDiscount]     = useState(0)
  const [couponApplied, setCouponApplied] = useState(false)
  const [couponMsg, setCouponMsg]   = useState('')
  const [applying, setApplying]     = useState(false)
  const [removing, setRemoving]     = useState(null)

  useEffect(() => {
    api.get('/cart')
      .then(res => { setItems(res.data); setLoading(false) })
      .catch(() => { toast.error('Could not load cart'); setLoading(false) })
  }, [])

  const subtotal    = items.reduce((s, i) => s + (Number(i.discount_price) || Number(i.price)) * i.quantity, 0)
  const shippingFee = subtotal >= 2000 ? 0 : 150
  const total       = subtotal + shippingFee - discount

  const updateQty = async (id, newQty) => {
    if (newQty < 1) return
    try {
      await api.put(`/cart/${id}`, { quantity: newQty })
      setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: newQty } : i))
    } catch { toast.error('Could not update quantity') }
  }

  const removeItem = async (id) => {
    setRemoving(id)
    try {
      await api.delete(`/cart/${id}`)
      setItems(prev => prev.filter(i => i.id !== id))
      toast.success('Item removed')
    } catch { toast.error('Could not remove item') }
    setRemoving(null)
  }

  const applyCoupon = async () => {
    if (!coupon.trim()) return toast.error('Enter a coupon code')
    if (couponApplied) return
    setApplying(true)
    try {
      const res = await api.post('/coupons/validate', { code: coupon.trim(), order_total: subtotal })
      setDiscount(Number(res.data.discount))
      setCouponMsg(`✅ "${coupon.toUpperCase()}" applied — Rs. ${res.data.discount} off!`)
      setCouponApplied(true)
    } catch (err) {
      setCouponMsg('❌ ' + (err.response?.data?.message || 'Invalid coupon code'))
      setDiscount(0)
    }
    setApplying(false)
  }

  const removeCoupon = () => {
    setCoupon(''); setDiscount(0); setCouponMsg(''); setCouponApplied(false)
  }

  const getImg = (item) => {
    try {
      const arr = typeof item.images === 'string' ? JSON.parse(item.images) : item.images
      return arr?.[0] ? `http://localhost:5000${arr[0]}` : null
    } catch { return null }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading your cart...</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          <Link to="/" style={{ color: 'var(--text-muted)' }}>Home</Link>
          <ChevronRight size={13} />
          <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>Shopping Cart</span>
        </div>

        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
          Shopping Cart <span style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 400 }}>({items.length} {items.length === 1 ? 'item' : 'items'})</span>
        </h1>

        {items.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="card" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
            <ShoppingCart size={52} color="var(--border)" style={{ margin: '0 auto 1.2rem' }} />
            <h2 style={{ marginBottom: '0.5rem' }}>Your cart is empty</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.8rem' }}>Add some products to get started!</p>
            <Link to="/products" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShoppingBag size={16} /> Browse Products
            </Link>
          </motion.div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.5rem', alignItems: 'start' }}>

            {/* Cart Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <AnimatePresence>
                {items.map(item => {
                  const price = Number(item.discount_price) || Number(item.price)
                  const hasDiscount = item.discount_price && Number(item.discount_price) < Number(item.price)
                  const imgSrc = getImg(item)
                  return (
                    <motion.div key={item.id} layout
                      initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 16 }}
                      className="card" style={{ padding: '1.1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>

                      {/* Image */}
                      <div style={{ width: 80, height: 80, borderRadius: 8, overflow: 'hidden', background: 'var(--bg)', flexShrink: 0 }}>
                        {imgSrc
                          ? <img src={imgSrc} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
                          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--border)', fontSize: '1.5rem' }}>📦</div>
                        }
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Link to={`/products/${item.product_id}`} style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-main)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.name}
                        </Link>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>{item.store_name}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 700, color: 'var(--primary)' }}>Rs. {price.toFixed(0)}</span>
                          {hasDiscount && <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textDecoration: 'line-through' }}>Rs. {Number(item.price).toFixed(0)}</span>}
                        </div>
                      </div>

                      {/* Quantity */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button onClick={() => updateQty(item.id, item.quantity - 1)} disabled={item.quantity <= 1}
                          style={{ width: 30, height: 30, border: '1.5px solid var(--border)', borderRadius: 7, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: item.quantity <= 1 ? 'default' : 'pointer', color: item.quantity <= 1 ? 'var(--border)' : 'var(--text-main)' }}>
                          <Minus size={13} />
                        </button>
                        <span style={{ minWidth: 24, textAlign: 'center', fontWeight: 600 }}>{item.quantity}</span>
                        <button onClick={() => updateQty(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock_quantity}
                          style={{ width: 30, height: 30, border: '1.5px solid var(--border)', borderRadius: 7, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: item.quantity >= item.stock_quantity ? 'default' : 'pointer', color: item.quantity >= item.stock_quantity ? 'var(--border)' : 'var(--text-main)' }}>
                          <Plus size={13} />
                        </button>
                      </div>

                      {/* Line total */}
                      <div style={{ textAlign: 'right', minWidth: 80 }}>
                        <p style={{ fontWeight: 700, color: 'var(--text-main)' }}>Rs. {(price * item.quantity).toFixed(0)}</p>
                        {item.quantity > 1 && <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>× {item.quantity}</p>}
                      </div>

                      {/* Remove */}
                      <button onClick={() => removeItem(item.id)} disabled={removing === item.id}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--border)', padding: '0.2rem', borderRadius: 6, display: 'flex', alignItems: 'center', transition: 'color 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--border)'}>
                        <Trash2 size={17} />
                      </button>
                    </motion.div>
                  )
                })}
              </AnimatePresence>

              <div style={{ paddingTop: '0.5rem' }}>
                <Link to="/products" style={{ color: 'var(--primary)', fontWeight: 500, fontSize: '0.86rem' }}>
                  ← Continue Shopping
                </Link>
              </div>
            </div>

            {/* Order Summary */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {/* Coupon */}
              <div className="card" style={{ padding: '1.2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.9rem' }}>
                  <Tag size={16} color="var(--primary)" />
                  <h3 style={{ fontWeight: 600, fontSize: '0.92rem' }}>Apply Coupon</h3>
                </div>

                {couponApplied ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--primary-light)', border: '1px solid #BBF7D0', borderRadius: 8, padding: '0.65rem 0.9rem' }}>
                    <span style={{ color: '#16A34A', fontSize: '0.83rem', fontWeight: 600 }}>{couponMsg}</span>
                    <button onClick={removeCoupon} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.8rem' }}>✕</button>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input value={coupon} onChange={e => setCoupon(e.target.value.toUpperCase())}
                        onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                        placeholder="Enter coupon code"
                        className="input-field"
                        style={{ flex: 1, padding: '0.6rem 0.9rem', letterSpacing: '0.05em', fontWeight: 600 }} />
                      <button onClick={applyCoupon} disabled={applying}
                        className="btn btn-primary" style={{ padding: '0.6rem 1rem', fontSize: '0.83rem', opacity: applying ? 0.7 : 1 }}>
                        {applying ? '...' : 'Apply'}
                      </button>
                    </div>
                    {couponMsg && <p style={{ fontSize: '0.78rem', color: 'var(--danger)', marginTop: '0.5rem' }}>{couponMsg}</p>}
                  </>
                )}
              </div>

              {/* Price Summary */}
              <div className="card" style={{ padding: '1.2rem' }}>
                <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem' }}>Order Summary</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Subtotal ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
                    <span>Rs. {subtotal.toFixed(0)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Shipping</span>
                    {shippingFee === 0
                      ? <span style={{ color: 'var(--success)', fontWeight: 600 }}>FREE 🎉</span>
                      : <span>Rs. {shippingFee}</span>}
                  </div>
                  {discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                      <span style={{ color: 'var(--success)' }}>Coupon Discount</span>
                      <span style={{ color: 'var(--success)', fontWeight: 600 }}>- Rs. {discount}</span>
                    </div>
                  )}
                  {subtotal > 0 && subtotal < 2000 && (
                    <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', background: 'var(--bg)', padding: '0.4rem 0.7rem', borderRadius: 6 }}>
                      💡 Add Rs. {(2000 - subtotal).toFixed(0)} more for free shipping
                    </p>
                  )}
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.9rem', marginBottom: '1.2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 700 }}>Total</span>
                    <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem' }}>Rs. {total.toFixed(0)}</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/checkout', { state: { discount, couponCode: coupon } })}
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', fontSize: '0.95rem' }}>
                  Proceed to Checkout <ArrowRight size={16} />
                </button>

                <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.8rem' }}>
                  🔒 Secure & encrypted checkout
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
