import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, Truck, CreditCard, CheckCircle,
  ShoppingBag, ChevronRight, Tag, ArrowLeft
} from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import api from '../utils/api'
import { getUser } from '../utils/auth'

const steps = ['Shipping', 'Delivery', 'Payment', 'Review']

const deliveryOptions = [
  {
    id: 'standard',
    label: 'Standard Delivery',
    desc: '3-5 business days',
    price: 150,
    icon: '📦'
  },
  {
    id: 'express',
    label: 'Express Delivery',
    desc: '1-2 business days',
    price: 300,
    icon: '⚡'
  },
]

const paymentMethods = [
  { id: 'card',   label: 'Credit / Debit Card', icon: '💳' },
  { id: 'wallet', label: 'Digital Wallet',       icon: '📱' },
]

export default function Checkout() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const user      = getUser()

  const [step, setStep]         = useState(0)
  const [placing, setPlacing]   = useState(false)
  const [coupon, setCoupon]     = useState('')
  const [discount, setDiscount] = useState(0)
  const [cartItems, setCartItems] = useState([])
  const [loadingCart, setLoadingCart] = useState(true)

  const [shipping, setShipping] = useState({
    full_name:    user?.full_name || '',
    phone:        user?.phone     || '',
    address:      '',
    city:         '',
    province:     '',
    postal_code:  '',
  })

  const [delivery,  setDelivery]  = useState('standard')
  const [payment,   setPayment]   = useState('card')
  const [cardInfo,  setCardInfo]  = useState({
    number: '', expiry: '', cvv: '', name: ''
  })

  // Load cart items
  useEffect(() => {
    api.get('/cart')
      .then(res => { setCartItems(res.data); setLoadingCart(false) })
      .catch(() => { toast.error('Could not load cart'); setLoadingCart(false) })
  }, [])

  // Calculations
  const subtotal      = cartItems.reduce((s, i) => s + (i.discount_price || i.price) * i.quantity, 0)
  const deliveryFee   = subtotal >= 2000 ? 0 : (delivery === 'express' ? 300 : 150)
  const total         = subtotal + deliveryFee - discount

  // ── Coupon ──────────────────────────────────────────────────────────────────
  const applyCoupon = async () => {
    if (!coupon.trim()) return toast.error('Enter a coupon code')
    try {
      const res = await api.post('/coupons/validate', { code: coupon, order_total: subtotal })
      setDiscount(res.data.discount || 0)
      toast.success(res.data.message || `Coupon applied! You saved Rs. ${res.data.discount}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired coupon code')
      setDiscount(0)
    }
  }

  // ── Step validation ──────────────────────────────────────────────────────────
  const validateStep = () => {
    if (step === 0) {
      const { full_name, phone, address, city, province } = shipping
      if (!full_name || !phone || !address || !city || !province) {
        toast.error('Please fill in all shipping fields')
        return false
      }
    }
    if (step === 2 && payment === 'card') {
      const { number, expiry, cvv, name } = cardInfo
      if (!number || !expiry || !cvv || !name) {
        toast.error('Please fill in all card details')
        return false
      }
    }
    return true
  }

  const nextStep = () => {
    if (!validateStep()) return
    setStep(s => Math.min(s + 1, 3))
  }

  // ── Place Order ──────────────────────────────────────────────────────────────
  const placeOrder = async () => {
    if (cartItems.length === 0) return toast.error('Your cart is empty')
    setPlacing(true)
    try {
      const shippingAddress = [
        shipping.address, shipping.city,
        shipping.province, shipping.postal_code
      ].filter(Boolean).join(', ')

      const items = cartItems.map(i => ({
        product_id:  i.product_id,
        seller_id:   i.seller_id,
        quantity:    i.quantity,
        unit_price:  i.discount_price || i.price,
        variant:     i.variant || null,
      }))

      const res = await api.post('/orders', {
        items,
        shipping_address: shippingAddress,
        delivery_method:  delivery,
        payment_method:   payment,
        coupon_code:      coupon || null,
      })

      navigate('/order-confirmation', {
        state: {
          order:    res.data,
          items:    cartItems,
          total,
          delivery,
        }
      })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not place order')
    } finally {
      setPlacing(false)
    }
  }

  if (loadingCart) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>
        Loading checkout...
      </div>
    </div>
  )

  if (cartItems.length === 0) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div style={{ textAlign: 'center', padding: '5rem' }}>
        <ShoppingBag size={52} color="var(--border)" style={{ margin: '0 auto 1rem' }} />
        <h2 style={{ marginBottom: '0.5rem' }}>Your cart is empty</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Add some products before checking out
        </p>
        <Link to="/products" className="btn btn-primary">Browse Products</Link>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div style={{ maxWidth: 1050, margin: '0 auto', padding: '2rem' }}>

        {/* Back */}
        <button onClick={() => navigate('/cart')}
          className="btn"
          style={{ marginBottom: '1.5rem', background: 'white', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
          <ArrowLeft size={15} /> Back to Cart
        </button>

        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '2rem' }}>Checkout</h1>

        {/* ── Stepper ── */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2.5rem' }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '0.88rem',
                  background: i < step ? 'var(--success)' : i === step ? 'var(--primary)' : 'var(--bg)',
                  color: i <= step ? 'white' : 'var(--text-muted)',
                  border: i > step ? '2px solid var(--border)' : 'none',
                  transition: 'all 0.3s'
                }}>
                  {i < step ? <CheckCircle size={18} /> : i + 1}
                </div>
                <span style={{
                  fontSize: '0.72rem', fontWeight: 500,
                  color: i === step ? 'var(--primary)' : 'var(--text-muted)',
                  whiteSpace: 'nowrap'
                }}>{s}</span>
              </div>
              {i < steps.length - 1 && (
                <div style={{
                  flex: 1, height: 2,
                  background: i < step ? 'var(--success)' : 'var(--border)',
                  margin: '0 0.5rem', marginBottom: '1.2rem',
                  transition: 'background 0.3s'
                }} />
              )}
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.5rem', alignItems: 'start' }}>

          {/* ── Left Panel ── */}
          <div>
            <AnimatePresence mode="wait">

              {/* Step 0 — Shipping Address */}
              {step === 0 && (
                <motion.div key="shipping"
                  initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }} className="card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
                    <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.5rem', borderRadius: 8 }}>
                      <MapPin size={18} />
                    </div>
                    <h2 style={{ fontWeight: 700 }}>Shipping Address</h2>
                  </div>

                  <div className="grid-2">
                    {[
                      { key: 'full_name',   label: 'Full Name',    placeholder: 'Your full name' },
                      { key: 'phone',       label: 'Phone Number', placeholder: '03XXXXXXXXX' },
                    ].map(f => (
                      <div key={f.key} className="form-group" style={{ marginBottom: 0 }}>
                        <label>{f.label}</label>
                        <input className="input-field" placeholder={f.placeholder}
                          value={shipping[f.key]}
                          onChange={e => setShipping({ ...shipping, [f.key]: e.target.value })} />
                      </div>
                    ))}
                  </div>

                  <div className="form-group" style={{ marginTop: '1rem' }}>
                    <label>Street Address</label>
                    <input className="input-field" placeholder="House no., street, area"
                      value={shipping.address}
                      onChange={e => setShipping({ ...shipping, address: e.target.value })} />
                  </div>

                  <div className="grid-3" style={{ marginTop: '0' }}>
                    {[
                      { key: 'city',        label: 'City',        placeholder: 'Karachi' },
                      { key: 'province',    label: 'Province',    placeholder: 'Sindh' },
                      { key: 'postal_code', label: 'Postal Code', placeholder: '74200' },
                    ].map(f => (
                      <div key={f.key} className="form-group" style={{ marginBottom: 0 }}>
                        <label>{f.label}</label>
                        <input className="input-field" placeholder={f.placeholder}
                          value={shipping[f.key]}
                          onChange={e => setShipping({ ...shipping, [f.key]: e.target.value })} />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 1 — Delivery Method */}
              {step === 1 && (
                <motion.div key="delivery"
                  initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }} className="card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
                    <div style={{ background: 'var(--primary-light)', color: 'var(--success)', padding: '0.5rem', borderRadius: 8 }}>
                      <Truck size={18} />
                    </div>
                    <h2 style={{ fontWeight: 700 }}>Delivery Method</h2>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {deliveryOptions.map(opt => (
                      <motion.div key={opt.id}
                        whileHover={{ scale: 1.01 }}
                        onClick={() => setDelivery(opt.id)}
                        style={{
                          padding: '1.2rem 1.4rem',
                          borderRadius: 'var(--radius-sm)',
                          border: `2px solid ${delivery === opt.id ? 'var(--primary)' : 'var(--border)'}`,
                          background: delivery === opt.id ? 'var(--primary-light)' : 'white',
                          cursor: 'pointer', display: 'flex',
                          alignItems: 'center', justifyContent: 'space-between',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span style={{ fontSize: '1.8rem' }}>{opt.icon}</span>
                          <div>
                            <p style={{ fontWeight: 600 }}>{opt.label}</p>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{opt.desc}</p>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          {subtotal >= 2000
                            ? <span style={{ color: 'var(--success)', fontWeight: 700 }}>Free</span>
                            : <span style={{ fontWeight: 700, color: 'var(--primary)' }}>Rs. {opt.price}</span>
                          }
                          {delivery === opt.id && (
                            <div style={{ marginTop: '0.2rem' }}>
                              <CheckCircle size={16} color="var(--primary)" />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {subtotal >= 2000 && (
                    <div style={{
                      marginTop: '1rem', padding: '0.8rem 1rem',
                      background: 'var(--primary-light)', borderRadius: 8,
                      display: 'flex', alignItems: 'center', gap: '0.5rem'
                    }}>
                      <span>🎉</span>
                      <p style={{ fontSize: '0.88rem', color: 'var(--primary-dark)', fontWeight: 500 }}>
                        You qualify for free shipping!
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Step 2 — Payment */}
              {step === 2 && (
                <motion.div key="payment"
                  initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }} className="card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
                    <div style={{ background: '#FEF3C7', color: '#F59E0B', padding: '0.5rem', borderRadius: 8 }}>
                      <CreditCard size={18} />
                    </div>
                    <h2 style={{ fontWeight: 700 }}>Payment Method</h2>
                  </div>

                  {/* Method selector */}
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                    {paymentMethods.map(m => (
                      <motion.div key={m.id} whileHover={{ scale: 1.02 }}
                        onClick={() => setPayment(m.id)}
                        style={{
                          flex: 1, padding: '1rem',
                          borderRadius: 'var(--radius-sm)',
                          border: `2px solid ${payment === m.id ? 'var(--primary)' : 'var(--border)'}`,
                          background: payment === m.id ? 'var(--primary-light)' : 'white',
                          cursor: 'pointer', textAlign: 'center',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ fontSize: '1.6rem', marginBottom: '0.3rem' }}>{m.icon}</div>
                        <p style={{ fontWeight: 600, fontSize: '0.88rem' }}>{m.label}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Card details */}
                  {payment === 'card' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <div style={{
                        background: 'linear-gradient(135deg, var(--primary), var(--primary))',
                        borderRadius: 12, padding: '1.4rem',
                        marginBottom: '1.5rem', color: 'white'
                      }}>
                        <p style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.8rem' }}>
                          TEST MODE — use any numbers
                        </p>
                        <p style={{ fontSize: '1.1rem', letterSpacing: '0.15em', fontWeight: 500, marginBottom: '1rem' }}>
                          {cardInfo.number || '•••• •••• •••• ••••'}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <div>
                            <p style={{ fontSize: '0.68rem', opacity: 0.7 }}>CARD HOLDER</p>
                            <p style={{ fontWeight: 600, fontSize: '0.88rem' }}>{cardInfo.name || 'Your Name'}</p>
                          </div>
                          <div>
                            <p style={{ fontSize: '0.68rem', opacity: 0.7 }}>EXPIRES</p>
                            <p style={{ fontWeight: 600, fontSize: '0.88rem' }}>{cardInfo.expiry || 'MM/YY'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Cardholder Name</label>
                        <input className="input-field" placeholder="Name on card"
                          value={cardInfo.name}
                          onChange={e => setCardInfo({ ...cardInfo, name: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>Card Number</label>
                        <input className="input-field" placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          value={cardInfo.number}
                          onChange={e => {
                            const v = e.target.value.replace(/\D/g, '').slice(0, 16)
                            const formatted = v.match(/.{1,4}/g)?.join(' ') || v
                            setCardInfo({ ...cardInfo, number: formatted })
                          }} />
                      </div>
                      <div className="grid-2">
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label>Expiry Date</label>
                          <input className="input-field" placeholder="MM/YY"
                            maxLength={5}
                            value={cardInfo.expiry}
                            onChange={e => {
                              let v = e.target.value.replace(/\D/g, '').slice(0, 4)
                              if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2)
                              setCardInfo({ ...cardInfo, expiry: v })
                            }} />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label>CVV</label>
                          <input className="input-field" placeholder="123"
                            maxLength={3} type="password"
                            value={cardInfo.cvv}
                            onChange={e => setCardInfo({ ...cardInfo, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) })} />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {payment === 'wallet' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      style={{ textAlign: 'center', padding: '2rem', background: 'var(--bg)', borderRadius: 8 }}>
                      <p style={{ fontSize: '3rem', marginBottom: '0.8rem' }}>📱</p>
                      <p style={{ fontWeight: 600, marginBottom: '0.3rem' }}>Pay via Digital Wallet</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                        Your wallet balance will be used for this transaction (demo mode)
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Step 3 — Review */}
              {step === 3 && (
                <motion.div key="review"
                  initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }} className="card">
                  <h2 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Review Your Order</h2>

                  {/* Items */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <p style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Items ({cartItems.length})
                    </p>
                    {cartItems.map((item, i) => (
                      <div key={i} style={{
                        display: 'flex', gap: '0.8rem', alignItems: 'center',
                        padding: '0.8rem 0',
                        borderBottom: i < cartItems.length - 1 ? '1px solid var(--border)' : 'none'
                      }}>
                        <img
                          src={item.images?.[0] ? `http://localhost:5000${item.images[0]}` : 'https://via.placeholder.com/52?text=No'}
                          alt={item.name}
                          style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)', flexShrink: 0 }}
                        />
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.name}</p>
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            Qty: {item.quantity} × Rs. {item.discount_price || item.price}
                          </p>
                        </div>
                        <p style={{ fontWeight: 700, color: 'var(--primary)' }}>
                          Rs. {((item.discount_price || item.price) * item.quantity).toFixed(0)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Shipping info */}
                  <div style={{ padding: '1rem', background: 'var(--bg)', borderRadius: 8, marginBottom: '1rem' }}>
                    <p style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '0.4rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Delivering to</p>
                    <p style={{ fontWeight: 500 }}>{shipping.full_name} · {shipping.phone}</p>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                      {shipping.address}, {shipping.city}, {shipping.province}
                    </p>
                  </div>

                  {/* Delivery & payment */}
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1, padding: '0.8rem', background: 'var(--bg)', borderRadius: 8 }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Delivery</p>
                      <p style={{ fontWeight: 600, fontSize: '0.88rem', textTransform: 'capitalize' }}>{delivery}</p>
                    </div>
                    <div style={{ flex: 1, padding: '0.8rem', background: 'var(--bg)', borderRadius: 8 }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Payment</p>
                      <p style={{ fontWeight: 600, fontSize: '0.88rem', textTransform: 'capitalize' }}>{payment}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.2rem' }}>
              <button
                onClick={() => setStep(s => Math.max(s - 1, 0))}
                className="btn btn-secondary"
                style={{ visibility: step === 0 ? 'hidden' : 'visible' }}
              >
                ← Previous
              </button>

              {step < 3
                ? <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={nextStep} className="btn btn-primary"
                    style={{ padding: '0.75rem 2rem' }}>
                    Next Step <ChevronRight size={16} />
                  </motion.button>
                : <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={placeOrder} disabled={placing}
                    className="btn btn-primary"
                    style={{ padding: '0.75rem 2rem', background: placing ? 'var(--text-muted)' : 'var(--success)' }}>
                    {placing ? 'Placing Order...' : '✓ Place Order'}
                  </motion.button>
              }
            </div>
          </div>

          {/* ── Right — Order Summary ── */}
          <div className="card" style={{ position: 'sticky', top: '5rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1.2rem' }}>Order Summary</h3>

            {/* Mini cart */}
            <div style={{ marginBottom: '1rem', maxHeight: 200, overflowY: 'auto' }}>
              {cartItems.map((item, i) => (
                <div key={i} style={{
                  display: 'flex', gap: '0.6rem', alignItems: 'center',
                  padding: '0.5rem 0',
                  borderBottom: i < cartItems.length - 1 ? '1px solid var(--border)' : 'none'
                }}>
                  <img
                    src={item.images?.[0] ? `http://localhost:5000${item.images[0]}` : 'https://via.placeholder.com/40?text=No'}
                    alt={item.name}
                    style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 500, fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.name}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>×{item.quantity}</p>
                  </div>
                  <p style={{ fontWeight: 600, fontSize: '0.85rem', flexShrink: 0 }}>
                    Rs. {((item.discount_price || item.price) * item.quantity).toFixed(0)}
                  </p>
                </div>
              ))}
            </div>

            {/* Coupon */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.2rem' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Tag size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="input-field" placeholder="Coupon code"
                  value={coupon} onChange={e => setCoupon(e.target.value)}
                  style={{ paddingLeft: '2rem', fontSize: '0.85rem' }} />
              </div>
              <button onClick={applyCoupon} className="btn btn-secondary"
                style={{ padding: '0 0.8rem', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                Apply
              </button>
            </div>

            {/* Price breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.2rem' }}>
              {[
                { label: 'Subtotal', value: `Rs. ${subtotal.toFixed(0)}` },
                {
                  label: 'Delivery',
                  value: deliveryFee === 0 ? '🎉 Free' : `Rs. ${deliveryFee}`,
                  green: deliveryFee === 0
                },
                discount > 0 && { label: 'Discount', value: `−Rs. ${discount}`, green: true },
              ].filter(Boolean).map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{row.label}</span>
                  <span style={{ color: row.green ? 'var(--success)' : 'inherit', fontWeight: row.green ? 600 : 400 }}>
                    {row.value}
                  </span>
                </div>
              ))}

              <div style={{
                borderTop: '1.5px solid var(--border)', paddingTop: '0.75rem',
                display: 'flex', justifyContent: 'space-between',
                fontWeight: 800, fontSize: '1.08rem'
              }}>
                <span>Total</span>
                <span style={{ color: 'var(--primary)' }}>Rs. {total.toFixed(0)}</span>
              </div>
            </div>

            {/* Security note */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.7rem', background: 'var(--primary-light)', borderRadius: 8
            }}>
              <span>🔒</span>
              <p style={{ fontSize: '0.78rem', color: 'var(--primary-dark)' }}>
                Secure checkout — your data is encrypted
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}