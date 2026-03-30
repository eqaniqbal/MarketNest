import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, ShoppingBag, TrendingUp, Package, Check, X, ShieldOff, Eye } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import api from '../utils/api'

const STATUS_COLORS = {
  pending: 'warning', confirmed: 'info', packed: 'info',
  shipped: 'info', delivered: 'success', cancelled: 'danger'
}

export default function AdminDashboard() {
  const [stats, setStats]                 = useState({})
  const [chartData, setChartData]         = useState([])
  const [users, setUsers]                 = useState([])
  const [pendingProducts, setPendingProducts] = useState([])
  const [orders, setOrders]               = useState([])
  const [tab, setTab]                     = useState('overview')
  const [loading, setLoading]             = useState(true)
  const [expandedOrder, setExpandedOrder] = useState(null)

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/users'),
      api.get('/admin/products/pending'),
      api.get('/admin/orders'),
    ]).then(([s, u, p, o]) => {
      setStats(s.data)
      setChartData(s.data.monthly_orders || [])
      setUsers(u.data)
      setPendingProducts(p.data)
      setOrders(o.data)
      setLoading(false)
    }).catch(err => {
      console.error(err)
      toast.error('Failed to load dashboard data')
      setLoading(false)
    })
  }, [])

  const toggleUser = async (id) => {
    try {
      const res = await api.patch(`/admin/users/${id}/toggle`)
      setUsers(users.map(u => u.id === id ? { ...u, is_active: res.data.is_active } : u))
      toast.success(`User ${res.data.is_active ? 'activated' : 'suspended'}`)
    } catch { toast.error('Failed to update user') }
  }

  const approveProduct = async (id, approved) => {
    try {
      await api.patch(`/admin/products/${id}/approve`, { approved })
      setPendingProducts(pendingProducts.filter(p => p.id !== id))
      toast.success(approved ? 'Product approved!' : 'Product rejected')
    } catch { toast.error('Failed to update product') }
  }

  const updateOrderStatus = async (id, status) => {
    try {
      const res = await api.patch(`/admin/orders/${id}/status`, { status })
      setOrders(orders.map(o => o.id === id ? { ...o, status: res.data.status } : o))
      toast.success('Order status updated')
    } catch { toast.error('Failed to update order') }
  }

  const adminStats = [
    { label: 'Total Buyers',  value: stats.total_buyers  || 0, icon: <Users size={22} />,    color: 'var(--primary)', bg: 'var(--primary-light)' },
    { label: 'Total Sellers', value: stats.total_sellers || 0, icon: <Package size={22} />,  color: 'var(--secondary)', bg: '#FFEDD5' },
    { label: 'Total Orders',  value: stats.total_orders  || 0, icon: <ShoppingBag size={22} />, color: 'var(--success)', bg: 'var(--primary-light)' },
    { label: 'Total Revenue', value: `Rs. ${Number(stats.total_revenue || 0).toFixed(0)}`, icon: <TrendingUp size={22} />, color: '#EF4444', bg: '#FEE2E2' },
  ]

  const tabs = ['overview', 'orders', 'users', 'products']

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <p>Loading dashboard...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700 }}>Admin Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>Platform overview and management</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', background: 'white', padding: '0.4rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', width: 'fit-content' }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)} className="btn"
              style={{ padding: '0.5rem 1.2rem', fontSize: '0.88rem', background: tab === t ? 'var(--primary)' : 'transparent', color: tab === t ? 'white' : 'var(--text-muted)', border: 'none', textTransform: 'capitalize' }}>
              {t}
              {t === 'orders' && orders.length > 0 && (
                <span style={{ marginLeft: '0.4rem', background: tab === t ? 'rgba(255,255,255,0.3)' : 'var(--primary)', color: 'white', borderRadius: 99, padding: '0.1rem 0.5rem', fontSize: '0.75rem' }}>
                  {orders.length}
                </span>
              )}
              {t === 'products' && pendingProducts.length > 0 && (
                <span style={{ marginLeft: '0.4rem', background: '#EF4444', color: 'white', borderRadius: 99, padding: '0.1rem 0.5rem', fontSize: '0.75rem' }}>
                  {pendingProducts.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Overview Tab ── */}
        {tab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid-4" style={{ marginBottom: '2rem' }}>
              {adminStats.map((s, i) => (
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

            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: '1.2rem' }}>Monthly Orders (Last 6 Months)</h3>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v, n) => [n === 'orders' ? v : `Rs. ${v}`, n]} />
                    <Bar dataKey="orders" fill="var(--primary)" radius={[6,6,0,0]} name="Orders" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No orders yet.</p>
              )}
            </div>
          </motion.div>
        )}

        {/* ── Orders Tab ── */}
        {tab === 'orders' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>All Platform Orders ({orders.length})</h3>
            {orders.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <ShoppingBag size={40} color="var(--border)" style={{ margin: '0 auto 1rem' }} />
                <p>No orders placed yet.</p>
              </div>
            ) : (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Buyer</th>
                        <th>Total</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Update Status</th>
                        <th>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(o => (
                        <>
                          <tr key={o.id}>
                            <td style={{ fontWeight: 600 }}>#{o.id}</td>
                            <td>
                              <p style={{ fontWeight: 500, fontSize: '0.9rem' }}>{o.buyer_name}</p>
                              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{o.buyer_email}</p>
                            </td>
                            <td style={{ fontWeight: 600 }}>Rs. {Number(o.total_amount).toFixed(0)}</td>
                            <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                              {new Date(o.created_at).toLocaleDateString()}
                            </td>
                            <td>
                              <span className={`badge badge-${STATUS_COLORS[o.status] || 'info'}`}>
                                {o.status}
                              </span>
                            </td>
                            <td>
                              <select className="input-field"
                                style={{ padding: '0.35rem 0.6rem', fontSize: '0.82rem', width: 'auto' }}
                                value={o.status}
                                onChange={e => updateOrderStatus(o.id, e.target.value)}>
                                {['pending','confirmed','packed','shipped','delivered','cancelled'].map(s => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <button
                                onClick={() => setExpandedOrder(expandedOrder === o.id ? null : o.id)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem' }}>
                                <Eye size={14} /> {expandedOrder === o.id ? 'Hide' : 'View'}
                              </button>
                            </td>
                          </tr>
                          {expandedOrder === o.id && (
                            <tr key={`${o.id}-detail`}>
                              <td colSpan={7} style={{ background: 'var(--bg)', padding: '1rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                  <div>
                                    <p style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.88rem' }}>Shipping Address</p>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{o.shipping_address}</p>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                                      Delivery: {o.delivery_method} | Payment: {o.payment_method}
                                    </p>
                                    {o.tracking_id && (
                                      <p style={{ fontSize: '0.85rem', color: 'var(--primary)', marginTop: '0.3rem' }}>
                                        Tracking: {o.tracking_id}
                                      </p>
                                    )}
                                  </div>
                                  <div>
                                    <p style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.88rem' }}>Items</p>
                                    {(o.items || []).map((item, i) => (
                                      <div key={i} style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                                        {item.product_name} × {item.quantity} @ Rs. {item.unit_price}
                                        {item.seller_name && <span style={{ color: 'var(--primary)', marginLeft: '0.4rem' }}>({item.seller_name})</span>}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ── Users Tab ── */}
        {tab === 'users' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Status</th><th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 500 }}>{u.full_name}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{u.email}</td>
                      <td>
                        <span className={`badge badge-${u.role === 'seller' ? 'warning' : u.role === 'admin' ? 'danger' : 'info'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <span className={`badge badge-${u.is_active ? 'success' : 'danger'}`}>
                          {u.is_active ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td>
                        {u.role !== 'admin' && (
                          <button onClick={() => toggleUser(u.id)}
                            className={`btn ${u.is_active ? 'btn-danger' : 'btn-success'}`}
                            style={{ padding: '0.35rem 0.8rem', fontSize: '0.8rem' }}>
                            <ShieldOff size={13} /> {u.is_active ? 'Suspend' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* ── Products Tab ── */}
        {tab === 'products' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>
              Pending Approvals
              <span style={{ marginLeft: '0.5rem', background: 'var(--danger)', color: 'white', borderRadius: 99, padding: '0.15rem 0.6rem', fontSize: '0.78rem' }}>
                {pendingProducts.length}
              </span>
            </h3>
            {pendingProducts.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <Check size={40} color="var(--success)" style={{ margin: '0 auto 1rem' }} />
                <p>All products have been reviewed!</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr><th>Product</th><th>Seller</th><th>Category</th><th>Price</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {pendingProducts.map(p => (
                      <tr key={p.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                            <img
                              src={(() => { try { const arr = typeof p.images === 'string' ? JSON.parse(p.images) : p.images; return arr?.[0] ? `http://localhost:5000${arr[0]}` : 'https://via.placeholder.com/44?text=No' } catch { return 'https://via.placeholder.com/44?text=No' } })()}
                              alt="" style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--border)' }} />
                            <div>
                              <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.name}</p>
                              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {p.description}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td style={{ fontSize: '0.88rem' }}>{p.store_name || p.seller_name}</td>
                        <td><span className="badge badge-purple">{p.category}</span></td>
                        <td style={{ fontWeight: 600 }}>Rs. {p.discount_price || p.price}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => approveProduct(p.id, true)} className="btn btn-success" style={{ padding: '0.35rem 0.8rem', fontSize: '0.8rem' }}>
                              <Check size={13} /> Approve
                            </button>
                            <button onClick={() => approveProduct(p.id, false)} className="btn btn-danger" style={{ padding: '0.35rem 0.8rem', fontSize: '0.8rem' }}>
                              <X size={13} /> Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
