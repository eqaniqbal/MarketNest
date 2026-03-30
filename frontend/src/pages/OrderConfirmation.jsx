import { useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Package, Truck, Home, ShoppingBag } from 'lucide-react'
import Navbar from '../components/Navbar'

export default function OrderConfirmation() {
  const location = useLocation()
  const navigate  = useNavigate()
  const { order, items, total, delivery } = location.state || {}

  // Redirect if landed here without order data
  useEffect(() => {
    if (!order) navigate('/')
  }, [order])

  if (!order) return null

  const estimatedDays  = delivery === 'express' ? '1-2' : '3-5'
  const estimatedDate  = new Date()
  estimatedDate.setDate(estimatedDate.getDate() + (delivery === 'express' ? 2 : 5))
  const dateString     = estimatedDate.toLocaleDateString('en-PK', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  const steps = [
    { icon: <CheckCircle size={20} />, label: 'Order Placed',    done: true },
    { icon: <Package size={20} />,     label: 'Being Packed',    done: false },
    { icon: <Truck size={20} />,       label: 'Out for Delivery', done: false },
    { icon: <Home size={20} />,        label: 'Delivered',        done: false },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '2rem' }}>

        {/* Success Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 18, stiffness: 200 }}
          style={{ textAlign: 'center', marginBottom: '2rem' }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', damping: 14 }}
            style={{
              width: 88, height: 88, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--success), var(--primary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.2rem',
              boxShadow: '0 8px 32px rgba(16,185,129,0.35)'
            }}
          >
            <CheckCircle size={44} color="white" strokeWidth={2.5} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--success)' }}>
              Order Placed! 🎉
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
              Thank you for shopping with MarketNest!
            </p>
          </motion.div>
        </motion.div>

        {/* Order ID Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="card"
          style={{ textAlign: 'center', marginBottom: '1.5rem', background: 'linear-gradient(135deg, var(--primary-light), white)' }}
        >
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Your Order ID
          </p>
          <p style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '0.05em' }}>
            #{order.id}
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
            Save this number for tracking your order
          </p>
        </motion.div>

        {/* Estimated Delivery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="card"
          style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--primary)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.75rem', borderRadius: 10 }}>
              <Truck size={22} />
            </div>
            <div>
              <p style={{ fontWeight: 700, marginBottom: '0.2rem' }}>Estimated Delivery</p>
              <p style={{ color: 'var(--primary)', fontWeight: 600 }}>{dateString}</p>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {estimatedDays} business days · {delivery === 'express' ? 'Express' : 'Standard'} delivery
              </p>
            </div>
          </div>
        </motion.div>

        {/* Order Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card"
          style={{ marginBottom: '1.5rem' }}
        >
          <h3 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Order Status</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            {steps.map((s, i) => (
              <div key={i} style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '0.5rem',
                flex: 1, position: 'relative'
              }}>
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div style={{
                    position: 'absolute', top: 18, left: '50%', width: '100%',
                    height: 2,
                    background: s.done ? 'var(--success)' : 'var(--border)',
                    transition: 'background 0.3s'
                  }} />
                )}
                <div style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: s.done ? 'var(--success)' : 'var(--bg)',
                  color: s.done ? 'white' : 'var(--text-muted)',
                  border: s.done ? 'none' : '2px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  zIndex: 1, transition: 'all 0.3s'
                }}>
                  {s.icon}
                </div>
                <p style={{
                  fontSize: '0.72rem', textAlign: 'center', fontWeight: 500,
                  color: s.done ? 'var(--success)' : 'var(--text-muted)'
                }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Items Summary */}
        {items && items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="card"
            style={{ marginBottom: '1.5rem' }}
          >
            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Items Ordered</h3>
            {items.map((item, i) => (
              <div key={i} style={{
                display: 'flex', gap: '0.8rem', alignItems: 'center',
                padding: '0.75rem 0',
                borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none'
              }}>
                <img
                  src={item.images?.[0] ? `http://localhost:5000${item.images[0]}` : 'https://via.placeholder.com/50?text=No'}
                  alt={item.name}
                  style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }}
                />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.name}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Qty: {item.quantity}</p>
                </div>
                <p style={{ fontWeight: 700, color: 'var(--primary)' }}>
                  Rs. {((item.discount_price || item.price) * item.quantity).toFixed(0)}
                </p>
              </div>
            ))}

            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontWeight: 800, fontSize: '1rem',
              paddingTop: '0.8rem', marginTop: '0.3rem',
              borderTop: '2px solid var(--border)'
            }}>
              <span>Total Paid</span>
              <span style={{ color: 'var(--primary)' }}>Rs. {total?.toFixed(0)}</span>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}
        >
          <Link to="/buyer/dashboard" className="btn btn-primary"
            style={{ flex: 1, justifyContent: 'center', padding: '0.9rem' }}>
            <Package size={17} /> Track My Orders
          </Link>
          <Link to="/products" className="btn btn-secondary"
            style={{ flex: 1, justifyContent: 'center', padding: '0.9rem' }}>
            <ShoppingBag size={17} /> Continue Shopping
          </Link>
        </motion.div>
      </div>
    </div>
  )
}