import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShoppingBag, Package, TrendingUp, AlertTriangle, MessageCircle } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Navbar from '../components/Navbar'
import SellerSidebar from '../components/SellerSidebar'
import ChatBox from '../components/ChatBox'
import api from '../utils/api'
import { getUser } from '../utils/auth'

export default function SellerDashboard() {
  const user = getUser()
  const [orders, setOrders]             = useState([])
  const [products, setProducts]         = useState([])
  const [conversations, setConversations] = useState([])
  const [analyticsData, setAnalyticsData] = useState([])  // real weekly data
  const [activeChat, setActiveChat]     = useState(null)
  const [showConversations, setShowConversations] = useState(false)
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/orders/seller'),
      api.get('/products/mine'),        // seller's own products (including unapproved)
      api.get('/chat/conversations'),
      api.get('/analytics/seller?range=7'), // real 7-day chart data
    ]).then(([ordersRes, productsRes, chatRes, analyticsRes]) => {
      setOrders(ordersRes.data)
      setProducts(productsRes.data)
      setConversations(chatRes.data)

      // Build 7-day chart from real analytics data
      const dailyMap = {}
      analyticsRes.data.daily?.forEach(d => { dailyMap[d.date?.slice(0, 10)] = d })
      const chartPoints = []
      for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const key = d.toISOString().slice(0, 10)
        const day = d.toLocaleDateString('en-PK', { weekday: 'short' })
        chartPoints.push({
          day,
          revenue: Number(dailyMap[key]?.revenue || 0),
          orders:  Number(dailyMap[key]?.orders  || 0),
        })
      }
      setAnalyticsData(chartPoints)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const totalRevenue  = orders.reduce((sum, o) => sum + Number(o.unit_price * o.quantity), 0)
  const pendingOrders = orders.filter(o => o.status === 'pending').length
  const lowStock      = products.filter(p => p.stock_quantity < 5)

  const stats = [
    { label: 'Total Revenue',   value: `Rs. ${totalRevenue.toFixed(0)}`, icon: <TrendingUp size={22} />, color: 'var(--primary)', bg: 'var(--primary-light)' },
    { label: 'Total Orders',    value: orders.length,                    icon: <ShoppingBag size={22} />, color: 'var(--success)', bg: '#d1fae5' },
    { label: 'Pending Orders',  value: pendingOrders,                    icon: <Package size={22} />,    color: '#F59E0B', bg: '#fef3c7' },
    { label: 'Low Stock Items', value: lowStock.length,                  icon: <AlertTriangle size={22} />, color: '#EF4444', bg: '#fee2e2' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <SellerSidebar />
        <main style={{ flex: 1, padding: '2rem', maxWidth: 'calc(100% - 220px)' }}>

          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 700 }}>Welcome back, {user?.full_name?.split(' ')[0]}! 👋</h1>
            <p style={{ color: 'var(--text-muted)' }}>Here's what's happening with your store today</p>
          </div>

          {/* Stats */}
          <div className="grid-4" style={{ marginBottom: '2rem' }}>
            {stats.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="card" style={{ padding: '1.4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>{s.label}</p>
                    <p style={{ fontSize: '1.7rem', fontWeight: 800, color: s.color }}>{s.value}</p>
                  </div>
                  <div style={{ background: s.bg, color: s.color, padding: '0.65rem', borderRadius: 10 }}>{s.icon}</div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid-2" style={{ marginBottom: '2rem' }}>
            {/* Real Weekly Revenue Chart */}
            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: '0.3rem' }}>Weekly Revenue</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1.1rem' }}>Last 7 days — live data</p>
              {loading ? (
                <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>Loading...</div>
              ) : analyticsData.every(d => d.revenue === 0) ? (
                <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>No sales data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v) => [`Rs. ${v}`, 'Revenue']} />
                    <Line type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 4, fill: 'var(--primary)' }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Recent Orders */}
            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: '1.2rem' }}>Recent Orders</h3>
              {orders.length === 0
                ? <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No orders yet</p>
                : orders.slice(0, 5).map((o, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.7rem 0', borderBottom: i < Math.min(orders.length, 5) - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div>
                      <p style={{ fontWeight: 500, fontSize: '0.9rem' }}>{o.product_name}</p>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Qty: {o.quantity}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '0.9rem' }}>Rs. {o.unit_price * o.quantity}</p>
                      <span className={`badge badge-${o.status === 'delivered' ? 'success' : o.status === 'pending' ? 'warning' : 'info'}`} style={{ fontSize: '0.72rem' }}>
                        {o.status}
                      </span>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>

          {/* Low Stock Alert */}
          {lowStock.length > 0 && (
            <div className="card" style={{ borderLeft: '4px solid var(--danger)', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <AlertTriangle size={18} color="var(--danger)" />
                <h3 style={{ fontWeight: 700, color: 'var(--danger)' }}>Low Stock Alert</h3>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {lowStock.map(p => (
                  <span key={p.id} className="badge badge-danger">{p.name} — {p.stock_quantity} left</span>
                ))}
              </div>
            </div>
          )}

          {/* Buyer Messages Panel */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontWeight: 700 }}>Buyer Messages</h3>
              <button className="btn btn-secondary" style={{ fontSize: '0.85rem', padding: '0.4rem 0.9rem' }}
                onClick={() => setShowConversations(!showConversations)}>
                <MessageCircle size={15} /> {showConversations ? 'Hide' : 'Show'} ({conversations.length})
              </button>
            </div>

            {showConversations && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {conversations.length === 0
                  ? <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem' }}>No conversations yet</p>
                  : conversations.map((c, i) => (
                    <div key={i} onClick={() => setActiveChat(c)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem', borderRadius: 8, cursor: 'pointer', background: activeChat?.id === c.id ? 'var(--primary-light)' : 'var(--bg)', transition: 'background 0.15s' }}>
                      <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 }}>
                        {c.other_name?.[0]?.toUpperCase()}
                      </div>
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{c.other_name}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.content}</p>
                      </div>
                      {!c.is_seen && c.receiver_id === user?.id && (
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }} />
                      )}
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        </main>
      </div>

      {activeChat && (
        <ChatBox
          receiverId={activeChat.sender_id === user?.id ? activeChat.receiver_id : activeChat.sender_id}
          receiverName={activeChat.other_name}
          onClose={() => setActiveChat(null)}
        />
      )}
    </div>
  )
}
