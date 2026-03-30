import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, Heart, ChevronDown, ChevronUp, MapPin, Truck } from 'lucide-react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../utils/api'
import { getUser } from '../utils/auth'

const STATUS_STEPS = ['pending', 'confirmed', 'packed', 'shipped', 'delivered']
const STATUS_COLOR = {
  pending: 'warning', confirmed: 'info', packed: 'info',
  shipped: 'info', delivered: 'success', cancelled: 'danger'
}

export default function BuyerDashboard() {
  const user = getUser()
  const [orders, setOrders]         = useState([])
  const [loading, setLoading]       = useState(true)
  const [expandedOrder, setExpandedOrder] = useState(null)

  useEffect(() => {
    api.get('/orders/my')
      .then(res => { setOrders(res.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const statCards = [
    { label: 'Total Orders',  value: orders.length,                                          color: 'var(--primary)', bg: 'var(--primary-light)' },
    { label: 'Pending',       value: orders.filter(o => o.status === 'pending').length,       color: '#F59E0B', bg: '#FFFBEB' },
    { label: 'Shipped',       value: orders.filter(o => o.status === 'shipped').length,       color: 'var(--secondary)',        bg: 'var(--primary-light)' },
    { label: 'Delivered',     value: orders.filter(o => o.status === 'delivered').length,     color: 'var(--success)',        bg: '#d1fae5' },
  ]

  const getStepIndex = (status) => STATUS_STEPS.indexOf(status)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '2rem' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700 }}>My Account</h1>
          <p style={{ color: 'var(--text-muted)' }}>Welcome back, {user?.full_name}!</p>
        </div>

        {/* Stat cards */}
        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          {statCards.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="card" style={{ padding: '1.2rem' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>{s.label}</p>
              <p style={{ fontSize: '1.7rem', fontWeight: 800, color: s.color }}>{s.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick links */}
        <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <Link to="/wishlist" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem' }}>
            <Heart size={15} /> My Wishlist
          </Link>
          <Link to="/products" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem' }}>
            <Package size={15} /> Continue Shopping
          </Link>
        </div>

        {/* Orders */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontWeight: 700 }}>My Orders</h3>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading orders...</p>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
              <Package size={40} color="var(--border)" style={{ margin: '0 auto 1rem' }} />
              <p style={{ marginBottom: '1rem' }}>No orders yet. Start shopping!</p>
              <Link to="/products" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                Browse Products
              </Link>
            </div>
          ) : (
            <div>
              {orders.map((o, idx) => {
                const isExpanded = expandedOrder === o.id
                const stepIdx = getStepIndex(o.status)
                const isCancelled = o.status === 'cancelled'
                return (
                  <div key={o.id} style={{ borderBottom: idx < orders.length - 1 ? '1px solid var(--border)' : 'none' }}>

                    {/* Order row */}
                    <div
                      onClick={() => setExpandedOrder(isExpanded ? null : o.id)}
                      style={{ padding: '1.1rem 1.5rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', background: isExpanded ? 'var(--bg)' : 'white', transition: 'background 0.15s' }}>
                      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flex: 1, flexWrap: 'wrap' }}>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>#{o.id}</p>
                          <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                            {new Date(o.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        <div>
                          <p style={{ fontWeight: 700, color: 'var(--primary)' }}>Rs. {Number(o.total_amount).toFixed(0)}</p>
                          <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{o.delivery_method} delivery</p>
                        </div>
                        <span className={`badge badge-${STATUS_COLOR[o.status] || 'info'}`}>
                          {o.status}
                        </span>
                        {o.tracking_id && (
                          <p style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 500 }}>
                            🚚 {o.tracking_id}
                          </p>
                        )}
                      </div>
                      <div style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </div>

                    {/* Expanded detail */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          style={{ overflow: 'hidden' }}>
                          <div style={{ padding: '1rem 1.5rem 1.5rem', background: 'var(--bg)', borderTop: '1px solid var(--border)' }}>

                            {/* Progress bar */}
                            {!isCancelled && (
                              <div style={{ marginBottom: '1.5rem' }}>
                                <p style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.8rem' }}>Order Progress</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                                  {STATUS_STEPS.map((step, i) => (
                                    <div key={step} style={{ display: 'flex', alignItems: 'center', flex: i < STATUS_STEPS.length - 1 ? 1 : 0 }}>
                                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 60 }}>
                                        <div style={{
                                          width: 28, height: 28, borderRadius: '50%',
                                          background: i <= stepIdx ? 'var(--primary)' : 'var(--border)',
                                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                                          fontSize: '0.7rem', color: 'white', fontWeight: 700,
                                          transition: 'background 0.3s'
                                        }}>
                                          {i <= stepIdx ? '✓' : i + 1}
                                        </div>
                                        <p style={{ fontSize: '0.65rem', color: i <= stepIdx ? 'var(--primary)' : 'var(--text-muted)', marginTop: '0.3rem', textAlign: 'center', textTransform: 'capitalize', fontWeight: i === stepIdx ? 600 : 400 }}>
                                          {step}
                                        </p>
                                      </div>
                                      {i < STATUS_STEPS.length - 1 && (
                                        <div style={{ flex: 1, height: 2, background: i < stepIdx ? 'var(--primary)' : 'var(--border)', margin: '0 4px', marginBottom: 18 }} />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                              {/* Items */}
                              <div>
                                <p style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.6rem' }}>Items Ordered</p>
                                {(o.items || []).filter(Boolean).map((item, i) => (
                                  <div key={i} style={{ display: 'flex', gap: '0.7rem', marginBottom: '0.6rem', alignItems: 'center' }}>
                                    {item.product_images && (() => {
                                      try {
                                        const arr = typeof item.product_images === 'string' ? JSON.parse(item.product_images) : item.product_images
                                        return arr?.[0] ? (
                                          <img src={`http://localhost:5000${arr[0]}`} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
                                        ) : null
                                      } catch { return null }
                                    })()}
                                    <div>
                                      <p style={{ fontSize: '0.85rem', fontWeight: 500 }}>{item.product_name}</p>
                                      <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Qty: {item.quantity} × Rs. {item.unit_price}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Shipping */}
                              <div>
                                <p style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                  <MapPin size={13} /> Shipping Address
                                </p>
                                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{o.shipping_address}</p>
                                <div style={{ marginTop: '0.8rem' }}>
                                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                    <Truck size={12} style={{ marginRight: '0.3rem', verticalAlign: 'middle' }} />
                                    {o.delivery_method === 'express' ? 'Express Delivery (1-2 days)' : 'Standard Delivery (3-5 days)'}
                                  </p>
                                  {o.tracking_id && (
                                    <p style={{ fontSize: '0.82rem', color: 'var(--primary)', marginTop: '0.3rem', fontWeight: 500 }}>
                                      Tracking: {o.tracking_id}
                                    </p>
                                  )}
                                  {o.coupon_code && (
                                    <p style={{ fontSize: '0.82rem', color: 'var(--success)', marginTop: '0.3rem' }}>
                                      Coupon: {o.coupon_code} applied
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
