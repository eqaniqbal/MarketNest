import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Truck, ChevronDown, ChevronUp, MapPin, User } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import SellerSidebar from '../components/SellerSidebar'
import api from '../utils/api'

const STATUS_OPTIONS = ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled']

export default function OrderManagement() {
  const [orders, setOrders]           = useState([])
  const [loading, setLoading]         = useState(true)
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [trackingInputs, setTrackingInputs] = useState({})
  const [updating, setUpdating]       = useState({})

  useEffect(() => {
    api.get('/orders/seller')
      .then(res => { setOrders(res.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const updateStatus = async (orderId, status) => {
    const tracking_id = trackingInputs[orderId] || undefined
    setUpdating(prev => ({ ...prev, [orderId]: true }))
    try {
      const res = await api.patch(`/orders/${orderId}/status`, { status, tracking_id })
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: res.data.status, tracking_id: res.data.tracking_id } : o))
      toast.success('Order status updated!')
    } catch {
      toast.error('Failed to update status')
    }
    setUpdating(prev => ({ ...prev, [orderId]: false }))
  }

  // Group by order ID to avoid duplicate rows for same order
  const groupedOrders = orders.reduce((acc, o) => {
    if (!acc[o.id]) {
      acc[o.id] = { ...o, product_names: [o.product_name] }
    } else {
      acc[o.id].product_names.push(o.product_name)
    }
    return acc
  }, {})
  const uniqueOrders = Object.values(groupedOrders)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <SellerSidebar />
        <main style={{ flex: 1, padding: '2rem', maxWidth: 'calc(100% - 220px)' }}>

          <div style={{ marginBottom: '1.5rem' }}>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Order Management</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Manage and fulfil customer orders</p>
          </div>

          {/* Summary stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Total', value: uniqueOrders.length, color: 'var(--primary)', bg: 'var(--primary-light)' },
              { label: 'Pending', value: uniqueOrders.filter(o => o.status === 'pending').length, color: '#F59E0B', bg: '#fef3c7' },
              { label: 'Shipped', value: uniqueOrders.filter(o => o.status === 'shipped').length, color: 'var(--secondary)', bg: 'var(--primary-light)' },
              { label: 'Delivered', value: uniqueOrders.filter(o => o.status === 'delivered').length, color: 'var(--success)', bg: '#d1fae5' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="card" style={{ padding: '1rem' }}>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>{s.label}</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{loading ? '–' : s.value}</p>
              </motion.div>
            ))}
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading orders...</p>
          ) : uniqueOrders.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
              <Truck size={48} color="var(--border)" style={{ margin: '0 auto 1rem' }} />
              <p style={{ color: 'var(--text-muted)' }}>No orders yet. Share your store link to start getting orders!</p>
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {uniqueOrders.map((o, idx) => {
                const isExpanded = expandedOrder === o.id
                return (
                  <div key={o.id} style={{ borderBottom: idx < uniqueOrders.length - 1 ? '1px solid var(--border)' : 'none' }}>

                    {/* Order row */}
                    <div
                      onClick={() => setExpandedOrder(isExpanded ? null : o.id)}
                      style={{ padding: '1rem 1.3rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', background: isExpanded ? 'var(--bg)' : 'white', transition: 'background 0.15s', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flex: 1, flexWrap: 'wrap' }}>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>Order #{o.id}</p>
                          <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                            {new Date(o.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p style={{ fontSize: '0.88rem', fontWeight: 500 }}>{o.product_names.join(', ')}</p>
                          <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Qty: {o.quantity} · Rs. {o.unit_price * o.quantity}</p>
                        </div>
                        {o.buyer_name && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            <User size={13} /> {o.buyer_name}
                          </div>
                        )}
                        <span className={`badge badge-${o.status === 'delivered' ? 'success' : o.status === 'pending' ? 'warning' : o.status === 'cancelled' ? 'danger' : 'info'}`}>
                          {o.status}
                        </span>
                      </div>
                      <div style={{ color: 'var(--text-muted)' }}>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>

                    {/* Expanded */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          style={{ overflow: 'hidden' }}>
                          <div style={{ padding: '1rem 1.3rem 1.4rem', background: 'var(--bg)', borderTop: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

                            {/* Shipping info */}
                            <div>
                              <p style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <MapPin size={13} /> Shipping Info
                              </p>
                              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '0.5rem' }}>
                                {o.shipping_address}
                              </p>
                              {o.buyer_phone && (
                                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>📞 {o.buyer_phone}</p>
                              )}
                              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                                Delivery: <strong>{o.delivery_method}</strong>
                              </p>
                              {o.tracking_id && (
                                <p style={{ fontSize: '0.82rem', color: 'var(--primary)', marginTop: '0.3rem', fontWeight: 500 }}>
                                  Tracking: {o.tracking_id}
                                </p>
                              )}
                            </div>

                            {/* Status update */}
                            <div>
                              <p style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.6rem' }}>Update Order</p>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                                <div>
                                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Status</label>
                                  <select
                                    className="input-field"
                                    style={{ padding: '0.5rem 0.7rem', fontSize: '0.88rem' }}
                                    value={o.status}
                                    onChange={e => updateStatus(o.id, e.target.value)}
                                    disabled={updating[o.id]}>
                                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                  </select>
                                </div>
                                <div>
                                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Tracking ID (optional)</label>
                                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                      className="input-field"
                                      placeholder={o.tracking_id || 'e.g. TCS-123456'}
                                      value={trackingInputs[o.id] || ''}
                                      onChange={e => setTrackingInputs(prev => ({ ...prev, [o.id]: e.target.value }))}
                                      style={{ flex: 1, padding: '0.5rem 0.7rem', fontSize: '0.85rem' }}
                                    />
                                    <button
                                      onClick={() => updateStatus(o.id, o.status)}
                                      disabled={updating[o.id] || !trackingInputs[o.id]}
                                      className="btn btn-primary"
                                      style={{ padding: '0.5rem 0.8rem', fontSize: '0.82rem', opacity: !trackingInputs[o.id] ? 0.5 : 1 }}>
                                      Save
                                    </button>
                                  </div>
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
        </main>
      </div>
    </div>
  )
}
